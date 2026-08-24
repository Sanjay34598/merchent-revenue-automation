import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.pos_dataset import pos_engine

client = TestClient(app)

def test_analytics_summary_endpoint():
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_transactions" in data
    assert "gross_revenue" in data
    assert "net_revenue" in data
    assert "average_bill_value" in data
    assert "data_as_of" in data
    assert data["total_products_monitored"] == 150

def test_revenue_trend_30d_endpoint():
    res = client.get("/api/analytics/revenue-trend")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 30
    assert "date" in data[0]
    assert "revenue" in data[0]
    assert "transactions" in data[0]

def test_product_performance_endpoint():
    res = client.get("/api/analytics/product-performance?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 10
    assert "revenue_generated" in data[0]

def test_payment_methods_endpoint():
    res = client.get("/api/analytics/payment-methods")
    assert res.status_code == 200
    data = res.json()
    assert "UPI" in data or "Cash" in data

def test_category_performance_endpoint():
    res = client.get("/api/analytics/category-performance")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_transaction_mutation_updates_analytics():
    initial_tx = pos_engine.analytics_summary["total_transactions"]
    initial_net = pos_engine.analytics_summary["net_revenue"]

    payload = {
        "store_id": 1,
        "payment_method": "UPI",
        "items": [
            {
                "product_name": "Tata Salt Iodized",
                "quantity": 2.0,
                "unit": "pack",
                "unit_price": 28.0,
                "discount": 0.0,
                "line_total": 56.0
            }
        ],
        "subtotal": 56.0,
        "discount": 0.0,
        "grand_total": 56.0
    }

    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 200

    new_summary = client.get("/api/analytics/summary").json()
    assert new_summary["total_transactions"] == initial_tx + 1
    assert new_summary["net_revenue"] == initial_net + 56.0
