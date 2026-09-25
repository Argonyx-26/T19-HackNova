# SENTINEL-X REST API Specification

SENTINEL-X provides a RESTful interface built on FastAPI, returning JSON payloads with standard HTTP response codes.

Base URL: `http://localhost:8000`

---

## 1. System Health

### `GET /health`
Verifies backend service operational health and database connectivity.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "system": "SENTINEL-X",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 2. Event Ingestion & Retrieval

### `POST /api/events`
Ingests a single raw or pre-structured security event, normalizes it, persists it in MongoDB, and triggers contextual correlation.

**Request Body:**
```json
{
  "event_id": "evt-001",
  "source_type": "ACCESS",
  "event_type": "UNAUTHORIZED_BADGE_ATTEMPT",
  "timestamp": "2026-09-25T08:00:00Z",
  "entity_id": "user-8821",
  "location_id": "loc-srv-door",
  "severity": "HIGH",
  "confidence": 0.95,
  "payload": {
    "badge_id": "BDG-9941",
    "door_id": "DR-SRV-01"
  }
}
```

**Response `201 Created`:**
```json
{
  "event": { ... },
  "correlated_situation_id": "sit-a1b2c3d4",
  "status": "PROCESSED"
}
```

### `GET /api/events`
Lists ingested events with optional filtering.

**Query Parameters:**
- `source_type`: Filter by source (`CCTV`, `NETWORK`, `ACCESS`, `IOT`)
- `severity`: Filter by severity (`INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `entity_id`: Filter by entity ID
- `location_id`: Filter by location ID
- `limit`: Maximum records to return (default: `100`)

---

## 3. Situations & Graph

### `GET /api/situations`
Lists all detected and evolving situations.

**Query Parameters:**
- `status`: Optional filter by situation status (`NORMAL`, `ANOMALOUS`, `SUSPICIOUS`, `ESCALATING`, `CRITICAL`, `CONTAINED`)

### `GET /api/situations/{situation_id}`
Returns full details of a specific situation.

### `GET /api/situations/{situation_id}/timeline`
Reconstructs the chronological evolution timeline directly from the immutable `situation_transitions` collection.

**Response `200 OK`:**
```json
[
  {
    "transition_id": "trans-01",
    "situation_id": "sit-a1b2c3d4",
    "from_state": "NORMAL",
    "to_state": "ANOMALOUS",
    "reason": "Unusual off-hours authentication pattern observed",
    "risk_delta": 20.0,
    "trigger_event_id": "evt-1001",
    "timestamp": "2026-09-25T08:00:10Z"
  }
]
```

### `GET /api/situations/{situation_id}/graph`
Returns the topological NetworkX graph in a visualization-ready format.

**Response `200 OK`:**
```json
{
  "nodes": [
    {"id": "user-8821", "label": "user-8821", "type": "Person"},
    {"id": "loc-srv-door", "label": "loc-srv-door", "type": "Location"}
  ],
  "edges": [
    {"source": "user-8821", "target": "loc-srv-door", "type": "LOCATED_AT"}
  ],
  "metrics": {
    "node_count": 6,
    "edge_count": 5,
    "connected_components": 1,
    "density": 0.33
  }
}
```

---

## 4. Intelligence & Decision Support

### `GET /api/situations/{situation_id}/predictions`
Returns deterministic future-state trajectory predictions for the situation.

**Response `200 OK`:**
```json
{
  "prediction_id": "pred-abc123",
  "situation_id": "sit-a1b2c3d4",
  "current_state": "ESCALATING",
  "predicted_state": "CRITICAL",
  "risk_score": 88.0,
  "risk_delta": 18.0,
  "horizon": "5-15 minutes",
  "triggering_factors": [
    "High risk velocity: +28.0 in last 120s",
    "Semantic chain progression detected"
  ],
  "reason": "Rapid escalation with multi-source corroboration and high risk velocity indicates progression to CRITICAL.",
  "created_at": "2026-09-25T08:05:00Z"
}
```

### `POST /api/situations/{situation_id}/simulate`
Executes a simulation-only counterfactual intervention without altering real infrastructure.

**Request Body:**
```json
{
  "action": "ISOLATE"
}
```
*Allowed actions:* `MONITOR`, `ISOLATE`, `LOCKDOWN`

**Response `200 OK`:**
```json
{
  "situation_id": "sit-a1b2c3d4",
  "action": "ISOLATE",
  "current_state": "ESCALATING",
  "projected_state": "SUSPICIOUS",
  "risk_delta": -40.0,
  "projected_risk": 35.0,
  "impact_assessment": "Moderate operational disruption: Targeted endpoint network isolation applied. Prevents further lateral movement while maintaining physical site access."
}
```

### `GET /api/situations/{situation_id}/recommendation`
Generates comparative decision-support options for the human security operator.

**Response `200 OK`:**
```json
{
  "recommendation_id": "rec-xyz789",
  "situation_id": "sit-a1b2c3d4",
  "current_state": "ESCALATING",
  "recommended_action": "ISOLATE",
  "justification": "Targeted isolation significantly reduces lateral movement risk (-40 risk points) while avoiding site-wide operational paralysis.",
  "compared_actions": [
    {"action": "MONITOR", "projected_state": "CRITICAL", "risk_delta": 15.0, "impact": "Zero disruption, high breach probability"},
    {"action": "ISOLATE", "projected_state": "SUSPICIOUS", "risk_delta": -40.0, "impact": "Moderate disruption, contained lateral movement"},
    {"action": "LOCKDOWN", "projected_state": "CONTAINED", "risk_delta": -65.0, "impact": "Severe operational disruption, full perimeter lockout"}
  ],
  "operator_authority_note": "SENTINEL-X provides decision support only. Authorized human operator remains the sole executive authority."
}
```

---

## 5. Scenario Simulation Controls

### `POST /api/simulation/start`
Starts autonomous streaming of the reproducible multi-source security scenario.

### `POST /api/simulation/stop`
Pauses/halts scenario streaming.

### `GET /api/simulation/status`
Returns streaming progress, current index, and total events streamed.
