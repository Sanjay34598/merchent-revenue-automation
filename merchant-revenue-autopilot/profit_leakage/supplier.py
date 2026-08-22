from app.models.models import Supplier, Product, DailySales, InventorySnapshot, Store

def detect_supplier_leakage(db, store_id: int = None):
    """
    Analyzes supplier pricing, lead time, and stockout impacts across products.
    """
    suppliers = db.query(Supplier).all()
    products = db.query(Product).all()
    leaks = []

    # Group products by category to find alternative supplier benchmarks
    category_products = {}
    for p in products:
        if p.category not in category_products:
            category_products[p.category] = []
        category_products[p.category].append(p)

    for cat, prod_list in category_products.items():
        if len(prod_list) < 2:
            continue

        for p in prod_list:
            supplier = db.query(Supplier).filter(Supplier.id == p.supplier_id).first()
            if not supplier:
                continue

            # Compare lead time and margin within category
            other_prods = [other for other in prod_list if other.id != p.id]
            avg_cat_margin_pct = sum((other.selling_price - other.unit_cost) / other.selling_price for other in other_prods) / len(other_prods)
            
            p_margin_pct = (p.selling_price - p.unit_cost) / p.selling_price

            # Detect supplier inefficiency (e.g. Lead time > 3 days causing recurring stockouts or lower margin)
            if supplier.lead_time_days >= 3 and p_margin_pct < avg_cat_margin_pct:
                estimated_annual_leakage = round((avg_cat_margin_pct - p_margin_pct) * p.selling_price * 100, 2)
                confidence = 0.80

                leaks.append({
                    "category": "SUPPLIER_COST",
                    "supplier_id": supplier.id,
                    "product_id": p.id,
                    "store": "All Stores",
                    "product": p.name,
                    "supplier_name": supplier.name,
                    "lead_time_days": supplier.lead_time_days,
                    "estimated_opportunity": estimated_annual_leakage,
                    "confidence": confidence,
                    "evidence": [
                        f"Supplier '{supplier.name}' has longer lead time ({supplier.lead_time_days} days) and lower gross margin ({p_margin_pct*100:.1f}% vs category avg {avg_cat_margin_pct*100:.1f}%).",
                        f"Excessive lead time increases buffer stock requirements."
                    ],
                    "explanation": f"Supplier cost leakage detected for {p.name} supplied by {supplier.name}.",
                    "recommended_action": f"Renegotiate lead time or unit cost with {supplier.name} for {p.name}."
                })

    return leaks
