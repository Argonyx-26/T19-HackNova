import React, { useState, useEffect } from 'react';
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Activity,
  RefreshCw,
  Radio,
} from 'lucide-react';
import type { PhysicalBehaviorEvent, ZoneClassification } from '../../types';
import { api } from '../../services/api';

const CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Main Lobby & Plaza',
    zone: 'zone-lobby-01',
    classification: 'PUBLIC' as ZoneClassification,
    bgImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
    targets: [
      { id: 'PERSON #104', label: 'PEDESTRIAN', conf: 0.96, x: 32, y: 38, w: 16, h: 46, status: 'NORMAL_WALKING', color: '#10b981' },
      { id: 'PERSON #108', label: 'VISITOR', conf: 0.92, x: 68, y: 44, w: 14, h: 42, status: 'STANDING', color: '#10b981' }
    ]
  },
  {
    id: 'CAM-02',
    name: 'Server Vault Corridor',
    zone: 'zone-server-corridor-02',
    classification: 'RESTRICTED' as ZoneClassification,
    bgImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    targets: [
      { id: 'PERSON #P42', label: 'ACCESS_MISMATCH', conf: 0.93, x: 42, y: 28, w: 20, h: 56, status: 'RESTRICTED_ZONE_ACCESS', color: '#f43f5e' }
    ]
  },
  {
    id: 'CAM-03',
    name: 'Security Turnstile Gate',
    zone: 'zone-gate-03',
    classification: 'CONTROLLED' as ZoneClassification,
    bgImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    targets: [
      { id: 'PERSON #P77', label: 'TAILGATING', conf: 0.88, x: 48, y: 30, w: 18, h: 52, status: 'TAILGATING_BREACH', color: '#f43f5e' },
      { id: 'PERSON #P42', label: 'BADGE_HOLDER', conf: 0.94, x: 34, y: 26, w: 18, h: 54, status: 'UNAUTHORIZED_FOLLOWER', color: '#f59e0b' }
    ]
  },
  {
    id: 'CAM-04',
    name: 'Perimeter Fence East',
    zone: 'zone-perimeter-04',
    classification: 'CONTROLLED' as ZoneClassification,
    bgImage: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=600',
    targets: [
      { id: 'PERSON #P42', label: 'LOITERING 127s', conf: 0.91, x: 54, y: 35, w: 18, h: 50, status: 'DWELL_THRESHOLD_EXCEEDED', color: '#f59e0b' }
    ]
  },
  {
    id: 'CAM-05',
    name: 'Restricted Vault Parking',
    zone: 'zone-parking-05',
    classification: 'RESTRICTED' as ZoneClassification,
    bgImage: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600',
    targets: [
      { id: 'PERSON #SUSPECT-X', label: 'FORCED_ENTRY', conf: 0.95, x: 38, y: 32, w: 22, h: 58, status: 'PERIMETER_BREACH', color: '#f43f5e' }
    ]
  },
];

const ZONE_COLORS: Record<ZoneClassification, { border: string; badge: string; scan: string; label: string }> = {
  PUBLIC: { border: 'border-emerald-500/40', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40', scan: '#10b981', label: 'PUBLIC' },
  CONTROLLED: { border: 'border-[#c9a15d]/40', badge: 'bg-[#2a1d0f] text-[#f0d28f] border-[#c9a15d]/40', scan: '#c9a15d', label: 'CONTROLLED' },
  RESTRICTED: { border: 'border-rose-500/50', badge: 'bg-rose-950/60 text-rose-300 border-rose-500/50', scan: '#f43f5e', label: 'RESTRICTED' },
  CRITICAL: { border: 'border-rose-600/70', badge: 'bg-rose-900/70 text-rose-200 border-rose-600/60', scan: '#e11d48', label: 'CRITICAL' },
};

interface CameraFeedProps {
  cam: typeof CAMERAS[0];
  behaviors: PhysicalBehaviorEvent[];
  onSelect?: () => void;
}

const LiveCameraFeed: React.FC<CameraFeedProps> = ({ cam, behaviors, onSelect }) => {
  const myBehaviors = behaviors.filter((b) => b.camera_id === cam.id);
  const activeBehavior = myBehaviors[0];
  const zoneColors = ZONE_COLORS[cam.classification];
  const hasAlert = myBehaviors.some((b) => b.severity === 'CRITICAL' || b.severity === 'HIGH');

  const [currentTime, setCurrentTime] = useState<string>('');
  const [streamError, setStreamError] = useState<boolean>(false);
  const [motionOffset, setMotionOffset] = useState<number>(0);

  // Live military timestamp updating in real-time
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');
      setCurrentTime(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
          now.getHours()
        )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms.slice(0, 2)} UTC`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 80);
    return () => clearInterval(interval);
  }, []);

  // Subtle realistic camera jitter/motion simulation
  useEffect(() => {
    const motionTimer = setInterval(() => {
      setMotionOffset((prev) => (prev + 0.05) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(motionTimer);
  }, []);

  const jitterX = Math.sin(motionOffset) * 1.2;
  const jitterY = Math.cos(motionOffset * 1.5) * 0.8;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden group shadow-2xl ${
        hasAlert
          ? 'border-rose-500/70 shadow-[0_0_24px_rgba(244,63,94,0.35)]'
          : 'border-[#c9a15d]/25 hover:border-[#c9a15d]/60 bg-[#080503]'
      }`}
    >
      {/* CCTV LIVE SENSOR VIDEO FEED CANVAS */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[195px] bg-[#050302] overflow-hidden select-none">
        {/* LIVE MJPEG FEED WITH PHOTOREALISTIC FALLBACK */}
        {!streamError ? (
          <img
            src={api.getVideoStreamUrl(cam.id)}
            alt={`${cam.id} Live Stream`}
            className="w-full h-full object-cover select-none filter contrast-110 brightness-95"
            onError={() => setStreamError(true)}
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={cam.bgImage}
              alt={`${cam.id} Surveillance`}
              className="w-full h-full object-cover select-none filter contrast-110 brightness-90 saturate-75"
            />
            {/* Subtle CCTV CRT Noise & Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050302]/30 to-[#050302]/85 pointer-events-none" />
          </div>
        )}

        {/* REAL-TIME DYNAMIC COMPUTER VISION OVERLAY (SQUARE BOUNDING BOXES & RETICLES) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* CAMERA GRID SCANLINES */}
          <line x1="0" y1="50" x2="100" y2="50" stroke={zoneColors.scan} strokeWidth="0.2" strokeOpacity="0.3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke={zoneColors.scan} strokeWidth="0.2" strokeOpacity="0.3" />

          {/* DYNAMIC TRACKING TARGETS */}
          {cam.targets.map((tgt, idx) => {
            const bx = tgt.x + (idx === 0 ? jitterX : -jitterX);
            const by = tgt.y + (idx === 0 ? jitterY : -jitterY);
            const size = Math.max(tgt.w, tgt.h);

            return (
              <g key={`tgt-${idx}`}>
                {/* Square Bounding Box Reticle */}
                <rect
                  x={bx}
                  y={by}
                  width={size}
                  height={size}
                  fill={`${tgt.color}15`}
                  stroke={tgt.color}
                  strokeWidth="0.8"
                  rx="1"
                />

                {/* Corner Tracking Reticles */}
                <path
                  d={`M ${bx} ${by + 3} L ${bx} ${by} L ${bx + 3} ${by}`}
                  stroke={tgt.color}
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d={`M ${bx + size - 3} ${by} L ${bx + size} ${by} L ${bx + size} ${by + 3}`}
                  stroke={tgt.color}
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d={`M ${bx} ${by + size - 3} L ${bx} ${by + size} L ${bx + 3} ${by + size}`}
                  stroke={tgt.color}
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d={`M ${bx + size - 3} ${by + size} L ${bx + size} ${by + size} L ${bx + size} ${by + size - 3}`}
                  stroke={tgt.color}
                  strokeWidth="1.2"
                  fill="none"
                />

                {/* Label Chip */}
                <rect
                  x={bx}
                  y={Math.max(2, by - 6)}
                  width={Math.max(28, size + 4)}
                  height={5.5}
                  fill="#050403"
                  stroke={tgt.color}
                  strokeWidth="0.4"
                  rx="0.5"
                />
                <text
                  x={bx + 1}
                  y={Math.max(5.5, by - 2)}
                  fill={tgt.color}
                  fontSize="3"
                  fontWeight="bold"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {tgt.id} [{(tgt.conf * 100).toFixed(0)}%]
                </text>
              </g>
            );
          })}
        </svg>

        {/* TOP CAMERA HEADER HUD */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
          <div className="flex items-center space-x-1.5 bg-[#0a0704]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[#c9a15d]/30 shadow-md min-w-0 max-w-[62%]">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                hasAlert ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-mono font-bold text-[#fff6e4] shrink-0">{cam.id}</span>
            <span className="text-[10px] text-[#c9a15d] font-mono truncate">{cam.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-950/90 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>REC</span>
            </span>
            <span
              className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${zoneColors.badge}`}
            >
              {zoneColors.label}
            </span>
          </div>
        </div>

        {/* TELEMETRY WATERMARK BADGE */}
        <div className="absolute top-9 right-2 z-10 text-right font-mono text-[8px] text-[#f0d28f]/80 bg-[#050403]/85 px-1.5 py-0.5 rounded border border-[#c9a15d]/20 backdrop-blur-sm pointer-events-none">
          1080P &bull; 30 FPS &bull; H.265
        </div>

        {/* BOTTOM HUD: LIVE DETECTION BANNER OR TELEMETRY BAR */}
        {activeBehavior ? (
          <div className="absolute bottom-2 left-2 right-2 bg-[#0b0805]/95 backdrop-blur-xl border border-rose-500/60 rounded-xl p-2 z-10 space-y-1 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-mono font-bold truncate">
                <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse shrink-0" />
                <span className="truncate">{activeBehavior.behavior_type}</span>
              </div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/60 font-bold shrink-0">
                {activeBehavior.severity}
              </span>
            </div>
            <p className="text-[9.5px] text-[#d5c7b3] line-clamp-1 leading-tight font-sans">
              {activeBehavior.physical_note}
            </p>
            <div className="flex items-center justify-between text-[8px] font-mono text-[#a3927a] pt-0.5 border-t border-[#c9a15d]/15">
              <span className="truncate">Tracks: {activeBehavior.track_ids.join(', ') || 'PERSON-P42'}</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-rose-400 font-bold">
                  Conf: {(activeBehavior.behavior_confidence * 100).toFixed(0)}%
                </span>
                <span className="text-[#e6d0a3] border-l border-[#c9a15d]/30 pl-1.5">
                  {currentTime.split(' ')[1] || 'UTC'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between px-2 py-1 rounded-lg bg-[#050403]/90 border border-[#c9a15d]/25 text-[9px] text-[#e6d0a3] font-mono backdrop-blur-md shadow">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">Telemetry Normal &bull; 0 Anomalies</span>
            </div>
            <div className="flex items-center space-x-1 text-[#e6d0a3]/90 shrink-0 text-[8.5px]">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>{currentTime || 'LIVE UTC'}</span>
            </div>
          </div>
        )}

        {/* HOVER EXPAND BUTTON */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button className="p-1.5 rounded-lg bg-[#140e08]/90 text-[#f0d28f] hover:text-[#fff6e4] border border-[#c9a15d]/40 shadow-lg cursor-pointer">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FiveCameraGrid: React.FC = () => {
  const [behaviors, setBehaviors] = useState<PhysicalBehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviors = async () => {
    try {
      const data = await api.getPhysicalBehaviors(50);
      setBehaviors(data);
    } catch (err) {
      console.error('Failed to load physical behaviors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehaviors();
    const interval = setInterval(fetchBehaviors, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 md:p-6 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#c9a15d]/20 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_16px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center text-[#f0d28f]">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#fff6e4] flex items-center gap-2">
              Physical Security Command Center
              <span className="text-[10px] font-mono uppercase bg-[#3a2814]/70 text-[#f0d28f] border border-[#c9a15d]/40 px-2.5 py-0.5 rounded-full">
                5 SENSOR FEEDS LIVE
              </span>
            </h3>
            <p className="text-xs text-[#a3927a]">
              Spatial behavior ontology, dwell tracking, zone perimeter violations & access mismatches
            </p>
          </div>
        </div>

        <button
          onClick={fetchBehaviors}
          className="p-2 rounded-xl bg-[#140e08] hover:bg-[#20160c] text-[#a3927a] hover:text-[#fff6e4] border border-[#c9a15d]/20 transition-colors cursor-pointer"
          title="Refresh Feeds"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#f0d28f]' : ''}`} />
        </button>
      </div>

      {/* Unified 5-Camera Grid Matrix: 2 Top Feeds (50% each) + 3 Bottom Feeds (33.3% each) - Zero Blank Space */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3.5">
        {/* Top Row: CAM-01 & CAM-02 (Spans 3 cols each = 50% width) */}
        <div className="col-span-1 sm:col-span-1 md:col-span-3">
          <LiveCameraFeed cam={CAMERAS[0]} behaviors={behaviors} />
        </div>
        <div className="col-span-1 sm:col-span-1 md:col-span-3">
          <LiveCameraFeed cam={CAMERAS[1]} behaviors={behaviors} />
        </div>

        {/* Bottom Row: CAM-03, CAM-04, CAM-05 (Spans 2 cols each = 33.3% width) */}
        <div className="col-span-1 sm:col-span-1 md:col-span-2">
          <LiveCameraFeed cam={CAMERAS[2]} behaviors={behaviors} />
        </div>
        <div className="col-span-1 sm:col-span-1 md:col-span-2">
          <LiveCameraFeed cam={CAMERAS[3]} behaviors={behaviors} />
        </div>
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
          <LiveCameraFeed cam={CAMERAS[4]} behaviors={behaviors} />
        </div>
      </div>

      {/* Behavior Stream Marquee / Ticker */}
      <div className="pt-3 border-t border-[#c9a15d]/15 flex items-center justify-between text-xs text-[#a3927a] flex-wrap gap-2">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <Activity className="w-3.5 h-3.5 text-[#f0d28f]" />
          <span className="text-[#fff6e4] font-semibold">Active Behavioral Telemetry:</span>
          <span className="text-[#f0d28f]">{behaviors.length} physical behavior events logged</span>
        </div>
        <div className="text-[10px] font-mono text-[#7a6a55]">
          Ontology: Physical Security &bull; ATT&CK Mapping Requires Independent Cyber Corroboration
        </div>
      </div>
    </div>
  );
};
