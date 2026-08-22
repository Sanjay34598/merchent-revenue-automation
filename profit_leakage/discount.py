from datetime import date, timedelta
from app.models.models import DailySales, Discount, Store, Product

def detect_discount_leakage(db, store_id: int = None):
    """
    Analyzes historical promotional discounts and categorizes them into:
    - LOW_EFFICIENCY_DISCOUNT (Margin erosion without volume gain)
    - USEFUL_CLEARANCE_DISCOUNT (Expiry waste reduction)
    """
    discounts = db.query(Discount).all()
    if store_id:
        discounts = [d for d in discounts if d.store_id == store_id]

    leaks = []

    for d in discounts:
        store = db.query(Store).filter(Store.id == d.store_id).first()
        product = db.query(Product).filter(Product.id == d.product_id).first()

        if not store or not product:
            continue

        # Query sales during discount period
        disc_sales = db.query(DailySales).filter(
            DailySales.store_id == d.store_id,
            DailySales.product_id == d.product_id,
            DailySales.date >= d.start_date,
            DailySales.date <= d.end_date
        ).all()

        if not disc_sales:
            continue

        actual_discount_units = sum(s.quantity_sold for s in disc_sales)
        actual_discount_profit = sum(s.gross_profit for s in disc_sales)

        # Query baseline sales before discount period
        base_start = d.start_date - timedelta(days=7)
        base_sales = db.query(DailySales).filter(
            DailySales.store_id == d.store_id,
            DailySales.product_id == d.product_id,
            DailySales.date >= base_start,
            DailySales.date < d.start_date
        ).all()

        baseline_units = sum(s.quantity_sold for s in base_sales) if base_sales else actual_discount_units
        baseline_unit_margin = product.selling_price - product.unit_cost
        counterfactual_profit = baseline_units * baseline_unit_margin

        volume_lift_pct = ((actual_discount_units - baseline_units) / max(1, baseline_units)) * 100
        profit_diff = actual_discount_profit - counterfactual_profit

        # Categorize Discount Performance
        if product.shelf_life_days <= 5:
            # Short shelf life -> Clearance discount
            if profit_diff < 0:
                # Controlled loss to prevent 100% expiry waste
                avoided_waste = actual_discount_units * product.unit_cost
                net_benefit = avoided_waste + profit_diff
                if net_benefit > 0:
                    continue # Useful clearance discount, no leak flagged
        else:
            # Durable / non-perishable -> Margin erosion check
            if volume_lift_pct < 15.0 and profit_diff < 0:
                estimated_opportunity = round(abs(profit_diff), 2)
                confidence = 0.85

                leaks.append({
                    "category": "DISCOUNT_INEFFICIENCY",
                    "store_id": d.store_id,
                    "product_id": d.product_id,
                    "store": store.name,
                    "product": product.name,
                    "discount_percent": d.discount_percent,
                    "volume_lift_pct": round(volume_lift_pct, 1),
                    "profit_impact": round(profit_diff, 2),
                    "estimated_opportunity": estimated_opportunity,
                    "confidence": confidence,
                    "evidence": [
                        f"{d.discount_percent:.0f}% discount resulted in weak volume lift of only {volume_lift_pct:.1f}%.",
                        f"Gross profit dropped by INR {abs(profit_diff):,.2f} compared to regular pricing.",
                        f"Margin erosion exceeded volume gain."
                    ],
                    "explanation": f"Low-efficiency discount detected for {product.name} at {store.name}. Promotion eroded gross profit.",
                    "recommended_action": f"Discontinue or restructure the {d.discount_percent:.0f}% promotional discount on {product.name}."
                })

    return leaks
