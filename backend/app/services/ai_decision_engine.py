import os
import json
from typing import Dict, Any, Optional, List
from app.core.audit_repository import audit_repository

class AIDecisionEngine:
    """
    AI-Assisted Decision Engine with Programmatic Safety Guardrails.
    Evaluates structured business context and generates bounded recovery recommendations.
    Provides clear attribution labels: AI_LLM, DETERMINISTIC_FALLBACK, or SAFETY_GUARDRAIL.
    """

    MAX_DISCOUNT_PERCENT = 30.0
    MIN_GROSS_MARGIN_PERCENT = 10.0
    CONFIDENCE_THRESHOLD = 0.70

    def __init__(self):
        self.ai_provider = os.getenv("AI_PROVIDER", "fallback").lower()
        self.api_key = os.getenv("AI_API_KEY")

    def evaluate_opportunity(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main decision entrypoint. Accepts structured context and returns bounded recommendation.
        """
        product_name = context.get("product", "Unknown Product")
        store_id = context.get("store", "STR-1001")
        inventory = context.get("inventory", 0)
        velocity = max(0.1, context.get("sales_velocity", 1.0))
        days_cover = context.get("days_of_cover", round(inventory / velocity))
        at_risk = context.get("revenue_at_risk", 0)
        risk_type = context.get("risk_type", "SLOW_MOVING")
        margin = context.get("margin", 35.0)

        # 1. Attempt LLM invocation if API key is present & provider is set
        recommendation = None
        if self.api_key and self.ai_provider in ["openai", "anthropic", "gemini"]:
            recommendation = self._call_llm_provider(context)

        # 2. If LLM unavailable or unconfigured, use deterministic fallback engine
        if not recommendation:
            recommendation = self._deterministic_fallback_decision(
                product_name, store_id, inventory, velocity, days_cover, at_risk, risk_type, margin
            )

        # 3. Apply Mandatory Programmatic Safety Guardrails & Constraints
        bounded_recommendation = self._apply_safety_guardrails(recommendation, context)

        # 4. Log AI Decision Event to Audit Repository
        audit_repository.log_event(
            action="AI_DECISION_GENERATED",
            entity=f"{product_name} ({store_id})",
            reason=bounded_recommendation["reasoning"],
            before_state=f"Risk: {risk_type} · Exposure: ₹{Math_round(at_risk)}",
            after_state=f"Action: {bounded_recommendation['action']} · Recov: ₹{Math_round(bounded_recommendation['expected_recovery'])}",
            source=bounded_recommendation["source"],
            status="PROPOSED" if bounded_recommendation["requires_approval"] else "APPROVED"
        )

        return bounded_recommendation

    def _call_llm_provider(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Structured LLM wrapper placeholder if external key is passed
        return None

    def _deterministic_fallback_decision(
        self,
        product: str,
        store: str,
        inventory: int,
        velocity: float,
        days_cover: int,
        at_risk: float,
        risk_type: str,
        margin: float
    ) -> Dict[str, Any]:
        """
        Deterministic, rule-based decision engine used when LLM API is unavailable.
        Uses statistical stock cover & velocity thresholds to formulate recommendations.
        """
        if risk_type == "SLOW_MOVING" or days_cover > 45:
            markdown_pct = 15.0 if days_cover > 60 else 10.0
            expected_rec = round(at_risk * (0.60 + (markdown_pct / 100.0)))
            return {
                "action": "MARKDOWN",
                "discount_percent": markdown_pct,
                "reasoning": f"Inventory days of cover ({days_cover}d) exceeds 45-day baseline velocity threshold. Recommended {markdown_pct}% targeted markdown to accelerate sell-through.",
                "confidence": 0.88,
                "expected_recovery": expected_rec,
                "source": "DETERMINISTIC_FALLBACK"
            }
        elif risk_type == "STOCKOUT" or days_cover < 5:
            suggested_qty = max(10, round(velocity * 14))
            expected_rec = round(velocity * 14 * (at_risk / max(1, inventory))) if inventory > 0 else round(at_risk * 0.90)
            return {
                "action": "RESTOCK",
                "restock_quantity": suggested_qty,
                "reasoning": f"Critical stockout risk detected ({days_cover}d cover remaining). Recommended immediate replenishment of {suggested_qty} units for 14-day buffer.",
                "confidence": 0.94,
                "expected_recovery": expected_rec,
                "source": "DETERMINISTIC_FALLBACK"
            }
        elif risk_type == "MARGIN_LEAK" or margin < 25.0:
            return {
                "action": "INVESTIGATE",
                "reasoning": f"Gross margin ({margin}%) is below 25.0% category threshold. Recommended supplier pricing & procurement cost audit.",
                "confidence": 0.82,
                "expected_recovery": round(at_risk * 0.40),
                "source": "DETERMINISTIC_FALLBACK"
            }
        else:
            return {
                "action": "HOLD",
                "reasoning": f"Stock level ({inventory} units, {days_cover}d cover) is within acceptable risk boundaries. Maintain current pricing.",
                "confidence": 0.95,
                "expected_recovery": 0,
                "source": "DETERMINISTIC_FALLBACK"
            }

    def _apply_safety_guardrails(self, rec: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces strict safety guardrails around AI recommendations.
        """
        margin = context.get("margin", 35.0)
        at_risk = context.get("revenue_at_risk", 0)
        constraints = []
        requires_approval = False

        # Discount Guardrail
        discount = rec.get("discount_percent", 0.0)
        if discount > self.MAX_DISCOUNT_PERCENT:
            rec["discount_percent"] = self.MAX_DISCOUNT_PERCENT
            rec["source"] = "SAFETY_GUARDRAIL"
            constraints.append(f"Discount capped at max allowed {self.MAX_DISCOUNT_PERCENT}%")

        # Margin Guardrail
        if margin - discount < self.MIN_GROSS_MARGIN_PERCENT:
            max_safe_discount = max(0.0, margin - self.MIN_GROSS_MARGIN_PERCENT)
            rec["discount_percent"] = max_safe_discount
            rec["source"] = "SAFETY_GUARDRAIL"
            constraints.append(f"Discount restricted to {max_safe_discount:.1f}% to preserve min {self.MIN_GROSS_MARGIN_PERCENT}% margin")

        # Confidence Guardrail
        if rec.get("confidence", 1.0) < self.CONFIDENCE_THRESHOLD:
            requires_approval = True
            constraints.append(f"Confidence {rec.get('confidence'):.2f} is below auto-execution threshold {self.CONFIDENCE_THRESHOLD}")

        # Exposure Value Guardrail (High-value interventions require human approval)
        if at_risk > 5000 or rec.get("discount_percent", 0) > 15.0:
            requires_approval = True
            constraints.append("High financial exposure requires merchant approval")

        rec["constraints"] = constraints
        rec["requires_approval"] = requires_approval
        return rec

def Math_round(val: float) -> int:
    return int(round(val or 0))

ai_decision_engine = AIDecisionEngine()
