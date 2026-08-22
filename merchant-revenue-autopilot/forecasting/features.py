from datetime import date, timedelta
import pandas as pd
import numpy as np
from sqlalchemy import func
from app.models.models import DailySales, InventorySnapshot, BusinessEvent, Product, Store

def extract_product_features(db, store_id: int, product_id: int, target_date: date, lookback_days: int = 30):
    """
    Extracts historical and contextual feature matrix for demand forecasting.
    """
    start_date = target_date - timedelta(days=lookback_days)
    
    # Query historical sales and inventory data
    sales_records = db.query(DailySales.date, DailySales.quantity_sold, DailySales.selling_price, DailySales.discount)\
        .filter(
            DailySales.store_id == store_id,
            DailySales.product_id == product_id,
            DailySales.date >= start_date,
            DailySales.date < target_date
        ).order_by(DailySales.date.asc()).all()

    inv_records = db.query(InventorySnapshot.date, InventorySnapshot.closing_inventory, InventorySnapshot.stockout_flag)\
        .filter(
            InventorySnapshot.store_id == store_id,
            InventorySnapshot.product_id == product_id,
            InventorySnapshot.date >= start_date,
            InventorySnapshot.date < target_date
        ).order_by(InventorySnapshot.date.asc()).all()

    if not sales_records:
        return None

    df_sales = pd.DataFrame(sales_records, columns=["date", "quantity_sold", "selling_price", "discount"])
    df_inv = pd.DataFrame(inv_records, columns=["date", "closing_inventory", "stockout_flag"])
    
    df = pd.merge(df_sales, df_inv, on="date", how="left")
    df["date"] = pd.to_datetime(df["date"])
    df["day_of_week"] = df["date"].dt.weekday

    # Exclude stockout days from true baseline calculation
    unconstrained_history = df[df["stockout_flag"] == False]["quantity_sold"]
    if len(unconstrained_history) == 0:
        unconstrained_history = df["quantity_sold"]

    # Target date context
    target_weekday = target_date.weekday()
    target_is_weekend = target_weekday >= 5
    target_month = target_date.month

    # Business event check on target_date
    event = db.query(BusinessEvent).filter(
        BusinessEvent.store_id == store_id,
        BusinessEvent.date == target_date
    ).first()

    event_type = event.event_type if event else "none"
    event_severity = event.severity if event else 0

    # Store context
    store = db.query(Store).filter(Store.id == store_id).first()
    store_type = store.location_type if store else "RESIDENTIAL"

    # Product details
    product = db.query(Product).filter(Product.id == product_id).first()
    category = product.category if product else "General"
    base_price = product.selling_price if product else 100.0

    return {
        "store_id": store_id,
        "product_id": product_id,
        "target_date": target_date,
        "target_weekday": target_weekday,
        "target_is_weekend": target_is_weekend,
        "target_month": target_month,
        "store_type": store_type,
        "category": category,
        "base_price": base_price,
        "mean_recent_sales": float(df["quantity_sold"].mean()),
        "mean_unconstrained_sales": float(unconstrained_history.mean()),
        "same_weekday_avg": float(df[df["day_of_week"] == target_weekday]["quantity_sold"].mean()) if len(df[df["day_of_week"] == target_weekday]) > 0 else float(unconstrained_history.mean()),
        "recent_7d_avg": float(df.tail(7)["quantity_sold"].mean()),
        "stockout_rate_30d": float(df["stockout_flag"].mean()),
        "event_type": event_type,
        "event_severity": event_severity,
    }
