from app.core.config import settings

class PolicyGuardrails:
    def __init__(self,
                 max_discount_percent: float = None,
                 min_gross_margin_percent: float = None,
                 max_order_quantity: int = None,
                 max_cash_exposure: float = None,
                 confidence_threshold: float = None,
                 max_stockout_probability: float = 0.35):
        self.max_discount_percent = max_discount_percent or settings.MAX_DISCOUNT_PERCENT
        self.min_gross_margin_percent = min_gross_margin_percent or settings.MIN_GROSS_MARGIN_PERCENT
        self.max_order_quantity = max_order_quantity or settings.MAX_ORDER_QUANTITY
        self.max_cash_exposure = max_cash_exposure or settings.MAX_CASH_EXPOSURE
        self.confidence_threshold = confidence_threshold or settings.CONFIDENCE_THRESHOLD
        self.max_stockout_probability = max_stockout_probability

    def validate_order(self, order_qty: int, cash_locked: float, stockout_prob: float, confidence: float) -> dict:
        violations = []

        if order_qty > self.max_order_quantity:
            violations.append(f"Order quantity ({order_qty}) exceeds maximum limit ({self.max_order_quantity} units).")

        if cash_locked > self.max_cash_exposure:
            violations.append(f"Cash exposure (INR {cash_locked:,.2f}) exceeds maximum threshold (INR {self.max_cash_exposure:,.2f}).")

        if confidence < self.confidence_threshold:
            violations.append(f"Prediction confidence ({confidence:.2f}) is below minimum threshold ({self.confidence_threshold:.2f}).")

        if stockout_prob > self.max_stockout_probability:
            violations.append(f"Stockout probability ({stockout_prob*100:.1f}%) exceeds maximum acceptable risk ({self.max_stockout_probability*100:.1f}%).")

        return {
            "allowed": len(violations) == 0,
            "violations": violations
        }

    def validate_discount(self, discount_percent: float, gross_margin_percent: float, confidence: float) -> dict:
        violations = []

        if discount_percent > self.max_discount_percent:
            violations.append(f"Discount ({discount_percent:.1f}%) exceeds maximum policy limit ({self.max_discount_percent:.1f}%).")

        if gross_margin_percent < self.min_gross_margin_percent:
            violations.append(f"Gross margin ({gross_margin_percent:.1f}%) falls below minimum threshold ({self.min_gross_margin_percent:.1f}%).")

        if confidence < self.confidence_threshold:
            violations.append(f"Prediction confidence ({confidence:.2f}) is below minimum threshold ({self.confidence_threshold:.2f}).")

        return {
            "allowed": len(violations) == 0,
            "violations": violations
        }
