import pytest
from fastapi.testclient import TestClient
from app.core.database import SessionLocal
from app.main import app
from agent.engine import RevenueAgentEngine
from agent.tools import AgentToolRegistry
from app.models.models import AgentAction, ActionApproval

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

# 1. Test Agent tool registry functionality
def test_agent_tool_registry(db):
    tools = AgentToolRegistry(db)
    state = tools.get_store_state(1)
    assert "store_id" in state
    assert state["store_id"] == 1
    
    leaks = tools.detect_profit_leaks(1)
    assert isinstance(leaks, list)

# 2. Test AI Agent investigation loop
def test_agent_investigation_loop(db):
    engine = RevenueAgentEngine(db)
    res = engine.investigate_store(store_id=1)
    
    assert "recommendation" in res
    assert "why_selected" in res
    assert res["status"] == "PENDING"
    assert res["requires_approval"] == True
    assert "simulation_comparison" in res
    assert len(res["simulation_comparison"]) > 0

# 3. Test Agent Chat endpoint
def test_agent_chat_endpoint():
    req = {
        "message": "Where am I silently losing money?",
        "store_id": 1
    }
    response = client.post("/api/agent/chat", json=req)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "total_opportunity" in data
    assert data["requires_approval"] == True

# 4. Test Actions Approval API workflow
def test_actions_approval_workflow(db):
    # Trigger an investigation to create a PENDING action
    engine = RevenueAgentEngine(db)
    inv_res = engine.investigate_store(store_id=1)
    action_id = inv_res["action_id"]

    # Verify action exists and is PENDING
    actions_resp = client.get("/api/actions?store_id=1")
    assert actions_resp.status_code == 200
    actions_list = actions_resp.json()
    target_action = next((a for a in actions_list if a["id"] == action_id), None)
    assert target_action is not None
    assert target_action["status"] == "PENDING"

    # Approve action
    approve_resp = client.post(f"/api/actions/{action_id}/approve", json={"merchant_notes": "Approved for stock replenishment"})
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"

    # Check updated action state
    updated_actions = client.get("/api/actions?store_id=1").json()
    approved_action = next((a for a in updated_actions if a["id"] == action_id), None)
    assert approved_action["status"] == "APPROVED"
    assert approved_action["approval"]["approved"] == True
    assert approved_action["approval"]["merchant_notes"] == "Approved for stock replenishment"

# 5. Test Action Rejection workflow
def test_action_rejection_workflow(db):
    engine = RevenueAgentEngine(db)
    inv_res = engine.investigate_store(store_id=1)
    action_id = inv_res["action_id"]

    reject_resp = client.post(f"/api/actions/{action_id}/reject", json={"merchant_notes": "Not needed right now"})
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"

    updated_actions = client.get("/api/actions?store_id=1").json()
    rejected_action = next((a for a in updated_actions if a["id"] == action_id), None)
    assert rejected_action["status"] == "REJECTED"
    assert rejected_action["approval"]["approved"] == False
