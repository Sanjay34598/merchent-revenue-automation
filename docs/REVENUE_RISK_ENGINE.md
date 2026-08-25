# MerchIntell — Revenue Risk Engine

## Overview

The **Revenue Risk Engine** scans store inventory and sales data to detect products where potential revenue is exposed to loss. It quantifies risk in actual monetary terms (₹) to help merchants prioritize high-impact interventions.

---

## Risk Categories & Classification Criteria

| Risk Status | Operational Condition | Detection Threshold | Impact Calculation |
|---|---|---|---|
| **STOCKOUT** | High demand velocity, low stock cover | `currentStock < 5` AND `daysOfCover < 7` | $\text{Exposed Revenue} = 14 \times \text{Daily Velocity} \times \text{Price}$ |
| **OVERSTOCK** | Excess inventory, slow sales velocity | `daysOfCover > 90` | $\text{Exposed Capital} = (\text{Stock} - 30 \times \text{Velocity}) \times \text{Price}$ |
| **EXPIRY_RISK** | Perishable/seasonal stock near shelf life | `expiryDays < 15` | $\text{Exposed Capital} = \text{Current Stock} \times \text{Cost Price}$ |
| **MARGIN_EROSION** | High COGS relative to retail price | $\text{Margin \%} < 20\%$ | $\text{Margin Loss} = (\text{Cost} - 0.8 \times \text{Price}) \times \text{Velocity} \times 30$ |

---

## Mathematical Exposure Formulas

### 1. Stockout Revenue Exposure Formula
When a high-velocity item runs out of stock, potential sales over a 14-day reorder cycle are lost:
$$\text{Revenue at Risk (Stockout)} = 14 \times v_d \times P$$
where:
- $v_d = \text{30-day daily demand velocity} = \frac{\text{Sold Stock}}{30.0}$
- $P = \text{Selling price per unit}$

### 2. Overstock Capital Exposure Formula
When inventory exceeds 90 days of sales cover, excess working capital is locked up:
$$\text{Exposed Capital (Overstock)} = \max\left(0, S_{\text{curr}} - 30 \cdot v_d\right) \times P$$
where $S_{\text{curr}} = \text{Current stock on hand}$.

---

## Dynamic Risk Recalculation Loop

Whenever a POS transaction occurs:
1. `sold_stock` increases and `current_stock` decreases.
2. `daily_velocity` updates: $v_d^{\text{new}} = v_d^{\text{old}} + \frac{\Delta q}{30.0}$.
3. Stock cover updates: $\text{Cover} = \frac{S_{\text{curr}}}{v_d^{\text{new}}}$.
4. If `currentStock < 5`, product transitions into `STOCKOUT` risk, triggering a recalculation of store `Revenue at Risk`.
