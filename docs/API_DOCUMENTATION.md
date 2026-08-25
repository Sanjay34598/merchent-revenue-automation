# MerchIntell — API Documentation

## Overview

The MerchIntell backend is built with FastAPI. All endpoints return JSON responses.

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## Endpoint Reference

### 1. POS Transactions API

#### `GET /api/transactions`
Returns paginated POS transactions ledger.

- **Query Parameters**:
  - `page` (int, default: 1): Page number.
  - `limit` (int, default: 20): Records per page.
  - `search` (string, optional): Search query (SKU or product name).
  - `payment_method` (string, optional): Filter by `UPI`, `Card`, or `Cash`.

#### `POST /api/transactions`
Ingests a new POS transaction, decrements stock, recalculates demand velocity, updates revenue exposure, and persists transaction to `data/pos_database.json`.

- **Request Body**:
```json
{
  "store_id": 1,
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
  "grand_total": 303.16
}
```

- **Response Body**:
```json
{
  "transaction_id": "TXN-20260825-00128",
  "timestamp": "2026-08-25 15:10",
  "store_id": 1,
  "terminal_id": "Terminal-#01",
  "cashier_id": "Cashier-101",
  "payment_method": "UPI",
  "items": [...],
  "subtotal": 303.16,
  "discount": 0.0,
  "grand_total": 303.16,
  "status": "Processed"
}
```

#### `POST /api/transactions/import?count=10`
Simulates importing a CSV export batch of POS transactions.

---

### 2. Analytics & Store Intelligence API

#### `GET /api/analytics/summary`
Returns top-level store analytics, total baseline revenue, exposed revenue at risk, and data quality stats.

#### `GET /api/stores`
Returns list of 40 stores (`STR-1001` .. `STR-1040`) with store revenue, COGS, units sold, and stock value.

#### `GET /api/products`
Returns store inventory catalog with current stock levels, daily velocity, days of cover, risk status, and exposed revenue.

---

### 3. Decisions & Actions API

#### `GET /api/opportunities`
Returns detected revenue leak opportunities categorized by risk status (`STOCKOUT`, `OVERSTOCK`, `EXPIRY_RISK`, `MARGIN_EROSION`).

#### `GET /api/actions`
Returns list of recommended merchant actions.

#### `POST /api/actions/{id}/approve`
Approves a pending merchant recommendation for execution.

#### `POST /api/actions/{id}/reject`
Rejects a recommendation and updates the learning feedback loop.

---

### 4. Simulations API

#### `POST /api/simulations/run`
Runs a Monte Carlo simulation comparing candidate interventions against baseline stockout/overstock scenarios.
