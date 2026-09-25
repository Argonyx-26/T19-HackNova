import React from 'react';
import type { BlastRadiusData } from '../../types';
import { Target, Server, Database, MapPin, Users, ShieldAlert } from 'lucide-react';

interface BlastRadiusViewProps {
  data: BlastRadiusData | null;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="text-center py-8 text-neutral-500 text-xs">
          Loading blast radius topology and asset spread telemetry...
        </div>
      </div>
    );
  }

  const getCriticalityBadge = (crit: string) => {
    switch (crit) {
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
          <Target className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            Situational Blast Radius & Asset Spread
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-300">
            Direct: {data.direct_affected_count}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300">
            Cascading: {data.potential_affected_count}
          </span>
        </div>
      </div>

      {/* Spread Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Physical Zones</div>
            <div className="text-base font-mono font-bold text-neutral-200">
              {data.spread_dimensions.physical_zones}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center space-x-3">
          <Server className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Endpoints</div>
            <div className="text-base font-mono font-bold text-neutral-200">
              {data.spread_dimensions.network_endpoints}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center space-x-3">
          <Users className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Identities</div>
            <div className="text-base font-mono font-bold text-neutral-200">
              {data.spread_dimensions.identities}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center space-x-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Databases</div>
            <div className="text-base font-mono font-bold text-neutral-200">
              {data.spread_dimensions.databases}
            </div>
          </div>
        </div>
      </div>

      {/* High-Criticality Impact Summary */}
      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg mb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-red-300 uppercase mb-1">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Impact Assessment</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {data.risk_impact_summary}
        </p>
      </div>

      {/* Affected Assets List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
          Potentially Affected High-Value Assets ({data.affected_assets.length})
        </div>
        {data.affected_assets.map((asset) => (
          <div
            key={asset.asset_id}
            className="flex items-center justify-between p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="font-mono text-neutral-300 font-semibold">{asset.asset_name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                {asset.asset_type}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-neutral-500 font-mono">
                {asset.is_direct ? 'DIRECT' : `${asset.hop_distance} HOP`}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getCriticalityBadge(asset.criticality)}`}>
                {asset.criticality}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
