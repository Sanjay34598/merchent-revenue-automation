from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.razorpay_service import razorpay_service

router = APIRouter()

class CreateRazorpayOrderRequest(BaseModel):
    amount_in_rupees: float = Field(..., description="Amount in INR rupees (must be > 0)")
    action_type: str = Field(default="REORDER", description="Action type: REORDER, DISCOUNT, PROMOTION, etc.")
    product_id: Optional[int] = Field(default=1, description="Product ID")
    store_id: Optional[int] = Field(default=1, description="Store ID")
    receipt: Optional[str] = Field(default=None, description="Optional custom receipt ID")
    notes_extra: Optional[Dict[str, Any]] = Field(default=None, description="Optional additional notes")

@router.post("/payments/razorpay/order")
def create_razorpay_order(req: CreateRazorpayOrderRequest):
    """
    Creates a Razorpay Order.
    Validates amount (> 0), converts rupees to paise safely, and constructs standard Razorpay Order payload.
    If valid Razorpay credentials are missing/unconfigured, gracefully returns RAZORPAY_TEST_MODE status with test payload.
    Secrets are never exposed.
    """
    if req.amount_in_rupees <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    res = razorpay_service.create_order(
        amount_in_rupees=req.amount_in_rupees,
        action_type=req.action_type,
        product_id=req.product_id,
        store_id=req.store_id,
        receipt=req.receipt,
        notes_extra=req.notes_extra
    )
    return res
