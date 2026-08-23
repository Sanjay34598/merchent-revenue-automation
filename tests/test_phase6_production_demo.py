import pytest
from fastapi.testclient import TestClient
from app.core.database import SessionLocal
from app.main import app

client = TestClient(app)

# 1. Test Custom What-If Simulator Endpoint
def test_custom_whatif_simulator_endpoint():
    req = {
        "store_id": 1,
        "product_id": 1,
        "custom_order_quantity": 180,
        "custom_discount_percent": 10.0
    }
    response = client.post("/api/autopilot/simulate-custom", json=req)
    assert response.status_code == 200
    data = response.json()
    assert "status_quo_strategy" in data
    assert "custom_proposed_strategy" in data
    assert "scored_comparison" in data
    assert "recommendation" in data
    assert len(data["scored_comparison"]) == 2

# 2. Test MOCK Execution Mode Default
def test_mock_execution_mode_default():
    # Trigger analysis to create action
    an_res = client.post("/api/autopilot/analyze", json={"store_id": 1}).json()
    action_id = an_res["action_id"]

    # Approve action first
    app_res = client.post(f"/api/actions/{action_id}/approve", json={"merchant_notes": "Approved for mock execution"})
    assert app_res.status_code == 200

    # Execute action without passing execution_mode parameter (must default to MOCK)
    exec_res = client.post(f"/api/autopilot/execute/{action_id}")
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["success"] == True
    assert exec_data["execution_mode"] == "MOCK"

# 3. Test Opportunities filtering parameters
def test_opportunities_filtering():
    response = client.get("/api/autopilot/opportunities?store_id=1")
    assert response.status_code == 200
    opps = response.json()
    assert isinstance(opps, list)
