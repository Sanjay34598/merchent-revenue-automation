from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from agent.engine import RevenueAgentEngine

router = APIRouter()

class InvestigateRequest(BaseModel):
    store_id: int = Field(default=1)

class ChatRequest(BaseModel):
    message: str = Field(..., example="Where am I silently losing money?")
    store_id: Optional[int] = Field(default=1)

@router.post("/agent/investigate")
def run_agent_investigation(req: InvestigateRequest, db: Session = Depends(get_db)):
    """
    Triggers AI Revenue Agent investigation loop on store data.
    """
    engine = RevenueAgentEngine(db)
    res = engine.investigate_store(store_id=req.store_id)
    return res

@router.post("/agent/chat")
def chat_agent(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Conversational AI Assistant interface for merchant queries.
    """
    engine = RevenueAgentEngine(db)
    res = engine.chat_with_agent(user_message=req.message, store_id=req.store_id)
    return res
