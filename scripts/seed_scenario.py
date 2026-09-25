#!/usr/bin/env python3
"""SENTINEL-X Scenario Seeder and Streamer.

Reads multi-source scenario JSON files (e.g. data/scenarios/escalation.json)
and injects events with accurate timestamp progression into SENTINEL-X.
"""

import sys
import json
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
import httpx

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.core.config import settings
from backend.app.schemas.event import EventCreate
from backend.app.services.event_service import event_service
from backend.app.db.mongodb import db_manager

def seed_scenario(scenario_file: str = "data/scenarios/escalation.json", target_url: str = None, delay: float = 0.0):
    scenario_path = root_dir / scenario_file
    if not scenario_path.exists():
        print(f"[ERROR] Scenario file {scenario_path} not found.")
        return 1

    with open(scenario_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("=" * 65)
    print(f"SENTINEL-X SCENARIO SEEDER: {data.get('scenario_name')}")
    print(f"Description: {data.get('description')}")
    print("=" * 65)

    # 1. Seed entities and locations if direct DB access
    if not target_url:
        db_manager.connect()
        entities_col = db_manager.get_collection("entities")
        locations_col = db_manager.get_collection("locations")
        for ent in data.get("entities", []):
            entities_col.update_one({"entity_id": ent["entity_id"]}, {"$set": ent})
        for loc in data.get("locations", []):
            locations_col.update_one({"location_id": loc["location_id"]}, {"$set": loc})
        print(f"[INITIALIZED] {len(data.get('entities', []))} entities and {len(data.get('locations', []))} locations seeded.")

    # 2. Replay events with adjusted timestamps
    base_time = datetime.now(timezone.utc) - timedelta(minutes=5)
    events = data.get("events", [])
    print(f"[STREAMING] Injecting {len(events)} events (delay={delay}s)...")

    client = httpx.Client(base_url=target_url, timeout=10.0) if target_url else None

    for idx, raw_evt in enumerate(events, 1):
        offset = raw_evt.get("offset_seconds", 0)
        evt_timestamp = base_time + timedelta(seconds=offset)
        
        evt_payload = dict(raw_evt)
        evt_payload.pop("offset_seconds", None)
        evt_payload["timestamp"] = evt_timestamp.isoformat()

        if target_url:
            try:
                resp = client.post("/api/events", json=evt_payload)
                print(f"[{idx}/{len(events)}] POST /api/events -> {resp.status_code} ({raw_evt['source_type']}:{raw_evt['event_type']})")
            except Exception as e:
                print(f"[ERROR] Failed to post event to API: {e}")
        else:
            # Direct service ingestion
            create_schema = EventCreate(
                event_id=evt_payload.get("event_id"),
                source_type=evt_payload["source_type"],
                event_type=evt_payload["event_type"],
                timestamp=evt_timestamp,
                entity_id=evt_payload["entity_id"],
                location_id=evt_payload["location_id"],
                severity=evt_payload["severity"],
                confidence=evt_payload["confidence"],
                payload=evt_payload.get("payload", {})
            )
            ingested = event_service.ingest_event(create_schema)
            print(f"[{idx}/{len(events)}] Ingested {ingested.event_id}: [{ingested.source_type}] {ingested.event_type} at {ingested.location_id}")

        if delay > 0 and idx < len(events):
            time.sleep(delay)

    print("[SUCCESS] Scenario injection complete.")
    return 0

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SENTINEL-X Scenario Seeder")
    parser.add_argument("--file", default="data/scenarios/escalation.json", help="Path to scenario JSON")
    parser.add_argument("--api", default=None, help="Target API URL (e.g. http://127.0.0.1:8000)")
    parser.add_argument("--delay", type=float, default=0.0, help="Delay in seconds between events")
    args = parser.parse_args()
    
    sys.exit(seed_scenario(scenario_file=args.file, target_url=args.api, delay=args.delay))
