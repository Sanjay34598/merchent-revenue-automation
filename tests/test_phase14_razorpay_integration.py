import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.services.razorpay_service import RazorpayIntegrationService, razorpay_service
from agent.executor import ActionExecutor

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_paise_conversion_and_receipt():
    """Verify INR to paise conversion and receipt generation."""
    assert RazorpayIntegrationService.to_paise(100.0) == 10000
    assert RazorpayIntegrationService.to_paise(15.50) == 1550
    assert RazorpayIntegrationService.to_paise(2499.99) == 249999
    
    rcpt = RazorpayIntegrationService.generate_receipt("test_order")
    assert rcpt.startswith("test_order_")
    assert len(rcpt) > 12

def test_invalid_amount_rejection():
    """Verify negative or zero amounts raise ValueError in service and HTTP 400 in API."""
    with pytest.raises(ValueError):
        RazorpayIntegrationService.to_paise(0.0)

    with pytest.raises(ValueError):
        RazorpayIntegrationService.to_paise(-50.0)

    res = client.post("/api/payments/razorpay/order", json={"amount_in_rupees": -100.0, "action_type": "REORDER"})
    assert res.status_code == 400
    assert "Amount must be greater than zero" in res.json()["detail"]

def test_missing_credentials_fallback():
    """Verify missing credentials return RAZORPAY_TEST_MODE status with complete order payload."""
    svc = RazorpayIntegrationService(key_id=None, key_secret=None)
    assert not svc.has_credentials

    res = svc.create_order(
        amount_in_rupees=1948.0,
        action_type="DISCOUNT",
        product_id=5,
        store_id=1
    )

    assert res["success"] is True
    assert res["status"] == "RAZORPAY_TEST_MODE"
    assert res["amount_paise"] == 194800
    assert res["currency"] == "INR"
    assert "razorpay_order_payload" in res
    
    payload = res["razorpay_order_payload"]
    assert payload["amount"] == 194800
    assert payload["currency"] == "INR"
    assert payload["notes"]["platform"] == "MerchIntell"
    assert payload["notes"]["action_type"] == "DISCOUNT"

def test_secret_key_privacy():
    """Verify secret keys are never exposed in API responses or payloads."""
    svc = RazorpayIntegrationService(key_id="rzp_test_REAL123", key_secret="SECRET999_NEVER_SHOW")
    res = svc.create_order(amount_in_rupees=500.0, action_type="REORDER")

    # Stringify response and payload
    res_str = str(res)
    assert "SECRET999_NEVER_SHOW" not in res_str
    assert "SECRET999_NEVER_SHOW" not in str(res.get("razorpay_order_payload", {}))

def test_payments_api_endpoint():
    """Verify POST /api/payments/razorpay/order endpoint returns valid status & payload."""
    payload = {
        "amount_in_rupees": 1427.50,
        "action_type": "MARKDOWN",
        "product_id": 9,
        "store_id": 1,
        "notes_extra": {"campaign": "Clearance Sale"}
    }
    res = client.post("/api/payments/razorpay/order", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    assert data["status"] in ["RAZORPAY_TEST_MODE", "RAZORPAY_ORDER_CREATED"]
    assert data["amount_paise"] == 142750
    assert data["razorpay_order_payload"]["notes"]["campaign"] == "Clearance Sale"

def test_mocked_razorpay_client_response():
    """Verify successful Razorpay order response when test credentials are configured."""
    svc = RazorpayIntegrationService(key_id="rzp_test_VALIDKEY", key_secret="VALIDSECRET")
    assert svc.has_credentials

    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {
        "id": "order_RzpReal12345",
        "entity": "order",
        "amount": 250000,
        "amount_paid": 0,
        "amount_due": 250000,
        "currency": "INR",
        "receipt": "rcpt_reorder_1",
        "status": "created"
    }

    with patch("requests.post", return_value=mock_resp):
        res = svc.create_order(amount_in_rupees=2500.0, action_type="REORDER")
        assert res["success"] is True
        assert res["status"] == "RAZORPAY_ORDER_CREATED"
        assert res["razorpay_order_id"] == "order_RzpReal12345"

def test_action_execution_integration_with_razorpay(db):
    """Verify existing action approval & execution flow attaches Razorpay transaction metadata."""
    from app.models.models import AgentAction
    action = AgentAction(
        store_id=1,
        action_type="REORDER",
        recommendation="Order 150 units of Plushfoot Boot.",
        agent_reasoning="High demand velocity forecast.",
        evidence={"product_id": 1},
        confidence=0.88,
        status="APPROVED",
        expected_outcome={"expected_gross_profit": 2000.0, "cash_locked": 3000.0}
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    executor = ActionExecutor(db)
    res = executor.execute_action(action.id)

    assert res["success"] is True
    assert res["status"] == "EXECUTED"
    assert "razorpay_status" in res
    assert "razorpay_order_payload" in res
    assert res["razorpay_order_payload"]["amount"] == 300000
    assert res["razorpay_order_payload"]["notes"]["platform"] == "MerchIntell"
