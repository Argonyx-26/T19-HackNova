import React from 'react';
import { ShieldAlert, Users, MapPin, Activity, ChevronRight } from 'lucide-react';
import type { Situation, SituationState } from '../../types';

interface SituationStatusCardProps {
  situation: Situation | null;
  onOpenSituation?: () => void;
}

export const SituationStatusCard: React.FC<SituationStatusCardProps> = ({ situation, onOpenSituation }) => {
  if (!situation) {
    return (
      <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-6 text-center text-slate-500 font-mono text-xs">
        No active situation tracked.
      </div>
    );
  }

  const getStateStyles = (state: SituationState) => {
    switch (state) {
      case 'CRITICAL':
        return {
          banner: 'bg-rose-950/40 border-rose-500/40 text-rose-400',
          gauge: 'bg-rose-500',
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      case 'ESCALATING':
        return {
          banner: 'bg-orange-950/40 border-orange-500/40 text-orange-400',
          gauge: 'bg-orange-500',
          badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
        };
      case 'SUSPICIOUS':
        return {
          banner: 'bg-amber-950/40 border-amber-500/40 text-amber-400',
          gauge: 'bg-amber-500',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'ANOMALOUS':
        return {
          banner: 'bg-sky-950/40 border-sky-500/40 text-sky-400',
          gauge: 'bg-sky-500',
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        };
      case 'CONTAINED':
        return {
          banner: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400',
          gauge: 'bg-indigo-500',
          badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
      default:
        return {
          banner: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
          gauge: 'bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const styles = getStateStyles(situation.status);

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 space-y-4">
      {/* Top Bar: Situation Identifier & Risk Meter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Active Situation Analysis
          </h2>
          <span className="text-[10px] font-mono text-slate-500">[{situation.situation_id}]</span>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">THREAT LEVEL:</span>
          <span className="text-sm font-mono font-bold text-white">{(situation.risk_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Hero State Banner */}
      <div className={`p-4 rounded-lg border ${styles.banner} flex items-center justify-between`}>
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest uppercase opacity-75">
            EVALUATED SITUATION STATE
          </div>
          <div className="text-2xl font-mono font-bold tracking-wider flex items-center space-x-3">
            <span>{situation.status}</span>
            {situation.status === 'CRITICAL' && (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500 text-white font-sans animate-pulse">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-mono mt-1 max-w-xl">{situation.summary}</p>
        </div>

        {/* Circular / Bar Risk Gauge */}
        <div className="w-24 text-right space-y-1">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${styles.gauge}`}
              style={{ width: `${Math.round(situation.risk_score * 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Risk Score: {situation.risk_score}</span>
        </div>
      </div>

      {/* Meta Row: Entities & Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-sentinel-card border border-sentinel-border/70 space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>CORRELATED ENTITIES</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {situation.primary_entity_ids.length > 0 ? (
              situation.primary_entity_ids.map((id) => (
                <span key={id} className="text-[11px] font-mono px-2 py-0.5 rounded bg-sentinel-surface border border-sentinel-border text-slate-300">
                  {id}
                </span>
              ))
            ) : (
              <span className="text-[11px] font-mono text-slate-500">None identified</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-sentinel-card border border-sentinel-border/70 space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>IMPACTED FACILITY ZONES</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {situation.location_ids.length > 0 ? (
              situation.location_ids.map((loc) => (
                <span key={loc} className="text-[11px] font-mono px-2 py-0.5 rounded bg-sentinel-surface border border-sentinel-border text-slate-300">
                  {loc}
                </span>
              ))
            ) : (
              <span className="text-[11px] font-mono text-slate-500">None identified</span>
            )}
          </div>
        </div>
      </div>

      {onOpenSituation && (
        <button
          onClick={onOpenSituation}
          className="w-full py-2.5 px-3 bg-red-600/90 hover:bg-red-500 active:bg-red-700 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.98] cursor-pointer border border-red-500/40"
        >
          <span>OPEN SITUATION INTELLIGENCE ROOM</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
