import React from 'react';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  WifiOff,
  CloudSun
} from 'lucide-react';
import type { SourceWeatherReport, SensorFeedStatus } from '../../types';

interface SourceWeatherBarProps {
  weather?: SourceWeatherReport | null;
}

export const SourceWeatherBar: React.FC<SourceWeatherBarProps> = ({ weather }) => {
  if (!weather || !weather.feeds) {
    return null;
  }

  const getStatusBadge = (status: SensorFeedStatus) => {
    switch (status) {
      case 'ONLINE':
        return {
          icon: <CheckCircle className="w-3 h-3 text-emerald-400" />,
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'DEGRADED':
        return {
          icon: <AlertCircle className="w-3 h-3 text-amber-400" />,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'DELAYED':
        return {
          icon: <Clock className="w-3 h-3 text-orange-400" />,
          classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
        };
      case 'OFFLINE':
        return {
          icon: <WifiOff className="w-3 h-3 text-rose-400" />,
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        };
      case 'STALE':
        return {
          icon: <Clock className="w-3 h-3 text-neutral-400" />,
          classes: 'bg-neutral-800 text-neutral-400 border-neutral-700'
        };
      default:
        return {
          icon: <Activity className="w-3 h-3 text-neutral-400" />,
          classes: 'bg-neutral-800 text-neutral-400 border-neutral-700'
        };
    }
  };

  return (
    <div className="w-full bg-[#080503]/90 border border-[#c9a15d]/20 rounded-2xl px-4 py-2 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
      {/* Title & Overall Weather */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-[#f0d28f] font-bold">
          <CloudSun className="w-3.5 h-3.5 text-[#f0d28f]" />
          <span className="tracking-wider text-[#fff6e4]">SOURCE WEATHER:</span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            weather.overall_system_health === 'OPTIMAL'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : weather.overall_system_health === 'DEGRADED'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
              : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
          }`}
        >
          {weather.overall_system_health}
        </span>
      </div>

      {/* 6 Modal Feeds */}
      <div className="flex flex-wrap items-center gap-2">
        {weather.feeds.map((feed) => {
          const badge = getStatusBadge(feed.status);
          return (
            <div
              key={feed.source_type}
              className={`px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 transition-all ${badge.classes}`}
              title={`${feed.source_type}: ${feed.status_detail} | Latency: ${feed.latency_ms}ms | Loss: ${feed.packet_loss_pct}%`}
            >
              {badge.icon}
              <span className="font-bold text-[11px]">{feed.source_type}</span>
              <span className="text-[10px] text-[#a3927a]">
                {feed.latency_ms > 0 ? `${feed.latency_ms.toFixed(0)}ms` : '0ms'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Observability Summary */}
      <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono text-[#a3927a]">
        <span>Active Feeds: <strong className="text-[#fff6e4]">{weather.active_sources}</strong></span>
        <span>•</span>
        <span>Degraded: <strong className="text-amber-400">{weather.degraded_sources}</strong></span>
      </div>
    </div>
  );
};
