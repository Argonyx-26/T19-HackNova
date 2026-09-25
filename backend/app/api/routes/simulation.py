"""Simulation Control API Routes for DEMO Scenario Streamer."""

import json
import threading
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from backend.app.schemas.event import EventCreate
from backend.app.services.event_service import event_service
from backend.app.services.correlation_service import correlation_service
from backend.app.db.mongodb import db_manager

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

class SimulationStartRequest(BaseModel):
    scenario: str = "escalation_alpha"
    speed: float = 1.0

class SimulationState:
    def __init__(self):
        self.running: bool = False
        self.current_step: int = 0
        self.total_steps: int = 0
        self.thread: Optional[threading.Thread] = None

sim_state = SimulationState()

def run_scenario_stream():
    root_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    scenario_path = root_dir / "data" / "scenarios" / "escalation.json"
    if not scenario_path.exists():
        sim_state.running = False
        return

    with open(scenario_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Initialize entities and locations
    entities_col = db_manager.get_collection("entities")
    locations_col = db_manager.get_collection("locations")
    for ent in data.get("entities", []):
        entities_col.update_one({"entity_id": ent["entity_id"]}, {"$set": ent})
    for loc in data.get("locations", []):
        locations_col.update_one({"location_id": loc["location_id"]}, {"$set": loc})

    events = data.get("events", [])
    sim_state.total_steps = len(events)
    sim_state.current_step = 0
    sim_state.running = True

    base_time = datetime.now(timezone.utc)

    for idx, raw_evt in enumerate(events):
        if not sim_state.running:
            break

        offset = raw_evt.get("offset_seconds", 0)
        evt_timestamp = base_time + timedelta(seconds=offset)
        
        evt_create = EventCreate(
            event_id=raw_evt["event_id"],
            source_type=raw_evt["source_type"],
            event_type=raw_evt["event_type"],
            timestamp=evt_timestamp,
            entity_id=raw_evt["entity_id"],
            location_id=raw_evt["location_id"],
            severity=raw_evt["severity"],
            confidence=raw_evt["confidence"],
            payload=raw_evt.get("payload", {})
        )

        # Ingest and trigger correlation + situation evolution
        normalized = event_service.ingest_event(evt_create)
        correlation_service.process_event(normalized)

        sim_state.current_step = idx + 1
        time.sleep(1.2)  # Controlled stream delay for live observation

    sim_state.running = False

@router.post("/start")
def start_simulation(request: SimulationStartRequest = SimulationStartRequest()):
    """Trigger the live demonstration scenario streamer."""
    if sim_state.running:
        return {"status": "already_running", "message": "Simulation is already active"}

    sim_state.thread = threading.Thread(target=run_scenario_stream, daemon=True)
    sim_state.thread.start()
    return {"status": "started", "message": f"Scenario '{request.scenario}' started"}

@router.post("/stop")
def stop_simulation():
    """Halt active scenario streaming."""
    sim_state.running = False
    return {"status": "stopped"}

@router.get("/status")
def get_simulation_status():
    """Query current scenario playback status."""
    return {
        "running": sim_state.running,
        "current_step": sim_state.current_step,
        "total_steps": sim_state.total_steps
    }
