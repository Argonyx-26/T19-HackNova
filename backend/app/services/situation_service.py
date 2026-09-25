"""Situation Service managing situation lifecycle, evolution, and timeline reconstruction."""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.db.mongodb import db_manager
from backend.app.models.situation import Situation, SituationState
from backend.app.models.situation_transition import SituationTransition
from backend.app.models.event import NormalizedEvent
from backend.app.intelligence.evolution.state_machine import SituationStateMachine
from backend.app.intelligence.graph.situation_graph import SituationGraphBuilder
from backend.app.intelligence.correlation.engine import CorrelationMatch

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
        """Central pipeline link: correlates event, updates graph, transitions state."""
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
            situation.risk_score = round(min(1.0, situation.risk_score + transition.risk_delta), 2)
            situation.summary = transition.reason
            
            # Persist historical transition record (IMMUTABLE, NO TTL)
            transitions_col.insert_one(transition.to_doc())

        situation.updated_at = datetime.now(timezone.utc)
        situations_col.update_one(
            {"situation_id": sit_id},
            {"$set": situation.to_doc()}
        )
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

situation_service = SituationService()
