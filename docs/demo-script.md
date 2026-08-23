# 90-Second Production Hackathon Demo Script

> **Project:** Merchant Revenue Autopilot  
> **Track:** Razorpay Buildathon — AI Growth & Agentic Commerce

---

## ⏱️ 0:00 – 0:10 | The Core Problem

> *"Merchants don't only lose money because payment checkout fails. They silently lose 5 to 15% of gross margin because business conditions change and their operational decisions don't."*

- **Visual**: Show Razorpay Merchant Control Center Overview page. Highlight **Identified Revenue Loss** vs **Recoverable Revenue**.

---

## ⏱ text 0:10 – 0:25 | Store Context & Pattern Discovery

> *"Take TechPark Central, a store located near an IT Park. On standard weekdays, Fresh Milk demand averages 200 units. But tomorrow is a public holiday."*

- **Visual**: Switch to **Revenue Leaks** view. Click `OPP-1-1-1` (Sunday/Holiday Milk Overstock). Show the Opportunity Detail Drawer displaying aggregate signals:
  - `"IT-park stores experience a 45–55% footfall reduction on public holidays."`

---

## ⏱ text 0:25 – 0:40 | Stockout-Aware Forecast & Status Quo Comparison

> *"Instead of blindly repeating the standard 200-unit order, our system forecasts demand at 110 units and compares intervention against doing nothing."*

- **Visual**: Switch to **AI Decision Center**. Point out the **"What would happen if we did nothing?"** card:
  - *Status Quo (DO_NOTHING)*: Planned order 200 units $\to$ 82 excess units $\to$ 41% waste risk.

---

## ⏱ text 0:40 – 0:55 | Multi-Action Simulation & Normalized Scoring

> *"The simulator tests candidate actions—DO_NOTHING, ORDER_100, ORDER_150, ORDER_200—using Monte Carlo draws. It normalizes profit, stockout risk, waste risk, and cash locked to choose the option with highest net merchant value."*

- **Visual**: Highlight the **Multi-Action Simulation Comparison** table:
  - `ORDER_150` selected (Score: `0.785`) over `ORDER_200` and `DO_NOTHING`.

---

## ⏱ text 0:55 – 1:05 | Explainability & Rejection Analysis

> *"Every recommendation provides structured answers to seven core business questions, plus an explicit 'WHY NOT THE OTHER OPTIONS?' section."*

- **Visual**: Scroll to **WHY NOT THE OTHER OPTIONS?**:
  - `ORDER_200`: Rejected due to excessive cash lock & waste risk.
  - `DO_NOTHING`: Rejected due to projected waste cost.

---

## ⏱ text 1:05 – 1:15 | Policy-Gated Sign-Off & Safe MOCK Execution

> *"No action executes automatically without merchant approval. Once approved, execution runs safely in MOCK mode."*

- **Visual**: Click **Approve Action** $\to$ Click **Execute (MOCK)**. Show feedback banner: `Action #1 executed safely in MOCK mode`.

---

## ⏱ text 1:15 – 1:25 | Outcome Measurement & Confidence Calibration

> *"After execution, the system compares predicted vs actual profit recovery to calibrate model confidence for future decisions."*

- **Visual**: Switch to **Recovered Revenue** view. Show **Total Profit Recovered**, **Mean Prediction Error %**, and **Calibrated Base Confidence**.

---

## ⏱ text 1:25 – 1:30 | Closing Mission Statement

> *"Merchant Revenue Autopilot doesn't just report what happened. It decides what should happen next—safely, explainably, and based on measurable merchant outcomes."*

- **Visual**: Return to Overview page. Highlight the complete **10-Stage Audit Timeline**.
