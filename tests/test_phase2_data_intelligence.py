import pytest
from datetime import date
from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.models import (
    Merchant, Store, Supplier, Product, DailySales,
    InventorySnapshot, Discount, BusinessEvent, Forecast
)
from forecasting.demand import DemandForecaster
from forecasting.stockout import estimate_unconstrained_demand
from forecasting.evaluation import evaluate_forecasts

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

# 1. Deterministic data generation
def test_deterministic_data_generation(db):
    store_count = db.query(Store).count()
    product_count = db.query(Product).count()
    sales_count = db.query(DailySales).count()
    
    assert store_count == 3
    assert product_count == 20
    assert sales_count == 21900 # 3 stores * 20 products * 365 days

# 2. No negative inventory
def test_no_negative_inventory(db):
    negative_inv = db.query(InventorySnapshot).filter(InventorySnapshot.closing_inventory < 0).count()
    assert negative_inv == 0

# 3. No invalid prices or negative costs
def test_no_invalid_prices(db):
    invalid_prices = db.query(Product).filter((Product.unit_cost <= 0) | (Product.selling_price <= 0)).count()
    assert invalid_prices == 0
    
    invalid_sales = db.query(DailySales).filter((DailySales.selling_price <= 0) | (DailySales.unit_cost <= 0)).count()
    assert invalid_sales == 0

# 4. Holiday effects exist
def test_holiday_effects_exist(db):
    event_count = db.query(BusinessEvent).filter(BusinessEvent.event_type.in_(["holiday", "festival"])).count()
    assert event_count > 0

# 5. Weekend effects exist
def test_weekend_effects_exist(db):
    # Residential store should have higher weekend sales than weekday sales for grocery items
    res_store = db.query(Store).filter(Store.location_type == "RESIDENTIAL").first()
    rice = db.query(Product).filter(Product.name.like("%Rice%")).first()
    
    sales = db.query(DailySales).filter(DailySales.store_id == res_store.id, DailySales.product_id == rice.id).all()
    
    weekend_qty = [s.quantity_sold for s in sales if s.date.weekday() >= 5]
    weekday_qty = [s.quantity_sold for s in sales if s.date.weekday() < 5]
    
    avg_weekend = sum(weekend_qty) / len(weekend_qty)
    avg_weekday = sum(weekday_qty) / len(weekday_qty)
    
    assert avg_weekend > avg_weekday

# 6. IT-store weekday/weekend difference exists
def test_it_store_weekday_weekend_difference(db):
    it_store = db.query(Store).filter(Store.location_type == "IT_PARK").first()
    milk = db.query(Product).filter(Product.name.like("%Milk%")).first()
    
    sales = db.query(DailySales).filter(DailySales.store_id == it_store.id, DailySales.product_id == milk.id).all()
    
    weekday_qty = [s.quantity_sold for s in sales if s.date.weekday() < 5]
    sunday_qty = [s.quantity_sold for s in sales if s.date.weekday() == 6]
    
    avg_weekday = sum(weekday_qty) / len(weekday_qty)
    avg_sunday = sum(sunday_qty) / len(sunday_qty)
    
    # Sunday demand should be substantially lower than weekday demand
    assert avg_sunday < (avg_weekday * 0.70)

# 7. Stockout records are generated
def test_stockout_records_generated(db):
    stockout_count = db.query(InventorySnapshot).filter(InventorySnapshot.stockout_flag == True).count()
    assert stockout_count > 0

# 8. Stockout-constrained demand is detected
def test_stockout_constrained_demand_detected(db):
    stockout_record = db.query(InventorySnapshot).filter(InventorySnapshot.stockout_flag == True).first()
    assert stockout_record is not None
    
    result = estimate_unconstrained_demand(db, stockout_record.store_id, stockout_record.product_id, stockout_record.date)
    assert result["stockout_constrained"] == True

# 9. Estimated demand can exceed observed sales when stockout occurs
def test_estimated_demand_exceeds_observed_sales_on_stockout(db):
    stockout_record = db.query(InventorySnapshot).filter(InventorySnapshot.stockout_flag == True).first()
    result = estimate_unconstrained_demand(db, stockout_record.store_id, stockout_record.product_id, stockout_record.date)
    
    assert result["estimated_demand"] >= result["observed_sales"]

# 10. Expiry scenarios exist (Perishables with short shelf-life)
def test_expiry_scenarios_exist(db):
    fresh_juice = db.query(Product).filter(Product.name.like("%Fresh Juice%")).first()
    assert fresh_juice is not None
    assert fresh_juice.shelf_life_days <= 3

# 11. Overstock scenarios exist
def test_overstock_scenarios_exist(db):
    high_inv = db.query(InventorySnapshot).filter(InventorySnapshot.closing_inventory > 500).count()
    assert high_inv > 0

# 12. Discount scenarios exist
def test_discount_scenarios_exist(db):
    discount_count = db.query(Discount).count()
    assert discount_count > 0

# 13. Forecast output schema is correct
def test_forecast_output_schema(db):
    forecaster = DemandForecaster(db)
    res = forecaster.predict_demand(store_id=1, product_id=1, target_date=date(2025, 6, 15))
    
    required_keys = ["store_id", "product_id", "forecast_date", "expected_demand", "lower_bound", "upper_bound", "confidence", "stockout_adjusted", "drivers", "explanation"]
    for key in required_keys:
        assert key in res
        
    assert res["lower_bound"] <= res["expected_demand"] <= res["upper_bound"]
    assert 0.0 <= res["confidence"] <= 1.0

# 14. Forecast evaluation works
def test_forecast_evaluation(db):
    forecaster = DemandForecaster(db)
    # Generate 5 sample forecasts
    for day in range(1, 6):
        fc = forecaster.predict_demand(store_id=1, product_id=1, target_date=date(2025, 5, day))
        forecaster.save_forecast(fc)
        
    eval_res = evaluate_forecasts(db, store_id=1)
    assert eval_res["total_evaluations"] >= 5
    assert "mae" in eval_res
    assert "rmse" in eval_res

# 15. Data relationships are valid
def test_data_relationships_valid(db):
    store = db.query(Store).first()
    assert store.merchant is not None
    assert len(store.daily_sales) > 0
    assert len(store.inventory_snapshots) > 0
