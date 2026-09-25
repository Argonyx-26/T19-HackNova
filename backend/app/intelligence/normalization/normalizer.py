"""Normalizer transforming heterogeneous raw event streams into NormalizedEvent instances."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from backend.app.models.event import NormalizedEvent, SourceType

class EventNormalizer:
    @staticmethod
    def normalize(raw_data: Dict[str, Any]) -> NormalizedEvent:
        """Convert arbitrary incoming payload into standard NormalizedEvent."""
        # 1. Deduce or enforce event_id
        event_id = raw_data.get("event_id") or f"evt-{uuid.uuid4().hex[:8]}"

        # 2. Parse source type robustly
        source_val = raw_data.get("source_type")
        if isinstance(source_val, SourceType):
            source_type = source_val
        else:
            s_str = str(source_val or "").upper().replace("SOURCETYPE.", "")
            try:
                source_type = SourceType(s_str)
            except ValueError:
                source_type = SourceType.ACCESS

        # 3. Parse timestamp
        raw_ts = raw_data.get("timestamp")
        if isinstance(raw_ts, datetime):
            ts = raw_ts if raw_ts.tzinfo else raw_ts.replace(tzinfo=timezone.utc)
        elif isinstance(raw_ts, str):
            try:
                ts = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
            except ValueError:
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        # 4. Standardize severity and confidence bounds
        try:
            severity = max(0.0, min(1.0, float(raw_data.get("severity", 0.5))))
        except (ValueError, TypeError):
            severity = 0.5

        try:
            confidence = max(0.0, min(1.0, float(raw_data.get("confidence", 0.9))))
        except (ValueError, TypeError):
            confidence = 0.9

        return NormalizedEvent(
            event_id=event_id,
            source_type=source_type,
            event_type=str(raw_data.get("event_type", "unknown_event")),
            timestamp=ts,
            entity_id=str(raw_data.get("entity_id", "unknown_entity")),
            location_id=str(raw_data.get("location_id", "unknown_location")),
            severity=severity,
            confidence=confidence,
            payload=raw_data.get("payload", {}) if isinstance(raw_data.get("payload"), dict) else {},
            processed=False,
            situation_id=raw_data.get("situation_id"),
        )
