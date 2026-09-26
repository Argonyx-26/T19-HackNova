"""Source Health Service monitoring feed reliability and evidence ingestion latency."""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from backend.app.models.source_health import SensorFeedHealth, SensorFeedStatus, SourceWeatherReport

logger = logging.getLogger("sentinel.source_health")

class SourceHealthService:
    def __init__(self):
        self._feeds: Dict[str, SensorFeedHealth] = {
            "CCTV": SensorFeedHealth(
                source_type="CCTV",
                status=SensorFeedStatus.DEGRADED,
                latency_ms=142.0,
                packet_loss_pct=1.4,
                total_events_today=1420,
                quality_score=0.88,
                active_channel_count=14,
                status_detail="H.265 Stream sync jitter observed on Camera Lab-A (8.4s lag)"
            ),
            "AUDIO": SensorFeedHealth(
                source_type="AUDIO",
                status=SensorFeedStatus.ONLINE,
                latency_ms=34.0,
                packet_loss_pct=0.0,
                total_events_today=650,
                quality_score=0.99,
                active_channel_count=8,
                status_detail="Acoustic sensor array operating within normal frequency profile"
            ),
            "ACCESS": SensorFeedHealth(
                source_type="ACCESS",
                status=SensorFeedStatus.ONLINE,
                latency_ms=18.0,
                packet_loss_pct=0.0,
                total_events_today=3200,
                quality_score=1.0,
                active_channel_count=24,
                status_detail="RFID / Biometric turnstile interlocks responding sub-20ms"
            ),
            "NETWORK": SensorFeedHealth(
                source_type="NETWORK",
                status=SensorFeedStatus.ONLINE,
                latency_ms=12.0,
                packet_loss_pct=0.01,
                total_events_today=48500,
                quality_score=0.98,
                active_channel_count=6,
                status_detail="Core NetFlow telemetry stream active at 10 Gbps ingress"
            ),
            "IOT": SensorFeedHealth(
                source_type="IOT",
                status=SensorFeedStatus.ONLINE,
                latency_ms=25.0,
                packet_loss_pct=0.1,
                total_events_today=18400,
                quality_score=0.96,
                active_channel_count=32,
                status_detail="Rack vibration and thermal telemetry operating nominally"
            ),
            "GEO": SensorFeedHealth(
                source_type="GEO",
                status=SensorFeedStatus.ONLINE,
                latency_ms=88.0,
                packet_loss_pct=0.0,
                total_events_today=410,
                quality_score=0.95,
                active_channel_count=3,
                status_detail="Airspace ADS-B, AIS Maritime, and Seismic feeds connected"
            )
        }

    def get_weather_report(self) -> SourceWeatherReport:
        feed_list = list(self._feeds.values())
        degraded = [f for f in feed_list if f.status in [SensorFeedStatus.DEGRADED, SensorFeedStatus.DELAYED, SensorFeedStatus.OFFLINE]]
        
        system_health = "OPTIMAL" if not degraded else ("DEGRADED" if len(degraded) <= 2 else "IMPAIRED")
        
        return SourceWeatherReport(
            overall_system_health=system_health,
            active_sources=len(feed_list),
            degraded_sources=len(degraded),
            feeds=feed_list,
            timestamp=datetime.now(timezone.utc)
        )

    def update_feed_status(self, source_type: str, status: SensorFeedStatus, detail: str = ""):
        if source_type in self._feeds:
            self._feeds[source_type].status = status
            if detail:
                self._feeds[source_type].status_detail = detail
            self._feeds[source_type].last_heartbeat = datetime.now(timezone.utc)
            logger.info(f"Updated source health for {source_type}: {status.value}")

source_health_service = SourceHealthService()
