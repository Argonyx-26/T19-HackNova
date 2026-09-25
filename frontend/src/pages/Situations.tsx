import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Situation } from '../types';
import { ShieldAlert } from 'lucide-react';

export const SituationsPage: React.FC = () => {
  const [situations, setSituations] = useState<Situation[]>([]);

  useEffect(() => {
    api.getSituations().then(setSituations).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
          Tracked Situational Incidents
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Historical and active security situations constructed from correlated multi-source events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {situations.map((sit) => (
          <div
            key={sit.situation_id}
            className="p-5 rounded-xl bg-sentinel-surface border border-sentinel-border hover:border-cyan-500/40 transition space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono font-bold text-white">{sit.situation_id}</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded border border-sentinel-border bg-sentinel-card text-cyan-300">
                {sit.status}
              </span>
            </div>

            <p className="text-xs font-mono text-slate-300">{sit.summary}</p>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-sentinel-border/60">
              <span>Risk: {(sit.risk_score * 100).toFixed(0)}%</span>
              <span>Events: {sit.event_count || sit.event_ids?.length || 0}</span>
              <span>Updated: {new Date(sit.updated_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
