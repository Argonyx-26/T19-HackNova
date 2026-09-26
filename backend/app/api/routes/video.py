"""Live Video Intelligence REST API and WebSocket Stream Endpoints."""

import asyncio
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from fastapi.responses import StreamingResponse

from backend.app.intelligence.video.models import (
    CameraSourceConfig,
    VideoFrameMetadata,
    ZoneDefinition,
    VideoTelemetry,
)
from backend.app.intelligence.video.config import VideoEngineConfig, video_config
from backend.app.intelligence.video.video_stream_manager import video_stream_manager

logger = logging.getLogger("sentinel.api.video")

router = APIRouter(prefix="/api/video", tags=["Live Video Intelligence"])


@router.get("/cameras", response_model=List[CameraSourceConfig])
def list_cameras():
    """List all registered video camera streams."""
    return list(video_stream_manager.cameras.values())


@router.get("/cameras/{camera_id}", response_model=CameraSourceConfig)
def get_camera(camera_id: str):
    """Get metadata for a specific camera stream."""
    cam = video_stream_manager.cameras.get(camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail=f"Camera '{camera_id}' not found")
    return cam


@router.post("/cameras", response_model=CameraSourceConfig, status_code=status.HTTP_201_CREATED)
def add_camera(camera_in: CameraSourceConfig):
    """Register or update a camera feed source (Webcam index, RTSP URL, or file)."""
    try:
        video_stream_manager.add_camera(camera_in)
        return camera_in
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to configure camera: {str(e)}")


@router.get("/stream/{camera_id}")
def get_video_stream(camera_id: str):
    """Stream live MJPEG video with bounding boxes and overlay-ready frames."""
    if camera_id not in video_stream_manager.cameras:
        raise HTTPException(status_code=404, detail=f"Camera '{camera_id}' not found")
    
    return StreamingResponse(
        video_stream_manager.generate_mjpeg_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/metadata/{camera_id}", response_model=Optional[VideoFrameMetadata])
def get_latest_metadata(camera_id: str):
    """Retrieve the latest frame detections, square bounding boxes, behaviors, and telemetry."""
    if camera_id not in video_stream_manager.cameras:
        raise HTTPException(status_code=404, detail=f"Camera '{camera_id}' not found")
    
    meta = video_stream_manager.get_latest_metadata(camera_id)
    if not meta:
        return None
    return meta


@router.get("/zones/{camera_id}", response_model=List[ZoneDefinition])
def get_zones(camera_id: str):
    """Get all polygonal zones configured for a specific camera."""
    return video_stream_manager.behavior_analyzer.get_zones(camera_id)


@router.post("/zones", response_model=ZoneDefinition, status_code=status.HTTP_201_CREATED)
def add_zone(zone: ZoneDefinition):
    """Create or update a polygonal zone for behavioral boundary tracking."""
    try:
        video_stream_manager.behavior_analyzer.register_zone(zone)
        return zone
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to register zone: {str(e)}")


@router.delete("/zones/{camera_id}/{zone_id}")
def remove_zone(camera_id: str, zone_id: str):
    """Delete a zone definition."""
    video_stream_manager.behavior_analyzer.remove_zone(camera_id, zone_id)
    return {"status": "deleted", "camera_id": camera_id, "zone_id": zone_id}


@router.get("/config", response_model=VideoEngineConfig)
def get_config():
    """Get current YOLO & temporal behavior analyzer configuration."""
    return video_stream_manager.config


@router.post("/config", response_model=VideoEngineConfig)
def update_config(config_in: VideoEngineConfig):
    """Update runtime video engine parameters (thresholds, stride, loiter seconds)."""
    # Update global config fields
    for k, v in config_in.model_dump().items():
        setattr(video_stream_manager.config, k, v)
    return video_stream_manager.config


@router.get("/benchmark")
def get_benchmark_telemetry():
    """Retrieve full hardware and real-time performance telemetry for all camera streams."""
    cams_telemetry = {}
    for cam_id, worker in video_stream_manager.workers.items():
        cams_telemetry[cam_id] = {
            "name": worker.camera_config.name,
            "source_fps": worker.source_fps,
            "inference_fps": worker.inference_fps,
            "latency_ms": worker.latency_ms,
            "status": worker.stream_status,
            "device": worker.detector.device.upper(),
            "model": worker.detector.config.model_name_or_path,
            "tracker": worker.detector.config.tracker_type,
            "is_nms_free": worker.detector.is_nms_free,
        }
    return {
        "device": video_stream_manager.detector.device.upper(),
        "model_status": video_stream_manager.detector.model_status,
        "cameras": cams_telemetry,
    }


@router.websocket("/ws/{camera_id}")
async def video_metadata_ws(websocket: WebSocket, camera_id: str):
    """WebSocket endpoint pushing real-time metadata synchronized with live video."""
    await websocket.accept()
    try:
        while True:
            meta = video_stream_manager.get_latest_metadata(camera_id)
            if meta:
                # Send JSON serialized metadata
                await websocket.send_text(meta.model_dump_json())
            await asyncio.sleep(0.04)  # ~25 Hz update rate
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from camera '{camera_id}'")
    except Exception as e:
        logger.error(f"WebSocket error on camera '{camera_id}': {e}")
