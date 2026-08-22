import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.core.database import SessionLocal
from app.main import app
from profit_leakage.detector import ProfitLeakageDetector
from profit_leakage.scoring import score_opportunity
from profit_leakage.stockout import detect_stockout_leakage
from profit_leakage.overstock import detect_overstock_leakage
from profit_leakage.expiry import detect_expiry_leakage
from profit_leakage.discount import detect_discount_leakage
from profit_leakage.supplier import detect_supplier_leakage
from simulator.engine import DecisionSimulatorEngine
from simulator.order import simulate_order_scenarios
from simulator.discount import simulate_discount_scenarios
from simulator.constraints import PolicyGuardrails

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

# 1. Stockout leakage calculation
def test_stockout_leakage_calculation(db):
    leaks = detect_stockout_leakage(db, store_id=1)
    assert isinstance(leaks, list)
    if len(leaks) > 0:
        leak = leaks[0]
        assert leak["category"] == "STOCKOUT"
        assert leak["estimated_missed_units"] > 0
        assert leak["estimated_opportunity"] > 0

# 2. Overstock detection
def test_overstock_detection(db):
    leaks = detect_overstock_leakage(db)
    assert isinstance(leaks, list)
    if len(leaks) > 0:
        leak = leaks[0]
        assert leak["category"] == "OVERSTOCK"
        assert leak["excess_units"] > 0
        assert leak["cash_tied_up"] > 0

# 3. Expiry risk detection
def test_expiry_risk_detection(db):
    leaks = detect_expiry_leakage(db)
    assert isinstance(leaks, list)
    for leak in leaks:
        assert leak["category"] == "EXPIRY"
        assert leak["potential_waste_value"] > 0
        assert leak["estimated_opportunity"] > 0

# 4 & 5. Discount efficiency & inefficiency detection
def test_discount_leakage_detection(db):
    leaks = detect_discount_leakage(db)
    assert isinstance(leaks, list)
    for leak in leaks:
        assert leak["category"] == "DISCOUNT_INEFFICIENCY"
        assert leak["profit_impact"] < 0

# 6. Supplier cost comparison
def test_supplier_cost_comparison(db):
    leaks = detect_supplier_leakage(db)
    assert isinstance(leaks, list)

# 7. Opportunity scoring
def test_opportunity_scoring():
    sample_leak = {
        "category": "STOCKOUT",
        "estimated_opportunity": 2000.0,
        "confidence": 0.85
    }
    scored = score_opportunity(sample_leak)
    assert "priority_score" in scored
    assert "priority" in scored
    assert scored["priority"] in ["HIGH", "MEDIUM", "LOW"]

# 8 & 9. Order simulation & Stockout probability calculation
def test_order_simulation(db):
    engine = DecisionSimulatorEngine(db)
    res = engine.run_order_simulation(store_id=1, product_id=1, order_quantities=[50, 100, 150, 200, 250])
    
    assert "recommended_order_quantity" in res
    assert "scenarios" in res
    assert len(res["scenarios"]) == 5
    
    # Higher order quantity should decrease stockout probability
    sc_low = res["scenarios"][0] # 50
    sc_high = res["scenarios"][-1] # 250
    assert sc_low["stockout_probability"] >= sc_high["stockout_probability"]

# 10. Waste probability calculation for perishables
def test_waste_probability_calculation():
    scenarios = simulate_order_scenarios(
        current_stock=100,
        unit_cost=35.0,
        selling_price=60.0,
        shelf_life_days=2, # Short shelf life
        expected_demand_mean=50.0,
        forecast_std=10.0,
        order_quantities=[200],
        num_simulations=500,
        seed=42
    )
    sc = scenarios[0]
    assert sc["expiry_risk_probability"] > 0
    assert sc["expected_waste_cost"] > 0

# 11. Discount simulation
def test_discount_simulation(db):
    engine = DecisionSimulatorEngine(db)
    res = engine.run_discount_simulation(store_id=1, product_id=1, discount_percentages=[0.0, 10.0, 20.0])
    
    assert "recommended_discount_percent" in res
    assert "scenarios" in res
    assert len(res["scenarios"]) == 3

# 12. Constraint rejection
def test_constraint_rejection():
    guardrails = PolicyGuardrails(max_order_quantity=100, max_cash_exposure=5000.0)
    
    # Violation case: order quantity exceeds limit
    res_violation = guardrails.validate_order(order_qty=200, cash_locked=8000.0, stockout_prob=0.1, confidence=0.85)
    assert res_violation["allowed"] == False
    assert len(res_violation["violations"]) > 0

    # Passing case
    res_valid = guardrails.validate_order(order_qty=50, cash_locked=1500.0, stockout_prob=0.1, confidence=0.85)
    assert res_valid["allowed"] == True

# 13. Recommended decision selection
def test_recommended_decision_selection(db):
    engine = DecisionSimulatorEngine(db)
    res = engine.run_order_simulation(store_id=1, product_id=1)
    rec_qty = res["recommended_order_quantity"]
    assert rec_qty in [50, 100, 150, 200, 250]
    assert "explanation" in res

# 14. Monte Carlo reproducibility with fixed seed
def test_monte_carlo_reproducibility():
    run1 = simulate_order_scenarios(10, 20.0, 30.0, 10, 100.0, 15.0, [100], num_simulations=1000, seed=42)
    run2 = simulate_order_scenarios(10, 20.0, 30.0, 10, 100.0, 15.0, [100], num_simulations=1000, seed=42)
    
    assert run1[0]["expected_sales"] == run2[0]["expected_sales"]
    assert run1[0]["expected_gross_profit"] == run2[0]["expected_gross_profit"]

# 15. REST API endpoint integration tests
def test_opportunities_api_endpoints():
    response = client.get("/api/opportunities")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    summary_resp = client.get("/api/opportunities/summary")
    assert summary_resp.status_code == 200
    data = summary_resp.json()
    assert "total_estimated_opportunity" in data
    assert "confidence_adjusted_opportunity" in data

def test_simulations_api_endpoints():
    order_req = {
        "store_id": 1,
        "product_id": 1,
        "order_quantities": [50, 100, 150]
    }
    response = client.post("/api/simulations/order", json=order_req)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_order_quantity" in data
    assert "explanation" in data

    disc_req = {
        "store_id": 1,
        "product_id": 1,
        "discount_percentages": [0.0, 10.0]
    }
    disc_response = client.post("/api/simulations/discount", json=disc_req)
    assert disc_response.status_code == 200
    assert "recommended_discount_percent" in disc_response.json()
