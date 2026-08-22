# AI Revenue Decision Agent & Policy Approval Architecture

## Overview
The AI Agent (`agent/`) operates as a bounded, tool-calling investigative intelligence layer. It connects forecasting models, profit leakage signals, and Monte Carlo decision simulations with human-in-the-loop merchant policy approvals.

---

## 🤖 Provider Abstraction Interface (`agent/provider.py`)
Decoupled from single LLM vendors via `AIProviderInterface`:
- **Providers**: `mock`, `openai`, `anthropic`, `gemini`.
- Fallback gracefully to deterministic tool reasoning when API credentials are absent.

---

## 🛠️ Tool Registry (`agent/tools.py`)
1. `get_store_state(store_id)`
2. `get_product_history(store_id, product_id)`
3. `forecast_demand(store_id, product_id, target_date)`
4. `detect_profit_leaks(store_id)`
5. `get_inventory(store_id, product_id)`
6. `simulate_order(store_id, product_id, order_quantities)`
7. `simulate_discount(store_id, product_id, discount_percentages)`
8. `check_constraints(action_type, parameters)`
9. `get_recent_outcomes(store_id)`
10. `get_failure_history()`
11. `propose_action(...)`

---

## 🔒 Policy Approval & Audit Trail Pipeline
Every agent proposal follows an immutable 6-stage lifecycle:

$$\text{Signal} \longrightarrow \text{Reasoning} \longrightarrow \text{Simulation} \longrightarrow \text{Recommendation} \longrightarrow \text{Merchant Approval} \longrightarrow \text{Outcome}$$

1. **Investigation**: Detects top profit leak & queries stockout-adjusted forecast.
2. **Simulation**: Evaluates candidate decisions across Monte Carlo demand distributions.
3. **Guardrails**: Verifies cash exposure, margin thresholds, and stockout probability.
4. **Proposal**: Persists record in `AgentAction` with status = `PENDING`.
5. **Human Gate**: Merchant explicitly calls `POST /api/actions/{id}/approve` or `POST /api/actions/{id}/reject`.
6. **Execution**: Action is never auto-executed without approval.
