from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ProfitLeak
from profit_leakage.detector import ProfitLeakageDetector

router = APIRouter()

@router.get("/opportunities")
def get_opportunities(store_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """
    Returns prioritized list of all detected profit leakage opportunities.
    """
    detector = ProfitLeakageDetector(db)
    opportunities = detector.detect_all_opportunities(store_id=store_id)
    return opportunities

@router.get("/opportunities/summary")
def get_opportunities_summary(store_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """
    Returns high-level summary metrics of total potential opportunity & category breakdown.
    """
    detector = ProfitLeakageDetector(db)
    summary = detector.get_opportunity_summary(store_id=store_id)
    return summary

@router.get("/opportunities/{id}")
def get_opportunity_by_id(id: int, db: Session = Depends(get_db)):
    """
    Returns specific profit leak by ID.
    """
    leak = db.query(ProfitLeak).filter(ProfitLeak.id == id).first()
    if not leak:
        raise HTTPException(status_code=404, detail=f"Profit leak opportunity with ID {id} not found.")
    
    return {
        "id": leak.id,
        "store_id": leak.store_id,
        "product_id": leak.product_id,
        "category": leak.category,
        "estimated_impact": leak.estimated_impact,
        "confidence": leak.confidence,
        "evidence": leak.evidence,
        "explanation": leak.explanation,
        "recommended_action": leak.recommended_action,
        "created_at": leak.created_at.isoformat() if leak.created_at else None
    }
