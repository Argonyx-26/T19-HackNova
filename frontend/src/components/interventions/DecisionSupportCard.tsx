import React from 'react';
import { Compass, UserCheck, ShieldCheck } from 'lucide-react';
import type { DecisionSupportRecommendation } from '../../types';

interface DecisionSupportCardProps {
  recommendation: DecisionSupportRecommendation | null;
}

export const DecisionSupportCard: React.FC<DecisionSupportCardProps> = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 text-center text-xs font-mono text-slate-500">
        Decision-support recommendations will generate once situation telemetry is evaluated.
      </div>
    );
  }

  return (
    <div className="bg-sentinel-surface border border-cyan-500/30 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Decision Support & Recommendation Engine
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Balanced Impact Assessment</span>
        </div>
      </div>

      {/* Recommended Action Card */}
      <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            RECOMMENDED INTERVENTION CHOICE
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {recommendation.recommended_action}
          </span>
        </div>

        <p className="text-xs font-mono text-slate-200 leading-relaxed pt-1">
          {recommendation.justification}
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          SIMULATED ALTERNATIVES TRADEOFF MATRIX
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {recommendation.compared_actions.map((comp) => {
            const isRec = comp.action === recommendation.recommended_action;
            return (
              <div
                key={comp.action}
                className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
                  isRec
                    ? 'bg-sentinel-card border-cyan-500/40'
                    : 'bg-sentinel-bg/50 border-sentinel-border/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={isRec ? 'text-cyan-300' : 'text-slate-300'}>[{comp.action}]</span>
                  <span
                    className={`text-[10px] ${
                      comp.risk_delta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Δ {comp.risk_delta > 0 ? `+${comp.risk_delta}` : comp.risk_delta}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Impact: <strong className="text-slate-300">{comp.operational_impact}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Projected: <strong className="text-white">{comp.projected_state}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authority Reminder Footer */}
      <div className="p-2.5 rounded bg-sentinel-bg/70 border border-sentinel-border text-[10px] font-mono text-slate-400 flex items-center space-x-2">
        <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>{recommendation.operator_authority_notice}</span>
      </div>
    </div>
  );
};
