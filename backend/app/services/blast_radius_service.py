"""Blast Radius Analysis Service for Situational Impact & Spread Estimation."""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Set
import networkx as nx
from backend.app.models.blast_radius import BlastRadius, BlastRadiusAsset
from backend.app.services.situation_service import situation_service
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.blast_radius")

# Static asset criticality catalog for the facility
FACILITY_ASSET_REGISTRY = {
    "server-room-1": {"name": "Central Server Vault", "type": "PhysicalZone", "criticality": "CRITICAL"},
    "lab-a": {"name": "Advanced Research Lab A", "type": "PhysicalZone", "criticality": "HIGH"},
    "loc-main-lobby": {"name": "Main Building Lobby", "type": "PhysicalZone", "criticality": "LOW"},
    "ep-10.0.4.120": {"name": "Lab Staging Workstation", "type": "Endpoint", "criticality": "HIGH"},
    "ep-10.0.4.55": {"name": "Analyst Terminal 55", "type": "Endpoint", "criticality": "MEDIUM"},
    "db-core-vault": {"name": "Customer & Research SQL Vault", "type": "Database", "criticality": "CRITICAL"},
    "sw-core-01": {"name": "Core VLAN Gateway Switch", "type": "NetworkSwitch", "criticality": "CRITICAL"},
    "person-104": {"name": "Identity: person-104 (Research Analyst)", "type": "Identity", "criticality": "HIGH"}
}

class BlastRadiusService:
    def calculate_blast_radius(self, situation_id: str) -> BlastRadius:
        """Traverse the Situation Graph and dependency topology to estimate spread dimensions."""
        situation = situation_service.get_situation(situation_id)
        graph = situation_service.get_situation_graph(situation_id)

        affected_assets: List[BlastRadiusAsset] = []
        direct_count = 0
        potential_count = 0
        high_critical = []
        spread_dimensions = {"physical_zones": 0, "network_endpoints": 0, "identities": 0, "databases": 0}

        visited_ids: Set[str] = set()

        if graph is not None:
            # 1. Direct nodes in graph
            for node_id in graph.nodes():
                meta = FACILITY_ASSET_REGISTRY.get(node_id, {})
                asset_name = meta.get("name", node_id)
                asset_type = meta.get("type", "Asset")
                criticality = meta.get("criticality", "MEDIUM")

                if criticality in ["HIGH", "CRITICAL"]:
                    high_critical.append(asset_name)

                # Count spread dimensions
                if "Zone" in asset_type or "loc" in node_id.lower() or "room" in node_id.lower():
                    spread_dimensions["physical_zones"] += 1
                elif "Endpoint" in asset_type or "ep-" in node_id.lower() or "sw-" in node_id.lower():
                    spread_dimensions["network_endpoints"] += 1
                elif "Identity" in asset_type or "person" in node_id.lower() or "user" in node_id.lower():
                    spread_dimensions["identities"] += 1

                affected_assets.append(
                    BlastRadiusAsset(
                        asset_id=node_id,
                        asset_name=asset_name,
                        asset_type=asset_type,
                        criticality=criticality,
                        hop_distance=1,
                        compromise_likelihood=0.90,
                        dependency_path=[situation_id, node_id]
                    )
                )
                visited_ids.add(node_id)
                direct_count += 1

            # 2. Add second-hop cascading dependencies (e.g. databases on same subnet or adjacent rooms)
            if "ep-10.0.4.120" in visited_ids and "db-core-vault" not in visited_ids:
                affected_assets.append(
                    BlastRadiusAsset(
                        asset_id="db-core-vault",
                        asset_name="Customer & Research SQL Vault",
                        asset_type="Database",
                        criticality="CRITICAL",
                        hop_distance=2,
                        compromise_likelihood=0.65,
                        dependency_path=[situation_id, "ep-10.0.4.120", "db-core-vault"]
                    )
                )
                spread_dimensions["databases"] += 1
                potential_count += 1
                high_critical.append("Customer & Research SQL Vault")

            if "server-room-1" in visited_ids and "sw-core-01" not in visited_ids:
                affected_assets.append(
                    BlastRadiusAsset(
                        asset_id="sw-core-01",
                        asset_name="Core VLAN Gateway Switch",
                        asset_type="NetworkSwitch",
                        criticality="CRITICAL",
                        hop_distance=2,
                        compromise_likelihood=0.75,
                        dependency_path=[situation_id, "server-room-1", "sw-core-01"]
                    )
                )
                spread_dimensions["network_endpoints"] += 1
                potential_count += 1
                high_critical.append("Core VLAN Gateway Switch")

        # Fallback if graph is empty
        if not affected_assets and situation:
            direct_count = 1
            affected_assets.append(
                BlastRadiusAsset(
                    asset_id=situation.primary_location_id,
                    asset_name="Target Facility Location",
                    asset_type="PhysicalZone",
                    criticality="HIGH",
                    hop_distance=1,
                    compromise_likelihood=0.85,
                    dependency_path=[situation_id, situation.primary_location_id]
                )
            )

        summary = (
            f"Estimated blast radius covers {direct_count} direct assets and {potential_count} second-hop "
            f"downstream dependencies across {len(high_critical)} high/critical assets."
        )

        return BlastRadius(
            situation_id=situation_id,
            direct_affected_count=direct_count,
            potential_affected_count=potential_count,
            spread_dimensions=spread_dimensions,
            high_critical_assets=list(set(high_critical)),
            affected_assets=affected_assets,
            risk_impact_summary=summary,
            calculated_at=datetime.now(timezone.utc)
        )

blast_radius_service = BlastRadiusService()
