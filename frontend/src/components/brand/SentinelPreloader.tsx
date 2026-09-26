import React, { useEffect, useState } from 'react';
import { SentinelEye } from './SentinelEye';
import { ShieldCheck } from 'lucide-react';

interface SentinelPreloaderProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  minDisplayDurationMs?: number;
}

export const SentinelPreloader: React.FC<SentinelPreloaderProps> = ({
  onComplete,
  onDismiss,
  minDisplayDurationMs = 2200
}) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState('INITIALIZING COGNITIVE REASONING ENGINE...');

  const handleFinish = onDismiss || onComplete || (() => {});

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('CONNECTING 5-CAMERA VISION WALL & MULTI-MODAL SENSORS...');
    }, 600);

    // Stage 2
    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusText('SYNCHRONIZING SPATIOTEMPORAL GRAPH & THREAT DNA...');
    }, 1300);

    // Stage 3 - Complete
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('SITUATION CONSOLE READY · LAUNCHING');
      setIsFadingOut(true);
    }, minDisplayDurationMs - 400);

    // Stage 4 - Unmount
    const t4 = setTimeout(() => {
      handleFinish();
    }, minDisplayDurationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [minDisplayDurationMs]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      handleFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050403] text-[#fbf3e3] p-6 select-none overflow-hidden transition-all duration-700 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background radial atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 900px 700px at 50% 35%, #221a10 0%, #0b0805 55%, #050403 100%)'
        }}
      />

      <div className="relative z-10 w-full max-w-[580px] flex flex-col items-center text-center space-y-4">
        {/* Kicker */}
        <div className="font-mono text-[11px] tracking-[0.35em] text-[#c9a15d] opacity-90 uppercase">
          ARGONYX &apos;26 &nbsp;·&nbsp; TEAM HACKNOVA
        </div>

        {/* 3D Sentinel Eye Hero */}
        <div className="py-2 scale-95 md:scale-100">
          <SentinelEye size="hero" interactive={true} activeState="CRITICAL" showOrbits={true} />
        </div>

        {/* Wordmark */}
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gold-gradient font-sans">
            SENTINEL<span className="text-gold-hot font-bold">-X</span>
          </h1>
          <p className="font-mono text-[11px] md:text-xs tracking-[0.22em] text-[#a3927a]">
            SITUATION INTELLIGENCE <span className="text-[#f0d28f]">&amp;</span> THREAT RESPONSE
          </p>
        </div>

        {/* Golden Progress Bar */}
        <div className="w-full max-w-md pt-2 space-y-2">
          <div className="w-full h-1.5 bg-[#150f09] rounded-full overflow-hidden border border-[#c9a15d]/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(240,210,143,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#a3927a]">
            <span className="flex items-center gap-1.5 text-[#f0d28f] truncate max-w-[320px]">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
              <span>{statusText}</span>
            </span>
            <span className="font-bold text-[#c9a15d]">{progress}%</span>
          </div>
        </div>

        {/* Deterministic State Machine Sequence */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 font-mono text-[9px] md:text-[10px] tracking-wider text-[#a3927a] pt-1">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fae63] shadow-[0_0_6px_#3fae63]" />
            <span>NORMAL</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0b23e] shadow-[0_0_6px_#e0b23e]" />
            <span>ANOMALOUS</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0812f] shadow-[0_0_6px_#e0812f]" />
            <span>SUSPICIOUS</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e5502f] shadow-[0_0_6px_#e5502f]" />
            <span>ESCALATING</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c21f2b] shadow-[0_0_6px_#c21f2b]" />
            <span className="text-[#f87171] font-semibold">CRITICAL</span>
          </span>
        </div>

        {/* Click to skip hint */}
        <div className="text-[9px] font-mono tracking-widest text-[#a3927a]/50 pt-2">
          CLICK ANYWHERE TO SKIP INTRO
        </div>
      </div>
    </div>
  );
};
