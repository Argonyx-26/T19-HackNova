import React from 'react';
import { Award, Play, Sparkles, HelpCircle, Activity } from 'lucide-react';

interface JuryTourBannerProps {
  onOpenTour: () => void;
  onStartScenario: () => void;
  isSimulating: boolean;
}

export const JuryTourBanner: React.FC<JuryTourBannerProps> = ({
  onOpenTour,
  onStartScenario,
  isSimulating
}) => {
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-3.5 md:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl group overflow-hidden">
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#f0d28f]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
        {/* Left Side: Brand Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#241a0d] border border-[#c9a15d]/40 flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-5 h-5 text-[#f0d28f] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono font-bold uppercase bg-[#3a2814]/60 border border-[#c9a15d]/40 text-[#f0d28f] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#f0d28f]" />
                FOR JUDGES & EVALUATORS
              </span>
              <span className="text-[9px] font-mono text-[#a3927a] border border-[#c9a15d]/20 px-2 py-0.5 rounded-full">
                90-Sec Breakthrough Tour
              </span>
            </div>
            <p className="text-xs font-sans text-[#a3927a] mt-1 leading-tight">
              Fusing multi-source physical & cyber alerts into correlated topological graphs with risk projections & counterfactual interventions.
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Triggers */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          <button
            onClick={onOpenTour}
            className="px-3 py-1.5 rounded-xl bg-[#1a120a] hover:bg-[#271c10] border border-[#c9a15d]/30 text-[#fff6e4] text-xs font-mono font-medium flex items-center gap-1.5 transition-all hover:border-[#f0d28f]/60 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#f0d28f]" />
            <span>90s Guided Tour</span>
          </button>

          <button
            onClick={onStartScenario}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isSimulating
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-amber-500/20 animate-pulse'
                : 'bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:from-[#d8b06c] hover:to-[#ffdf9e] text-[#050403] shadow-[0_0_16px_rgba(201,161,93,0.3)]'
            }`}
          >
            {isSimulating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Scenario Streaming...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Breach Scenario</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

