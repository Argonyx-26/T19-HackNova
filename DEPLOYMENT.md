# 🚀 SENTINEL-X Deployment Guide

This guide details how to deploy **SENTINEL-X** in production using **Vercel (Frontend)** + **Render / Railway (FastAPI & YOLO Backend)** + **MongoDB Atlas (Database)**.

---

## 🏗 Architecture Overview

| Component | Technology | Target Host |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS | [Vercel](https://vercel.com) |
| **Backend** | Python 3.11, FastAPI, Ultralytics YOLOv8, OpenCV | [Render](https://render.com) or [Railway](https://railway.app) |
| **Database** | MongoDB 7.0 / Atlas Cluster | [MongoDB Atlas](https://www.mongodb.com/atlas) (Free Tier) |

---

## Step 1: Deploy MongoDB Atlas Database (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. Create a free **M0 Sandbox** cluster (e.g. AWS / us-east-1).
3. Under **Database Access**, create a user (e.g., `sentinel_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** -> Copy the connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sentinel_x?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render (or Railway)

### Option A: Render (Recommended Blueprint)

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service** (or **Blueprints**).
3. Connect your GitHub repository: `Argonyx-26/T19-HackNova`.
4. Configure the Web Service settings:
   - **Name**: `sentinel-x-backend`
   - **Language/Runtime**: `Python 3`
   - **Root Directory**: Leave blank (root)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `PYTHON_VERSION` | `3.11.9` |
   | `ENVIRONMENT` | `production` |
   | `DEBUG` | `false` |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sentinel_x?retryWrites=true&w=majority` |
   | `MONGODB_DATABASE` | `sentinel_x` |
   | `CORS_ORIGINS` | `*` |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://sentinel-x-backend.onrender.com`).

### Option B: Railway

1. Go to [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo** -> Select `Argonyx-26/T19-HackNova`.
3. Add the environment variables from the table above.
4. Under Settings -> Networking, generate a public domain (e.g., `https://sentinel-x-backend.up.railway.app`).

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the Git repository: `Argonyx-26/T19-HackNova`.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://sentinel-x-backend.onrender.com` (your backend URL from Step 2) |
5. Click **Deploy**.
6. Vercel will build and assign a production URL (e.g. `https://t19-hacknova.vercel.app`).

---

## Step 4: Verification & Smoke Test

1. Open your Vercel URL in your browser.
2. Verify:
   - ✅ **Cinematic Opening Stage** renders cleanly with the audio/visual timeline.
   - ✅ **Physical Security Command Center (5 Camera Feeds)** renders live MJPEG feeds and computer vision tracking reticles.
   - ✅ **Threat Topology Network** and **Graph Physics** initialize smoothly.
   - ✅ **Live Situations & Why-Not Engine** synthesize multi-modal indicators.
3. Test backend health: `https://<your-backend-url>/health` should return:
   ```json
   {
     "status": "healthy",
     "service": "sentinel-x",
     "database": "connected"
   }
   ```

---

## 🐳 Alternative: 1-Command Local/VPS Docker Deployment

If you want to run the full stack on any VPS (DigitalOcean, AWS EC2, GCP, Ubuntu server) with Docker:

```bash
# Clone the repository
git clone https://github.com/Argonyx-26/T19-HackNova.git
cd T19-HackNova

# Start MongoDB, Backend, and Frontend containers
docker compose up --build -d

# Access frontend at http://localhost (or your server IP)
# Backend API available at http://localhost:8000
```
