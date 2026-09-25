# SENTINEL-X Normalized Event Model

## Schema Specification

Every heterogeneous incoming signal (CCTV, Network, Access Control, IoT) is normalized into the following schema:

| Field | Type | Description |
| :--- | :--- | :--- |
| `event_id` | String | Unique event identifier (e.g. `evt-001`) |
| `source_type` | Enum | `CCTV`, `NETWORK`, `ACCESS`, `IOT` |
| `event_type` | String | Semantic event name (e.g. `access_denied`, `port_scan`) |
| `timestamp` | ISO 8601 | UTC occurrence timestamp |
| `entity_id` | String | Primary entity involved (e.g. `person-104`, `ep-10.0.4.120`) |
| `location_id` | String | Facility zone (e.g. `lab-a`, `server-room-1`) |
| `severity` | Float [0.0 - 1.0] | Normalized severity score |
| `confidence` | Float [0.0 - 1.0] | Sensor/source detection confidence |
| `payload` | Object | Source-specific technical metadata |
| `processed` | Boolean | Whether evaluated by the correlation engine |
| `situation_id` | String (Optional)| Associated active situation ID |

## Example Event Payloads

### 1. Access Control
```json
{
  "event_id": "evt-002",
  "source_type": "ACCESS",
  "event_type": "access_denied",
  "timestamp": "2026-09-25T10:24:18Z",
  "entity_id": "person-104",
  "location_id": "lab-a",
  "severity": 0.45,
  "confidence": 0.98,
  "payload": {
    "door": "LAB-A-03",
    "attempts": 1,
    "badge_id": "BDG-9921",
    "reason": "Insufficient clearance"
  }
}
```

### 2. CCTV / Computer Vision
```json
{
  "event_id": "evt-004",
  "source_type": "CCTV",
  "event_type": "unauthorized_presence",
  "timestamp": "2026-09-25T10:25:35Z",
  "entity_id": "person-104",
  "location_id": "lab-a",
  "severity": 0.82,
  "confidence": 0.94,
  "payload": {
    "camera_id": "cam-07",
    "bounding_box": [140, 60, 260, 390],
    "tailgating_detected": true
  }
}
```

### 3. Network Syslog / EDR
```json
{
  "event_id": "evt-005",
  "source_type": "NETWORK",
  "event_type": "port_scan",
  "timestamp": "2026-09-25T10:26:10Z",
  "entity_id": "ep-10.0.4.120",
  "location_id": "lab-a",
  "severity": 0.88,
  "confidence": 0.96,
  "payload": {
    "source_ip": "10.0.4.120",
    "target_subnet": "10.0.8.0/24",
    "scanned_ports": [22, 445, 3389, 8080]
  }
}
```
