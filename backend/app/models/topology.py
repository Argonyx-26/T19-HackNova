"""Domain models for 3-Layer Spatial Environment Topology & Digital Twin."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ZoneClassification(str, Enum):
    PUBLIC = "PUBLIC"
    STANDARD = "STANDARD"
    RESTRICTED = "RESTRICTED"
    CRITICAL_VAULT = "CRITICAL_VAULT"

class SpatialAssetType(str, Enum):
    WORKSTATION = "WORKSTATION"
    DATABASE_SERVER = "DATABASE_SERVER"
    NETWORK_SWITCH = "NETWORK_SWITCH"
    CCTV_CAMERA = "CCTV_CAMERA"
    ACCESS_DOOR = "ACCESS_DOOR"
    IOT_VIBRATION = "IOT_VIBRATION"
    IOT_THERMAL = "IOT_THERMAL"
    PERSON_IDENTITY = "PERSON_IDENTITY"

class SpatialAsset(BaseModel):
    asset_id: str
    name: str
    asset_type: SpatialAssetType
    zone_id: str
    floor_number: int
    coordinates_3d: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0, "z": 0.0})
    criticality: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "NORMAL" # NORMAL, SUSPICIOUS, COMPROMISED, OFFLINE
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None

class Zone(BaseModel):
    zone_id: str
    name: str
    floor_number: int
    classification: ZoneClassification
    polygon_2d: List[List[float]] = Field(default_factory=list)
    center_3d: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0, "z": 0.0})
    adjacent_zone_ids: List[str] = Field(default_factory=list)
    assets: List[SpatialAsset] = Field(default_factory=list)
    threat_level: float = 0.0 # 0.0 to 1.0

class BuildingFloor(BaseModel):
    floor_number: int
    name: str
    elevation_meters: float
    zones: List[Zone] = Field(default_factory=list)
    is_compromised: bool = False

class Building(BaseModel):
    building_id: str
    name: str
    site_id: str
    total_floors: int = 5
    floors: List[BuildingFloor] = Field(default_factory=list)
    center_gps: Dict[str, float] = Field(default_factory=lambda: {"lat": 37.7749, "lng": -122.4194})
    bounding_box_3d: Dict[str, float] = Field(default_factory=lambda: {"width": 60.0, "height": 30.0, "depth": 40.0})

class SiteCampus(BaseModel):
    site_id: str
    name: str
    code: str = "CAMPUS-01"
    buildings: List[Building] = Field(default_factory=list)
    geofence_center: Dict[str, float] = Field(default_factory=lambda: {"lat": 37.7749, "lng": -122.4194})
    active_situations_count: int = 0

class TopologyConflictType(str, Enum):
    IMPOSSIBLE_TRAVEL = "IMPOSSIBLE_TRAVEL"
    SENSOR_LOCATION_MISMATCH = "SENSOR_LOCATION_MISMATCH"
    DUPLICATE_PRESENCE = "DUPLICATE_PRESENCE"
    UNAUTHORIZED_ZONE_ENTRY = "UNAUTHORIZED_ZONE_ENTRY"
    ENDPOINT_VLAN_DISCREPANCY = "ENDPOINT_VLAN_DISCREPANCY"

class TopologyConflict(BaseModel):
    conflict_id: str
    conflict_type: TopologyConflictType
    category: str # "DATA_ERROR" or "TOPOLOGY_ERROR" vs "SECURITY_THREAT"
    entity_id: str
    reported_location: str
    expected_location: str
    confidence: float
    description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False
