"""NetworkX Situation Graph Builder for SENTINEL-X.

Maps correlated threat topology:
- Nodes: Person, Device, Camera, AccessPoint, Location, Event, Situation
- Edges: ACCESSED, LOCATED_AT, OBSERVED_BY, TRIGGERED, ASSOCIATED_WITH
Provides serialized JSON graph representation for React dashboard.
"""

from typing import Dict, Any, List, Optional
import networkx as nx
from backend.app.models.event import NormalizedEvent

class SituationGraphBuilder:
    def __init__(self, situation_id: str):
        self.situation_id = situation_id
        self.graph = nx.DiGraph()
        # Add root situation node
        self.graph.add_node(
            situation_id,
            id=situation_id,
            label=f"Situation {situation_id}",
            node_type="Situation",
            severity=0.5,
            status="ACTIVE"
        )

    def add_event(self, event: NormalizedEvent):
        """Incorporate an ingested event, its entities, and its location into the graph."""
        evt_node_id = f"evt-{event.event_id}"
        entity_node_id = f"ent-{event.entity_id}"
        loc_node_id = f"loc-{event.location_id}"

        # 1. Event Node
        self.graph.add_node(
            evt_node_id,
            id=evt_node_id,
            label=event.event_type.replace("_", " ").title(),
            node_type="Event",
            source_type=event.source_type.value,
            severity=event.severity,
            confidence=event.confidence,
            timestamp=event.timestamp.isoformat()
        )
        self.graph.add_edge(self.situation_id, evt_node_id, relationship="CONTAINS")

        # 2. Entity Node
        node_type = "Person" if "person" in event.entity_id.lower() else "Device"
        if "cam" in event.entity_id.lower():
            node_type = "Camera"
        self.graph.add_node(
            entity_node_id,
            id=entity_node_id,
            label=event.entity_id,
            node_type=node_type,
            status="FLAGGED" if event.severity > 0.6 else "ACTIVE"
        )
        self.graph.add_edge(entity_node_id, evt_node_id, relationship="TRIGGERED")

        # 3. Location Node
        self.graph.add_node(
            loc_node_id,
            id=loc_node_id,
            label=event.location_id.replace("-", " ").title(),
            node_type="Location",
            zone_type="RESTRICTED" if "lab" in event.location_id.lower() or "server" in event.location_id.lower() else "STANDARD"
        )
        self.graph.add_edge(evt_node_id, loc_node_id, relationship="LOCATED_AT")
        self.graph.add_edge(entity_node_id, loc_node_id, relationship="ACCESSED")

    def add_correlation_edge(self, source_evt_id: str, target_evt_id: str, relationship_type: str):
        src_id = f"evt-{source_evt_id}"
        tgt_id = f"evt-{target_evt_id}"
        if self.graph.has_node(src_id) and self.graph.has_node(tgt_id):
            self.graph.add_edge(src_id, tgt_id, relationship=relationship_type)

    def to_json(self) -> Dict[str, Any]:
        """Serialize NetworkX DiGraph into JSON structure for situational frontend."""
        nodes = []
        for n, attrs in self.graph.nodes(data=True):
            node_data = dict(attrs)
            node_data["id"] = n
            nodes.append(node_data)

        edges = []
        for u, v, attrs in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "relationship": attrs.get("relationship", "ASSOCIATED_WITH")
            })

        # Calculate basic graph metrics
        node_count = self.graph.number_of_nodes()
        edge_count = self.graph.number_of_edges()
        density = round(nx.density(self.graph), 4) if node_count > 1 else 0.0
        
        # Weakly connected components in directed graph
        components_count = nx.number_weakly_connected_components(self.graph) if node_count > 0 else 0

        # Degree centrality of entities
        degrees = {n: d for n, d in self.graph.degree()}

        return {
            "situation_id": self.situation_id,
            "nodes": nodes,
            "edges": edges,
            "metrics": {
                "node_count": node_count,
                "edge_count": edge_count,
                "density": density,
                "connected_components": components_count,
                "max_degree": max(degrees.values()) if degrees else 0,
            }
        }
