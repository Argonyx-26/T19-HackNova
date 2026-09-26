"""Temporal Behavior Analysis, Polygonal ROI Zone Engine, and Alert State Machine for Sentinel-X."""

import logging
import math
import time
from collections import defaultdict, deque
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any, Callable

from backend.app.intelligence.video.config import VideoEngineConfig, video_config
from backend.app.intelligence.video.models import (
    ObjectDetection,
    BehaviorType,
    AlertState,
    AlertSeverity,
    ZoneType,
    ZoneState,
    ZoneDefinition,
    VideoAlertEvent,
    TrackHistoryPoint,
    BBoxXYXY,
)

logger = logging.getLogger("sentinel.video.behavior")


class TemporalTrackRecord:
    """Encapsulates history and temporal states for a single persistent track."""

    def __init__(self, track_id: int, class_name: str, camera_id: str):
        self.track_id = track_id
        self.class_name = class_name
        self.camera_id = camera_id
        self.first_seen = time.time()
        self.last_seen = time.time()
        
        # Bounded sliding history buffer (timestamp, cx, cy, x1, y1, x2, y2, w, h, aspect_ratio)
        self.history: deque[TrackHistoryPoint] = deque(maxlen=300)
        
        # Behavior states
        self.current_behavior: BehaviorType = BehaviorType.NORMAL_WALKING
        self.behavior_confidence: float = 0.90
        self.recent_behaviors: deque[BehaviorType] = deque(maxlen=15)
        
        # Alert state machine
        self.alert_state: AlertState = AlertState.NORMAL
        self.alert_severity: AlertSeverity = AlertSeverity.NORMAL
        self.active_alert_type: Optional[BehaviorType] = None
        self.alert_start_time: Optional[float] = None
        self.last_alert_emitted_time: Optional[float] = None
        
        # Dwell & loiter timers
        self.stationary_start_time: Optional[float] = None
        self.initial_stationary_pos: Optional[Tuple[float, float]] = None
        
        # Zone tracking state: {zone_id: ZoneState}
        self.zone_states: Dict[str, ZoneState] = {}
        self.zone_entry_times: Dict[str, float] = {}
        self.current_primary_zone: Optional[str] = None
        
        # Fall detection tracking
        self.potential_fall_start_time: Optional[float] = None
        
        # Metrics
        self.current_velocity: float = 0.0
        self.direction_angle_rad: float = 0.0


class TemporalBehaviorAnalyzer:
    """Analyzes multi-frame trajectory features to classify behavior and manage temporal alerts."""

    def __init__(
        self,
        config: Optional[VideoEngineConfig] = None,
        on_alert_callback: Optional[Callable[[VideoAlertEvent], None]] = None,
    ):
        self.config = config or video_config
        self.on_alert_callback = on_alert_callback
        
        # Isolated track records per camera: {camera_id: {track_id: TemporalTrackRecord}}
        self._camera_tracks: Dict[str, Dict[int, TemporalTrackRecord]] = defaultdict(dict)
        
        # Configured Polygonal Zones per camera: {camera_id: {zone_id: ZoneDefinition}}
        self._camera_zones: Dict[str, Dict[str, ZoneDefinition]] = defaultdict(dict)
        
        # Active incident alerts
        self._active_alerts: Dict[str, VideoAlertEvent] = {}

    def register_zone(self, zone: ZoneDefinition):
        """Register or update a polygonal ROI zone."""
        self._camera_zones[zone.camera_id][zone.zone_id] = zone
        logger.info(f"Registered zone '{zone.name}' ({zone.zone_type}) on camera {zone.camera_id}")

    def remove_zone(self, camera_id: str, zone_id: str):
        """Remove a zone definition."""
        if camera_id in self._camera_zones and zone_id in self._camera_zones[camera_id]:
            del self._camera_zones[camera_id][zone_id]

    def get_zones(self, camera_id: str) -> List[ZoneDefinition]:
        """Get all active zones for a specific camera."""
        return list(self._camera_zones.get(camera_id, {}).values())

    @staticmethod
    def point_in_polygon(x: float, y: float, polygon: List[Tuple[float, float]]) -> bool:
        """Ray-casting algorithm for point-in-polygon query in 2D space."""
        if len(polygon) < 3:
            return False
        inside = False
        n = len(polygon)
        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside

    def analyze_frame_tracks(
        self,
        detections: List[ObjectDetection],
        camera_id: str,
        frame_w: int,
        frame_h: int,
    ) -> Tuple[List[ObjectDetection], List[VideoAlertEvent]]:
        """Perform temporal behavior classification across all detections for this frame."""
        now = time.time()
        tracks_map = self._camera_tracks[camera_id]
        zones = self._camera_zones.get(camera_id, {})
        new_alerts: List[VideoAlertEvent] = []

        # 1. Update active tracks with new observations
        seen_track_ids = set()
        for det in detections:
            seen_track_ids.add(det.track_id)
            if det.track_id not in tracks_map:
                tracks_map[det.track_id] = TemporalTrackRecord(
                    det.track_id, det.class_name, camera_id
                )
            
            track = tracks_map[det.track_id]
            track.last_seen = now
            
            # Normalized center and dimensions (0.0 to 1.0)
            norm_cx = det.square_bbox.cx / max(1, frame_w)
            norm_cy = det.square_bbox.cy / max(1, frame_h)
            norm_x1 = det.bbox.x1 / max(1, frame_w)
            norm_y1 = det.bbox.y1 / max(1, frame_h)
            norm_x2 = det.bbox.x2 / max(1, frame_w)
            norm_y2 = det.bbox.y2 / max(1, frame_h)
            w = max(0.001, norm_x2 - norm_x1)
            h = max(0.001, norm_y2 - norm_y1)
            aspect_ratio = w / h

            history_pt = TrackHistoryPoint(
                timestamp=now,
                cx=norm_cx,
                cy=norm_cy,
                x1=norm_x1,
                y1=norm_y1,
                x2=norm_x2,
                y2=norm_y2,
                w=w,
                h=h,
                aspect_ratio=aspect_ratio,
            )
            track.history.append(history_pt)

            # 2. Extract temporal kinematic features
            self._compute_kinematics(track, now)

            # 3. Evaluate Zone Containment & State Transitions
            self._evaluate_zones(track, norm_cx, norm_cy, zones, now)

            # 4. Classify Behavior & Update Temporal Alert State Machine
            raw_behavior, conf, severity = self._classify_behavior(track, tracks_map, now)
            
            # Apply rolling temporal smoothing for normal behaviors to prevent single-frame flickering,
            # but preserve confirmed security anomalies immediately.
            track.recent_behaviors.append(raw_behavior)
            if severity in [AlertSeverity.SUSPICIOUS, AlertSeverity.ABNORMAL, AlertSeverity.CRITICAL]:
                smoothed_behavior = raw_behavior
            else:
                smoothed_behavior = self._get_majority_behavior(track.recent_behaviors)

            track.current_behavior = smoothed_behavior
            track.behavior_confidence = conf
            track.alert_severity = severity

            # 5. Process Temporal Alert Transitions
            alert_event = self._update_alert_state_machine(track, det, now)
            if alert_event:
                new_alerts.append(alert_event)
                self._active_alerts[alert_event.alert_id] = alert_event
                if self.on_alert_callback:
                    try:
                        self.on_alert_callback(alert_event)
                    except Exception as cb_err:
                        logger.error(f"Alert callback error: {cb_err}")

            # 6. Annotate ObjectDetection instance
            det.behavior = track.current_behavior
            det.behavior_confidence = round(track.behavior_confidence, 2)
            det.alert_severity = track.alert_severity
            det.alert_state = track.alert_state
            det.current_zone = track.current_primary_zone
            det.velocity = round(track.current_velocity, 3)
            det.dwell_time_seconds = round(now - track.first_seen, 1)

        # 7. Cleanup stale tracks (not seen in last 10 seconds)
        stale_threshold = self.config.temporal_history_seconds
        stale_ids = [
            tid for tid, rec in tracks_map.items() if (now - rec.last_seen) > stale_threshold
        ]
        for tid in stale_ids:
            # Check if an active alert needs resolving
            rec = tracks_map[tid]
            if rec.alert_state in [AlertState.CONFIRMED, AlertState.ALERT]:
                rec.alert_state = AlertState.RESOLVED
            del tracks_map[tid]

        # Return updated detections and any active alerts
        current_active = [
            alt for alt in self._active_alerts.values() if alt.camera_id == camera_id
        ]
        return detections, current_active

    def _compute_kinematics(self, track: TemporalTrackRecord, now: float):
        """Compute speed, direction vector, and acceleration over the sliding window."""
        if len(track.history) < 2:
            track.current_velocity = 0.0
            return

        # Look back 0.5 to 1.0 seconds for robust velocity estimation
        recent_pts = [pt for pt in track.history if (now - pt.timestamp) <= 1.0]
        if len(recent_pts) < 2:
            recent_pts = list(track.history)[-2:]

        p_old = recent_pts[0]
        p_new = recent_pts[-1]
        dt = max(0.05, p_new.timestamp - p_old.timestamp)

        dx = p_new.cx - p_old.cx
        dy = p_new.cy - p_old.cy
        distance = math.sqrt(dx * dx + dy * dy)
        track.current_velocity = distance / dt
        track.direction_angle_rad = math.atan2(dy, dx)

    def _evaluate_zones(
        self,
        track: TemporalTrackRecord,
        cx: float,
        cy: float,
        zones: Dict[str, ZoneDefinition],
        now: float,
    ):
        """Evaluate zone boundary entry/exit state transitions."""
        track.current_primary_zone = None

        for zone_id, zone_def in zones.items():
            if not zone_def.is_active:
                continue

            is_inside = self.point_in_polygon(cx, cy, zone_def.polygon)
            prev_state = track.zone_states.get(zone_id, ZoneState.OUTSIDE)

            if is_inside:
                track.current_primary_zone = zone_def.name
                if prev_state in [ZoneState.OUTSIDE, ZoneState.EXITING]:
                    # Transition: OUTSIDE -> ENTERING -> INSIDE
                    track.zone_states[zone_id] = ZoneState.ENTERING
                    track.zone_entry_times[zone_id] = now
                elif prev_state == ZoneState.ENTERING:
                    if (now - track.zone_entry_times.get(zone_id, now)) >= self.config.restricted_zone_confirmation_seconds:
                        track.zone_states[zone_id] = ZoneState.INSIDE
            else:
                if prev_state in [ZoneState.INSIDE, ZoneState.ENTERING]:
                    track.zone_states[zone_id] = ZoneState.EXITING
                else:
                    track.zone_states[zone_id] = ZoneState.OUTSIDE

    def _classify_behavior(
        self,
        track: TemporalTrackRecord,
        all_tracks: Dict[int, TemporalTrackRecord],
        now: float,
    ) -> Tuple[BehaviorType, float, AlertSeverity]:
        """Classify behavior based on multi-frame kinematic history and contextual zones."""
        # 1. Check Restricted Zone Breach
        for zone_id, state in track.zone_states.items():
            if state in [ZoneState.ENTERING, ZoneState.INSIDE]:
                zone_def = self._camera_zones.get(track.camera_id, {}).get(zone_id)
                if zone_def and zone_def.zone_type == ZoneType.RESTRICTED:
                    return BehaviorType.RESTRICTED_ZONE_ACCESS, 0.94, AlertSeverity.CRITICAL

        # 2. Check Sudden Fall Detection
        if track.class_name == "PERSON" and len(track.history) >= 3:
            pts = list(track.history)
            recent_aspect = pts[-1].aspect_ratio
            prev_aspects = [p.aspect_ratio for p in pts[:-1]]
            avg_prev_aspect = sum(prev_aspects) / max(1, len(prev_aspects))
            
            # Person collapsed horizontally: current aspect ratio width > height (> 1.15) while previously standing (< 0.8)
            if recent_aspect > 1.15 and (avg_prev_aspect < 0.9 or track.current_velocity < 0.15):
                if track.potential_fall_start_time is None:
                    track.potential_fall_start_time = now
                    return BehaviorType.SUDDEN_FALL, 0.85, AlertSeverity.SUSPICIOUS
                elif (now - track.potential_fall_start_time) >= self.config.fall_confirmation_seconds:
                    return BehaviorType.SUDDEN_FALL, 0.94, AlertSeverity.CRITICAL
                else:
                    return BehaviorType.SUDDEN_FALL, 0.88, AlertSeverity.SUSPICIOUS
            else:
                track.potential_fall_start_time = None

        # 3. Check Abandoned Object (Bag / Backpack / Package)
        if track.class_name in ["BAG", "BACKPACK", "PACKAGE"]:
            if track.current_velocity < 0.03:
                # Check distance to closest person track
                min_dist_to_person = float("inf")
                latest_pt = track.history[-1]
                for other_tid, other_track in all_tracks.items():
                    if other_track.class_name == "PERSON" and len(other_track.history) > 0:
                        opt = other_track.history[-1]
                        dist = math.sqrt((latest_pt.cx - opt.cx) ** 2 + (latest_pt.cy - opt.cy) ** 2)
                        if dist < min_dist_to_person:
                            min_dist_to_person = dist

                if min_dist_to_person > self.config.abandoned_distance_threshold:
                    stationary_duration = now - track.first_seen
                    if stationary_duration >= self.config.abandoned_object_seconds:
                        return BehaviorType.ABANDONED_OBJECT, 0.92, AlertSeverity.ABNORMAL

        # 4. Check Loitering (Person staying within small radius > loitering_seconds)
        if track.class_name == "PERSON":
            if len(track.history) >= 2:
                # Check displacement from earliest position in current stationary window
                pts_window = [
                    pt for pt in track.history if (now - pt.timestamp) <= self.config.loitering_seconds
                ]
                if len(pts_window) >= 2:
                    p_start = pts_window[0]
                    p_curr = pts_window[-1]
                    disp = math.sqrt((p_curr.cx - p_start.cx) ** 2 + (p_curr.cy - p_start.cy) ** 2)
                    dwell = now - p_start.timestamp

                    if disp < self.config.loitering_displacement_threshold and dwell >= 10.0:
                        if dwell >= self.config.loitering_seconds:
                            return BehaviorType.LOITERING, 0.89, AlertSeverity.ABNORMAL
                        else:
                            # Suspected loiter / lingering warning
                            return BehaviorType.STANDING, 0.85, AlertSeverity.SUSPICIOUS

        # 5. Check Erratic Movement / Rapid Direction Changes
        if track.class_name == "PERSON" and len(track.history) >= 6:
            recent_pts = [
                pt for pt in track.history if (now - pt.timestamp) <= self.config.direction_change_window_seconds
            ]
            if len(recent_pts) >= 4:
                angles = []
                for i in range(1, len(recent_pts)):
                    dx = recent_pts[i].cx - recent_pts[i - 1].cx
                    dy = recent_pts[i].cy - recent_pts[i - 1].cy
                    if math.sqrt(dx * dx + dy * dy) > 0.01:
                        angles.append(math.atan2(dy, dx))
                
                if len(angles) >= 3:
                    angle_diffs = []
                    for i in range(1, len(angles)):
                        diff = abs(angles[i] - angles[i - 1])
                        # Normalize angle diff to [0, pi]
                        diff = min(diff, 2 * math.pi - diff)
                        angle_diffs.append(math.degrees(diff))
                    
                    max_turn = max(angle_diffs) if angle_diffs else 0
                    if max_turn >= self.config.direction_change_threshold_deg:
                        return BehaviorType.RAPID_DIRECTION_CHANGE, 0.84, AlertSeverity.SUSPICIOUS

        # 6. Check Running vs Normal Walking vs Standing
        if track.current_velocity > self.config.running_velocity_threshold:
            return BehaviorType.RUNNING, 0.93, AlertSeverity.SUSPICIOUS
        elif track.current_velocity > 0.03:
            return BehaviorType.NORMAL_WALKING, 0.95, AlertSeverity.NORMAL
        else:
            return BehaviorType.STANDING, 0.92, AlertSeverity.NORMAL

    def _update_alert_state_machine(
        self,
        track: TemporalTrackRecord,
        det: ObjectDetection,
        now: float,
    ) -> Optional[VideoAlertEvent]:
        """Manage temporal state progression: NORMAL -> OBSERVED -> SUSPECTED -> CONFIRMED -> ALERT."""
        is_anomalous = track.alert_severity in [AlertSeverity.ABNORMAL, AlertSeverity.CRITICAL]

        if is_anomalous:
            if track.alert_state == AlertState.NORMAL:
                track.alert_state = AlertState.OBSERVED
                track.alert_start_time = now
                track.active_alert_type = track.current_behavior
            elif track.alert_state == AlertState.OBSERVED:
                if (now - (track.alert_start_time or now)) >= 1.0:
                    track.alert_state = AlertState.SUSPECTED
            elif track.alert_state == AlertState.SUSPECTED:
                # Required confirmation duration depends on behavior type
                req_sec = 2.0
                if track.active_alert_type == BehaviorType.RESTRICTED_ZONE_ACCESS:
                    req_sec = self.config.restricted_zone_confirmation_seconds
                elif track.active_alert_type == BehaviorType.LOITERING:
                    req_sec = self.config.loitering_seconds
                elif track.active_alert_type == BehaviorType.ABANDONED_OBJECT:
                    req_sec = self.config.abandoned_object_seconds
                elif track.active_alert_type == BehaviorType.SUDDEN_FALL:
                    req_sec = self.config.fall_confirmation_seconds

                if (now - (track.alert_start_time or now)) >= req_sec:
                    track.alert_state = AlertState.CONFIRMED
            elif track.alert_state == AlertState.CONFIRMED:
                # Transition to ALERT - emit exactly once until resolved or re-triggered
                track.alert_state = AlertState.ALERT
                track.last_alert_emitted_time = now
                
                alert_id = f"ALT-{det.camera_id}-{det.track_id}-{track.current_behavior.value}"
                explanation = (
                    f"Temporal confirmation exceeded for {track.current_behavior.value} "
                    f"on {det.class_name} #{det.track_id} (Duration: {round(now - (track.alert_start_time or now), 1)}s)"
                )

                return VideoAlertEvent(
                    alert_id=alert_id,
                    camera_id=det.camera_id,
                    track_id=det.track_id,
                    behavior=track.current_behavior,
                    severity=track.alert_severity,
                    state=AlertState.ALERT,
                    zone=track.current_primary_zone,
                    confidence=track.behavior_confidence,
                    duration_seconds=round(now - (track.alert_start_time or now), 1),
                    timestamp=datetime.utcnow(),
                    bbox=det.bbox,
                    explanation=explanation,
                )
        else:
            if track.alert_state in [AlertState.ALERT, AlertState.CONFIRMED, AlertState.SUSPECTED]:
                track.alert_state = AlertState.RESOLVED
                # Clear active alert
                alert_id = f"ALT-{det.camera_id}-{det.track_id}-{track.active_alert_type.value if track.active_alert_type else ''}"
                self._active_alerts.pop(alert_id, None)
            else:
                track.alert_state = AlertState.NORMAL
            track.alert_start_time = None
            track.active_alert_type = None

        return None

    @staticmethod
    def _get_majority_behavior(window: deque[BehaviorType]) -> BehaviorType:
        """Rolling window majority vote to prevent frame-by-frame flicker."""
        if not window:
            return BehaviorType.NORMAL_WALKING
        counts: Dict[BehaviorType, int] = defaultdict(int)
        for b in window:
            counts[b] += 1
        return max(counts.items(), key=lambda x: x[1])[0]
