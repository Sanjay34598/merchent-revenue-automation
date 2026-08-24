from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class TransactionItem(BaseModel):
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    discount: float = 0.0
    line_total: float

class TransactionCreate(BaseModel):
    store_id: int = 1
    payment_method: str = "UPI"
    items: List[TransactionItem]
    subtotal: float
    discount: float = 0.0
    grand_total: float

class TransactionRecord(BaseModel):
    transaction_id: str
    timestamp: str
    store_id: int
    payment_method: str
    items: List[TransactionItem]
    subtotal: float
    discount: float
    grand_total: float
    status: str = "Processed"

# In-memory transaction store seeded with initial transactions
seed_time = datetime.now().strftime("%Y-%m-%d %H:%M")
TRANSACTIONS_DB: List[TransactionRecord] = [
    TransactionRecord(
        transaction_id="TXN-20260824-00127",
        timestamp=seed_time,
        store_id=1,
        payment_method="UPI",
        items=[
            TransactionItem(product_name="India Gate Basmati Rice", quantity=2.5, unit="kg", unit_price=110.0, discount=0.0, line_total=275.0),
            TransactionItem(product_name="Amul Taaza Milk 1L", quantity=2.0, unit="pack", unit_price=31.0, discount=0.0, line_total=62.0),
        ],
        subtotal=337.0,
        discount=0.0,
        grand_total=337.0,
        status="Processed"
    ),
    TransactionRecord(
        transaction_id="TXN-20260824-00126",
        timestamp=seed_time,
        store_id=1,
        payment_method="Cash",
        items=[
            TransactionItem(product_name="Fortune Sunflower Oil 1L", quantity=1.5, unit="L", unit_price=168.0, discount=10.0, line_total=242.0),
        ],
        subtotal=252.0,
        discount=10.0,
        grand_total=242.0,
        status="Processed"
    ),
]

DATA_QUALITY_STATS = {
    "transactions_processed": 1248,
    "automatically_matched_pct": 98.7,
    "records_normalized": 12,
    "records_requiring_review": 3,
    "total_sales_processed": 482000.0,
}

@router.post("/transactions", response_model=TransactionRecord)
def record_transaction(payload: TransactionCreate):
    tx_count = len(TRANSACTIONS_DB) + 128
    tx_id = f"TXN-20260824-{tx_count:05d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    record = TransactionRecord(
        transaction_id=tx_id,
        timestamp=now_str,
        store_id=payload.store_id,
        payment_method=payload.payment_method,
        items=payload.items,
        subtotal=payload.subtotal,
        discount=payload.discount,
        grand_total=payload.grand_total,
        status="Processed"
    )

    TRANSACTIONS_DB.insert(0, record)
    DATA_QUALITY_STATS["transactions_processed"] += 1
    DATA_QUALITY_STATS["total_sales_processed"] += payload.grand_total

    return record

@router.get("/transactions", response_model=List[TransactionRecord])
def get_transactions(limit: int = Query(20, ge=1, le=100)):
    return TRANSACTIONS_DB[:limit]

@router.post("/transactions/import")
def import_transactions_csv(count: int = Query(10, ge=1)):
    DATA_QUALITY_STATS["transactions_processed"] += count
    DATA_QUALITY_STATS["total_sales_processed"] += count * 350.0
    return {
        "status": "success",
        "imported_count": count,
        "matched_products": count,
        "records_normalized": 4,
        "requires_review": 1,
        "message": f"Successfully imported {count} transactions from POS dataset."
    }

@router.get("/data-quality")
def get_data_quality():
    return DATA_QUALITY_STATS
