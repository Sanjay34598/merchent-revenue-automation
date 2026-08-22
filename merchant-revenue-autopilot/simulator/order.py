import numpy as np
from simulator.metrics import calculate_scenario_metrics

def simulate_order_scenarios(current_stock: int, unit_cost: float, selling_price: float, 
                             shelf_life_days: int, expected_demand_mean: float, forecast_std: float,
                             order_quantities: list = None, num_simulations: int = 1000, seed: int = 42) -> list:
    """
    Runs reproducible Monte Carlo demand simulations across candidate order quantities.
    """
    if order_quantities is None:
        order_quantities = [50, 100, 150, 200, 250]

    np.random.seed(seed)
    
    # Generate Monte Carlo demand samples from truncated normal distribution
    demand_samples = np.random.normal(loc=expected_demand_mean, scale=forecast_std, size=num_simulations)
    demand_samples = np.maximum(0, np.round(demand_samples))

    scenarios = []
    for qty in order_quantities:
        metrics = calculate_scenario_metrics(
            order_qty=qty,
            current_stock=current_stock,
            unit_cost=unit_cost,
            selling_price=selling_price,
            shelf_life_days=shelf_life_days,
            demand_samples=demand_samples
        )
        scenarios.append(metrics)

    return scenarios
