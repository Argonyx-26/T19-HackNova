import React from 'react';
import type { ATTACKMapping } from '../../types';
import { Crosshair, ShieldCheck, Tag } from 'lucide-react';

interface MitreAttackPanelProps {
  mappings: ATTACKMapping[];
}

export const MitreAttackPanel: React.FC<MitreAttackPanelProps> = ({ mappings }) => {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            MITRE ATT&CK Matrix Evidence
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
          {mappings.length} Techniques
        </span>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {mappings.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No adversary ATT&CK techniques mapped to current situation evidence.
          </div>
        ) : (
          mappings.map((m) => (
            <div
              key={m.mapping_id}
              className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg hover:border-cyan-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {m.technique_id}
                  </span>
                  <span className="text-xs font-semibold text-neutral-200">
                    {m.technique_name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  Tactic: <strong className="text-cyan-400">{m.tactic}</strong>
                </span>
              </div>

              <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
                {m.evidence}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/50">
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-neutral-400" />
                  <span>Events: <strong className="text-neutral-300">{m.event_ids.join(', ')}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono font-bold">
                    {(m.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
