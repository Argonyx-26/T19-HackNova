import React from 'react';
import { Shield, Radio, RefreshCw, Play, Square } from 'lucide-react';
import type { SituationState } from '../../types';

interface HeaderProps {
  systemStatus: string;
  activeState: SituationState;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  activeState,
  isSimulating,
  onToggleSimulation,
  onRefresh,
  isLoading,
}) => {
  const getStateBadge = (state: SituationState) => {
    switch (state) {
      case 'CRITICAL':
        return 'bg-state-critical-bg text-state-critical-text border-state-critical-border animate-pulse';
      case 'ESCALATING':
        return 'bg-state-escalating-bg text-state-escalating-text border-state-escalating-border';
      case 'SUSPICIOUS':
        return 'bg-state-suspicious-bg text-state-suspicious-text border-state-suspicious-border';
      case 'ANOMALOUS':
        return 'bg-state-anomalous-bg text-state-anomalous-text border-state-anomalous-border';
      case 'CONTAINED':
        return 'bg-state-contained-bg text-state-contained-text border-state-contained-border';
      default:
        return 'bg-state-normal-bg text-state-normal-text border-state-normal-border';
    }
  };

  return (
    <header className="h-16 bg-sentinel-surface border-b border-sentinel-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold tracking-wider text-lg text-white">SENTINEL-X</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sentinel-card border border-sentinel-border text-slate-400">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">From Alerts to Situations</p>
          </div>
        </div>

        {/* Global Situation State Pill */}
        <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${getStateBadge(activeState)} flex items-center space-x-2`}>
          <Radio className="w-3.5 h-3.5" />
          <span>SITUATION: {activeState}</span>
        </div>
      </div>

      {/* Operator Status & Actions */}
      <div className="flex items-center space-x-3">
        {/* Scenario Streamer Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
            isSimulating
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'HALT SCENARIO' : 'PLAY SCENARIO'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-sentinel-card border border-sentinel-border text-slate-300 hover:text-white hover:border-sentinel-highlight transition disabled:opacity-50"
          title="Refresh Operational State"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* System Online Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sentinel-bg border border-sentinel-border text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{systemStatus.toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
};
