"""Environment Topology Service managing Site, Building, Floor Digital Twins and Topology Conflict Detection."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.models.topology import (
    SiteCampus,
    Building,
    BuildingFloor,
    Zone,
    ZoneClassification,
    SpatialAsset,
    SpatialAssetType,
    TopologyConflict,
    TopologyConflictType
)

logger = logging.getLogger("sentinel.topology")

class TopologyService:
    def __init__(self):
        self._campus: SiteCampus = self._build_default_digital_twin()
        self._conflicts: List[TopologyConflict] = self._seed_default_conflicts()

    def get_site_campus(self) -> SiteCampus:
        return self._campus

    def get_building(self, building_id: str) -> Optional[Building]:
        for b in self._campus.buildings:
            if b.building_id == building_id:
                return b
        return None

    def get_zone(self, zone_id: str) -> Optional[Zone]:
        for b in self._campus.buildings:
            for fl in b.floors:
                for z in fl.zones:
                    if z.zone_id == zone_id:
                        return z
        return None

    def get_conflicts(self) -> List[TopologyConflict]:
        return self._conflicts

    def add_conflict(self, conflict: TopologyConflict):
        self._conflicts.insert(0, conflict)
        logger.warning(f"Topology conflict flagged: {conflict.conflict_type.value} for {conflict.entity_id}")

    def _seed_default_conflicts(self) -> List[TopologyConflict]:
        return [
            TopologyConflict(
                conflict_id="tc-001",
                conflict_type=TopologyConflictType.SENSOR_LOCATION_MISMATCH,
                category="TOPOLOGY_ERROR",
                entity_id="cam-07",
                reported_location="server-room-1",
                expected_location="lab-a",
                confidence=0.89,
                description="CCTV Camera-07 MAC broadcasted from switch port mapped to Lab A corridor, but stream metadata reported Server Room 1."
            ),
            TopologyConflict(
                conflict_id="tc-002",
                conflict_type=TopologyConflictType.IMPOSSIBLE_TRAVEL,
                category="SECURITY_THREAT",
                entity_id="person-104",
                reported_location="server-room-1",
                expected_location="lobby",
                confidence=0.96,
                description="Physical presence detected in Server Datacenter Vault within 35 seconds of badge swipe at Main Lobby (minimum traversal time: 140s)."
            )
        ]

    def _build_default_digital_twin(self) -> SiteCampus:
        # Floor 4: Research & Development
        f4_zones = [
            Zone(
                zone_id="lab-a",
                name="High-Security Research Lab A",
                floor_number=4,
                classification=ZoneClassification.RESTRICTED,
                polygon_2d=[[-15, -10], [10, -10], [10, 10], [-15, 10]],
                center_3d={"x": -2.5, "y": 12.0, "z": 0.0},
                adjacent_zone_ids=["corridor-south", "server-room-1"],
                threat_level=0.95,
                assets=[
                    SpatialAsset(
                        asset_id="ep-10.0.4.120",
                        name="Lab Staging Workstation 12",
                        asset_type=SpatialAssetType.WORKSTATION,
                        zone_id="lab-a",
                        floor_number=4,
                        coordinates_3d={"x": -4.0, "y": 12.0, "z": 2.0},
                        criticality="HIGH",
                        status="COMPROMISED",
                        ip_address="10.0.4.120"
                    ),
                    SpatialAsset(
                        asset_id="cam-07",
                        name="CCTV Lab-A Primary PTZ",
                        asset_type=SpatialAssetType.CCTV_CAMERA,
                        zone_id="lab-a",
                        floor_number=4,
                        coordinates_3d={"x": 8.0, "y": 14.5, "z": -8.0},
                        criticality="MEDIUM",
                        status="NORMAL"
                    )
                ]
            ),
            Zone(
                zone_id="corridor-south",
                name="South Access Corridor (Floor 4)",
                floor_number=4,
                classification=ZoneClassification.STANDARD,
                polygon_2d=[[-25, -20], [-15, -20], [-15, 20], [-25, 20]],
                center_3d={"x": -20.0, "y": 12.0, "z": 0.0},
                adjacent_zone_ids=["lobby", "lab-a"],
                threat_level=0.60,
                assets=[
                    SpatialAsset(
                        asset_id="door-f4-south",
                        name="Biometric Corridor Gate F4-S",
                        asset_type=SpatialAssetType.ACCESS_DOOR,
                        zone_id="corridor-south",
                        floor_number=4,
                        coordinates_3d={"x": -15.0, "y": 12.0, "z": 0.0},
                        criticality="HIGH",
                        status="NORMAL"
                    )
                ]
            )
        ]

        # Floor 5: Datacenter Core Vaults
        f5_zones = [
            Zone(
                zone_id="server-room-1",
                name="Primary Datacenter Server Vault",
                floor_number=5,
                classification=ZoneClassification.CRITICAL_VAULT,
                polygon_2d=[[10, -15], [30, -15], [30, 15], [10, 15]],
                center_3d={"x": 20.0, "y": 16.0, "z": 0.0},
                adjacent_zone_ids=["lab-a", "vault-db-core"],
                threat_level=0.98,
                assets=[
                    SpatialAsset(
                        asset_id="db-core-vault",
                        name="Customer & Research SQL Vault",
                        asset_type=SpatialAssetType.DATABASE_SERVER,
                        zone_id="server-room-1",
                        floor_number=5,
                        coordinates_3d={"x": 22.0, "y": 16.0, "z": -3.0},
                        criticality="CRITICAL",
                        status="SUSPICIOUS",
                        ip_address="10.0.5.10"
                    ),
                    SpatialAsset(
                        asset_id="sw-core-01",
                        name="Core VLAN Gateway Switch",
                        asset_type=SpatialAssetType.NETWORK_SWITCH,
                        zone_id="server-room-1",
                        floor_number=5,
                        coordinates_3d={"x": 18.0, "y": 16.0, "z": 5.0},
                        criticality="CRITICAL",
                        status="SUSPICIOUS"
                    ),
                    SpatialAsset(
                        asset_id="sensor-vibe-rack-03",
                        name="Rack 3 Vibration & Temp Sensor",
                        asset_type=SpatialAssetType.IOT_VIBRATION,
                        zone_id="server-room-1",
                        floor_number=5,
                        coordinates_3d={"x": 21.0, "y": 16.0, "z": -2.0},
                        criticality="HIGH",
                        status="NORMAL"
                    )
                ]
            )
        ]

        # Lower Floors (1-3)
        f1_zones = [
            Zone(
                zone_id="lobby",
                name="Main Entrance Lobby & Security Desk",
                floor_number=1,
                classification=ZoneClassification.PUBLIC,
                polygon_2d=[[-30, -30], [30, -30], [30, -10], [-30, -10]],
                center_3d={"x": 0.0, "y": 0.0, "z": -20.0},
                adjacent_zone_ids=["corridor-south"],
                threat_level=0.20,
                assets=[
                    SpatialAsset(
                        asset_id="turnstile-main",
                        name="Main Entrance Optical Turnstiles",
                        asset_type=SpatialAssetType.ACCESS_DOOR,
                        zone_id="lobby",
                        floor_number=1,
                        coordinates_3d={"x": 0.0, "y": 0.0, "z": -25.0},
                        criticality="MEDIUM",
                        status="NORMAL"
                    )
                ]
            )
        ]

        floors = [
            BuildingFloor(floor_number=1, name="Level 1: Reception & Public Concourse", elevation_meters=0.0, zones=f1_zones),
            BuildingFloor(floor_number=2, name="Level 2: Administration & Finance", elevation_meters=4.0, zones=[]),
            BuildingFloor(floor_number=3, name="Level 3: Engineering Offices", elevation_meters=8.0, zones=[]),
            BuildingFloor(floor_number=4, name="Level 4: Advanced Research Lab A", elevation_meters=12.0, zones=f4_zones, is_compromised=True),
            BuildingFloor(floor_number=5, name="Level 5: Core Datacenter Vault", elevation_meters=16.0, zones=f5_zones, is_compromised=True),
        ]

        building_omega = Building(
            building_id="bld-omega",
            name="SENTINEL Global Technology Center (Omega Tower)",
            site_id="site-campus-01",
            total_floors=5,
            floors=floors,
            center_gps={"lat": 37.7749, "lng": -122.4194},
            bounding_box_3d={"width": 60.0, "height": 20.0, "depth": 40.0}
        )

        return SiteCampus(
            site_id="site-campus-01",
            name="Silicon Valley Secure Campus Alpha",
            code="CAMPUS-01",
            buildings=[building_omega],
            geofence_center={"lat": 37.7749, "lng": -122.4194},
            active_situations_count=1
        )

topology_service = TopologyService()
