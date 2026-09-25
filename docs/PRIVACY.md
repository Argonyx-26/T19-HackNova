# SENTINEL-X — Privacy & Data Governance Specification

## 1. Scope & Objective
SENTINEL-X ingests heterogeneous security signals, including employee identifiers, access control badges, CCTV metadata, network IP addresses, and physical locations. This document establishes privacy controls, data classifications, pseudonymization policies, and forensic retention governance.

---

## 2. Data Classification Matrix

| Data Classification | Data Elements | Sensitivity | Access Restriction | Encryption & Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Confidential / PII** | Employee Names, Badge IDs, Person IDs, Physical Zone Movements | High | `ADMIN`, `SECURITY_OPERATOR` only | Pseudonymized when displayed to `VIEWER` roles or exported. |
| **Internal Operational** | IP Addresses, Hostnames, Port Numbers, Sensor IDs | Medium | `ADMIN`, `SECURITY_OPERATOR`, `ANALYST` | Masked in public audit summaries (`10.0.4.***`). |
| **System Intelligence** | Situation States, Risk Scores, ATT&CK Mappings, Threat Indicators | Low / Internal | All authenticated roles | Plaintext in secure dashboard. |
| **Audit Logs** | Operator actions, Timestamps, Simulation Choices | High | Read-only for `ADMIN`, append-only for system | Immutable append-only storage. |

---

## 3. Pseudonymization & Masking Policy
When data is viewed by non-authorized operators or exported for post-incident review:
1. **User Identifiers:** `person-104` $\to$ `usr-****-104` or cryptographic hash `H(person-104)`.
2. **Access Badges:** `BDG-9941` $\to$ `BDG-****`.
3. **Internal IP Addresses:** `10.0.4.120` $\to$ `10.0.4.***`.
4. **CCTV Faces/Biometrics:** SENTINEL-X never stores raw facial images or video streams; only standardized metadata tags (`UNAUTHORIZED_PRESENCE`, `CONFIDENCE: 0.92`) are stored.

---

## 4. Data Retention & Archival Policy
- **Forensic Retention Rule:** SENTINEL-X must preserve historical intelligence data by default. Zero TTL indexes are configured on `events`, `situations`, `situation_transitions`, `predictions`, `interventions`, and `recommendations`.
- **Right to Erasure (GDPR Art. 17) & Security Conflict:** In the event of a legally verified erasure request, PII fields (`entity_id`, `badge_id`) are cryptographically anonymized in place, preserving structural graph edges and event counts for forensic integrity without retaining identifiable personal data.
