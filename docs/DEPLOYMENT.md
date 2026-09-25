# SENTINEL-X — Deployment & Production Architecture Guide

## 1. Deployment Topologies

### Development (Local Mode)
- **Backend:** FastAPI on Uvicorn (`http://127.0.0.1:8000`)
- **Frontend:** Vite React Dev Server (`http://127.0.0.1:5173`)
- **Storage:** In-memory resilient storage or local MongoDB instance

### Production / Staging
- **Frontend:** Static SPA served via Nginx, Cloudflare Pages, or Vercel with CDN caching.
- **Backend:** FastAPI running under multi-worker Uvicorn / Gunicorn behind a reverse proxy (Nginx or AWS ALB).
- **Database:** MongoDB Atlas M0/M10 Cluster with TLS 1.3 encryption and IP access lists.

```text
CLIENT BROWSER (HTTPS)
          │
          ▼
   REVERSE PROXY / CDN (Nginx / Cloudflare)
    ┌─────┴────────────────────────┐
    │                              │
    ▼ (Static SPA)                 ▼ (REST / SSE / WebSockets)
FRONTEND /dist               FASTAPI BACKEND
                             (Gunicorn + Uvicorn Workers)
                                   │
                                   ▼ (TLS 1.3)
                             MONGODB ATLAS
```

---

## 2. Environment Configuration Matrix

| Variable | Development Default | Production Recommended | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | `production` | Operational environment flag. |
| `MONGODB_URI` | `mongodb://localhost:27017` | `mongodb+srv://user:pass@cluster...` | Atlas connection string. |
| `DATABASE_NAME` | `sentinel_x` | `sentinel_x_prod` | Active database name. |
| `SECRET_KEY` | `dev-secret-key-change-in-prod` | *[Cryptographically Generated]* | Key for JWT and API auth. |
| `CORS_ORIGINS` | `["http://localhost:5173", ...]` | Strict production domain list | CORS allowed origins. |
| `CORRELATION_WINDOW_SECONDS` | `120` | `120` | Max temporal correlation delta. |

---

## 3. Rollback & Disaster Recovery Procedures
1. **Application Rollback:** Previous container image or Git release tagged and redeployed via standard zero-downtime rolling update.
2. **Database Point-in-Time Recovery (PITR):** Utilizes MongoDB Atlas continuous automated backup to restore to specific UTC timestamps without loss of historical intelligence.
3. **Emergency Disconnect:** If an event producer is compromised, individual source ingestion can be paused via API without restarting core backend services.
