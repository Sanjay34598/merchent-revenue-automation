def score_opportunity(leak: dict) -> dict:
    """
    Calculates explainable priority score for a detected profit leakage opportunity.
    
    Formula:
    priority_score = financial_impact * confidence * urgency_factor * risk_adjustment
    """
    financial_impact = leak.get("estimated_opportunity", 0.0)
    confidence = leak.get("confidence", 0.70)
    category = leak.get("category", "OTHER")

    # Urgency factor (Expiry and Stockouts need faster merchant response)
    urgency_map = {
        "EXPIRY": 1.4,
        "STOCKOUT": 1.2,
        "OVERSTOCK": 1.0,
        "DISCOUNT_INEFFICIENCY": 0.9,
        "SUPPLIER_COST": 0.8
    }
    urgency_factor = urgency_map.get(category, 1.0)

    # Risk adjustment factor (0.80 to 1.0)
    risk_adjustment = 0.90 if category in ["EXPIRY", "STOCKOUT"] else 0.85

    score = financial_impact * confidence * urgency_factor * risk_adjustment

    if score > 5000 or category == "EXPIRY":
        priority = "HIGH"
    elif score > 1500:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    scored_leak = dict(leak)
    scored_leak["priority_score"] = round(score, 2)
    scored_leak["priority"] = priority
    scored_leak["confidence_adjusted_impact"] = round(financial_impact * confidence, 2)
    return scored_leak
