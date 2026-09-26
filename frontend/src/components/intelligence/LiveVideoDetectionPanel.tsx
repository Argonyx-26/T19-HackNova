import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  ShieldAlert,
  Sliders,
  Crosshair,
  Radio,
  ChevronRight,
} from 'lucide-react';

export interface BBoxXYXY {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SquareBBox {
  cx: number;
  cy: number;
  size: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ObjectDetection {
  track_id: number;
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BBoxXYXY;
  square_bbox: SquareBBox;
  timestamp: string;
  camera_id: string;
  behavior: string;
  behavior_confidence: number;
  alert_severity: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL' | 'CRITICAL';
  alert_state: 'NORMAL' | 'OBSERVED' | 'SUSPECTED' | 'CONFIRMED' | 'ALERT' | 'RESOLVED';
  current_zone?: string;
  velocity: number;
  dwell_time_seconds: number;
}

export interface VideoAlertEvent {
  alert_id: string;
  camera_id: string;
  track_id: number;
  behavior: string;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'ABNORMAL' | 'CRITICAL';
  state: string;
  zone?: string;
  confidence: number;
  duration_seconds: number;
  timestamp: string;
  bbox: BBoxXYXY;
  explanation: string;
}

export interface VideoTelemetry {
  source_fps: number;
  inference_fps: number;
  display_fps: number;
  latency_ms: number;
  device: string;
  model_name: string;
  tracker_type: string;
  stream_status: 'LIVE' | 'SIMULATION' | 'OFFLINE' | 'INITIALIZING';
  active_tracks_count: number;
  anomalies_count: number;
  model_status: string;
}

export interface CameraSourceConfig {
  camera_id: string;
  name: string;
  location: string;
  zone: string;
  source_type: string;
  is_simulation: boolean;
}

export interface ZoneDefinition {
  zone_id: string;
  camera_id: string;
  name: string;
  zone_type: 'RESTRICTED' | 'CONTROLLED' | 'MONITORED' | 'SAFE';
  polygon: [number, number][];
}

interface LiveVideoDetectionPanelProps {
  onInspectEvidence?: (alert: VideoAlertEvent) => void;
  className?: string;
}

export const LiveVideoDetectionPanel: React.FC<LiveVideoDetectionPanelProps> = ({
  onInspectEvidence,
  className = '',
}) => {
  const [cameras, setCameras] = useState<CameraSourceConfig[]>([
    {
      camera_id: 'CAM-01',
      name: 'Plaza Entrance & Cafe',
      location: 'Ground Floor Plaza',
      zone: 'Zone-A Public',
      source_type: 'WEBCAM',
      is_simulation: false,
    },
    {
      camera_id: 'CAM-02',
      name: 'Transit Concourse',
      location: 'Level 1 Concourse',
      zone: 'Zone-B Controlled',
      source_type: 'FILE',
      is_simulation: true,
    },
    {
      camera_id: 'CAM-03',
      name: 'Server Vault Corridor',
      location: 'Sub-level 2 Vault',
      zone: 'Zone-C Restricted',
      source_type: 'FILE',
      is_simulation: true,
    },
    {
      camera_id: 'CAM-04',
      name: 'Perimeter Gate East',
      location: 'Perimeter East',
      zone: 'Zone-D Perimeter',
      source_type: 'FILE',
      is_simulation: true,
    },
  ]);

  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-01');
  const [detections, setDetections] = useState<ObjectDetection[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<VideoAlertEvent[]>([]);
  const [telemetry, setTelemetry] = useState<VideoTelemetry>({
    source_fps: 30,
    inference_fps: 24,
    display_fps: 24,
    latency_ms: 38,
    device: 'CPU',
    model_name: 'YOLOv8n',
    tracker_type: 'ByteTrack',
    stream_status: 'LIVE',
    active_tracks_count: 0,
    anomalies_count: 0,
    model_status: 'LIVE DETECTION ACTIVE',
  });

  const [zones, setZones] = useState<ZoneDefinition[]>([
    {
      zone_id: 'Z-01',
      camera_id: 'CAM-03',
      name: 'SERVER VAULT RESTRICTED AREA',
      zone_type: 'RESTRICTED',
      polygon: [
        [0.2, 0.2],
        [0.8, 0.2],
        [0.8, 0.85],
        [0.2, 0.85],
      ],
    },
    {
      zone_id: 'Z-02',
      camera_id: 'CAM-04',
      name: 'RESTRICTED PERIMETER AIRLOCK',
      zone_type: 'RESTRICTED',
      polygon: [
        [0.35, 0.3],
        [0.75, 0.3],
        [0.75, 0.9],
        [0.35, 0.9],
      ],
    },
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showSquareBoxes, setShowSquareBoxes] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [confThreshold, setConfThreshold] = useState<number>(0.6);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const activeCamera = useMemo(
    () => cameras.find((c) => c.camera_id === selectedCamId) || cameras[0],
    [cameras, selectedCamId]
  );

  // Fetch cameras and zones from backend
  useEffect(() => {
    fetch('/api/video/cameras')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCameras(data);
        }
      })
      .catch(() => {});

    fetch(`/api/video/zones/${selectedCamId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setZones(data);
        }
      })
      .catch(() => {});
  }, [selectedCamId]);

  // Connect WebSocket for real-time video detection metadata & telemetry
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/video/${selectedCamId}`;

    let reconnectTimer: any = null;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const meta = JSON.parse(event.data);
          if (meta.detections) setDetections(meta.detections);
          if (meta.active_alerts) setActiveAlerts(meta.active_alerts);
          if (meta.telemetry) setTelemetry(meta.telemetry);
        } catch (e) {
          // ignore parse error
        }
      };

      ws.onerror = () => {
        // Fallback to polling metadata if websocket connection is refused
        fetch(`/api/video/metadata/${selectedCamId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((meta) => {
            if (meta) {
              if (meta.detections) setDetections(meta.detections);
              if (meta.active_alerts) setActiveAlerts(meta.active_alerts);
              if (meta.telemetry) setTelemetry(meta.telemetry);
            }
          })
          .catch(() => {});
      };
    } catch (err) {
      // WS fallback
    }

    // Polling backup interval to keep live sync
    const pollInterval = setInterval(() => {
      fetch(`/api/video/metadata/${selectedCamId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((meta) => {
          if (meta) {
            if (meta.detections) setDetections(meta.detections);
            if (meta.active_alerts) setActiveAlerts(meta.active_alerts);
            if (meta.telemetry) setTelemetry(meta.telemetry);
          }
        })
        .catch(() => {});
    }, 400);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
    };
  }, [selectedCamId]);

  const selectedTrack = useMemo(
    () => detections.find((d) => d.track_id === selectedTrackId),
    [detections, selectedTrackId]
  );

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
          badge: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
          color: '#ef4444',
          label: 'CRITICAL',
        };
      case 'ABNORMAL':
        return {
          border: 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
          badge: 'bg-red-500/15 text-red-400 border-red-500/30',
          color: '#f87171',
          label: 'ABNORMAL',
        };
      case 'SUSPICIOUS':
        return {
          border: 'border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          color: '#f59e0b',
          label: 'SUSPICIOUS',
        };
      case 'NORMAL':
      default:
        return {
          border: 'border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          color: '#10b981',
          label: 'NORMAL',
        };
    }
  };

  const activeCamZones = useMemo(
    () => zones.filter((z) => z.camera_id === selectedCamId),
    [zones, selectedCamId]
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-[#c9a15d]/20 bg-[#070503]/95 backdrop-blur-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-[#f0d28f] ${className}`}
    >
      {/* TOP HEADER & CAMERA SELECTOR */}
      <div className="p-4 border-b border-[#c9a15d]/15 bg-gradient-to-r from-[#120c05] via-[#0a0704] to-[#120c05] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-[#c9a15d]/30 bg-[#c9a15d]/10 flex items-center justify-center text-[#f0d28f] shadow-[0_0_15px_rgba(201,161,93,0.15)]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-wide text-[#f5ecd5] font-['Space_Grotesk']">
                LIVE VIDEO INTELLIGENCE
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[#c9a15d]/30 bg-[#c9a15d]/10 text-[#c9a15d]">
                PRODUCTION YOLO PIPELINE
              </span>
            </div>
            <p className="text-xs text-[#a39074] font-['Space_Grotesk']">
              {activeCamera.name} &bull; {activeCamera.location} &bull; {activeCamera.zone}
            </p>
          </div>
        </div>

        {/* CAMERA FLEET SELECTOR BUTTONS */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-[#c9a15d]/20 bg-[#050403]">
          {cameras.map((cam) => {
            const isSelected = cam.camera_id === selectedCamId;
            return (
              <button
                key={cam.camera_id}
                onClick={() => {
                  setSelectedCamId(cam.camera_id);
                  setSelectedTrackId(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7a4f1c]/40 to-[#c9a15d]/20 border border-[#c9a15d]/50 text-[#fef9eb] shadow-[0_0_12px_rgba(201,161,93,0.2)]'
                    : 'text-[#8c7a62] hover:text-[#f0d28f] hover:bg-[#140e06]'
                }`}
              >
                <Radio className={`w-3 h-3 ${isSelected ? 'text-[#c9a15d] animate-pulse' : 'text-[#5a4c38]'}`} />
                <span>{cam.camera_id}</span>
                <span className="text-[10px] opacity-70 hidden sm:inline">{cam.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* STATUS & STREAM INDICATOR */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${
              activeCamera.is_simulation || telemetry.stream_status === 'SIMULATION'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : telemetry.stream_status === 'OFFLINE'
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeCamera.is_simulation || telemetry.stream_status === 'SIMULATION'
                  ? 'bg-amber-400 animate-ping'
                  : telemetry.stream_status === 'OFFLINE'
                  ? 'bg-red-400'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-bold tracking-wider">
              {activeCamera.is_simulation || telemetry.stream_status === 'SIMULATION'
                ? 'SIMULATION'
                : telemetry.stream_status === 'OFFLINE'
                ? 'OFFLINE'
                : '● LIVE'}
            </span>
          </div>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`p-2 rounded-lg border border-[#c9a15d]/30 transition-all ${
              isConfigOpen ? 'bg-[#c9a15d]/20 text-[#fef9eb]' : 'bg-[#0e0a05] text-[#a39074] hover:text-[#f0d28f]'
            }`}
            title="Configure YOLO & Behavior Thresholds"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONFIGURATION DRAWER */}
      {isConfigOpen && (
        <div className="p-4 border-b border-[#c9a15d]/20 bg-[#0d0905] text-xs font-mono grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-[#a39074] mb-1">CONFIDENCE THRESHOLD: {(confThreshold * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.4"
              max="0.9"
              step="0.05"
              value={confThreshold}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setConfThreshold(val);
                fetch('/api/video/config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ conf_threshold: val }),
                }).catch(() => {});
              }}
              className="w-full accent-[#c9a15d]"
            />
            <span className="text-[10px] text-[#7a6a52]">Higher = fewer false positives; Lower = more detections</span>
          </div>

          <div>
            <label className="block text-[#a39074] mb-1">OVERLAY RENDER MODES</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSquareBoxes(!showSquareBoxes)}
                className={`px-2 py-1 rounded border text-[11px] ${
                  showSquareBoxes ? 'border-[#c9a15d] bg-[#c9a15d]/20 text-[#f5ecd5]' : 'border-[#423321] text-[#7a6a52]'
                }`}
              >
                Square Box
              </button>
              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-2 py-1 rounded border text-[11px] ${
                  showZones ? 'border-[#c9a15d] bg-[#c9a15d]/20 text-[#f5ecd5]' : 'border-[#423321] text-[#7a6a52]'
                }`}
              >
                Polygonal Zones
              </button>
              <button
                onClick={() => setShowTrajectories(!showTrajectories)}
                className={`px-2 py-1 rounded border text-[11px] ${
                  showTrajectories ? 'border-[#c9a15d] bg-[#c9a15d]/20 text-[#f5ecd5]' : 'border-[#423321] text-[#7a6a52]'
                }`}
              >
                Trajectories
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#a39074] mb-1">DEVICE / ENGINE STATUS</label>
            <div className="p-2 rounded bg-[#060402] border border-[#2d2214] text-[#c9a15d]">
              <div>DEVICE: {telemetry.device}</div>
              <div>MODEL: {telemetry.model_name}</div>
            </div>
          </div>

          <div>
            <label className="block text-[#a39074] mb-1">TEMPORAL PERSISTENCE</label>
            <div className="text-[11px] text-[#a39074]">
              Loitering: 30s &bull; Fall: 2s &bull; Zone: 1s &bull; Abandoned: 30s
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID: VIDEO STREAM + SIDEBARS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[560px]">
        {/* VIDEO DISPLAY AREA (Col 8) */}
        <div className="lg:col-span-8 p-4 bg-[#050403] relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#c9a15d]/15">
          {/* VIDEO CANVAS CONTAINER */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#c9a15d]/30 bg-[#030201] shadow-2xl flex items-center justify-center">
            {/* MJPEG VIDEO STREAM */}
            <img
              src={`/api/video/stream/${selectedCamId}`}
              alt={`Camera ${selectedCamId}`}
              className="w-full h-full object-cover select-none"
              onError={(e) => {
                // Fallback image if stream is unreachable
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800';
              }}
            />

            {/* REAL-TIME SVG OVERLAY (POLYGONAL ZONES, BOUNDING BOXES, SQUARE RETICLES) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1280 720" preserveAspectRatio="none">
              <defs>
                <pattern id="restrictedGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 20 0 M 0 0 L 20 20" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* RENDER CONFIGURED POLYGONAL ZONES */}
              {showZones &&
                activeCamZones.map((zone) => {
                  const pointsStr = zone.polygon.map(([nx, ny]) => `${nx * 1280},${ny * 720}`).join(' ');
                  const isRestricted = zone.zone_type === 'RESTRICTED';
                  return (
                    <g key={zone.zone_id}>
                      <polygon
                        points={pointsStr}
                        fill={isRestricted ? 'url(#restrictedGrid)' : 'rgba(245, 158, 11, 0.08)'}
                        stroke={isRestricted ? '#ef4444' : '#f59e0b'}
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className={isRestricted ? 'animate-pulse' : ''}
                      />
                      {zone.polygon[0] && (
                        <text
                          x={zone.polygon[0][0] * 1280 + 10}
                          y={zone.polygon[0][1] * 720 + 20}
                          fill={isRestricted ? '#f87171' : '#fbbf24'}
                          fontSize="13"
                          fontWeight="bold"
                          fontFamily="Space Grotesk, sans-serif"
                          className="select-none"
                        >
                          ⛔ {zone.name}
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* RENDER SQUARE & NATIVE BOUNDING BOXES */}
              {detections.map((det) => {
                const styles = getSeverityStyles(det.alert_severity);
                const isSelected = det.track_id === selectedTrackId;
                const box = showSquareBoxes && det.square_bbox ? det.square_bbox : det.bbox;

                // Box coordinates
                const bx = box.x1;
                const by = box.y1;
                const bw = box.x2 - box.x1;
                const bh = box.y2 - box.y1;

                return (
                  <g key={`det-${det.track_id}`} className="cursor-pointer pointer-events-auto" onClick={() => setSelectedTrackId(det.track_id)}>
                    {/* Bounding Box Outline */}
                    <rect
                      x={bx}
                      y={by}
                      width={bw}
                      height={bh}
                      fill={isSelected ? `${styles.color}25` : `${styles.color}10`}
                      stroke={styles.color}
                      strokeWidth={isSelected ? 3 : 2}
                      strokeDasharray={det.alert_severity === 'CRITICAL' ? '4 2' : 'none'}
                      rx={showSquareBoxes ? 4 : 0}
                    />

                    {/* Corner Reticle Brackets */}
                    {showSquareBoxes && (
                      <>
                        <path d={`M ${bx} ${by + 12} L ${bx} ${by} L ${bx + 12} ${by}`} stroke={styles.color} strokeWidth="3" fill="none" />
                        <path d={`M ${bx + bw - 12} ${by} L ${bx + bw} ${by} L ${bx + bw} ${by + 12}`} stroke={styles.color} strokeWidth="3" fill="none" />
                        <path d={`M ${bx} ${by + bh - 12} L ${bx} ${by + bh} L ${bx + 12} ${by + bh}`} stroke={styles.color} strokeWidth="3" fill="none" />
                        <path d={`M ${bx + bw - 12} ${by + bh} L ${bx + bw} ${by + bh} L ${bx + bw} ${by + bh - 12}`} stroke={styles.color} strokeWidth="3" fill="none" />
                      </>
                    )}

                    {/* Detection Badge Header */}
                    <rect
                      x={bx}
                      y={Math.max(0, by - 24)}
                      width={Math.max(140, bw)}
                      height={22}
                      fill="#050403"
                      stroke={styles.color}
                      strokeWidth="1"
                      rx="2"
                    />
                    <text
                      x={bx + 6}
                      y={Math.max(16, by - 8)}
                      fill={styles.color}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {det.class_name} #{det.track_id} &bull; {det.behavior.replace('_', ' ')} ({(det.confidence * 100).toFixed(0)}%)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* LIVE HUD METRICS OVERLAY (Bottom-left of video) */}
            <div className="absolute bottom-3 left-3 p-2.5 rounded-lg border border-[#c9a15d]/30 bg-[#050403]/90 backdrop-blur-md text-[11px] font-mono text-[#e6d0a3] shadow-lg flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c7a62]">SOURCE:</span>
                <span className="text-[#f5ecd5] font-bold">{telemetry.source_fps} FPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c7a62]">INFERENCE:</span>
                <span className="text-[#c9a15d] font-bold">{telemetry.inference_fps} FPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c7a62]">LATENCY:</span>
                <span className="text-[#34d399] font-bold">{telemetry.latency_ms} ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c7a62]">DEVICE:</span>
                <span className="text-[#60a5fa] font-bold">{telemetry.device}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c7a62]">MODEL:</span>
                <span className="text-[#f59e0b] font-bold">{telemetry.model_name}</span>
              </div>
            </div>
          </div>

          {/* ACTIVE ALERTS BANNER UNDER VIDEO */}
          {activeAlerts.length > 0 && (
            <div className="mt-3 space-y-2">
              {activeAlerts.map((alt) => {
                const styles = getSeverityStyles(alt.severity);
                return (
                  <div
                    key={alt.alert_id}
                    className={`p-3 rounded-xl border ${styles.border} bg-[#140a05] flex items-center justify-between gap-3 text-xs`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${styles.badge}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono tracking-wider" style={{ color: styles.color }}>
                            ⚠ {alt.behavior.replace('_', ' ')}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-red-500/30 bg-red-500/20 text-red-300">
                            {alt.severity}
                          </span>
                          <span className="text-[#8c7a62] font-mono text-[10px]">
                            Track #{alt.track_id} &bull; {alt.duration_seconds}s
                          </span>
                        </div>
                        <p className="text-[#d4c3a7] text-[11px] font-['Space_Grotesk'] mt-0.5">{alt.explanation}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onInspectEvidence && onInspectEvidence(alt)}
                      className="px-3 py-1.5 rounded-lg border border-[#c9a15d]/50 bg-[#c9a15d]/10 hover:bg-[#c9a15d]/20 text-[#f5ecd5] font-mono text-xs flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm"
                    >
                      <span>VIEW EVIDENCE</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#c9a15d]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR: ACTIVE TRACKS & TRACK INSPECTOR (Col 4) */}
        <div className="lg:col-span-4 p-4 bg-[#090604] flex flex-col justify-between space-y-4">
          {/* TRACK INSPECTOR / ACTIVE TRACKS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#c9a15d]/15 pb-2">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#c9a15d]" />
                <h3 className="text-xs font-semibold font-mono tracking-wide text-[#f5ecd5]">
                  ACTIVE TRACKS ({detections.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8c7a62]">BYTE-TRACK ISOLATED</span>
            </div>

            {/* TRACKS LIST */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {detections.length === 0 ? (
                <div className="p-4 rounded-xl border border-[#2d2214] bg-[#060402] text-center text-xs text-[#7a6a52] font-mono">
                  No entities currently tracked in camera field of view.
                </div>
              ) : (
                detections.map((det) => {
                  const isSelected = det.track_id === selectedTrackId;
                  const styles = getSeverityStyles(det.alert_severity);
                  return (
                    <div
                      key={`track-${det.track_id}`}
                      onClick={() => setSelectedTrackId(det.track_id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#c9a15d] bg-[#1a1208] shadow-[0_0_15px_rgba(201,161,93,0.15)]'
                          : 'border-[#2d2214] bg-[#0c0805] hover:border-[#523d24] hover:bg-[#120d07]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#f5ecd5]">
                            {det.class_name} #{det.track_id}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${styles.badge}`}>
                            {det.alert_severity}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: styles.color }}>
                          {(det.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#a39074]">
                        <span>BEHAVIOR: {det.behavior.replace('_', ' ')}</span>
                        <span>DWELL: {det.dwell_time_seconds}s</span>
                      </div>

                      {det.current_zone && (
                        <div className="mt-1 text-[10px] font-mono text-amber-400">
                          ZONE: {det.current_zone}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SELECTED TRACK DETAILS FLYOUT */}
          {selectedTrack ? (
            <div className="p-3.5 rounded-xl border border-[#c9a15d]/30 bg-[#120c06] space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-2">
                <span className="font-bold text-[#f5ecd5]">
                  TRACK DETAILS: {selectedTrack.class_name} #{selectedTrack.track_id}
                </span>
                <button
                  onClick={() => setSelectedTrackId(null)}
                  className="text-[#8c7a62] hover:text-[#f0d28f] text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#060402] border border-[#2d2214]">
                  <span className="text-[#8c7a62] block">DETECTION CONF</span>
                  <span className="text-[#f5ecd5] font-bold">{(selectedTrack.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-[#060402] border border-[#2d2214]">
                  <span className="text-[#8c7a62] block">BEHAVIOR CONF</span>
                  <span className="text-[#c9a15d] font-bold">{(selectedTrack.behavior_confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-[#060402] border border-[#2d2214]">
                  <span className="text-[#8c7a62] block">VELOCITY</span>
                  <span className="text-[#60a5fa] font-bold">{(selectedTrack.velocity * 100).toFixed(1)} px/s</span>
                </div>
                <div className="p-2 rounded bg-[#060402] border border-[#2d2214]">
                  <span className="text-[#8c7a62] block">DWELL TIME</span>
                  <span className="text-[#34d399] font-bold">{selectedTrack.dwell_time_seconds}s</span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#060402] border border-[#2d2214] text-[11px]">
                <div className="text-[#8c7a62]">CLASSIFICATION PROVENANCE:</div>
                <div className="text-[#f5ecd5] mt-1">
                  YOLO Object Localization + Persistent ByteTrack + Temporal Kinematics State Machine ({selectedTrack.alert_state})
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-[#2d2214] bg-[#060402] text-xs text-[#7a6a52] font-mono text-center">
              Select any bounding box or track above to inspect kinematic trajectory & Sentinel-X evidence correlation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
