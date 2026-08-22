from datetime import date, timedelta
from app.models.models import DailySales, InventorySnapshot, Store, Product
from forecasting.demand import DemandForecaster

def detect_expiry_leakage(db, store_id: int = None):
    """
    Detects perishable products approaching expiration where stock exceeds remaining shelf life demand.
    """
    latest_date = date(2025, 12, 31)
    
    # Query short shelf-life products (<= 10 days)
    perishable_products = db.query(Product).filter(Product.shelf_life_days <= 10).all()
    forecaster = DemandForecaster(db)
    leaks = []

    for product in perishable_products:
        query = db.query(InventorySnapshot).filter(
            InventorySnapshot.product_id == product.id,
            InventorySnapshot.date == latest_date
        )
        if store_id:
            query = query.filter(InventorySnapshot.store_id == store_id)

        snapshots = query.all()

        for inv in snapshots:
            store = db.query(Store).filter(Store.id == inv.store_id).first()
            if not store:
                continue

            closing_stock = inv.closing_inventory
            shelf_life = product.shelf_life_days

            # Calculate total expected demand over remaining shelf life
            expected_demand_before_expiry = 0.0
            for d in range(1, shelf_life + 1):
                target_dt = latest_date + timedelta(days=d)
                fc = forecaster.predict_demand(inv.store_id, product.id, target_dt)
                expected_demand_before_expiry += fc["expected_demand"]

            if closing_stock > expected_demand_before_expiry:
                potential_excess_waste_units = int(closing_stock - expected_demand_before_expiry)
                potential_waste_value = round(potential_excess_waste_units * product.unit_cost, 2)
                
                # Clearance discount (e.g. 20% off) can recover ~70% of cost
                recoverable_value = round(potential_waste_value * 0.70, 2)

                confidence = 0.88

                leaks.append({
                    "category": "EXPIRY",
                    "store_id": inv.store_id,
                    "product_id": product.id,
                    "store": store.name,
                    "product": product.name,
                    "current_inventory": closing_stock,
                    "remaining_shelf_life_days": shelf_life,
                    "expected_demand_before_expiry": round(expected_demand_before_expiry, 1),
                    "potential_excess_waste_units": potential_excess_waste_units,
                    "potential_waste_value": potential_waste_value,
                    "estimated_opportunity": recoverable_value,
                    "confidence": confidence,
                    "evidence": [
                        f"Current stock of {closing_stock} units exceeds remaining shelf life ({shelf_life} days) demand of {expected_demand_before_expiry:.1f} units.",
                        f"Potential waste value of INR {potential_waste_value:,.2f} if unsold.",
                        f"Estimated recoverable value of INR {recoverable_value:,.2f} via timely 15-20% clearance discount."
                    ],
                    "explanation": f"Expiry risk detected for {product.name} at {store.name}. Unsold inventory risks expiring within {shelf_life} days.",
                    "recommended_action": f"Apply a 15% clearance discount on {product.name} to accelerate velocity before expiration."
                })

    return leaks
