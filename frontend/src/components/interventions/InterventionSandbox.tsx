import React, { useState } from 'react';
import { Sliders, ShieldCheck, Lock, Eye, PlayCircle } from 'lucide-react';
import type { InterventionAction, SimulatedIntervention } from '../../types';

interface InterventionSandboxProps {
  onSimulate: (action: InterventionAction) => Promise<SimulatedIntervention | null>;
  activeSimulation: SimulatedIntervention | null;
  isLoading: boolean;
}

export const InterventionSandbox: React.FC<InterventionSandboxProps> = ({
  onSimulate,
  activeSimulation,
  isLoading,
}) => {
  const [selectedAction, setSelectedAction] = useState<InterventionAction>('ISOLATE');

  const actions: { id: InterventionAction; label: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'MONITOR',
      label: 'MONITOR',
      desc: 'Passive surveillance without active intervention',
      icon: Eye,
      color: 'border-slate-500 hover:border-slate-400 text-slate-300',
    },
    {
      id: 'ISOLATE',
      label: 'ISOLATE',
      desc: 'Sever endpoint IP and suspend active badge credentials',
      icon: ShieldCheck,
      color: 'border-cyan-500 hover:border-cyan-400 text-cyan-300',
    },
    {
      id: 'LOCKDOWN',
      label: 'LOCKDOWN',
      desc: 'Seal physical access doors and VLAN-quarantine facility zone',
      icon: Lock,
      color: 'border-rose-500 hover:border-rose-400 text-rose-300',
    },
  ];

  const handleRunSimulation = (action: InterventionAction) => {
    setSelectedAction(action);
    onSimulate(action);
  };

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Counterfactual "What-If" Simulation Sandbox
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
          Simulation Only • Zero Live Controls
        </span>
      </div>

      {/* Action Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedAction === act.id;
          return (
            <button
              key={act.id}
              onClick={() => handleRunSimulation(act.id)}
              disabled={isLoading}
              className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-sentinel-card border-cyan-400 shadow-md shadow-cyan-950/50'
                  : 'bg-sentinel-bg/60 border-sentinel-border/70 hover:bg-sentinel-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold tracking-wider text-white">
                    {act.label}
                  </span>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-snug">{act.desc}</p>
              <div className="pt-1 text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                <PlayCircle className="w-3 h-3" />
                <span>Run Simulation</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulated Outcome Display */}
      {activeSimulation && (
        <div className="p-4 rounded-lg bg-sentinel-card border border-sentinel-border/80 space-y-3">
          <div className="flex items-center justify-between border-b border-sentinel-border/60 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">SIMULATED OUTCOME FOR:</span>
              <span className="text-xs font-mono font-bold text-cyan-300">[{activeSimulation.action}]</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="text-slate-400">
                State: <strong className="text-white">{activeSimulation.current_state}</strong> →{' '}
                <strong className="text-emerald-400">{activeSimulation.projected_state}</strong>
              </span>
              <span className="text-slate-400">
                Risk Delta:{' '}
                <strong className={activeSimulation.risk_delta <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {activeSimulation.risk_delta > 0 ? `+${activeSimulation.risk_delta}` : activeSimulation.risk_delta}
                </strong>
              </span>
              <span className="text-slate-400">
                Impact: <strong className="text-amber-300">{activeSimulation.operational_impact}</strong>
              </span>
            </div>
          </div>

          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            {activeSimulation.impact_assessment}
          </p>
        </div>
      )}
    </div>
  );
};
