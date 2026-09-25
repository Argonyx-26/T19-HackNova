"""Deterministic Contextual Correlation Engine for SENTINEL-X.

Evaluates multi-dimensional relationships:
1. Temporal Proximity: |t_e2 - t_e1| <= window_seconds
2. Spatial Adjacency: same location or known adjacent security zones
3. Entity Intersection: shared entity ID or mapped credentials
4. Semantic Chain: logical progression of attack patterns
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.models.event import NormalizedEvent

class CorrelationMatch(BaseModel):
    source_event_id: str
    target_event_id: str
    relationship_type: str  # TEMPORAL, SPATIAL, ENTITY, SEMANTIC_CHAIN
    confidence: float
    explanation: str

class ContextualCorrelationEngine:
    # Known adjacent zones in facility topology
    LOCATION_ADJACENCY: Dict[str, List[str]] = {
        "lobby": ["corridor-south"],
        "corridor-south": ["lobby", "lab-a"],
        "lab-a": ["corridor-south", "server-room-1"],
        "server-room-1": ["lab-a"],
    }

    # Known entity alias/device mappings
    ENTITY_MAPPINGS: Dict[str, List[str]] = {
        "person-104": ["ep-10.0.4.120", "BDG-9921"],
        "ep-10.0.4.120": ["person-104"],
    }

    # High-confidence attack progression sequences
    SEMANTIC_SEQUENCES = [
        {"prev": "access_denied", "next": "repeated_access_attempt", "weight": 0.85},
        {"prev": "repeated_access_attempt", "next": "unauthorized_presence", "weight": 0.92},
        {"prev": "unauthorized_presence", "next": "port_scan", "weight": 0.95},
        {"prev": "port_scan", "next": "server_rack_vibration_alert", "weight": 0.90},
        {"prev": "port_scan", "next": "data_exfiltration_attempt", "weight": 0.98},
    ]

    def __init__(self, window_seconds: int = 120):
        self.window_seconds = window_seconds

    def evaluate_correlation(self, event_a: NormalizedEvent, event_b: NormalizedEvent) -> List[CorrelationMatch]:
        """Examine relationship between two events across all correlation axes."""
        matches: List[CorrelationMatch] = []

        # 1. Temporal Proximity Check
        delta_sec = abs((event_a.timestamp - event_b.timestamp).total_seconds())
        if delta_sec > self.window_seconds:
            return []  # Outside active correlation window

        matches.append(CorrelationMatch(
            source_event_id=event_a.event_id,
            target_event_id=event_b.event_id,
            relationship_type="TEMPORAL",
            confidence=max(0.2, 1.0 - (delta_sec / self.window_seconds)),
            explanation=f"Events occurred {int(delta_sec)}s apart (window <= {self.window_seconds}s)"
        ))

        # 2. Entity Intersection Check
        is_same_entity = (event_a.entity_id == event_b.entity_id)
        is_mapped_entity = (event_b.entity_id in self.ENTITY_MAPPINGS.get(event_a.entity_id, []))
        
        if is_same_entity or is_mapped_entity:
            matches.append(CorrelationMatch(
                source_event_id=event_a.event_id,
                target_event_id=event_b.event_id,
                relationship_type="ENTITY",
                confidence=1.0 if is_same_entity else 0.88,
                explanation=f"Correlated entity link: {event_a.entity_id} <-> {event_b.entity_id}"
            ))

        # 3. Spatial Adjacency Check
        is_same_loc = (event_a.location_id == event_b.location_id)
        is_adj_loc = (event_b.location_id in self.LOCATION_ADJACENCY.get(event_a.location_id, []))
        
        if is_same_loc or is_adj_loc:
            matches.append(CorrelationMatch(
                source_event_id=event_a.event_id,
                target_event_id=event_b.event_id,
                relationship_type="SPATIAL",
                confidence=0.95 if is_same_loc else 0.75,
                explanation=f"Spatial proximity: {event_a.location_id} {'is identical to' if is_same_loc else 'is adjacent to'} {event_b.location_id}"
            ))

        # 4. Semantic Attack Chain Check
        for seq in self.SEMANTIC_SEQUENCES:
            if (event_a.event_type == seq["prev"] and event_b.event_type == seq["next"]) or \
               (event_b.event_type == seq["prev"] and event_a.event_type == seq["next"]):
                matches.append(CorrelationMatch(
                    source_event_id=event_a.event_id,
                    target_event_id=event_b.event_id,
                    relationship_type="SEMANTIC_CHAIN",
                    confidence=seq["weight"],
                    explanation=f"Attack chain detected: {seq['prev']} -> {seq['next']}"
                ))

        return matches
