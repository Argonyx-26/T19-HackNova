# SENTINEL-X — Security Architecture & Threat Model

## 1. Security Architecture Principles

1. **Defense-in-Depth:** Validation occurs at the API boundary (Pydantic schemas), authorization layer (RBAC dependencies), and domain processing layer.
2. **Principle of Least Privilege (PoLP):** Granular permissions dictate access to situations, raw telemetry, simulations, and decision actions.
3. **Human-in-the-Loop Imperative:** Automated intelligence is strictly advisory. SENTINEL-X executes simulations of `MONITOR`, `ISOLATE`, and `LOCKDOWN`, but never directly controls real-world actuator hardware.
4. **Immutable Auditability:** Security actions, state transitions, operator feedback, and system configuration updates are permanently written to `audit_logs` without deletion or TTL capabilities.

---

## 2. Threat Model (STRIDE)

| Threat Category | Potential Attack Vector | SENTINEL-X Defense Mechanism |
| :--- | :--- | :--- |
| **Spoofing** | Forged event ingestion impersonating trusted CCTV/Network sensors. | API key authentication, source validation, and indicator correlation. |
| **Tampering** | Mutation of historical situation transitions or audit logs. | Append-only database collections, unique transition UUIDs, and immutable change records. |
| **Repudiation** | Operator denies executing an intervention simulation or overriding a recommendation. | Mandatory operator identification (`operator_id`), timestamping, and audit logging. |
| **Information Disclosure** | Unauthorized viewing of sensitive employee badge IDs, IP addresses, or CCTV metadata. | Role-Based Access Control and automated data masking/pseudonymization. |
| **Denial of Service** | Event burst flooding the ingestion endpoint to stall correlation processing. | Bounded sliding correlation window ($\le 120$s) and async task offloading. |
| **Elevation of Privilege** | Standard viewer escalating to approve or reject situational recommendations. | Strict RBAC enforcement via FastAPI security dependencies (`SecurityContext`). |

---

## 3. Role-Based Access Control (RBAC) Specification

| Role | Description | Allowed Actions |
| :--- | :--- | :--- |
| **ADMIN** | System administrator | Full read/write, user & role management, indicator creation, audit log access, scenario control. |
| **SECURITY_OPERATOR** | Incident responder / SOC operator | Read situations, events, graph, and predictions; execute simulations; acknowledge/approve/override recommendations; submit feedback. |
| **ANALYST** | Threat hunter / Intelligence analyst | Read-only access to events, situations, ATT&CK mappings, and blast radius; submit feedback notes. |
| **VIEWER** | Executive / Auditor | Read-only access to high-level dashboards with PII and sensitive badge/IP data masked. |

---

## 4. Secret & Credential Hygiene
- All sensitive variables (e.g., `MONGODB_URI`, `SECRET_KEY`, `API_KEY`) must be loaded from environment variables via `pydantic-settings` (`config.py`).
- No plaintext credentials, connection strings with embedded passwords, or secret keys may be committed to Git.
- `.env` is permanently excluded via `.gitignore`.
