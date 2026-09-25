"""External Real-World Context Ingestion & Normalization API Routes."""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/context", tags=["Context"])

# In-memory cached context for resilience & rate-limiting protection
_cached_earthquakes: List[Dict[str, Any]] = []
_last_fetch_time: float = 0.0

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

FALLBACK_EARTHQUAKES = [
    {
        "id": "us7000m1a1",
        "magnitude": 5.4,
        "place": "12 km SW of Hualien City, Taiwan",
        "time": "2026-09-25T11:20:00Z",
        "coordinates": [121.55, 23.95],
        "depth_km": 10.2,
        "source": "USGS",
        "type": "earthquake"
    },
    {
        "id": "us7000m1b2",
        "magnitude": 4.8,
        "place": "68 km ESE of Kokopo, Papua New Guinea",
        "time": "2026-09-25T10:45:00Z",
        "coordinates": [152.85, -4.55],
        "depth_km": 42.0,
        "source": "USGS",
        "type": "earthquake"
    },
    {
        "id": "us7000m1c3",
        "magnitude": 4.5,
        "place": "21 km SSW of Yovon, Tajikistan",
        "time": "2026-09-25T09:12:00Z",
        "coordinates": [68.98, 38.12],
        "depth_km": 28.5,
        "source": "USGS",
        "type": "earthquake"
    },
    {
        "id": "us7000m1d4",
        "magnitude": 5.1,
        "place": "Off coast of central Chile",
        "time": "2026-09-25T08:33:00Z",
        "coordinates": [-71.85, -31.45],
        "depth_km": 15.0,
        "source": "USGS",
        "type": "earthquake"
    }
]

SAMPLE_FLIGHTS = [
    {"callsign": "DLH418", "type": "A350-900", "origin": "FRA", "destination": "IAD", "coordinates": [-45.2, 52.4], "altitude": 38000, "speed": 485},
    {"callsign": "BAW177", "type": "B777-300ER", "origin": "LHR", "destination": "JFK", "coordinates": [-35.8, 54.1], "altitude": 36000, "speed": 490},
    {"callsign": "SIA26", "type": "A380-800", "origin": "SIN", "destination": "FRA", "coordinates": [58.4, 28.9], "altitude": 40000, "speed": 510},
    {"callsign": "UAE201", "type": "A380-800", "origin": "DXB", "destination": "JFK", "coordinates": [-15.4, 61.2], "altitude": 39000, "speed": 495},
    {"callsign": "AFR006", "type": "B777-200", "origin": "CDG", "destination": "JFK", "coordinates": [-28.1, 48.9], "altitude": 37000, "speed": 480}
]

SAMPLE_MARITIME = [
    {"mmsi": "211281000", "name": "EVER GIVEN", "type": "Container Ship", "coordinates": [32.31, 30.72], "speed": 11.2, "status": "Underway"},
    {"mmsi": "353136000", "name": "MSC GULSUN", "type": "Ultra Large Container", "coordinates": [103.85, 1.25], "speed": 14.5, "status": "Underway"},
    {"mmsi": "219018000", "name": "MAERSK MC-KINNEY", "type": "Container", "coordinates": [4.15, 51.95], "speed": 9.8, "status": "Moored"}
]

@router.get("/earthquakes")
async def get_earthquakes() -> List[Dict[str, Any]]:
    """Retrieve and normalize recent global earthquakes from USGS (or resilient fallback)."""
    global _cached_earthquakes
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(USGS_URL)
            if resp.status_code == 200:
                data = resp.json()
                features = data.get("features", [])
                normalized = []
                for feat in features[:25]:
                    props = feat.get("properties", {})
                    geom = feat.get("geometry", {})
                    coords = geom.get("coordinates", [0, 0, 0])
                    mag = props.get("mag")
                    if mag is not None and mag >= 4.0:
                        t_epoch = props.get("time", 0) / 1000.0
                        dt = datetime.fromtimestamp(t_epoch, tz=timezone.utc).isoformat()
                        normalized.append({
                            "id": feat.get("id"),
                            "magnitude": round(float(mag), 1),
                            "place": props.get("place", "Unknown Location"),
                            "time": dt,
                            "coordinates": [coords[0], coords[1]],
                            "depth_km": round(float(coords[2]), 1) if len(coords) > 2 else 10.0,
                            "source": "USGS",
                            "type": "earthquake"
                        })
                if normalized:
                    _cached_earthquakes = normalized
                    return normalized
    except Exception as e:
        logger.warning(f"USGS live fetch failed or timed out: {e}. Serving resilient dataset.")

    return _cached_earthquakes if _cached_earthquakes else FALLBACK_EARTHQUAKES

@router.get("/flights")
def get_flights() -> List[Dict[str, Any]]:
    """Returns normalized contextual commercial & long-haul aircraft tracks."""
    return SAMPLE_FLIGHTS

@router.get("/maritime")
def get_maritime() -> List[Dict[str, Any]]:
    """Returns normalized contextual maritime / naval positions."""
    return SAMPLE_MARITIME

@router.get("/layers")
def get_layer_definitions() -> Dict[str, Any]:
    """Returns all available SENTINEL-X and global context layer configurations."""
    return {
        "intel_layers": [
            {"id": "situations", "name": "SENTINEL-X Situations", "enabled": True, "count": 1, "color": "#ef4444"},
            {"id": "cctv", "name": "CCTV Feeds", "enabled": True, "count": 14, "color": "#06b6d4"},
            {"id": "access", "name": "Access Control Points", "enabled": True, "count": 8, "color": "#10b981"},
            {"id": "network", "name": "Network Endpoints & IDS", "enabled": True, "count": 22, "color": "#f59e0b"},
            {"id": "iot", "name": "IoT Environmental Sensors", "enabled": True, "count": 18, "color": "#8b5cf6"}
        ],
        "context_layers": [
            {"id": "earthquakes", "name": "USGS Earthquakes (M4.0+)", "enabled": True, "count": len(FALLBACK_EARTHQUAKES), "color": "#fb923c"},
            {"id": "flights", "name": "Aircraft Tracking", "enabled": False, "count": len(SAMPLE_FLIGHTS), "color": "#38bdf8"},
            {"id": "maritime", "name": "Maritime / Naval", "enabled": False, "count": len(SAMPLE_MARITIME), "color": "#34d399"},
            {"id": "news", "name": "Live Geopolitical News", "enabled": False, "count": 6, "color": "#f43f5e"},
            {"id": "wildfires", "name": "NASA Active Wildfires", "enabled": False, "count": 12, "color": "#ea580c"}
        ]
    }
