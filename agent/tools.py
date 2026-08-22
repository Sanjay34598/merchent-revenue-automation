from datetime import date, timedelta
from app.models.models import Store, Product, DailySales, InventorySnapshot, AgentAction, FailureEvent, ActionOutcome
from forecasting.demand import DemandForecaster
from profit_leakage.detector import ProfitLeakageDetector
from simulator.engine import DecisionSimulatorEngine
from simulator.constraints import PolicyGuardrails

class AgentToolRegistry:
    def __init__(self, db):
        self.db = db
        self.forecaster = DemandForecaster(db)
        self.leak_detector = ProfitLeakageDetector(db)
        self.simulator = DecisionSimulatorEngine(db)
        self.guardrails = PolicyGuardrails()

    def get_store_state(self, store_id: int) -> dict:
        store = self.db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return {"error": f"Store {store_id} not found."}
        
        products_count = self.db.query(Product).count()
        leaks_summary = self.leak_detector.get_opportunity_summary(store_id=store_id)
        
        return {
            "store_id": store.id,
            "store_name": store.name,
            "location_type": store.location_type,
            "city": store.city,
            "products_count": products_count,
            "total_leakage_opportunity": leaks_summary["total_estimated_opportunity"],
            "top_opportunity_count": leaks_summary["total_opportunities_count"]
        }

    def get_product_history(self, store_id: int, product_id: int) -> dict:
        sales = self.db.query(DailySales).filter(
            DailySales.store_id == store_id,
            DailySales.product_id == product_id
        ).order_by(DailySales.date.desc()).limit(14).all()

        return {
            "store_id": store_id,
            "product_id": product_id,
            "recent_14d_sales": [
                {
                    "date": s.date.isoformat(),
                    "quantity_sold": s.quantity_sold,
                    "selling_price": s.selling_price,
                    "revenue": s.revenue,
                    "gross_profit": s.gross_profit
                } for s in sales
            ]
        }

    def forecast_demand(self, store_id: int, product_id: int, target_date_str: str = None) -> dict:
        target_dt = date.fromisoformat(target_date_str) if target_date_str else date(2025, 12, 31)
        return self.forecaster.predict_demand(store_id, product_id, target_dt)

    def detect_profit_leaks(self, store_id: int = None) -> list:
        return self.leak_detector.detect_all_opportunities(store_id=store_id)

    def get_inventory(self, store_id: int, product_id: int) -> dict:
        inv = self.db.query(InventorySnapshot).filter(
            InventorySnapshot.store_id == store_id,
            InventorySnapshot.product_id == product_id,
            InventorySnapshot.date == date(2025, 12, 31)
        ).first()

        if not inv:
            return {"closing_inventory": 0, "stockout_flag": False}

        return {
            "store_id": store_id,
            "product_id": product_id,
            "opening_inventory": inv.opening_inventory,
            "received_quantity": inv.received_quantity,
            "closing_inventory": inv.closing_inventory,
            "stockout_flag": inv.stockout_flag
        }

    def simulate_order(self, store_id: int, product_id: int, order_quantities: list = None) -> dict:
        return self.simulator.run_order_simulation(store_id, product_id, order_quantities)

    def simulate_discount(self, store_id: int, product_id: int, discount_percentages: list = None) -> dict:
        return self.simulator.run_discount_simulation(store_id, product_id, discount_percentages)

    def check_constraints(self, action_type: str, parameters: dict) -> dict:
        if action_type == "ORDER":
            return self.guardrails.validate_order(
                order_qty=parameters.get("order_quantity", 0),
                cash_locked=parameters.get("cash_locked", 0.0),
                stockout_prob=parameters.get("stockout_probability", 0.0),
                confidence=parameters.get("confidence", 0.80)
            )
        elif action_type == "DISCOUNT":
            return self.guardrails.validate_discount(
                discount_percent=parameters.get("discount_percent", 0.0),
                gross_margin_percent=parameters.get("gross_margin_percent", 20.0),
                confidence=parameters.get("confidence", 0.80)
            )
        return {"allowed": True, "violations": []}

    def get_recent_outcomes(self, store_id: int = None) -> list:
        outcomes = self.db.query(ActionOutcome).all()
        return [
            {
                "id": o.id,
                "action_id": o.action_id,
                "actual_impact": o.actual_impact,
                "predicted_impact": o.predicted_impact,
                "variance": o.variance,
                "evaluated_at": o.evaluated_at.isoformat() if o.evaluated_at else None
            } for o in outcomes
        ]

    def get_failure_history(self) -> list:
        failures = self.db.query(FailureEvent).all()
        return [
            {
                "id": f.id,
                "failure_type": f.failure_type,
                "possible_cause": f.possible_cause,
                "recovery_action": f.recovery_action,
                "created_at": f.created_at.isoformat() if f.created_at else None
            } for f in failures
        ]

    def propose_action(self, store_id: int, action_type: str, recommendation: str, 
                       agent_reasoning: str, evidence: dict, expected_outcome: dict, 
                       confidence: float, risk_level: str) -> AgentAction:
        action = AgentAction(
            store_id=store_id,
            action_type=action_type,
            recommendation=recommendation,
            agent_reasoning=agent_reasoning,
            tool_calls={"tools_used": ["detect_profit_leaks", "forecast_demand", "simulate_order"]},
            evidence=evidence,
            expected_outcome=expected_outcome,
            confidence=confidence,
            risk_level=risk_level,
            status="PENDING"
        )
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        return action
