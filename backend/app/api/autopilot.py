from datetime import datetime, date
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AgentAction, ActionApproval, ActionOutcome, FailureEvent, Product, InventorySnapshot
from agent.unified_engine import RevenueDecisionEngine
from agent.revenue_opportunity import RevenueOpportunityEngine
from agent.executor import ActionExecutor
from agent.learning import EvidenceLearningLoop
from agent.failure_recovery import FailureRecoveryEngine
from agent.demo_scenarios import DemoScenarioRunner
from agent.revenue_experiment import RevenueExperimentEngine

router = APIRouter()

class AnalyzeRequest(BaseModel):
    store_id: int = Field(default=1, description="Store ID to analyze")
    target_date: Optional[str] = Field(default=None, description="Optional target date YYYY-MM-DD")

class DemoRunRequest(BaseModel):
    scenario_id: int = Field(..., description="Scenario ID (1, 2, 3, or 4)")

class ExecuteActionRequest(BaseModel):
    execution_mode: str = Field(default="MOCK", description="Execution mode: MOCK or RAZORPAY_TEST_MODE")

class CustomSimulateRequest(BaseModel):
    store_id: int = Field(default=1, description="Store ID")
    product_id: int = Field(default=1, description="Product ID")
    custom_order_quantity: Optional[int] = Field(default=150, description="Custom Order Quantity")
    custom_discount_percent: Optional[float] = Field(default=0.0, description="Custom Discount Percentage")

@router.post("/autopilot/simulate-custom")
def simulate_custom(req: CustomSimulateRequest, db: Session = Depends(get_db)):
    """
    Simulates custom merchant what-if parameters against current status quo using existing simulation/forecasting engine.
    """
    engine = RevenueDecisionEngine(db)
    # Build candidate comparison between Status Quo (DO_NOTHING) and Custom Proposed Strategy
    # Fetch forecast
    target_date_obj = date.today()
    fc = engine.forecaster.predict_demand(req.store_id, req.product_id, target_date_obj)
    expected_demand = fc["expected_demand"]

    product = db.query(Product).filter(Product.id == req.product_id).first()
    price = product.selling_price if product else 35.0
    cost = product.unit_cost if product else 20.0

    inv = db.query(InventorySnapshot).filter(
        InventorySnapshot.store_id == req.store_id,
        InventorySnapshot.product_id == req.product_id
    ).first()
    current_stock = inv.closing_inventory if inv else 0

    # Option 1: Status Quo
    sq_sales = min(current_stock, expected_demand)
    sq_rev = sq_sales * price
    sq_profit = sq_rev - (current_stock * cost)
    sq_stockout = max(0.0, round((expected_demand - current_stock) / expected_demand, 2)) if expected_demand > 0 else 0.0

    status_quo = {
        "action_name": "STATUS_QUO",
        "label": "Current Status Quo (DO_NOTHING)",
        "order_quantity": 0,
        "discount_percent": 0.0,
        "expected_sales": round(sq_sales, 1),
        "expected_revenue": round(sq_rev, 2),
        "expected_gross_profit": round(sq_profit, 2),
        "stockout_probability": sq_stockout,
        "waste_probability": 0.0,
        "cash_locked": 0.0,
        "action_risk_level_num": 0.05
    }

    # Option 2: Custom Proposed
    c_qty = req.custom_order_quantity or 0
    c_disc = req.custom_discount_percent or 0.0
    eff_price = price * (1.0 - c_disc / 100.0)
    eff_stock = current_stock + c_qty
    c_sales = min(eff_stock, expected_demand * (1.0 + (c_disc / 100.0) * 1.4))
    c_rev = c_sales * eff_price
    c_profit = c_rev - (c_qty * cost)
    c_stockout = max(0.0, round((expected_demand - eff_stock) / expected_demand, 2)) if expected_demand > 0 else 0.0
    c_waste = max(0.0, round((eff_stock - expected_demand) / eff_stock, 2)) if eff_stock > 0 else 0.0
    c_cash = c_qty * cost

    custom = {
        "action_name": "CUSTOM_PROPOSED",
        "label": f"Custom Proposed Strategy (Order {c_qty}, Disc {c_disc:.0f}%)",
        "order_quantity": c_qty,
        "discount_percent": c_disc,
        "expected_sales": round(c_sales, 1),
        "expected_revenue": round(c_rev, 2),
        "expected_gross_profit": round(c_profit, 2),
        "stockout_probability": c_stockout,
        "waste_probability": c_waste,
        "cash_locked": c_cash,
        "action_risk_level_num": 0.2 if c_qty <= 150 else 0.4
    }

    scored = engine.score_candidates([status_quo, custom])

    return {
        "store_id": req.store_id,
        "product_id": req.product_id,
        "product_name": product.name if product else "Product",
        "expected_demand_forecast": expected_demand,
        "status_quo_strategy": status_quo,
        "custom_proposed_strategy": custom,
        "scored_comparison": scored,
        "net_profit_gain": round(custom["expected_gross_profit"] - status_quo["expected_gross_profit"], 2),
        "recommendation": "Custom proposed strategy yields higher expected merchant score." if custom["overall_score"] >= status_quo["overall_score"] else "Status quo is optimal under proposed parameters."
    }

@router.post("/autopilot/analyze")
def analyze_decision(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Executes unified closed-loop revenue decision analysis for a store.
    """
    engine = RevenueDecisionEngine(db)
    result = engine.analyze(store_id=req.store_id, target_date_str=req.target_date)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/autopilot/opportunities")
def get_opportunities(store_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """
    Returns prioritized list of revenue opportunities using aggregate intelligence.
    """
    engine = RevenueOpportunityEngine(db)
    return engine.detect_opportunities(store_id=store_id)

@router.post("/autopilot/execute/{action_id}")
def execute_action(action_id: int, req: Optional[ExecuteActionRequest] = None, db: Session = Depends(get_db)):
    """
    Executes an approved action safely in MOCK or RAZORPAY_TEST_MODE.
    Checks approval status and blocks duplicate executions.
    """
    mode = req.execution_mode if req else "MOCK"
    executor = ActionExecutor(db)
    res = executor.execute_action(action_id=action_id, execution_mode=mode)
    
    if not res["success"]:
        if res.get("status") == "DUPLICATE_BLOCKED":
            raise HTTPException(status_code=409, detail=res["error"])
        elif res.get("status") == "APPROVAL_REQUIRED":
            raise HTTPException(status_code=400, detail=res["error"])
        else:
            raise HTTPException(status_code=404, detail=res["error"])

    return res

@router.get("/autopilot/outcomes")
def get_outcomes(store_id: Optional[int] = Query(1), db: Session = Depends(get_db)):
    """
    Retrieves empirical outcome measurement metrics, prediction error rates, and confidence calibration.
    """
    learning = EvidenceLearningLoop(db)
    return learning.evaluate_outcomes(store_id=store_id)

@router.get("/autopilot/failures")
def get_failures(db: Session = Depends(get_db)):
    """
    Retrieves failure recovery events, duplicate blocks, and fallback statuses.
    """
    engine = FailureRecoveryEngine(db)
    return engine.list_failures()

@router.get("/autopilot/timeline/{action_id}")
def get_action_timeline(action_id: int, db: Session = Depends(get_db)):
    """
    Returns human-readable 10-stage audit timeline for an action.
    """
    action = db.query(AgentAction).filter(AgentAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action #{action_id} not found.")

    approval = db.query(ActionApproval).filter(ActionApproval.action_id == action.id).first()
    outcome = db.query(ActionOutcome).filter(ActionOutcome.action_id == action.id).first()

    created_iso = action.created_at.isoformat() if action.created_at else None
    approved_iso = approval.approved_at.isoformat() if approval and approval.approved_at else None
    executed_iso = outcome.evaluated_at.isoformat() if outcome and outcome.evaluated_at else None

    stages = [
        {"stage": "OBSERVED", "status": "COMPLETED", "details": f"Observed store #{action.store_id} sales & inventory velocity.", "timestamp": created_iso},
        {"stage": "DETECTED", "status": "COMPLETED", "details": f"Detected opportunity: {action.action_type}.", "timestamp": created_iso},
        {"stage": "FORECASTED", "status": "COMPLETED", "details": f"Forecasted demand with confidence {action.confidence*100:.0f}%.", "timestamp": created_iso},
        {"stage": "SIMULATED", "status": "COMPLETED", "details": "Simulated candidate actions including DO_NOTHING.", "timestamp": created_iso},
        {"stage": "RECOMMENDED", "status": "COMPLETED", "details": action.recommendation, "timestamp": created_iso},
        {"stage": "POLICY CHECK", "status": "COMPLETED", "details": f"Passed policy check ({action.risk_level} Risk Tier). Approval required.", "timestamp": created_iso},
        {"stage": "APPROVED", "status": "COMPLETED" if approval and approval.approved else ("REJECTED" if approval else "PENDING"), "details": approval.merchant_notes if approval else "Awaiting merchant approval.", "timestamp": approved_iso},
        {"stage": "EXECUTED", "status": "COMPLETED" if action.status == "EXECUTED" else "PENDING", "details": f"Execution status: {action.status} (RAZORPAY_TEST_MODE).", "timestamp": executed_iso},
        {"stage": "OUTCOME", "status": "COMPLETED" if outcome else "PENDING", "details": f"Actual Gross Profit: INR {outcome.actual_impact:,.2f} (Variance: INR {outcome.variance:,.2f})" if outcome else "Awaiting outcome measurement.", "timestamp": executed_iso},
        {"stage": "LEARNED", "status": "COMPLETED" if outcome else "PENDING", "details": "Updated base confidence calibration based on outcome variance." if outcome else "Awaiting outcome feedback.", "timestamp": executed_iso}
    ]

    return {
        "action_id": action.id,
        "store_id": action.store_id,
        "action_type": action.action_type,
        "status": action.status,
        "timeline_10_stages": stages
    }

@router.post("/autopilot/demo/run")
def run_demo_scenario(req: DemoRunRequest, db: Session = Depends(get_db)):
    """
    Executes one of four deterministic demo scenarios.
    """
    runner = DemoScenarioRunner(db)
    res = runner.run_scenario(scenario_id=req.scenario_id)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.get("/autopilot/experiments")
def list_experiments(store_id: Optional[int] = Query(1), db: Session = Depends(get_db)):
    """
    Side-effect free GET method returning available strategy experiments and template list.
    """
    exp_engine = RevenueExperimentEngine(db)
    return exp_engine.list_experiments(store_id=store_id)

@router.post("/autopilot/experiments/{experiment_id}/run")
def run_experiment(experiment_id: str, store_id: Optional[int] = Query(1), db: Session = Depends(get_db)):
    """
    Runs multi-arm strategy comparison experiment.
    """
    exp_engine = RevenueExperimentEngine(db)
    res = exp_engine.run_experiment(experiment_id=experiment_id, store_id=store_id)
    return res
