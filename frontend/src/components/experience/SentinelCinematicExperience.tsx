import React from 'react';
import { SentinelEye } from '../brand/SentinelEye';
import { ArrowRight } from 'lucide-react';
import type { Situation } from '../../types';

interface SentinelCinematicExperienceProps {
  situation: Situation | null;
  onEnterCommandCenter: () => void;
  onSimulateIntervention?: (action: any) => Promise<any> | void;
  onStartScenario?: () => void;
}

export const SentinelCinematicExperience: React.FC<SentinelCinematicExperienceProps> = ({
  situation,
  onEnterCommandCenter,
}) => {
  return (
    <div className="relative h-screen w-screen bg-[#050403] text-[#fbf3e3] font-sans selection:bg-[#c9a15d]/30 overflow-hidden select-none flex flex-col justify-between">
      {/* Sticky Top Minimal Header */}
      <header className="w-full px-6 md:px-12 py-4 backdrop-blur-2xl bg-[#050403]/85 border-b border-[#c9a15d]/20 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <SentinelEye size="compact" activeState={situation?.status || 'CRITICAL'} showOrbits={false} />
          <h1 className="text-sm font-bold font-mono tracking-wider text-[#fff6e4]">
            SENTINEL<span className="text-[#f0d28f] font-extrabold">-X</span>
          </h1>
        </div>

        {/* Enter Command Center Action Button */}
        <button
          onClick={onEnterCommandCenter}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:brightness-110 text-[#050403] text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(201,161,93,0.35)] transition-all cursor-pointer hover:scale-105"
        >
          <span>ENTER COMMAND CENTER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section: Centered Breathing Orbital Eye Logo and Brand Motto */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
        {/* Breathing Orbital Eye Logo */}
        <div className="relative mb-6 transform scale-100 md:scale-110 transition-transform duration-1000">
          <SentinelEye size="hero" activeState={situation?.status || 'CRITICAL'} showOrbits={true} />
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-[#fff6e4] tracking-tight font-serif">
            SENTINEL<span className="text-[#f0d28f] font-light">-X</span>
          </h1>

          <p className="text-sm md:text-base text-[#c9a15d] font-mono tracking-widest uppercase font-semibold">
            SITUATION INTELLIGENCE & THREAT RESPONSE
          </p>

          <div className="pt-2 text-xs md:text-sm font-mono tracking-[0.25em] text-[#a3927a]">
            DETECT &bull; UNDERSTAND &bull; ANTICIPATE &bull; DECIDE
          </div>
        </div>
      </main>

      {/* Clean Bottom Spacer for Perfect Centering */}
      <div className="h-6 w-full pointer-events-none" />
    </div>
  );
};
