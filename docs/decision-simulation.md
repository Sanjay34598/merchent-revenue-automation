# Decision Simulator Engine

## Overview
The Decision Simulator Engine (`simulator/`) models business decisions (inventory reorders and promotional discounts) prior to execution using Monte Carlo probabilistic demand distributions and strict policy guardrails.

---

## 🎲 Monte Carlo Order Simulation (`simulator/order.py`)
Runs $N=1,000$ (or $10,000$) demand simulations sampled from a truncated normal distribution $\mathcal{N}(\mu_{\text{forecast}}, \sigma_{\text{forecast}})$.

For each candidate order quantity ($Q \in [50, 100, 150, 200, 250]$):
- **Expected Sales**: $\mathbb{E}[\min(S_{\text{stock}} + Q, D)]$
- **Stockout Probability**: $P(D > S_{\text{stock}} + Q)$
- **Expected Leftover Stock**: $\mathbb{E}[\max(0, S_{\text{stock}} + Q - D)]$
- **Expected Contribution**: $\text{Expected Gross Profit} - \text{Expected Expiry Waste Cost}$

---

## 🏷️ Discount Scenario Simulation (`simulator/discount.py`)
Evaluates candidate discount percentages ($0\%, 5\%, 10\%, 15\%, 20\%$) using category-specific price elasticity multipliers ($\text{Elasticity} = 2.2$ for short shelf-life items, $1.2$ for durable items).

---

## 🛡️ Policy Guardrail Constraints (`simulator/constraints.py`)
Every simulated decision option must pass:
1. `max_order_quantity`: Maximum allowed order units (default: 500).
2. `max_cash_exposure`: Maximum capital commitment (default: INR 50,000).
3. `min_gross_margin_percent`: Minimum gross margin percentage (default: 10%).
4. `max_discount_percent`: Maximum promotional discount (default: 30%).
5. `confidence_threshold`: Minimum forecast confidence (default: 0.70).
6. `max_stockout_probability`: Maximum acceptable stockout probability (default: 35%).

---

## 💬 Deterministic Business Explanation
The simulator produces structured, human-readable explanations based on empirical scenario metrics without relying on LLM calculations:

> *"Recommended order of 150 units for Milk (1L) at TechPark Central. Achieves highest expected gross contribution of INR 9,720.00 with acceptable stockout probability (7.2%) while limiting cash exposure to INR 3,750.00."*
