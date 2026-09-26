import React, { useState } from 'react';
import { GitCommit, CheckCircle2, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import type { InterventionAction } from '../../types';

interface ScriptStage {
  stage: number;
  name: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  riskScore: number;
  description: string;
}

const STAGES: ScriptStage[] = [
  { stage: 1, name: 'Reconnaissance & Prep', status: 'COMPLETED', riskScore: 25, description: 'Off-hours badge scanning & camera loitering' },
  { stage: 2, name: 'Perimeter Infiltration', status: 'COMPLETED', riskScore: 65, description: 'Tailgating through Server Room Door #02' },
  { stage: 3, name: 'Custody Change / Breach', status: 'IN_PROGRESS', riskScore: 94, description: 'Unattended bag picked up at Cafe Table 4' },
  { stage: 4, name: 'Exfiltration & Exit', status: 'PENDING', riskScore: 98, description: 'Rapid movement towards East Transit Exit' }
];

interface CrimeScriptPlannerProps {
  onSimulate?: (action: InterventionAction) => void;
}

export const CrimeScriptPlanner: React.FC<CrimeScriptPlannerProps> = ({ onSimulate }) => {
  const [activeAction, setActiveAction] = useState<InterventionAction>('MONITOR');
  const [auditSigned, setAuditSigned] = useState<boolean>(false);

  const handleApplyAction = (action: InterventionAction) => {
    setActiveAction(action);
    setAuditSigned(true);
    if (onSimulate) onSimulate(action);
  };

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-6 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl space-y-6 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-4 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_16px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center text-[#f0d28f]">
              <GitCommit className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#fff6e4] flex items-center gap-2">
              Endsley Level 3 Crime Script & Response Planner
              <span className="text-[10px] font-mono uppercase bg-[#3a2814]/70 text-[#f0d28f] border border-[#c9a15d]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#f0d28f] animate-spin" />
                FORECAST ENGINE
              </span>
            </h3>
            <p className="text-xs text-[#a3927a]">Projecting impending threat trajectory stages & calculating counterfactual intervention deltas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0a0704]/90 px-4 py-2 rounded-2xl border border-[#c9a15d]/25 shadow-inner">
          <div className="text-right">
            <span className="text-xs font-mono text-[#a3927a] block">ESTIMATED PEAK RISK</span>
            <span className="text-2xl font-mono font-black text-rose-400">94.2</span>
            <span className="text-xs font-mono text-[#7a6a55]"> / 100</span>
          </div>
        </div>
      </div>

      {/* 4-Stage Crime Script Timeline */}
      <div>
        <label className="block text-[11px] font-mono text-[#f0d28f] uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#c9a15d]" />
          Incident Progression Script Stages
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {STAGES.map((s) => (
            <div
              key={s.stage}
              className={`p-4 rounded-2xl border transition-all ${
                s.status === 'IN_PROGRESS'
                  ? 'bg-gradient-to-b from-rose-950/60 to-[#140808]/90 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : s.status === 'COMPLETED'
                  ? 'bg-gradient-to-b from-[#140e08]/90 to-[#080503] border-[#c9a15d]/25'
                  : 'bg-[#0a0704]/60 border-[#c9a15d]/10 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#a3927a]">STAGE {s.stage}</span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  s.status === 'IN_PROGRESS'
                    ? 'bg-rose-500 text-white shadow-sm animate-pulse'
                    : s.status === 'COMPLETED'
                    ? 'bg-[#2a1d0f] text-[#f0d28f] border border-[#c9a15d]/40'
                    : 'bg-[#140e08] text-[#7a6a55]'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="text-xs font-bold text-[#fff6e4] mb-1.5">{s.name}</div>
              <div className="text-[10px] text-[#a3927a] leading-relaxed">{s.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Counterfactual Action Comparison Bars */}
      <div className="p-5 rounded-3xl bg-[#0b0805]/95 border border-[#c9a15d]/25 space-y-4 shadow-inner">
        <span className="text-xs font-mono font-bold text-[#fff6e4] uppercase tracking-wider block flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#f0d28f]" />
          Counterfactual Action Comparison (Simulate Operator Choices)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* MONITOR */}
          <button
            onClick={() => handleApplyAction('MONITOR')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'MONITOR'
                ? 'bg-gradient-to-b from-[#3d2710] to-[#1f1408] border-[#f0d28f]/70 text-[#fff6e4] shadow-[0_0_18px_rgba(240,210,143,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="text-xs font-bold text-[#f0d28f] mb-1">MONITOR ONLY</div>
            <div className="text-xl font-mono font-bold text-[#f0d28f] mb-1">94.2 Risk</div>
            <div className="text-[10px] text-[#a3927a]">Zero operational disruption. Threat continues progressing to Stage 4.</div>
          </button>

          {/* ISOLATE */}
          <button
            onClick={() => handleApplyAction('ISOLATE')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'ISOLATE'
                ? 'bg-gradient-to-b from-[#2d2212] to-[#140e06] border-[#c9a15d]/70 text-[#fff6e4] shadow-[0_0_18px_rgba(201,161,93,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="text-xs font-bold text-[#fff6e4] mb-1">ISOLATE SECTOR B</div>
            <div className="text-xl font-mono font-bold text-[#f0d28f] mb-1">32.4 Risk (-61.8%)</div>
            <div className="text-[10px] text-[#a3927a]">Locks East Transit Corridor doors. Restricts suspect exfiltration.</div>
          </button>

          {/* LOCKDOWN */}
          <button
            onClick={() => handleApplyAction('LOCKDOWN')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'LOCKDOWN'
                ? 'bg-gradient-to-b from-rose-950/70 to-[#1f0b0b] border-rose-500/70 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]'
                : 'bg-[#120d08] border-[#c9a15d]/20 hover:border-[#c9a15d]/40 text-[#a3927a]'
            }`}
          >
            <div className="text-xs font-bold text-rose-300 mb-1">FULL CAMPUS LOCKDOWN</div>
            <div className="text-xl font-mono font-bold text-rose-400 mb-1">12.0 Risk (-87.2%)</div>
            <div className="text-[10px] text-[#a3927a]">Secures all physical turnstiles & network firewalls immediately.</div>
          </button>

        </div>

        {/* Cryptographic Hash Signing Notice */}
        {auditSigned && (
          <div className="p-3.5 rounded-2xl bg-[#140e08] border border-[#c9a15d]/30 flex items-center justify-between text-xs font-mono text-[#f0d28f]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f0d28f]" />
              Decision Signed to Immutable Hash Ledger: SHA256-e8f9021a...
            </span>
            <span className="text-[10px] bg-[#2a1d0f] px-2.5 py-0.5 rounded-full text-[#f0d28f] border border-[#c9a15d]/40">VERIFIED</span>
          </div>
        )}
      </div>

    </div>
  );
};
