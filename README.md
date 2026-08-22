# Merchant Revenue Autopilot

> **Track:** Razorpay Buildathon — AI Growth & Agentic Commerce

A production-quality AI-powered merchant decision system built to detect hidden revenue opportunities, quantify profit leakage, perform stockout-aware demand forecasting, simulate business decisions under financial guardrails, and execute merchant-approved automated actions.

---

## 🎯 Core Problem & Mission

Retail merchants silently lose 5–15% of annual gross margin to avoidable operational inefficiencies:
- **Uncaptured Stockouts:** Demand exists, but sales drop to zero when stock hits zero. Standard models wrongly infer zero demand.
- **Overstock & Locked Cash:** Capital tied up in excess slow-moving inventory.
- **Perishable Expiry Waste:** Inventory expiring before sale due to poor reorder timing.
- **Ineffective Discounts:** Discounts applied without marginal volume lift, eroding margin.
- **Context-Blind Demand Drops:** Ignoring local context (e.g. IT-park stores losing 60%+ weekend footfall).

**Merchant Revenue Autopilot** resolves these problems deterministically, placing an AI Agent in an investigative, tool-calling advisory role backed by strict financial policy guardrails and human merchant approval.

---

## 🏗️ System Architecture

```
                               ┌───────────────────────────┐
                               │   React + TS Frontend     │
                               │   (Vite + Tailwind CSS)   │
                               └─────────────┬─────────────┘
                                             │ REST API
                               ┌─────────────▼─────────────┐
                               │     FastAPI Backend       │
                               └──────┬─────────────┬──────┘
                                      │             │
                    ┌─────────────────▼──┐       ┌──▼───────────────────┐
                    │ AI Agent Engine    │       │ Deterministic Engine │
                    │ (LLM Provider      │       │ • Stockout Forecast  │
                    │  Abstraction)      │       │ • Decision Simulator │
                    └────────────────────┘       │ • Guardrail Engine   │
                                                 └──────────┬───────────┘
                                                            │
                                                 ┌──────────▼───────────┐
                                                 │ PostgreSQL / SQLite  │
                                                 │ (15 ORM Models)      │
                                                 └──────────────────────┘
```

### Key Architectural Principles
1. **Deterministic Numerics:** Forecasting, profit calculations, constraint checks, and simulations are executed strictly by Python/SQL logic. The LLM NEVER invents numbers.
2. **Provider Abstraction:** The AI service layer uses a pluggable interface (`mock`, `openai`, `anthropic`, `gemini`), decoupled from specific providers.
3. **Human-in-the-Loop Governance:** Every consequential action requires explicit merchant approval after passing policy guardrails.
4. **Failure Recovery & Audit Trail:** All predictions are monitored against actual outcomes to measure forecast error and refine decision parameters.

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

## 🚀 Quick Start (Phase 1 Foundation)

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Install Backend Dependencies & Run Backend:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   # source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. Install Frontend Dependencies & Run Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Verify Health Endpoint:
   ```bash
   curl http://localhost:8000/health
   # Expected response: {"status":"ok"}
   ```

### Docker Compose (Production Setup)
```bash
docker-compose up --build
```

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest ../tests
```

---

## 📅 Roadmap & Implementation Phases

- [x] **Phase 1: Foundation** — Skeleton, 15 DB models, FastAPI backend, React frontend, health check, Docker & config.
- [x] **Phase 2: Realistic Merchant Data Intelligence** — 12-month synthetic dataset (21,900 sales records across 3 store locations & 20 products), stockout-censored demand estimation, baseline forecaster & evaluation suite.
- [x] **Phase 3: Profit Leakage Engine & Decision Simulator** — 5-category leakage detector (Stockout, Overstock, Expiry, Discount Inefficiency, Supplier), Monte Carlo decision simulator (order & discount), policy guardrail engine, and REST API endpoints.
- [ ] **Phase 4: AI Agent, Policy Guardrails & Audit Trail** — Tool-calling agent, policy engine, merchant approval workflow, audit trail.
- [ ] **Phase 5: Razorpay Integration & Failure Recovery** — Test-mode Razorpay integration, failure recording, outcome comparison, and UI dashboard polish.
