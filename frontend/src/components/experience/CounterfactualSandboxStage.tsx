import React, { useState } from 'react';
import { Shield, Lock, Radio, ArrowRight, Sparkles, Cpu } from 'lucide-react';
import type { InterventionAction } from '../../types';

interface CounterfactualSandboxStageProps {
  onEnterCommandCenter?: () => void;
  onSimulate?: (action: InterventionAction) => Promise<any> | void;
}

export const CounterfactualSandboxStage: React.FC<CounterfactualSandboxStageProps> = ({
  onEnterCommandCenter,
  onSimulate
}) => {
  const [selectedAction, setSelectedAction] = useState<InterventionAction>('ISOLATE');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelectAction = async (action: InterventionAction) => {
    setSelectedAction(action);
    setIsSimulating(true);
    if (onSimulate) {
      await onSimulate(action);
    }
    setTimeout(() => setIsSimulating(false), 500);
  };

  const actions = [
    { id: 'MONITOR' as InterventionAction, label: 'MONITOR ONLY', icon: Radio, riskScore: '94.2%', riskDelta: '0%', color: 'border-[#c9a15d]/30 text-[#f0d28f]', desc: 'Zero operational disruption. Threat trajectory continues unimpeded.' },
    { id: 'ISOLATE' as InterventionAction, label: 'ISOLATE SECTOR B', icon: Lock, riskScore: '32.4%', riskDelta: '-61.8%', color: 'border-cyan-500/50 text-cyan-300', desc: 'Locks East Transit corridor & isolates Sector B switch VLAN.' },
    { id: 'LOCKDOWN' as InterventionAction, label: 'FULL CAMPUS LOCKDOWN', icon: Shield, riskScore: '12.0%', riskDelta: '-87.2%', color: 'border-rose-500/50 text-rose-300', desc: 'Immediate physical turnstile lockout and total network firewall quarantine.' }
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center font-sans select-none text-center">
      {/* Top Section Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c140c] border border-[#c9a15d]/40 text-[#f0d28f] text-[11px] font-mono uppercase tracking-widest mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#f0d28f] animate-spin" />
        <span>Phase 9 • Counterfactual Response Sandbox ("WHAT IF?")</span>
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#fff6e4] tracking-tight font-serif mb-3">
        Simulate Operator Interventions in Sandbox
      </h2>
      <p className="text-xs md:text-sm text-[#a3927a] max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
        Evaluate projected risk reduction versus collateral disruption before executing critical cyber-physical countermeasures.
      </p>

      {/* Action Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-6">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedAction === act.id;

          return (
            <button
              key={act.id}
              onClick={() => handleSelectAction(act.id)}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-inner ${
                isSelected
                  ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] border-[#f0d28f] shadow-[0_0_24px_rgba(240,210,143,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]'
                  : 'bg-[#0d0905]/90 border-[#c9a15d]/20 hover:border-[#c9a15d]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#2a1d0f] flex items-center justify-center text-[#f0d28f]">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  act.riskDelta === '0%' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {act.riskDelta}
                </span>
              </div>

              <div className="text-xs font-bold text-[#fff6e4] font-mono mb-1">{act.label}</div>
              <div className="text-2xl font-mono font-black text-[#f0d28f] mb-1.5">{act.riskScore} <span className="text-xs font-normal text-[#a3927a]">Risk</span></div>
              <p className="text-[11px] text-[#a3927a] leading-relaxed">{act.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Trajectory Mutation Visual */}
      <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0b0805]/95 border border-[#c9a15d]/30 text-left shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-3 flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-[#f0d28f] uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#f0d28f]" />
            Active Counterfactual Simulation: {selectedAction}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
            {isSimulating ? 'RECALCULATING DELTA...' : 'DELTA COMPUTED'}
          </span>
        </div>

        {/* Causal Outcome Bar */}
        <div className="p-4 rounded-2xl bg-[#120d08] border border-[#c9a15d]/20 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#a3927a] uppercase block">Resulting State</span>
            <span className="text-base font-bold text-[#fff6e4] font-mono">
              {selectedAction === 'MONITOR' ? 'Trajectory: ACTIVE ESCALATION' : 'Trajectory: STABILIZED & CONTAINED'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#a3927a] block">Blast Radius</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {selectedAction === 'MONITOR' ? '12 Assets' : selectedAction === 'ISOLATE' ? '2 Assets (-83%)' : '0 Assets (-100%)'}
              </span>
            </div>
            <div className="text-right pl-3 border-l border-[#c9a15d]/20">
              <span className="text-[10px] font-mono text-[#a3927a] block">Decision Signature</span>
              <span className="text-xs font-mono text-[#f0d28f]">SHA256-e8f902...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enter Command Center Final CTA */}
      {onEnterCommandCenter && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={onEnterCommandCenter}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#c9a15d] via-[#f0d28f] to-[#c9a15d] hover:from-[#d8b06c] hover:to-[#ffdf9e] text-[#050403] text-sm font-mono font-black shadow-[0_0_30px_rgba(201,161,93,0.45),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
          >
            <span>ENTER FULL COMMAND CENTER</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-mono text-[#7a6a55]">Full operational workspace with vision wall, graph topology, and real-time sensor streams</span>
        </div>
      )}
    </div>
  );
};
