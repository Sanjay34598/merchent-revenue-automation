import os
import uuid
from typing import Dict, Any, Optional
from app.core.config import settings

class RazorpayIntegrationService:
    """
    Razorpay Service Integration Layer for MerchIntell.
    Handles order creation payload generation, currency conversion (INR to paise),
    test/live credentials detection, and graceful fallback when credentials are unconfigured.
    """

    def __init__(self, key_id: Optional[str] = None, key_secret: Optional[str] = None, mode: Optional[str] = None):
        raw_key = key_id or os.getenv("RAZORPAY_KEY_ID") or getattr(settings, "RAZORPAY_KEY_ID", None)
        raw_secret = key_secret or os.getenv("RAZORPAY_KEY_SECRET") or getattr(settings, "RAZORPAY_KEY_SECRET", None)
        self.mode = mode or os.getenv("RAZORPAY_MODE") or getattr(settings, "RAZORPAY_MODE", "test")

        # Normalize keys: treat mock or default placeholders as unconfigured
        if raw_key and (raw_key.startswith("rzp_test_your") or "your_" in raw_key or raw_key == "rzp_test_mock_key"):
            self.key_id = None
        else:
            self.key_id = raw_key

        if raw_secret and ("your_" in raw_secret or raw_secret == "mock_secret"):
            self.key_secret = None
        else:
            self.key_secret = raw_secret

        self.has_credentials = bool(self.key_id and self.key_secret)

    @staticmethod
    def to_paise(amount_in_rupees: float) -> int:
        """Converts INR amount in rupees to integer paise safely (e.g. ₹15.50 -> 1550 paise)."""
        if amount_in_rupees is None or amount_in_rupees <= 0:
            raise ValueError("Amount must be greater than zero.")
        return int(round(amount_in_rupees * 100))

    @staticmethod
    def generate_receipt(prefix: str = "rcpt") -> str:
        """Generates a unique Razorpay-compliant receipt string."""
        clean_prefix = prefix.replace(" ", "_").lower()
        return f"{clean_prefix}_{uuid.uuid4().hex[:12]}"

    def build_order_payload(
        self,
        amount_in_rupees: float,
        currency: str = "INR",
        action_type: str = "REORDER",
        product_id: Optional[Any] = None,
        store_id: Optional[Any] = None,
        receipt: Optional[str] = None,
        notes_extra: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Constructs standard Razorpay Order payload structure.
        """
        paise = self.to_paise(amount_in_rupees)
        rcpt = receipt or self.generate_receipt(f"rcpt_{action_type.lower()}")

        notes = {
            "platform": "MerchIntell",
            "action_type": str(action_type),
            "product_id": str(product_id) if product_id is not None else "1",
            "store_id": str(store_id) if store_id is not None else "1",
        }
        if notes_extra:
            for k, v in notes_extra.items():
                notes[str(k)] = str(v)

        return {
            "amount": paise,
            "currency": currency.upper(),
            "receipt": rcpt,
            "notes": notes
        }

    def create_order(
        self,
        amount_in_rupees: float,
        action_type: str = "REORDER",
        product_id: Optional[Any] = None,
        store_id: Optional[Any] = None,
        receipt: Optional[str] = None,
        notes_extra: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Creates a Razorpay Order.
        If credentials exist, executes via Razorpay API client / HTTP request.
        If credentials are missing/unconfigured, gracefully returns RAZORPAY_TEST_MODE status
        along with the exact payload that WOULD be sent to Razorpay. Secrets are never exposed.
        """
        payload = self.build_order_payload(
            amount_in_rupees=amount_in_rupees,
            action_type=action_type,
            product_id=product_id,
            store_id=store_id,
            receipt=receipt,
            notes_extra=notes_extra
        )

        if not self.has_credentials:
            return {
                "success": True,
                "status": "RAZORPAY_TEST_MODE",
                "mode": self.mode,
                "message": "Razorpay credentials unconfigured. Operating in safe test payload mode.",
                "razorpay_order_payload": payload,
                "razorpay_order_id": f"order_mock_{payload['receipt']}",
                "amount_rupees": round(amount_in_rupees, 2),
                "amount_paise": payload["amount"],
                "currency": payload["currency"]
            }

        # Live / Test mode execution with actual configured credentials
        try:
            import requests
            res = requests.post(
                "https://api.razorpay.com/v1/orders",
                auth=(self.key_id, self.key_secret),
                json=payload,
                timeout=5
            )
            if res.status_code in [200, 201]:
                data = res.json()
                return {
                    "success": True,
                    "status": "RAZORPAY_ORDER_CREATED",
                    "mode": self.mode,
                    "razorpay_order_id": data.get("id"),
                    "razorpay_order_payload": payload,
                    "razorpay_response": data,
                    "amount_rupees": round(amount_in_rupees, 2),
                    "amount_paise": payload["amount"],
                    "currency": payload["currency"]
                }
            else:
                return {
                    "success": False,
                    "status": "RAZORPAY_API_ERROR",
                    "error": f"Razorpay API returned HTTP {res.status_code}: {res.text}",
                    "razorpay_order_payload": payload
                }
        except Exception as err:
            return {
                "success": False,
                "status": "RAZORPAY_API_ERROR",
                "error": str(err),
                "razorpay_order_payload": payload
            }

razorpay_service = RazorpayIntegrationService()
