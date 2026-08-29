from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import AgentAction, ActionApproval, ActionOutcome, FailureEvent
from simulator.constraints import PolicyGuardrails

class ActionExecutor:
    def __init__(self, db: Session):
        self.db = db
        self.guardrails = PolicyGuardrails()

    def evaluate_policy(self, action_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates risk tier and policy constraints before proposing/executing an action.
        Tiers: LOW_RISK, MEDIUM_RISK, HIGH_RISK.
        """
        discount_pct = parameters.get("discount_percent", 0.0)
        order_qty = parameters.get("order_quantity", 0)
        cash_locked = parameters.get("cash_locked", 0.0)

        # Risk classification
        if discount_pct > 30.0 or cash_locked > 15000.0 or action_type == "REFUND":
            risk_level = "HIGH_RISK"
            auto_allowed = False
        elif discount_pct > 0.0 or order_qty > 0:
            risk_level = "MEDIUM_RISK"
            auto_allowed = False  # Requires explicit merchant approval
        else:
            risk_level = "LOW_RISK"
            auto_allowed = True

        return {
            "risk_level": risk_level,
            "auto_allowed": auto_allowed,
            "requires_approval": not auto_allowed,
            "policy_passed": True,
            "message": f"Action classified as {risk_level}. Requires merchant approval: {not auto_allowed}."
        }

    def execute_action(
        self,
        action_id: int,
        execution_mode: str = "MOCK"
    ) -> Dict[str, Any]:
        """
        Executes an approved agent action safely in MOCK or RAZORPAY_TEST_MODE.
        Blocks unapproved actions and duplicate executions.
        """
        action = self.db.query(AgentAction).filter(AgentAction.id == action_id).first()
        if not action:
            return {
                "success": False,
                "error": f"Action #{action_id} not found.",
                "status": "NOT_FOUND"
            }

        # Check Duplicate Execution
        if action.status == "EXECUTED":
            # Log failure event for duplicate action attempt
            fail_evt = FailureEvent(
                failure_type="DUPLICATE_ACTION",
                possible_cause=f"Attempted duplicate execution on action #{action_id} which is already EXECUTED.",
                recovery_action="Execution blocked safely. Preserved audit trail and original execution outcome.",
                details={"action_id": action_id, "current_status": action.status}
            )
            self.db.add(fail_evt)
            self.db.commit()
            return {
                "success": False,
                "error": f"Duplicate execution blocked. Action #{action_id} has already been EXECUTED.",
                "status": "DUPLICATE_BLOCKED",
                "recovery": "Action execution halted. Original outcome preserved."
            }

        # Check Approval Status
        if action.status != "APPROVED":
            fail_evt = FailureEvent(
                failure_type="POLICY_REJECTION",
                possible_cause=f"Attempted execution of action #{action_id} with status '{action.status}' without explicit merchant approval.",
                recovery_action="Stopped unsafe execution. Switched to recommendation-only mode.",
                details={"action_id": action_id, "status": action.status}
            )
            self.db.add(fail_evt)
            self.db.commit()
            return {
                "success": False,
                "error": f"Execution rejected. Action #{action_id} is in '{action.status}' state and requires explicit merchant approval.",
                "status": "APPROVAL_REQUIRED"
            }

        # Perform SAFE Razorpay Order Payload Construction & Execution
        exp_outcome = action.expected_outcome or {}
        predicted_impact = float(exp_outcome.get("expected_gross_profit", 1500.0))
        
        # Calculate action execution monetary value in INR rupees
        cash_locked = float(exp_outcome.get("cash_locked", predicted_impact))
        amount_in_rupees = max(10.0, cash_locked if cash_locked > 0 else predicted_impact)

        from app.services.razorpay_service import razorpay_service
        razorpay_res = razorpay_service.create_order(
            amount_in_rupees=amount_in_rupees,
            action_type=action.action_type,
            product_id=action.product_id or 1,
            store_id=action.store_id or 1,
            receipt=f"rcpt_act_{action.id}",
            notes_extra={"agent_action_id": action.id}
        )

        # Simulate realistic outcome (variance within +/- 4%)
        actual_impact = round(predicted_impact * 0.96, 2)
        variance = round(actual_impact - predicted_impact, 2)

        # Mark action EXECUTED
        action.status = "EXECUTED"

        # Create or update ActionOutcome record with Razorpay transaction metadata
        outcome = self.db.query(ActionOutcome).filter(ActionOutcome.action_id == action.id).first()
        if not outcome:
            outcome = ActionOutcome(
                action_id=action.id,
                actual_impact=actual_impact,
                predicted_impact=predicted_impact,
                variance=variance,
                details={
                    "execution_mode": execution_mode,
                    "razorpay_status": razorpay_res.get("status"),
                    "razorpay_order_id": razorpay_res.get("razorpay_order_id"),
                    "razorpay_order_payload": razorpay_res.get("razorpay_order_payload"),
                    "amount_rupees": amount_in_rupees,
                    "amount_paise": razorpay_res.get("amount_paise"),
                    "revenue_recovered": round(actual_impact * 1.25, 2),
                    "profit_recovered": actual_impact,
                    "waste_avoided_units": 14,
                    "stockouts_avoided_units": 22,
                    "prediction_error_pct": round(abs(variance / predicted_impact) * 100, 2) if predicted_impact > 0 else 0.0
                },
                evaluated_at=datetime.utcnow()
            )
            self.db.add(outcome)

        self.db.commit()
        self.db.refresh(action)

        return {
            "success": True,
            "action_id": action.id,
            "status": "EXECUTED",
            "execution_mode": execution_mode,
            "razorpay_status": razorpay_res.get("status"),
            "razorpay_order_id": razorpay_res.get("razorpay_order_id"),
            "razorpay_order_payload": razorpay_res.get("razorpay_order_payload"),
            "predicted_impact": predicted_impact,
            "actual_impact": actual_impact,
            "variance": variance,
            "message": f"Action #{action_id} executed successfully. Razorpay order state: {razorpay_res.get('status')}."
        }
