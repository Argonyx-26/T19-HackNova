"""Normalized Event Model for SENTINEL-X.

All disparate security events (CCTV, Network, Access Control, IoT) are converted
into this unified representation before contextual correlation.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class SourceType(str, Enum):
    CCTV = "CCTV"
    AUDIO = "AUDIO"
    ACCESS = "ACCESS"
    NETWORK = "NETWORK"
    IOT = "IOT"
    GEOSPATIAL = "GEOSPATIAL"

class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    VALIDATED = "VALIDATED"
    PROCESSED = "PROCESSED"
    CORRELATED = "CORRELATED"
    REJECTED = "REJECTED"

class NormalizedEvent(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    source_type: SourceType = Field(..., description="Originating domain source")
    source_id: str = Field(default="", description="Identifier of the originating sensor or capture point")
    event_type: str = Field(..., description="Semantic event classification name")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC occurrence timestamp")
    entity_id: str = Field(..., description="Associated physical or logical entity identifier")
    location_id: str = Field(..., description="Physical or logical location zone")
    location: str = Field(default="", description="Human-readable physical location descriptor")
    severity: float = Field(..., ge=0.0, le=1.0, description="Normalized severity score (0.0 to 1.0)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Sensor/source detection confidence (0.0 to 1.0)")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Raw source-specific technical attributes")
    provenance: str = Field(default="EDGE_DEVICE", description="Data pipeline provenance and sensor telemetry lineage")
    processing_status: ProcessingStatus = Field(default=ProcessingStatus.PROCESSED, description="Pipeline processing lifecycle status")
    processed: bool = Field(default=True, description="Whether event has been evaluated by the correlation engine")
    situation_id: Optional[str] = Field(default=None, description="Associated situation identifier once correlated")

    def model_post_init(self, __context: Any) -> None:
        if not self.source_id:
            self.source_id = f"{self.source_type.value.lower()}-{self.location_id}"
        if not self.location:
            self.location = self.location_id

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["timestamp"] = self.timestamp.isoformat()
        return doc
