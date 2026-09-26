import React, { useState, useEffect } from 'react';
import { Video, Wifi, Key, Radio, MapPin, Sparkles, ArrowRight, Cpu } from 'lucide-react';

interface SignalConvergenceStageProps {
  onContinue?: () => void;
}

const SIGNALS = [
  { id: 'video', label: 'VIDEO / CCTV', icon: Video, desc: 'Camera 02: Unknown entity loitering near server room', color: '#c9a15d', startPos: { x: -140, y: -90 } },
  { id: 'network', label: 'NETWORK IDS', icon: Wifi, desc: 'Unusual outbound SSH traffic surge on port 22', color: '#f0d28f', startPos: { x: 140, y: -80 } },
  { id: 'access', label: 'ACCESS CONTROL', icon: Key, desc: 'Badge ID #104 scanned at Door 02 (Off-hours)', color: '#e8b25c', startPos: { x: -160, y: 70 } },
  { id: 'iot', label: 'IOT SENSORS', icon: Radio, desc: 'Acoustic glass-break frequency & ambient thermal rise', color: '#f59e0b', startPos: { x: 150, y: 80 } },
  { id: 'geo', label: 'GEOSPATIAL / RFID', icon: MapPin, desc: 'Restricted transit corridor motion trajectory', color: '#38bdf8', startPos: { x: 0, y: 120 } },
];

export const SignalConvergenceStage: React.FC<SignalConvergenceStageProps> = ({ onContinue }) => {
  const [phase, setPhase] = useState<'DISPERSED' | 'CONVERGING' | 'CORRELATED' | 'SITUATION'>('DISPERSED');
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('CONVERGING'), 1400);
    const t2 = setTimeout(() => setPhase('CORRELATED'), 3600);
    const t3 = setTimeout(() => setPhase('SITUATION'), 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center font-sans select-none text-center">
      {/* Top Section Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c140c] border border-[#c9a15d]/40 text-[#f0d28f] text-[11px] font-mono uppercase tracking-widest mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#f0d28f] animate-spin" />
        <span>Phase 3 • Multimodal Signal Convergence</span>
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#fff6e4] tracking-tight font-serif mb-3">
        From Disconnected Signals to Evolving Situations
      </h2>
      <p className="text-xs md:text-sm text-[#a3927a] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
        Modern enterprises generate thousands of raw alerts every second. SENTINEL-X evaluates temporal proximity, topological relations, and spatial overlaps to fuse fragments into a single situation.
      </p>

      {/* Interactive Convergence Arena */}
      <div className="relative w-full max-w-2xl h-[380px] bg-[#070503] rounded-3xl border border-[#c9a15d]/30 shadow-[0_16px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden flex items-center justify-center backdrop-blur-2xl">
        {/* Background Radar / Orbital Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#c9a15d]/10 via-transparent to-transparent opacity-80" />
        <div className="absolute w-72 h-72 rounded-full border border-[#c9a15d]/15 animate-spin" style={{ animationDuration: '40s' }} />
        <div className="absolute w-48 h-48 rounded-full border border-dashed border-[#c9a15d]/25 animate-spin" style={{ animationDuration: '25s' }} />

        {/* Central Core (Forms in Phase 3/4) */}
        <div className={`relative z-20 flex flex-col items-center justify-center transition-all duration-700 ${
          phase === 'SITUATION'
            ? 'scale-100 opacity-100'
            : phase === 'CORRELATED'
            ? 'scale-90 opacity-80'
            : 'scale-75 opacity-30'
        }`}>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_35px_rgba(201,161,93,0.4)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[22px] flex flex-col items-center justify-center text-[#f0d28f]">
              <Cpu className="w-8 h-8 animate-pulse text-[#f0d28f]" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-mono font-bold text-[#fff6e4] block">SITUATION CORE</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 mt-1 inline-block">
              {phase === 'SITUATION' ? 'SIT-2026-001 FORMED' : 'CORRELATING...'}
            </span>
          </div>
        </div>

        {/* Dynamic Converging Signal Nodes */}
        {SIGNALS.map((sig) => {
          const Icon = sig.icon;
          const isConverged = phase === 'CORRELATED' || phase === 'SITUATION';
          const isHovered = activeSignal === sig.id;

          const currentX = isConverged ? sig.startPos.x * 0.35 : sig.startPos.x;
          const currentY = isConverged ? sig.startPos.y * 0.35 : sig.startPos.y;

          return (
            <div
              key={sig.id}
              onMouseEnter={() => setActiveSignal(sig.id)}
              onMouseLeave={() => setActiveSignal(null)}
              style={{
                transform: `translate(${currentX}px, ${currentY}px)`,
                transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="absolute z-30 cursor-pointer group"
            >
              {/* Linking Vector Ray */}
              {isConverged && (
                <div
                  className="absolute top-1/2 left-1/2 w-16 h-[1.5px] bg-gradient-to-r from-[#f0d28f]/60 to-transparent -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    transform: `rotate(${Math.atan2(-currentY, -currentX) * (180 / Math.PI)}deg)`,
                    transformOrigin: '0 0'
                  }}
                />
              )}

              <div className={`p-2.5 rounded-2xl bg-[#140e08]/90 border transition-all duration-300 backdrop-blur-xl flex items-center gap-2 shadow-lg ${
                isHovered
                  ? 'border-[#f0d28f] scale-110 shadow-[0_0_20px_rgba(240,210,143,0.4)]'
                  : 'border-[#c9a15d]/30 hover:border-[#c9a15d]/60'
              }`}>
                <div className="w-7 h-7 rounded-xl bg-[#2a1d0f] flex items-center justify-center text-[#f0d28f]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left pr-1">
                  <span className="text-[10px] font-mono font-bold text-[#fff6e4] block leading-none">{sig.label}</span>
                  <span className="text-[9px] font-mono text-[#a3927a]">Active Stream</span>
                </div>
              </div>

              {/* Hover Tooltip Details */}
              {isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 rounded-xl bg-[#0a0704]/95 border border-[#f0d28f]/60 text-left z-40 shadow-2xl backdrop-blur-2xl">
                  <p className="text-[10px] text-[#d5c7b3] leading-snug">{sig.desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progression Flow Stepper Footer */}
      <div className="mt-8 flex items-center gap-3 flex-wrap justify-center font-mono text-xs">
        <div className={`px-4 py-2 rounded-2xl border transition-all ${
          phase === 'DISPERSED'
            ? 'bg-[#3a2814] text-[#fff6e4] border-[#f0d28f]/60 shadow-[0_0_12px_rgba(240,210,143,0.3)]'
            : 'bg-[#120d08] text-[#a3927a] border-[#c9a15d]/20'
        }`}>
          1. RAW SENSOR FEEDS
        </div>
        <ArrowRight className="w-4 h-4 text-[#c9a15d]" />
        <div className={`px-4 py-2 rounded-2xl border transition-all ${
          phase === 'CONVERGING' || phase === 'CORRELATED'
            ? 'bg-[#3a2814] text-[#fff6e4] border-[#f0d28f]/60 shadow-[0_0_12px_rgba(240,210,143,0.3)]'
            : 'bg-[#120d08] text-[#a3927a] border-[#c9a15d]/20'
        }`}>
          2. CORRELATED EVIDENCE GRAPH
        </div>
        <ArrowRight className="w-4 h-4 text-[#c9a15d]" />
        <div className={`px-4 py-2 rounded-2xl border transition-all ${
          phase === 'SITUATION'
            ? 'bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] font-bold border-transparent shadow-[0_0_16px_rgba(201,161,93,0.35)]'
            : 'bg-[#120d08] text-[#a3927a] border-[#c9a15d]/20'
        }`}>
          3. SITUATION SYNTHESIS
        </div>
      </div>

      {/* Optional Replay / Manual Trigger */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => {
            setPhase('DISPERSED');
            setTimeout(() => setPhase('CONVERGING'), 600);
            setTimeout(() => setPhase('CORRELATED'), 1800);
            setTimeout(() => setPhase('SITUATION'), 3200);
          }}
          className="px-4 py-1.5 rounded-xl bg-[#140e08] hover:bg-[#20160c] text-[#a3927a] hover:text-[#fff6e4] border border-[#c9a15d]/20 text-xs font-mono transition-all cursor-pointer"
        >
          ↻ Replay Convergence
        </button>

        {onContinue && (
          <button
            onClick={onContinue}
            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] text-xs font-mono font-bold shadow-[0_0_14px_rgba(201,161,93,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Examine Current Situation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
