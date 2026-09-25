# SENTINEL-X Architecture Specification

## Tagline
"From Alerts to Situations"

---

## 1. High-Level Pipeline Architecture

```text
RAW MULTI-SOURCE SIGNALS
 (CCTV, Network, Access Control, IoT)
               │
               ▼
        EVENT INGESTION
      (POST /api/events)
               │
               ▼
      EVENT NORMALIZATION
  (Unified NormalizedEvent Schema)
               │
               ▼
     CONTEXTUAL CORRELATION
(Time • Entity • Location • Semantic Chains)
               │
               ▼
        SITUATION GRAPH
     (NetworkX MultiDiGraph)
               │
               ▼
      SITUATION EVOLUTION
(NORMAL → ANOMALOUS → SUSPICIOUS → ESCALATING → CRITICAL)
               │
       ┌───────┴───────┐
       ▼               ▼
  FUTURE-STATE   COUNTERFACTUAL
 PREDICTION      INTERVENTIONS
 (Horizon & Risk) (MONITOR, ISOLATE, LOCKDOWN)
       └───────┬───────┘
               ▼
        DECISION SUPPORT
(Transparent Rationale & Human Authority)
               │
               ▼
    REACT SITUATIONAL DASHBOARD
```

---

## 2. Core Architectural Pillars

### A. Contextual Correlation Engine
Instead of analyzing isolated events in silos, the correlation engine examines events across 4 dimensions:
1. **Temporal Proximity**: Events occurring within a configurable sliding window ($\Delta T \le 120$s).
2. **Entity Intersection**: Direct matching of person IDs, MAC addresses, IP addresses, or mapped badge tokens.
3. **Spatial Adjacency**: Zone intersection or topological adjacency in the physical security layout (e.g. `corridor-south` connects to `lab-a`).
4. **Semantic Chains**: Known attack progression patterns (e.g., `access_denied` $\rightarrow$ `unauthorized_presence` $\rightarrow$ `port_scan` $\rightarrow$ `data_exfiltration_attempt`).

### B. NetworkX Situation Graph
Every correlated situation is modeled as a directed graph:
- **Node Types**: `Situation`, `Event`, `Person`, `Device`, `Camera`, `Location`.
- **Edge Types**: `CONTAINS`, `TRIGGERED`, `LOCATED_AT`, `ACCESSED`, `TEMPORAL`, `SPATIAL`, `ENTITY`.
- **Graph Metrics**: Dynamic computation of node degree, graph density, and weakly connected components.

### C. Situation State Evolution
State transitions are deterministic and strictly enforced by a finite state machine:
- `NORMAL`: All streams operating at baseline.
- `ANOMALOUS`: Single elevated security event (e.g. initial badge denial).
- `SUSPICIOUS`: Repeated attempts or visual detection of unauthorized presence.
- `ESCALATING`: Cross-domain correlation (physical access anomalies correlated with network endpoint scanning or IoT vibration alarms).
- `CRITICAL`: Active data exfiltration or catastrophic perimeter breach.
- `CONTAINED`: Post-intervention state arresting lateral movement.

Every state transition generates an immutable record stored in the `situation_transitions` collection, allowing the React timeline to reconstruct the exact historical evolution.

### D. Counterfactual "What-If" Interventions
Interventions in SENTINEL-X are **simulation-only**:
- `MONITOR`: Simulates passive observation; threat vector continues unabated, leading to `CRITICAL` state.
- `ISOLATE`: Simulates quarantining suspect network endpoints and suspending badge credentials; arrests lateral movement and drops risk score by $\approx 0.48$.
- `LOCKDOWN`: Simulates sealing physical doors in the affected zone and segmenting network switches; forces containment with high operational disruption.

### E. Human-in-the-Loop Decision Support
The decision support engine compares all three simulated actions across risk reduction and operational impact to recommend an optimal candidate action. **The authorized human security operator retains sole and final authority.**

---

## 3. Data Retention Rule
Historical intelligence records are preserved by default. **No TTL indexes are created** on `events`, `situations`, `situation_transitions`, `predictions`, `interventions`, or `recommendations`.
