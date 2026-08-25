# MerchIntell — Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying MerchIntell publicly on **Render** (recommended for full-stack blueprint deployment) or **Vercel** + **Render**.

---

## 1. Prerequisites

- A GitHub account with access to the repository (`Sanjay34598/merchent-revenue-automation`).
- A Render account ([render.com](https://render.com)).
- Optional: A Vercel account ([vercel.com](https://vercel.com)) if hosting the frontend on Vercel.

---

## 2. Option A: Render Blueprint Deployment (Recommended)

MerchIntell includes a pre-configured `render.yaml` blueprint at the repository root.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository (`merchent-revenue-automation`).
4. Render will automatically detect `render.yaml` and configure two services:
   - **`merchintell-backend`**: Python Web Service running Uvicorn on FastAPI with persistent disk `/var/data`.
   - **`merchintell-frontend`**: React/Vite Static Site with SPA rewrite rules (`/* → /index.html`).
5. Click **Apply**.
6. Once deployed, Render will provide public URLs for both the backend and frontend.

---

## 3. Option B: Manual Render Web Service Deployment (Backend Only)

### Backend Configuration (Render Web Service)
- **Name**: `merchintell-backend`
- **Region**: Oregon (or nearest)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

#### Environment Variables (Backend):
| Variable | Value | Description |
|---|---|---|
| `PORT` | `10000` | Port bound by Uvicorn server |
| `CORS_ORIGINS` | `https://merchintell.onrender.com,https://merchintell.vercel.app` | Allowed frontend origins |
| `DATA_DIR` | `/var/data` | Path for persistent POS JSON & database |

#### Persistent Disk (Recommended for Demo POS State):
- **Mount Path**: `/var/data`
- **Size**: 1 GB

---

## 4. Option C: Frontend Deployment on Vercel / Render Static Site

### Frontend Configuration (Vercel or Render Static Site)
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Environment Variables (Frontend):
| Variable | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://merchintell-backend.onrender.com` | Deployed backend API base URL |

#### SPA Rewrites Setup (Vercel `vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. Security & Pre-Deployment Verification

1. **Health Check Verification**:
   ```bash
   curl https://merchintell-backend.onrender.com/health
   # Expected response: {"status": "ok"}
   ```
2. **CORS Security**: Verify that `CORS_ORIGINS` restricts access to your frontend domain in production.
3. **No Hardcoded Secrets**: Ensure `.env` is listed in `.gitignore` and no API keys are committed to Git.
