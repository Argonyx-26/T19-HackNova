import React from 'react';
import type { AttackChainData } from '../../types';
import { GitCommit, CheckCircle2, Circle, AlertCircle, Shield, Clock } from 'lucide-react';

interface AttackChainViewProps {
  data: AttackChainData | null;
}

export const AttackChainView: React.FC<AttackChainViewProps> = ({ data }) => {
  if (!data || !data.stages || data.stages.length === 0) {
    return (
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500 space-y-2">
          <GitCommit className="w-8 h-8 text-cyan-500/40 animate-pulse" />
          <p className="text-xs font-mono">Reconstructing multi-stage attack kill-chain progression...</p>
        </div>
      </div>
    );
  }

  // Normalize progression percentage safely (handles both 0.625 and 62.5 formats)
  const rawProgression = data.progression_percentage ?? 0;
  const progressionPct = rawProgression > 1 ? rawProgression : rawProgression * 100;
  const clampedPct = Math.max(0, Math.min(100, progressionPct));

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-neutral-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <GitCommit className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase font-mono">
              Multi-Stage Attack Chain Reconstruction
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Linear cyber kill-chain telemetry mapped to MITRE ATT&CK techniques
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/80 border border-neutral-800">
            <span className="text-neutral-400">Current Phase:</span>
            <strong className="text-amber-400 font-semibold tracking-wide">
              {data.current_stage ? data.current_stage.replace(/_/g, ' ') : 'UNKNOWN'}
            </strong>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            {clampedPct.toFixed(0)}% Progression ({data.stages_completed}/{data.total_stages})
          </span>
        </div>
      </div>

      {/* Kill-Chain Progression Bar */}
      <div className="space-y-1.5 mb-6">
        <div className="flex justify-between text-[10px] font-mono text-neutral-400 px-0.5">
          <span>Initial Access</span>
          <span>Lateral Movement</span>
          <span>Target Impact</span>
        </div>
        <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800/80 p-0.5">
          <div
            className="bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(4, clampedPct)}%` }}
          />
        </div>
      </div>

      {/* Stages Horizontal Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.stages.map((stg) => {
          const events = stg.event_ids || stg.matched_event_ids || [];
          const techniques = stg.technique_ids || stg.techniques || [];
          const isDetected = Boolean(stg.detected || events.length > 0);
          const isCurrentActive = stg.stage === data.current_stage && isDetected;
          const stageTitle = (stg.stage || '').replace(/_/g, ' ');
          const firstSeenTime = stg.first_seen_at || stg.first_seen;

          return (
            <div
              key={stg.stage}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                  : isDetected
                  ? 'bg-neutral-950/80 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'bg-neutral-950/30 border-neutral-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-neutral-400 flex items-center space-x-1">
                    <span>STAGE {stg.stage_order}</span>
                    {isCurrentActive && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </span>
                  {isDetected ? (
                    <CheckCircle2 className={`w-4 h-4 ${isCurrentActive ? 'text-amber-400' : 'text-cyan-400'}`} />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-600" />
                  )}
                </div>

                <div className="text-xs font-bold text-neutral-100 tracking-wide mb-2 flex items-center space-x-1.5">
                  <Shield className={`w-3 h-3 ${isDetected ? 'text-cyan-400' : 'text-neutral-600'}`} />
                  <span>{stageTitle}</span>
                </div>

                {isDetected ? (
                  <div className="space-y-2 mt-2 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-neutral-400">Events:</span>
                      <span className="text-cyan-300 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
                        {events.length} observed
                      </span>
                    </div>

                    {techniques.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-neutral-400 font-mono uppercase">Techniques:</div>
                        <div className="flex flex-wrap gap-1">
                          {techniques.map((tech) => (
                            <span
                              key={tech}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/90 text-cyan-200 border border-neutral-700/80 hover:border-cyan-500/40 transition"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {stg.evidence && (
                      <div className="text-[10px] text-neutral-400 italic font-mono pt-1">
                        "{stg.evidence}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/40 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-neutral-600" />
                    <span>No indicators observed</span>
                  </div>
                )}
              </div>

              {isDetected && firstSeenTime && (
                <div className="mt-3 pt-2 border-t border-neutral-800/40 flex items-center justify-between text-[9px] font-mono text-neutral-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5 text-neutral-400" />
                    <span>Logged</span>
                  </span>
                  <span className="text-neutral-400">
                    {new Date(firstSeenTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
