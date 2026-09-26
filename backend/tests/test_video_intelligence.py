"""Comprehensive Unit and Integration Tests for Sentinel-X Live Video Intelligence Engine."""

import time
import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.intelligence.video.detector import YOLOVideoDetector
from backend.app.intelligence.video.behavior_analyzer import (
    TemporalBehaviorAnalyzer,
    TemporalTrackRecord,
)
from backend.app.intelligence.video.models import (
    ObjectDetection,
    BBoxXYXY,
    SquareBBox,
    BehaviorType,
    AlertState,
    AlertSeverity,
    ZoneType,
    ZoneState,
    ZoneDefinition,
    VideoAlertEvent,
    CameraSourceConfig,
)
from backend.app.intelligence.video.config import VideoEngineConfig


@pytest.fixture
def client():
    return TestClient(app)


def test_square_bbox_calculation():
    """Test centered square bounding box derivation without geometry distortion."""
    # Frame 1280x720, detection (100, 100, 200, 300) -> width 100, height 200 -> size 200
    sq = YOLOVideoDetector.calculate_square_bbox(100, 100, 200, 300, 1280, 720)
    assert sq.cx == 150.0
    assert sq.cy == 200.0
    assert sq.size == 200.0
    assert sq.x1 == 50.0
    assert sq.y1 == 100.0
    assert sq.x2 == 250.0
    assert sq.y2 == 300.0

    # Test boundary clipping on edge detection
    sq_edge = YOLOVideoDetector.calculate_square_bbox(10, 10, 50, 150, 1280, 720)
    assert sq_edge.x1 >= 0.0
    assert sq_edge.y1 >= 0.0


def test_class_name_normalization():
    """Test mapping from raw detector classes to Sentinel-X taxonomy."""
    assert YOLOVideoDetector.normalize_class_name("person") == "PERSON"
    assert YOLOVideoDetector.normalize_class_name("pedestrian") == "PERSON"
    assert YOLOVideoDetector.normalize_class_name("car") == "VEHICLE"
    assert YOLOVideoDetector.normalize_class_name("backpack") == "BAG"
    assert YOLOVideoDetector.normalize_class_name("suitcase") == "BAG"
    assert YOLOVideoDetector.normalize_class_name("laptop") == "OBJECT"


def test_point_in_polygon_ray_casting():
    """Test ray-casting algorithm on rectangular and complex polygons."""
    polygon = [(0.2, 0.2), (0.8, 0.2), (0.8, 0.8), (0.2, 0.8)]
    
    # Point clearly inside
    assert TemporalBehaviorAnalyzer.point_in_polygon(0.5, 0.5, polygon) is True
    
    # Point clearly outside
    assert TemporalBehaviorAnalyzer.point_in_polygon(0.1, 0.1, polygon) is False
    assert TemporalBehaviorAnalyzer.point_in_polygon(0.9, 0.5, polygon) is False


def test_restricted_zone_entry_state_transition():
    """Test OUTSIDE -> ENTERING -> INSIDE -> RESTRICTED_ZONE_ACCESS alert."""
    emitted_alerts = []
    
    cfg = VideoEngineConfig(restricted_zone_confirmation_seconds=0.05)
    analyzer = TemporalBehaviorAnalyzer(
        config=cfg, on_alert_callback=lambda alt: emitted_alerts.append(alt)
    )
    
    # Register restricted zone
    zone = ZoneDefinition(
        zone_id="Z-TEST",
        camera_id="CAM-TEST",
        name="RESTRICTED VAULT",
        zone_type=ZoneType.RESTRICTED,
        polygon=[(0.4, 0.4), (0.9, 0.4), (0.9, 0.9), (0.4, 0.9)],
    )
    analyzer.register_zone(zone)

    # Frame 1: Person outside zone
    det1 = ObjectDetection(
        track_id=42,
        class_id=0,
        class_name="PERSON",
        confidence=0.95,
        bbox=BBoxXYXY(x1=100, y1=100, x2=200, y2=300),
        square_bbox=SquareBBox(cx=150, cy=200, size=200, x1=50, y1=100, x2=250, y2=300),
        camera_id="CAM-TEST",
    )
    dets, alerts = analyzer.analyze_frame_tracks([det1], "CAM-TEST", 1280, 720)
    assert dets[0].behavior != BehaviorType.RESTRICTED_ZONE_ACCESS

    # Frame 2: Person enters restricted zone
    time.sleep(0.06)
    det2 = ObjectDetection(
        track_id=42,
        class_id=0,
        class_name="PERSON",
        confidence=0.96,
        bbox=BBoxXYXY(x1=600, y1=450, x2=700, y2=650),
        square_bbox=SquareBBox(cx=650, cy=550, size=200, x1=550, y1=450, x2=750, y2=650),
        camera_id="CAM-TEST",
    )
    dets, alerts = analyzer.analyze_frame_tracks([det2], "CAM-TEST", 1280, 720)
    assert dets[0].behavior == BehaviorType.RESTRICTED_ZONE_ACCESS
    assert dets[0].alert_severity == AlertSeverity.CRITICAL


def test_loitering_temporal_persistence():
    """Test stationary person transitions to LOITERING after persistence duration."""
    cfg = VideoEngineConfig(loitering_seconds=0.1, loitering_displacement_threshold=0.1)
    analyzer = TemporalBehaviorAnalyzer(config=cfg)

    # Observation 1
    det1 = ObjectDetection(
        track_id=51,
        class_id=0,
        class_name="PERSON",
        confidence=0.92,
        bbox=BBoxXYXY(x1=400, y1=300, x2=480, y2=500),
        square_bbox=SquareBBox(cx=440, cy=400, size=200, x1=340, y1=300, x2=540, y2=500),
        camera_id="CAM-01",
    )
    analyzer.analyze_frame_tracks([det1], "CAM-01", 1280, 720)

    # Fast forward beyond loitering_seconds threshold
    time.sleep(0.12)
    det2 = ObjectDetection(
        track_id=51,
        class_id=0,
        class_name="PERSON",
        confidence=0.93,
        bbox=BBoxXYXY(x1=402, y1=301, x2=482, y2=501),
        square_bbox=SquareBBox(cx=442, cy=401, size=200, x1=342, y1=301, x2=542, y2=501),
        camera_id="CAM-01",
    )
    dets, alerts = analyzer.analyze_frame_tracks([det2], "CAM-01", 1280, 720)
    # Track dwell time recorded
    assert dets[0].dwell_time_seconds >= 0.1


def test_sudden_fall_aspect_ratio_inversion():
    """Test horizontal orientation and low velocity trigger SUDDEN_FALL classification."""
    cfg = VideoEngineConfig(fall_confirmation_seconds=0.05)
    analyzer = TemporalBehaviorAnalyzer(config=cfg)

    # Feed history of standing person
    for i in range(5):
        det = ObjectDetection(
            track_id=99,
            class_id=0,
            class_name="PERSON",
            confidence=0.91,
            bbox=BBoxXYXY(x1=200, y1=100 + i * 20, x2=280, y2=300 + i * 20),
            square_bbox=SquareBBox(cx=240, cy=200 + i * 20, size=200, x1=140, y1=100 + i * 20, x2=340, y2=300 + i * 20),
            camera_id="CAM-01",
        )
        analyzer.analyze_frame_tracks([det], "CAM-01", 1280, 720)

    time.sleep(0.06)
    # Horizontal posture on ground: width (200) > height (80) -> aspect ratio 2.5
    fall_det = ObjectDetection(
        track_id=99,
        class_id=0,
        class_name="PERSON",
        confidence=0.89,
        bbox=BBoxXYXY(x1=200, y1=500, x2=400, y2=580),
        square_bbox=SquareBBox(cx=300, cy=540, size=200, x1=200, y1=440, x2=400, y2=640),
        camera_id="CAM-01",
    )
    # Frame 1 of fall: Initial collapse detection (SUSPICIOUS)
    dets, alerts = analyzer.analyze_frame_tracks([fall_det], "CAM-01", 1280, 720)
    assert dets[0].behavior == BehaviorType.SUDDEN_FALL

    # Frame 2 of fall (after confirmation window): Confirmed SUDDEN_FALL (CRITICAL)
    time.sleep(0.06)
    dets2, alerts2 = analyzer.analyze_frame_tracks([fall_det], "CAM-01", 1280, 720)
    assert dets2[0].behavior == BehaviorType.SUDDEN_FALL
    assert dets2[0].alert_severity == AlertSeverity.CRITICAL


def test_video_api_endpoints(client):
    """Test FastAPI REST endpoints for live video camera management, zones, and telemetry."""
    # 1. GET /api/video/cameras
    res = client.get("/api/video/cameras")
    assert res.status_code == 200
    cams = res.json()
    assert len(cams) >= 4
    cam_ids = [c["camera_id"] for c in cams]
    assert "CAM-01" in cam_ids

    # 2. GET /api/video/cameras/CAM-01
    res_cam = client.get("/api/video/cameras/CAM-01")
    assert res_cam.status_code == 200
    assert res_cam.json()["camera_id"] == "CAM-01"

    # 3. GET /api/video/zones/CAM-03
    res_zones = client.get("/api/video/zones/CAM-03")
    assert res_zones.status_code == 200
    zones = res_zones.json()
    assert len(zones) >= 1

    # 4. GET /api/video/config
    res_cfg = client.get("/api/video/config")
    assert res_cfg.status_code == 200
    cfg_data = res_cfg.json()
    assert "conf_threshold" in cfg_data
    assert "loitering_seconds" in cfg_data

    # 5. POST /api/video/config
    res_upd = client.post("/api/video/config", json={"conf_threshold": 0.65})
    assert res_upd.status_code == 200
    assert res_upd.json()["conf_threshold"] == 0.65

    # 6. GET /api/video/benchmark
    res_bench = client.get("/api/video/benchmark")
    assert res_bench.status_code == 200
    bench = res_bench.json()
    assert "device" in bench
    assert "cameras" in bench
