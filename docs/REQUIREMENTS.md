# SENTINEL-X — System Requirements Specification (SRS)

## 1. Functional Requirements (FR)

### Module 1: Event Ingestion & Normalization
- **FR-1.1:** System MUST ingest multimodal events via REST (`POST /api/events`) and batch streaming from CCTV, Network, Access Control, and IoT sources.
- **FR-1.2:** System MUST normalize raw events into `NormalizedEvent` schema with bounded severity ($0.0 \dots 1.0$) and source confidence ($0.0 \dots 1.0$).
- **FR-1.3:** System MUST reject malformed payloads with descriptive 422 HTTP validation errors while maintaining pipeline stability.

### Module 2: Contextual Correlation & Graph
- **FR-2.1:** System MUST evaluate temporal correlation within a configurable window ($\Delta t \le 120$s default).
- **FR-2.2:** System MUST correlate spatial adjacency across physical locations (e.g., `loc-bld-b-door` and `loc-bld-b-srv`).
- **FR-2.3:** System MUST link events sharing common entities (usernames, badge IDs, IP addresses, MACs).
- **FR-2.4:** System MUST dynamically maintain a NetworkX directed situation graph with node types (`Person`, `Device`, `Camera`, `AccessPoint`, `Location`, `Event`, `Situation`) and edge types (`ACCESSED`, `LOCATED_AT`, `OBSERVED_BY`, `TRIGGERED`, `ASSOCIATED_WITH`).

### Module 3: Threat Intelligence (TI)
- **FR-3.1:** System MUST store and query normalized indicators (`ThreatIntelligenceIndicator`) across types `IP`, `DOMAIN`, `HASH`, and `URL`.
- **FR-3.2:** System MUST automatically match ingested event payloads against active indicators and flag matched situations with indicator confidence and threat context.

### Module 4: MITRE ATT&CK Mapping
- **FR-4.1:** System MUST map correlated events and situations to explicit MITRE ATT&CK tactics and techniques based on deterministic evidence rules.
- **FR-4.2:** Every ATT&CK mapping MUST include tactic, technique ID, technique name, triggering event IDs, and confidence score.

### Module 5: Behavioral Baseline & Anomaly Profiling
- **FR-5.1:** System MUST maintain statistical baselines for entity and device access behavior (hours, zones, packet volume).
- **FR-5.2:** System MUST compute deviation scores ($0.0 \dots 1.0$) comparing incoming event context against established baseline profiles.
- **FR-5.3:** System MUST handle cold-start entities gracefully with an explicit flag and reduced confidence weighting until minimum observations are met.

### Module 6: Situation Evolution & Blast Radius
- **FR-6.1:** System MUST enforce deterministic finite state transitions: `NORMAL` $\to$ `ANOMALOUS` $\to$ `SUSPICIOUS` $\to$ `ESCALATING` $\to$ `CRITICAL` $\to$ `CONTAINED`.
- **FR-6.2:** System MUST compute blast radius through graph traversal, identifying directly affected and potentially affected assets, dependency paths, and spread dimensions (physical, network, identity, data).

### Module 7: Predictive Forecasting & Counterfactual Simulation
- **FR-7.1:** System MUST compute deterministic future-state trajectory predictions based on risk velocity, transition rates, and attack chain stage.
- **FR-7.2:** System MUST simulate counterfactual intervention choices (`MONITOR`, `ISOLATE`, `LOCKDOWN`) returning projected risk change and operational impact assessments without touching physical systems.
- **FR-7.3:** System MUST evaluate predictions against actual observed transitions, recording accuracy and lead times.

### Module 8: Human-in-the-Loop & Decision Support
- **FR-8.1:** System MUST generate advisory recommendations with clear justification and operator authority disclaimers.
- **FR-8.2:** System MUST support operator feedback actions: `ACKNOWLEDGE`, `APPROVE`, `REJECT`, `OVERRIDE`, and `FEEDBACK` (`CORRECT`, `INCORRECT`, `UNCERTAIN`, `FALSE_POSITIVE`, `FALSE_NEGATIVE`).

### Module 9: RBAC & Audit Logging
- **FR-9.1:** System MUST enforce Role-Based Access Control across `ADMIN`, `SECURITY_OPERATOR`, `ANALYST`, and `VIEWER`.
- **FR-9.2:** System MUST maintain an immutable audit log (`audit_logs`) recording every sensitive operator action, simulation, and configuration update.

---

## 2. Non-Functional Requirements (NFR)

### Performance & Scalability
- **NFR-1 (Throughput):** Ingest and process $\ge 200$ events/second on standard compute nodes.
- **NFR-2 (Correlation Latency):** Event-to-situation correlation execution time $\le 50$ ms (p95).
- **NFR-3 (API Response):** REST query endpoints return in $\le 100$ ms (p95).

### Security & Privacy
- **NFR-4 (Data Retention):** Zero TTL indexes on intelligence collections. Historical records preserved permanently for forensics.
- **NFR-5 (Pseudonymization):** PII (usernames, badge IDs, IP addresses) masked for non-authorized viewer roles upon export.
- **NFR-6 (Auditability):** Audit records cannot be altered or purged through standard API endpoints.

### Reliability & Resilience
- **NFR-7 (Resilient Fallback):** Backend must operate with zero crashes in resilient simulation mode if external MongoDB is offline.
- **NFR-8 (Availability):** Health endpoints must reflect component-level status (DB, Engine, Queue).
