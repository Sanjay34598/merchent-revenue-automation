from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.services.analytics import analytics_service
from app.services.data_loader import data_loader

router = APIRouter()

@router.get("/analytics/summary")
def get_analytics_summary(store_id: Optional[str] = None):
    return analytics_service.get_summary(store_id=store_id)

@router.get("/analytics/revenue-trend")
def get_revenue_trend(store_id: Optional[str] = None):
    return analytics_service.get_revenue_trend_30d(store_id=store_id)

@router.get("/analytics/product-performance")
def get_product_performance(
    limit: int = Query(10, ge=1, le=150),
    store_id: Optional[str] = None
):
    return analytics_service.get_product_performance(limit=limit, store_id=store_id)

@router.get("/analytics/payment-methods")
def get_payment_methods(store_id: Optional[str] = None):
    summary = analytics_service.get_summary(store_id=store_id)
    return summary["payment_method_distribution"]

@router.get("/analytics/category-performance")
def get_category_performance(store_id: Optional[str] = None):
    summary = analytics_service.get_summary(store_id=store_id)
    return summary["top_categories"]

@router.get("/data-quality")
def get_data_quality():
    return data_loader.data_quality_stats
