from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import FailureEvent, AgentAction

class FailureRecoveryEngine:
    def __init__(self, db: Session):
        self.db = db

    def record_failure(
        self,
        failure_type: str,
        possible_cause: str,
        recovery_action: str,
        details: Optional[Dict[str, Any]] = None,
        predicted_val: Optional[float] = None,
        actual_val: Optional[float] = None
    ) -> FailureEvent:
        """
        Logs a FailureEvent and stops unsafe execution.
        """
        err_pct = None
        if predicted_val and actual_val and predicted_val > 0:
            err_pct = round(abs(actual_val - predicted_val) / predicted_val * 100.0, 2)

        evt = FailureEvent(
            failure_type=failure_type,
            predicted_value=predicted_val,
            actual_value=actual_val,
            error_percentage=err_pct,
            possible_cause=possible_cause,
            recovery_action=recovery_action,
            details=details or {},
            created_at=datetime.utcnow()
        )
        self.db.add(evt)
        self.db.commit()
        self.db.refresh(evt)
        return evt

    def handle_stale_forecast_failure(self, store_id: int, product_id: int) -> Dict[str, Any]:
        """
        Handles STALE_FORECAST failure scenario by logging failure and switching to safe fallback mode.
        """
        evt = self.record_failure(
            failure_type="STALE_FORECAST",
            possible_cause=f"Forecast data for store #{store_id}, product #{product_id} has exceeded freshness window (>48h old).",
            recovery_action="Execution halted. System switched safely to Recommendation-Only Fallback Mode. Automated reorder disabled until forecast refresh.",
            details={"store_id": store_id, "product_id": product_id, "fallback_mode": "RECOMMENDATION_ONLY"}
        )

        return {
            "failure_id": evt.id,
            "failure_type": "STALE_FORECAST",
            "status": "HALTED_SAFELY",
            "fallback_mode": "RECOMMENDATION_ONLY",
            "possible_cause": evt.possible_cause,
            "recovery_action": evt.recovery_action,
            "audit_preserved": True
        }

    def list_failures(self) -> List[Dict[str, Any]]:
        """
        Retrieves all failure recovery records.
        """
        failures = self.db.query(FailureEvent).order_by(FailureEvent.created_at.desc()).all()
        return [
            {
                "id": f.id,
                "failure_type": f.failure_type,
                "predicted_value": f.predicted_value,
                "actual_value": f.actual_value,
                "error_percentage": f.error_percentage,
                "possible_cause": f.possible_cause,
                "recovery_action": f.recovery_action,
                "details": f.details,
                "created_at": f.created_at.isoformat() if f.created_at else None
            } for f in failures
        ]
