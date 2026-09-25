"""Explainable Multi-Factor Risk Scoring Engine for SENTINEL-X.

Calculates composite situational risk score across 9 weighted dimensions:
1. State Machine Base Severity
2. Event Severity & Source Confidence
3. Threat Intelligence IOC Matches (Confidence & Actor context)
4. MITRE ATT&CK Tactic Weights
5. Behavioral Baseline Deviation Score
6. Asset Criticality (Physical zones, core vaults, servers)
7. Blast Radius Spread Dimensions
8. Attack Chain Progression (Kill-chain stage completion)
9. Risk Velocity (Rate of risk delta over temporal correlation window)

Provides full explainability and mathematical audit trail for every calculation.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from backend.app.models.situation import Situation, SituationState
from backend.app.models.event import NormalizedEvent
from backend.app.schemas.explainability import ExplainabilityRecord

logger = logging.getLogger("sentinel.risk_engine")

class ExplainableRiskResult(BaseModel):
    situation_id: str
    risk_score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    trend: str # ACCELERATING, INCREASING, STABLE, DECREASING
    velocity: float # Risk delta per observation
    risk_drivers: List[str]
    impact_summary: str
    factor_weights: Dict[str, float]
    explanation: ExplainabilityRecord
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RiskEngineService:
    # State severity baseline
    STATE_BASE_RISK = {
        SituationState.NORMAL: 0.10,
        SituationState.ANOMALOUS: 0.35,
        SituationState.SUSPICIOUS: 0.60,
        SituationState.ESCALATING: 0.80,
        SituationState.CRITICAL: 0.95,
        SituationState.CONTAINED: 0.25,
    }

    # MITRE Tactic Risk Weights
    TACTIC_WEIGHTS = {
        "Initial Access": 0.08,
        "Physical Access": 0.12,
        "Discovery": 0.10,
        "Defense Evasion": 0.15,
        "Lateral Movement": 0.18,
        "Collection": 0.20,
        "Exfiltration": 0.25,
        "Impact": 0.30
    }

    def compute_situation_risk(
        self,
        situation: Situation,
        new_event: Optional[NormalizedEvent] = None,
        threat_matches: Optional[List[Any]] = None,
        mitre_mappings: Optional[List[Any]] = None,
        behavioral_anomaly_score: float = 0.0,
        attack_chain_progression: float = 0.0,
        high_criticality_asset_count: int = 0
    ) -> ExplainableRiskResult:
        """Compute multidimensional, explainable risk score."""
        drivers = []
        factor_breakdown = {}

        # 1. State Base Risk
        base_state = self.STATE_BASE_RISK.get(situation.status, 0.20)
        factor_breakdown["state_base"] = base_state
        drivers.append(f"Base situational state '{situation.status.value}' sets floor at {base_state:.2f}")

        # 2. Event Severity & Source Confidence
        event_impact = 0.0
        if new_event:
            event_impact = (new_event.severity * 0.25) * new_event.confidence
            factor_breakdown["event_impact"] = round(event_impact, 3)
            if event_impact > 0.10:
                drivers.append(f"Triggering event {new_event.event_type} severity ({new_event.severity}) and confidence ({new_event.confidence}) adds +{event_impact:.2f}")

        # 3. Threat Intelligence Matches
        threat_impact = 0.0
        if threat_matches and len(threat_matches) > 0:
            threat_impact = min(0.25, 0.10 + (0.05 * len(threat_matches)))
            factor_breakdown["threat_intel_match"] = round(threat_impact, 3)
            actors = [m.threat_actor for m in threat_matches if hasattr(m, 'threat_actor') and m.threat_actor]
            actor_str = f" linked to {', '.join(set(actors))}" if actors else ""
            drivers.append(f"Active Threat Intelligence IOC correlation ({len(threat_matches)} matches{actor_str}) adds +{threat_impact:.2f}")

        # 4. MITRE ATT&CK Tactic Weights
        mitre_impact = 0.0
        if mitre_mappings and len(mitre_mappings) > 0:
            tactic_scores = [self.TACTIC_WEIGHTS.get(m.tactic, 0.08) for m in mitre_mappings if hasattr(m, 'tactic')]
            mitre_impact = min(0.30, sum(tactic_scores) * 0.5)
            factor_breakdown["mitre_tactics"] = round(mitre_impact, 3)
            tactics = list(set([m.tactic for m in mitre_mappings if hasattr(m, 'tactic')]))
            drivers.append(f"MITRE ATT&CK adversarial tactics identified ({', '.join(tactics)}) adds +{mitre_impact:.2f}")

        # 5. Behavioral Deviation
        anomaly_impact = 0.0
        if behavioral_anomaly_score > 0.2:
            anomaly_impact = round(behavioral_anomaly_score * 0.18, 3)
            factor_breakdown["behavioral_deviation"] = anomaly_impact
            drivers.append(f"Statistical behavioral baseline anomaly ({behavioral_anomaly_score:.2f}) adds +{anomaly_impact:.2f}")

        # 6. Critical Assets & Blast Radius
        asset_impact = 0.0
        if high_criticality_asset_count > 0:
            asset_impact = min(0.20, high_criticality_asset_count * 0.06)
            factor_breakdown["critical_assets_at_risk"] = round(asset_impact, 3)
            drivers.append(f"{high_criticality_asset_count} high-criticality enterprise assets in blast radius adds +{asset_impact:.2f}")

        # 7. Attack Chain Progression
        progression_impact = 0.0
        if attack_chain_progression > 0.0:
            progression_impact = round(attack_chain_progression * 0.15, 3)
            factor_breakdown["killchain_progression"] = progression_impact
            drivers.append(f"Multi-stage attack chain progression ({int(attack_chain_progression * 100)}%) adds +{progression_impact:.2f}")

        # Composite score calculation (blended cap at 1.0)
        raw_composite = base_state + event_impact + threat_impact + mitre_impact + anomaly_impact + asset_impact + progression_impact
        composite_score = round(min(1.0, max(0.05, raw_composite)), 2)

        # Risk Velocity & Trend
        previous_score = situation.risk_score
        velocity = round(composite_score - previous_score, 2)
        if velocity >= 0.15:
            trend = "ACCELERATING"
        elif velocity > 0.0:
            trend = "INCREASING"
        elif velocity == 0.0:
            trend = "STABLE"
        else:
            trend = "DECREASING"

        # Confidence Estimation
        confidence_factors = [0.85] # baseline model confidence
        if new_event:
            confidence_factors.append(new_event.confidence)
        if threat_matches:
            confidence_factors.append(0.90)
        composite_confidence = round(sum(confidence_factors) / len(confidence_factors), 2)

        # Impact Summary
        if composite_score >= 0.8:
            impact_summary = "CRITICAL: Imminent multi-vector breach compromising core physical/network assets. Urgent containment recommended."
        elif composite_score >= 0.6:
            impact_summary = "HIGH: Active suspicious traversal and defense evasion observed across multiple facility segments."
        elif composite_score >= 0.35:
            impact_summary = "MEDIUM: Anomalous pattern detected exceeding historical baseline; investigation warranted."
        else:
            impact_summary = "LOW: Routine operational events within acceptable variance."

        # Explainability Record
        contributing_events = [new_event.event_id] if new_event else situation.event_ids[-5:]
        contributing_entities = situation.primary_entity_ids

        explanation = ExplainabilityRecord(
            decision_type="RISK_SCORE",
            target_id=situation.situation_id,
            reason=f"Risk evaluated at {composite_score:.2f} ({trend}) driven by {len(drivers)} factors.",
            evidence_summary="; ".join(drivers),
            contributing_event_ids=contributing_events,
            contributing_entity_ids=contributing_entities,
            confidence=composite_confidence,
            rule_or_model="MultiFactor-Situational-RiskEngine-v2",
            factors=factor_breakdown
        )

        return ExplainableRiskResult(
            situation_id=situation.situation_id,
            risk_score=composite_score,
            confidence=composite_confidence,
            trend=trend,
            velocity=velocity,
            risk_drivers=drivers,
            impact_summary=impact_summary,
            factor_weights=factor_breakdown,
            explanation=explanation
        )

risk_engine_service = RiskEngineService()
