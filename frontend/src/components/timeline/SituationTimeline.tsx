import React from 'react';
import { GitCommit, ArrowRight, Clock } from 'lucide-react';
import type { SituationTransition } from '../../types';

interface SituationTimelineProps {
  timeline: SituationTransition[];
}

export const SituationTimeline: React.FC<SituationTimelineProps> = ({ timeline }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ESCALATING':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'SUSPICIOUS':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ANOMALOUS':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'CONTAINED':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Explainable Situation Evolution Timeline
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {timeline.length} Recorded Transitions
        </span>
      </div>

      {timeline.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-slate-500">
          No state transitions recorded yet. Operating at baseline state.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sentinel-border">
          {timeline.map((trans, idx) => (
            <div key={trans.transition_id || idx} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-sentinel-card border-2 border-cyan-400 flex items-center justify-center"></div>

              {/* Transition Card */}
              <div className="p-3.5 rounded-lg bg-sentinel-card border border-sentinel-border/70 hover:border-sentinel-highlight transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded border text-[10px] ${getStateColor(trans.from_state)}`}>
                      {trans.from_state}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`px-2 py-0.5 rounded border text-[10px] ${getStateColor(trans.to_state)}`}>
                      {trans.to_state}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(trans.timestamp).toLocaleTimeString()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-sentinel-surface text-slate-300">
                      Δ Risk: {trans.risk_delta > 0 ? `+${trans.risk_delta}` : trans.risk_delta}
                    </span>
                  </div>
                </div>

                {/* Plain-text Explainability Reason */}
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {trans.reason}
                </p>

                <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                  <span>Triggered by:</span>
                  <span className="text-cyan-400 font-medium">{trans.trigger_event_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
