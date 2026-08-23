# Merchant Revenue Autopilot

> **Track:** Razorpay Buildathon — AI Growth & Agentic Commerce

A production-quality AI-powered revenue autopilot system that understands aggregate business patterns, forecasts stockout-censored demand, simulates multi-action business decisions against status-quo (`DO_NOTHING`), enforces policy-gated autonomy, executes merchant-approved test-mode actions, measures actual outcomes, and continuously learns from prediction errors.

---

## 🎯 Core Problem Statement & Mission

> **"Merchants don't need another dashboard telling them what happened. They need a system that understands what is likely to happen next, evaluates what they could do about it, and determines which action creates the best expected business outcome."**

Retail merchants silently lose 5–15% of annual gross margin to avoidable operational inefficiencies:
- **Context-Blind Demand Drops:** Reacting to normal weekday order sizes when upcoming holidays or weekend patterns at IT-park stores drop footfall by 50%+.
- **Uncaptured Stockouts:** Demand exists, but sales drop to zero when stock hits zero. Standard models wrongly infer zero demand.
- **Overstock & Locked Cash:** Capital tied up in excess slow-moving inventory.
- **Perishable Expiry Waste:** Perishable items expiring before sale due to poor discount timing or excess order sizes.

---

## 🔄 Phase 5 Closed-Loop Autopilot Architecture

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

### Key Product Principles:
1. **No Individual Customer Tracking**: Reasons strictly from aggregate store patterns (sales velocity, store context, day of week, public holidays, inventory velocity, supplier lead time, cross-product demand correlation). Zero customer tracking or PII profiling.
2. **Mandatory DO_NOTHING Candidate**: Every decision candidate generation includes `DO_NOTHING`. `DO_NOTHING` is scored identically to intervention candidates and can win whenever intervention costs exceed expected value.
3. **Normalized Multi-Objective Scoring**: Normalizes expected profit, stockout risk, waste risk, cash locked, and action risk to $[0, 1]$ before weighted combination.
4. **Structured "WHY THIS DECISION?" Breakdown**: Every decision provides 7 structured answers (What happened?, Why opportunity?, Expected outcome?, What if DO NOTHING?, Alternatives simulated?, Why selected?, Policy/risk applied?) plus explicit "WHY NOT THE OTHER OPTIONS?" rejection explanations.
5. **Strict MOCK / RAZORPAY_TEST_MODE Execution**: All financial action execution runs strictly in mock or Razorpay test mode. No real money or live payment API calls.
6. **Failure Recovery & Safe Fallback**: Detects 7 controlled failure modes (`API_TIMEOUT`, `RAZORPAY_API_FAILURE`, `DUPLICATE_ACTION`, `POLICY_REJECTION`, `INSUFFICIENT_INVENTORY`, `STALE_FORECAST`, `INVALID_ACTION`), blocks duplicate retries, and safely falls back to recommendation-only mode.

---

## 🏛️ System Architecture

```
                               ┌───────────────────────────┐
                               │ Razorpay Merchant Control │
                               │ Center UI (React + Vite)  │
                               └─────────────┬─────────────┘
                                             │ REST API
                               ┌─────────────▼─────────────┐
                               │     FastAPI Backend       │
                               └──────┬─────────────┬──────┘
                                      │             │
                    ┌─────────────────▼──┐       ┌──▼───────────────────┐
                    │ AI Decision Engine │       │ Deterministic Engine │
                    │ (Opportunity,      │       │ • Stockout Forecast  │
                    │  Unified Engine,   │       │ • Multi-Objective    │
                    │  Experiments)      │       │   Simulator          │
                    └────────────────────┘       │ • Policy Guardrails  │
                                                 └──────────┬───────────┘
                                                            │
                                                 ┌──────────▼───────────┐
                                                 │ PostgreSQL / SQLite  │
                                                 │ (15 ORM Entities)    │
                                                 └──────────────────────┘
```

---

## 📊 Database Schema (15 Core Entities)

1. `Merchant` — Top-level merchant account
2. `Store` — Retail location context (e.g. IT_PARK, RESIDENTIAL, COMMERCIAL)
3. `Supplier` — Vendor details and lead time tracking
4. `Product` — Catalog item with unit cost, selling price, and shelf life
5. `DailySales` — Historical sales transactions, pricing, and gross margin
6. `InventorySnapshot` — Daily opening/closing stock levels & stockout flags
7. `Discount` — Active and historical promotional campaigns
8. `BusinessEvent` — Contextual events (holidays, weather, festivals, office closures)
9. `Forecast` — Stockout-adjusted baseline demand predictions
10. `ProfitLeak` — Categorized monetary leakage findings with evidence
11. `Simulation` — Pre-execution scenario simulation results
12. `AgentAction` — Proposed automated or semi-automated actions
13. `ActionApproval` — Merchant approval/rejection audit record
14. `ActionOutcome` — Post-execution variance analysis (Predicted vs Actual)
15. `FailureEvent` — System and model failure tracking for self-correction

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Backend Setup & Run
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification

Run full backend test suite:
```bash
python -m pytest tests/ -v
```

Build frontend production bundle:
```bash
cd frontend
npm run build
```

---

## 📅 Completed Phases

- [x] **Phase 1: Foundation** — DB entities, FastAPI backend, React UI, health endpoints.
- [x] **Phase 2: Realistic Merchant Data Intelligence** — 12-month aggregate dataset (21,900 sales records across 3 store locations & 20 products), stockout-censored demand estimation, baseline forecaster.
- [x] **Phase 3: Profit Leakage Engine & Decision Simulator** — 5-category leakage detector, Monte Carlo decision simulator (order & discount), policy guardrails.
- [x] **Phase 4: AI Revenue Decision Agent & Policy Approvals** — Tool-calling agent, provider abstraction, policy approval workflow, audit trail, conversational interface.
- [x] **Phase 5: Closed-Loop Merchant Growth Autopilot** — Unified Revenue Opportunity Engine, Multi-Objective Normalized Scoring, Mandatory `DO_NOTHING` candidate, 10-stage audit timeline UI, Revenue Experiments framework, Action Executor (MOCK & RAZORPAY_TEST_MODE), Evidence-Based Learning loop, Failure Recovery system, 4 Deterministic Demo Scenarios, 9-view Razorpay Merchant Control Center UI.
