import React, { useState } from 'react';
import { ArrowRight, Sparkles, Terminal, Code2, Cpu } from 'lucide-react';

interface ReasoningWalkthroughStageProps {
  onContinue?: () => void;
}

const REASONING_STEPS = [
  { step: 1, label: 'OBSERVED', title: 'Multimodal Ingestion', desc: '4 discrete sensor anomalies ingested within 90-second spatiotemporal boundary.', status: 'COMPLETE' },
  { step: 2, label: 'CORRELATED', title: 'Topological Mapping', desc: 'NetworkX graph matched Door 02, Camera 02, and Server Switch 04 to Sector B.', status: 'COMPLETE' },
  { step: 3, label: 'SUPPORTED', title: 'Physical-Cyber Alignment', desc: 'Door breach timestamp coincides with SSH session initialization (+4.2s).', status: 'COMPLETE' },
  { step: 4, label: 'CONFLICTING', title: 'Identity Conflict Tagged', desc: 'Biometric visual discrepancy overrides single-factor RFID authorization.', status: 'WARNING' },
  { step: 5, label: 'SITUATION', title: 'Unauthorized Escalation State', desc: 'Deterministic state transition triggered to ESCALATING (Risk: 87%).', status: 'CRITICAL' },
];

export const ReasoningWalkthroughStage: React.FC<ReasoningWalkthroughStageProps> = ({ onContinue }) => {
  const [activeStep, setActiveStep] = useState<number>(3);
  const [showTechnicalTrace, setShowTechnicalTrace] = useState<boolean>(false);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center font-sans select-none text-center">
      {/* Top Section Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c140c] border border-[#c9a15d]/40 text-[#f0d28f] text-[11px] font-mono uppercase tracking-widest mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#f0d28f] animate-spin" />
        <span>Phase 7 • Situational Reasoning Engine ("WHY?")</span>
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#fff6e4] tracking-tight font-serif mb-3">
        Explainable Reasoning Pipeline
      </h2>
      <p className="text-xs md:text-sm text-[#a3927a] max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
        Zero black-box obscurity. Every state transition and risk score escalation is backed by an auditable causal trace.
      </p>

      {/* Step Stepper Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 w-full max-w-4xl mb-6">
        {REASONING_STEPS.map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-inner ${
              activeStep === s.step
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f] text-[#fff6e4] shadow-[0_0_18px_rgba(240,210,143,0.3)]'
                : 'bg-[#0d0905]/80 border-[#c9a15d]/20 text-[#a3927a] hover:border-[#c9a15d]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-[#f0d28f]">0{s.step}</span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                s.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300' : s.status === 'WARNING' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {s.status}
              </span>
            </div>
            <div className="text-xs font-bold text-[#fff6e4] font-mono">{s.label}</div>
            <div className="text-[10px] text-[#a3927a] mt-0.5 line-clamp-1">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Active Step Detailed Explanation Card */}
      <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0b0805]/95 border border-[#c9a15d]/30 text-left shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2a1d0f] flex items-center justify-center text-[#f0d28f]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#f0d28f] uppercase block">STAGE 0{activeStep} OF 05</span>
              <h4 className="text-sm font-bold text-[#fff6e4] font-mono">
                {REASONING_STEPS[activeStep - 1].label}: {REASONING_STEPS[activeStep - 1].title}
              </h4>
            </div>
          </div>

          {/* Toggle Technical Trace Button */}
          <button
            onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
            className="px-3.5 py-1.5 rounded-xl bg-[#140e08] hover:bg-[#20160c] text-[#f0d28f] border border-[#c9a15d]/40 text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showTechnicalTrace ? 'Hide Technical Trace' : 'View Technical Trace'}</span>
          </button>
        </div>

        <p className="text-xs md:text-sm text-[#d5c7b3] leading-relaxed">
          {REASONING_STEPS[activeStep - 1].desc}
        </p>

        {/* Expandable Technical Trace Sub-view */}
        {showTechnicalTrace && (
          <div className="p-4 rounded-2xl bg-[#050403] border border-[#c9a15d]/30 font-mono text-xs space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[#7a6a55] text-[11px] border-b border-[#c9a15d]/15 pb-1">
              <span className="flex items-center gap-1.5 text-[#f0d28f]">
                <Terminal className="w-3.5 h-3.5" />
                DETERMINISTIC INFERENCE TRACE // FASTAPI ENGINE
              </span>
              <span>LATENCY: 18.4ms</span>
            </div>
            <pre className="text-[#a3927a] text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`{
  "stage": "${REASONING_STEPS[activeStep - 1].label}",
  "situation_id": "sit-20260925-001",
  "temporal_window_s": 90,
  "graph_nodes_evaluated": 12,
  "topological_diameter": 3,
  "st_gnn_embedding_dim": 128,
  "bayesian_prior": 0.42,
  "bayesian_posterior": 0.874,
  "mitre_technique_ids": ["T1078.004", "T1021.004"],
  "cryptographic_hash": "sha256-e8f9021a44c92b8d0092bf784a1e948c"
}`}
            </pre>
          </div>
        )}
      </div>

      {onContinue && (
        <div className="mt-8">
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] text-xs font-mono font-bold shadow-[0_0_18px_rgba(201,161,93,0.35)] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>See Trajectory Forecasting ("WHAT NEXT?")</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
