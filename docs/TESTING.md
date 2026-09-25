# SENTINEL-X — Comprehensive Testing Strategy

## 1. Testing Philosophy
The SENTINEL-X testing strategy adheres to strict empirical validation:
- **No Fabricated Assertions:** Test assertions reflect actual deterministic behaviors, verified bounds, and reproducible test states.
- **Test Isolation:** Background storage resets and isolated collections guarantee zero cross-test data pollution.
- **Multi-Level Verification:** Unit $\to$ Integration $\to$ Scenario Benchmark $\to$ End-to-End Pipeline $\to$ Frontend Production Compilation.

---

## 2. Test Classification Matrix

| Test Suite | Scope | Location | Target Execution Time |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Normalization, Correlation, State Machine, Prediction, Blast Radius, Threat Intel, ATT&CK Mapping, Behavioral Baseline | `backend/tests/unit/` | $< 2.0$ seconds |
| **Integration Tests** | Ingestion REST API, Situation Evolution, Transition Log Persistence, Context Feeds, RBAC & Audit | `backend/tests/integration/` | $< 3.0$ seconds |
| **End-to-End Scenario** | Full breach stream from `NORMAL` $\to$ `CRITICAL`, Counterfactual Simulation, Decision Support | `backend/tests/integration/test_end_to_end_pipeline.py` | $< 1.5$ seconds |
| **Performance Benchmarks** | Ingestion throughput (events/sec), correlation latency, graph traversal time | `scripts/benchmark_engine.py` | Measured empirically |
| **Frontend Static & Build** | TypeScript strict typing, React 19 JSX compilation, Vite bundling | `frontend/` (`npm run build`) | $< 10$ seconds |

---

## 3. Scenario-Based Evaluation Framework
The test harness evaluates the intelligence engine against 6 distinct operational scenarios:
1. **Normal Activity:** Routine badge access, benign network traffic $\to$ Situation remains `NORMAL`.
2. **Benign Anomaly:** Single isolated badge failure during business hours $\to$ Advances to `ANOMALOUS`, then de-escalates without correlation.
3. **True Attack Progression:** Coordinated multi-source intrusion (`ACCESS_DENIED` $\to$ `CCTV_PRESENCE` $\to$ `PORT_SCAN` $\to$ `EXFILTRATION`) $\to$ Advances deterministically: `NORMAL` $\to$ `ANOMALOUS` $\to$ `SUSPICIOUS` $\to$ `ESCALATING` $\to$ `CRITICAL`.
4. **False Positive Suppression:** Uncorrelated high-severity alerts from disconnected locations are prevented from triggering false escalation.
5. **Missing Signal Tolerance:** Pipeline maintains tracking even when one source (e.g. CCTV) is delayed or offline.
6. **Conflicting Signals:** Rapid de-escalation event occurring during active exfiltration is properly weighted by risk velocity rather than blindly clearing the alert.

---

## 4. Execution Commands
```powershell
# Run full backend test suite with verbose output
cd backend
.\.venv\Scripts\pytest tests -v

# Run performance benchmark suite
python ..\scripts\benchmark_engine.py

# Run frontend production build validation
cd ..\frontend
npm run build
```
