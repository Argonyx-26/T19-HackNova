import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Pin, PinOff, Radio, Play, Pause, ShieldAlert, Camera } from 'lucide-react';

export interface BoundingBox {
  id: string;
  label: string;
  type: 'person' | 'bag' | 'weapon' | 'breach' | 'vehicle';
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  status?: string;
}

export interface CameraStream {
  id: string;
  name: string;
  zone: string;
  classification: 'RESTRICTED' | 'CONTROLLED' | 'PUBLIC';
  thumbnailUrl: string;
  boxes: BoundingBox[];
  activeThreat?: string;
}

const INITIAL_CAMERAS: CameraStream[] = [
  {
    id: 'CAM-01',
    name: 'Cafe Entrance & Plaza',
    zone: 'Zone-A Plaza',
    classification: 'PUBLIC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b1', label: 'PERSON #104 (SUSPECT)', type: 'person', confidence: 0.96, x: 28, y: 35, w: 18, h: 48, status: 'TRACKING' },
      { id: 'b2', label: 'UNATTENDED BAG', type: 'bag', confidence: 0.91, x: 52, y: 62, w: 14, h: 18, status: 'CUSTODY CHANGE' }
    ],
    activeThreat: 'Possible Theft & Custody Change'
  },
  {
    id: 'CAM-02',
    name: 'Bus Station Concourse',
    zone: 'Zone-B Transit',
    classification: 'CONTROLLED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b3', label: 'ABANDONED SUITCASE', type: 'bag', confidence: 0.88, x: 60, y: 55, w: 16, h: 22, status: 'STATIONARY 45s' },
      { id: 'b4', label: 'PERSON #109', type: 'person', confidence: 0.94, x: 15, y: 30, w: 15, h: 50, status: 'RUNNING' }
    ],
    activeThreat: 'Abandoned Object Detected'
  },
  {
    id: 'CAM-03',
    name: 'Server Room Corridor',
    zone: 'Zone-C Restricted',
    classification: 'RESTRICTED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b5', label: 'TAILGATER #882', type: 'breach', confidence: 0.98, x: 38, y: 25, w: 22, h: 60, status: 'UNAUTHORIZED ACCESS' }
    ],
    activeThreat: 'Perimeter Door Breach'
  },
  {
    id: 'CAM-04',
    name: 'East Perimeter Gate',
    zone: 'Zone-D Gate',
    classification: 'CONTROLLED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b6', label: 'VEHICLE #TX-90', type: 'vehicle', confidence: 0.92, x: 42, y: 40, w: 32, h: 35, status: 'LINGERING' }
    ]
  },
  {
    id: 'CAM-05',
    name: 'Platform North',
    zone: 'Zone-E Platform',
    classification: 'PUBLIC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b7', label: 'CROWD DENSITY (8)', type: 'person', confidence: 0.89, x: 20, y: 20, w: 55, h: 65, status: 'CROWD SURGE' }
    ]
  },
  {
    id: 'CAM-06',
    name: 'Executive Parking',
    zone: 'Zone-F Garage',
    classification: 'RESTRICTED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
    boxes: [
      { id: 'b8', label: 'PERSON #201', type: 'person', confidence: 0.90, x: 45, y: 35, w: 16, h: 45, status: 'LOITERING' }
    ]
  }
];

export const ArgusCameraWall: React.FC = () => {
  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-01');
  const [showDetections, setShowDetections] = useState<boolean>(true);
  const [isLiveInference, setIsLiveInference] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(15 * 60 + 18);

  const selectedCam = INITIAL_CAMERAS.find((c) => c.id === selectedCamId) || INITIAL_CAMERAS[0];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((prev) => (prev >= 15 * 60 + 30 ? 15 * 60 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `15:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden font-sans select-none backdrop-blur-3xl">
      {/* Top Header Bar */}
      <div className="p-4 bg-[#0a0704]/90 border-b border-[#c9a15d]/20 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>YOLO11 + BYTETRACK VISION ENGINE</span>
          </div>

          <span className="text-xs text-[#fff6e4] font-mono font-semibold">
            {selectedCam.id} · {selectedCam.name}
          </span>

          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${
              selectedCam.classification === 'RESTRICTED'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                : selectedCam.classification === 'CONTROLLED'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}
          >
            {selectedCam.classification}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetections(!showDetections)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              showDetections
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] text-[#fff6e4] border-[#f0d28f]/60 shadow-[0_0_12px_rgba(240,210,143,0.3)]'
                : 'bg-[#140e08] border-[#c9a15d]/20 text-[#a3927a] hover:text-[#fff6e4]'
            }`}
          >
            {showDetections ? (
              <Eye className="w-3.5 h-3.5 text-[#f0d28f]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[#7a6a55]" />
            )}
            <span>Detections {showDetections ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsLiveInference(!isLiveInference)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isLiveInference
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-[#140e08] border-[#c9a15d]/20 text-[#a3927a] hover:text-[#fff6e4]'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isLiveInference ? 'text-rose-400 animate-pulse' : 'text-[#7a6a55]'
              }`}
            />
            <span>{isLiveInference ? '30 FPS Live GPU' : 'Replay Mode'}</span>
          </button>

          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isPinned
                ? 'bg-[#3a2814] border-[#f0d28f]/60 text-[#f0d28f] shadow-[0_0_12px_rgba(240,210,143,0.3)]'
                : 'bg-[#140e08] border-[#c9a15d]/20 text-[#a3927a] hover:text-[#fff6e4]'
            }`}
            title="Pin Main Camera"
          >
            {isPinned ? <Pin className="w-4 h-4 text-[#f0d28f]" /> : <PinOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Video Feed Player with Interactive Bounding Boxes */}
      <div className="relative h-[420px] w-full bg-[#080503] overflow-hidden group">
        {/* Background Image / Stream Simulation */}
        <img
          src={selectedCam.thumbnailUrl}
          alt={selectedCam.name}
          className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.15]"
        />

        {/* Dynamic Scanning Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(240,210,143,0.04)_50%)] bg-[size:100%_4px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f0d28f]/80 to-transparent animate-scan" />

        {/* Live Timestamp & FPS Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-3 bg-[#0a0704]/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-[#c9a15d]/30 font-mono text-xs text-[#fff6e4] shadow-md">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            REC
          </span>
          <span>{formatTime(simTime)}</span>
          <span className="text-[#f0d28f] font-semibold">30 FPS</span>
          <span className="text-[#a3927a]">1080p</span>
        </div>

        {/* Active Threat Warning Banner on Video */}
        {selectedCam.activeThreat && (
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-rose-600 text-white backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-rose-400 text-xs font-mono font-bold shadow-[0_0_16px_rgba(244,63,94,0.5)] animate-pulse">
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>THREAT DETECTED: {selectedCam.activeThreat}</span>
          </div>
        )}

        {/* Interactive Object Detection Bounding Boxes */}
        {showDetections &&
          selectedCam.boxes.map((box) => {
            const isDanger = box.type === 'weapon' || box.type === 'breach' || box.status?.includes('THEFT');
            const isWarning = box.type === 'bag' || box.status?.includes('RUNNING');

            return (
              <div
                key={box.id}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`
                }}
                className={`absolute border-2 transition-all duration-300 z-10 flex flex-col justify-between p-1 shadow-lg ${
                  isDanger
                    ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_14px_rgba(244,63,94,0.4)]'
                    : isWarning
                    ? 'border-[#f0d28f] bg-[#f0d28f]/15 shadow-[0_0_14px_rgba(240,210,143,0.3)]'
                    : 'border-[#c9a15d] bg-[#c9a15d]/10 shadow-[0_0_10px_rgba(201,161,93,0.2)]'
                }`}
              >
                {/* Top Tag Label */}
                <div
                  className={`-mt-6 self-start px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shadow-sm flex items-center gap-1.5 whitespace-nowrap ${
                    isDanger
                      ? 'bg-rose-600 text-white'
                      : isWarning
                      ? 'bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403]'
                      : 'bg-[#22170d] text-[#f0d28f] border border-[#c9a15d]/40'
                  }`}
                >
                  <span>{box.label}</span>
                  <span className="opacity-80">({Math.round(box.confidence * 100)}%)</span>
                </div>

                {/* Status Badge inside Box */}
                {box.status && (
                  <div className="self-end px-2 py-0.5 rounded-md bg-[#0a0704]/90 text-[9px] font-mono text-[#f0d28f] border border-[#c9a15d]/30">
                    {box.status}
                  </div>
                )}
              </div>
            );
          })}

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center space-x-3 bg-[#0a0704]/90 backdrop-blur-xl px-4 py-2 rounded-full border border-[#c9a15d]/30 shadow-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[#3a2814] hover:bg-[#543d22] text-[#f0d28f] transition border border-[#f0d28f]/40"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <input
            type="range"
            min={15 * 60}
            max={15 * 60 + 30}
            value={simTime}
            onChange={(e) => setSimTime(Number(e.target.value))}
            className="w-full accent-[#f0d28f] bg-[#1a120a] h-1.5 rounded-full cursor-pointer"
          />

          <span className="text-[11px] font-mono text-[#a3927a] shrink-0">
            {formatTime(simTime)} / 15:18:30
          </span>
        </div>
      </div>

      {/* 6-Camera Filmstrip Selector Tiles */}
      <div className="p-4 bg-[#0a0704]/95 border-t border-[#c9a15d]/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#a3927a] font-bold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#f0d28f]" />
            Active CCTV Camera Stream Wall (Click to Inspect)
          </span>
          <span className="text-[10px] font-mono text-[#f0d28f]">6 STREAMS ONLINE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {INITIAL_CAMERAS.map((cam) => {
            const isSelected = cam.id === selectedCamId;
            const hasThreat = !!cam.activeThreat;

            return (
              <button
                key={cam.id}
                onClick={() => setSelectedCamId(cam.id)}
                className={`relative rounded-2xl border text-left overflow-hidden transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? 'border-[#f0d28f] ring-2 ring-[#f0d28f]/40 shadow-[0_0_16px_rgba(240,210,143,0.35)]'
                    : hasThreat
                    ? 'border-rose-500/60 bg-rose-950/20 hover:border-rose-400'
                    : 'border-[#c9a15d]/20 hover:border-[#c9a15d]/50 bg-[#140e08]/70'
                }`}
              >
                <div className="relative h-24 w-full bg-[#080503]">
                  <img
                    src={cam.thumbnailUrl}
                    alt={cam.name}
                    className="w-full h-full object-cover filter brightness-[0.75]"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#0a0704]/90 text-[9px] font-mono font-bold text-[#fff6e4] border border-[#c9a15d]/30">
                    {cam.id}
                  </div>
                  {hasThreat && (
                    <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                <div className="p-2.5 bg-[#0e0a06]">
                  <div className="text-[11px] font-semibold text-[#fff6e4] truncate font-sans">{cam.name}</div>
                  <div className="text-[9px] font-mono text-[#a3927a] truncate mt-0.5">{cam.zone}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

