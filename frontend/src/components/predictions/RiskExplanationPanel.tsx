import React from 'react';
import type { ExplainableRiskData, EvaluationMetrics } from '../../types';
import { HelpCircle, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface RiskExplanationPanelProps {
  riskData: ExplainableRiskData | null;
  metrics: EvaluationMetrics | null;
}

export const RiskExplanationPanel: React.FC<RiskExplanationPanelProps> = ({ riskData, metrics }) => {
  if (!riskData) {
    return (
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <div className="text-center py-8 text-neutral-500 text-xs">
          Loading explainable risk telemetry and predictive evaluation metrics...
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'ACCELERATING':
      case 'INCREASING':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'DECREASING':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
            Explainable Risk Engine & Predictive Calibration
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-neutral-400">Trend:</span>
          <span className="flex items-center space-x-1 font-bold text-neutral-200">
            {getTrendIcon(riskData.trend)}
            <span>{riskData.trend}</span>
          </span>
          <span className="text-neutral-600">|</span>
          <span className="text-cyan-400 font-bold">
            Velocity: {riskData.velocity >= 0 ? `+${riskData.velocity}` : riskData.velocity}
          </span>
        </div>
      </div>

      {/* Primary Risk Drivers */}
      <div className="mb-4">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Mathematical Risk Drivers ({riskData.risk_drivers.length})
        </div>
        <div className="space-y-2">
          {riskData.risk_drivers.map((driver, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs text-neutral-300 flex items-start space-x-2"
            >
              <span className="text-amber-400 font-mono font-bold">#{idx + 1}</span>
              <span className="leading-relaxed">{driver}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg mb-4">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Factor Weight Contribution
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.entries(riskData.factor_weights).map(([k, v]) => (
            <div key={k} className="p-2 bg-neutral-900/80 rounded border border-neutral-800/60">
              <div className="text-[10px] text-neutral-500 font-mono uppercase truncate">{k.replace('_', ' ')}</div>
              <div className="text-sm font-mono font-bold text-neutral-200">{Number(v).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Validation Metrics (Real vs TO BE VALIDATED) */}
      {metrics && (
        <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 uppercase">
                Predictive Outcome Validation (Truth-in-Measurement)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
              {metrics.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 bg-neutral-950/60 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-500">Evaluated</div>
              <div className="text-sm font-bold text-neutral-200">{metrics.evaluated_count} / {metrics.total_predictions}</div>
            </div>
            <div className="p-2 bg-neutral-950/60 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-500">Precision</div>
              <div className="text-sm font-bold text-emerald-400">{metrics.precision}</div>
            </div>
            <div className="p-2 bg-neutral-950/60 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-500">Recall</div>
              <div className="text-sm font-bold text-amber-400">{metrics.recall}</div>
            </div>
            <div className="p-2 bg-neutral-950/60 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-500">Lead Time</div>
              <div className="text-sm font-bold text-cyan-400">{metrics.average_lead_time_seconds.toFixed(0)}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
