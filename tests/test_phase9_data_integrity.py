import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pos_dataset import pos_engine, PosDataSetGenerator

client = TestClient(app)

def test_revenue_reconciliation():
    calculated_gross = sum(tx["subtotal"] for tx in pos_engine.transactions)
    calculated_disc = sum(tx["discount"] for tx in pos_engine.transactions)
    calculated_net = sum(tx["grand_total"] for tx in pos_engine.transactions)

    assert round(calculated_gross - calculated_disc, 1) == round(calculated_net, 1)
    assert round(calculated_gross, 1) == pos_engine.analytics_summary["gross_revenue"]
    assert round(calculated_disc, 1) == pos_engine.analytics_summary["total_discounts"]
    assert round(calculated_net, 1) == pos_engine.analytics_summary["net_revenue"]

def test_150_sku_inventory_reconciliation():
    for prod in pos_engine.catalog:
        expected = max(0.0, round(prod.opening_stock - prod.sold_stock, 1))
        assert prod.current_stock == expected

def test_dataset_determinism():
    gen1 = PosDataSetGenerator()
    gen2 = PosDataSetGenerator()

    assert len(gen1.transactions) == len(gen2.transactions)
    assert gen1.analytics_summary["net_revenue"] == gen2.analytics_summary["net_revenue"]
    for p1, p2 in zip(gen1.catalog, gen2.catalog):
        assert p1.sku == p2.sku
        assert p1.current_stock == p2.current_stock

def test_dataset_validation_report():
    report = pos_engine.get_validation_report()
    assert "total_transactions" in report
    assert "avg_transactions_per_day" in report
    assert "avg_basket_value" in report
    assert "total_gross_revenue" in report
    assert "total_net_revenue" in report
    assert "total_units_sold" in report
    assert report["total_transactions"] > 7000

def test_daily_risk_history_derivation():
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "daily_risk_history" in data
    assert len(data["daily_risk_history"]) == 7
    assert data["daily_risk_history"][-1]["value"] == 2138.0

def test_transaction_state_mutation():
    prod = pos_engine.catalog[0]
    stock_before = prod.current_stock

    payload = {
        "store_id": 1,
        "payment_method": "UPI",
        "items": [
            {
                "product_name": prod.name,
                "quantity": 1.5,
                "unit": prod.unit,
                "unit_price": prod.selling_price,
                "discount": 0.0,
                "line_total": round(1.5 * prod.selling_price, 1)
            }
        ],
        "subtotal": round(1.5 * prod.selling_price, 1),
        "discount": 0.0,
        "grand_total": round(1.5 * prod.selling_price, 1)
    }

    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 200
    assert prod.current_stock == max(0.0, round(stock_before - 1.5, 1))
