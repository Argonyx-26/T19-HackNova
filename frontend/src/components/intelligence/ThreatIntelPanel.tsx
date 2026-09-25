import React from 'react';
import type { ThreatIntelligenceIndicator } from '../../types';
import { ShieldAlert, Globe, Server, Hash, Activity } from 'lucide-react';

interface ThreatIntelPanelProps {
  indicators: ThreatIntelligenceIndicator[];
  onSelectIndicator?: (ioc: ThreatIntelligenceIndicator) => void;
}

export const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({ indicators }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IP':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'DOMAIN':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'HASH':
        return <Hash className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            Threat Intelligence (IOC Stream)
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
          {indicators.length} Active Indicators
        </span>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {indicators.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No active threat indicators recorded.
          </div>
        ) : (
          indicators.map((ioc) => (
            <div
              key={ioc.indicator_id}
              className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(ioc.indicator_type)}
                  <span className="font-mono text-xs font-bold text-neutral-200">
                    {ioc.value}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400">
                    {ioc.indicator_type}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getConfidenceBadge(
                    ioc.confidence
                  )}`}
                >
                  {ioc.confidence}
                </span>
              </div>

              <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
                {ioc.context}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/50">
                <span className="font-medium text-red-400/90">
                  Actor: {ioc.threat_actor || 'Unattributed'}
                </span>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>Matches: <strong className="text-neutral-300">{ioc.match_count}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
