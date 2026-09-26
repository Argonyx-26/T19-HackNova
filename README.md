<div align="center">

# 🛡️ SENTINEL-X
### *Enterprise Cyber-Physical Threat Intelligence & Situational Reasoning Platform*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-seltinal--x.vercel.app-00F0FF?style=for-the-badge&logo=vercel&logoColor=white)](https://seltinal-x.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://seltinal-x.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vision AI](https://img.shields.io/badge/Vision%20AI-Ultralytics%20YOLOv8%20%7C%20ByteTrack-FF6F00?style=for-the-badge&logo=pytorch&logoColor=white)](https://docs.ultralytics.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20No%20TTL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br />

**"From Disconnected Alerts to Unified, Explainable Cyber-Physical Situations"**

[🌐 **Explore Live Application**](https://seltinal-x.vercel.app/) • [📖 **Deployment Guide**](DEPLOYMENT.md) • [🎥 **Video Intelligence Docs**](docs/LIVE_VIDEO_INTELLIGENCE.md) • [📊 **Evaluation Spec**](docs/EVALUATION.md)

</div>

---

## 🌌 Executive Summary

Modern enterprise security operations centers (SOCs) are overwhelmed by thousands of fragmented alerts across physical security (CCTV cameras, turnstile badges, perimeter sensors) and cybersecurity infrastructure (firewalls, IDS/IPS, lateral movement detectors). 

**SENTINEL-X** solves alert fatigue by introducing an autonomous **Multi-Modal Situational Intelligence & Reasoning Engine**. It continuously fuses real-time computer vision tracking, badge telemetry, and network flows into an evolving **Topological Situation Graph**, evaluates explainable risk escalation state machines, projects impending threat trajectories, and enables interactive **counterfactual sandbox simulations** before operators commit interventions.

```text
 ╔══════════════════════════════════════════════════════════════════════════════╗
 ║                         SENTINEL-X COGNITIVE PIPELINE                        ║
 ╚══════════════════════════════════════════════════════════════════════════════╝
   [ CCTV Cameras ]    [ Badge Turnstiles ]    [ Network IDS ]    [ IoT Racks ]
          │                     │                     │                 │
          └─────────────────────┼─────────────────────┴─────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 1. Unified Event Ingestion & Normalization   │ (Confidence & Schemas)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 2. Contextual & Spatial Correlation Engine   │ (Temporal ≤120s • Multi-Hop)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 3. D3 / NetworkX Topological Situation Graph │ (Entity-Device-Zone Physics)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 4. Explainable State Machine & Threat DNA    │ (NORMAL → ESCALATING → CRITICAL)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 5. Future-State Trajectory & Blast Radius    │ (Deterministic Risk Projection)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 6. Counterfactual Simulation & Why-Not Jury  │ (MONITOR vs ISOLATE vs LOCKDOWN)
         └──────────────────────┬───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │ 7. Operator Decision Support & Action Plans  │ (Human-in-the-Loop Authority)
         └──────────────────────────────────────────────┘
```

---

## ⚡ Key Highlights & Core Capabilities

### 🎥 1. Production Live Video Intelligence Engine
- **Ultralytics YOLOv8 & ByteTrack Integration**: Real-time object detection and persistent tracking across multi-camera streams with kinematic velocity tracking.
- **Polygonal ROI Zones**: Ingests custom polygon zones (Lobby, Vault Corridor, Server Racks, Parking) and triggers spatial dwell, loitering, and boundary breach alerts.
- **Physical Security Command Center**: 5-Camera widescreen surveillance matrix with live MJPEG feeds and dynamic computer-vision reticles.
- **Zero-Latency Fallbacks**: Photorealistic dynamic simulation fallbacks ensure uninterrupted demonstration even when hardware cameras are offline.

### 🧬 2. Cyber-Physical Threat DNA & Reasoning Engine
- **Multi-Modal Cross-Domain Fusion**: Corroborates physical access badges with concurrent lateral movement and external data exfiltration.
- **Evidence Shadow & Why-Not Analysis**: Explicitly justifies why the system accepted or rejected alternative threat hypotheses, eliminating black-box AI decisions.
- **Visual Language Model (VLM) Synthesis**: Automated high-level situation briefs synthesizing multi-source telemetry.

### 🌐 3. Interactive Topology & Global Situational Map
- **D3.js Force-Directed Physics Graph**: Interactive nodes representing entities, physical zones, server racks, and IPs with real-time risk pulses.
- **3D Interactive Threat Globe**: Global geo-spatial attack trajectory projection with pulsing warning beacons.
- **Attack Chain & Blast Radius Visualizers**: Explores MITRE ATT&CK technique mapping and projected financial/asset exposure.

### 🎮 4. Counterfactual Sandbox & Decision Support
- **Simulate Interventions**: Test `MONITOR`, `ISOLATE RACK`, or `FULL LOCKDOWN` to evaluate projected risk mitigation vs. operational disruption cost.
- **Operator Governance**: Preserves immutable forensic audit trails in MongoDB without destructive TTL expirations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI/UX** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Particles |
| **Data Visualization** | D3.js (Force Simulation), Lucide Tactical HUDs, Custom MJPEG Streamers |
| **Backend Services** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, NetworkX, HTTPX |
| **Computer Vision / ML** | Ultralytics YOLOv8 (`yolov8n.pt`), OpenCV Headless, PyTorch (CPU-optimized) |
| **Database & Storage** | MongoDB 7.0 / MongoDB Atlas (Immutable non-TTL event history) |
| **Deployment & Hosting** | [Vercel](https://seltinal-x.vercel.app/) (Frontend) + [Render](https://render.com) (Backend) + Docker |

---

## 🚀 Live Demo & Quick Start

### 🌐 Live Hosted Application
Access the production deployment immediately in your browser:
👉 **[https://seltinal-x.vercel.app/](https://seltinal-x.vercel.app/)**

---

### 💻 Local Development Setup

#### Prerequisites
- **Node.js**: v18+ & npm
- **Python**: v3.10+ (tested on Python 3.11 and 3.14)
- **MongoDB**: Local MongoDB or free MongoDB Atlas URI

#### 1. Clone the Repository
```bash
git clone https://github.com/Argonyx-26/T19-HackNova.git
cd T19-HackNova
```

#### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies (CPU-optimized)
pip install --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Backend API will be available at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

#### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend will launch at `http://localhost:5173`.*

---

## 🐳 Docker Deployment

Run the complete full-stack platform (MongoDB + Backend + Frontend) locally with one command:

```bash
docker compose up --build -d
```
- Frontend UI: `http://localhost`
- Backend API: `http://localhost:8000`
- API Health Check: `http://localhost:8000/health`

---

## 🧪 Verification & Test Suite

Run the automated test suite covering event normalization, topological graph building, video detection streams, and counterfactual simulation:

```bash
# Run backend pytest suite
pytest backend/tests/test_video_intelligence.py -v
pytest backend/tests/ -v

# Run frontend production build validation
cd frontend && npm run build
```

---

## 📁 Repository Structure

```text
SENTINEL-X/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (events, situations, reasoning, video, simulation)
│   │   ├── core/                # Configuration & environment validation
│   │   ├── db/                  # MongoDB Atlas connection manager & permanent indexes
│   │   ├── intelligence/        # Normalization, state machine, graph engine & YOLO video
│   │   ├── models/              # Pydantic schemas (DNA, Evidence, Topology, Video, VLM)
│   │   └── services/            # Cyber-physical fusion & reasoning services
│   ├── tests/                   # Pytest test suites (unit + integration + video)
│   └── requirements.txt         # Production backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Situation Hero, 5-Camera Grid, Threat DNA, Why-Not Engine
│   │   ├── pages/               # Dashboard, Situations, Events, Details, Login
│   │   ├── services/            # Typed API & WebSocket client (api.ts)
│   │   └── types/               # Domain TypeScript interfaces
│   ├── vercel.json              # Vercel SPA routing configuration
│   └── package.json
├── docs/                        # Specifications & Video Intelligence Architecture
├── DEPLOYMENT.md                # Cloud deployment manual (Vercel + Render + Atlas)
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Full-stack composition
├── render.yaml                  # Render Infrastructure-as-Code Blueprint
├── railway.json                 # Railway configuration
└── yolov8n.pt                   # Lightweight YOLOv8 neural network weights
```

---

## 📜 Compliance & Immutable Forensics

In strict accordance with enterprise situational intelligence requirements:
- **No Time-To-Live (TTL) Index Deletions**: Events, situations, and transition logs are stored permanently.
- **Audit-Ready Reproducibility**: Complete forensic incident chronologies can be replayed at any point for post-mortem review.

---

<div align="center">
  <b>Developed for HackNova &bull; Team T19</b><br />
  <sub>Empowering human operators with explainable, multi-modal situational intelligence.</sub>
</div>
