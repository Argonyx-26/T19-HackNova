"""Domain model for System Telemetry and Observability Metrics."""

from datetime import datetime, timezone
from typing import Dict, Any
from pydantic import BaseModel, Field

class SystemMetric(BaseModel):
    metric_id: str
    events_ingested_total: int = 0
    events_per_second: float = 0.0
    active_situations_count: int = 0
    p95_correlation_latency_ms: float = 0.0
    p95_api_latency_ms: float = 0.0
    database_status: str = "CONNECTED"
    correlation_engine_status: str = "HEALTHY"
    source_health: Dict[str, str] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
