import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

env_data_dir = os.getenv("DATA_DIR") or os.getenv("POS_DATABASE_PATH")
if env_data_dir:
    if env_data_dir.endswith(".json"):
        AUDIT_FILE_PATH = os.path.join(os.path.dirname(env_data_dir), "audit_logs.json")
    else:
        AUDIT_FILE_PATH = os.path.join(env_data_dir, "audit_logs.json")
else:
    AUDIT_FILE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "audit_logs.json"))

class AuditRepository:
    """
    File-backed persistent audit log repository for MerchIntell.
    Logs every state-changing event: POS Sales, Price Changes, Markdowns,
    Restocks, AI Recommendations, Human Approvals, and Recovery Measurements.
    """

    def __init__(self):
        self.log_path = AUDIT_FILE_PATH
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        self.load_or_seed()

    def load_or_seed(self):
        if not os.path.exists(self.log_path):
            initial_logs = [
                {
                    "id": "AUD-20260825-0001",
                    "timestamp": datetime.now().isoformat(),
                    "action": "SYSTEM_INITIALIZED",
                    "entity": "MerchIntell Revenue Engine",
                    "reason": "Baseline 40 stores historical dataset loaded and verified.",
                    "before_state": "Uninitialized",
                    "after_state": "40 Stores / 150 SKUs Active",
                    "source": "SYSTEM",
                    "status": "SUCCESS"
                },
                {
                    "id": "AUD-20260825-0002",
                    "timestamp": datetime.now().isoformat(),
                    "action": "RISK_SCAN_COMPLETED",
                    "entity": "Revenue Risk Engine",
                    "reason": "Identified 7 high-exposure opportunities across active catalog.",
                    "before_state": "₹0 Exposure",
                    "after_state": "₹2,829,779 Revenue at Risk",
                    "source": "AI_ENGINE",
                    "status": "SUCCESS"
                }
            ]
            self._save(initial_logs)

    def _load(self) -> List[Dict[str, Any]]:
        try:
            with open(self.log_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []

    def _save(self, logs: List[Dict[str, Any]]):
        with open(self.log_path, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2)

    def log_event(
        self,
        action: str,
        entity: str,
        reason: str,
        before_state: str = "",
        after_state: str = "",
        source: str = "SYSTEM",
        status: str = "SUCCESS"
    ) -> Dict[str, Any]:
        logs = self._load()
        log_id = f"AUD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(logs) + 1:04d}"
        entry = {
            "id": log_id,
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "entity": entity,
            "reason": reason,
            "before_state": before_state,
            "after_state": after_state,
            "source": source,
            "status": status
        }
        logs.insert(0, entry) # Newest first
        self._save(logs)
        return entry

    def get_logs(self, limit: int = 50, action_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        logs = self._load()
        if action_filter:
            logs = [l for l in logs if l.get("action") == action_filter or l.get("source") == action_filter]
        return logs[:limit]

audit_repository = AuditRepository()
