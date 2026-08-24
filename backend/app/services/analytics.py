from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.services.pos_dataset import pos_engine

class AnalyticsService:
    """Centralized Backend Analytics Service deriving live dashboard metrics from 30-day POS dataset"""

    @staticmethod
    def get_summary() -> Dict[str, Any]:
        pos_engine.recalculate_analytics()
        summary = pos_engine.analytics_summary
        
        # Payment method distribution
        pm_counts: Dict[str, int] = {}
        for tx in pos_engine.transactions:
            pm = tx.get("payment_method", "UPI")
            pm_counts[pm] = pm_counts.get(pm, 0) + 1
        
        total_tx = len(pos_engine.transactions) or 1
        pm_distribution = {k: round((v / total_tx) * 100, 1) for k, v in pm_counts.items()}

        # Category performance
        cat_revenue: Dict[str, float] = {}
        for tx in pos_engine.transactions:
            for item in tx["items"]:
                p_name = item["product_name"]
                match_p = next((p for p in pos_engine.catalog if p.name == p_name), None)
                cat = match_p.category if match_p else "General Grocery"
                cat_revenue[cat] = round(cat_revenue.get(cat, 0.0) + item["line_total"], 1)

        sorted_cats = sorted(cat_revenue.items(), key=lambda x: x[1], reverse=True)

        return {
            "total_transactions": summary["total_transactions"],
            "gross_revenue": summary["gross_revenue"],
            "total_discounts": summary["total_discounts"],
            "net_revenue": summary["net_revenue"],
            "average_bill_value": round(summary["net_revenue"] / total_tx, 1),
            "protected_revenue": summary["protected_revenue"],
            "exposed_revenue": summary["exposed_revenue"],
            "active_risk_opportunities": summary["active_risk_opportunities"],
            "requiring_attention": summary["requiring_attention"],
            "total_products_monitored": summary["total_products_monitored"],
            "expected_recovery_today": summary["expected_recovery_today"],
            "daily_risk_history": summary["daily_risk_history"],
            "payment_method_distribution": pm_distribution,
            "top_categories": sorted_cats[:5],
            "data_quality": summary["data_quality"],
            "data_as_of": datetime.now().strftime("%d %b %Y · %I:%M %p")
        }

    @staticmethod
    def get_revenue_trend_30d() -> List[Dict[str, Any]]:
        # Calculate actual daily revenue across 30 days history
        start_date = datetime.now() - timedelta(days=30)
        daily_map: Dict[str, Dict[str, float]] = {}

        for i in range(30):
            day_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_map[day_str] = {"revenue": 0.0, "transactions": 0, "discounts": 0.0}

        for tx in pos_engine.transactions:
            t_date = tx["timestamp"].split(" ")[0]
            if t_date in daily_map:
                daily_map[t_date]["revenue"] = round(daily_map[t_date]["revenue"] + tx["grand_total"], 1)
                daily_map[t_date]["discounts"] = round(daily_map[t_date]["discounts"] + tx["discount"], 1)
                daily_map[t_date]["transactions"] += 1

        trend = []
        for d_str, val in daily_map.items():
            trend.append({
                "date": d_str,
                "revenue": val["revenue"],
                "discounts": val["discounts"],
                "transactions": val["transactions"]
            })
        return trend

    @staticmethod
    def get_product_performance(limit: int = 10) -> List[Dict[str, Any]]:
        sorted_prods = sorted(pos_engine.catalog, key=lambda p: p.sold_stock * p.selling_price, reverse=True)
        return [
            {
                "product_id": p.product_id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category,
                "selling_price": p.selling_price,
                "unit": p.unit,
                "sold_stock_30d": p.sold_stock,
                "daily_velocity": p.daily_velocity,
                "current_stock": p.current_stock,
                "days_of_cover": p.days_of_cover,
                "revenue_generated": round(p.sold_stock * p.selling_price, 1),
                "risk_type": p.risk_type
            }
            for p in sorted_prods[:limit]
        ]

analytics_service = AnalyticsService()
