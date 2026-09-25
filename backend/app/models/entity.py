"""Entity model representing physical or logical security assets."""

from enum import Enum
from typing import Any, Dict
from pydantic import BaseModel, Field

class EntityType(str, Enum):
    PERSON = "PERSON"
    DEVICE = "DEVICE"
    CAMERA = "CAMERA"
    NETWORK_ENDPOINT = "NETWORK_ENDPOINT"
    ACCESS_POINT = "ACCESS_POINT"
    VEHICLE = "VEHICLE"

class Entity(BaseModel):
    entity_id: str = Field(..., description="Unique entity ID")
    entity_type: EntityType = Field(..., description="Entity classification")
    name: str = Field(..., description="Human-readable entity name")
    status: str = Field(default="ACTIVE", description="Current operational status: ACTIVE, ISOLATED, FLAGGED, BLOCKED")
    metadata: Dict[str, Any] = Field(default_factory=dict)
