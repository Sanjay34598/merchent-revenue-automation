import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.pos_dataset import pos_engine

client = TestClient(app)

def test_150_products_generated():
    assert len(pos_engine.catalog) == 150
    skus = [p.sku for p in pos_engine.catalog]
    assert len(set(skus)) == 150

def test_30_day_dataset_generated():
    tx_count = len(pos_engine.transactions)
    assert 7000 <= tx_count <= 9500

def test_decimal_quantities_and_units():
    sample_tx = pos_engine.transactions[0]
    assert "items" in sample_tx
    assert len(sample_tx["items"]) > 0
    item = sample_tx["items"][0]
    assert "quantity" in item
    assert "unit" in item
    assert isinstance(item["quantity"], float)

def test_inventory_reconciliation():
    for prod in pos_engine.catalog[:10]:
        expected_stock = max(0.0, round(prod.opening_stock - prod.sold_stock, 1))
        assert prod.current_stock == expected_stock

def test_transaction_creation_and_inventory_deduction():
    target_product = pos_engine.catalog[0] # India Gate Basmati Rice
    initial_stock = target_product.current_stock

    payload = {
        "store_id": 1,
        "payment_method": "UPI",
        "items": [
            {
                "product_name": target_product.name,
                "quantity": 2.5,
                "unit": target_product.unit,
                "unit_price": target_product.selling_price,
                "discount": 0.0,
                "line_total": round(2.5 * target_product.selling_price, 1)
            }
        ],
        "subtotal": round(2.5 * target_product.selling_price, 1),
        "discount": 0.0,
        "grand_total": round(2.5 * target_product.selling_price, 1)
    }

    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Processed"
    assert target_product.current_stock == max(0.0, round(initial_stock - 2.5, 1))

def test_analytics_summary_endpoints():
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_transactions" in data
    assert data["total_products_monitored"] == 150

def test_data_quality_endpoint():
    res = client.get("/api/data-quality")
    assert res.status_code == 200
    data = res.json()
    assert data["is_demo_dataset"] is True

def test_inventory_endpoint():
    res = client.get("/api/inventory")
    assert res.status_code == 200
    inventory = res.json()
    assert len(inventory) == 150
