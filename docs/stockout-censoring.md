# Stockout-Censored Demand Estimation

## The Censored Demand Fallacy
In standard retail analytics, naive models record:

$$\text{Inventory} = 0 \quad \text{and} \quad \text{Sales} = 120 \implies \text{Demand} = 120$$

This is mathematically false. When stock reaches 0, sales are **right-censored**. True unconstrained customer demand was likely 180–200 units, but the merchant ran out of inventory.

---

## 🛡️ How Merchant Revenue Autopilot Solves Censoring
In `forecasting/stockout.py`, `estimate_unconstrained_demand(...)`:

1. Identifies stockout days where `stockout_flag == True` or `closing_inventory == 0`.
2. Excludes stockout days from baseline average calculations to avoid downward bias.
3. Filters for historical **unconstrained** sales on matching days of the week.
4. Estimates unconstrained true demand:

```json
{
  "observed_sales": 120,
  "estimated_demand": 191.5,
  "stockout_constrained": true,
  "confidence": 0.84,
  "evidence": "Stockout flagged at 120 units. Historical unconstrained sales for weekday 0 average 191.5 units."
}
```
---

## 🎯 Evaluation Impact
Forecast evaluations (`forecasting/evaluation.py`) separate **sales forecast error** on unconstrained days from **demand estimation uncertainty** on stockout days, preventing models from penalizing true demand estimates.
