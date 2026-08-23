# Phase 5 Deterministic Demo Scenarios Guide

The platform includes four deterministic demo scenarios runnable from the UI or via `POST /api/autopilot/demo/run`.

---

## Scenario 1: IT Park Sunday / Public Holiday Milk Reorder
- **Context**: TechPark Central store (IT Park location).
- **Baseline**: Normal weekday sales average 200 milk units/day.
- **Pattern**: Tomorrow is a Sunday public holiday. IT park office footfall drops ~50%.
- **Decision Engine**: Simulates `DO_NOTHING` (200 units), `ORDER_100`, `ORDER_150`, `ORDER_200`, `REDUCE_ORDER` (60 units).
- **Result**: Dynamically selects order quantity (~120-150 units) maximizing profit recovery while eliminating waste risk.

---

## Scenario 2: Fresh Juice Expiry Recovery
- **Context**: Short shelf-life product (Fresh Juice) with 2 days remaining and 100 units in stock.
- **Decision Engine**: Simulates `NO_DISCOUNT`, `DISCOUNT_10`, `DISCOUNT_20`.
- **Result**: Selects 10% discount because 20% discount reduces waste slightly more but destroys excessive gross margin.

---

## Scenario 3: Unexpected Demand Spike Adaptation
- **Context**: Historical sales averaged 100 units/day; recent velocity spiked to 170 units/day due to a local corporate event.
- **Decision Engine**: Detects velocity shift, adapts demand forecast upward to 175 units, and recommends ordering 180 units.
- **Result**: Prevents severe stockouts (43% probability under status quo).

---

## Scenario 4: Stale Forecast Detection & Fallback Recovery
- **Context**: Forecast dataset freshness exceeds maximum threshold (>48h old).
- **Decision Engine**: Detects anomaly, logs `FailureEvent` (`STALE_FORECAST`), halts automated execution safely, and switches to safe Recommendation-Only Fallback Mode while preserving the audit timeline.
