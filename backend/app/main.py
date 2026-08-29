import sys
import os

# Ensure repository root is in sys.path when running from backend directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.health import router as health_router
from app.api.opportunities import router as opportunities_router
from app.api.simulations import router as simulations_router
from app.api.agent import router as agent_router
from app.api.actions import router as actions_router
from app.api.autopilot import router as autopilot_router
from app.api.transactions import router as transactions_router
from app.api.analytics import router as analytics_router
from app.api.products import router as products_router
from app.api.stores import router as stores_router
from app.api.payments import router as payments_router
from app.schemas.health import HealthResponse

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MerchIntell Backend API - AI Revenue Copilot for Merchants",
    version="1.0.0"
)

# CORS middleware for frontend communication (configurable via CORS_ORIGINS env var)
cors_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] if cors_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount health check endpoint directly at /health
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_root():
    return HealthResponse(status="ok")

# Mount API routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(opportunities_router, prefix="/api", tags=["Opportunities"])
app.include_router(simulations_router, prefix="/api", tags=["Simulations"])
app.include_router(agent_router, prefix="/api", tags=["Agent"])
app.include_router(actions_router, prefix="/api", tags=["Actions"])
app.include_router(autopilot_router, prefix="/api", tags=["Autopilot"])
app.include_router(transactions_router, prefix="/api", tags=["Transactions"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])
app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(stores_router, prefix="/api", tags=["Stores"])
app.include_router(payments_router, prefix="/api", tags=["Payments"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
