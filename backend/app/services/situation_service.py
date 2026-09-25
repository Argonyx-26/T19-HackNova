"""Situation Service managing situation lifecycle, evolution, and timeline reconstruction."""

import logging
import time
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import networkx as nx

from backend.app.db.mongodb import db_manager
from backend.app.models.situation import Situation, SituationState
from backend.app.models.situation_transition import SituationTransition
from backend.app.models.event import NormalizedEvent
from backend.app.intelligence.evolution.state_machine import SituationStateMachine
from backend.app.intelligence.graph.situation_graph import SituationGraphBuilder
from backend.app.intelligence.correlation.engine import CorrelationMatch
from backend.app.services.threat_intel_service import threat_intel_service
from backend.app.services.mitre_service import mitre_service
from backend.app.services.behavioral_service import behavioral_service
from backend.app.services.risk_engine_service import risk_engine_service
from backend.app.services.metrics_service import metrics_service

logger = logging.getLogger("sentinel.service.situation")

class SituationService:
    def __init__(self):
        self.graphs: Dict[str, SituationGraphBuilder] = {}

    def get_or_create_active_situation(self, primary_entity: str, location: str) -> Situation:
        """Find an active/evolving situation or create a new one."""
        situations_col = db_manager.get_collection("situations")
        # Search for non-contained situations
        active_doc = situations_col.find_one({"status": {"$in": ["NORMAL", "ANOMALOUS", "SUSPICIOUS", "ESCALATING", "CRITICAL"]}})
        
        if active_doc:
            active_doc.pop("_id", None)
            return Situation(**active_doc)

        new_id = f"sit-{datetime.now(timezone.utc).strftime('%Y%m%d')}-001"
        sit = Situation(
            situation_id=new_id,
            status=SituationState.NORMAL,
            risk_score=0.1,
            summary="Baseline facility monitoring",
            primary_entity_ids=[primary_entity],
            location_ids=[location],
            event_ids=[]
        )
        situations_col.insert_one(sit.to_doc())
        self.graphs[new_id] = SituationGraphBuilder(new_id)
        return sit

    def correlate_and_evolve(
        self,
        new_event: NormalizedEvent,
        correlated_event_ids: List[str],
        matches: List[CorrelationMatch]
    ) -> Situation:
        """Central pipeline link: correlates event, updates graph, transitions state, and scores explainable risk."""
        start_time = time.perf_counter()
        situations_col = db_manager.get_collection("situations")
        transitions_col = db_manager.get_collection("situation_transitions")
        events_col = db_manager.get_collection("events")

        # 1. Fetch or create situation
        situation = self.get_or_create_active_situation(new_event.entity_id, new_event.location_id)
        sit_id = situation.situation_id

        # 2. Link event to situation in DB
        events_col.update_one({"event_id": new_event.event_id}, {"$set": {"situation_id": sit_id, "processed": True}})
        if new_event.event_id not in situation.event_ids:
            situation.event_ids.append(new_event.event_id)
        if new_event.entity_id not in situation.primary_entity_ids:
            situation.primary_entity_ids.append(new_event.entity_id)
        if new_event.location_id not in situation.location_ids:
            situation.location_ids.append(new_event.location_id)

        # 3. Update NetworkX graph
        graph_builder = self.graphs.setdefault(sit_id, SituationGraphBuilder(sit_id))
        graph_builder.add_event(new_event)
        for m in matches:
            graph_builder.add_correlation_edge(m.source_event_id, m.target_event_id, m.relationship_type)

        # 4. Fetch past correlated events for state machine
        past_events = []
        for eid in correlated_event_ids:
            doc = events_col.find_one({"event_id": eid})
            if doc:
                doc.pop("_id", None)
                past_events.append(NormalizedEvent(**doc))

        # 5. Evaluate state machine transition
        transition = SituationStateMachine.evaluate_transition(situation, new_event, past_events)
        if transition:
            logger.warning("SITUATION ESCALATION [%s]: %s -> %s (Reason: %s)",
                           sit_id, transition.from_state, transition.to_state, transition.reason)
            situation.status = SituationState(transition.to_state)
            situation.summary = transition.reason
            
            # Persist historical transition record (IMMUTABLE, NO TTL)
            transitions_col.insert_one(transition.to_doc())

        # 6. Advanced Security Intelligence Pipelines
        # Threat Intelligence Matching
        threat_matches = threat_intel_service.match_event(new_event)
        
        # MITRE ATT&CK Mapping
        single_mapping = mitre_service.map_event(new_event, situation_id=sit_id)
        mitre_mappings = [single_mapping] if single_mapping else []

        # Behavioral Baseline Evaluation
        anomaly = behavioral_service.evaluate_event(new_event)
        anomaly_score = anomaly.anomaly_score if anomaly else 0.0

        # High Criticality Assets in blast radius estimation
        high_criticality_count = 0
        if "server" in new_event.location_id.lower() or "vault" in new_event.location_id.lower():
            high_criticality_count += 2
        if "120" in new_event.entity_id or "person-104" in new_event.entity_id:
            high_criticality_count += 1

        # 7. Compute Explainable Multidimensional Risk Score
        risk_result = risk_engine_service.compute_situation_risk(
            situation=situation,
            new_event=new_event,
            threat_matches=threat_matches,
            mitre_mappings=mitre_mappings,
            behavioral_anomaly_score=anomaly_score,
            attack_chain_progression=min(1.0, len(mitre_mappings) * 0.25),
            high_criticality_asset_count=high_criticality_count
        )
        situation.risk_score = risk_result.risk_score

        # 8. Persist updated situation
        situation.updated_at = datetime.now(timezone.utc)
        situations_col.update_one(
            {"situation_id": sit_id},
            {"$set": situation.to_doc()}
        )

        # 9. Record Observability Telemetry
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        metrics_service.record_latency("correlation_and_evolve", elapsed_ms)
        metrics_service.record_event(new_event.source_type.value)

        return situation

    def get_situation(self, situation_id: str) -> Optional[Situation]:
        situations_col = db_manager.get_collection("situations")
        doc = situations_col.find_one({"situation_id": situation_id})
        if not doc:
            return None
        doc.pop("_id", None)
        return Situation(**doc)

    def list_situations(self) -> List[Situation]:
        situations_col = db_manager.get_collection("situations")
        cursor = situations_col.find({}, sort=[("updated_at", -1)])
        results = []
        for doc in cursor:
            doc.pop("_id", None)
            results.append(Situation(**doc))
        return results

    def get_timeline(self, situation_id: str) -> List[SituationTransition]:
        """Reconstruct historical evolution timeline from situation_transitions collection."""
        transitions_col = db_manager.get_collection("situation_transitions")
        cursor = transitions_col.find({"situation_id": situation_id}, sort=[("timestamp", 1)])
        timeline = []
        for doc in cursor:
            doc.pop("_id", None)
            timeline.append(SituationTransition(**doc))
        return timeline

    def get_graph(self, situation_id: str) -> Dict[str, Any]:
        """Return serialized NetworkX situation graph."""
        builder = self.graphs.get(situation_id)
        if not builder:
            # Fallback rebuild graph from events if not cached in memory
            builder = SituationGraphBuilder(situation_id)
            sit = self.get_situation(situation_id)
            if sit:
                events_col = db_manager.get_collection("events")
                for eid in sit.event_ids:
                    doc = events_col.find_one({"event_id": eid})
                    if doc:
                        doc.pop("_id", None)
                        builder.add_event(NormalizedEvent(**doc))
            self.graphs[situation_id] = builder
        return builder.to_json()

    def get_situation_graph(self, situation_id: str) -> Optional[nx.DiGraph]:
        """Return the internal NetworkX DiGraph for graph analysis and traversal."""
        self.get_graph(situation_id)
        builder = self.graphs.get(situation_id)
        return builder.graph if builder else None

situation_service = SituationService()
