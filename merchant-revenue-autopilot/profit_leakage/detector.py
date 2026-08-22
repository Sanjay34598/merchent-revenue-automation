from profit_leakage.stockout import detect_stockout_leakage
from profit_leakage.overstock import detect_overstock_leakage
from profit_leakage.expiry import detect_expiry_leakage
from profit_leakage.discount import detect_discount_leakage
from profit_leakage.supplier import detect_supplier_leakage
from profit_leakage.scoring import score_opportunity
from app.models.models import ProfitLeak

class ProfitLeakageDetector:
    def __init__(self, db):
        self.db = db

    def detect_all_opportunities(self, store_id: int = None) -> list:
        """
        Runs all leakage detection algorithms and returns prioritized opportunities.
        """
        raw_leaks = []
        raw_leaks.extend(detect_stockout_leakage(self.db, store_id=store_id))
        raw_leaks.extend(detect_overstock_leakage(self.db, store_id=store_id))
        raw_leaks.extend(detect_expiry_leakage(self.db, store_id=store_id))
        raw_leaks.extend(detect_discount_leakage(self.db, store_id=store_id))
        raw_leaks.extend(detect_supplier_leakage(self.db, store_id=store_id))

        scored_leaks = [score_opportunity(leak) for leak in raw_leaks]
        # Sort by priority score descending
        scored_leaks.sort(key=lambda x: x["priority_score"], reverse=True)
        return scored_leaks

    def get_opportunity_summary(self, store_id: int = None) -> dict:
        """
        Returns structured summary metrics of all detected opportunities.
        """
        opportunities = self.detect_all_opportunities(store_id=store_id)
        
        total_estimated = sum(op["estimated_opportunity"] for op in opportunities)
        total_conf_adjusted = sum(op["confidence_adjusted_impact"] for op in opportunities)

        by_category = {}
        for op in opportunities:
            cat = op["category"]
            if cat not in by_category:
                by_category[cat] = {"count": 0, "total_impact": 0.0}
            by_category[cat]["count"] += 1
            by_category[cat]["total_impact"] += op["estimated_opportunity"]

        return {
            "total_estimated_opportunity": round(total_estimated, 2),
            "confidence_adjusted_opportunity": round(total_conf_adjusted, 2),
            "total_opportunities_count": len(opportunities),
            "by_category": by_category,
            "opportunities": opportunities
        }

    def persist_opportunities(self, store_id: int = None):
        """
        Saves detected opportunities to the ProfitLeak database table.
        """
        opportunities = self.detect_all_opportunities(store_id=store_id)
        # Clear existing DB profit leaks for fresh sync
        self.db.query(ProfitLeak).delete()
        
        db_records = []
        for op in opportunities:
            db_records.append(ProfitLeak(
                store_id=op.get("store_id", 1),
                product_id=op.get("product_id"),
                category=op["category"],
                estimated_impact=op["estimated_opportunity"],
                confidence=op["confidence"],
                evidence={"evidence": op.get("evidence", [])},
                explanation=op["explanation"],
                recommended_action=op["recommended_action"]
            ))

        self.db.add_all(db_records)
        self.db.commit()
        return len(db_records)
