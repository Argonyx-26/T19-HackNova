import React, { useState, useEffect } from 'react';
import type { ThreatIntelligenceIndicator, IndicatorCategory, IntelRelevance } from '../../types';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Globe,
  Server,
  Hash,
  Activity,
  Layers,
  Search,
  AlertTriangle,
  Link as LinkIcon,
  RefreshCw,
  Radio
} from 'lucide-react';

interface IntelligenceRelevancePanelProps {
  situationId?: string;
  onSelectIndicator?: (ioc: ThreatIntelligenceIndicator) => void;
}

const CATEGORIES: { id: IndicatorCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Domains' },
  { id: 'NETWORK_OBSERVABLE', label: 'Network & Host' },
  { id: 'BEHAVIORAL', label: 'Behavioral TTPs' },
  { id: 'KNOWLEDGE', label: 'Threat Knowledge' },
  { id: 'ENVIRONMENTAL', label: 'Environmental / Physical' },
];

export const IntelligenceRelevancePanel: React.FC<IntelligenceRelevancePanelProps> = ({
  situationId,
  onSelectIndicator
}) => {
  const [indicators, setIndicators] = useState<ThreatIntelligenceIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'ALL'>('ALL');
  const [selectedRelevance, setSelectedRelevance] = useState<IntelRelevance | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (situationId) {
        const rel = await api.getThreatIntelRelevance(situationId);
        const combined = [
          ...(rel.related || []),
          ...(rel.possibly_related || []),
          ...(rel.unrelated || [])
        ];
        setIndicators(combined);
      } else {
        const all = await api.getThreatIntelIndicators();
        setIndicators(all);
      }
    } catch (err) {
      console.error('Failed to load threat intel indicators', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [situationId]);

  const filteredIndicators = indicators.filter((ioc) => {
    if (selectedCategory !== 'ALL' && ioc.category !== selectedCategory) return false;
    if (selectedRelevance !== 'ALL' && ioc.relevance !== selectedRelevance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVal = ioc.value.toLowerCase().includes(q);
      const matchType = ioc.indicator_type.toLowerCase().includes(q);
      const matchCtx = ioc.context.toLowerCase().includes(q);
      const matchActor = (ioc.threat_actor || '').toLowerCase().includes(q);
      return matchVal || matchType || matchCtx || matchActor;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IP':
      case 'ENDPOINT':
      case 'DEVICE':
        return <Server className="w-3.5 h-3.5 text-[#f0d28f]" />;
      case 'DOMAIN':
      case 'URL':
        return <Globe className="w-3.5 h-3.5 text-[#c9a15d]" />;
      case 'HASH':
      case 'PAYLOAD':
        return <Hash className="w-3.5 h-3.5 text-amber-400" />;
      case 'PHYSICAL_ZONE':
      case 'BADGE_ANOMALY':
        return <Radio className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getRelevanceBadge = (rel: IntelRelevance) => {
    switch (rel) {
      case 'RELATED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/70 text-rose-300 border border-rose-500/40">
            RELATED (Direct)
          </span>
        );
      case 'POSSIBLY_RELATED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-500/40">
            POSSIBLY RELATED
          </span>
        );
      case 'UNRELATED':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#140e08] text-[#7a6a55] border border-[#c9a15d]/20">
            UNRELATED (Background)
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'CRITICAL':
        return 'text-rose-300 border-rose-500/40 bg-rose-950/60';
      case 'HIGH':
        return 'text-[#f0d28f] border-[#c9a15d]/40 bg-[#2a1d0f]';
      case 'MEDIUM':
        return 'text-amber-300 border-amber-500/40 bg-amber-950/60';
      default:
        return 'text-[#a3927a] border-[#c9a15d]/20 bg-[#140e08]';
    }
  };

  const relatedCount = indicators.filter((i) => i.relevance === 'RELATED').length;
  const possiblyCount = indicators.filter((i) => i.relevance === 'POSSIBLY_RELATED').length;
  const unrelatedCount = indicators.filter((i) => i.relevance === 'UNRELATED').length;

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl flex flex-col space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#c9a15d]/20">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_14px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[13px] flex items-center justify-center text-[#f0d28f]">
              <Layers className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#fff6e4] uppercase flex items-center gap-2">
              Threat Intelligence & Relevance Engine
            </h3>
            <p className="text-[11px] text-[#a3927a]">
              Cyber-Physical Threat Correlation & Context Triaging
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          title="Refresh Intel"
          className="p-1.5 rounded-xl bg-[#140e08] hover:bg-[#20160c] text-[#a3927a] hover:text-[#fff6e4] border border-[#c9a15d]/20 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f0d28f]' : ''}`} />
        </button>
      </div>

      {/* Attribution Caution Banner */}
      <div className="px-3.5 py-2.5 bg-amber-950/40 border border-amber-500/35 rounded-2xl flex items-start space-x-2.5 text-[11px] text-amber-200 shadow-inner">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="font-semibold text-amber-300">Attribution Notice: </span>
          Threat actor attribution is probabilistic and strictly UNCONFIRMED without multi-source forensic evidence. IOC relevance is computed per-situation graph.
        </div>
      </div>

      {/* Relevance Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setSelectedRelevance(selectedRelevance === 'RELATED' ? 'ALL' : 'RELATED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedRelevance === 'RELATED'
              ? 'bg-gradient-to-b from-rose-950/70 to-[#1b0808] border-rose-500/70 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
              : 'bg-[#0d0905]/80 border-[#c9a15d]/20 hover:border-[#c9a15d]/40'
          }`}
        >
          <div className="text-[10px] text-[#a3927a] uppercase font-mono font-bold">Directly Correlated</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-0.5">{relatedCount}</div>
          <div className="text-[10px] text-rose-300/80">Matched to current graph</div>
        </button>

        <button
          onClick={() => setSelectedRelevance(selectedRelevance === 'POSSIBLY_RELATED' ? 'ALL' : 'POSSIBLY_RELATED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedRelevance === 'POSSIBLY_RELATED'
              ? 'bg-gradient-to-b from-amber-950/70 to-[#1f1305] border-amber-500/70 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
              : 'bg-[#0d0905]/80 border-[#c9a15d]/20 hover:border-[#c9a15d]/40'
          }`}
        >
          <div className="text-[10px] text-[#a3927a] uppercase font-mono font-bold">Possibly Related</div>
          <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{possiblyCount}</div>
          <div className="text-[10px] text-amber-300/80">Actor/temporal overlap</div>
        </button>

        <button
          onClick={() => setSelectedRelevance(selectedRelevance === 'UNRELATED' ? 'ALL' : 'UNRELATED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedRelevance === 'UNRELATED'
              ? 'bg-gradient-to-b from-[#2a1d0f] to-[#120d08] border-[#f0d28f]/60 text-[#fff6e4]'
              : 'bg-[#0d0905]/80 border-[#c9a15d]/20 hover:border-[#c9a15d]/40'
          }`}
        >
          <div className="text-[10px] text-[#a3927a] uppercase font-mono font-bold">Background / Noise</div>
          <div className="text-xl font-black text-[#a3927a] font-mono mt-0.5">{unrelatedCount}</div>
          <div className="text-[10px] text-[#7a6a55]">Unconnected telemetry</div>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-[#c9a15d]/15 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-[11px] font-mono font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-b from-[#4d351a] to-[#201509] text-[#fff6e4] border border-[#f0d28f]/60 shadow-sm'
                : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#7a6a55]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by indicator value, technique, context, actor..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#0b0805] border border-[#c9a15d]/25 rounded-2xl text-[#fff6e4] placeholder-[#7a6a55] focus:outline-none focus:border-[#f0d28f] transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-[10px] text-[#a3927a] hover:text-[#fff6e4] cursor-pointer"
          >
            clear
          </button>
        )}
      </div>

      {/* Indicator List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-10 text-[#7a6a55] text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#f0d28f]" />
            <span>Triaging threat intelligence stream...</span>
          </div>
        ) : filteredIndicators.length === 0 ? (
          <div className="text-center py-8 text-[#7a6a55] text-xs bg-[#0b0805]/50 rounded-2xl border border-dashed border-[#c9a15d]/20 font-mono">
            No indicators match the selected filters.
          </div>
        ) : (
          filteredIndicators.map((ioc) => (
            <div
              key={ioc.indicator_id}
              onClick={() => onSelectIndicator?.(ioc)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                ioc.relevance === 'RELATED'
                  ? 'bg-gradient-to-b from-rose-950/40 to-[#120606] border-rose-500/40 hover:border-rose-500/70 shadow-sm'
                  : ioc.relevance === 'POSSIBLY_RELATED'
                  ? 'bg-gradient-to-b from-amber-950/30 to-[#140c04] border-amber-500/40 hover:border-amber-500/70'
                  : 'bg-[#0d0905]/70 border-[#c9a15d]/15 hover:border-[#c9a15d]/40 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {getTypeIcon(ioc.indicator_type)}
                  <span className="font-mono text-xs font-bold text-[#fff6e4] break-all">
                    {ioc.value}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c140c] text-[#a3927a] border border-[#c9a15d]/20">
                    {ioc.indicator_type}
                  </span>
                </div>
                <div>{getRelevanceBadge(ioc.relevance)}</div>
              </div>

              <p className="text-xs text-[#a3927a] mb-2 leading-relaxed">
                {ioc.context}
              </p>

              {/* Cyber-Physical Link Pill (if any) */}
              {ioc.linked_physical_behavior && (
                <div className="mb-2 px-2.5 py-1 rounded-xl bg-[#2a1d0f] border border-[#c9a15d]/40 flex items-center space-x-1.5 text-[11px] text-[#f0d28f]">
                  <LinkIcon className="w-3 h-3 text-[#f0d28f]" />
                  <span>Linked Physical Behavior: <strong className="font-mono">{ioc.linked_physical_behavior}</strong></span>
                </div>
              )}

              {/* Footer Meta */}
              <div className="flex items-center justify-between text-[11px] text-[#7a6a55] pt-2 border-t border-[#c9a15d]/15">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-rose-300">
                    {ioc.threat_actor ? `Actor: ${ioc.threat_actor}` : 'Unattributed'}
                  </span>
                  {ioc.campaign && (
                    <span className="text-[#a3927a]">
                      Campaign: {ioc.campaign}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${getConfidenceBadge(
                      ioc.confidence
                    )}`}
                  >
                    {ioc.confidence} CONF
                  </span>
                  <div className="flex items-center space-x-1 text-[#a3927a]">
                    <Activity className="w-3 h-3 text-[#f0d28f]" />
                    <span className="font-mono">{ioc.match_count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
