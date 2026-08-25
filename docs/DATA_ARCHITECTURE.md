# MerchIntell — Data Architecture

## Dataset Overview

MerchIntell is powered by real retail datasets representing multi-store sales and inventory operations across **40 stores** (`STR-1001` through `STR-1040`).

---

## Data Schema & Files

### 1. Historical Sales Dataset (`data/retail_sales_ml_apl.csv`)
- **Total Records**: 125,751 rows
- **Historical Baseline Revenue**: ₹10,482,110.25
- **Columns**:
  - `Store`: Store identifier (`STR-1001` .. `STR-1040`)
  - `Date`: Transaction date (Jun 2025 – Apr 2026)
  - `Sales Amount`: Total gross revenue in ₹
  - `Qty Sold`: Number of units sold
  - `Cogs`: Cost of Goods Sold in ₹
  - `Product ID`: Raw SKU string (`PROD-100043`)
  - `Segment ID`: Product segment (`SEG-520541`)
  - `Division`: High-level category (`Femme Footwear`, `Scholar Footwear`, `Junior Apparel`)

### 2. Historical Inventory Dataset (`data/retail_inventory_ml_apl.csv`)
- **Total Records**: 284,755 rows
- **Columns**:
  - `Store`: Store identifier (`STR-1001` .. `STR-1040`)
  - `Date`: Inventory snapshot date
  - `Stock`: Total units on hand
  - `Product ID`: Raw SKU string (`PROD-100043`)

### 3. POS Transaction Ledger (`data/pos_database.json`)
Persistent JSON database storing live transactions executed through MerchIntell's POS billing pipeline:
```json
{
  "transactions": [
    {
      "transaction_id": "TXN-20260825-00128",
      "timestamp": "2026-08-25 15:10",
      "store_id": 1,
      "terminal_id": "Terminal-#01",
      "cashier_id": "Cashier-101",
      "payment_method": "UPI",
      "items": [
        {
          "product_name": "Boot Collection Plushfoot",
          "quantity": 2.0,
          "unit": "piece",
          "unit_price": 151.58,
          "discount": 0.0,
          "line_total": 303.16
        }
      ],
      "subtotal": 303.16,
      "discount": 0.0,
      "grand_total": 303.16,
      "status": "Processed"
    }
  ]
}
```

### 4. Autopilot SQLite Database (`merchant_autopilot.db`)
Stores decision engine audit trails, action execution records, and learning loop feedback:
- `opportunities`: Detected revenue leak opportunities.
- `action_logs`: History of approved/executed merchant actions.
- `experiment_results`: Closed-loop learning feedback on executed decisions.

---

## Data Reconciliation Rules

1. **Deterministic Revenue**: Baseline historical revenue is strictly aggregated from `Sales Amount` without synthetic scaling.
2. **Inventory Non-Negativity**: Runtime stock deduction enforces `currentStock = max(0.0, openingStock - soldStock)`.
3. **Demand Velocity Derivation**: 30-day daily velocity is calculated from actual 30-day unit sales:
   $$\text{Daily Velocity} = \frac{\text{Sold Stock (30D)}}{30.0}$$
4. **Days of Cover Derivation**:
   $$\text{Days of Cover} = \frac{\text{Current Stock}}{\max(\text{Daily Velocity}, 0.1)}$$
