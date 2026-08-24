import os
import json
from typing import List, Dict, Any, Optional
from backend.app.services.pos_dataset import pos_engine

DB_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "pos_database.json")

class PosRepository:
    """File-backed persistent database repository for MerchIntell POS transactions & inventory"""

    def __init__(self):
        self.db_path = os.path.abspath(DB_FILE_PATH)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.load_or_seed()

    def load_or_seed(self):
        """Loads persistent database from file, or seeds dataset if empty/missing"""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "transactions" in data and len(data["transactions"]) > 0:
                        pos_engine.transactions = data["transactions"]
                        # Restore catalog stock if saved
                        if "catalog_stock" in data:
                            for p in pos_engine.catalog:
                                if str(p.product_id) in data["catalog_stock"]:
                                    st = data["catalog_stock"][str(p.product_id)]
                                    p.sold_stock = st.get("sold_stock", p.sold_stock)
                                    p.current_stock = st.get("current_stock", p.current_stock)
                        pos_engine.recalculate_analytics()
                        return
            except Exception as e:
                print(f"Notice: Loading DB file failed ({e}), re-seeding dataset.")

        # Seed dataset and save initial persistent snapshot
        self.save()

    def save(self):
        """Persists current transactions and catalog stock state to disk"""
        catalog_stock = {
            str(p.product_id): {
                "sold_stock": p.sold_stock,
                "current_stock": p.current_stock
            }
            for p in pos_engine.catalog
        }
        payload = {
            "store_id": 1,
            "store_name": "GreenBasket Market",
            "last_updated": pos_engine.analytics_summary.get("data_as_of", ""),
            "transactions_count": len(pos_engine.transactions),
            "transactions": pos_engine.transactions,
            "catalog_stock": catalog_stock
        }
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

pos_db = PosRepository()
