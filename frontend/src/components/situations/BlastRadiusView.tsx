import React from 'react';
import type { BlastRadiusData } from '../../types';
import { Target, Server, Database, MapPin, Users, ShieldAlert, Network, ArrowRight } from 'lucide-react';

interface BlastRadiusViewProps {
  data: BlastRadiusData | null;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500 space-y-2">
          <Target className="w-8 h-8 text-red-500/40 animate-pulse" />
          <p className="text-xs font-mono">Loading blast radius topology and asset spread telemetry...</p>
        </div>
      </div>
    );
  }

  const getCriticalityBadge = (crit: string) => {
    switch (crit) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const getAssetIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('physical') || lower.includes('zone') || lower.includes('room') || lower.includes('lab')) {
      return <MapPin className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (lower.includes('database') || lower.includes('db') || lower.includes('sql') || lower.includes('vault')) {
      return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (lower.includes('switch') || lower.includes('network') || lower.includes('vlan')) {
      return <Network className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (lower.includes('identity') || lower.includes('person') || lower.includes('user')) {
      return <Users className="w-3.5 h-3.5 text-pink-400" />;
    }
    return <Server className="w-3.5 h-3.5 text-blue-400" />;
  };

  const dimensions = data.spread_dimensions || {
    physical_zones: 0,
    network_endpoints: 0,
    identities: 0,
    databases: 0,
  };

  const affectedAssets = data.affected_assets || [];
  const highCritList = data.high_criticality_assets || [];

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-neutral-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <Target className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase font-mono">
              Situational Blast Radius & Asset Spread
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Graph-derived multi-hop compromise potential across enterprise assets
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800/80 text-red-300 font-semibold shadow-[0_0_8px_rgba(239,68,68,0.15)]">
            Direct: {data.direct_affected_count ?? affectedAssets.filter((a) => (a.is_direct ?? a.hop_distance === 1)).length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold">
            Cascading: {data.potential_affected_count ?? affectedAssets.filter((a) => !(a.is_direct ?? a.hop_distance === 1)).length}
          </span>
        </div>
      </div>

      {/* Spread Dimensions 4-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-neutral-950/70 border border-neutral-800/90 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-semibold">Physical Zones</div>
            <div className="text-base font-mono font-bold text-neutral-100">
              {dimensions.physical_zones ?? 0}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800/90 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40">
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-semibold">Endpoints</div>
            <div className="text-base font-mono font-bold text-neutral-100">
              {dimensions.network_endpoints ?? 0}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800/90 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-pink-950/40 border border-pink-800/40">
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-semibold">Identities</div>
            <div className="text-base font-mono font-bold text-neutral-100">
              {dimensions.identities ?? 0}
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-950/70 border border-neutral-800/90 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono font-semibold">Databases</div>
            <div className="text-base font-mono font-bold text-neutral-100">
              {dimensions.databases ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Assessment Summary */}
      <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl mb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-red-300 uppercase mb-1.5 font-mono">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Blast Radius Impact Assessment</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
          {data.risk_impact_summary}
        </p>

        {highCritList.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-red-900/40 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-red-400 font-mono uppercase font-semibold">
              High-Risk Targets:
            </span>
            {highCritList.map((target) => (
              <span
                key={target}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-200"
              >
                {target}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Affected Assets List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
          <span>Targeted & Downstream Assets ({affectedAssets.length})</span>
          <span className="text-[10px] text-neutral-500 font-mono font-normal">Ranked by compromise likelihood</span>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {affectedAssets.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-500 font-mono">
              No individual downstream assets currently flagged.
            </div>
          ) : (
            affectedAssets.map((asset) => {
              const isDirect = asset.is_direct ?? asset.hop_distance === 1;
              const likelihoodPct =
                asset.compromise_likelihood != null
                  ? (asset.compromise_likelihood * 100).toFixed(0)
                  : null;

              return (
                <div
                  key={asset.asset_id}
                  className="p-3 bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 rounded-xl transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAssetIcon(asset.asset_type)}
                      <span className="font-mono text-neutral-200 font-semibold">{asset.asset_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {asset.asset_type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isDirect
                            ? 'bg-red-950/60 border border-red-800/60 text-red-300'
                            : 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                        }`}
                      >
                        {isDirect ? 'DIRECT' : `${asset.hop_distance} HOPS`}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getCriticalityBadge(
                          asset.criticality
                        )}`}
                      >
                        {asset.criticality}
                      </span>
                    </div>
                  </div>

                  {/* Secondary info: dependency path & likelihood */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800/40">
                    {asset.dependency_path && asset.dependency_path.length > 1 ? (
                      <div className="flex items-center space-x-1 text-neutral-400 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="text-neutral-500">Path:</span>
                        {asset.dependency_path.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="text-neutral-300">{step}</span>
                            {idx < (asset.dependency_path?.length ?? 0) - 1 && (
                              <ArrowRight className="w-2.5 h-2.5 text-neutral-600 inline" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-500">Node: {asset.asset_id}</span>
                    )}

                    {likelihoodPct && (
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <span className="text-neutral-400">{likelihoodPct}% risk likelihood</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
