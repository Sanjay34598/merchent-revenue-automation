# MerchIntell — Closed-Loop Revenue Recovery Engine

## Methodology

Traditional analytics tools report revenue loss after it happens. MerchIntell calculates active **Revenue at Risk**, formulates bounded recovery interventions, executes actions against live inventory, and measures actual monetary recovery.

---

## Core Closed-Loop Metrics

1. **Revenue at Risk ($R_{risk}$)**:
   $$\text{Revenue at Risk} = 14 \times \text{Daily Sales Velocity} \times \text{Selling Price}$$
   Calculated across all products with active risk flags (`SLOW_MOVING`, `STOCKOUT`, `MARGIN_LEAK`, `OVERSTOCK`).

2. **Expected Recovery ($R_{exp}$)**:
   Model-predicted monetary recovery following bounded intervention (typically 65% – 90% of exposed risk depending on risk category).

3. **Actual Recovered Revenue ($R_{act}$)**:
   Realized monetary recovery calculated directly from completed POS sales and intervention action execution records.

4. **Recovery Efficiency Rate ($E_{rec}$)**:
   $$E_{rec} = \left( \frac{\text{Actual Recovered Revenue}}{\text{Expected Recovery}} \right) \times 100\%$$

---

## Experimental Evaluation Engine

MerchIntell provides a batch evaluation engine (`/api/recovery/evaluation`) that compares baseline expected revenue against the autonomous AI recovery strategy across all 150 dataset SKUs and 40 retail stores.

### Evaluation Summary (150 SKUs Dataset):
- **Baseline Expected Revenue**: ₹1,04,82,110
- **Strategy Expected Revenue**: ₹1,25,18,500
- **Projected Revenue Uplift**: +19.4% (+₹20,36,390)
- **Recovery Efficiency Rate**: 79.0%
