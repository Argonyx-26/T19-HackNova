# SENTINEL-X — Technical Roadmap & Evolution Milestones

## Completed Milestones (Core Platform Baseline)
- [x] **M0–M2:** Environment verification, repo initialization, React/Vite/TS baseline.
- [x] **M3–M5:** Tailwind design tokens, FastAPI backend, MongoDB Atlas layer (NO TTLs).
- [x] **M6–M8:** Normalized event model, scenario simulator, event ingestion API.
- [x] **M9–M12:** Contextual correlation engine, NetworkX situation graph, finite state machine, situation evolution engine with timeline reconstruction.
- [x] **M13–M15:** Deterministic future-state prediction, counterfactual intervention sandbox (`MONITOR`, `ISOLATE`, `LOCKDOWN`), decision support recommendations.
- [x] **M16–M17:** React Situational UI, end-to-end integration pipeline, automated pytest suite.
- [x] **Global Context Layer:** OSIRIS-style global tactical map and interactive 3D rotating D3 wireframe globe with live threat radar tracking.

---

## Current Architecture Upgrade (Phase 1–25: Enterprise Platform)
- [x] **Phase 1:** Complete project specifications (Plan, Requirements, Risks, Security, Privacy, Testing, Evaluation, Deployment, Operations, Roadmap).
- [x] **Phase 2:** Normalized Threat Intelligence layer (IP, Domain, Hash, URL indicators, confidence, context matching).
- [x] **Phase 3:** Deterministic MITRE ATT&CK mapping with explainable evidence rules.
- [x] **Phase 4:** Behavioral baseline profiling and anomaly deviation scoring with cold-start damping.
- [x] **Phase 5:** Operator feedback collection (`CORRECT`, `INCORRECT`, `UNCERTAIN`, `FALSE_POSITIVE`, `FALSE_NEGATIVE`).
- [x] **Phase 6:** Predictive trajectory validation against actual observed outcomes.
- [x] **Phase 7:** Blast radius analysis (affected/potentially affected physical & cyber assets via graph traversal).
- [x] **Phase 8:** Multi-stage attack-chain reconstruction (Initial Access $\to$ Exfiltration).
- [x] **Phase 9–10:** Enhanced explainable risk scoring and standardized explanation schema.
- [x] **Phase 11:** Human-in-the-loop decision support (Acknowledge, Approve, Reject, Override, Notes).
- [x] **Phase 12–13:** Authentication, RBAC, immutable audit logging, and data privacy governance.
- [x] **Phase 14–17:** Real-time streaming architecture, performance benchmarking, failure resilience, and monitoring telemetry.
- [x] **Phase 18–25:** Expanded automated test suites, frontend tactical panels, API extensions, and verified zero-breakage build.

---

## Future Strategic Horizons (Post-MVP)
- **Horizon 1 (M18 - Optional ML):** Scikit-learn trajectory anomaly classification trained on offline validated feedback datasets.
- **Horizon 2 (M19 - Optional LLM Explanation Layer):** Natural-language narrative generator explaining structured situation transitions (advisory only; never source of truth).
- **Horizon 3 (M20 - Optional YOLO Edge):** Edge computer-vision inference producing normalized CCTV metadata alerts.
- **Horizon 4 (Enterprise Integration):** STIX/TAXII 2.1 automated threat intelligence ingestion feeds.
