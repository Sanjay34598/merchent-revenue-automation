import numpy as np

def calculate_scenario_metrics(order_qty: int, current_stock: int, unit_cost: float, selling_price: float, 
                               shelf_life_days: int, demand_samples: np.ndarray) -> dict:
    """
    Calculates detailed financial and operational simulation metrics across a sample array of simulated demand.
    """
    total_available = current_stock + order_qty
    cash_locked = round(order_qty * unit_cost, 2)

    sales_samples = np.minimum(total_available, demand_samples)
    stockout_units = np.maximum(0, demand_samples - total_available)
    leftover_samples = np.maximum(0, total_available - demand_samples)

    expected_sales = float(np.mean(sales_samples))
    stockout_prob = float(np.mean(demand_samples > total_available))
    
    expected_revenue = float(expected_sales * selling_price)
    expected_cogs = float(expected_sales * unit_cost)
    expected_gross_profit = expected_revenue - expected_cogs

    # Expiry waste calculation for short shelf life items
    if shelf_life_days <= 5:
        waste_prob = float(np.mean(leftover_samples > (expected_sales * 0.5)))
        expected_waste_units = float(np.mean(np.maximum(0, leftover_samples - (expected_sales * 0.3))))
    else:
        waste_prob = 0.0
        expected_waste_units = 0.0

    expected_waste_cost = float(expected_waste_units * unit_cost)
    expected_contribution = expected_gross_profit - expected_waste_cost

    return {
        "order_quantity": order_qty,
        "available_stock": total_available,
        "cash_locked": cash_locked,
        "expected_sales": round(expected_sales, 1),
        "stockout_probability": round(stockout_prob, 3),
        "expected_stockout_units": round(float(np.mean(stockout_units)), 1),
        "expected_leftover_inventory": round(float(np.mean(leftover_samples)), 1),
        "expiry_risk_probability": round(waste_prob, 3),
        "expected_waste_units": round(expected_waste_units, 1),
        "expected_waste_cost": round(expected_waste_cost, 2),
        "expected_revenue": round(expected_revenue, 2),
        "expected_gross_profit": round(expected_gross_profit, 2),
        "expected_contribution": round(expected_contribution, 2),
        "profit_std_dev": round(float(np.std(sales_samples * (selling_price - unit_cost))), 2)
    }
