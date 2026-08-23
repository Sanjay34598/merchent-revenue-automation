import pytest
from fastapi.testclient import TestClient
from app.core.database import SessionLocal
from app.main import app
from agent.revenue_opportunity import RevenueOpportunityEngine
from agent.unified_engine import RevenueDecisionEngine, ScoringWeights
from agent.executor import ActionExecutor
from agent.learning import EvidenceLearningLoop
from agent.failure_recovery import FailureRecoveryEngine
from agent.demo_scenarios import DemoScenarioRunner
from agent.revenue_experiment import RevenueExperimentEngine
from app.models.models import AgentAction, ActionApproval, ActionOutcome, FailureEvent

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

# 1. Test Opportunity generation & aggregate-only intelligence
def test_opportunity_engine_aggregate_intelligence(db):
    engine = RevenueOpportunityEngine(db)
    opps = engine.detect_opportunities(store_id=1)
    assert isinstance(opps, list)
    assert len(opps) > 0
    for opp in opps:
        assert "opportunity_id" in opp
        assert "opportunity_type" in opp
        assert "estimated_revenue_loss" in opp
        assert "evidence" in opp
        # Ensure no customer tracking/PII
        opp_str = str(opp).lower()
        assert "customer_id" not in opp_str
        assert "user_profile" not in opp_str

# 2. Test Multi-objective normalized scoring engine
def test_multi_objective_normalized_scoring(db):
    engine = RevenueDecisionEngine(db)
    candidates = [
        {"action_name": "DO_NOTHING", "label": "Do nothing", "expected_gross_profit": 500.0, "stockout_probability": 0.35, "waste_probability": 0.0, "cash_locked": 0.0, "action_risk_level_num": 0.05},
        {"action_name": "ORDER_100", "label": "Order 100", "expected_gross_profit": 1500.0, "stockout_probability": 0.10, "waste_probability": 0.05, "cash_locked": 2000.0, "action_risk_level_num": 0.20},
        {"action_name": "ORDER_200", "label": "Order 200", "expected_gross_profit": 1400.0, "stockout_probability": 0.02, "waste_probability": 0.25, "cash_locked": 4000.0, "action_risk_level_num": 0.40}
    ]
    scored = engine.score_candidates(candidates)
    assert len(scored) == 3
    # Check normalized metrics exist and are in [0, 1]
    for c in scored:
        norm = c["normalized_metrics"]
        assert 0.0 <= norm["norm_profit"] <= 1.0
        assert 0.0 <= norm["norm_stockout"] <= 1.0
        assert 0.0 <= norm["norm_waste"] <= 1.0
        assert 0.0 <= norm["norm_cash"] <= 1.0

# 3. Test that DO_NOTHING can win when intervention value is lower
def test_do_nothing_can_win(db):
    engine = RevenueDecisionEngine(db)
    # Scenario where high order cash lock and waste risk penalizes order
    candidates = [
        {"action_name": "DO_NOTHING", "label": "Do nothing", "expected_gross_profit": 2000.0, "stockout_probability": 0.05, "waste_probability": 0.0, "cash_locked": 0.0, "action_risk_level_num": 0.05},
        {"action_name": "ORDER_200", "label": "Excessive Order", "expected_gross_profit": 800.0, "stockout_probability": 0.0, "waste_probability": 0.80, "cash_locked": 10000.0, "action_risk_level_num": 0.90}
    ]
    scored = engine.score_candidates(candidates)
    assert scored[0]["action_name"] == "DO_NOTHING"

# 4. Test Unified Decision Engine analyze method
def test_unified_decision_engine_analyze(db):
    engine = RevenueDecisionEngine(db)
    res = engine.analyze(store_id=1)
    
    assert "recommended_action" in res
    assert "winning_candidate" in res
    assert "do_nothing_comparison" in res
    assert "why_this_decision" in res
    assert "why_not_the_other_options" in res
    assert "audit_timeline" in res
    assert len(res["audit_timeline"]) == 10
    assert len(res["why_not_the_other_options"]) > 0

# 5. Test Action Executor (MOCK & RAZORPAY_TEST_MODE, Approval check, Duplicate blocking)
def test_action_executor_and_duplicate_prevention(db):
    executor = ActionExecutor(db)
    # Create test action requiring approval
    act = AgentAction(
        store_id=1,
        action_type="REORDER",
        recommendation="Order 150 units of Fresh Milk.",
        agent_reasoning="Optimizes profit recovery under policy limits.",
        expected_outcome={"expected_gross_profit": 2500.0},
        confidence=0.88,
        risk_level="MEDIUM",
        status="PENDING"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    # Execution without approval must fail
    fail_res = executor.execute_action(act.id)
    assert fail_res["success"] == False
    assert fail_res["status"] == "APPROVAL_REQUIRED"

    # Approve action
    act.status = "APPROVED"
    db.commit()

    # Execute action
    exec_res = executor.execute_action(act.id, execution_mode="RAZORPAY_TEST_MODE")
    assert exec_res["success"] == True
    assert exec_res["status"] == "EXECUTED"
    assert "test_reference" in exec_res

    # Attempt duplicate execution must be blocked
    dup_res = executor.execute_action(act.id)
    assert dup_res["success"] == False
    assert dup_res["status"] == "DUPLICATE_BLOCKED"

# 6. Test Evidence-Based Learning Loop
def test_learning_loop(db):
    learning = EvidenceLearningLoop(db)
    res = learning.evaluate_outcomes(store_id=1)
    assert "mean_prediction_error_pct" in res
    assert "calibrated_base_confidence" in res
    assert "total_profit_recovered" in res

# 7. Test Failure Recovery Engine (7 failure modes & fallback)
def test_failure_recovery_engine(db):
    engine = FailureRecoveryEngine(db)
    # Record failure
    evt = engine.record_failure(
        failure_type="API_TIMEOUT",
        possible_cause="Mock API call timed out after 5000ms.",
        recovery_action="Switched safely to recommendation-only mode."
    )
    assert evt.id is not None

    stale_res = engine.handle_stale_forecast_failure(1, 1)
    assert stale_res["status"] == "HALTED_SAFELY"
    assert stale_res["fallback_mode"] == "RECOMMENDATION_ONLY"

# 8. Test Deterministic Demo Scenarios 1-4
def test_demo_scenarios_execution(db):
    runner = DemoScenarioRunner(db)
    for s_id in [1, 2, 3, 4]:
        res = runner.run_scenario(s_id)
        assert res["scenario_id"] == s_id
        assert "story" in res

# 9. Test Revenue Experiments GET (side-effect free) and POST execution
def test_revenue_experiments_endpoints():
    # GET experiments
    get_resp = client.get("/api/autopilot/experiments?store_id=1")
    assert get_resp.status_code == 200
    exps = get_resp.json()
    assert isinstance(exps, list)
    assert len(exps) >= 2

    # POST run experiment
    exp_id = exps[0]["experiment_id"]
    post_resp = client.post(f"/api/autopilot/experiments/{exp_id}/run?store_id=1")
    assert post_resp.status_code == 200
    run_data = post_resp.json()
    assert "winning_strategy" in run_data
    assert "strategy_comparison" in run_data

# 10. Test Autopilot API endpoints
def test_autopilot_api_routes():
    # Analyze endpoint
    an_resp = client.post("/api/autopilot/analyze", json={"store_id": 1})
    assert an_resp.status_code == 200
    an_data = an_resp.json()
    assert "recommended_action" in an_data

    # Opportunities endpoint
    opp_resp = client.get("/api/autopilot/opportunities?store_id=1")
    assert opp_resp.status_code == 200

    # Outcomes endpoint
    out_resp = client.get("/api/autopilot/outcomes?store_id=1")
    assert out_resp.status_code == 200

    # Failures endpoint
    fail_resp = client.get("/api/autopilot/failures")
    assert fail_resp.status_code == 200

    # Demo run endpoint
    demo_resp = client.post("/api/autopilot/demo/run", json={"scenario_id": 1})
    assert demo_resp.status_code == 200
