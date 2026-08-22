from datetime import date, timedelta
import pandas as pd
import numpy as np
from forecasting.features import extract_product_features
from forecasting.stockout import estimate_unconstrained_demand
from app.models.models import DailySales, Forecast, Product, Store, BusinessEvent

class DemandForecaster:
    def __init__(self, db):
        self.db = db

    def predict_demand(self, store_id: int, product_id: int, target_date: date) -> dict:
        """
        Generates a baseline demand forecast using historical features, location context, 
        and stockout adjustments.
        """
        features = extract_product_features(self.db, store_id, product_id, target_date)
        
        if not features:
            # Fallback default if no history exists
            product = self.db.query(Product).filter(Product.id == product_id).first()
            base_dem = getattr(product, "base_demand", 50) if product else 50
            return {
                "store_id": store_id,
                "product_id": product_id,
                "forecast_date": target_date.isoformat(),
                "expected_demand": float(base_dem),
                "lower_bound": float(round(base_dem * 0.85, 1)),
                "upper_bound": float(round(base_dem * 1.15, 1)),
                "confidence": 0.60,
                "stockout_adjusted": False,
                "drivers": ["category base demand"],
                "explanation": "Initial estimate based on product default parameter due to sparse history."
            }

        store_type = features["store_type"]
        weekday = features["target_weekday"]
        same_weekday_avg = features["same_weekday_avg"]
        recent_7d_avg = features["recent_7d_avg"]
        unconstrained_avg = features["mean_unconstrained_sales"]
        event_type = features["event_type"]

        drivers = []
        multiplier = 1.0

        # Location & Day-of-week context adjustment
        if store_type == "IT_PARK":
            if weekday < 5:
                drivers.append("High IT-park weekday footfall pattern")
            elif weekday == 6:
                drivers.append("Low IT-park Sunday demand (-55% adjustment)")
                multiplier *= 0.60
            else:
                drivers.append("Lower IT-park Saturday demand")
                multiplier *= 0.75
        elif store_type == "RESIDENTIAL":
            if weekday >= 5:
                drivers.append("High residential weekend grocery demand (+30%)")
                multiplier *= 1.25

        # Business event adjustment
        if event_type in ["holiday", "festival"]:
            if store_type == "IT_PARK":
                drivers.append(f"IT office closure due to {event_type}")
                multiplier *= 0.50
            else:
                drivers.append(f"Festive demand boost (+40%)")
                multiplier *= 1.40
        elif event_type == "heatwave":
            if features["category"] in ["Beverages", "Perishables"]:
                drivers.append("Heatwave demand spike (+60%)")
                multiplier *= 1.60

        # Baseline expected demand formula
        base_forecast = (0.6 * same_weekday_avg) + (0.4 * unconstrained_avg)
        expected_demand = base_forecast * multiplier

        # Stockout adjustment check
        stockout_rate = features["stockout_rate_30d"]
        stockout_adjusted = False
        if stockout_rate > 0.15:
            expected_demand *= 1.12
            stockout_adjusted = True
            drivers.append(f"Stockout risk compensation (+12% for {stockout_rate*100:.0f}% 30d stockouts)")

        expected_demand = round(max(5.0, float(expected_demand)), 1)
        lower_bound = round(expected_demand * 0.88, 1)
        upper_bound = round(expected_demand * 1.12, 1)

        confidence = round(max(0.70, min(0.92, 0.85 - (stockout_rate * 0.2))), 2)

        explanation = (
            f"Forecast for store {store_id} ({store_type}) on {target_date.strftime('%Y-%m-%d')}: "
            f"Expected {expected_demand} units based on {', '.join(drivers)}."
        )

        return {
            "store_id": store_id,
            "product_id": product_id,
            "forecast_date": target_date.isoformat(),
            "expected_demand": expected_demand,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "confidence": confidence,
            "stockout_adjusted": stockout_adjusted,
            "drivers": drivers,
            "explanation": explanation
        }

    def save_forecast(self, forecast_dict: dict) -> Forecast:
        """
        Persists a forecast dictionary into the Forecast DB model.
        """
        forecast_obj = Forecast(
            store_id=forecast_dict["store_id"],
            product_id=forecast_dict["product_id"],
            forecast_date=date.fromisoformat(forecast_dict["forecast_date"]),
            expected_demand=forecast_dict["expected_demand"],
            lower_bound=forecast_dict["lower_bound"],
            upper_bound=forecast_dict["upper_bound"],
            confidence=forecast_dict["confidence"],
            explanation=forecast_dict["explanation"],
            is_stockout_adjusted=forecast_dict["stockout_adjusted"]
        )
        self.db.add(forecast_obj)
        self.db.commit()
        self.db.refresh(forecast_obj)
        return forecast_obj
