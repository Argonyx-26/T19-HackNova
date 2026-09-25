# SENTINEL-X — Project Master Plan

## 1. Executive Summary
- **Project Name:** SENTINEL-X
- **Tagline:** *"From Alerts to Situations"*
- **Team:** HackNova
- **Domain:** Intelligent Threat Detection & Situational Awareness System

SENTINEL-X is an enterprise-grade situational-intelligence platform engineered to solve the acute alert-fatigue and cognitive-overload crisis in modern Security Operations Centers (SOCs). Rather than presenting operators with hundreds of fragmented, uncoordinated alerts from CCTV, network sensors, physical access control, and IoT devices, SENTINEL-X normalizes, contextually correlates, maps to MITRE ATT&CK, constructs an explainable situation graph, computes behavioral baselines, predicts future-state trajectories, and evaluates counterfactual interventions.

---

## 2. Problem Statement
Modern security environments face four fundamental challenges:
1. **Alert Fragmentation:** Security signals are siloed across disparate platforms (SIEM, EDR, physical badge access, CCTV video management, building IoT).
2. **Cognitive Overload & Alert Fatigue:** Operators spend up to 70% of triage time manually correlating timestamps, IP addresses, and physical locations.
3. **Reactive Posture:** Traditional tools report what has already occurred, providing zero deterministic forecasting of threat progression.
4. **Opaque Recommendations:** AI-driven tools often present "black box" decisions without verifiable audit trails, violating human-in-the-loop safety principles.

---

## 3. Vision & Mission
- **Vision:** To become the standard for explainable, human-governed cyber-physical situational awareness where threat evolution is anticipated before critical asset breach occurs.
- **Mission:** Transform discrete security alerts into dynamic, graph-backed, explainable situations that empower human operators to simulate and execute optimal containment interventions.

---

## 4. Target Users & Stakeholders
| Persona | Role | Primary Need |
| :--- | :--- | :--- |
| **SOC Tier-1 / Tier-2 Analyst** | Security Operator | Rapid correlation, contextual timeline, threat identification, and actionable decision options. |
| **SOC Manager / CISO** | Executive / Strategic | Situational risk posture, blast-radius assessment, compliance reporting, and audit trails. |
| **Threat Intelligence Analyst** | Advanced Threat Hunter | MITRE ATT&CK alignment, indicator matching, and attack-chain progression tracking. |
| **Physical Security Operator** | Facilities & Safety | Integration of badge rejections, CCTV presence, and physical zone breach correlation. |

---

## 5. SMART Objectives
1. **Correlation Latency:** Correlate multimodal events across 4 sources within $\le 50$ ms of ingestion under sustained load of 500 events/sec.
2. **Alert Compression Ratio:** Compress raw alerts into correlated situations by a factor of $\ge 5:1$ (measurable).
3. **Deterministic State Machine:** Enforce 100% explainable state transitions across `NORMAL`, `ANOMALOUS`, `SUSPICIOUS`, `ESCALATING`, `CRITICAL`, and `CONTAINED`.
4. **Forecast Lead Time:** Provide deterministic future-state warnings with at least 5–15 minutes of projected operator lead time.
5. **Human Governance:** Maintain 100% human-in-the-loop authority with zero autonomous physical/network containment actions executed without human authorization.

---

## 6. Scope Boundaries

### In-Scope
- Ingestion and normalization of CCTV, Network, Access Control, and IoT security events.
- Deterministic contextual correlation (Temporal $\le 120$s, Spatial, Entity, Semantic Chains).
- NetworkX topological situation graph generation and metrics.
- Threat intelligence indicator matching (IP, Domain, Hash, URL) with confidence scoring.
- MITRE ATT&CK tactic and technique mapping with explicit evidence logging.
- Behavioral baseline profiling and deviation scoring with cold-start management.
- Operator feedback collection (`CORRECT`, `INCORRECT`, `UNCERTAIN`, `FALSE_POSITIVE`, `FALSE_NEGATIVE`).
- Predictive trajectory evaluation against actual observed outcomes.
- Blast radius graph traversal (affected/potentially affected physical & cyber assets).
- Attack-chain multi-stage reconstruction (Initial Access $\to$ Exfiltration).
- Counterfactual intervention sandbox (`MONITOR`, `ISOLATE`, `LOCKDOWN`).
- Role-Based Access Control (RBAC) and immutable audit logging.
- React/TypeScript dark-mode tactical dashboard with OSIRIS-style global context and D3 3D globe.

### Out-of-Scope
- Direct automated physical actuator control (magnetic doors, physical fire suppression).
- Production autonomous firewall rule modification without human confirmation.
- Replacement of enterprise SIEM or Identity Providers (SENTINEL-X integrates as an intelligence layer).
- Heavy deep-learning video streaming transcoding (video events are ingested as metadata alerts).

---

## 7. Assumptions, Dependencies & Constraints
- **Assumptions:** Event sources provide valid UTC timestamps or ISO 8601 formatting. Network devices supply IP/hostname identifiers.
- **Dependencies:** Python 3.10+, FastAPI, Node.js 18+, MongoDB Atlas (or in-memory resilient fallback), D3.js.
- **Constraints:**
  - **Data Retention Rule:** Zero TTL indexes on intelligence collections (`events`, `situations`, `situation_transitions`, `predictions`, `interventions`, `recommendations`, `audit_logs`).
  - **Simulation Boundary:** All intervention actions remain simulation-only in the core MVP.
  - **Truthful Metric Reporting:** No fabricated benchmark percentages; unmeasured parameters must be explicitly labeled `TO BE VALIDATED`.

---

## 8. Team Roles & Governance
- **Cybersecurity Architect:** Threat modeling, ATT&CK mapping, blast radius analysis.
- **AI/ML & Analytics Engineer:** Behavioral baseline modeling, predictive validation, risk scoring.
- **Threat Intelligence Engineer:** Indicator normalization, threat correlation, IOC feeds.
- **DevSecOps Engineer:** CI/CD pipeline, Dockerization, secret hygiene, security hardening.
- **QA & Reliability Engineer:** Scenario evaluation matrix, failure mode testing, benchmarks.
- **Project Manager:** Milestone tracking, risk register management, change approval.

---

## 9. Change Management & Closure Criteria
- **Change Management:** All architectural modifications require documented rationale, impact analysis on existing APIs, and regression test verification.
- **Project Closure Criteria:**
  1. All 25 phases verified with automated tests passing (unit, integration, performance).
  2. Frontend build completes with zero errors.
  3. Complete pipeline demonstrable: Ingestion $\to$ Threat Intel $\to$ ATT&CK $\to$ Graph $\to$ Evolution $\to$ Blast Radius $\to$ Prediction $\to$ Counterfactual $\to$ Decision Support $\to$ Audit.
  4. Documentation updated reflecting actual system state.
