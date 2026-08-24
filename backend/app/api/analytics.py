from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.services.analytics import analytics_service

router = APIRouter()

@router.get("/analytics/summary")
def get_analytics_summary():
    return analytics_service.get_summary()

@router.get("/analytics/revenue-trend")
def get_revenue_trend():
    return analytics_service.get_revenue_trend_30d()

@router.get("/analytics/product-performance")
def get_product_performance(limit: int = Query(10, ge=1, le=150)):
    return analytics_service.get_product_performance(limit=limit)

@router.get("/analytics/payment-methods")
def get_payment_methods():
    summary = analytics_service.get_summary()
    return summary["payment_method_distribution"]

@router.get("/analytics/category-performance")
def get_category_performance():
    summary = analytics_service.get_summary()
    return summary["top_categories"]
