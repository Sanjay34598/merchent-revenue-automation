# MerchIntell — Technical Architecture

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | 18.3.1 | Single-Page Application UI rendering |
| **Frontend Language** | TypeScript | 5.5.3 | Static typing & interface definitions |
| **Frontend Build Tool** | Vite | 5.4.21 | Module bundling & hot module replacement |
| **Icons & Visuals** | Lucide React | 0.344.0 | Minimalist iconography |
| **Backend Framework** | FastAPI | 0.109.0 | High-performance asynchronous REST API |
| **Backend Runtime** | Python | 3.11+ | Server-side execution environment |
| **Data Processing** | Pandas / NumPy | 2.2.0 / 1.26.3 | Dataset loading & vector math |
| **Data Validation** | Pydantic | 2.6.0 | Schema validation & serialization |
| **Testing Framework** | pytest | 9.1.1 | Backend unit & integration test suite |
| **Database** | SQLite3 / JSON | Built-in | Action logs & transaction persistence |

---

## Technical Flow & State Management

### 1. Data Ingestion & Startup Initialization
At application startup, `RealDataLoader` ([backend/app/services/data_loader.py](file:///c:/Users/PK/razorpay/merchent-revenue-automation/backend/app/services/data_loader.py)) parses the historical CSV files:
- Grouping sales records by `Store` (`STR-1001` .. `STR-1040`).
- Calculating historical sales totals (`₹10,482,110.25` total revenue, `44.2%` gross margin).
- Building an indexed catalog of 2,326 overlapping SKUs across 40 stores.

### 2. POS Transaction & Inventory Mutation Engine
When a sale is recorded (manually via `+ New Sale` or automatically via Auto-billing):
1. `POST /api/transactions` is called with item payload (`product_name`, `quantity`, `unit`, `unit_price`, `discount`, `line_total`, `payment_method`).
2. `RealPOSEngine` ([backend/app/services/pos_engine.py](file:///c:/Users/PK/razorpay/merchent-revenue-automation/backend/app/services/pos_engine.py)):
   - Matches catalog SKUs by exact SKU or clean product title.
   - Mutates stock: `sold_stock = sold_stock + quantity`, `current_stock = max(0.0, opening_stock - sold_stock)`.
   - Recalculates 30-day daily velocity: `daily_velocity = sold_stock / 30.0`.
   - Recalculates stock cover: `days_of_cover = current_stock / max(daily_velocity, 0.1)`.
   - Calls `pos_engine.recalculate_analytics()`.
   - Calls `pos_db.save()` to write transaction record to `data/pos_database.json`.

### 3. Frontend Reactive Refresh Loop
In `App.tsx`:
- `handleRecordSale` updates the React `merchantCatalog` state in real-time.
- Decrements inventory counts (`currentStock`), recalculates stock value (`stockValue = currentStock * price`), and updates `revenueAtRisk`.
- Updates the top hero metric banner (`Revenue at Risk ₹2,829,779`) and `Today's Priorities` panel without requiring a browser page refresh.
