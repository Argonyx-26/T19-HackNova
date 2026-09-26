"""Data models and schemas for the Sentinel-X Live Video Intelligence Engine."""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field


class BehaviorType(str, Enum):
    # Normal behaviors
    NORMAL_WALKING = "NORMAL_WALKING"
    STANDING = "STANDING"
    SITTING = "SITTING"
    RUNNING = "RUNNING"
    NORMAL_CROWD_MOVEMENT = "NORMAL_CROWD_MOVEMENT"
    
    # Abnormal / Suspicious behaviors
    LOITERING = "LOITERING"
    ERRATIC_MOVEMENT = "ERRATIC_MOVEMENT"
    RESTRICTED_ZONE_ACCESS = "RESTRICTED_ZONE_ACCESS"
    SUDDEN_FALL = "SUDDEN_FALL"
    AGGRESSIVE_BEHAVIOR = "AGGRESSIVE_BEHAVIOR"
    RAPID_DIRECTION_CHANGE = "RAPID_DIRECTION_CHANGE"
    ABANDONED_OBJECT = "ABANDONED_OBJECT"
    
    # Meta
    UNKNOWN = "UNKNOWN"
    UNCERTAIN = "UNCERTAIN"


class AlertState(str, Enum):
    NORMAL = "NORMAL"
    OBSERVED = "OBSERVED"
    SUSPECTED = "SUSPECTED"
    CONFIRMED = "CONFIRMED"
    ALERT = "ALERT"
    RESOLVED = "RESOLVED"


class AlertSeverity(str, Enum):
    NORMAL = "NORMAL"
    SUSPICIOUS = "SUSPICIOUS"
    ABNORMAL = "ABNORMAL"
    CRITICAL = "CRITICAL"


class ZoneType(str, Enum):
    RESTRICTED = "RESTRICTED"
    CONTROLLED = "CONTROLLED"
    MONITORED = "MONITORED"
    SAFE = "SAFE"


class ZoneState(str, Enum):
    OUTSIDE = "OUTSIDE"
    ENTERING = "ENTERING"
    INSIDE = "INSIDE"
    EXITING = "EXITING"


class BBoxXYXY(BaseModel):
    x1: float = Field(..., description="Top-left x in pixels or normalized")
    y1: float = Field(..., description="Top-left y in pixels or normalized")
    x2: float = Field(..., description="Bottom-right x in pixels or normalized")
    y2: float = Field(..., description="Bottom-right y in pixels or normalized")


class SquareBBox(BaseModel):
    cx: float = Field(..., description="Center X")
    cy: float = Field(..., description="Center Y")
    size: float = Field(..., description="Max width/height bounding dimension")
    x1: float = Field(..., description="Clipped square top-left x")
    y1: float = Field(..., description="Clipped square top-left y")
    x2: float = Field(..., description="Clipped square bottom-right x")
    y2: float = Field(..., description="Clipped square bottom-right y")


class ZoneDefinition(BaseModel):
    zone_id: str
    camera_id: str
    name: str
    zone_type: ZoneType = ZoneType.RESTRICTED
    polygon: List[Tuple[float, float]] = Field(
        ..., description="List of (x, y) points in normalized (0.0 - 1.0) coordinates"
    )
    is_active: bool = True


class ObjectDetection(BaseModel):
    track_id: int
    class_id: int
    class_name: str
    confidence: float
    bbox: BBoxXYXY
    square_bbox: SquareBBox
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    camera_id: str
    behavior: BehaviorType = BehaviorType.NORMAL_WALKING
    behavior_confidence: float = 0.90
    alert_severity: AlertSeverity = AlertSeverity.NORMAL
    alert_state: AlertState = AlertState.NORMAL
    current_zone: Optional[str] = None
    velocity: float = 0.0
    dwell_time_seconds: float = 0.0


class TrackHistoryPoint(BaseModel):
    timestamp: float
    cx: float
    cy: float
    x1: float
    y1: float
    x2: float
    y2: float
    w: float
    h: float
    aspect_ratio: float


class VideoTelemetry(BaseModel):
    source_fps: float = 30.0
    inference_fps: float = 24.0
    display_fps: float = 24.0
    latency_ms: float = 35.0
    device: str = "CPU"
    model_name: str = "YOLOv8n"
    tracker_type: str = "ByteTrack"
    stream_status: str = "LIVE"  # LIVE | SIMULATION | OFFLINE | INITIALIZING
    active_tracks_count: int = 0
    anomalies_count: int = 0
    model_status: str = "LIVE DETECTION ACTIVE"  # INITIALIZING MODEL... | MODEL READY | LIVE DETECTION ACTIVE | OFFLINE


class VideoAlertEvent(BaseModel):
    alert_id: str
    camera_id: str
    track_id: int
    behavior: BehaviorType
    severity: AlertSeverity
    state: AlertState
    zone: Optional[str] = None
    confidence: float
    duration_seconds: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    bbox: BBoxXYXY
    explanation: str


class VideoFrameMetadata(BaseModel):
    frame_id: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    camera_id: str
    detections: List[ObjectDetection]
    active_alerts: List[VideoAlertEvent]
    telemetry: VideoTelemetry


class CameraSourceConfig(BaseModel):
    camera_id: str
    name: str
    location: str
    zone: str
    source_type: str = "WEBCAM"  # WEBCAM | RTSP | FILE | HLS
    source_url_or_index: str = "0"
    is_simulation: bool = False
    is_active: bool = True
    fps: int = 30
    resolution: Tuple[int, int] = (1280, 720)
