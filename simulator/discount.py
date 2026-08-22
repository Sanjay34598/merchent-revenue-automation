import numpy as np

def simulate_discount_scenarios(base_demand: float, unit_cost: float, selling_price: float, 
                                shelf_life_days: int, current_stock: int, 
                                discount_percentages: list = None, seed: int = 42) -> list:
    """
    Simulates promotional and clearance discount scenarios to quantify revenue vs margin trade-offs.
    """
    if discount_percentages is None:
        discount_percentages = [0.0, 5.0, 10.0, 15.0, 20.0]

    np.random.seed(seed)
    scenarios = []

    elasticity = 2.2 if shelf_life_days <= 5 else 1.2

    for disc in discount_percentages:
        eff_price = round(selling_price * (1.0 - disc / 100.0), 2)
        unit_margin = eff_price - unit_cost
        margin_pct = (unit_margin / eff_price * 100.0) if eff_price > 0 else 0.0

        # Demand lift multiplier
        demand_lift = 1.0 + (disc / 100.0) * elasticity
        expected_demand = base_demand * demand_lift

        expected_sales = min(current_stock, expected_demand)
        expected_revenue = round(expected_sales * eff_price, 2)
        expected_gross_profit = round(expected_sales * unit_margin, 2)

        # Waste reduction for short shelf-life items
        leftover = max(0, current_stock - expected_sales)
        expected_waste = leftover if shelf_life_days <= 5 else 0
        expected_waste_cost = round(expected_waste * unit_cost, 2)

        net_contribution = round(expected_gross_profit - expected_waste_cost, 2)

        scenarios.append({
            "discount_percent": disc,
            "effective_price": eff_price,
            "unit_margin": round(unit_margin, 2),
            "gross_margin_percent": round(margin_pct, 1),
            "expected_demand": round(expected_demand, 1),
            "expected_sales": round(expected_sales, 1),
            "expected_revenue": expected_revenue,
            "expected_gross_profit": expected_gross_profit,
            "expected_waste_cost": expected_waste_cost,
            "net_contribution": net_contribution
        })

    return scenarios
