# Demand Intelligence Engine

## Philosophy: Aggregate Signals over Individual Tracking
Merchant Revenue Autopilot intentionally avoids tracking individual customers or personally identifiable information (PII). Real-world retail decision-making relies on aggregate contextual signals:

$$\text{PRODUCT} + \text{STORE LOCATION} + \text{DATE} + \text{PRICE} + \text{DISCOUNT} + \text{EVENTS}$$

---

## 📈 Baseline Demand Forecasting
The forecasting engine (`forecasting/demand.py`) calculates baseline demand using deterministic statistical models combining:
- Same weekday historical average ($60\%$ weight)
- 30-day unconstrained mean ($40\%$ weight)
- Store location multiplier (IT-park Sunday drop vs Residential weekend boost)
- Business event multipliers (Holidays, heatwaves, heavy rain)

---

## 📊 Structured Forecast Schema
Each prediction returns:
- `expected_demand`: Point forecast
- `lower_bound` & `upper_bound`: 88% confidence interval range
- `confidence`: Confidence score (0.0 to 1.0)
- `stockout_adjusted`: Boolean flag
- `drivers`: List of contextual explanatory factors
