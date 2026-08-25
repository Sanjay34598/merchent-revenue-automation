# MerchIntell — Design Decisions & Trade-offs

## Architectural & UX Rationale

This document explains the core technical and design choices made during the development of MerchIntell.

---

## 1. Quiet, Minimalist Merchant Visual Language

### Decision
Avoid generic, cluttered AI dashboard templates filled with glowing neon gradients, sidebars-within-sidebars, or decorative charts. Use quiet visual hierarchy inspired by financial products (Linear, Stripe, Ramp).

### Rationale
Retail store managers and merchants operate under high cognitive load. Presenting them with hundreds of raw technical strings (`PROD-100043 SEG-520541`) causes information fatigue. Clean typography, generous whitespace, and focused priority cards allow users to comprehend exposed revenue in seconds.

---

## 2. Progressive Information Disclosure

### Decision
Display human-readable display names (`Boot Collection Plushfoot`) on main dashboard cards and tables. Move raw SKU IDs, segment IDs, division metadata, stock cover days, and full mathematical risk formulas inside the slide-over Product Intelligence Drawer.

### Rationale
The main dashboard should answer: *"What needs my immediate attention?"* The slide-over drawer answers: *"Why is this specific product a revenue risk?"* This division maintains dashboard clarity while keeping full technical depth available on demand.

---

## 3. Real Connected POS Pipeline vs. Mock UI State

### Decision
Connect the POS billing terminal directly to FastAPI REST endpoints (`POST /api/transactions`), updating runtime inventory stock, demand velocity, revenue exposure, and JSON file persistence (`data/pos_database.json`).

### Rationale
Demonstrating real retail software requires data honesty. Synthetic UI-only state creates discrepancies between dashboard figures and actual database records. Connecting every sale to backend mutation guarantees that every transaction alters application intelligence consistently.

---

## 4. Multi-Objective Decision Engine

### Decision
Evaluate candidate interventions using multi-objective normalized scoring (Revenue Impact 40%, Margin Protection 30%, Customer Retention 15%, Execution Risk 15%) rather than single-metric profit maximization.

### Rationale
In real retail, a decision that maximizes short-term revenue might destroy profit margins or alienate loyal customers (e.g., massive 70% markdowns). Multi-objective trade-off scoring ensures recommended actions remain operationally viable.
