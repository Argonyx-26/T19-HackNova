"""Domain models for Source Health & Source Weather Telemetry."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class SensorFeedStatus(str, Enum):
    ONLINE = "ONLINE"
    DEGRADED = "DEGRADED"
    DELAYED = "DELAYED"
    OFFLINE = "OFFLINE"
    STALE = "STALE"

class SensorFeedHealth(BaseModel):
    source_type: str                   # CCTV, AUDIO, ACCESS, NETWORK, IOT, GEO
    status: SensorFeedStatus           # ONLINE, DEGRADED, DELAYED, OFFLINE, STALE
    latency_ms: float
    packet_loss_pct: float
    last_heartbeat: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_events_today: int
    quality_score: float = Field(ge=0.0, le=1.0) # 0.0 to 1.0
    active_channel_count: int
    status_detail: str

class SourceWeatherReport(BaseModel):
    overall_system_health: str         # OPTIMAL, DEGRADED, IMPAIRED
    active_sources: int
    degraded_sources: int
    feeds: List[SensorFeedHealth] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
