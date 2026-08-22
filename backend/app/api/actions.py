from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AgentAction, ActionApproval

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
    Merchant explicitly approves a proposed action.
    """
    action = db.query(AgentAction).filter(AgentAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action with ID {id} not found.")

    action.status = "APPROVED"
    
    notes = req.merchant_notes if req else "Approved by merchant."
    approval = ActionApproval(
        action_id=action.id,
        approved=True,
        merchant_notes=notes,
        approved_at=datetime.utcnow()
    )
    
    db.add(approval)
    db.commit()
    db.refresh(action)

    return {
        "status": "APPROVED",
        "action_id": action.id,
        "message": f"Action #{id} has been approved by merchant and queued for execution."
    }

@router.post("/actions/{id}/reject")
def reject_action(id: int, req: Optional[ActionApprovalRequest] = None, db: Session = Depends(get_db)):
    """
    Merchant explicitly rejects a proposed action.
    """
    action = db.query(AgentAction).filter(AgentAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action with ID {id} not found.")

    action.status = "REJECTED"
    
    notes = req.merchant_notes if req else "Rejected by merchant."
    approval = ActionApproval(
        action_id=action.id,
        approved=False,
        merchant_notes=notes,
        approved_at=datetime.utcnow()
    )
    
    db.add(approval)
    db.commit()
    db.refresh(action)

    return {
        "status": "REJECTED",
        "action_id": action.id,
        "message": f"Action #{id} was rejected by merchant."
    }
