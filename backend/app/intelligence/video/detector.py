"""Ultralytics YOLO Real-Time Object Detection & Tracking Engine for Sentinel-X."""

import logging
import time
from typing import List, Optional, Dict, Any, Tuple
import numpy as np

from backend.app.intelligence.video.config import VideoEngineConfig, video_config
from backend.app.intelligence.video.models import (
    ObjectDetection,
    BBoxXYXY,
    SquareBBox,
    VideoTelemetry,
)

logger = logging.getLogger("sentinel.video.detector")


class YOLOVideoDetector:
    """Manages YOLO model inference, hardware acceleration, warming up, and tracking."""

    def __init__(self, config: Optional[VideoEngineConfig] = None):
        self.config = config or video_config
        self.model = None
        self.device = self._detect_device()
        self.model_status = "INITIALIZING MODEL..."
        self.is_nms_free = False
        self._camera_trackers: Dict[str, Any] = {}
        self._initialize_model()

    def _detect_device(self) -> str:
        """Detect available compute hardware: CUDA, MPS, or CPU."""
        if self.config.device != "auto":
            return self.config.device

        try:
            import torch
            if torch.cuda.is_available():
                device_name = torch.cuda.get_device_name(0)
                logger.info(f"CUDA GPU detected: {device_name}")
                return "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                logger.info("Apple Silicon MPS detected")
                return "mps"
        except Exception as e:
            logger.warning(f"Hardware detection warning: {e}")

        logger.info("Defaulting to CPU compute device")
        return "cpu"

    def _initialize_model(self) -> bool:
        """Load YOLO model and warm up with dummy inference."""
        self.model_status = "INITIALIZING MODEL..."
        try:
            from ultralytics import YOLO
            import torch

            logger.info(f"Loading YOLO model '{self.config.model_name_or_path}' on device '{self.device}'...")
            self.model = YOLO(self.config.model_name_or_path)
            
            # Check if model architecture is end-to-end NMS-free (e.g., YOLOv10 / YOLO26 architectures)
            model_name_lower = str(self.config.model_name_or_path).lower()
            if "yolov10" in model_name_lower or "yolo26" in model_name_lower:
                self.is_nms_free = True
                logger.info("Detected end-to-end NMS-free model architecture")
            else:
                self.is_nms_free = False

            # Model warm-up step to prevent initial latency spike
            logger.info("Warming up YOLO model with synthetic frame...")
            dummy_img = np.zeros((self.config.imgsz, self.config.imgsz, 3), dtype=np.uint8)
            _ = self.model.predict(
                source=dummy_img,
                conf=self.config.conf_threshold,
                device=self.device,
                imgsz=self.config.imgsz,
                verbose=False,
            )

            self.model_status = "MODEL READY"
            logger.info("YOLO Model successfully initialized and warmed up")
            return True
        except ImportError:
            logger.warning("Ultralytics package not yet available; operating in degraded fallback mode")
            self.model_status = "MODEL NOT CONFIGURED"
            return False
        except Exception as e:
            logger.error(f"Failed to initialize YOLO model: {e}")
            self.model_status = "DETECTION ENGINE OFFLINE"
            return False

    @staticmethod
    def calculate_square_bbox(
        x1: float, y1: float, x2: float, y2: float, frame_w: int, frame_h: int
    ) -> SquareBBox:
        """Derive a visually square bounding box centered on the detection without distorting geometry."""
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        w = max(1.0, x2 - x1)
        h = max(1.0, y2 - y1)
        size = max(w, h)

        sq_x1 = max(0.0, cx - size / 2.0)
        sq_y1 = max(0.0, cy - size / 2.0)
        sq_x2 = min(float(frame_w), cx + size / 2.0)
        sq_y2 = min(float(frame_h), cy + size / 2.0)

        return SquareBBox(
            cx=cx,
            cy=cy,
            size=size,
            x1=sq_x1,
            y1=sq_y1,
            x2=sq_x2,
            y2=sq_y2,
        )

    @staticmethod
    def normalize_class_name(raw_name: str) -> str:
        """Map standard COCO classes to Sentinel-X primary taxonomy."""
        name = raw_name.lower().strip()
        if name in ["person", "human", "pedestrian"]:
            return "PERSON"
        elif name in ["car", "truck", "bus", "motorcycle", "bicycle", "vehicle"]:
            return "VEHICLE"
        elif name in ["backpack", "handbag", "suitcase", "bag"]:
            return "BAG"
        elif name in ["package", "box", "parcel"]:
            return "PACKAGE"
        elif name in ["knife", "gun", "firearm", "weapon"]:
            return "WEAPON"
        elif name in ["laptop", "cell phone", "bottle", "umbrella"]:
            return "OBJECT"
        return raw_name.upper()

    def process_frame(
        self,
        frame: np.ndarray,
        camera_id: str,
        frame_id: int,
    ) -> Tuple[List[ObjectDetection], float]:
        """Run YOLO track inference on a single frame with persistent tracking per camera."""
        if self.model is None:
            # Try lazy re-init if package finished installing
            if not self._initialize_model():
                return [], 0.0

        t0 = time.perf_counter()
        frame_h, frame_w = frame.shape[:2]
        detections: List[ObjectDetection] = []

        try:
            # Build tracker kwargs - persist=True maintains isolated tracks across frames for this camera
            track_kwargs: Dict[str, Any] = {
                "source": frame,
                "conf": self.config.conf_threshold,
                "imgsz": self.config.imgsz,
                "device": self.device,
                "persist": True,
                "tracker": self.config.tracker_type,
                "verbose": False,
                "max_det": self.config.max_detections,
            }

            if not self.is_nms_free:
                track_kwargs["iou"] = self.config.iou_threshold

            results = self.model.track(**track_kwargs)

            if results and len(results) > 0:
                res = results[0]
                boxes = res.boxes
                if boxes is not None and len(boxes) > 0:
                    xyxy_tensor = boxes.xyxy.cpu().numpy()
                    conf_tensor = boxes.conf.cpu().numpy() if boxes.conf is not None else np.ones(len(boxes))
                    cls_tensor = boxes.cls.cpu().numpy() if boxes.cls is not None else np.zeros(len(boxes))
                    
                    # Track IDs (may be None if tracker is warming up on frame 1)
                    if boxes.id is not None:
                        id_tensor = boxes.id.cpu().numpy().astype(int)
                    else:
                        id_tensor = np.arange(len(boxes), dtype=int) + 1

                    names = self.model.names if hasattr(self.model, "names") else {}

                    for i in range(len(boxes)):
                        raw_x1, raw_y1, raw_x2, raw_y2 = xyxy_tensor[i]
                        conf = float(conf_tensor[i])
                        cls_id = int(cls_tensor[i])
                        track_id = int(id_tensor[i])
                        raw_class_name = names.get(cls_id, f"class_{cls_id}")
                        class_name = self.normalize_class_name(raw_class_name)

                        # Native xyxy
                        native_bbox = BBoxXYXY(x1=raw_x1, y1=raw_y1, x2=raw_x2, y2=raw_y2)
                        
                        # Derived square bounding box
                        square_bbox = self.calculate_square_bbox(
                            raw_x1, raw_y1, raw_x2, raw_y2, frame_w, frame_h
                        )

                        detection = ObjectDetection(
                            track_id=track_id,
                            class_id=cls_id,
                            class_name=class_name,
                            confidence=round(conf, 3),
                            bbox=native_bbox,
                            square_bbox=square_bbox,
                            camera_id=camera_id,
                        )
                        detections.append(detection)

            self.model_status = "LIVE DETECTION ACTIVE"
        except Exception as e:
            logger.error(f"Inference error on camera {camera_id} frame {frame_id}: {e}")
            self.model_status = "TRACKING DEGRADED"

        latency_ms = (time.perf_counter() - t0) * 1000.0
        return detections, latency_ms
