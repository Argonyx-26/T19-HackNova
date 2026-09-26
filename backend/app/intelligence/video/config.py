"""Centralized configuration for Sentinel-X Live Video Intelligence Engine."""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class VideoEngineConfig(BaseModel):
    # Model & Hardware
    model_name_or_path: str = Field(default="yolov8n.pt", description="YOLO model weights name or local path")
    device: str = Field(default="auto", description="'auto', 'cuda', 'cpu', or 'mps'")
    imgsz: int = Field(default=640, description="Inference image resolution")
    half_precision: bool = Field(default=False, description="Use FP16 if GPU supported")
    
    # Detection & NMS
    conf_threshold: float = Field(default=0.60, ge=0.1, le=1.0, description="Confidence threshold")
    iou_threshold: float = Field(default=0.70, ge=0.1, le=1.0, description="IoU threshold for NMS")
    max_detections: int = Field(default=100, description="Maximum detections per frame")
    tracker_type: str = Field(default="bytetrack.yaml", description="Tracker config (bytetrack.yaml or botsort.yaml)")
    
    # Stream & Real-time Processing
    frame_stride: int = Field(default=1, ge=1, le=10, description="Frame stride (1 = every frame)")
    stream_buffer: bool = Field(default=False, description="Buffer frames or drop stale frames for lowest latency")
    target_fps: int = Field(default=30, description="Target capture FPS")
    
    # Temporal Behavior Analysis Thresholds (seconds)
    loitering_seconds: float = Field(default=30.0, description="Duration in seconds before loitering is confirmed")
    abandoned_object_seconds: float = Field(default=30.0, description="Stationary object duration before abandoned alert")
    erratic_window_seconds: float = Field(default=3.0, description="Sliding window for erratic movement variance")
    fall_confirmation_seconds: float = Field(default=2.0, description="Temporal window to confirm sudden fall")
    restricted_zone_confirmation_seconds: float = Field(default=1.0, description="Zone breach confirmation window")
    direction_change_window_seconds: float = Field(default=2.0, description="Direction change analysis window")
    direction_change_threshold_deg: float = Field(default=75.0, description="Degrees of angle delta to flag rapid turn")
    
    # Spatial Thresholds (normalized 0.0 - 1.0)
    loitering_displacement_threshold: float = Field(default=0.08, description="Max displacement to count as stationary")
    running_velocity_threshold: float = Field(default=0.25, description="Normalized velocity per second to flag running")
    abandoned_distance_threshold: float = Field(default=0.20, description="Distance from owner to count as separated")
    
    # Temporal Smoothing
    temporal_history_seconds: float = Field(default=10.0, description="Maximum track trajectory history to retain in memory")
    smoothing_window_frames: int = Field(default=5, description="Frames for rolling majority behavior smoothing")
    
    # Behavior Model Extensibility
    behavior_model_path: Optional[str] = Field(default=None, description="Optional pluggable deep behavior/pose model")


# Global Singleton Configuration instance
video_config = VideoEngineConfig()
