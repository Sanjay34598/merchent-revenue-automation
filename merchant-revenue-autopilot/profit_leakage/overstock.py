from datetime import date, timedelta
from app.models.models import DailySales, InventorySnapshot, Store, Product
from forecasting.demand import DemandForecaster

def detect_overstock_leakage(db, store_id: int = None, lookback_days: int = 14):
    """
    Detects inventory substantially exceeding expected demand over lead time & shelf life horizons.
    """
    latest_date = date(2025, 12, 31)
    
    query = db.query(InventorySnapshot).filter(InventorySnapshot.date == latest_date)
    if store_id:
        query = query.filter(InventorySnapshot.store_id == store_id)

    snapshots = query.all()
    forecaster = DemandForecaster(db)
    leaks = []

    for inv in snapshots:
        product = db.query(Product).filter(Product.id == inv.product_id).first()
        store = db.query(Store).filter(Store.id == inv.store_id).first()

        if not product or not store:
            continue

        current_inventory = inv.closing_inventory
        
        # Calculate expected demand over the next 14 days
        total_expected_demand = 0.0
        for d in range(1, 15):
            target_dt = latest_date + timedelta(days=d)
            fc = forecaster.predict_demand(inv.store_id, inv.product_id, target_dt)
            total_expected_demand += fc["expected_demand"]

        # Safety stock buffer based on shelf life and lead time
        shelf_life = product.shelf_life_days
        safety_buffer = 1.30 if shelf_life > 30 else 1.15
        acceptable_max_inventory = total_expected_demand * safety_buffer

        if current_inventory > acceptable_max_inventory and current_inventory > 50:
            excess_units = int(current_inventory - total_expected_demand)
            cash_tied_up = round(excess_units * product.unit_cost, 2)
            
            # Risk factor higher for shorter shelf life
            holding_cost_rate = 0.05 if shelf_life > 60 else 0.15
            estimated_opportunity = round(cash_tied_up * holding_cost_rate, 2)

            confidence = round(min(0.90, 0.75 + (excess_units / (total_expected_demand + 1)) * 0.1), 2)

            leaks.append({
                "category": "OVERSTOCK",
                "store_id": inv.store_id,
                "product_id": inv.product_id,
                "store": store.name,
                "product": product.name,
                "current_inventory": current_inventory,
                "expected_demand_14d": round(total_expected_demand, 1),
                "excess_units": excess_units,
                "cash_tied_up": cash_tied_up,
                "estimated_opportunity": estimated_opportunity,
                "confidence": confidence,
                "evidence": [
                    f"Current stock level of {current_inventory} units exceeds 14-day expected demand ({total_expected_demand:.1f} units).",
                    f"INR {cash_tied_up:,.2f} of working capital locked in excess inventory.",
                    f"Holding risk rate of {holding_cost_rate*100:.0f}% for shelf life of {shelf_life} days."
                ],
                "explanation": f"Overstock leakage detected for {product.name} at {store.name}. Inventory substantially exceeds 14-day demand.",
                "recommended_action": f"Pause reordering for {product.name} until stock drops below {int(total_expected_demand * 0.5)} units."
            })

    return leaks
