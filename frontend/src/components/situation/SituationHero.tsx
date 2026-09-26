import React from 'react';
import type { Situation, SituationState } from '../../types';
import { ShieldAlert, Eye, HelpCircle, Sliders, ArrowUpRight, Cpu } from 'lucide-react';

interface SituationHeroProps {
  situation: Situation | null;
  confidenceScore?: number;
  threatPriorityIndex?: number;
  activeState?: SituationState;
  onViewEvidence?: () => void;
  onViewWhy?: () => void;
  onViewWhatIf?: () => void;
}

export const SituationHero: React.FC<SituationHeroProps> = ({
  situation,
  confidenceScore = 87,
  threatPriorityIndex = 94.2,
  activeState = 'CRITICAL',
  onViewEvidence,
  onViewWhy,
  onViewWhatIf
}) => {
  const getStateColor = (state: SituationState) => {
    switch (state) {
      case 'CRITICAL':
        return {
          pill: 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.35)]',
          dot: 'bg-rose-500 animate-ping'
        };
      case 'ESCALATING':
        return {
          pill: 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.3)]',
          dot: 'bg-amber-500 animate-ping'
        };
      case 'SUSPICIOUS':
        return {
          pill: 'bg-yellow-950/70 border-yellow-500/50 text-yellow-300',
          dot: 'bg-yellow-500'
        };
      case 'ANOMALOUS':
        return {
          pill: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
          dot: 'bg-blue-500'
        };
      default:
        return {
          pill: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
          dot: 'bg-emerald-500'
        };
    }
  };

  const stateStyle = getStateColor(activeState);

  return (
    <div className="spotlight-card relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-6 md:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      {/* Background ambient warm illumination */}
      <div
        className="absolute top-0 right-0 w-[450px] h-[250px] pointer-events-none -mr-20 -mt-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(240, 210, 143, 0.12), transparent 70%)',
          filter: 'blur(30px)'
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Title, State, Synthesis */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#c9a15d] uppercase font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#f0d28f]" />
              <span>ACTIVE SITUATION DETECTED</span>
            </span>

            {/* Severity Pill */}
            <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center space-x-2 ${stateStyle.pill}`}>
              <span className={`w-2 h-2 rounded-full ${stateStyle.dot}`} />
              <span>● {activeState}</span>
            </div>

            {/* Evidence Confidence */}
            <div className="px-2.5 py-1 rounded-full bg-[#1e150b] border border-[#c9a15d]/30 text-[#f0d28f] font-mono text-xs font-semibold">
              Evidence Confidence: <strong>{confidenceScore}%</strong>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-sans tracking-tight text-[#fff6e4]">
            {situation?.summary?.split('.')[0] || 'Unauthorized Physical & Lateral Data Exfiltration Escalation'}
          </h2>

          <p className="text-sm md:text-base text-[#a3927a] font-sans leading-relaxed">
            {(() => {
              const sentences = situation?.summary ? situation.summary.split('.').map(s => s.trim()).filter(Boolean) : [];
              if (sentences.length > 1) {
                return sentences.slice(1).join('. ') + '.';
              }
              return 'Multiple correlated cyber-physical indicators: keycard mismatch at Floor 4 corridor, unauthorized access retry, and simultaneous high-velocity outbound data exfiltration toward foreign external IP.';
            })()}
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onViewEvidence && (
              <button
                onClick={onViewEvidence}
                className="px-4 py-2 rounded-xl bg-[#24190e] hover:bg-[#382615] border border-[#c9a15d]/40 text-[#fff6e4] font-mono text-xs font-semibold flex items-center space-x-2 transition shadow-md group cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#f0d28f]" />
                <span>VIEW EVIDENCE</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#c9a15d] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}

            {onViewWhy && (
              <button
                onClick={onViewWhy}
                className="px-4 py-2 rounded-xl bg-[#24190e] hover:bg-[#382615] border border-[#c9a15d]/40 text-[#fff6e4] font-mono text-xs font-semibold flex items-center space-x-2 transition shadow-md group cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#f0d28f]" />
                <span>WHY?</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#c9a15d] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}

            {onViewWhatIf && (
              <button
                onClick={onViewWhatIf}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7a4f1c] via-[#c9a15d] to-[#e8b25c] hover:from-[#946124] hover:to-[#f0d28f] text-[#050403] font-mono text-xs font-bold flex items-center space-x-2 transition shadow-[0_0_20px_rgba(201,161,93,0.4)] group cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#050403]" />
                <span>WHAT IF? (SIMULATE)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#050403] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Threat Priority Index Telemetry Card */}
        <div className="w-full lg:w-72 bg-[#0a0704]/90 border border-[#c9a15d]/30 rounded-2xl p-4 space-y-3 shrink-0 shadow-inner">
          <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-2">
            <span className="font-mono text-[10px] text-[#c9a15d] uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#f0d28f]" />
              <span>THREAT INDEX</span>
            </span>
            <span className="font-mono text-[10px] text-rose-400 font-bold">ACCELERATING</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-mono font-extrabold text-rose-400">{threatPriorityIndex}</span>
            <span className="text-xs font-mono text-[#a3927a]">/ 100 TPI</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
            <div className="p-1.5 rounded-lg bg-[#140e08] border border-[#c9a15d]/15">
              <span className="text-[#a3927a]">Risk</span>
              <div className="text-rose-400 font-bold mt-0.5">0.94</div>
            </div>
            <div className="p-1.5 rounded-lg bg-[#140e08] border border-[#c9a15d]/15">
              <span className="text-[#a3927a]">Conf.</span>
              <div className="text-[#f0d28f] font-bold mt-0.5">87%</div>
            </div>
            <div className="p-1.5 rounded-lg bg-[#140e08] border border-[#c9a15d]/15">
              <span className="text-[#a3927a]">Rel.</span>
              <div className="text-emerald-400 font-bold mt-0.5">96%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
