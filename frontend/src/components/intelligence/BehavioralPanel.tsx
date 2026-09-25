import React from 'react';
import type { BehavioralAnomaly } from '../../types';
import { UserCheck, AlertTriangle, Clock } from 'lucide-react';

interface BehavioralPanelProps {
  anomalies: BehavioralAnomaly[];
}

export const BehavioralPanel: React.FC<BehavioralPanelProps> = ({ anomalies }) => {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            Behavioral Anomaly & Profile Deviations
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300">
          {anomalies.length} Flagged Deviations
        </span>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            All observed entity activity strictly conforms to historical behavioral profiles.
          </div>
        ) : (
          anomalies.map((a) => (
            <div
              key={a.anomaly_id}
              className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg hover:border-amber-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-neutral-200">
                    {a.entity_id}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                    Baseline: {a.baseline_id}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    Deviation: {(a.deviation_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1 my-2">
                {a.anomaly_factors.map((f, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/50">
                <span>Trigger Event: <strong className="text-neutral-400">{a.trigger_event_id}</strong></span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
