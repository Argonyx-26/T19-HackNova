"""Sentinel-X Live Video Intelligence Engine package."""

from backend.app.intelligence.video.config import VideoEngineConfig, video_config
from backend.app.intelligence.video.models import (
    BehaviorType,
    AlertState,
    AlertSeverity,
    ZoneType,
    ZoneDefinition,
    ObjectDetection,
    VideoTelemetry,
    VideoAlertEvent,
    VideoFrameMetadata,
    CameraSourceConfig,
)
from backend.app.intelligence.video.detector import YOLOVideoDetector
from backend.app.intelligence.video.behavior_analyzer import TemporalBehaviorAnalyzer
from backend.app.intelligence.video.video_stream_manager import (
    VideoStreamManager,
    video_stream_manager,
)

__all__ = [
    "VideoEngineConfig",
    "video_config",
    "BehaviorType",
    "AlertState",
    "AlertSeverity",
    "ZoneType",
    "ZoneDefinition",
    "ObjectDetection",
    "VideoTelemetry",
    "VideoAlertEvent",
    "VideoFrameMetadata",
    "CameraSourceConfig",
    "YOLOVideoDetector",
    "TemporalBehaviorAnalyzer",
    "VideoStreamManager",
    "video_stream_manager",
]
