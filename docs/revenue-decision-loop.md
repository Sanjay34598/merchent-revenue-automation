# Revenue Decision Loop Architecture

The **Closed-Loop Merchant Growth Autopilot** automates revenue recovery through a continuous 12-step decision cycle:

```
OBSERVE
  ↓
DETECT REVENUE LEAK
  ↓
FORECAST DEMAND
  ↓
SIMULATE POSSIBLE ACTIONS
  ↓
COMPARE AGAINST DO_NOTHING
  ↓
CHOOSE BEST ACTION
  ↓
CHECK POLICY / RISK
  ↓
REQUEST APPROVAL IF REQUIRED
  ↓
EXECUTE SAFE TEST-MODE ACTION
  ↓
MEASURE ACTUAL OUTCOME
  ↓
COMPARE PREDICTED VS ACTUAL
  ↓
LEARN FROM RESULT
```

---

## 1. Aggregate Business Pattern Recognition
- **No Customer Tracking**: The engine reasons strictly from aggregate sales velocity, store type (IT Park, Residential, Commercial), day of week, public holidays, inventory snapshots, supplier constraints, and cross-product co-movement.
- **Product Relationships**: Captures positive demand correlation (e.g. Fresh Milk and Artisan Bread) without inferring individual customer identities or causation.

---

## 2. Multi-Action Generation & Mandatory `DO_NOTHING`
- Every decision candidate generation includes `DO_NOTHING` (Status Quo).
- Action candidates include:
  - **Inventory**: `DO_NOTHING`, `ORDER_100`, `ORDER_150`, `ORDER_200`, `REDUCE_ORDER`.
  - **Pricing/Expiry**: `DO_NOTHING` / `NO_DISCOUNT`, `DISCOUNT_5`, `DISCOUNT_10`, `DISCOUNT_20`.

---

## 3. Transparent Normalized Multi-Objective Scoring
To ensure no single metric dominates due to arbitrary scale, all candidate metrics are normalized to $[0, 1]$ before weighted combination:

$$\text{Overall Score} = w_1 \cdot \text{Norm}(\text{Gross Profit}) - w_2 \cdot \text{Norm}(\text{Stockout Risk}) - w_3 \cdot \text{Norm}(\text{Waste Risk}) - w_4 \cdot \text{Norm}(\text{Cash Locked}) - w_5 \cdot \text{Norm}(\text{Action Risk})$$

### Default Weights:
- $w_1 = 0.40$ (Gross Profit Recovery)
- $w_2 = 0.25$ (Stockout Risk Protection)
- $w_3 = 0.15$ (Waste Risk Mitigation)
- $w_4 = 0.10$ (Cash Exposure Limit)
- $w_5 = 0.10$ (Action Risk Level)

`DO_NOTHING` is scored identically to intervention candidates and can win whenever intervention risks/costs exceed expected gains.

---

## 4. Structured "WHY THIS DECISION?" Explanation
Every recommendation provides answers to 7 core questions:
1. **What happened?**
2. **Why is this a revenue opportunity?**
3. **What does the system expect to happen?**
4. **What happens if we do nothing?**
5. **What alternatives were simulated?**
6. **Why was this action selected?**
7. **What risk/policy constraint applies?**

In addition, an explicit **"WHY NOT THE OTHER OPTIONS?"** section details why each rejected candidate lost.
