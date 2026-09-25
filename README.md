# SENTINEL-X
Intelligent Threat Detection & Situational Awareness System

**Team:** HackNova  
**Tagline:** "From Alerts to Situations"

---

## 1. Project Overview

SENTINEL-X transforms fragmented security alerts into coherent, evolving situations. Rather than overwhelming operators with hundreds of isolated alerts across CCTV, network IDS, badge access, and IoT sensors, SENTINEL-X continuously correlates multimodal events, builds an explainable topological situation graph, models state escalation, predicts future risk trajectories, and simulates counterfactual interventions to empower authorized human decision-makers.

```text
RAW MULTI-SOURCE EVENTS (CCTV, Network, Access, IoT)
                        ↓
               EVENT NORMALIZATION
                        ↓
             CONTEXTUAL CORRELATION
       (Temporal • Spatial • Entity • Semantic)
                        ↓
            NETWORKX SITUATION GRAPH
                        ↓
              SITUATION EVOLUTION
 (NORMAL → ANOMALOUS → SUSPICIOUS → ESCALATING → CRITICAL)
                        ↓
             FUTURE-STATE PREDICTION
                        ↓
          COUNTERFACTUAL INTERVENTIONS
           (MONITOR • ISOLATE • LOCKDOWN)
                        ↓
              DECISION SUPPORT
                        ↓
          REACT SITUATIONAL DASHBOARD
```

---

## 2. Key Capabilities & Innovations

- **Unified Normalization:** Ingests events from CCTV, Network, Access Control, and IoT into a uniform schema with source confidence metrics.
- **Deterministic Contextual Correlation:** Links events using temporal proximity ($\le 120$s), spatial adjacency, entity overlap (usernames, IPs, badges), and multi-step semantic breach chains.
- **Topological Situation Graph:** Generates a real-time NetworkX graph of entities, devices, events, and locations with structural analytics.
- **Explainable State Machine:** Governs progression through `NORMAL`, `ANOMALOUS`, `SUSPICIOUS`, `ESCALATING`, `CRITICAL`, and `CONTAINED` with full justification logging.
- **Immutable Evolution History:** Preserves every transition in `situation_transitions` without TTL deletions, enabling forensic timeline replay.
- **Future-State Trajectory Prediction:** Deterministically projects impending states and time horizons based on risk velocity.
- **Counterfactual Intervention Simulation:** Simulates operator choices (`MONITOR`, `ISOLATE`, `LOCKDOWN`) in a safe sandbox without altering real infrastructure.
- **Decision Support:** Computes objective trade-offs between risk reduction and operational impact, keeping the authorized human operator as the final executive authority.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 3.4.x, React Router, Lucide React, clsx, tailwind-merge
- **Backend:** Python 3.14+, FastAPI, Pydantic v2, PyMongo, NetworkX, Uvicorn, pytest, HTTPX
- **Database:** MongoDB Atlas M0 (with transparent in-memory fallback for offline test execution)
- **Architecture:** Zero TTL indexes on intelligence collections; permanent historical auditability.

---

## 4. Quick Start & Demonstration

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (tested on Python 3.14)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Windows)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings pymongo python-dotenv networkx pytest httpx

# Start the FastAPI server (runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies (already resolved in repo)
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

### Running the End-to-End Demo
1. Open the dashboard at `http://localhost:5173`.
2. Click **Start Scenario** in the top navigation bar.
3. Observe live events streaming into the feed (CCTV, Network, Access, IoT).
4. Watch the active situation transition deterministically from `NORMAL` $\to$ `ANOMALOUS` $\to$ `SUSPICIOUS` $\to$ `ESCALATING` $\to$ `CRITICAL`.
5. Examine the topological **Situation Graph** updating entities and relationships in real-time.
6. Review the **Future-State Prediction** alerting the operator to critical trajectory.
7. Test the **Counterfactual Intervention Sandbox** (`MONITOR`, `ISOLATE`, `LOCKDOWN`) to observe projected risk reduction and operational impacts.
8. Review the **Decision Support** recommendation card.

---

## 5. Running Verification Tests

### Backend Test Suite
```bash
cd backend
.\.venv\Scripts\pytest tests -v
```
*Executes all 18 unit and integration tests covering normalization, correlation, graph generation, state machine, predictions, counterfactuals, recommendations, and end-to-end event-to-decision pipeline.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Builds production bundles cleanly with zero TypeScript errors.*

---

## 6. Project Structure

```text
SENTINEL-X/
├── frontend/                     # React + Vite + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/           # Feed, Graph, Timeline, Sandbox, Decision Support
│   │   ├── pages/                # Dashboard, Situations, Events, SituationDetails
│   │   ├── services/             # api.ts (FastAPI client)
│   │   └── types/                # TypeScript domain models
├── backend/                      # FastAPI intelligence service
│   ├── app/
│   │   ├── api/routes/           # events, situations, simulation
│   │   ├── db/                   # MongoDB Atlas connection & non-TTL indexes
│   │   ├── intelligence/         # Normalization, correlation, graph, evolution, counterfactual
│   │   ├── models/               # Domain models
│   │   └── services/             # Orchestration services
│   └── tests/                    # Unit and integration pytest suite
├── data/scenarios/               # Multi-source reproducible breach scenario
├── docs/                         # Architecture, event model, situation model, API specs
└── scripts/                      # Scenario streaming and DB verification utilities
```

---

## 7. Data Retention & Compliance

In strict compliance with SENTINEL-X operational requirements:
- **NO TTL INDEXES** exist on `events`, `situations`, `situation_transitions`, `predictions`, `interventions`, or `recommendations`.
- Complete incident timelines remain permanently reconstructible for post-incident review and forensic auditing.
