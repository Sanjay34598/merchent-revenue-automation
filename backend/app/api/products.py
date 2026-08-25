from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from app.services.data_loader import data_loader
from app.services.pos_dataset import pos_engine

router = APIRouter()

@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    division: Optional[str] = None,
    category: Optional[str] = None,
    risk: Optional[str] = None,
):
    catalog = list(data_loader.catalog_map.values())

    if division and division.upper() != "ALL":
        catalog = [p for p in catalog if p["division"].lower() == division.lower()]

    if category and category.upper() != "ALL":
        catalog = [p for p in catalog if p["category"].lower() == category.lower()]

    if risk and risk.upper() != "ALL":
        catalog = [p for p in catalog if p["risk_status"].upper() == risk.upper()]

    if search:
        s_lower = search.lower()
        catalog = [
            p for p in catalog
            if s_lower in p["sku"].lower() or
            s_lower in p["name"].lower() or
            s_lower in p["category"].lower() or
            s_lower in p["division"].lower()
        ]

    total_count = len(catalog)
    total_pages = max(1, (total_count + limit - 1) // limit)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    sliced = catalog[start_idx:end_idx]

    return {
        "products": sliced,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/products/{sku}")
def get_product_by_sku(sku: str):
    product = data_loader.catalog_map.get(sku)
    if not product:
        # Check by product_id
        product = next((p for p in data_loader.catalog_map.values() if str(p["product_id"]) == sku), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU/ID '{sku}' not found.")
    return product
