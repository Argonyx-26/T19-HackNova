import React, { useState } from 'react';
import { Camera, Server, KeyRound, Cpu, Clock, MapPin, User, Volume2, Globe, Activity } from 'lucide-react';
import type { NormalizedEvent, SourceType } from '../../types';

interface EventFeedProps {
  events: NormalizedEvent[];
}

export const EventFeed: React.FC<EventFeedProps> = ({ events }) => {
  const [filterSource, setFilterSource] = useState<string>('ALL');

  const getSourceIcon = (source: SourceType | string) => {
    switch (source) {
      case 'CCTV':
        return <Camera className="w-3.5 h-3.5 text-purple-400" />;
      case 'NETWORK':
        return <Server className="w-3.5 h-3.5 text-cyan-400" />;
      case 'ACCESS':
        return <KeyRound className="w-3.5 h-3.5 text-amber-400" />;
      case 'IOT':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AUDIO':
        return <Volume2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'GEO':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getSourceBadgeStyle = (source: SourceType | string) => {
    switch (source) {
      case 'CCTV':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'NETWORK':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'ACCESS':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'IOT':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'AUDIO':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'GEO':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const filteredEvents = filterSource === 'ALL'
    ? events
    : events.filter((e) => e.source_type === filterSource);

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl flex flex-col h-full overflow-hidden">
      {/* Feed Header */}
      <div className="p-4 border-b border-sentinel-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Live Multimodal Ingestion Feed
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sentinel-card border border-sentinel-border text-slate-400">
            {filteredEvents.length} Signals
          </span>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none">
          {['ALL', 'CCTV', 'NETWORK', 'ACCESS', 'IOT', 'AUDIO', 'GEO'].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition whitespace-nowrap ${
                filterSource === src
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-sentinel-card'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Events Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-sentinel-border/50 max-h-full">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No events ingested yet. Start the scenario stream above.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.event_id} className="p-3 hover:bg-sentinel-card/60 transition group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border flex items-center space-x-1 ${getSourceBadgeStyle(evt.source_type)}`}>
                    {getSourceIcon(evt.source_type)}
                    <span>{evt.source_type}</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Context Row */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-slate-300">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{evt.entity_id}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{evt.location_id}</span>
                  </div>
                </div>

                {/* Severity Meter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-500">SEV:</span>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        evt.severity > 0.7
                          ? 'bg-rose-500'
                          : evt.severity > 0.4
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.round(evt.severity * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400">{(evt.severity * 10).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
