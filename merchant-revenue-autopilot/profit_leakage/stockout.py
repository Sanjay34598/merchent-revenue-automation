from datetime import date, timedelta
from app.models.models import DailySales, InventorySnapshot, Store, Product
from forecasting.stockout import estimate_unconstrained_demand

def detect_stockout_leakage(db, store_id: int = None, lookback_days: int = 30):
    """
    Detects uncaptured demand and calculates estimated lost-sales opportunity due to stockouts.
    """
    end_date = date(2025, 12, 31)
    start_date = end_date - timedelta(days=lookback_days)

    query = db.query(InventorySnapshot).filter(
        InventorySnapshot.stockout_flag == True,
        InventorySnapshot.date >= start_date,
        InventorySnapshot.date <= end_date
    )

    if store_id:
        query = query.filter(InventorySnapshot.store_id == store_id)

    stockouts = query.all()
    leaks = []

    # Group by (store_id, product_id) to aggregate recent impact
    product_stockouts = {}
    for inv in stockouts:
        key = (inv.store_id, inv.product_id)
        if key not in product_stockouts:
            product_stockouts[key] = []
        product_stockouts[key].append(inv)

    for (s_id, p_id), inv_list in product_stockouts.items():
        store = db.query(Store).filter(Store.id == s_id).first()
        product = db.query(Product).filter(Product.id == p_id).first()

        total_missed_units = 0
        total_estimated_opportunity = 0.0
        total_observed_sales = 0
        confidences = []

        for inv in inv_list:
            stockout_eval = estimate_unconstrained_demand(db, s_id, p_id, inv.date)
            sales = stockout_eval["observed_sales"]
            est_demand = stockout_eval["estimated_demand"]
            missed = max(0, est_demand - sales)

            unit_margin = max(1.0, product.selling_price - product.unit_cost)
            opp = missed * unit_margin

            total_observed_sales += sales
            total_missed_units += missed
            total_estimated_opportunity += opp
            confidences.append(stockout_eval["confidence"])

        if total_missed_units > 0:
            avg_confidence = round(sum(confidences) / len(confidences), 2)
            leaks.append({
                "category": "STOCKOUT",
                "store_id": s_id,
                "product_id": p_id,
                "store": store.name if store else f"Store {s_id}",
                "product": product.name if product else f"Product {p_id}",
                "observed_sales": int(total_observed_sales),
                "estimated_demand": int(total_observed_sales + total_missed_units),
                "estimated_missed_units": int(total_missed_units),
                "estimated_opportunity": round(total_estimated_opportunity, 2),
                "confidence": avg_confidence,
                "evidence": [
                    f"Inventory ran out on {len(inv_list)} days in the last {lookback_days} days.",
                    f"Estimated uncaptured demand of ~{int(total_missed_units)} units.",
                    f"Unit margin of INR {product.selling_price - product.unit_cost:.2f} results in estimated opportunity of INR {total_estimated_opportunity:,.2f}."
                ],
                "explanation": f"Stockout leakage detected for {product.name} at {store.name}. Merchant missed an estimated {int(total_missed_units)} units of demand.",
                "recommended_action": f"Increase safety stock or reorder trigger for {product.name} by {int(total_missed_units / len(inv_list) * 1.5)} units before peak demand days."
            })

    return leaks
