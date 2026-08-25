# MerchIntell — Project Structure

```text
merchent-revenue-automation/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI REST route handlers
│   │   │   ├── actions.py        # Action approval & rejection workflow
│   │   │   ├── agent.py          # AI agent chat assistant endpoint
│   │   │   ├── analytics.py      # Analytics summary & revenue trend endpoints
│   │   │   ├── autopilot.py      # Unified Decision Engine & execution routes
│   │   │   ├── health.py         # System health endpoints
│   │   │   ├── opportunities.py  # Revenue leak opportunity endpoints
│   │   │   ├── products.py       # Catalog inventory endpoints
│   │   │   ├── simulations.py    # Multi-objective What-If simulator routes
│   │   │   ├── stores.py         # 40-store listing & performance routes
│   │   │   └── transactions.py   # Real POS transaction ingestion & query API
│   │   ├── core/                 # Repository layer & DB file handlers
│   │   │   └── pos_repository.py # pos_database.json reader/writer
│   │   ├── services/             # Core business logic services
│   │   │   ├── analytics.py      # Aggregation & metrics computation
│   │   │   ├── data_loader.py    # Historical CSV dataset parser
│   │   │   └── pos_engine.py     # Runtime inventory mutation & velocity engine
│   │   └── main.py               # FastAPI application entrypoint & CORS middleware
│   ├── data/                     # Live JSON database
│   │   └── pos_database.json     # Persistent POS transaction storage
│   └── requirements.txt          # Python backend dependencies
├── data/                         # Baseline CSV datasets
│   ├── retail_sales_ml_apl.csv   # Historical sales dataset (125k rows)
│   └── retail_inventory_ml_apl.csv # Historical inventory dataset (284k rows)
├── docs/                         # Recruiter & technical documentation
├── frontend/
│   ├── src/
│   │   ├── components/           # React UI components
│   │   │   ├── BusinessPulse.tsx         # Executive KPI summary cards
│   │   │   ├── CalendarContext.tsx       # Store-aware regional context badge
│   │   │   ├── FinancialHero.tsx         # Statement hero & Revenue at Risk banner
│   │   │   ├── Header.tsx                # Floating header with store selector
│   │   │   ├── InventoryTable.tsx        # Store stock workspace
│   │   │   ├── OpportunityList.tsx       # Top 3 opportunity focus list
│   │   │   ├── OpportunityRow.tsx        # Clean display title row item
│   │   │   ├── ProductWorkspace.tsx      # Slide-over product drawer
│   │   │   ├── RightIntelligencePanel.tsx # Today's Priorities priority list
│   │   │   ├── SalesInputWorkspace.tsx   # POS Billing Terminal & Auto-billing stream
│   │   │   └── Simulator.tsx             # What-If decision simulator UI
│   │   ├── data/                 # Merchant inventory data interfaces
│   │   ├── index.css             # Vanilla CSS design system & tokens
│   │   ├── App.tsx               # Primary application state coordinator
│   │   └── main.tsx              # React DOM render entrypoint
│   ├── package.json              # Frontend npm dependencies
│   └── vite.config.ts            # Vite build configuration
├── merchant_autopilot.db         # SQLite database for decision logs
├── tests/                        # 82 automated backend pytest files
│   ├── test_health.py
│   ├── test_phase10_e2e_data_integration.py
│   ├── test_phase11_persistent_pos_db.py
│   ├── test_phase12_data_derived_ui_consistency.py
│   ├── test_phase2_data_intelligence.py
│   ├── test_phase3_profit_leakage_simulator.py
│   ├── test_phase4_agent_policy.py
│   ├── test_phase5_closed_loop_autopilot.py
│   ├── test_phase6_production_demo.py
│   ├── test_phase7_transactions_pipeline.py
│   ├── test_phase8_pos_dataset.py
│   └── test_phase9_data_integrity.py
└── README.md                     # Root technical project overview
```
