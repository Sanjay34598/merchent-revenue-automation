import os
import sys
from datetime import date, datetime, timedelta
import random
import numpy as np
import pandas as pd

# Ensure backend directory is in sys.path for database imports
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.core.database import SessionLocal, Base, engine
from app.models.models import (
    Merchant, Store, Supplier, Product, DailySales,
    InventorySnapshot, Discount, BusinessEvent
)

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)


class SyntheticDataGenerator:
    def __init__(self, seed=42, start_date=date(2025, 1, 1), num_days=365):
        set_seed(seed)
        self.start_date = start_date
        self.num_days = num_days
        self.dates = [self.start_date + timedelta(days=i) for i in range(self.num_days)]
        self.db = SessionLocal(expire_on_commit=False)
        self.clear_database()


    def clear_database(self):
        print("Cleaning database tables...")
        self.db.close()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.db = SessionLocal(expire_on_commit=False)
        print("Database schema recreated successfully.")

        merchant = Merchant(
            id=1,
            name="Apex Retail Group",
            email="owner@apexretail.in",
            created_at=datetime(2024, 12, 1)
        )
        self.db.add(merchant)
        self.db.commit()
        print("Created Merchant: Apex Retail Group")
        return merchant

    def seed_stores(self, merchant_id):
        stores_data = [
            {
                "id": 1,
                "merchant_id": merchant_id,
                "name": "TechPark Central",
                "location_type": "IT_PARK",
                "city": "Bengaluru"
            },
            {
                "id": 2,
                "merchant_id": merchant_id,
                "name": "Green Glen Residency",
                "location_type": "RESIDENTIAL",
                "city": "Bengaluru"
            },
            {
                "id": 3,
                "merchant_id": merchant_id,
                "name": "Commercial Street Hub",
                "location_type": "COMMERCIAL",
                "city": "Bengaluru"
            }
        ]
        stores = [Store(**data) for data in stores_data]
        self.db.add_all(stores)
        self.db.commit()
        print(f"Created {len(stores)} Stores: IT_PARK, RESIDENTIAL, COMMERCIAL")
        return stores

    def seed_suppliers(self):
        suppliers_data = [
            {"id": 1, "name": "FreshDairy Organics", "contact_email": "supply@freshdairy.in", "lead_time_days": 1},
            {"id": 2, "name": "DailyBake Bakers", "contact_email": "orders@dailybake.in", "lead_time_days": 1},
            {"id": 3, "name": "StapleGrains Mills", "contact_email": "sales@staplegrains.in", "lead_time_days": 3},
            {"id": 4, "name": "BevBev Beverages", "contact_email": "distributor@bevbev.in", "lead_time_days": 2},
            {"id": 5, "name": "FMCG Essentials Co", "contact_email": "orders@fmcgessentials.in", "lead_time_days": 3},
        ]
        suppliers = [Supplier(**data) for data in suppliers_data]
        self.db.add_all(suppliers)
        self.db.commit()
        print(f"Created {len(suppliers)} Suppliers")
        return suppliers

    def seed_products(self, merchant_id):
        products_data = [
            {"id": 1, "merchant_id": merchant_id, "supplier_id": 1, "name": "Milk (1L)", "category": "Perishables", "unit_cost": 25.0, "selling_price": 32.0, "shelf_life_days": 2, "base_demand": 180},
            {"id": 2, "merchant_id": merchant_id, "supplier_id": 2, "name": "Bread (400g)", "category": "Bakery", "unit_cost": 20.0, "selling_price": 30.0, "shelf_life_days": 3, "base_demand": 110},
            {"id": 3, "merchant_id": merchant_id, "supplier_id": 1, "name": "Eggs (Pack of 6)", "category": "Perishables", "unit_cost": 42.0, "selling_price": 55.0, "shelf_life_days": 10, "base_demand": 90},
            {"id": 4, "merchant_id": merchant_id, "supplier_id": 3, "name": "Rice (5kg)", "category": "Staples", "unit_cost": 260.0, "selling_price": 320.0, "shelf_life_days": 365, "base_demand": 30},
            {"id": 5, "merchant_id": merchant_id, "supplier_id": 3, "name": "Wheat Flour (5kg)", "category": "Staples", "unit_cost": 180.0, "selling_price": 230.0, "shelf_life_days": 180, "base_demand": 35},
            {"id": 6, "merchant_id": merchant_id, "supplier_id": 1, "name": "Yogurt (200g)", "category": "Perishables", "unit_cost": 22.0, "selling_price": 30.0, "shelf_life_days": 5, "base_demand": 75},
            {"id": 7, "merchant_id": merchant_id, "supplier_id": 1, "name": "Butter (100g)", "category": "Dairy", "unit_cost": 45.0, "selling_price": 58.0, "shelf_life_days": 60, "base_demand": 50},
            {"id": 8, "merchant_id": merchant_id, "supplier_id": 4, "name": "Soft Drinks (500ml)", "category": "Beverages", "unit_cost": 25.0, "selling_price": 40.0, "shelf_life_days": 180, "base_demand": 120},
            {"id": 9, "merchant_id": merchant_id, "supplier_id": 5, "name": "Biscuits (100g)", "category": "Packaged Snacks", "unit_cost": 15.0, "selling_price": 25.0, "shelf_life_days": 180, "base_demand": 130},
            {"id": 10, "merchant_id": merchant_id, "supplier_id": 5, "name": "Chips (50g)", "category": "Packaged Snacks", "unit_cost": 12.0, "selling_price": 20.0, "shelf_life_days": 120, "base_demand": 140},
            {"id": 11, "merchant_id": merchant_id, "supplier_id": 5, "name": "Instant Noodles (70g)", "category": "Packaged Snacks", "unit_cost": 10.0, "selling_price": 15.0, "shelf_life_days": 270, "base_demand": 160},
            {"id": 12, "merchant_id": merchant_id, "supplier_id": 3, "name": "Cooking Oil (1L)", "category": "Staples", "unit_cost": 115.0, "selling_price": 145.0, "shelf_life_days": 365, "base_demand": 40},
            {"id": 13, "merchant_id": merchant_id, "supplier_id": 4, "name": "Tea (250g)", "category": "Beverages", "unit_cost": 85.0, "selling_price": 120.0, "shelf_life_days": 365, "base_demand": 45},
            {"id": 14, "merchant_id": merchant_id, "supplier_id": 4, "name": "Coffee (100g)", "category": "Beverages", "unit_cost": 130.0, "selling_price": 180.0, "shelf_life_days": 365, "base_demand": 35},
            {"id": 15, "merchant_id": merchant_id, "supplier_id": 5, "name": "Toothpaste (100g)", "category": "Personal Care", "unit_cost": 45.0, "selling_price": 68.0, "shelf_life_days": 730, "base_demand": 25},
            {"id": 16, "merchant_id": merchant_id, "supplier_id": 5, "name": "Shampoo (180ml)", "category": "Personal Care", "unit_cost": 95.0, "selling_price": 140.0, "shelf_life_days": 730, "base_demand": 20},
            {"id": 17, "merchant_id": merchant_id, "supplier_id": 5, "name": "Soap (125g)", "category": "Personal Care", "unit_cost": 24.0, "selling_price": 36.0, "shelf_life_days": 730, "base_demand": 60},
            {"id": 18, "merchant_id": merchant_id, "supplier_id": 5, "name": "Packaged Snacks", "category": "Packaged Snacks", "unit_cost": 22.0, "selling_price": 35.0, "shelf_life_days": 90, "base_demand": 100},
            {"id": 19, "merchant_id": merchant_id, "supplier_id": 1, "name": "Fresh Juice (500ml)", "category": "Perishables", "unit_cost": 35.0, "selling_price": 60.0, "shelf_life_days": 3, "base_demand": 50},
            {"id": 20, "merchant_id": merchant_id, "supplier_id": 4, "name": "Mineral Water (1L)", "category": "Beverages", "unit_cost": 8.0, "selling_price": 20.0, "shelf_life_days": 365, "base_demand": 200},
        ]
        
        products = []
        for p in products_data:
            base_dem = p.pop("base_demand")
            prod = Product(**p)
            prod.base_demand = base_dem # store transiently for generator calculations
            products.append(prod)
            
        self.db.add_all(products)
        self.db.commit()
        print(f"Created {len(products)} Products")
        return products

    def seed_business_events(self, stores):
        events = []
        
        # Fixed Indian Holidays and Events
        calendar_events = [
            (date(2025, 1, 26), "holiday", 3, "Republic Day - Office closures"),
            (date(2025, 3, 14), "festival", 3, "Holi - High snack & beverage demand"),
            (date(2025, 3, 30), "festival", 2, "Ugadi - Festival grocery shopping"),
            (date(2025, 3, 31), "festival", 2, "Eid ul-Fitr - Festive demand"),
            (date(2025, 4, 6), "festival", 1, "Ram Navami"),
            (date(2025, 8, 15), "holiday", 3, "Independence Day - Public Holiday"),
            (date(2025, 8, 27), "festival", 2, "Ganesh Chaturthi - High festive grocery"),
            (date(2025, 10, 2), "holiday", 2, "Gandhi Jayanti / Dussehra"),
            (date(2025, 10, 20), "festival", 3, "Diwali - Major shopping spike"),
            (date(2025, 10, 21), "festival", 3, "Diwali Holiday - Office closures"),
            (date(2025, 12, 25), "holiday", 2, "Christmas - Holiday demand"),
        ]

        # Seasonal Weather & Office events
        # Heatwave in May (2025-05-10 to 2025-05-20)
        for day in range(10, 21):
            calendar_events.append((date(2025, 5, day), "heatwave", 2, "May Heatwave - Beverage spike"))

        # Heavy Rain Monsoon in July (2025-07-12 to 2025-07-16)
        for day in range(12, 17):
            calendar_events.append((date(2025, 7, day), "rain", 2, "Monsoon Heavy Rain - Low footfall"))

        for dt, ev_type, sev, desc in calendar_events:
            for store in stores:
                # Store 1 (IT park) gets additional office_closed events on major holidays
                events.append(BusinessEvent(
                    store_id=store.id,
                    date=dt,
                    event_type=ev_type,
                    severity=sev,
                    description=desc
                ))

        self.db.add_all(events)
        self.db.commit()
        print(f"Created {len(events)} Business Events")
        return calendar_events

    def generate_sales_and_inventory(self, stores, products, calendar_events):
        print("Generating 12 months of daily sales and inventory snapshots...")
        sales_records = []
        inventory_records = []
        discount_records = []

        # Create quick lookup for calendar events by (date, store_id)
        event_dict = {}
        for ev in self.db.query(BusinessEvent).all():
            event_dict[(ev.date, ev.store_id)] = ev

        # Initialize current stock levels for each (store_id, product_id)
        stock_tracker = {}
        for store in stores:
            for product in products:
                # Start with ~4-7 days of base demand
                initial_stock = int(product.base_demand * random.uniform(4.0, 7.0))
                stock_tracker[(store.id, product.id)] = initial_stock

        total_days = len(self.dates)

        for day_idx, current_date in enumerate(self.dates):
            weekday = current_date.weekday() # 0=Mon, 6=Sun
            month = current_date.month
            is_weekend = weekday >= 5

            for store in stores:
                store_type = store.location_type
                
                # Store Location Factor
                if store_type == "IT_PARK":
                    # Mon-Fri high (1.20-1.30), Sat lower (0.75), Sun very low (0.50)
                    if weekday < 5:
                        store_day_factor = 1.25
                    elif weekday == 5:
                        store_day_factor = 0.75
                    else:
                        store_day_factor = 0.55
                elif store_type == "RESIDENTIAL":
                    # Weekday moderate (0.95), Sat/Sun high (1.25-1.35)
                    if weekday < 5:
                        store_day_factor = 0.95
                    else:
                        store_day_factor = 1.30
                else: # COMMERCIAL
                    if weekday < 4:
                        store_day_factor = 1.0
                    elif weekday == 4: # Fri
                        store_day_factor = 1.15
                    else: # Sat & Sun
                        store_day_factor = 1.40

                # Check for business event today
                ev = event_dict.get((current_date, store.id))
                event_type = ev.event_type if ev else None

                # IT Store closure on holidays
                if store_type == "IT_PARK" and event_type in ["holiday", "festival"]:
                    store_day_factor *= 0.45

                for product in products:
                    # Category-specific multipliers
                    cat = product.category
                    category_factor = 1.0

                    # Temperature & weather effects
                    if event_type == "heatwave" and cat in ["Beverages", "Perishables"]:
                        category_factor = 1.85 if product.name in ["Soft Drinks (500ml)", "Mineral Water (1L)", "Fresh Juice (500ml)"] else 1.3
                    elif event_type == "rain":
                        if product.name in ["Tea (250g)", "Instant Noodles (70g)"]:
                            category_factor = 1.55
                        elif cat in ["Beverages", "Perishables"]:
                            category_factor = 0.65

                    # Festival effects (e.g. Diwali, Holi)
                    if event_type == "festival":
                        if cat in ["Packaged Snacks", "Beverages", "Bakery"]:
                            category_factor = 2.1
                        elif cat == "Staples":
                            category_factor = 1.4

                    # Seasonality (Summer: Beverages up, Winter: Tea/Coffee up)
                    if month in [4, 5, 6] and cat == "Beverages":
                        category_factor *= 1.35
                    elif month in [11, 12, 1] and product.name in ["Tea (250g)", "Coffee (100g)"]:
                        category_factor *= 1.40

                    # Active discount check
                    discount_percent = 0.0
                    discount_applied = False
                    
                    # Create intentional discount scenarios
                    # Scenario A: Fresh Juice discount near expiry in Store 1 around day 100
                    if product.name == "Fresh Juice (500ml)" and day_idx in range(95, 102):
                        discount_percent = 20.0
                        discount_applied = True
                    # Scenario B: Biscuits promotional discount in Store 2 around day 200
                    elif product.name == "Biscuits (100g)" and store_type == "RESIDENTIAL" and day_idx in range(195, 205):
                        discount_percent = 15.0
                        discount_applied = True
                    # Scenario C: Ineffective discount on Cooking Oil in Store 3 around day 280
                    elif product.name == "Cooking Oil (1L)" and store_type == "COMMERCIAL" and day_idx in range(275, 285):
                        discount_percent = 10.0
                        discount_applied = True

                    discount_factor = 1.0 + (discount_percent / 100.0) * 1.5

                    # Calculate Unconstrained True Demand
                    base_dem = getattr(product, "base_demand", 50)
                    noise = np.random.normal(1.0, 0.08)
                    
                    true_demand = int(round(
                        base_dem * store_day_factor * category_factor * discount_factor * noise
                    ))
                    true_demand = max(5, true_demand)

                    # Store current opening stock
                    opening_stock = stock_tracker[(store.id, product.id)]
                    
                    # Delivery received today?
                    received_qty = 0
                    # Reorder triggers: If stock low, order replenishment
                    target_stock = int(base_dem * 4.5)
                    
                    # Intentional stockout triggers for specific scenarios:
                    # Scenario 1: Milk stockout at IT store on Mondays (due to weekend under-ordering)
                    is_intentional_stockout = False
                    if store_type == "IT_PARK" and product.name == "Milk (1L)" and weekday == 0 and day_idx % 14 == 0:
                        is_intentional_stockout = True
                    # Scenario 2: Soft drinks stockout during heatwave in Commercial store
                    elif store_type == "COMMERCIAL" and product.name == "Soft Drinks (500ml)" and event_type == "heatwave" and day_idx % 3 == 0:
                        is_intentional_stockout = True
                    # Scenario 3: Bread stockout in Residential store on Saturday morning
                    elif store_type == "RESIDENTIAL" and product.name == "Bread (400g)" and weekday == 5 and day_idx % 21 == 0:
                        is_intentional_stockout = True

                    if opening_stock < target_stock * 0.3 and not is_intentional_stockout:
                        received_qty = target_stock - opening_stock
                    
                    available_inventory = opening_stock + received_qty

                    # Stockout Constraint Logic
                    if true_demand > available_inventory:
                        actual_sales = available_inventory
                        closing_stock = 0
                        stockout_flag = True
                    else:
                        actual_sales = true_demand
                        closing_stock = available_inventory - actual_sales
                        stockout_flag = False

                    # Update tracker for next day
                    stock_tracker[(store.id, product.id)] = closing_stock

                    # Financial calculations
                    eff_selling_price = round(product.selling_price * (1.0 - discount_percent / 100.0), 2)
                    unit_cost = product.unit_cost
                    discount_amount = round(actual_sales * (product.selling_price - eff_selling_price), 2)
                    revenue = round(actual_sales * eff_selling_price, 2)
                    gross_profit = round(revenue - (actual_sales * unit_cost), 2)

                    # Create DailySales record
                    sales_records.append(DailySales(
                        store_id=store.id,
                        product_id=product.id,
                        date=current_date,
                        quantity_sold=actual_sales,
                        selling_price=eff_selling_price,
                        unit_cost=unit_cost,
                        discount=discount_amount,
                        revenue=revenue,
                        gross_profit=gross_profit
                    ))

                    # Create InventorySnapshot record
                    inventory_records.append(InventorySnapshot(
                        store_id=store.id,
                        product_id=product.id,
                        date=current_date,
                        opening_inventory=opening_stock,
                        received_quantity=received_qty,
                        closing_inventory=closing_stock,
                        stockout_flag=stockout_flag
                    ))

                    # Create Discount record if applicable
                    if discount_applied and day_idx in [95, 195, 275]:
                        discount_records.append(Discount(
                            store_id=store.id,
                            product_id=product.id,
                            start_date=current_date,
                            end_date=current_date + timedelta(days=7),
                            discount_percent=discount_percent,
                            reason=f"Promotional discount for {product.name}",
                            is_active=True
                        ))

            # Commit batch every 30 days to keep memory clean
            if day_idx % 30 == 0 or day_idx == total_days - 1:
                self.db.add_all(sales_records)
                self.db.add_all(inventory_records)
                if discount_records:
                    self.db.add_all(discount_records)
                self.db.commit()
                sales_records = []
                inventory_records = []
                discount_records = []
                print(f"  Processed {day_idx + 1}/{total_days} days...")

        print("Successfully seeded all sales, inventory snapshots, and discounts!")

    def generate(self):
        print("=== STARTING SYNTHETIC DATA GENERATION ===")
        merchant = self.clear_database()
        stores = self.seed_stores(merchant.id)

        suppliers = self.seed_suppliers()
        products = self.seed_products(merchant.id)
        calendar_events = self.seed_business_events(stores)
        self.generate_sales_and_inventory(stores, products, calendar_events)
        print("=== SYNTHETIC DATA GENERATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    generator = SyntheticDataGenerator(seed=42)
    generator.generate()
