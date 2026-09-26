import React from 'react';
import type { ATTACKMapping } from '../../types';
import { Crosshair, ShieldCheck, Tag } from 'lucide-react';

interface MitreAttackPanelProps {
  mappings: ATTACKMapping[];
}

export const MitreAttackPanel: React.FC<MitreAttackPanelProps> = ({ mappings }) => {
  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl font-sans select-none">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c9a15d]/20">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_12px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[13px] flex items-center justify-center text-[#f0d28f]">
              <Crosshair className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xs font-bold tracking-wider text-[#fff6e4] uppercase">
            MITRE ATT&CK Matrix Evidence
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#3a2814] border border-[#c9a15d]/40 text-[#f0d28f]">
          {mappings.length} Techniques
        </span>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {mappings.length === 0 ? (
          <div className="text-center py-8 text-[#7a6a55] text-xs font-mono">
            No adversary ATT&CK techniques mapped to current situation evidence.
          </div>
        ) : (
          mappings.map((m) => (
            <div
              key={m.mapping_id}
              className="p-3.5 bg-[#0d0905]/80 border border-[#c9a15d]/20 rounded-2xl hover:border-[#c9a15d]/50 transition-colors shadow-inner"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3a2814] text-[#f0d28f] border border-[#c9a15d]/40">
                    {m.technique_id}
                  </span>
                  <span className="text-xs font-semibold text-[#fff6e4]">
                    {m.technique_name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c140c] text-[#a3927a]">
                  Tactic: <strong className="text-[#f0d28f]">{m.tactic}</strong>
                </span>
              </div>

              <p className="text-xs text-[#a3927a] mb-2 leading-relaxed">
                {m.evidence}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#7a6a55] pt-1.5 border-t border-[#c9a15d]/15">
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-[#a3927a]" />
                  <span>Events: <strong className="text-[#d5c7b3]">{m.event_ids.join(', ')}</strong></span>
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
