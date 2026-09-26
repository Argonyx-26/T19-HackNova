import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Sparkles, UserCheck, Key, Eye, Server } from 'lucide-react';

interface EvidenceConflictStageProps {
  onContinue?: () => void;
}

const SUPPORTING_SIGNALS = [
  { id: '1', domain: 'ACCESS CONTROL', title: 'Restricted Server Door #02 Opened', desc: 'Badge ID #104 scanned at 02:44:12 AM', icon: Key, status: 'VERIFIED' },
  { id: '2', domain: 'NETWORK IDS', title: 'Internal SSH Connection Established', desc: 'Terminal 10.0.4.82 initiated session with core repository', icon: Server, status: 'VERIFIED' },
  { id: '3', domain: 'CAMERA CCTV', title: 'Physical Entry Recorded', desc: 'Camera 02 recorded doorway crossing into Server Corridor', icon: Eye, status: 'VERIFIED' },
];

const CONFLICTING_SIGNALS = [
  { id: '4', domain: 'COMPUTER VISION / IDENTITY', title: 'Visual Biomismatch Detected', desc: 'Physical facial & height profile does NOT match Badgeholder #104 (Marcus Vance)', icon: UserCheck, status: 'CONFLICT' }
];

export const EvidenceConflictStage: React.FC<EvidenceConflictStageProps> = ({ onContinue }) => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center font-sans select-none text-center">
      {/* Top Section Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c140c] border border-[#c9a15d]/40 text-[#f0d28f] text-[11px] font-mono uppercase tracking-widest mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#f0d28f] animate-spin" />
        <span>Phase 6 • Evidence Fusion & Conflict Reasoner</span>
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#fff6e4] tracking-tight font-serif mb-3">
        Evaluating Corroboration & Evidence Conflicts
      </h2>
      <p className="text-xs md:text-sm text-[#a3927a] max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
        SENTINEL-X does not merely aggregate alerts. It validates whether observations form a coherent, mathematically consistent explanation of reality.
      </p>

      {/* Signature Conflict Banner */}
      <div className="w-full max-w-3xl p-4 mb-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#1f1205] to-rose-950/60 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-left flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 animate-pulse text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[#fff6e4] font-mono">EVIDENCE CONFLICT DETECTED</h4>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
              3 SUPPORTING • 1 CONFLICTING
            </span>
          </div>
          <p className="text-xs text-[#d5c7b3] mt-1 leading-relaxed">
            Badge credentials authenticate as Marcus Vance, but vision keypoints detect an unknown individual. The system tags this as an <strong>Impersonation / Stolen Credential Breach</strong>.
          </p>
        </div>
      </div>

      {/* Supporting vs Conflicting Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-4xl text-left">
        {/* Supporting Column */}
        <div className="md:col-span-7 space-y-3">
          <span className="text-xs font-mono font-bold text-[#f0d28f] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Supporting Corroborated Observations (3)
          </span>

          <div className="space-y-2.5">
            {SUPPORTING_SIGNALS.map((sig) => {
              const Icon = sig.icon;
              return (
                <div
                  key={sig.id}
                  onClick={() => setSelectedSignal(sig.id)}
                  className={`p-3.5 rounded-2xl bg-[#0b0805]/90 border transition-all cursor-pointer shadow-inner ${
                    selectedSignal === sig.id
                      ? 'border-[#f0d28f] shadow-[0_0_16px_rgba(240,210,143,0.3)]'
                      : 'border-[#c9a15d]/20 hover:border-[#c9a15d]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-[#2a1d0f] text-[#f0d28f]">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#fff6e4] font-mono">{sig.title}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                      {sig.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#a3927a] pl-8">{sig.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conflicting Column */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Conflicting Observation (1)
          </span>

          <div className="space-y-2.5">
            {CONFLICTING_SIGNALS.map((sig) => {
              const Icon = sig.icon;
              return (
                <div
                  key={sig.id}
                  onClick={() => setSelectedSignal(sig.id)}
                  className={`p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/40 to-[#120606] border transition-all cursor-pointer shadow-inner ${
                    selectedSignal === sig.id
                      ? 'border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
                      : 'border-rose-500/50 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-500/40">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-rose-200 font-mono">{sig.title}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {sig.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/80 pl-8 leading-relaxed">{sig.desc}</p>
                </div>
              );
            })}

            {/* Evidence Metric Pill */}
            <div className="p-4 rounded-2xl bg-[#0b0805]/95 border border-[#c9a15d]/25 text-center shadow-inner">
              <span className="text-[10px] font-mono text-[#a3927a] uppercase block">Synthesized Evidence Confidence</span>
              <span className="text-3xl font-mono font-black text-[#f0d28f] mt-1 block">87.4%</span>
              <span className="text-[10px] text-[#7a6a55] font-mono">Weighted Multi-Source Bayesian Posterior</span>
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
            <span>Proceed to Situational Reasoning ("WHY?")</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
