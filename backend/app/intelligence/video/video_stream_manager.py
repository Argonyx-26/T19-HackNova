"""Multi-Camera Stream Management, Real-Time Inference Dispatch, and Sentinel-X Event Integration."""

import asyncio
import logging
import threading
import time
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Generator, Any, Set
import numpy as np

from backend.app.intelligence.video.config import VideoEngineConfig, video_config
from backend.app.intelligence.video.models import (
    CameraSourceConfig,
    ObjectDetection,
    VideoAlertEvent,
    VideoFrameMetadata,
    VideoTelemetry,
    ZoneDefinition,
    ZoneType,
)
from backend.app.intelligence.video.detector import YOLOVideoDetector
from backend.app.intelligence.video.behavior_analyzer import TemporalBehaviorAnalyzer

logger = logging.getLogger("sentinel.video.stream_manager")


class CameraWorker:
    """Dedicated background worker thread for capturing, running YOLO inference, and tracking per camera."""

    def __init__(
        self,
        camera_config: CameraSourceConfig,
        detector: YOLOVideoDetector,
        behavior_analyzer: TemporalBehaviorAnalyzer,
    ):
        self.camera_config = camera_config
        self.detector = detector
        self.behavior_analyzer = behavior_analyzer
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        
        # Frame buffering & latest state
        self.latest_frame_bytes: Optional[bytes] = None
        self.latest_metadata: Optional[VideoFrameMetadata] = None
        self.frame_id = 0
        
        # Performance & Telemetry metrics
        self.source_fps = 0.0
        self.inference_fps = 0.0
        self.latency_ms = 0.0
        self._last_frame_time = time.time()
        self._frame_count = 0
        self._fps_timer = time.time()
        self.stream_status = "INITIALIZING"
        
        # Lock for thread-safe access
        self._lock = threading.Lock()

    def start(self):
        """Start camera ingestion thread."""
        if self.is_running:
            return
        self.is_running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        logger.info(f"Started camera worker for '{self.camera_config.camera_id}' ({self.camera_config.name})")

    def stop(self):
        """Stop camera ingestion thread."""
        self.is_running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        logger.info(f"Stopped camera worker for '{self.camera_config.camera_id}'")

    def _open_capture(self):
        """Initialize OpenCV VideoCapture or fallback synthetic stream."""
        try:
            import cv2
            src = self.camera_config.source_url_or_index
            if src.isdigit():
                cap = cv2.VideoCapture(int(src))
            else:
                cap = cv2.VideoCapture(src)
            
            if cap.isOpened():
                self.stream_status = "LIVE" if not self.camera_config.is_simulation else "SIMULATION"
                return cap
        except Exception as e:
            logger.warning(f"Failed to open hardware capture for {self.camera_config.camera_id}: {e}")
        
        # Fallback to simulation mode if hardware camera or RTSP is unavailable
        self.stream_status = "SIMULATION"
        return None

    def _generate_synthetic_frame(self, frame_idx: int) -> np.ndarray:
        """Create a structured test pattern frame when physical camera is offline for testing."""
        h, w = 720, 1280
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Dark obsidian canvas
        frame[:] = (12, 10, 8)
        
        try:
            import cv2
            # Draw grid lines
            for x in range(0, w, 80):
                cv2.line(frame, (x, 0), (x, h), (25, 20, 15), 1)
            for y in range(0, h, 80):
                cv2.line(frame, (0, y), (w, y), (25, 20, 15), 1)
                
            # Draw synthetic test target
            cx = int(w / 2 + 200 * np.sin(frame_idx * 0.05))
            cy = int(h / 2 + 100 * np.cos(frame_idx * 0.05))
            cv2.rectangle(frame, (cx - 40, cy - 80), (cx + 40, cy + 80), (80, 160, 80), 2)
            cv2.putText(
                frame,
                f"SENTINEL-X TEST FEED [{self.camera_config.camera_id}]",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (200, 160, 90),
                2,
            )
        except Exception:
            pass

        return frame

    def _run_loop(self):
        """Worker loop reading frames, running YOLO tracking, and evaluating behaviors."""
        import cv2

        cap = self._open_capture()
        reconnect_delay = 1.0

        while self.is_running:
            frame = None
            if cap is not None and cap.isOpened():
                ret, raw_frame = cap.read()
                if ret and raw_frame is not None:
                    frame = raw_frame
                    reconnect_delay = 1.0
                else:
                    logger.warning(f"Camera stream disconnected for {self.camera_config.camera_id}; retrying in {reconnect_delay}s")
                    self.stream_status = "OFFLINE"
                    cap.release()
                    time.sleep(reconnect_delay)
                    reconnect_delay = min(16.0, reconnect_delay * 2.0)
                    cap = self._open_capture()
                    continue
            else:
                # Generate synthetic demonstration frame for automated simulation
                frame = self._generate_synthetic_frame(self.frame_id)
                time.sleep(1.0 / max(1, self.camera_config.fps))

            if frame is None:
                continue

            self.frame_id += 1
            frame_h, frame_w = frame.shape[:2]

            # 1. Run YOLO Object Detection & Persistent Tracking
            detections, inf_latency = self.detector.process_frame(
                frame, self.camera_config.camera_id, self.frame_id
            )

            # 2. Run Temporal Behavior Classification & Polygonal ROI Zone Engine
            detections, active_alerts = self.behavior_analyzer.analyze_frame_tracks(
                detections, self.camera_config.camera_id, frame_w, frame_h
            )

            # 3. Calculate FPS and Telemetry
            self._frame_count += 1
            now = time.time()
            elapsed = now - self._fps_timer
            if elapsed >= 1.0:
                self.source_fps = round(self._frame_count / elapsed, 1)
                self.inference_fps = round(1000.0 / max(1.0, inf_latency), 1) if inf_latency > 0 else self.source_fps
                self.latency_ms = round(inf_latency, 1)
                self._frame_count = 0
                self._fps_timer = now

            telemetry = VideoTelemetry(
                source_fps=self.source_fps or float(self.camera_config.fps),
                inference_fps=self.inference_fps or 24.0,
                display_fps=self.source_fps or 24.0,
                latency_ms=self.latency_ms or 35.0,
                device=self.detector.device.upper(),
                model_name=self.detector.config.model_name_or_path,
                tracker_type=self.detector.config.tracker_type,
                stream_status=self.stream_status,
                active_tracks_count=len(detections),
                anomalies_count=len(active_alerts),
                model_status=self.detector.model_status,
            )

            # 4. Build Frame Metadata
            metadata = VideoFrameMetadata(
                frame_id=self.frame_id,
                timestamp=datetime.utcnow(),
                camera_id=self.camera_config.camera_id,
                detections=detections,
                active_alerts=active_alerts,
                telemetry=telemetry,
            )

            # 5. Encode MJPEG buffer
            ret, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                with self._lock:
                    self.latest_frame_bytes = jpeg_buf.tobytes()
                    self.latest_metadata = metadata

        if cap is not None and cap.isOpened():
            cap.release()


class VideoStreamManager:
    """Coordinates camera streams, handles video routing, and emits confirmed abnormal events to Sentinel-X."""

    def __init__(self, config: Optional[VideoEngineConfig] = None):
        self.config = config or video_config
        self.detector = YOLOVideoDetector(self.config)
        self.behavior_analyzer = TemporalBehaviorAnalyzer(
            self.config, on_alert_callback=self._handle_abnormal_alert
        )
        
        self.cameras: Dict[str, CameraSourceConfig] = {}
        self.workers: Dict[str, CameraWorker] = {}
        
        # Real-time WebSocket subscriber queues: {camera_id: set(asyncio.Queue)}
        self._subscribers: Dict[str, Set[asyncio.Queue]] = defaultdict(set)
        
        # Initialize default Sentinel-X camera fleet
        self._initialize_default_fleet()

    def _initialize_default_fleet(self):
        """Set up standard Sentinel-X camera sources and zones."""
        default_cams = [
            CameraSourceConfig(
                camera_id="CAM-01",
                name="Plaza Entrance & Cafe",
                location="Ground Floor Plaza",
                zone="Zone-A Public",
                source_type="WEBCAM",
                source_url_or_index="0",
                is_simulation=False,
            ),
            CameraSourceConfig(
                camera_id="CAM-02",
                name="Transit Concourse",
                location="Level 1 Concourse",
                zone="Zone-B Controlled",
                source_type="FILE",
                source_url_or_index="simulation",
                is_simulation=True,
            ),
            CameraSourceConfig(
                camera_id="CAM-03",
                name="Server Vault Corridor",
                location="Sub-level 2 Vault",
                zone="Zone-C Restricted",
                source_type="FILE",
                source_url_or_index="simulation",
                is_simulation=True,
            ),
            CameraSourceConfig(
                camera_id="CAM-04",
                name="Perimeter Gate East",
                location="Perimeter East",
                zone="Zone-D Perimeter",
                source_type="FILE",
                source_url_or_index="simulation",
                is_simulation=True,
            ),
            CameraSourceConfig(
                camera_id="CAM-05",
                name="Restricted Parking & Vault Entry",
                location="Sub-level 1 Parking",
                zone="Zone-E Controlled",
                source_type="FILE",
                source_url_or_index="simulation",
                is_simulation=True,
            ),
        ]

        for cam in default_cams:
            self.add_camera(cam)

        # Register default Restricted Zones
        self.behavior_analyzer.register_zone(
            ZoneDefinition(
                zone_id="Z-01",
                camera_id="CAM-03",
                name="SERVER VAULT RESTRICTED AREA",
                zone_type=ZoneType.RESTRICTED,
                polygon=[(0.20, 0.20), (0.80, 0.20), (0.80, 0.85), (0.20, 0.85)],
            )
        )
        self.behavior_analyzer.register_zone(
            ZoneDefinition(
                zone_id="Z-02",
                camera_id="CAM-04",
                name="RESTRICTED PERIMETER AIRLOCK",
                zone_type=ZoneType.RESTRICTED,
                polygon=[(0.35, 0.30), (0.75, 0.30), (0.75, 0.90), (0.35, 0.90)],
            )
        )

    def add_camera(self, camera_config: CameraSourceConfig):
        """Add or update a camera source and start its background worker."""
        cam_id = camera_config.camera_id
        if cam_id in self.workers:
            self.workers[cam_id].stop()

        self.cameras[cam_id] = camera_config
        worker = CameraWorker(camera_config, self.detector, self.behavior_analyzer)
        self.workers[cam_id] = worker
        worker.start()
        logger.info(f"Registered and started camera stream '{cam_id}'")

    def remove_camera(self, camera_id: str):
        """Stop and remove a camera stream."""
        if camera_id in self.workers:
            self.workers[camera_id].stop()
            del self.workers[camera_id]
        if camera_id in self.cameras:
            del self.cameras[camera_id]

    def get_latest_frame(self, camera_id: str) -> Optional[bytes]:
        """Get the latest MJPEG frame bytes for a camera."""
        worker = self.workers.get(camera_id)
        if worker and worker.latest_frame_bytes:
            with worker._lock:
                return worker.latest_frame_bytes
        return None

    def get_latest_metadata(self, camera_id: str) -> Optional[VideoFrameMetadata]:
        """Get the latest inference and behavior metadata for a camera."""
        worker = self.workers.get(camera_id)
        if worker and worker.latest_metadata:
            with worker._lock:
                return worker.latest_metadata
        return None

    def generate_mjpeg_stream(self, camera_id: str) -> Generator[bytes, None, None]:
        """Generator yielding MJPEG multipart stream chunks."""
        while True:
            frame_bytes = self.get_latest_frame(camera_id)
            if frame_bytes:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
            time.sleep(0.04)  # ~25 FPS stream transmission

    def _handle_abnormal_alert(self, alert: VideoAlertEvent):
        """Connect confirmed video alerts directly into the Sentinel-X Situation Engine."""
        logger.warning(
            f"Confirmed Video Alert: [{alert.severity.value}] {alert.behavior.value} "
            f"on Track #{alert.track_id} (Camera: {alert.camera_id})"
        )

        try:
            from backend.app.schemas.event import EventCreate
            from backend.app.models.event import SourceType
            from backend.app.services.event_service import event_service
            from backend.app.services.correlation_service import correlation_service

            # Map alert severity to 0.0 - 1.0 scale
            sev_map = {
                "NORMAL": 0.1,
                "SUSPICIOUS": 0.45,
                "ABNORMAL": 0.75,
                "CRITICAL": 0.95,
            }
            severity_num = sev_map.get(alert.severity.value, 0.75)

            # Ingest structured CCTV security event into Sentinel-X
            event_in = EventCreate(
                event_id=f"EVT-VID-{int(time.time()*1000)}",
                source_type=SourceType.CCTV,
                event_type=f"VIDEO_{alert.behavior.value}",
                timestamp=alert.timestamp,
                entity_id=f"PERSON_{alert.track_id}",
                location_id=alert.zone or alert.camera_id,
                severity=severity_num,
                confidence=alert.confidence,
                payload={
                    "camera_id": alert.camera_id,
                    "track_id": alert.track_id,
                    "behavior": alert.behavior.value,
                    "duration_seconds": alert.duration_seconds,
                    "zone": alert.zone,
                    "bbox": alert.bbox.model_dump(),
                    "explanation": alert.explanation,
                },
            )

            normalized = event_service.ingest_event(event_in)
            # Pass into situation correlation engine to escalate threat score and situation graph
            correlation_service.process_event(normalized)
            logger.info(f"Successfully integrated video alert '{event_in.event_id}' into Sentinel-X Situation Engine")
        except Exception as e:
            logger.error(f"Failed to integrate video alert into Sentinel-X situation engine: {e}")


# Global Singleton Stream Manager
video_stream_manager = VideoStreamManager()
