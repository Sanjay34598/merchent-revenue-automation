# Deployment & Production Readiness Guide

This guide details configuration, environment variables, CORS policy, Docker deployment, and health monitoring for **Merchant Revenue Autopilot**.

---

## 1. Environment Configuration

Copy `.env.example` to `.env` in the repository root:

```bash
cp .env.example .env
```

### Key Parameters:
```env
PROJECT_NAME="Merchant Revenue Autopilot"
ENVIRONMENT="production"
PORT=8000
DATABASE_URL="sqlite:///./merchant_autopilot.db"
EXECUTION_MODE="MOCK"

# Optional External Credentials (Disabled by Default)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

> [!NOTE]
> `EXECUTION_MODE` defaults to `MOCK`. No external API keys or credentials are required for demonstration or evaluation.

---

## 2. Docker & Container Deployment

Build and launch the complete stack via Docker Compose:

```bash
docker-compose up --build -d
```

### Services Started:
- **Backend Service** (`FastAPI`): Exposed on port `8000`
- **Frontend Service** (`Vite / Nginx`): Exposed on port `3000`

---

## 3. Production CORS Configuration

In `backend/app/main.py`, CORS middleware is configured to support frontend communication:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to production frontend domain in live setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. Health & Diagnostic Endpoints

Verify backend deployment health:
```bash
curl http://localhost:8000/health
```

Expected Response:
```json
{
  "status": "ok"
}
```

System status diagnostic endpoint:
```bash
curl http://localhost:8000/api/autopilot/outcomes
```
