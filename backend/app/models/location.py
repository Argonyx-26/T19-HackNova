"""Location model representing zones and spatial adjacency."""

from typing import Any, Dict, List
from pydantic import BaseModel, Field

class Location(BaseModel):
    location_id: str = Field(..., description="Unique zone identifier")
    name: str = Field(..., description="Human-readable zone name")
    zone_type: str = Field(default="STANDARD", description="Security level classification: PERIMETER, RESTRICTED, PUBLIC, LAB")
    adjacent_locations: List[str] = Field(default_factory=list, description="IDs of physically adjacent or directly connected zones")
    metadata: Dict[str, Any] = Field(default_factory=dict)
