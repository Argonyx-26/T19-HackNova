# SENTINEL-X — Production Live Video Intelligence Engine

## 1. Executive Overview & Purpose

The **Live Video Intelligence Engine** within **SENTINEL-X** provides real-time computer vision, persistent multi-object tracking, temporal behavior classification, and polygonal ROI zone analysis. It seamlessly correlates physical CCTV video observations into the Sentinel-X Situation & Reasoning Engine alongside cyber, network, and access control telemetry.

---

## 2. Core Architectural Principles: Detection vs. Tracking vs. Behavior vs. Situation

A critical tenet of the SENTINEL-X video architecture is the clear division of responsibility across the intelligence pipeline:

```
┌──────────────────────────────────────────────────────────┐
│ 1. OBJECT DETECTION (Spatial Localization)               │
│    • Ultralytics YOLO identifies and bounds objects      │
│    • Output: Class (PERSON, BAG), Native xyxy coords     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ 2. PERSISTENT TRACKING (Identity Association)            │
│    • ByteTrack / BoT-SORT maintains stable identity      │
│    • Output: track_id = 42                               │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ 3. TEMPORAL BEHAVIOR CLASSIFICATION (Kinematics & State) │
│    • Multi-frame sliding buffer (velocity, dwell time,   │
│      direction change angle, aspect ratio, zones)        │
│    • Output: LOITERING, RUNNING, RESTRICTED_ZONE_ACCESS  │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ 4. SENTINEL-X SITUATION ENGINE (Multi-Domain Fusion)     │
│    • Correlates video evidence with badge access logs,   │
│      network connections, topology, and attack graphs    │
│    • Output: Situation Escalation, Blast Radius, Actions │
└──────────────────────────────────────────────────────────┘
```

> **Mandatory Rule:** YOLO object detection identifies and localizes objects; persistent tracking maintains cross-frame identities; temporal behavior algorithms classify activity patterns; and the Sentinel-X situation engine performs cross-domain security reasoning.

---

## 3. Model Architecture & Ultralytics Integration

The engine leverages the official `ultralytics` package with configurable parameters:

- **Model Weight Path:** `yolov8n.pt` / `yolo11n.pt` (or custom weights path)
- **Inference Mode:** Streaming inference with `stream=True` and `persist=True`
- **Device Detection:** Automatic detection of `CUDA` (NVIDIA GPUs), `MPS` (Apple Silicon), or `CPU` fallback
- **NMS Handling:** Detects end-to-end NMS-free models (e.g., YOLOv10/YOLO26) to prevent redundant post-processing stages, while using configurable `iou_threshold=0.70` for standard architectures.
- **Model Warm-up:** Synthetically warms up the model upon service start, progressing through `INITIALIZING MODEL...` $\rightarrow$ `MODEL READY` $\rightarrow$ `LIVE DETECTION ACTIVE` to eliminate first-frame latency spikes.

---

## 4. Square Bounding Box Visualization Mathematics

SENTINEL-X visual guidelines utilize square reticle bounding boxes without distorting or losing native detection geometry:

$$\text{center}_x = \frac{x_1 + x_2}{2}, \quad \text{center}_y = \frac{y_1 + y_2}{2}$$

$$\text{size} = \max(x_2 - x_1, \, y_2 - y_1)$$

$$\text{sq}_{x1} = \max\left(0, \, \text{center}_x - \frac{\text{size}}{2}\right), \quad \text{sq}_{y1} = \max\left(0, \, \text{center}_y - \frac{\text{size}}{2}\right)$$

$$\text{sq}_{x2} = \min\left(W_{\text{frame}}, \, \text{center}_x + \frac{\text{size}}{2}\right), \quad \text{sq}_{y2} = \min\left(H_{\text{frame}}, \, \text{center}_y + \frac{\text{size}}{2}\right)$$

The native coordinates $(x_1, y_1, x_2, y_2)$ are preserved in evidence metadata, while the derived square is rendered in the HUD overlay.

---

## 5. Behavior Taxonomy & Temporal Algorithms

| Behavior Class | Classification Criteria & Temporal Formula | Default Threshold |
| :--- | :--- | :--- |
| `NORMAL_WALKING` | Continuous trajectory movement, standard speed ($0.03 \le v < 0.25$) | Smooth trajectory |
| `STANDING` | Stationary position without exceeding loitering time limit | Dwell $< 30$s |
| `RUNNING` | High velocity sustained over window ($v > 0.25 \text{ norm/s}$) | Sustained $> 1.0$s |
| `LOITERING` | Displacement $< \delta_{\text{disp}}$ ($0.08$) persisting past temporal window | Duration $\ge 30$s |
| `RESTRICTED_ZONE_ACCESS` | Point-in-polygon containment inside a `RESTRICTED` zone polygon | Window $\ge 1.0$s |
| `SUDDEN_FALL` | Downward displacement followed by aspect ratio inversion ($w/h > 1.25$) and stationary lying | Window $\ge 2.0$s |
| `RAPID_DIRECTION_CHANGE` | Angle delta $|\Delta \theta| \ge 75^\circ$ repeatedly within short time window | Window $2.0$s |
| `ABANDONED_OBJECT` | Object (`BAG`, `PACKAGE`) stationary with distance to nearest person $> 0.20$ | Duration $\ge 30$s |

---

## 6. Polygonal ROI Zone Engine

The engine supports arbitrary $N$-point polygonal zones using 2D Ray-Casting:
- Maintains zone entry/exit states: $\text{OUTSIDE} \rightarrow \text{ENTERING} \rightarrow \text{INSIDE} \rightarrow \text{EXITING}$.
- Prevents alert flooding by triggering alerts on state transitions rather than every frame.

---

## 7. Temporal Alert State Machine

To prevent false alarms and flickering, alerts transition through a multi-stage state machine:

```
NORMAL ──> OBSERVED ──> SUSPECTED ──> CONFIRMED ──> ALERT ──> RESOLVED
```

- **De-duplication:** Emits one structured incident per confirmed anomaly episode with start time, peak confidence, track ID, camera ID, and duration.

---

## 8. REST API & WebSocket Real-time Endpoints

- `GET /api/video/cameras`: List all registered cameras
- `GET /api/video/stream/{camera_id}`: High-performance MJPEG live stream
- `GET /api/video/metadata/{camera_id}`: Latest detections, square boxes, behavior, telemetry
- `GET /api/video/zones/{camera_id}`: Configured polygonal zones
- `POST /api/video/zones`: Create or update a polygonal zone definition
- `GET /api/video/config` & `POST /api/video/config`: Configure thresholds
- `GET /api/video/benchmark`: Real-time FPS, latency, and hardware telemetry
- `WebSocket /ws/video/{camera_id}`: Real-time metadata push stream

---

## 9. Ultralytics Licensing Considerations

Before deploying Ultralytics YOLO models in a commercial or proprietary production environment, note:
- Ultralytics YOLO (YOLOv8, YOLO11) is distributed under the **AGPL-3.0 License** for open-source use, and under an **Enterprise License** for proprietary commercial products.
- Sentinel-X modularizes YOLO behind an abstract detector interface (`YOLOVideoDetector`), enabling drop-in enterprise custom-trained models or ONNX/TensorRT runtimes compliant with commercial licensing requirements.
