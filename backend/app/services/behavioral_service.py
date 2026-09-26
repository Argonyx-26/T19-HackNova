"""Behavioral Baseline Learning & Anomaly Scoring Service."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.models.behavioral import BehavioralBaseline, BehavioralAnomaly
from backend.app.models.event import NormalizedEvent
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.behavioral")

DEFAULT_BASELINES = [
    {
        "baseline_id": "base-person-104",
        "entity_id": "person-104",
        "entity_type": "User",
        "observation_count": 48,
        "cold_start": False,
        "typical_active_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        "typical_locations": ["loc-main-lobby", "loc-bld-b-office", "loc-cafeteria"],
        "typical_endpoints": ["ep-10.0.4.55"],
        "average_daily_events": 14.5,
        "confidence_score": 0.88,
        "profile_features": {"role": "Research Analyst", "clearance": "Standard"}
    },
    {
        "baseline_id": "base-ep-120",
        "entity_id": "ep-10.0.4.120",
        "entity_type": "Endpoint",
        "observation_count": 120,
        "cold_start": False,
        "typical_active_hours": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        "typical_locations": ["loc-lab-a"],
        "typical_endpoints": ["ep-10.0.4.120"],
        "average_daily_events": 45.0,
        "confidence_score": 0.92,
        "profile_features": {"os": "Linux Ubuntu", "type": "Lab Workstation"}
    }
]

class BehavioralService:
    def __init__(self):
        self._seed_default_baselines()

    def _get_baselines_collection(self):
        return db_manager.get_collection("behavioral_baselines")

    def _get_anomalies_collection(self):
        return db_manager.get_collection("behavioral_anomalies")

    def _seed_default_baselines(self):
        col = self._get_baselines_collection()
        for base in DEFAULT_BASELINES:
            existing = col.find_one({"entity_id": base["entity_id"]})
            if not existing:
                col.insert_one(base.copy())

    def get_baseline(self, entity_id: str) -> Optional[BehavioralBaseline]:
        col = self._get_baselines_collection()
        if col.count_documents() == 0:
            self._seed_default_baselines()
        doc = col.find_one({"entity_id": entity_id})
        if not doc:
            return None
        d_clean = {k: v for k, v in doc.items() if k != "_id"}
        return BehavioralBaseline(**d_clean)

    def evaluate_event(self, event: NormalizedEvent, situation_id: Optional[str] = None) -> Optional[BehavioralAnomaly]:
        """Compute deviation score comparing event against entity baseline."""
        entity_id = event.entity_id
        if not entity_id:
            return None

        baseline = self.get_baseline(entity_id)
        factors: List[str] = []
        deviation_score = 0.0

        # Event characteristics
        event_hour = event.timestamp.hour
        loc = event.location_id

        if baseline is None:
            # Cold-start handling: register baseline profile
            col_b = self._get_baselines_collection()
            baseline = BehavioralBaseline(
                baseline_id=f"base-{entity_id}",
                entity_id=entity_id,
                entity_type="User" if "person" in entity_id or "user" in entity_id else "Endpoint",
                observation_count=1,
                cold_start=True,
                typical_active_hours=[event_hour],
                typical_locations=[loc] if loc else [],
                typical_endpoints=[],
                confidence_score=0.4
            )
            col_b.insert_one(baseline.model_dump())
            factors.append("Cold-start entity: Initial observation baseline established")
            deviation_score = 0.30
            base_id = baseline.baseline_id
        elif baseline.cold_start:
            factors.append(f"Cold-start entity: Limited historical observation count ({baseline.observation_count})")
            deviation_score = 0.30
            base_id = baseline.baseline_id
        else:
            base_id = baseline.baseline_id

            # 1. Hour-of-day deviation
            if baseline.typical_active_hours and event_hour not in baseline.typical_active_hours:
                deviation_score += 0.40
                factors.append(f"Off-hours activity: Active at {event_hour:02d}:00 UTC (typical: 08:00-17:00)")

            # 2. Location anomaly
            if loc and baseline.typical_locations and loc not in baseline.typical_locations:
                deviation_score += 0.45
                factors.append(f"Unfamiliar location: Observed at '{loc}' outside established profile")

            # 3. Critical event severity weight
            if event.severity >= 0.7:
                deviation_score += 0.20
                factors.append(f"High-severity payload activity ({event.event_type})")

        deviation_score = min(1.0, round(deviation_score, 2))

        # Register anomaly if deviation exceeds sensitivity threshold
        if deviation_score >= 0.25:
            anomaly_id = f"anom-{uuid.uuid4().hex[:8]}"
            anomaly = BehavioralAnomaly(
                anomaly_id=anomaly_id,
                entity_id=entity_id,
                baseline_id=base_id,
                deviation_score=deviation_score,
                anomaly_factors=factors,
                trigger_event_id=event.event_id,
                situation_id=situation_id or event.situation_id
            )
            col_a = self._get_anomalies_collection()
            col_a.insert_one(anomaly.model_dump())
            logger.info(f"Behavioral anomaly flagged for {entity_id}: score={deviation_score}")
            return anomaly

        return None

    def get_anomalies_for_situation(self, situation_id: str) -> List[BehavioralAnomaly]:
        col = self._get_anomalies_collection()
        docs = col.find({"situation_id": situation_id})
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(BehavioralAnomaly(**d_clean))
        return result

    def list_anomalies(self, limit: int = 50) -> List[BehavioralAnomaly]:
        col = self._get_anomalies_collection()
        docs = col.find({}).sort("timestamp", -1).limit(limit)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(BehavioralAnomaly(**d_clean))
        return result

    def get_all_baselines(self) -> List[BehavioralBaseline]:
        col = self._get_baselines_collection()
        docs = col.find({})
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(BehavioralBaseline(**d_clean))
        return result

behavioral_service = BehavioralService()
