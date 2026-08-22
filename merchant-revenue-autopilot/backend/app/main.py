from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.health import router as health_router
from app.api.opportunities import router as opportunities_router
from app.api.simulations import router as simulations_router
from app.schemas.health import HealthResponse

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Merchant Revenue Autopilot Backend API - Razorpay Buildathon",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
