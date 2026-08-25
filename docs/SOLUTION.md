# MerchIntell — Solution Overview

## Overview

MerchIntell is an **AI Revenue Copilot** designed for physical retail merchants. It transforms raw transactional and inventory data into a real-time revenue protection loop.

---

## Core Product Architecture & Closed Loop

MerchIntell connects point-of-sale transactions directly to demand velocity modeling and decision optimization:

```text
POS SALE
   ↓
TRANSACTION RECEIPT & INGESTION
   ↓
PRODUCT & STORE MATCHING
   ↓
RUNTIME INVENTORY STOCK MUTATION
   ↓
30-DAY DEMAND VELOCITY RECALCULATION
   ↓
REVENUE RISK EXPOSURE RECALCULATION
   ↓
DECISION & RECOMMENDATION ENGINE
```

---

## Key Solution Capabilities

### 1. Multi-Store Revenue Risk Exposure Monitoring
- Computes store-level and item-level **Revenue at Risk** (e.g., `₹2,829,779` total exposure across 40 stores).
- Filters intelligence dynamically by store ID (`STR-1001` .. `STR-1040`).
- Provides a baseline comparative benchmark (`₹10,482,110` historical revenue baseline).

### 2. Deterministic Risk Classification
Products are automatically audited and categorized into clear risk types:
- **STOCKOUT**: Stock cover < 7 days with high daily demand velocity.
- **OVERSTOCK**: Stock cover > 90 days with low sales velocity, tying up capital.
- **EXPIRY_RISK**: Perishable/seasonal stock nearing shelf-life expiration.
- **MARGIN_EROSION**: High cost of goods relative to selling price.

### 3. Real Connected POS Billing Terminal
- Features an interactive POS terminal workspace (`+ Record Sale` / `+ New Sale`).
- Performs live product search across real dataset items (`Boot Collection Plushfoot`, `Scholar Footwear Derby`).
- Executes atomic inventory stock deduction (`currentStock = openingStock - soldStock`).
- Recalculates 30-day daily velocity (`dailyVelocity = soldStock / 30.0`).
- Writes transaction ledger entries to persistent storage (`data/pos_database.json`).
- Generates viewable and printable customer bills (`INV-20260825-XXXX`).

### 4. Controlled Live Store Activity Generator
- Provides a background auto-billing engine (30–90s interval) simulating realistic retail sales activity.
- Uses inventory-aware product selection (selecting items with `stock > 0`, weighted toward higher demand).
- Allows store managers to `Pause`, `Resume`, or instantly trigger a sale (`Generate Sale`) to inspect live state mutations.

### 5. Multi-Objective Decision Engine
- Evaluates candidate actions (*Restock*, *Transfer Stock*, *Markdown*, *Do Nothing*).
- Ranks decisions using multi-objective scoring across four metrics:
  - **Revenue Impact**
  - **Profit Margin Protection**
  - **Customer Retention**
  - **Execution Risk**

### 6. Minimalist Merchant-First UX
- Replaces raw dataset strings (`PROD-100043 SEG-520541`) with clean display titles (`Boot Collection Plushfoot`).
- Uses progressive disclosure to keep technical SKU identifiers inside the slide-over Product Intelligence Drawer.
