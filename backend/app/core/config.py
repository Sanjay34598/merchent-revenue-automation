import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
_DEFAULT_DB_PATH = os.path.join(_ROOT_DIR, "merchant_autopilot.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Merchant Revenue Autopilot"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{_DEFAULT_DB_PATH}"
    
    # AI Provider
    AI_PROVIDER: str = "mock"
    AI_API_KEY: Optional[str] = "mock_key"
    AI_MODEL_NAME: str = "mock-model"
    
    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = "rzp_test_mock_key"
    RAZORPAY_KEY_SECRET: Optional[str] = "mock_secret"
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = "mock_webhook_secret"
    RAZORPAY_MOCK_MODE: bool = True
    
    # Guardrails
    MAX_DISCOUNT_PERCENT: float = 30.0
    MIN_GROSS_MARGIN_PERCENT: float = 10.0
    MAX_ORDER_QUANTITY: int = 500
    MAX_CASH_EXPOSURE: float = 50000.0
    CONFIDENCE_THRESHOLD: float = 0.70

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
