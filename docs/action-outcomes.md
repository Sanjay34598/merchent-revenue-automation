# Action Outcomes & Evidence-Based Learning

The **Closed-Loop Autopilot** closes the loop by comparing predicted performance against empirical post-execution metrics.

---

## 1. Measured Outcome Metrics

For every executed action, `ActionOutcome` captures:
- `predicted_impact` (Predicted Gross Profit)
- `actual_impact` (Actual Gross Profit realized)
- `variance` ($\text{Actual} - \text{Predicted}$)
- `prediction_error_pct` ($\frac{|\text{Actual} - \text{Predicted}|}{\text{Predicted}} \times 100\%$)
- `revenue_recovered`
- `profit_recovered`
- `waste_avoided_units`
- `stockouts_avoided_units`

---

## 2. Confidence Calibration Loop

The system adjusts base model confidence dynamically using historical mean prediction error:

- **Mean Error $\le 5\%$**: Confidence bonus $+0.05$ (e.g. $85\% \to 90\%$)
- **Mean Error $5\% - 10\%$**: Confidence bonus $+0.03$
- **Mean Error $10\% - 20\%$**: Neutral calibration
- **Mean Error $> 20\%$**: Confidence penalty $-0.05$

This ensures future decision simulations use realistic historical performance evidence rather than static confidence values.
