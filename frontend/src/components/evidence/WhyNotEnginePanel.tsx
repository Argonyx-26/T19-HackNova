import React from 'react';
import {
  XCircle,
  MapPin,
  Clock,
  UserX,
  Radio,
  Split,
  HelpCircle
} from 'lucide-react';
import type { WhyNotDecision, WhyNotRejectionReason } from '../../types';

interface WhyNotEnginePanelProps {
  decisions?: WhyNotDecision[];
}

export const WhyNotEnginePanel: React.FC<WhyNotEnginePanelProps> = ({
  decisions = []
}) => {
  const renderReasonBadge = (reason: WhyNotRejectionReason) => {
    switch (reason) {
      case 'ENTITY_MISMATCH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
            <UserX className="w-3 h-3" />
            <span>ENTITY MISMATCH</span>
          </span>
        );
      case 'SPATIAL_DISTANCE_EXCEEDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>DISTANCE EXCEEDED</span>
          </span>
        );
      case 'TEMPORAL_WINDOW_EXCEEDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#2a1d0f] text-[#f0d28f] border border-[#c9a15d]/40 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>OUTSIDE TIME WINDOW</span>
          </span>
        );
      case 'SOURCE_RELIABILITY_INSUFFICIENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-950/60 text-orange-300 border border-orange-500/40 flex items-center space-x-1">
            <Radio className="w-3 h-3" />
            <span>LOW SOURCE RELIABILITY</span>
          </span>
        );
      case 'TOPOLOGY_ISOLATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
            <Split className="w-3 h-3" />
            <span>TOPOLOGY ISOLATION</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#140e08] text-[#a3927a] border border-[#c9a15d]/20">
            {reason}
          </span>
        );
    }
  };

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl space-y-4 font-sans select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c9a15d]/20 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_14px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[13px] flex items-center justify-center text-[#f0d28f]">
              <HelpCircle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#fff6e4] font-mono flex items-center space-x-2">
              <span>"WHY NOT?" CORRELATION ENGINE</span>
            </h3>
            <p className="text-[11px] text-[#a3927a]">
              Deterministic explanations for rejected events preventing over-clustering
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#f0d28f] bg-[#1a120a] px-3 py-1 rounded-full border border-[#c9a15d]/30">
          Evaluated Rejections: <strong className="text-rose-400">{decisions.length}</strong>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-[#7a6a55] border border-[#c9a15d]/20 rounded-2xl bg-[#0b0805]/50">
          No rejected candidate events pending audit. Correlation boundary is optimal.
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((dec) => (
            <div
              key={dec.decision_id}
              className="p-4 rounded-2xl bg-[#0b0805]/90 border border-[#c9a15d]/20 hover:border-[#c9a15d]/40 transition-colors space-y-2.5 shadow-inner"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#fff6e4] font-mono">
                    EVENT #{dec.rejected_event_id}
                  </span>
                  <span className="text-[11px] text-[#7a6a55] font-mono">
                    [{dec.rejected_source} // {dec.rejected_event_type}]
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-[#7a6a55]">NOT MERGED INTO:</span>
                  <span className="text-[10px] font-mono text-[#f0d28f] font-bold bg-[#140e08] px-2 py-0.5 rounded-full border border-[#c9a15d]/30">
                    {dec.situation_id}
                  </span>
                </div>
              </div>

              {/* Badges for Rejection Reasons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {dec.reasons.map((r, i) => (
                  <span key={i}>{renderReasonBadge(r)}</span>
                ))}
              </div>

              {/* Natural Language Explanation */}
              <p className="text-xs text-[#d5c7b3] leading-relaxed font-sans bg-[#120d08] p-3 rounded-xl border border-[#c9a15d]/15">
                {dec.explanation}
              </p>

              {/* Quantitative Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#a3927a] pt-0.5">
                {dec.spatial_distance_meters !== undefined && (
                  <span>
                    Spatial Delta: <strong className="text-amber-400">{dec.spatial_distance_meters.toFixed(1)}m</strong> (threshold: {dec.threshold_limits.max_spatial_radius_meters}m)
                  </span>
                )}
                {dec.temporal_gap_seconds !== undefined && (
                  <span>
                    Temporal Gap: <strong className="text-[#f0d28f]">{dec.temporal_gap_seconds.toFixed(0)}s</strong> (window: {dec.threshold_limits.max_temporal_gap_seconds}s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
