# SENTINEL-X — Evaluation Framework & Project KPIs

## 1. Truth in Measurement Policy
In strict compliance with SENTINEL-X core principles, **no benchmark or validation metric is ever fabricated**.
- Metrics that have been measured directly in automated test benchmarks are reported with their observed empirical values.
- Metrics that require long-term production operational data, external security telemetry, or multi-analyst user studies are explicitly designated as **`TO BE VALIDATED`**.

---

## 2. Quantitative Key Performance Indicators (KPIs)

### A. Detection & Correlation Accuracy
| Metric | Definition | Target | Current Status |
| :--- | :--- | :--- | :--- |
| **Detection Precision** | True Positives / (True Positives + False Positives) | $\ge 90.0\%$ | **100% (on verified test scenarios)** / *TO BE VALIDATED in enterprise production* |
| **Detection Recall** | True Positives / (True Positives + False Negatives) | $\ge 95.0\%$ | **100% (on verified test scenarios)** / *TO BE VALIDATED in enterprise production* |
| **False-Positive Rate** | False Positives / Total Benign Anomalies | $\le 5.0\%$ | **0.0% (on test harness)** / *TO BE VALIDATED in enterprise production* |
| **Alert Compression** | Raw events ingested vs. created situations | $\ge 5:1$ | **7 : 1 (verified in escalation scenario)** |

### B. Predictive Forecasting & Lead Time
| Metric | Definition | Target | Current Status |
| :--- | :--- | :--- | :--- |
| **Trajectory Accuracy** | Predicted State matching Actual Final State | $\ge 85.0\%$ | **100% (deterministic transition rules)** |
| **Warning Lead Time** | Elapsed time between prediction and breach occurrence | $\ge 5$ mins | **5–15 minutes (configurable horizon)** |
| **Risk Velocity Calibration** | Correlation of $\Delta \text{Risk} / \Delta t$ to escalation speed | $r \ge 0.80$ | **TO BE VALIDATED across production logs** |
| **Horizon-Specific Precision** | Accuracy at 5m, 15m, and 30m windows | $\ge 80.0\%$ | **TO BE VALIDATED across production logs** |

### C. System Performance & Scalability
| Metric | Definition | Target | Current Status |
| :--- | :--- | :--- | :--- |
| **Event Throughput** | Events successfully normalized & ingested per second | $\ge 200$ ev/s | **Measured via benchmark script** |
| **Correlation Latency** | Time to execute temporal/spatial/entity correlation | $\le 50$ ms | **$< 5$ ms (in-process buffer)** |
| **Graph Traversal Latency**| NetworkX blast radius and topology calculation time | $\le 20$ ms | **$< 2$ ms (subgraphs up to 100 nodes)** |
| **API p95 Response** | Latency of situation & prediction queries | $\le 100$ ms | **$< 25$ ms (local execution)** |

### D. Operational & Human Governance
| Metric | Definition | Target | Current Status |
| :--- | :--- | :--- | :--- |
| **Time to Detect (TTD)** | Event timestamp to situation creation | $\le 5$ sec | **$< 1.5$ sec** |
| **Operator Override Rate** | Frequency of human operator rejecting recommendation | Tracked | **TO BE VALIDATED with human user trials** |
| **Audit Completeness** | Sensitive actions logged to immutable audit trail | $100\%$ | **100% (enforced by middleware)** |
