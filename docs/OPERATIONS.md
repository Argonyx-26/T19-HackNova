# SENTINEL-X — Standard Operating Procedures (SOP) & Runbooks

## 1. Daily Operator Runbook
1. **Health Verification:** Navigate to the System Health panel or query `GET /health` and `GET /api/system/health`. Verify all components (`Database`, `Correlation Engine`, `Ingestion Pipeline`) report `OK`.
2. **Active Situation Monitoring:** Monitor the Situational Dashboard. Situations in `ESCALATING` or `CRITICAL` state require immediate operator acknowledgement.
3. **Correlation Validation:** Expand the NetworkX Situation Graph and MITRE ATT&CK panel to verify contributing event evidence.
4. **Counterfactual Simulation:** Before enacting operational changes, run `MONITOR`, `ISOLATE`, and `LOCKDOWN` in the simulation sandbox to assess projected risk reduction and business impact.
5. **Human Decision Execution:** Select the verified action, input operational notes, and record final authorization in the audit trail.
6. **Operator Feedback:** Submit feedback (`CORRECT`, `FALSE_POSITIVE`, etc.) to provide continuous evaluation data.

---

## 2. Alert Escalation Protocol

| Situation State | Severity Level | Required Response Time | Action Required |
| :--- | :--- | :--- | :--- |
| **NORMAL** | Level 0 | Nominal | Background baseline monitoring. |
| **ANOMALOUS** | Level 1 | 30 minutes | Review contributing deviation score; no immediate intervention required. |
| **SUSPICIOUS** | Level 2 | 15 minutes | Verify correlated entities; inspect physical zone / endpoint activity. |
| **ESCALATING** | Level 3 | 5 minutes | Run counterfactual simulation; prepare host or credential isolation. |
| **CRITICAL** | Level 4 | Immediate ($< 2$ mins) | Human operator authorizes targeted isolation or perimeter lockdown. |
| **CONTAINED** | Resolved | Post-incident | Review evolution timeline, verify forensic retention, archive audit log. |

---

## 3. Incident Response & Troubleshooting
- **Database Connection Failure:** SENTINEL-X automatically transitions to in-memory resilient simulation mode. Alerts remain visible to operators; log warning is emitted. Re-establish Atlas connection via `scripts/verify_db.py`.
- **Event Flood Detected:** Ingestion latency monitoring flags high queue volume. Increase sliding window cleanup or activate rate-limiting in reverse proxy.
