import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { EvidenceShadow, EvidenceItem } from '../../types';

interface EvidenceShadowPanelProps {
  shadowData?: EvidenceShadow | null;
  onInspectEvent?: (eventId: string) => void;
}

export const EvidenceShadowPanel: React.FC<EvidenceShadowPanelProps> = ({
  shadowData,
  onInspectEvent: _onInspectEvent
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUPPORTING' | 'CONTRADICTORY' | 'MISSING'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!shadowData) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-center text-neutral-400">
        <Cpu className="w-8 h-8 mx-auto mb-2 text-cyan-500/40 animate-pulse" />
        <p className="text-sm font-mono">Synthesizing Evidence Shadow telemetry...</p>
      </div>
    );
  }

  const {
    situation_id: _situation_id,
    overall_confidence,
    decision_model_used,
    supporting_evidence = [],
    contradictory_evidence = [],
    missing_evidence = [],
    source_health_summary = {},
    calculated_at: _calculated_at
  } = shadowData;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderBadge = (type: string) => {
    switch (type) {
      case 'SUPPORTING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>SUPPORTING</span>
          </span>
        );
      case 'CONTRADICTORY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>CONTRADICTORY / CONFLICT</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>MISSING EXPECTED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const allItems: EvidenceItem[] = [
    ...supporting_evidence,
    ...contradictory_evidence,
    ...missing_evidence
  ];

  const filteredItems =
    activeTab === 'ALL'
      ? allItems
      : activeTab === 'SUPPORTING'
      ? supporting_evidence
      : activeTab === 'CONTRADICTORY'
      ? contradictory_evidence
      : missing_evidence;

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header with Signature Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
              <span>EVIDENCE SHADOW</span>
              <span className="text-[11px] font-mono text-neutral-400 font-normal">
                // WHY THE SYSTEM BELIEVES THIS
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Transparent multi-modal audit trail: verified indicators, conflicting observations, and absent signals.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-400">Confidence:</span>
            <strong className="text-cyan-300 font-bold">{(overall_confidence * 100).toFixed(0)}%</strong>
          </div>

          <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-neutral-400">Model:</span>
            <span className="text-neutral-200">{decision_model_used}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800/80 text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'ALL'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Items ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab('SUPPORTING')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'SUPPORTING'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                : 'text-neutral-400 hover:text-emerald-300'
            }`}
          >
            Supporting ({supporting_evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('CONTRADICTORY')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'CONTRADICTORY'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                : 'text-neutral-400 hover:text-amber-300'
            }`}
          >
            Contradictions ({contradictory_evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('MISSING')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'MISSING'
                ? 'bg-sky-950/80 text-sky-300 border border-sky-800/50'
                : 'text-neutral-400 hover:text-sky-300'
            }`}
          >
            Missing ({missing_evidence.length})
          </button>
        </div>

        {/* Source Health Mini-Badges */}
        <div className="hidden xl:flex items-center space-x-2 text-[10px] font-mono text-neutral-400">
          <span>Feeds:</span>
          {Object.entries(source_health_summary).map(([src, status]) => (
            <span
              key={src}
              className={`px-1.5 py-0.5 rounded border ${
                status === 'ONLINE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {src}: {status}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence Items List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.evidence_id;
          return (
            <div
              key={item.evidence_id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.evidence_type === 'CONTRADICTORY'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : item.evidence_type === 'MISSING'
                  ? 'bg-sky-950/20 border-sky-500/30'
                  : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(item.evidence_id)}
              >
                <div className="flex items-center space-x-3">
                  {renderBadge(item.evidence_type)}
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400 font-normal">
                        [{item.source_modality}]
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-neutral-400">
                  <span className="text-[11px] text-cyan-300">
                    Conf: {(item.confidence * 100).toFixed(0)}%
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Expanded Detail Tray */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs space-y-2">
                  <p className="text-neutral-300 leading-relaxed font-sans">{item.detail}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-neutral-400 pt-1">
                    {item.event_id && (
                      <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                        Event: {item.event_id}
                      </span>
                    )}
                    {item.location_id && (
                      <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                        Location: {item.location_id}
                      </span>
                    )}
                    {item.entity_id && (
                      <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                        Entity: {item.entity_id}
                      </span>
                    )}
                    <span className="text-neutral-500">
                      Source Health: <strong className="text-neutral-300">{item.source_health_status}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
