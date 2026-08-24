import pytest
from app.api.transactions import (
    TRANSACTIONS_DB, DATA_QUALITY_STATS, record_transaction,
    TransactionCreate, TransactionItem, import_transactions_csv
)

def test_transaction_creation_and_decimal_quantities():
    initial_count = len(TRANSACTIONS_DB)
    payload = TransactionCreate(
        store_id=1,
        payment_method="UPI",
        items=[
            TransactionItem(
                product_name="India Gate Basmati Rice",
                quantity=2.5,
                unit="kg",
                unit_price=120.0,
                discount=0.0,
                line_total=300.0
            ),
            TransactionItem(
                product_name="Fortune Sunflower Oil 1L",
                quantity=1.5,
                unit="L",
                unit_price=168.0,
                discount=10.0,
                line_total=242.0
            )
        ],
        subtotal=552.0,
        discount=10.0,
        grand_total=542.0
    )
    
    record = record_transaction(payload)
    
    assert record.transaction_id.startswith("TXN-")
    assert len(record.items) == 2
    assert record.items[0].quantity == 2.5
    assert record.items[0].unit == "kg"
    assert record.items[1].quantity == 1.5
    assert record.items[1].unit == "L"
    assert record.grand_total == 542.0
    assert len(TRANSACTIONS_DB) == initial_count + 1

def test_data_quality_metrics_updates():
    initial_processed = DATA_QUALITY_STATS["transactions_processed"]
    res = import_transactions_csv(count=15)
    
    assert res["status"] == "success"
    assert res["imported_count"] == 15
    assert DATA_QUALITY_STATS["transactions_processed"] == initial_processed + 15
    assert DATA_QUALITY_STATS["automatically_matched_pct"] == 98.7
    assert DATA_QUALITY_STATS["records_normalized"] >= 12

def test_unit_aware_transaction_item_schema():
    item = TransactionItem(
        product_name="Fresh Robusta Bananas",
        quantity=0.5,
        unit="dozen",
        unit_price=60.0,
        discount=0.0,
        line_total=30.0
    )
    assert item.quantity == 0.5
    assert item.unit == "dozen"
    assert item.line_total == 30.0
