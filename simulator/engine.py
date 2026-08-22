from datetime import date, timedelta
from simulator.order import simulate_order_scenarios
from simulator.discount import simulate_discount_scenarios
from simulator.constraints import PolicyGuardrails
from forecasting.demand import DemandForecaster
from app.models.models import Product, Store, InventorySnapshot, Simulation

class DecisionSimulatorEngine:
    def __init__(self, db):
        self.db = db
        self.guardrails = PolicyGuardrails()
        self.forecaster = DemandForecaster(db)

    def run_order_simulation(self, store_id: int, product_id: int, order_quantities: list = None, num_simulations: int = 1000) -> dict:
        """
        Simulates order quantity scenarios, evaluates policy constraints, ranks options by contribution,
        and generates a deterministic business explanation.
        """
        product = self.db.query(Product).filter(Product.id == product_id).first()
        store = self.db.query(Store).filter(Store.id == store_id).first()

        if not product or not store:
            raise ValueError("Store or Product not found.")

        target_date = date(2025, 12, 31)
        inv = self.db.query(InventorySnapshot).filter(
            InventorySnapshot.store_id == store_id,
            InventorySnapshot.product_id == product_id,
            InventorySnapshot.date == target_date
        ).first()

        current_stock = inv.closing_inventory if inv else 0
        fc = self.forecaster.predict_demand(store_id, product_id, target_date + timedelta(days=1))
        expected_demand = fc["expected_demand"]
        confidence = fc["confidence"]
        forecast_std = expected_demand * 0.18

        if order_quantities is None:
            order_quantities = [50, 100, 150, 200, 250]

        raw_scenarios = simulate_order_scenarios(
            current_stock=current_stock,
            unit_cost=product.unit_cost,
            selling_price=product.selling_price,
            shelf_life_days=product.shelf_life_days,
            expected_demand_mean=expected_demand,
            forecast_std=forecast_std,
            order_quantities=order_quantities,
            num_simulations=num_simulations,
            seed=42
        )

        evaluated_scenarios = []
        best_scenario = None
        best_contribution = -float("inf")

        for sc in raw_scenarios:
            guardrail_res = self.guardrails.validate_order(
                order_qty=sc["order_quantity"],
                cash_locked=sc["cash_locked"],
                stockout_prob=sc["stockout_probability"],
                confidence=confidence
            )

            sc["policy_validation"] = guardrail_res

            if guardrail_res["allowed"] and sc["expected_contribution"] > best_contribution:
                best_contribution = sc["expected_contribution"]
                best_scenario = sc

            evaluated_scenarios.append(sc)

        # Fallback if all scenarios violated policy
        if not best_scenario:
            best_scenario = evaluated_scenarios[0]

        best_qty = best_scenario["order_quantity"]
        explanation = (
            f"Recommended order of {best_qty} units for {product.name} at {store.name}. "
            f"Achieves highest expected gross contribution of INR {best_scenario['expected_contribution']:,.2f} "
            f"with acceptable stockout probability ({best_scenario['stockout_probability']*100:.1f}%) "
            f"while limiting cash exposure to INR {best_scenario['cash_locked']:,.2f}."
        )

        simulation_result = {
            "store_id": store_id,
            "product_id": product_id,
            "store_name": store.name,
            "product_name": product.name,
            "current_stock": current_stock,
            "expected_demand_mean": expected_demand,
            "confidence": confidence,
            "recommended_order_quantity": best_qty,
            "recommended_scenario": best_scenario,
            "explanation": explanation,
            "scenarios": evaluated_scenarios
        }

        # Persist Simulation record
        db_sim = Simulation(
            store_id=store_id,
            product_id=product_id,
            simulation_type="ORDER",
            parameters={"order_quantities": order_quantities, "num_simulations": num_simulations},
            expected_sales=best_scenario["expected_sales"],
            expected_revenue=best_scenario["expected_revenue"],
            expected_gross_profit=best_scenario["expected_gross_profit"],
            stockout_probability=best_scenario["stockout_probability"],
            leftover_inventory=best_scenario["expected_leftover_inventory"],
            expiry_risk=best_scenario["expiry_risk_probability"],
            cash_locked=best_scenario["cash_locked"],
            expected_waste=best_scenario["expected_waste_cost"]
        )
        self.db.add(db_sim)
        self.db.commit()

        return simulation_result

    def run_discount_simulation(self, store_id: int, product_id: int, discount_percentages: list = None) -> dict:
        """
        Simulates promotional discount scenarios, evaluates margin thresholds, and returns optimal discount.
        """
        product = self.db.query(Product).filter(Product.id == product_id).first()
        store = self.db.query(Store).filter(Store.id == store_id).first()

        if not product or not store:
            raise ValueError("Store or Product not found.")

        target_date = date(2025, 12, 31)
        inv = self.db.query(InventorySnapshot).filter(
            InventorySnapshot.store_id == store_id,
            InventorySnapshot.product_id == product_id,
            InventorySnapshot.date == target_date
        ).first()

        current_stock = inv.closing_inventory if inv else 100
        fc = self.forecaster.predict_demand(store_id, product_id, target_date + timedelta(days=1))
        base_demand = fc["expected_demand"]
        confidence = fc["confidence"]

        if discount_percentages is None:
            discount_percentages = [0.0, 5.0, 10.0, 15.0, 20.0]

        raw_scenarios = simulate_discount_scenarios(
            base_demand=base_demand,
            unit_cost=product.unit_cost,
            selling_price=product.selling_price,
            shelf_life_days=product.shelf_life_days,
            current_stock=current_stock,
            discount_percentages=discount_percentages,
            seed=42
        )

        evaluated_scenarios = []
        best_scenario = None
        best_contribution = -float("inf")

        for sc in raw_scenarios:
            guardrail_res = self.guardrails.validate_discount(
                discount_percent=sc["discount_percent"],
                gross_margin_percent=sc["gross_margin_percent"],
                confidence=confidence
            )

            sc["policy_validation"] = guardrail_res

            if guardrail_res["allowed"] and sc["net_contribution"] > best_contribution:
                best_contribution = sc["net_contribution"]
                best_scenario = sc

            evaluated_scenarios.append(sc)

        if not best_scenario:
            best_scenario = evaluated_scenarios[0]

        best_disc = best_scenario["discount_percent"]
        explanation = (
            f"Recommended discount of {best_disc:.0f}% for {product.name} at {store.name}. "
            f"Achieves net contribution of INR {best_scenario['net_contribution']:,.2f} "
            f"while maintaining {best_scenario['gross_margin_percent']:.1f}% gross margin."
        )

        simulation_result = {
            "store_id": store_id,
            "product_id": product_id,
            "store_name": store.name,
            "product_name": product.name,
            "current_stock": current_stock,
            "base_demand": base_demand,
            "confidence": confidence,
            "recommended_discount_percent": best_disc,
            "recommended_scenario": best_scenario,
            "explanation": explanation,
            "scenarios": evaluated_scenarios
        }

        # Persist Simulation record
        db_sim = Simulation(
            store_id=store_id,
            product_id=product_id,
            simulation_type="DISCOUNT",
            parameters={"discount_percentages": discount_percentages},
            expected_sales=best_scenario["expected_sales"],
            expected_revenue=best_scenario["expected_revenue"],
            expected_gross_profit=best_scenario["expected_gross_profit"],
            stockout_probability=0.0,
            leftover_inventory=max(0, current_stock - best_scenario["expected_sales"]),
            expiry_risk=0.0,
            cash_locked=0.0,
            expected_waste=best_scenario["expected_waste_cost"]
        )
        self.db.add(db_sim)
        self.db.commit()

        return simulation_result
