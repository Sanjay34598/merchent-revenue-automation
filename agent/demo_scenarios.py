from typing import Dict, Any
from sqlalchemy.orm import Session
from agent.unified_engine import RevenueDecisionEngine
from agent.failure_recovery import FailureRecoveryEngine
from agent.revenue_experiment import RevenueExperimentEngine
from app.models.models import Store, Product, BusinessEvent

class DemoScenarioRunner:
    def __init__(self, db: Session):
        self.db = db
        self.decision_engine = RevenueDecisionEngine(db)
        self.failure_engine = FailureRecoveryEngine(db)
        self.experiment_engine = RevenueExperimentEngine(db)

    def run_scenario(self, scenario_id: int) -> Dict[str, Any]:
        """
        Executes one of four deterministic demo scenarios:
        1. IT Park Sunday/Public Holiday Milk
        2. Fresh Juice Expiry
        3. Unexpected Demand Spike
        4. Forecast Failure Recovery
        """
        if scenario_id == 1:
            # Scenario 1: IT Park Sunday/Public Holiday Milk
            # Store 1 is TechPark Central (IT Park)
            res = self.decision_engine.analyze(store_id=1, target_date_str="2025-12-31")
            res["scenario_id"] = 1
            res["scenario_name"] = "IT Park Sunday / Public Holiday Milk Reorder"
            res["story"] = (
                "Merchant normally orders 200 milk units for weekdays. Tomorrow is a public holiday at an IT Park store. "
                "The system detects historical 48% demand reduction on holidays, forecasts demand of ~108–120 units, "
                "simulates DO_NOTHING vs ORDER_100 vs ORDER_150 vs ORDER_200, and dynamically selects the option maximizing expected profit."
            )
            return res

        elif scenario_id == 2:
            # Scenario 2: Fresh Juice Expiry
            exp_res = self.experiment_engine.run_experiment("EXP-JUICE-EXPIRY", store_id=1)
            exp_res["scenario_id"] = 2
            exp_res["scenario_name"] = "Fresh Juice Expiry Recovery"
            exp_res["story"] = (
                "Fresh Juice has 2 days remaining shelf life with 100 units in stock. System compares NO_DISCOUNT, 10% DISCOUNT, "
                "and 20% DISCOUNT. It dynamically selects 10% discount because 20% reduces waste slightly more but destroys excessive gross margin."
            )
            return exp_res

        elif scenario_id == 3:
            # Scenario 3: Unexpected Demand Spike
            # Simulate high velocity event demand
            p = self.db.query(Product).filter(Product.id == 1).first()
            p_name = p.name if p else "Organic Milk"
            
            # Dynamic forecast adaptation logic
            historical_avg = 100
            recent_velocity = 170
            adapted_forecast = 175

            candidates = [
                {"action_name": "DO_NOTHING", "label": "Maintain standard 100 unit order", "expected_sales": 100.0, "expected_revenue": 3500.0, "expected_gross_profit": 1500.0, "stockout_probability": 0.43, "waste_probability": 0.0, "cash_locked": 2000.0, "action_risk_level_num": 0.05},
                {"action_name": "ORDER_180", "label": "Increase order to 180 units (Adapted)", "expected_sales": 172.0, "expected_revenue": 6020.0, "expected_gross_profit": 2420.0, "stockout_probability": 0.05, "waste_probability": 0.04, "cash_locked": 3600.0, "action_risk_level_num": 0.20}
            ]
            scored = self.decision_engine.score_candidates(candidates)
            winner = scored[0]

            return {
                "scenario_id": 3,
                "scenario_name": "Unexpected Demand Spike Adaptation",
                "story": "Historical sales averaged 100 units/day, but recent demand velocity spiked to 170 units/day due to a local corporate event. System detects velocity shift, adapts forecast upward to 175 units, and recommends ordering 180 units to prevent stockouts.",
                "historical_baseline_demand": historical_avg,
                "recent_sales_velocity": recent_velocity,
                "adapted_forecast_demand": adapted_forecast,
                "winning_action": winner["label"],
                "scored_candidates": scored,
                "why_this_decision": {
                    "what_happened": f"Demand velocity for {p_name} spiked from 100 to 170 units/day.",
                    "why_opportunity": "Failing to adapt order size would cause severe stockouts (43% probability) and INR 2,520 lost sales.",
                    "what_expected": f"Ordering 180 units achieves INR {winner['expected_gross_profit']:,.2f} profit with <5% stockout risk.",
                    "what_if_do_nothing": "Ordering standard 100 units results in 43% stockout probability.",
                    "alternatives_simulated": ["DO_NOTHING (100 units)", "ORDER_180 (180 units)"],
                    "why_selected": "Selected ORDER_180 because it adapts dynamically to aggregate demand velocity.",
                    "policy_applied": "Medium Risk Tier. Requires merchant approval."
                }
            }

        elif scenario_id == 4:
            # Scenario 4: Forecast Failure Recovery
            failure_res = self.failure_engine.handle_stale_forecast_failure(store_id=1, product_id=1)
            failure_res["scenario_id"] = 4
            failure_res["scenario_name"] = "Stale Forecast Detection & Fallback Recovery"
            failure_res["story"] = (
                "System detects that forecast input data is >48h old (stale forecast anomaly). It automatically halts unsafe automated "
                "action execution, records a FailureEvent, and safely switches to Recommendation-Only Fallback Mode while preserving the complete audit timeline."
            )
            return failure_res

        else:
            return {"error": f"Scenario {scenario_id} invalid. Must be 1, 2, 3, or 4."}
