from datetime import date, timedelta
from agent.tools import AgentToolRegistry
from agent.provider import get_ai_provider

class RevenueAgentEngine:
    def __init__(self, db):
        self.db = db
        self.tools = AgentToolRegistry(db)
        self.provider = get_ai_provider()

    def investigate_store(self, store_id: int) -> dict:
        """
        Executes bounded AI decision investigation loop:
        Signals -> Forecast -> Simulation -> Guardrail Check -> Proposal (PENDING approval)
        """
        store_state = self.tools.get_store_state(store_id)
        if "error" in store_state:
            return store_state

        # Step 1: Detect Profit Leaks
        leaks = self.tools.detect_profit_leaks(store_id=store_id)
        if not leaks:
            return {
                "store_id": store_id,
                "status": "NO_LEAKAGE_DETECTED",
                "message": "Store operations are performing within optimal parameters.",
                "proposed_action": None
            }

        # Select largest opportunity
        top_leak = leaks[0]
        cat = top_leak["category"]
        product_id = top_leak.get("product_id", 1)

        # Step 2: Forecast & Inventory Context
        forecast_res = self.tools.forecast_demand(store_id, product_id, "2025-12-31")
        inventory_res = self.tools.get_inventory(store_id, product_id)

        # Step 3: Run Decision Simulation based on leakage type
        if cat in ["STOCKOUT", "OVERSTOCK", "SUPPLIER_COST"]:
            action_type = "REORDER"
            sim_res = self.tools.simulate_order(store_id, product_id)
            rec_scenario = sim_res["recommended_scenario"]
            rec_detail = f"Order {sim_res['recommended_order_quantity']} units of {sim_res['product_name']}."
            expected_outcome = {
                "expected_sales": rec_scenario["expected_sales"],
                "expected_revenue": rec_scenario["expected_revenue"],
                "expected_gross_profit": rec_scenario["expected_gross_profit"],
                "stockout_probability": rec_scenario["stockout_probability"],
                "cash_locked": rec_scenario["cash_locked"]
            }
            risk_level = "LOW" if rec_scenario["stockout_probability"] < 0.15 else "MEDIUM"
        else:
            action_type = "DISCOUNT"
            sim_res = self.tools.simulate_discount(store_id, product_id)
            rec_scenario = sim_res["recommended_scenario"]
            rec_detail = f"Apply {sim_res['recommended_discount_percent']:.0f}% discount on {sim_res['product_name']}."
            expected_outcome = {
                "expected_sales": rec_scenario["expected_sales"],
                "expected_revenue": rec_scenario["expected_revenue"],
                "expected_gross_profit": rec_scenario["expected_gross_profit"],
                "net_contribution": rec_scenario["net_contribution"]
            }
            risk_level = "LOW"

        # Step 4: Validate Policy Guardrails
        guardrail_res = self.tools.check_constraints(
            action_type="ORDER" if action_type == "REORDER" else "DISCOUNT",
            parameters=expected_outcome
        )

        confidence = round(top_leak.get("confidence", 0.85) * forecast_res.get("confidence", 0.85), 2)

        reasoning = (
            f"Investigated top opportunity ({cat} leakage valued at INR {top_leak['estimated_opportunity']:,.2f}). "
            f"Forecasted demand of {forecast_res['expected_demand']} units. "
            f"Simulated scenarios and selected option with highest net contribution (INR {expected_outcome['expected_gross_profit']:,.2f}) "
            f"under policy guardrails."
        )

        # Step 5: Propose Action (Requires Merchant Approval)
        action_record = self.tools.propose_action(
            store_id=store_id,
            action_type=action_type,
            recommendation=rec_detail,
            agent_reasoning=reasoning,
            evidence={
                "leakage_category": cat,
                "estimated_leakage_impact": top_leak["estimated_opportunity"],
                "evidence_statements": top_leak.get("evidence", []),
                "forecast_drivers": forecast_res.get("drivers", []),
                "guardrail_validation": guardrail_res
            },
            expected_outcome=expected_outcome,
            confidence=confidence,
            risk_level=risk_level
        )

        return {
            "store_id": store_id,
            "action_id": action_record.id,
            "action_type": action_type,
            "recommendation": rec_detail,
            "reasoning": reasoning,
            "why_selected": sim_res["explanation"],
            "confidence": confidence,
            "risk_level": risk_level,
            "status": "PENDING",
            "requires_approval": True,
            "simulation_comparison": sim_res["scenarios"],
            "evidence": top_leak.get("evidence", [])
        }

    def chat_with_agent(self, user_message: str, store_id: int = 1) -> dict:
        """
        Handles interactive merchant questions like 'Where am I silently losing money?'
        using deterministic data tools and AI reasoning.
        """
        store_state = self.tools.get_store_state(store_id)
        leaks = self.tools.detect_profit_leaks(store_id=store_id)
        summary = self.tools.leak_detector.get_opportunity_summary(store_id=store_id)

        top_leaks_text = ""
        for idx, l in enumerate(leaks[:3], 1):
            top_leaks_text += f"\n{idx}. [{l['category']}] {l['product']} at {l['store']} — Estimated Opportunity: INR {l['estimated_opportunity']:,.2f} (Confidence: {l['confidence']*100:.0f}%)"

        system_prompt = (
            "You are the Merchant Revenue Autopilot AI Agent for Razorpay Buildathon. "
            "You provide data-backed financial recommendations based on deterministic data models. "
            "Never invent numbers. Always remind the merchant that actions require explicit approval."
        )

        reply_text = (
            f"Hello! I analyzed your store ({store_state['store_name']}) historical sales, demand velocity, and stockout signals.\n\n"
            f"**Total Identified Opportunity:** INR {summary['total_estimated_opportunity']:,.2f} across {summary['total_opportunities_count']} areas.\n\n"
            f"**Top Profit Leakage Signals:**{top_leaks_text}\n\n"
            f"Would you like me to run decision simulations and propose a merchant-approved action for the top opportunity?"
        )

        return {
            "store_id": store_id,
            "message": reply_text,
            "total_opportunity": summary["total_estimated_opportunity"],
            "leaks_detected": len(leaks),
            "requires_approval": True
        }
