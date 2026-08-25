# MerchIntell — Integrated POS Ingestion Flow

## Overview

MerchIntell incorporates a real, inventory-aware POS billing terminal and transaction stream engine. Unlike static dashboards, every POS checkout directly mutates inventory, recalculates demand velocity, updates revenue metrics, and writes to an audit log.

---

## Transaction Pipeline Lifecycle

```
[ + NEW BILL ] / Auto-billing
       ↓
Product Search & Stock Validation (Stock >= Qty)
       ↓
Subtotal, Discount & Payment Selection (UPI / Card / Cash)
       ↓
Submit Sale -> POST /api/transactions
       ↓
Atomic Stock Decrement (current_stock = current_stock - qty)
       ↓
Demand Velocity & Cover Recalculation (velocity = sold / 30.0)
       ↓
File-backed Persistence (pos_database.json)
       ↓
Audit Event Logging (audit_logs.json)
       ↓
Dashboard Risk & Revenue Recalculation
```

---

## API Specifications

### `POST /api/transactions`
**Request Payload:**
```json
{
  "store_id": 1,
  "payment_method": "UPI",
  "items": [
    {
      "product_name": "Femme Footwear Boot Collection",
      "quantity": 2,
      "unit": "pair",
      "unit_price": 1948.0,
      "discount": 0.0,
      "line_total": 3896.0
    }
  ],
  "subtotal": 3896.0,
  "discount": 0.0,
  "grand_total": 3896.0
}
```

**Response Payload:**
```json
{
  "transaction_id": "TXN-20260825-10029",
  "timestamp": "2026-08-25 22:55",
  "store_id": 1,
  "terminal_id": "Terminal-#01",
  "cashier_id": "Cashier-101",
  "payment_method": "UPI",
  "grand_total": 3896.0,
  "status": "Processed"
}
```
