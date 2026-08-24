import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pos_dataset import pos_engine
from app.core.pos_repository import pos_db, DB_FILE_PATH

client = TestClient(app)

def test_persistent_db_file_exists():
    assert os.path.exists(DB_FILE_PATH)
    assert os.path.getsize(DB_FILE_PATH) > 1000

def test_paginated_transactions_query():
    res = client.get("/api/transactions?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "transactions" in data
    assert "total" in data
    assert data["page"] == 1
    assert data["limit"] == 10
    assert len(data["transactions"]) == 10

def test_payment_method_filter():
    res = client.get("/api/transactions?page=1&limit=10&payment_method=UPI")
    assert res.status_code == 200
    data = res.json()
    assert len(data["transactions"]) > 0
    for tx in data["transactions"]:
        assert tx["payment_method"].upper() == "UPI"

def test_search_transactions():
    res = client.get("/api/transactions?page=1&limit=10&search=Basmati")
    assert res.status_code == 200
    data = res.json()
    assert "transactions" in data

def test_transaction_creation_and_file_persistence():
    target_product = pos_engine.catalog[1] # Aashirvaad Atta
    initial_stock = target_product.current_stock
    initial_count = len(pos_engine.transactions)

    payload = {
        "store_id": 1,
        "payment_method": "UPI",
        "items": [
            {
                "product_name": target_product.name,
                "quantity": 5.0,
                "unit": target_product.unit,
                "unit_price": target_product.selling_price,
                "discount": 0.0,
                "line_total": round(5.0 * target_product.selling_price, 1)
            }
        ],
        "subtotal": round(5.0 * target_product.selling_price, 1),
        "discount": 0.0,
        "grand_total": round(5.0 * target_product.selling_price, 1)
    }

    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 200
    assert len(pos_engine.transactions) == initial_count + 1
    assert target_product.current_stock == max(0.0, round(initial_stock - 5.0, 1))

    # Reload pos_db from disk and verify persisted state
    pos_db.load_or_seed()
    assert len(pos_engine.transactions) == initial_count + 1
