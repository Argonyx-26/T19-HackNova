import React from 'react';
import { AlertTriangle, ArrowRight, Sparkles, Shield } from 'lucide-react';

interface PredictionTrajectoryStageProps {
  onContinue?: () => void;
}

export const PredictionTrajectoryStage: React.FC<PredictionTrajectoryStageProps> = ({ onContinue }) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center font-sans select-none text-center">
      {/* Top Section Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c140c] border border-[#c9a15d]/40 text-[#f0d28f] text-[11px] font-mono uppercase tracking-widest mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#f0d28f] animate-spin" />
        <span>Phase 8 • Predictive Trajectory Awareness</span>
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#fff6e4] tracking-tight font-serif mb-3">
        What May Happen Next?
      </h2>
      <p className="text-xs md:text-sm text-[#a3927a] max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
        Looking ahead rather than backwards. Endsley Level 3 situational awareness calculates future risk branching trajectories before lateral spread occurs.
      </p>

      {/* Trajectory Branching Flow */}
      <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0b0805]/95 border border-[#c9a15d]/30 shadow-2xl space-y-6 text-left">
        {/* Top Split Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/60 to-[#120606] border border-rose-500/60 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-300 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                PROJECTED ESCALATION PROBABILITY
              </span>
              <span className="text-xl font-mono font-black text-rose-400">69.4%</span>
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              If left uncontained, suspect is forecasted to execute credential dumping within <strong>3.8 minutes</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#120d08] border border-[#c9a15d]/20 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#f0d28f] uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                SELF-STABILIZATION PROBABILITY
              </span>
              <span className="text-xl font-mono font-black text-[#f0d28f]">30.6%</span>
            </div>
            <p className="text-xs text-[#a3927a] leading-relaxed">
              Probability that anomalous action terminates without compromising core database assets.
            </p>
          </div>
        </div>

        {/* 3-Step Impending Progression Horizon */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#fff6e4] uppercase tracking-wider block">
            Impending Threat Progression Horizon (ST-GNN)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#120d08] border border-[#c9a15d]/30 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#a3927a]">
                <span>T + 02:00 MIN</span>
                <span className="text-amber-400 font-bold">STAGE 3</span>
              </div>
              <div className="text-xs font-bold text-[#fff6e4]">Internal Host Reconnaissance</div>
              <div className="text-[11px] text-[#a3927a]">Port scanning subnet 10.0.4.0/24 from Server Room Switch.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#201509] to-[#120d08] border border-[#f0d28f]/40 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#a3927a]">
                <span>T + 04:30 MIN</span>
                <span className="text-rose-400 font-bold">STAGE 4</span>
              </div>
              <div className="text-xs font-bold text-[#fff6e4]">Lateral Spread to Database</div>
              <div className="text-[11px] text-[#a3927a]">Kerberoasting attack targeting domain controller service tickets.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-rose-300">
                <span>T + 07:00 MIN</span>
                <span className="text-rose-400 font-black">CRITICAL</span>
              </div>
              <div className="text-xs font-bold text-rose-200">Exfiltration via East Transit</div>
              <div className="text-[11px] text-rose-300/80">Physical departure with stolen cryptographic vault keys.</div>
            </div>
          </div>
        </div>
      </div>

      {onContinue && (
        <div className="mt-8">
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] text-xs font-mono font-bold shadow-[0_0_18px_rgba(201,161,93,0.35)] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Test Counterfactual Intervention ("WHAT IF?")</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
