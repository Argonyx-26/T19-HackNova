import React, { useState, useEffect } from 'react';
import {
  Globe,
  Radio,
  Activity,
  Layers,
  ShieldAlert,
  Flame,
  Plane,
  Ship,
  Eye,
  Camera,
  Server,
  KeyRound,
  Cpu,
  ChevronRight,
  X,
  Compass,
  Zap
} from 'lucide-react';
import RotatingEarth from '@/components/ui/wireframe-dotted-globe';
import { api } from '@/services/api';
import type { Situation, NormalizedEvent } from '@/types';

interface GlobalSituationalMapProps {
  onSelectSituation?: (situationId: string) => void;
  activeSituation?: Situation | null;
  events?: NormalizedEvent[];
}

export const GlobalSituationalMap: React.FC<GlobalSituationalMapProps> = ({
  onSelectSituation,
  activeSituation,
  events = []
}) => {
  const [viewMode, setViewMode] = useState<'tactical' | 'globe'>('tactical');
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [intelFeedOpen, setIntelFeedOpen] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: 37.7749, lng: -122.4194, loc: 'Orion Research Complex' });
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [maritime, setMaritime] = useState<any[]>([]);
  const [utcTime, setUtcTime] = useState<string>('');

  // Layer Toggles
  const [layers, setLayers] = useState({
    situations: true,
    cctv: true,
    network: true,
    access: true,
    iot: true,
    earthquakes: true,
    flights: true,
    maritime: false,
    wildfires: false,
    dayNight: true,
  });

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-world context data
  useEffect(() => {
    api.getEarthquakes().then(setEarthquakes).catch(() => {});
    api.getFlights().then(setFlights).catch(() => {});
    api.getMaritime().then(setMaritime).catch(() => {});
  }, []);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Convert lat/lng to SVG map coordinates (Miller / Mercator approximation)
  const projectCoordinates = (lng: number, lat: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Orion Research Complex coordinates (Silicon Valley / SF Bay Area: -122.4, 37.7)
  const situationPos = projectCoordinates(-122.4194, 37.7749);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[640px] bg-[#050811] rounded-2xl border border-neutral-800/80 overflow-hidden flex flex-col font-sans select-none shadow-2xl">
      {/* 1. Tactical HUD Header */}
      <div className="h-12 border-b border-neutral-800/80 bg-[#080d1a]/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-mono tracking-widest text-sm font-bold text-neutral-100">S E N T I N E L - X</span>
          </div>
          <span className="text-neutral-600 text-xs">|</span>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400/90">Global Situation Platform</span>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-neutral-400">SYS: <strong className="text-emerald-400 font-normal">CONNECTED</strong></span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>SOLAR: <span className="text-neutral-200">Kp1</span></span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-neutral-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTITIES: <span className="text-neutral-200">12,483</span></span>
          </div>

          <div className="flex items-center space-x-2 text-neutral-300 bg-neutral-950 px-3 py-1 rounded border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>{utcTime || 'UTC --:--:--'}</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-900 border border-neutral-700/80 rounded p-0.5">
            <button
              onClick={() => setViewMode('tactical')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center space-x-1.5 ${
                viewMode === 'tactical'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tactical Map</span>
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center space-x-1.5 ${
                viewMode === 'globe'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Globe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#04060d]">
        {/* VIEW A: TACTICAL SVG PROJECTION MAP */}
        {viewMode === 'tactical' && (
          <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
            {/* Ambient Background Grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Tactical SVG Projection */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.08)]"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 1000;
                const y = ((e.clientY - rect.top) / rect.height) * 500;
                const lng = Math.round(((x / 1000) * 360 - 180) * 100) / 100;
                const lat = Math.round((90 - (y / 500) * 180) * 100) / 100;
                setCoordinates({ lat, lng, loc: 'Tactical Recon Coordinates' });
              }}
            >
              <defs>
                {/* Situation Alert Glow */}
                <radialGradient id="alertGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="quakeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Tactical Graticules */}
              {[-120, -60, 0, 60, 120].map((lng) => {
                const { x } = projectCoordinates(lng, 0);
                return (
                  <line
                    key={`graticule-v-${lng}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={500}
                    stroke="#1e293b"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    opacity="0.6"
                  />
                );
              })}
              {[-60, -30, 0, 30, 60].map((lat) => {
                const { y } = projectCoordinates(0, lat);
                return (
                  <line
                    key={`graticule-h-${lat}`}
                    x1={0}
                    y1={y}
                    x2={1000}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="0.7"
                    strokeDasharray="3 4"
                    opacity="0.6"
                  />
                );
              })}

              {/* Equator & Prime Meridian Highlight */}
              <line x1={0} y1={250} x2={1000} y2={250} stroke="#334155" strokeWidth="1" strokeDasharray="6 4" opacity="0.8" />
              <line x1={500} y1={0} x2={500} y2={500} stroke="#334155" strokeWidth="1" strokeDasharray="6 4" opacity="0.8" />

              {/* Stylized Continental Outlines */}
              {/* North America */}
              <path
                d="M 120,110 L 190,85 L 280,105 L 290,140 L 250,195 L 220,250 L 190,260 L 175,225 L 140,190 L 110,140 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* South America */}
              <path
                d="M 230,270 L 290,285 L 320,340 L 285,440 L 250,440 L 230,350 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* Europe & Africa */}
              <path
                d="M 450,90 L 520,80 L 540,120 L 480,150 L 440,120 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />
              <path
                d="M 460,170 L 550,180 L 580,260 L 540,380 L 480,350 L 440,250 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* Asia */}
              <path
                d="M 550,75 L 750,70 L 850,110 L 820,220 L 730,260 L 650,220 L 560,150 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* Australia */}
              <path
                d="M 760,320 L 850,310 L 870,380 L 780,400 Z"
                fill="#0d1527"
                stroke="#1e3a5f"
                strokeWidth="1.2"
                opacity="0.9"
              />

              {/* LAYER: Earthquakes */}
              {layers.earthquakes &&
                earthquakes.map((eq, i) => {
                  const [lng, lat] = eq.coordinates;
                  const pos = projectCoordinates(lng, lat);
                  return (
                    <g
                      key={`eq-${i}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedEntity({ type: 'earthquake', data: eq })}
                    >
                      <circle cx={pos.x} cy={pos.y} r={eq.magnitude * 2.4} fill="url(#quakeGlow)" />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={Math.max(3, eq.magnitude * 0.9)}
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth="0.8"
                        className="animate-pulse"
                      />
                    </g>
                  );
                })}

              {/* LAYER: Flights */}
              {layers.flights &&
                flights.map((fl, i) => {
                  const [lng, lat] = fl.coordinates;
                  const pos = projectCoordinates(lng, lat);
                  return (
                    <g
                      key={`flight-${i}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedEntity({ type: 'flight', data: fl })}
                    >
                      <circle cx={pos.x} cy={pos.y} r={2.5} fill="#38bdf8" />
                      {/* Direction vector */}
                      <line x1={pos.x} y1={pos.y} x2={pos.x + 6} y2={pos.y - 3} stroke="#38bdf8" strokeWidth="1" />
                    </g>
                  );
                })}

              {/* LAYER: SENTINEL-X CCTV Nodes */}
              {layers.cctv && (
                <>
                  {[-122.42, -122.41, -122.43].map((lng, i) => {
                    const pos = projectCoordinates(lng, 37.77 + i * 0.05);
                    return (
                      <circle
                        key={`cctv-${i}`}
                        cx={pos.x + (i - 1) * 7}
                        cy={pos.y + (i - 1) * 7}
                        r={2.8}
                        fill="#06b6d4"
                        opacity="0.85"
                        stroke="#082f49"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </>
              )}

              {/* LAYER: SENTINEL-X ACTIVE SITUATION BEACON (Orion Campus) */}
              {layers.situations && (
                <g
                  className="cursor-pointer"
                  onClick={() => {
                    if (activeSituation) {
                      setSelectedEntity({ type: 'situation', data: activeSituation });
                      if (onSelectSituation) onSelectSituation(activeSituation.situation_id);
                    }
                  }}
                >
                  {/* Outer Radar Ping */}
                  <circle cx={situationPos.x} cy={situationPos.y} r={32} fill="url(#alertGlow)" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle cx={situationPos.x} cy={situationPos.y} r={18} fill="#ef4444" opacity="0.3" />
                  <circle cx={situationPos.x} cy={situationPos.y} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Target Label */}
                  <rect
                    x={situationPos.x + 12}
                    y={situationPos.y - 18}
                    width={130}
                    height={32}
                    rx={3}
                    fill="#180509"
                    stroke="#ef4444"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x={situationPos.x + 18}
                    y={situationPos.y - 5}
                    fill="#f87171"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ● SITUATION-001
                  </text>
                  <text
                    x={situationPos.x + 18}
                    y={situationPos.y + 7}
                    fill="#fca5a5"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    STATE: {activeSituation?.status || 'CRITICAL'} (Risk 92)
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* VIEW B: 3D DOTTED WIREFRAME GLOBE */}
        {viewMode === 'globe' && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-full flex items-center justify-center">
              <RotatingEarth width={720} height={520} className="w-full max-w-full" />
            </div>
          </div>
        )}

        {/* 2. Floating Data Layers Panel (Left) */}
        {layerPanelOpen ? (
          <div className="absolute top-4 left-4 w-64 bg-[#0a0f1d]/95 backdrop-blur-md border border-neutral-800 rounded-xl p-3 shadow-2xl z-20 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">DATA LAYERS</span>
              </div>
              <button onClick={() => setLayerPanelOpen(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SENTINEL-X INTEL SECTION */}
            <div className="mb-3">
              <div className="text-[10px] uppercase text-cyan-400 font-semibold mb-1.5 flex items-center justify-between">
                <span>SENTINEL-X INTEL</span>
                <span className="text-neutral-500">PRIMARY</span>
              </div>
              <div className="space-y-1">
                {[
                  { key: 'situations', label: 'Situations', color: 'text-red-400', icon: ShieldAlert, count: 1 },
                  { key: 'cctv', label: 'CCTV Cameras', color: 'text-cyan-400', icon: Camera, count: 14 },
                  { key: 'access', label: 'Access Points', color: 'text-emerald-400', icon: KeyRound, count: 8 },
                  { key: 'network', label: 'Network / IDS', color: 'text-amber-400', icon: Server, count: 22 },
                  { key: 'iot', label: 'IoT Sensors', color: 'text-purple-400', icon: Cpu, count: 18 }
                ].map(({ key, label, color, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => toggleLayer(key as any)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-900/80 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span className={layers[key as keyof typeof layers] ? 'text-neutral-200' : 'text-neutral-600 line-through'}>
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-neutral-400">{count}</span>
                      <span className={`w-2 h-2 rounded-full ${layers[key as keyof typeof layers] ? 'bg-cyan-400' : 'bg-neutral-700'}`}></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* REAL-WORLD CONTEXT SECTION */}
            <div className="pt-2 border-t border-neutral-800">
              <div className="text-[10px] uppercase text-amber-400 font-semibold mb-1.5 flex items-center justify-between">
                <span>GLOBAL CONTEXT</span>
                <span className="text-neutral-500">EXTERNAL</span>
              </div>
              <div className="space-y-1">
                {[
                  { key: 'earthquakes', label: 'USGS Earthquakes (24h)', color: 'text-orange-400', icon: Activity, count: earthquakes.length || 4 },
                  { key: 'flights', label: 'Aircraft Tracks', color: 'text-sky-400', icon: Plane, count: flights.length || 5 },
                  { key: 'maritime', label: 'Maritime / Naval', color: 'text-teal-400', icon: Ship, count: maritime.length || 3 },
                  { key: 'wildfires', label: 'Active Fires (NASA)', color: 'text-rose-400', icon: Flame, count: 12 },
                  { key: 'dayNight', label: 'Day / Night Cycle', color: 'text-yellow-400', icon: Radio, count: null }
                ].map(({ key, label, color, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => toggleLayer(key as any)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-900/80 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span className={layers[key as keyof typeof layers] ? 'text-neutral-200' : 'text-neutral-600 line-through'}>
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {count !== null && <span className="text-[10px] text-neutral-400">{count}</span>}
                      <span className={`w-2 h-2 rounded-full ${layers[key as keyof typeof layers] ? 'bg-amber-400' : 'bg-neutral-700'}`}></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLayerPanelOpen(true)}
            className="absolute top-4 left-4 p-2 bg-[#0a0f1d]/90 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-100 z-20 shadow-lg"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        {/* 3. Floating Live Intelligence Feed (Right) */}
        {intelFeedOpen ? (
          <div className="absolute top-4 right-4 w-72 max-h-[380px] bg-[#0a0f1d]/95 backdrop-blur-md border border-neutral-800 rounded-xl p-3 shadow-2xl z-20 font-mono text-xs flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
              <div className="flex items-center space-x-2">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">INTEL FEED</span>
              </div>
              <button onClick={() => setIntelFeedOpen(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {/* Dynamic Ingested Events (if present) */}
              {events.slice(0, 4).map((evt) => (
                <div key={evt.event_id} className="p-2 rounded bg-neutral-900/70 border border-neutral-800">
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-bold flex items-center space-x-1" style={{
                      color: evt.source_type === 'CCTV' ? '#22d3ee' : evt.source_type === 'NETWORK' ? '#f59e0b' : evt.source_type === 'ACCESS' ? '#34d399' : '#a855f7'
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{
                        backgroundColor: evt.source_type === 'CCTV' ? '#22d3ee' : evt.source_type === 'NETWORK' ? '#f59e0b' : evt.source_type === 'ACCESS' ? '#34d399' : '#a855f7'
                      }}></span>
                      <span>{evt.source_type}</span>
                    </span>
                    <span className="text-neutral-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-neutral-200 font-semibold text-[11px] truncate">{evt.event_type}</div>
                  <div className="text-neutral-400 text-[10px] truncate">{evt.entity_id} • {evt.location_id}</div>
                </div>
              ))}

              {/* Coexisting Live Items */}
              <div className="p-2 rounded bg-red-950/40 border border-red-800/60">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-red-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>SENTINEL-X</span>
                  </span>
                  <span className="text-neutral-500">12:43:21</span>
                </div>
                <div className="text-neutral-200 font-semibold text-[11px]">SITUATION-001</div>
                <div className="text-neutral-400 text-[10px]">State escalated to CRITICAL. 7 correlated events.</div>
              </div>

              <div className="p-2 rounded bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-amber-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>NETWORK</span>
                  </span>
                  <span className="text-neutral-500">12:42:51</span>
                </div>
                <div className="text-neutral-300 text-[10px]">Port scan & SSH lateral movement from person-104</div>
              </div>

              <div className="p-2 rounded bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-cyan-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>CCTV</span>
                  </span>
                  <span className="text-neutral-500">12:42:21</span>
                </div>
                <div className="text-neutral-300 text-[10px]">Unauthorized presence confirmed in Server Vault</div>
              </div>

              <div className="p-2 rounded bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ACCESS</span>
                  </span>
                  <span className="text-neutral-500">12:42:03</span>
                </div>
                <div className="text-neutral-300 text-[10px]">Repeated badge authorization denied</div>
              </div>

              {/* Context Item (USGS) */}
              <div className="p-2 rounded bg-neutral-950/80 border border-neutral-800">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-orange-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    <span>USGS CONTEXT</span>
                  </span>
                  <span className="text-neutral-500">11:20:00</span>
                </div>
                <div className="text-neutral-400 text-[10px]">M5.4 — 12 km SW of Hualien City, Taiwan</div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIntelFeedOpen(true)}
            className="absolute top-4 right-4 p-2 bg-[#0a0f1d]/90 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-100 z-20 shadow-lg"
          >
            <Radio className="w-4 h-4 text-red-400" />
          </button>
        )}

        {/* 4. Entity Drill-Down Card (Popup) */}
        {selectedEntity && (
          <div className="absolute bottom-16 right-4 w-80 bg-[#0d1424]/95 backdrop-blur-md border border-neutral-700/80 rounded-xl p-4 shadow-2xl z-30 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2.5">
              <span className="text-xs uppercase font-bold text-neutral-200 tracking-wider flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {selectedEntity.type === 'situation'
                    ? 'SENTINEL-X SITUATION'
                    : selectedEntity.type === 'earthquake'
                    ? 'USGS SEISMIC EVENT'
                    : 'AIRCRAFT RADAR'}
                </span>
              </span>
              <button onClick={() => setSelectedEntity(null)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedEntity.type === 'situation' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">ID:</span>
                  <span className="text-neutral-200 font-bold">{selectedEntity.data.situation_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">State:</span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800/80">
                    {selectedEntity.data.status} (Score 92)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Target Facility:</span>
                  <span className="text-neutral-200">Orion Research Campus</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Correlated Events:</span>
                  <span className="text-cyan-400">7 across 4 sources</span>
                </div>
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="text-[10px] text-neutral-400 mb-1">TRAJECTORY:</div>
                  <div className="text-red-400 font-bold">ESCALATING → CRITICAL</div>
                </div>

                {onSelectSituation && (
                  <button
                    onClick={() => onSelectSituation(selectedEntity.data.situation_id)}
                    className="w-full mt-2 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded font-sans text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-lg"
                  >
                    <span>OPEN SITUATION INTELLIGENCE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {selectedEntity.type === 'earthquake' && (
              <div className="space-y-1.5 text-neutral-300">
                <div className="text-orange-400 font-bold text-sm">M{selectedEntity.data.magnitude} EARTHQUAKE</div>
                <div className="text-neutral-400">{selectedEntity.data.place}</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800">
                  <span className="text-neutral-500">DEPTH: {selectedEntity.data.depth_km} km</span>
                  <span className="text-neutral-500">
                    COORDS: {selectedEntity.data.coordinates[1]}, {selectedEntity.data.coordinates[0]}
                  </span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'flight' && (
              <div className="space-y-1.5 text-neutral-300">
                <div className="text-sky-400 font-bold text-sm">{selectedEntity.data.callsign}</div>
                <div className="text-neutral-400">Type: {selectedEntity.data.type}</div>
                <div className="text-neutral-400">Route: {selectedEntity.data.origin} → {selectedEntity.data.destination}</div>
                <div className="text-neutral-500 text-[11px]">Alt: {selectedEntity.data.altitude} ft | Spd: {selectedEntity.data.speed} kts</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Tactical Telemetry Bar */}
      <div className="h-9 border-t border-neutral-800/80 bg-[#080d1a]/90 backdrop-blur-md px-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 z-20">
        <div className="flex items-center space-x-4">
          <span>COORDINATES: <span className="text-neutral-200">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span></span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <span className="hidden md:inline">TARGET: <span className="text-cyan-400">{coordinates.loc}</span></span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-neutral-500">REGIONS:</span>
            {['GLOBAL', 'US-WEST', 'EMEA', 'APAC'].map((r) => (
              <button key={r} className="hover:text-cyan-400 transition-colors">
                [{r}]
              </button>
            ))}
          </div>
          <span className="text-neutral-600">|</span>
          <span>ZOOM: <span className="text-neutral-200">2.5x</span></span>
        </div>
      </div>
    </div>
  );
};
