import React from 'react';
import {
  Shuffle,
  ArrowRight
} from 'lucide-react';
import type { TopologyConflict } from '../../types';

interface TopologyConflictPanelProps {
  conflicts?: TopologyConflict[];
}

export const TopologyConflictPanel: React.FC<TopologyConflictPanelProps> = ({
  conflicts = []
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'DATA_ERROR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            DATA ERROR
          </span>
        );
      case 'TOPOLOGY_ERROR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            TOPOLOGY ERROR
          </span>
        );
      case 'SECURITY_THREAT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            SECURITY THREAT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            TOPOLOGY CONFLICT
          </span>
        );
    }
  };

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
              <span>TOPOLOGY CONFLICT ENGINE</span>
              <span className="text-[11px] font-mono text-neutral-400 font-normal">
                // DATA DISCREPANCY VS REAL THREAT
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Differentiates physical/network infrastructure inconsistencies from genuine adversary behavior.
          </p>
        </div>

        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
          Detected Conflicts: <strong className="text-amber-400">{conflicts.length}</strong>
        </span>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-neutral-500 border border-neutral-800/60 rounded-xl bg-neutral-950/40">
          Zero topology conflicts detected. Physical mapping and network telemetry are consistent.
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conf) => (
            <div
              key={conf.conflict_id}
              className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/90 space-y-2 hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Shuffle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-neutral-200 font-mono">
                    {conf.conflict_type}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    [Entity: {conf.entity_id}]
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {getCategoryBadge(conf.category)}
                  <span className="text-[10px] font-mono text-neutral-400">
                    Conf: {(conf.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/60">
                {conf.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center space-x-1.5 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  <span className="text-neutral-500">Reported:</span>
                  <span className="text-rose-400">{conf.reported_location}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-neutral-600" />
                <div className="flex items-center space-x-1.5 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  <span className="text-neutral-500">Expected:</span>
                  <span className="text-cyan-400">{conf.expected_location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
