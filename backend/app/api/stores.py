from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.data_loader import data_loader

router = APIRouter()

@router.get("/stores")
def get_stores() -> List[Dict[str, Any]]:
    stores_data = []
    sales_df = data_loader.sales_df
    inv_df = data_loader.inventory_df

    for store_id in data_loader.store_list:
        st_sales = sales_df[sales_df['Store'] == store_id]
        st_inv = inv_df[inv_df['Store'] == store_id]
        
        tot_rev = float(st_sales['Sales Amount'].sum()) if len(st_sales) > 0 else 0.0
        tot_cogs = float(st_sales['Cogs'].sum()) if len(st_sales) > 0 else 0.0
        tot_units = float(st_sales['Qty Sold'].sum()) if len(st_sales) > 0 else 0.0

        # Latest stock for store
        st_inv_sorted = st_inv.sort_values('Start Date')
        latest_st_inv = st_inv_sorted.groupby('Product No').last().reset_index()
        stock_val = float(latest_st_inv['Stocks Selling Amount'].sum()) if len(latest_st_inv) > 0 else 0.0
        stock_qty = float(latest_st_inv['Qty on hand'].sum()) if len(latest_st_inv) > 0 else 0.0

        stores_data.append({
            "store_id": store_id,
            "name": f"Store {store_id.replace('STR-', '')}",
            "location": f"Retail Outpost {store_id}",
            "total_sales": round(tot_rev, 2),
            "net_revenue": round(tot_rev - tot_cogs, 2),
            "units_sold": round(tot_units, 1),
            "stock_on_hand": round(stock_qty, 1),
            "stock_value": round(stock_val, 2),
            "product_count": len(latest_st_inv)
        })

    return stores_data

@router.get("/stores/{store_id}")
def get_store_detail(store_id: str):
    stores = get_stores()
    match_store = next((s for s in stores if s["store_id"].lower() == store_id.lower() or s["name"].lower() == store_id.lower()), None)
    if not match_store:
        raise HTTPException(status_code=404, detail=f"Store '{store_id}' not found.")
    return match_store
