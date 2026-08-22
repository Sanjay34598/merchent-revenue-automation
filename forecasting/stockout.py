from datetime import date, timedelta
import pandas as pd
import numpy as np
from app.models.models import DailySales, InventorySnapshot, Store, Product

def estimate_unconstrained_demand(db, store_id: int, product_id: int, check_date: date):
    """
    Detects if observed sales were stockout-constrained and estimates true unconstrained demand.
    """
    sales_record = db.query(DailySales).filter(
        DailySales.store_id == store_id,
        DailySales.product_id == product_id,
        DailySales.date == check_date
    ).first()

    inv_record = db.query(InventorySnapshot).filter(
        InventorySnapshot.store_id == store_id,
        InventorySnapshot.product_id == product_id,
        InventorySnapshot.date == check_date
    ).first()

    if not sales_record or not inv_record:
        return {
            "observed_sales": 0,
            "estimated_demand": 0,
            "stockout_constrained": False,
            "confidence": 0.50,
            "evidence": "No record found for date."
        }

    observed_sales = sales_record.quantity_sold
    is_stockout = inv_record.stockout_flag or (inv_record.closing_inventory == 0)

    if not is_stockout:
        return {
            "observed_sales": observed_sales,
            "estimated_demand": float(observed_sales),
            "stockout_constrained": False,
            "confidence": 0.95,
            "evidence": f"Inventory remained above 0 (closing stock: {inv_record.closing_inventory}). Observed sales equals true demand."
        }

    # Stockout detected! Calculate unconstrained demand from historical unconstrained days.
    start_lookback = check_date - timedelta(days=60)
    history = db.query(DailySales.date, DailySales.quantity_sold, InventorySnapshot.stockout_flag)\
        .join(InventorySnapshot, (DailySales.store_id == InventorySnapshot.store_id) & 
                                  (DailySales.product_id == InventorySnapshot.product_id) & 
                                  (DailySales.date == InventorySnapshot.date))\
        .filter(
            DailySales.store_id == store_id,
            DailySales.product_id == product_id,
            DailySales.date >= start_lookback,
            DailySales.date < check_date
        ).all()

    if not history:
        estimated_demand = float(observed_sales * 1.35)
        return {
            "observed_sales": observed_sales,
            "estimated_demand": round(estimated_demand, 1),
            "stockout_constrained": True,
            "confidence": 0.70,
            "evidence": "Stockout detected, estimated via baseline multiplier due to sparse history."
        }

    df = pd.DataFrame(history, columns=["date", "quantity_sold", "stockout_flag"])
    df["date"] = pd.to_datetime(df["date"])
    df["weekday"] = df["date"].dt.weekday

    target_weekday = check_date.weekday()
    
    # Filter for unconstrained days on the same day of week
    same_weekday_unconstrained = df[(df["weekday"] == target_weekday) & (df["stockout_flag"] == False)]

    if len(same_weekday_unconstrained) >= 3:
        estimated_demand = same_weekday_unconstrained["quantity_sold"].mean()
    else:
        # Fallback to all unconstrained days
        all_unconstrained = df[df["stockout_flag"] == False]
        if len(all_unconstrained) > 0:
            estimated_demand = all_unconstrained["quantity_sold"].mean()
        else:
            estimated_demand = observed_sales * 1.30

    # Ensure estimated demand is strictly greater than or equal to observed sales
    estimated_demand = max(float(observed_sales * 1.15), float(estimated_demand))

    confidence = round(min(0.88, 0.70 + (len(same_weekday_unconstrained) * 0.04)), 2)

    return {
        "observed_sales": observed_sales,
        "estimated_demand": round(estimated_demand, 1),
        "stockout_constrained": True,
        "confidence": confidence,
        "evidence": f"Stockout flagged at {observed_sales} units. Historical unconstrained sales for weekday {target_weekday} average {estimated_demand:.1f} units."
    }
