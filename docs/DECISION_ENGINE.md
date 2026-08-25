# MerchIntell — Autonomous Decision & Recommendation Engine

## Overview

The **Autonomous Decision Engine** ([backend/app/api/autopilot.py](file:///c:/Users/PK/razorpay/merchent-revenue-automation/backend/app/api/autopilot.py)) evaluates potential merchant interventions for identified revenue leaks and recommends the optimal action.

---

## Multi-Objective Scoring Model

Candidate decisions (*Restock*, *Transfer Stock*, *Markdown*, *Do Nothing*) are evaluated across four normalized objective metrics:

$$\text{Total Score} = w_1 \cdot \hat{R} + w_2 \cdot \hat{M} + w_3 \cdot \hat{C} - w_4 \cdot \hat{X}$$

where:
- $\hat{R} = \text{Normalized Revenue Impact}$ ($w_1 = 0.40$)
- $\hat{M} = \text{Normalized Profit Margin Protection}$ ($w_2 = 0.30$)
- $\hat{C} = \text{Normalized Customer Retention Score}$ ($w_3 = 0.15$)
- $\hat{X} = \text{Normalized Execution Risk / Cost}$ ($w_4 = 0.15$)

---

## Candidate Interventions by Risk Type

| Risk Type | Candidate Action 1 | Candidate Action 2 | Candidate Action 3 | Default / Baseline |
|---|---|---|---|---|
| **STOCKOUT** | **Emergency Reorder**: Restock 50 units from supplier | **Stock Transfer**: Transfer 30 units from nearby store (`STR-1002`) | **Supplier Expedite**: Expedite shipment | **Do Nothing**: Suffer stockout |
| **OVERSTOCK** | **Targeted Clearance**: Apply 20% markdown | **Bundle Promotion**: Pair with high-velocity SKU | **Inter-Store Transfer**: Shift to high-demand outpost | **Do Nothing**: Hold stock |
| **EXPIRY_RISK** | **Flash Discount**: 30% markdown | **Promotional Push**: Highlight on front end | **Supplier Return**: Return unexpired inventory | **Do Nothing**: Scrapped loss |

---

## Autonomous Guardrails & Approval Workflow

1. **Human-in-the-Loop Approval**: High-impact actions (financial impact > ₹50,000 or reorder qty > 100) require explicit merchant approval via `POST /api/actions/{id}/approve`.
2. **Autonomous Execution**: Low-risk operational recommendations are queued for automated execution.
3. **Duplicate Prevention**: Reorder actions for the same SKU/Store combination within 7 days are flagged to prevent double-ordering.
4. **Learning Loop Feedback**: Executed action outcomes are recorded in SQLite (`merchant_autopilot.db`) to refine decision weights over time.
