import pytest
from app.main import app
from app.services.recovery_engine import recovery_engine
from app.services.ai_decision_engine import ai_decision_engine
from app.services.evaluation_engine import evaluation_engine
from app.core.audit_repository import audit_repository
from fastapi.testclient import TestClient

client = TestClient(app)

def test_recovery_opportunities_generation():
    opportunities = recovery_engine.get_recovery_opportunities("STR-1001")
    assert isinstance(opportunities, list)
    assert len(opportunities) > 0
    opp = opportunities[0]
    assert "product_name" in opp
    assert "revenue_at_risk" in opp
    assert "recommended_intervention" in opp
    assert "confidence" in opp

def test_ai_decision_engine_fallback_and_guardrails():
    context = {
        "product": "Test Product",
        "store": "STR-1001",
        "inventory": 84,
        "sales_velocity": 1.0,
        "days_of_cover": 84,
        "revenue_at_risk": 6000,
        "risk_type": "SLOW_MOVING",
        "margin": 35.0
    }
    rec = ai_decision_engine.evaluate_opportunity(context)
    assert rec["action"] == "MARKDOWN"
    assert rec["discount_percent"] <= 30.0
    assert rec["requires_approval"] is True  # Revenue at risk > 5000 requires approval
    assert "constraints" in rec
    assert rec["source"] in ["AI_LLM", "DETERMINISTIC_FALLBACK", "SAFETY_GUARDRAIL"]

def test_bounded_recovery_action_execution():
    result = recovery_engine.execute_recovery_action(
        action_id=1,
        action_type="MARKDOWN",
        params={"discount_percent": 15.0}
    )
    assert result["status"] == "SUCCESS"
    assert result["actual_recovered_revenue"] > 0
    assert "audit_id" in result

def test_audit_log_creation_and_api():
    audit_entry = audit_repository.log_event(
        action="TEST_ACTION",
        entity="Test Entity",
        reason="Verification of audit logger",
        source="TEST",
        status="SUCCESS"
    )
    assert audit_entry["id"].startswith("AUD-")
    
    response = client.get("/api/audit/logs?limit=10")
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

def test_before_after_batch_evaluation_api():
    response = client.get("/api/recovery/evaluation?store_id=STR-1001&batch_size=150")
    assert response.status_code == 200
    data = response.json()
    assert data["batch_size"] == 150
    assert data["baseline_revenue"] == 10482110
    assert data["strategy_expected_revenue"] > data["baseline_revenue"]
    assert "action_distribution" in data
