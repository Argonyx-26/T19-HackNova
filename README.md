# SENTINEL-X
Intelligent Threat Detection & Situational Awareness System

**Team:** HackNova  
**Tagline:** "From Alerts to Situations"

---

## Project Overview
SENTINEL-X is a software prototype designed to overcome the fragmentation of modern security operations. Instead of bombarding security teams with isolated, context-free alerts from disparate systems, SENTINEL-X unifies heterogeneous security signals into coherent, evolving situations.

## Core Idea
The core principle of SENTINEL-X is **"From Alerts to Situations"**:
- Ingest heterogeneous streams (CCTV, Network, Access Control, IoT).
- Normalize signals into a standardized schema.
- Contextually correlate events across Time, Location, Entity, and Semantic relationships.
- Construct a dynamic **Situation Graph** (using NetworkX) to map real-time threat topologies.
- Track state progression through an explainable finite state machine (`NORMAL` → `ANOMALOUS` → `SUSPICIOUS` → `ESCALATING` → `CRITICAL`).
- Evaluate future risk trajectories and simulate counterfactual actions (`MONITOR`, `ISOLATE`, `LOCKDOWN`) to support authorized human decision-makers.

## Planned Architecture

```text
CCTV / NETWORK / ACCESS / IoT
               │
               ▼
        EVENT INGESTION
               │
               ▼
      EVENT NORMALIZATION
               │
               ▼
     CONTEXTUAL CORRELATION
(Time • Entity • Location • Relations)
               │
               ▼
        SITUATION GRAPH
          (NetworkX)
               │
               ▼
      SITUATION EVOLUTION
(NORMAL → ANOMALOUS → SUSPICIOUS → ESCALATING → CRITICAL)
               │
       ┌───────┴───────┐
       ▼               ▼
  FUTURE-STATE   COUNTERFACTUAL
     ENGINE          ENGINE
       └───────┬───────┘
               ▼
        DECISION SUPPORT
               │
               ▼
      REACT SITUATIONAL UI
```

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic, PyMongo
- **Database:** MongoDB Atlas (Free Tier)
- **Intelligence & Graph:** NetworkX, deterministic correlation engine (scikit-learn optional enhancement)
- **Development Environment:** Google Antigravity IDE (Local Mode)

## Development Roadmap
- **M0:** Environment Verification
- **M1:** Repository Initialization
- **M2:** React Frontend Setup
- **M3:** Tailwind CSS Foundation
- **M4:** FastAPI Backend Setup
- **M5:** MongoDB Atlas Integration
- **M6:** Normalized Event Model
- **M7:** Event Simulator
- **M8:** Event Ingestion API
- **M9:** Contextual Correlation Engine
- **M10:** Situation Graph (NetworkX)
- **M11:** Situation State Machine
- **M12:** Situation Evolution Engine
- **M13:** Future-State Prediction
- **M14:** Counterfactual Engine
- **M15:** Decision Support
- **M16:** React Situational UI
- **M17:** End-to-End Integration
- **M18–M20:** Optional Enhancements (ML, LLM Explanation, YOLO)
- **M21–M22:** Testing, Verification & Final Packaging
