from datetime import date, timedelta
import numpy as np
import pandas as pd
from app.models.models import DailySales, InventorySnapshot, Forecast, Store, Product

def evaluate_forecasts(db, store_id: int = None, lookback_days: int = 30):
    """
    Evaluates historical predictions vs actual observed sales and unconstrained demand.
    Computes MAE, RMSE, and MAPE while distinguishing sales error from stockout demand uncertainty.
    """
    query = db.query(
        Forecast.store_id,
        Forecast.product_id,
        Forecast.forecast_date,
        Forecast.expected_demand.label("predicted"),
        DailySales.quantity_sold.label("actual_sales"),
        InventorySnapshot.stockout_flag
    ).join(
        DailySales,
        (Forecast.store_id == DailySales.store_id) & 
        (Forecast.product_id == DailySales.product_id) & 
        (Forecast.forecast_date == DailySales.date)
    ).join(
        InventorySnapshot,
        (Forecast.store_id == InventorySnapshot.store_id) & 
        (Forecast.product_id == InventorySnapshot.product_id) & 
        (Forecast.forecast_date == InventorySnapshot.date)
    )

    if store_id:
        query = query.filter(Forecast.store_id == store_id)

    records = query.all()

    if not records:
        return {
            "total_evaluations": 0,
            "mae": 0.0,
            "rmse": 0.0,
            "mape_percent": 0.0,
            "stockout_days_evaluated": 0,
            "unconstrained_days_evaluated": 0
        }

    df = pd.DataFrame(records, columns=["store_id", "product_id", "date", "predicted", "actual_sales", "stockout_flag"])

    # Unconstrained days evaluation (True demand error)
    df_unconstrained = df[df["stockout_flag"] == False].copy()
    
    if len(df_unconstrained) > 0:
        errors = df_unconstrained["predicted"] - df_unconstrained["actual_sales"]
        mae = float(np.mean(np.abs(errors)))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        mape = float(np.mean(np.abs(errors / np.maximum(1, df_unconstrained["actual_sales"]))) * 100)
    else:
        mae, rmse, mape = 0.0, 0.0, 0.0

    return {
        "total_evaluations": len(df),
        "unconstrained_days_evaluated": len(df_unconstrained),
        "stockout_days_evaluated": int(df["stockout_flag"].sum()),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape_percent": round(mape, 2),
        "explanation": f"Evaluated {len(df)} forecast records across unconstrained and stockout-censored days."
    }
