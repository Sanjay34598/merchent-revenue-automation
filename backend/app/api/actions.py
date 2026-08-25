from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AgentAction, ActionApproval
from app.services.recovery_engine import recovery_engine
from app.services.evaluation_engine import evaluation_engine
from app.core.audit_repository import audit_repository

router = APIRouter()

class ActionApprovalRequest(BaseModel):
    merchant_notes: Optional[str] = None

@router.get("/actions")
def get_actions(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Retrieves full audit trail of proposed agent actions and merchant approval states.
    """
    query = db.query(AgentAction)
    if store_id:
        query = query.filter(AgentAction.store_id == store_id)

    actions = query.order_by(AgentAction.created_at.desc()).all()
    
    result = []
    for a in actions:
        approval = db.query(ActionApproval).filter(ActionApproval.action_id == a.id).first()
        result.append({
            "id": a.id,
            "store_id": a.store_id,
            "action_type": a.action_type,
            "recommendation": a.recommendation,
            "agent_reasoning": a.agent_reasoning,
            "tool_calls": a.tool_calls,
            "evidence": a.evidence,
            "expected_outcome": a.expected_outcome,
            "confidence": a.confidence,
            "risk_level": a.risk_level,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "approval": {
                "approved": approval.approved if approval else None,
                "merchant_notes": approval.merchant_notes if approval else None,
                "approved_at": approval.approved_at.isoformat() if approval and approval.approved_at else None
            } if approval else None
        })
    return result

@router.post("/actions/{id}/approve")
def approve_action(id: int, req: Optional[ActionApprovalRequest] = None, db: Session = Depends(get_db)):
    """
    Approves a proposed action. Updates SQLite & triggers bounded execution.
    """
    notes = req.merchant_notes if req else None
    
    # Try DB match first
    action = db.query(AgentAction).filter(AgentAction.id == id).first()
    if action:
        action.status = "APPROVED"
        approval = ActionApproval(
            action_id=id,
            approved=True,
            merchant_notes=notes,
            approved_at=datetime.utcnow()
        )
        db.add(approval)
        db.commit()

    # Execute recovery engine bounded action
    exec_result = recovery_engine.execute_recovery_action(id, "MARKDOWN", {"discount_percent": 15.0})

    return {
        "status": "APPROVED",
        "action_id": id,
        "execution": exec_result,
        "message": f"Action #{id} approved and executed successfully."
    }

class RecoveryExecuteRequest(BaseModel):
    action_id: int
    action_type: str
    discount_percent: Optional[float] = 15.0
    restock_quantity: Optional[int] = 25

@router.post("/recovery/execute")
def execute_recovery(req: RecoveryExecuteRequest):
    """
    Executes a bounded recovery action (MARKDOWN, RESTOCK, PROMOTION).
    Updates catalog, records audit log, and calculates actual recovered revenue.
    """
    result = recovery_engine.execute_recovery_action(
        req.action_id,
        req.action_type,
        {"discount_percent": req.discount_percent, "restock_quantity": req.restock_quantity}
    )
    return result

@router.get("/recovery/opportunities")
def get_recovery_opportunities(store_id: Optional[str] = "STR-1001"):
    """
    Retrieves normalized closed-loop recovery opportunities with AI recommendations.
    """
    return recovery_engine.get_recovery_opportunities(store_id)

@router.get("/recovery/metrics")
def get_recovery_metrics():
    """
    Retrieves closed-loop recovery metrics: revenue at risk, expected recovery, actual recovery, recovery rate.
    """
    return recovery_engine.get_summary_recovery_metrics()

@router.get("/recovery/evaluation")
def get_recovery_evaluation(store_id: Optional[str] = "STR-1001", batch_size: int = 150):
    """
    Retrieves reproducible before/after batch evaluation comparing Baseline vs Strategy.
    """
    return evaluation_engine.run_batch_evaluation(store_id, batch_size)

@router.get("/audit/logs")
def get_audit_logs(limit: int = 50, action_filter: Optional[str] = None):
    """
    Retrieves immutable audit trail logs for all system state changes.
    """
    return audit_repository.get_logs(limit, action_filter)
