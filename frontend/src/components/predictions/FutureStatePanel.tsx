import React from 'react';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import type { FutureStatePrediction } from '../../types';

interface FutureStatePanelProps {
  prediction: FutureStatePrediction | null;
}

export const FutureStatePanel: React.FC<FutureStatePanelProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 text-center text-xs font-mono text-slate-500">
        Future-state forecasting awaiting active situation data.
      </div>
    );
  }

  const isEscalating = ['ESCALATING', 'CRITICAL'].includes(prediction.predicted_state);

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            Future-State Horizon Prediction
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Horizon: {prediction.horizon}</span>
        </div>
      </div>

      {/* Projection Matrix */}
      <div className="p-4 rounded-lg bg-sentinel-card border border-sentinel-border/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            PROJECTED NEXT STATE
          </span>
          <div className="text-xl font-mono font-bold text-white mt-0.5 flex items-center space-x-2">
            <span
              className={
                isEscalating
                  ? 'text-rose-400 animate-pulse'
                  : 'text-emerald-400'
              }
            >
              {prediction.predicted_state}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300 mt-1 max-w-md">{prediction.reason}</p>
        </div>

        {/* Projected Risk Delta */}
        <div className="text-right space-y-1">
          <div className="text-xs font-mono text-slate-400">PROJECTED RISK</div>
          <div className="text-xl font-mono font-bold text-white">
            {(prediction.risk_score * 100).toFixed(0)}%
          </div>
          <div
            className={`text-[10px] font-mono font-semibold ${
              prediction.risk_delta > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {prediction.risk_delta > 0 ? `+${prediction.risk_delta}` : prediction.risk_delta} Risk Delta
          </div>
        </div>
      </div>

      {/* Triggering Factors List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          PRIMARY TRIGGERING FACTORS
        </span>
        <ul className="space-y-1.5">
          {prediction.triggering_factors.map((factor, idx) => (
            <li
              key={idx}
              className="text-xs font-mono text-slate-300 flex items-start space-x-2 bg-sentinel-bg/50 p-2 rounded border border-sentinel-border/40"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
