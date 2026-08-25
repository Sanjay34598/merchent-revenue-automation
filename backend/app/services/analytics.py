from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import pandas as pd
from app.services.data_loader import data_loader
from app.services.pos_dataset import pos_engine

class AnalyticsService:
    """Centralized Backend Analytics Service deriving live dashboard metrics from real retail sales and inventory datasets."""

    @staticmethod
    def get_summary(store_id: Optional[str] = None) -> Dict[str, Any]:
        sales_df = data_loader.sales_df
        inv_df = data_loader.inventory_df

        if store_id and store_id != "ALL" and store_id != "1":
            # Format store string e.g. "STR-1001" or "1001"
            st_key = store_id if store_id.startswith("STR-") else f"STR-{int(store_id):04d}" if store_id.isdigit() else store_id
            if st_key in data_loader.store_list:
                sales_df = sales_df[sales_df['Store'] == st_key]
                inv_df = inv_df[inv_df['Store'] == st_key]

        pos_engine.recalculate_analytics()
        
        # Payment method distribution
        pm_counts: Dict[str, int] = {}
        for tx in pos_engine.transactions:
            pm = tx.get("payment_method", "UPI")
            pm_counts[pm] = pm_counts.get(pm, 0) + 1
        
        total_tx = len(pos_engine.transactions) or 1
        pm_distribution = {k: round((v / total_tx) * 100, 1) for k, v in pm_counts.items()}

        # Category performance
        cat_revenue: Dict[str, float] = {}
        if len(sales_df) > 0:
            cat_df = sales_df.groupby('Product Category')['Sales Amount'].sum().reset_index()
            for _, r in cat_df.iterrows():
                cat_revenue[str(r['Product Category'])] = round(float(r['Sales Amount']), 2)

        sorted_cats = sorted(cat_revenue.items(), key=lambda x: x[1], reverse=True)

        tot_sales = float(sales_df['Sales Amount'].sum()) if len(sales_df) > 0 else data_loader.overview_totals["gross_revenue"]
        tot_cogs = float(sales_df['Cogs'].sum()) if len(sales_df) > 0 else data_loader.overview_totals["total_cogs"]
        net_rev = tot_sales - tot_cogs

        exposed_rev = sum(p["revenue_at_risk"] for p in data_loader.catalog_map.values())
        recov_rev = sum(p["recoverable_revenue"] for p in data_loader.catalog_map.values())

        return {
            "total_transactions": len(sales_df) or pos_engine.analytics_summary["total_transactions"],
            "gross_revenue": round(tot_sales, 2),
            "total_cogs": round(tot_cogs, 2),
            "total_discounts": 0.0,
            "net_revenue": round(net_rev, 2),
            "gross_margin_pct": round((net_rev / max(1.0, tot_sales) * 100.0), 1),
            "average_bill_value": round(tot_sales / max(1, len(sales_df)), 2),
            "protected_revenue": round(tot_sales, 2),
            "exposed_revenue": round(exposed_rev, 2),
            "active_risk_opportunities": len([p for p in data_loader.catalog_map.values() if p["risk_status"] != "HEALTHY"]),
            "requiring_attention": min(7, len([p for p in data_loader.catalog_map.values() if p["risk_status"] != "HEALTHY"])),
            "total_products_monitored": len(data_loader.catalog_map),
            "total_stores_monitored": len(data_loader.store_list),
            "expected_recovery_today": round(recov_rev, 2),
            "daily_risk_history": pos_engine.analytics_summary["daily_risk_history"],
            "payment_method_distribution": pm_distribution,
            "top_categories": sorted_cats[:5],
            "data_quality": data_loader.data_quality_stats,
            "data_as_of": datetime.now().strftime("%d %b %Y · %I:%M %p")
        }

    @staticmethod
    def get_revenue_trend_30d(store_id: Optional[str] = None) -> List[Dict[str, Any]]:
        sales_df = data_loader.sales_df
        if store_id and store_id != "ALL" and store_id != "1":
            st_key = store_id if store_id.startswith("STR-") else f"STR-{int(store_id):04d}" if store_id.isdigit() else store_id
            if st_key in data_loader.store_list:
                sales_df = sales_df[sales_df['Store'] == st_key]

        max_date = sales_df['Transaction Date'].max()
        start_date = max_date - pd.Timedelta(days=30)
        recent_sales = sales_df[sales_df['Transaction Date'] >= start_date]

        recent_sales['date_str'] = recent_sales['Transaction Date'].dt.strftime('%Y-%m-%d')
        daily_df = recent_sales.groupby('date_str').agg(
            revenue=('Sales Amount', 'sum'),
            cogs=('Cogs', 'sum'),
            transactions=('Number of Transactions', 'sum')
        ).reset_index().sort_values('date_str')

        return [
            {
                "date": row['date_str'],
                "revenue": round(float(row['revenue']), 2),
                "discounts": 0.0,
                "transactions": int(row['transactions'])
            }
            for _, row in daily_df.iterrows()
        ]

    @staticmethod
    def get_product_performance(limit: int = 10, store_id: Optional[str] = None) -> List[Dict[str, Any]]:
        catalog = list(data_loader.catalog_map.values())
        sorted_prods = sorted(catalog, key=lambda p: p["sold_stock"] * p["selling_price"], reverse=True)
        return [
            {
                "product_id": p["product_id"],
                "name": p["name"],
                "sku": p["sku"],
                "division": p["division"],
                "category": p["category"],
                "selling_price": p["selling_price"],
                "unit": p["unit"],
                "sold_stock_30d": p["sold_stock"],
                "daily_velocity": p["daily_velocity"],
                "current_stock": p["current_stock"],
                "days_of_cover": p["days_of_cover"],
                "revenue_generated": round(p["sold_stock"] * p["selling_price"], 2),
                "risk_type": p["risk_status"]
            }
            for p in sorted_prods[:limit]
        ]

analytics_service = AnalyticsService()
