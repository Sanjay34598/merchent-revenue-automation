import os
import sys
from datetime import date
import pandas as pd
from sqlalchemy import func

# Add backend to sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.models.models import (
    Merchant, Store, Supplier, Product, DailySales,
    InventorySnapshot, Discount, BusinessEvent
)

def inspect_dataset():
    db = SessionLocal()
    print("=" * 60)
    print("      MERCHANT REVENUE AUTOPILOT - DATASET INSPECTION")
    print("=" * 60)

    # 1. Basic entity counts
    store_count = db.query(Store).count()
    product_count = db.query(Product).count()
    supplier_count = db.query(Supplier).count()
    sales_count = db.query(DailySales).count()
    inventory_count = db.query(InventorySnapshot).count()
    event_count = db.query(BusinessEvent).count()
    discount_count = db.query(Discount).count()

    print(f"Total Stores          : {store_count}")
    print(f"Total Products        : {product_count}")
    print(f"Total Suppliers       : {supplier_count}")
    print(f"Total Sales Records   : {sales_count:,}")
    print(f"Total Inv Snapshots   : {inventory_count:,}")
    print(f"Total Business Events : {event_count}")
    print(f"Total Discount Periods: {discount_count}")

    # 2. Stockout Statistics
    stockout_count = db.query(InventorySnapshot).filter(InventorySnapshot.stockout_flag == True).count()
    stockout_pct = (stockout_count / inventory_count) * 100 if inventory_count > 0 else 0
    print(f"\nStockout Days Recorded: {stockout_count:,} ({stockout_pct:.2f}% of total store-product days)")

    # 3. Store Sales & Demand Breakdown
    print("\n" + "-" * 60)
    print("STORE DEMAND & REVENUE BREAKDOWN")
    print("-" * 60)

    stores = db.query(Store).all()
    for store in stores:
        total_rev = db.query(func.sum(DailySales.revenue)).filter(DailySales.store_id == store.id).scalar() or 0
        total_profit = db.query(func.sum(DailySales.gross_profit)).filter(DailySales.store_id == store.id).scalar() or 0
        avg_units = db.query(func.avg(DailySales.quantity_sold)).filter(DailySales.store_id == store.id).scalar() or 0
        store_stockouts = db.query(InventorySnapshot).filter(InventorySnapshot.store_id == store.id, InventorySnapshot.stockout_flag == True).count()

        print(f"\nStore {store.id}: {store.name} [{store.location_type}] ({store.city})")
        print(f"  • Total Annual Revenue   : INR {total_rev:,.2f}")
        print(f"  • Total Gross Profit     : INR {total_profit:,.2f}")
        print(f"  • Average Daily Sales/Prod: {avg_units:.1f} units")
        print(f"  • Stockout Instances     : {store_stockouts} days")

    # 4. IT Store Weekday vs Sunday Demand Inspection (Validation of requirement 5)
    it_store = db.query(Store).filter(Store.location_type == "IT_PARK").first()
    milk_prod = db.query(Product).filter(Product.name.like("%Milk%")).first()

    if it_store and milk_prod:
        sales_query = db.query(DailySales.date, DailySales.quantity_sold)\
            .filter(DailySales.store_id == it_store.id, DailySales.product_id == milk_prod.id).all()
        
        df_milk = pd.DataFrame(sales_query, columns=["date", "quantity"])
        df_milk["date"] = pd.to_datetime(df_milk["date"])
        df_milk["weekday"] = df_milk["date"].dt.day_name()
        
        weekday_avg = df_milk[df_milk["date"].dt.weekday < 5]["quantity"].mean()
        sunday_avg = df_milk[df_milk["date"].dt.weekday == 6]["quantity"].mean()
        
        print("\n" + "-" * 60)
        print("IT PARK STORE - MILK DEMAND PATTERN (WEEKDAY vs SUNDAY)")
        print("-" * 60)
        print(f"Store: {it_store.name} | Product: {milk_prod.name}")
        print(f"  • Mon-Fri Average Daily Sales : {weekday_avg:.1f} units/day")
        print(f"  • Sunday Average Daily Sales  : {sunday_avg:.1f} units/day")
        print(f"  • Demand Reduction Ratio      : {((1 - sunday_avg/weekday_avg) * 100):.1f}% drop on Sundays")

    # 5. Top Products by Revenue
    print("\n" + "-" * 60)
    print("TOP 5 PRODUCTS BY REVENUE")
    print("-" * 60)

    top_prods = db.query(
        Product.name,
        Product.category,
        func.sum(DailySales.revenue).label("total_revenue"),
        func.sum(DailySales.gross_profit).label("total_profit")
    ).join(DailySales, Product.id == DailySales.product_id)\
     .group_by(Product.id)\
     .order_by(func.sum(DailySales.revenue).desc())\
     .limit(5).all()

    for name, cat, rev, profit in top_prods:
        print(f"  • {name:<22} [{cat:<15}] Revenue: INR {rev:,.2f} | Gross Profit: INR {profit:,.2f}")

    print("=" * 60)

if __name__ == "__main__":
    inspect_dataset()
