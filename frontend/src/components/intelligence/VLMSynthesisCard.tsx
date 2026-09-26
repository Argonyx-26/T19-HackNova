import React from 'react';
import {
  BrainCircuit,
  Eye,
  CheckSquare,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type { VLMSituationSynthesis } from '../../types';

interface VLMSynthesisCardProps {
  synthesis?: VLMSituationSynthesis | null;
}

export const VLMSynthesisCard: React.FC<VLMSynthesisCardProps> = ({ synthesis }) => {
  if (!synthesis) {
    return (
      <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-6 text-center text-[#a3927a] backdrop-blur-3xl">
        <BrainCircuit className="w-8 h-8 mx-auto mb-2 text-[#f0d28f]/40 animate-pulse" />
        <p className="text-sm font-mono">Running local Vision-Language situational synthesis...</p>
      </div>
    );
  }

  const {
    model_name,
    inference_type,
    executive_summary,
    evidence_synthesis,
    key_anomalies = [],
    possible_next_developments = [],
    suggested_operator_checklist = [],
    grounded_evidence_ids = [],
    confidence,
    latency_ms
  } = synthesis;

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c9a15d]/20 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_14px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[13px] flex items-center justify-center text-[#f0d28f]">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#fff6e4] font-mono flex items-center space-x-2">
              <span>LOCAL VISION-LANGUAGE SYNTHESIS</span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-[#f0d28f]">
              <span>{model_name}</span>
              <span>•</span>
              <span className="text-[#a3927a]">Latency: {latency_ms.toFixed(1)}ms</span>
            </div>
          </div>
        </div>

        {/* Inference Distinction Badge */}
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#3a2814] text-[#f0d28f] border border-[#c9a15d]/40 shadow-sm flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#f0d28f] animate-spin" />
            <span>{inference_type}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#120d08] text-[#f0d28f] border border-[#c9a15d]/30">
            CONFIDENCE: {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Executive Briefing */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#a3927a] flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f0d28f]" />
          <span>Grounded Situation Summary</span>
        </div>
        <p className="text-xs text-[#d5c7b3] leading-relaxed font-sans bg-[#0b0805]/90 p-3.5 rounded-2xl border border-[#c9a15d]/20 shadow-inner">
          {executive_summary}
        </p>
      </div>

      {/* Cross-Modal Synthesis */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#a3927a] flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5 text-[#f0d28f]" />
          <span>Multimodal Evidence Correlation</span>
        </div>
        <p className="text-xs text-[#a3927a] leading-relaxed font-sans bg-[#0b0805]/60 p-3.5 rounded-2xl border border-[#c9a15d]/15 shadow-inner">
          {evidence_synthesis}
        </p>
      </div>

      {/* Split Columns: Key Anomalies & Next Developments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Anomalies */}
        <div className="bg-[#0b0805]/80 p-3.5 rounded-2xl border border-[#c9a15d]/20 space-y-2 shadow-inner">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Key Detected Anomalies</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#d5c7b3] font-sans">
            {key_anomalies.map((anom, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#f0d28f] font-bold">•</span>
                <span>{anom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Probable Threat Evolution */}
        <div className="bg-[#0b0805]/80 p-3.5 rounded-2xl border border-[#c9a15d]/20 space-y-2 shadow-inner">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-rose-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Projected Threat Trajectory (ST-GNN)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#d5c7b3] font-sans">
            {possible_next_developments.map((dev, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">→</span>
                <span>{dev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Operator Action Checklist */}
      <div className="bg-[#0b0805]/90 p-3.5 rounded-2xl border border-[#c9a15d]/25 space-y-2 shadow-inner">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#f0d28f]">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Recommended Operator Action Protocol</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#d5c7b3] font-sans">
          {suggested_operator_checklist.map((step, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#120d08] border border-[#c9a15d]/20 flex items-center space-x-2"
            >
              <span className="w-5 h-5 rounded-full bg-[#2a1d0f] border border-[#c9a15d]/40 text-[#f0d28f] text-[10px] font-mono flex items-center justify-center font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Traceable Grounded IDs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-[#7a6a55]">
        <span>Grounded in Evidence:</span>
        {grounded_evidence_ids.map((gid) => (
          <span
            key={gid}
            className="px-2 py-0.5 rounded-full bg-[#120d08] text-[#a3927a] border border-[#c9a15d]/20"
          >
            {gid}
          </span>
        ))}
        <span className="ml-auto text-emerald-400 flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Hallucination Guard Active</span>
        </span>
      </div>
    </div>
  );
};
