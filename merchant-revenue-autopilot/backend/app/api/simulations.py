from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Simulation
from simulator.engine import DecisionSimulatorEngine

router = APIRouter()

class OrderSimulationRequest(BaseModel):
    store_id: int = Field(..., example=1)
    product_id: int = Field(..., example=1)
    order_quantities: Optional[List[int]] = Field(default=[50, 100, 150, 200, 250])
    num_simulations: Optional[int] = Field(default=1000)

class DiscountSimulationRequest(BaseModel):
    store_id: int = Field(..., example=1)
    product_id: int = Field(..., example=1)
    discount_percentages: Optional[List[float]] = Field(default=[0.0, 5.0, 10.0, 15.0, 20.0])

class CompareSimulationRequest(BaseModel):
    store_id: int = Field(..., example=1)
    product_id: int = Field(..., example=1)

@router.post("/simulations/order")
def run_order_simulation(req: OrderSimulationRequest, db: Session = Depends(get_db)):
    """
    Runs Monte Carlo simulation across order quantity decisions.
    """
    try:
        engine = DecisionSimulatorEngine(db)
        res = engine.run_order_simulation(
            store_id=req.store_id,
            product_id=req.product_id,
            order_quantities=req.order_quantities,
            num_simulations=req.num_simulations
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulations/discount")
def run_discount_simulation(req: DiscountSimulationRequest, db: Session = Depends(get_db)):
    """
    Runs promotional & clearance discount scenario simulations.
    """
    try:
        engine = DecisionSimulatorEngine(db)
        res = engine.run_discount_simulation(
            store_id=req.store_id,
            product_id=req.product_id,
            discount_percentages=req.discount_percentages
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulations/compare")
def compare_simulations(req: CompareSimulationRequest, db: Session = Depends(get_db)):
    """
    Runs both order and discount simulations for a product/store to compare operational vs pricing levers.
    """
    try:
        engine = DecisionSimulatorEngine(db)
        order_res = engine.run_order_simulation(req.store_id, req.product_id)
        discount_res = engine.run_discount_simulation(req.store_id, req.product_id)
        
        return {
            "store_id": req.store_id,
            "product_id": req.product_id,
            "order_decision": order_res,
            "discount_decision": discount_res,
            "overall_recommendation": f"Order {order_res['recommended_order_quantity']} units and apply {discount_res['recommended_discount_percent']:.0f}% discount."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/simulations/{id}")
def get_simulation_by_id(id: int, db: Session = Depends(get_db)):
    """
    Retrieves saved simulation outcome by ID.
    """
    sim = db.query(Simulation).filter(Simulation.id == id).first()
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulation with ID {id} not found.")

    return {
        "id": sim.id,
        "store_id": sim.store_id,
        "product_id": sim.product_id,
        "simulation_type": sim.simulation_type,
        "parameters": sim.parameters,
        "expected_sales": sim.expected_sales,
        "expected_revenue": sim.expected_revenue,
        "expected_gross_profit": sim.expected_gross_profit,
        "stockout_probability": sim.stockout_probability,
        "leftover_inventory": sim.leftover_inventory,
        "expiry_risk": sim.expiry_risk,
        "cash_locked": sim.cash_locked,
        "expected_waste": sim.expected_waste,
        "created_at": sim.created_at.isoformat() if sim.created_at else None
    }
