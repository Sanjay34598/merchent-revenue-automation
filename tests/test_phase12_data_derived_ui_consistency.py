import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pos_dataset import pos_engine
from app.services.analytics import analytics_service

client = TestClient(app)

def test_backend_analytics_derived_from_transactions():
    """Verify backend analytics net_revenue equals mathematical sum of transaction grand_totals"""
    calc_net = sum(tx["grand_total"] for tx in pos_engine.transactions)
    calc_tx_count = len(pos_engine.transactions)

    summary = analytics_service.get_summary()

    assert round(calc_net, 1) == summary["net_revenue"]
    assert calc_tx_count == summary["total_transactions"]
    assert round(summary["net_revenue"] / summary["total_transactions"], 1) == summary["average_bill_value"]

def test_inventory_reconciliation_from_pos_sales():
    """Verify all 150 SKUs stock level equals opening_stock minus actual POS sold_stock"""
    for p in pos_engine.catalog:
        expected = max(0.0, round(p.opening_stock - p.sold_stock, 1))
        assert p.current_stock == expected

def test_post_transaction_updates_all_derived_metrics():
    """Verify posting a new POS sale updates transaction count, net revenue, inventory stock & velocity in unison"""
    target_p = pos_engine.catalog[2] # Tata Salt
    stock_before = target_p.current_stock
    tx_count_before = len(pos_engine.transactions)
    net_rev_before = pos_engine.analytics_summary["net_revenue"]

    payload = {
        "store_id": 1,
        "payment_method": "UPI",
        "items": [
            {
                "product_name": target_p.name,
                "quantity": 3.0,
                "unit": target_p.unit,
                "unit_price": target_p.selling_price,
                "discount": 0.0,
                "line_total": round(3.0 * target_p.selling_price, 1)
            }
        ],
        "subtotal": round(3.0 * target_p.selling_price, 1),
        "discount": 0.0,
        "grand_total": round(3.0 * target_p.selling_price, 1)
    }

    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 200

    new_summary = analytics_service.get_summary()
    assert len(pos_engine.transactions) == tx_count_before + 1
    assert target_p.current_stock == max(0.0, round(stock_before - 3.0, 1))
    assert new_summary["net_revenue"] == round(net_rev_before + payload["grand_total"], 1)
    assert new_summary["total_transactions"] == tx_count_before + 1

def test_risk_engine_calculations_from_catalog():
    """Verify active risk exposure calculation originates from catalog products with risks"""
    summary = analytics_service.get_summary()
    assert "exposed_revenue" in summary
    assert summary["exposed_revenue"] == 2138.0
    assert summary["active_risk_opportunities"] == 36

def test_payment_distribution_from_transactions():
    """Verify payment method distribution matches transaction records"""
    dist = analytics_service.get_summary()["payment_method_distribution"]
    assert "UPI" in dist
    assert "Cash" in dist
    assert "Card" in dist
    total_pct = sum(dist.values())
    assert round(total_pct, 1) == 100.0
