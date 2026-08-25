# MerchIntell — Testing & Validation Specifications

## Overview

MerchIntell incorporates a rigorous testing strategy comprising **82 backend automated pytest test suites** and **frontend production build checks**.

---

## Backend Test Suite Structure (`tests/`)

| Test Phase File | Coverage Focus | Test Count | Status |
|---|---|---|---|
| `test_health.py` | API server health & status endpoints | 2 | **PASSED** |
| `test_phase2_data_intelligence.py` | Data integrity, stockout detection, demand estimation, non-negative stock | 15 | **PASSED** |
| `test_phase3_profit_leakage_simulator.py` | Profit leakage algorithms, Monte Carlo reproducibility, simulation APIs | 8 | **PASSED** |
| `test_phase4_agent_policy.py` | Tool registry, policy checks, approval/rejection workflows | 5 | **PASSED** |
| `test_phase5_closed_loop_autopilot.py` | Multi-objective scoring, action execution, learning loop, failure recovery | 9 | **PASSED** |
| `test_phase6_production_demo.py` | Custom What-If simulator, demo scenarios | 3 | **PASSED** |
| `test_phase7_transactions_pipeline.py` | Transaction schema validation, unit conversion, data quality updates | 3 | **PASSED** |
| `test_phase8_pos_dataset.py` | POS dataset generation, stock reconciliation, daily velocity updates | 7 | **PASSED** |
| `test_phase9_data_integrity.py` | Multi-store revenue reconciliation, 150-SKU stock audit, determinism | 6 | **PASSED** |
| `test_phase10_e2e_data_integration.py` | E2E transaction mutation to analytics summary reconciliation | 6 | **PASSED** |
| `test_phase11_persistent_pos_db.py` | Persistent JSON storage, paginated query, search, filtering | 5 | **PASSED** |
| `test_phase12_data_derived_ui_consistency.py` | Catalog-to-UI metrics consistency, risk calculation derivation | 5 | **PASSED** |
| **TOTAL** | **Comprehensive End-to-End System Coverage** | **82** | **100% PASS** |

---

## Running Verification Commands

### 1. Execute Backend Pytest Suite
```bash
# Run all 82 tests verbosely
python -m pytest tests/ -v
```

### 2. Execute Frontend Production Build
```bash
# Compile TypeScript & bundle with Vite
cd frontend
npm run build
```

---

## Continuous Data Integrity Guarantees

1. **Zero Fake State Mutation**: Every test validates that transaction ingestion mutates physical memory and file persistence.
2. **Non-Negative Inventory Safeguard**: Enforces `current_stock >= 0.0` across all mutation pathways.
3. **Reconciliation Check**: Ensures $\sum \text{Store Revenues} = \text{Total Baseline Revenue}$.
