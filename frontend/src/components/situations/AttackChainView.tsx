import React from 'react';
import type { AttackChainData } from '../../types';
import { GitCommit, CheckCircle2, Circle } from 'lucide-react';

interface AttackChainViewProps {
  data: AttackChainData | null;
}

export const AttackChainView: React.FC<AttackChainViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="text-center py-8 text-neutral-500 text-xs">
          Reconstructing multi-stage attack kill-chain progression...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            Multi-Stage Attack Chain Reconstruction
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-neutral-400">
            Active: <strong className="text-amber-400">{data.current_stage}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold">
            {(data.progression_percentage * 100).toFixed(0)}% Progression
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mb-6 border border-neutral-800">
        <div
          className="bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 h-full transition-all duration-500"
          style={{ width: `${Math.max(5, data.progression_percentage * 100)}%` }}
        />
      </div>

      {/* Stages Horizontal/Vertical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {data.stages.map((stg) => {
          const isDetected = stg.detected;
          return (
            <div
              key={stg.stage}
              className={`p-3 rounded-lg border transition-all ${
                isDetected
                  ? 'bg-neutral-950/80 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'bg-neutral-950/30 border-neutral-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-neutral-500">
                  STAGE {stg.stage_order}
                </span>
                {isDetected ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>

              <div className="text-xs font-bold text-neutral-200 mb-1">
                {stg.stage.replace('_', ' ')}
              </div>

              {isDetected ? (
                <div className="space-y-1 mt-2 pt-2 border-t border-neutral-800/60">
                  <div className="text-[10px] text-cyan-300 font-mono">
                    Events: {stg.matched_event_ids.length}
                  </div>
                  {stg.techniques.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stg.techniques.map((tech) => (
                        <span key={tech} className="text-[9px] font-mono px-1 rounded bg-neutral-800 text-neutral-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-neutral-600 mt-2 pt-2 border-t border-neutral-800/30">
                  Not observed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
