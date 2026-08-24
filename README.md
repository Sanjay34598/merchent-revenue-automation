# RevenuePilot — AI Revenue Copilot for Merchants

> **AI Revenue Copilot for Retail & Grocery Merchants**
> A portfolio project demonstrating full-stack AI engineering, decision modeling, demand forecasting, financial scenario simulation, and policy-gated automation.

---

## 🎯 Core Problem Statement

> *"Merchants don't need another static dashboard telling them what happened yesterday. They need an intelligent copilot that forecasts stockout-censored demand, simulates intervention scenarios against doing nothing, and quantifies recoverable revenue."*

Retail merchants silently lose 5–15% of annual gross margin to avoidable operational leakage:
- **Context-Blind Demand Drops:** Over-ordering stock during normal weekday pattern shifts or holiday office closures.
- **Uncaptured Stockout Censorship:** Sales drop to zero when stock reaches zero. Naïve forecasting models mistake zero sales for zero demand.
- **Perishable Expiry Waste:** Perishable items expiring before sale due to delayed clearance discounting.
- **Margin Leakage:** Unoptimized retail pricing failing to cover supplier cost inflation.

---

## 🧠 Closed-Loop Decision Engine Architecture

```
OBSERVE CATALOG STREAM
          ↓
DETECT REVENUE LEAK (Expiry, Stockout, Margin Leak, Overstock)
          ↓
FORECAST ELASTICITY & DEMAND
          ↓
SIMULATE CANDIDATE INTERVENTIONS vs STATUS QUO (DO NOTHING)
          ↓
POLICY CHECK & GUARDRAIL VALIDATION
          ↓
RECOMMEND OPTIMAL INTERVENTION (Max Net Recovery)
          ↓
EXECUTE / SCHEDULE ACTION
          ↓
LEARN & CALIBRATE FROM OUTCOMES
```

### Key Technical Highlights:
1. **Zero Customer PII Tracking**: Reasons strictly from aggregate inventory metrics (velocity, lead times, expiry windows, margin percentages, price elasticity).
2. **Mandatory Baseline (`DO_NOTHING`) Evaluation**: Evaluates status quo alongside candidates. If intervention costs exceed expected gain, status quo wins.
3. **Multi-Objective Normalized Scoring**: Combines expected revenue recovery, gross profit impact, waste reduction, and risk mitigation.
4. **Structured Decision Rationales**: Provides step-by-step reasoning ("WHY THIS DECISION?") and explicit rejection rationale for losing alternatives.
5. **Safe Local / MOCK Execution**: All simulation and action scheduling runs deterministically with zero external API key requirements.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              RevenuePilot Modern Frontend               │
│          (React + TypeScript + Vite + Vanilla CSS)      │
└────────────────────────────┬────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────┐
│                  FastAPI Backend Server                 │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
┌──────────────▼─────────────┐ ┌───────────▼──────────────┐
│   AI Autonomous Engine     │ │   Deterministic Engine   │
│  • Leak Detection          │ │  • Stockout Demand Model │
│  • Action Strategy Scoring │ │  • Elasticity Simulator  │
│  • Decision Audit Pipeline │ │  • Policy Guardrails     │
└────────────────────────────┘ └───────────┬──────────────┘
                                           │
                               ┌───────────▼──────────────┐
                               │ SQLite / PostgreSQL DB   │
                               │ (15 Relational Entities) │
                               └──────────────────────────┘
```

---

## 🛍️ Synthetic Catalog Dataset

RevenuePilot incorporates a seeded 150-item synthetic inventory dataset representing realistic Indian grocery retail stock:
- **Brands**: Amul, Britannia, Tata, Fortune, Aashirvaad, Parle, Coca-Cola, Paper Boat, Nescafé, Maggi, Surf Excel, McCain, etc.
- **Categories**: Dairy, Beverages, Bakery, Staples, Snacks, Personal Care, Household, Frozen Foods, Fruits & Vegetables, Packaged Foods.
- **Realistic Metrics**: Unrounded selling prices, cost prices, stock counts, daily sales velocities, 7-day sparklines, expiry windows, and supplier lead times.
- **Disclaimer**: *This project uses synthetic merchant data for demonstration and does not track individual customers or real merchant PII.*

---

## ⚡ 90-Second Recruiter Demo Walkthrough

1. **Home Overview**: View weekly recovered revenue (₹1,340) and high-priority action cards.
2. **Product Workspace Drawer**: Click any product (e.g. *Fresh Orange Juice*) to open the 250ms slide-over detail drawer showing stock, velocity, 3-day trend %, expiry days, and revenue at risk.
3. **Autonomous Decision Center**: View the visual 8-stage decision pipeline (`OBSERVE` → `DETECT` → `FORECAST` → `SIMULATE` → `POLICY CHECK` → `RECOMMEND` → `EXECUTE` → `LEARN`) and compare candidate discount strategies.
4. **What-If Simulator**: Adjust clearance discount (%) and reorder quantity sliders to calculate real-time elasticity and financial impact (+₹354 expected recovery).
5. **Inventory Catalog**: Search and filter the 150-product catalog by category or risk status (`EXPIRY`, `STOCKOUT`, `MARGIN_LEAK`, `OVERSTOCK`, `HEALTHY`).
6. **Theme Engine**: Toggle seamlessly between Light Mode, Dark Mode, and System Mode preferences.

---

## 💻 Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend running at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend running at: `http://localhost:5173`

---

## 🧪 Verification & Engineering Tests

### Backend Tests
```bash
python -m pytest tests/ -v
```

### Frontend Build
```bash
cd frontend
npm run build
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check |
| `POST` | `/api/autopilot/analyze` | Run full catalog audit & generate decision strategy |
| `GET` | `/api/autopilot/opportunities` | List active revenue risk opportunities |
| `POST` | `/api/autopilot/simulate-custom` | Run custom what-if elasticity simulation |
| `GET` | `/api/actions` | Fetch pending and executed merchant actions |
| `POST` | `/api/actions/{id}/approve` | Approve a recommended decision action |
| `GET` | `/api/autopilot/outcomes` | Fetch post-execution outcome statistics |
