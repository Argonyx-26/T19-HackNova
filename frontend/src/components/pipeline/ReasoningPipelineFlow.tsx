import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  CheckCircle,
  Network,
  Share2,
  AlertTriangle,
  Flame,
  TrendingUp,
  BrainCircuit,
  Sliders,
  ShieldCheck,
  FileText,
  ChevronRight,
  Database
} from 'lucide-react';

export type PipelineStageKey =
  | 'STREAMS'
  | 'EDGE_FEATURES'
  | 'VALIDATION'
  | 'UNIFIED_REPR'
  | 'CORRELATION'
  | 'SPATIOTEMPORAL_GRAPH'
  | 'ANOMALY_DETECTION'
  | 'SITUATION_FORMATION'
  | 'THREAT_EVOLUTION'
  | 'PROJECTION'
  | 'VLM_SYNTHESIS'
  | 'COUNTERFACTUAL'
  | 'DECISION_SUPPORT'
  | 'AUDIT';

interface ReasoningPipelineFlowProps {
  currentStage?: PipelineStageKey;
  onSelectStage?: (stage: PipelineStageKey) => void;
}

interface StageInfo {
  key: PipelineStageKey;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

export const ReasoningPipelineFlow: React.FC<ReasoningPipelineFlowProps> = ({
  currentStage = 'VLM_SYNTHESIS',
  onSelectStage
}) => {
  const [selectedStage, setSelectedStage] = useState<PipelineStageKey>(currentStage);

  const stages: StageInfo[] = [
    {
      key: 'STREAMS',
      label: '1. Streams',
      sub: '6 Modalities Ingested',
      icon: <Layers className="w-3.5 h-3.5" />
    },
    {
      key: 'EDGE_FEATURES',
      label: '2. Edge Extraction',
      sub: 'Spectrogram / Vision',
      icon: <Cpu className="w-3.5 h-3.5" />
    },
    {
      key: 'VALIDATION',
      label: '3. Data Validation',
      sub: 'Pydantic Canonical',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    {
      key: 'UNIFIED_REPR',
      label: '4. Representation',
      sub: '128-dim ImageBind',
      icon: <Database className="w-3.5 h-3.5" />
    },
    {
      key: 'CORRELATION',
      label: '5. Correlation',
      sub: 'Time + Space + Vector',
      icon: <Network className="w-3.5 h-3.5" />
    },
    {
      key: 'SPATIOTEMPORAL_GRAPH',
      label: '6. ST-Graph',
      sub: 'Dynamic NetworkX',
      icon: <Share2 className="w-3.5 h-3.5" />
    },
    {
      key: 'ANOMALY_DETECTION',
      label: '7. Anomaly Det.',
      sub: 'Spatial Anomaly 0.94',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    {
      key: 'SITUATION_FORMATION',
      label: '8. Situation Form.',
      sub: 'Sit-20260925-001',
      icon: <Flame className="w-3.5 h-3.5" />
    },
    {
      key: 'THREAT_EVOLUTION',
      label: '9. Threat State',
      sub: 'CRITICAL Escalation',
      icon: <TrendingUp className="w-3.5 h-3.5" />
    },
    {
      key: 'PROJECTION',
      label: '10. ST-GNN Proj.',
      sub: 'Target: F5 Vault (45s)',
      icon: <TrendingUp className="w-3.5 h-3.5" />
    },
    {
      key: 'VLM_SYNTHESIS',
      label: '11. VLM Synthesis',
      sub: 'Qwen2-VL Evidence Grounded',
      icon: <BrainCircuit className="w-3.5 h-3.5" />
    },
    {
      key: 'COUNTERFACTUAL',
      label: '12. Counterfactual',
      sub: 'Response Sandbox',
      icon: <Sliders className="w-3.5 h-3.5" />
    },
    {
      key: 'DECISION_SUPPORT',
      label: '13. Human In Loop',
      sub: 'Accept / Override / Defer',
      icon: <ShieldCheck className="w-3.5 h-3.5" />
    },
    {
      key: 'AUDIT',
      label: '14. Auditable Record',
      sub: 'Immutable Trail',
      icon: <FileText className="w-3.5 h-3.5" />
    }
  ];

  const handleStageClick = (key: PipelineStageKey) => {
    setSelectedStage(key);
    if (onSelectStage) onSelectStage(key);
  };

  return (
    <div className="w-full bg-[#0a0704]/90 border border-[#c9a15d]/20 rounded-2xl p-3 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#f0d28f] shadow-[0_0_8px_#f0d28f]" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#fff6e4] uppercase">
            SITUATIONAL REASONING PIPELINE // END-TO-END AUDIT CHAIN
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#a3927a] hidden sm:inline">
          Click any stage to scrub through the reasoning chain
        </span>
      </div>

      {/* Horizontal Scrollable Stepper */}
      <div className="flex items-center overflow-x-auto space-x-1.5 pb-1 scrollbar-none">
        {stages.map((stg, idx) => {
          const isSelected = selectedStage === stg.key;
          return (
            <React.Fragment key={stg.key}>
              <button
                onClick={() => handleStageClick(stg.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#3a2814] border-[#f0d28f]/60 text-[#fff6e4] shadow-[0_0_12px_rgba(240,210,143,0.25)] ring-1 ring-[#f0d28f]/30'
                    : 'bg-[#140e08]/70 border-[#c9a15d]/15 text-[#a3927a] hover:border-[#c9a15d]/40 hover:text-[#fff6e4]'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className={isSelected ? 'text-[#f0d28f]' : 'text-[#7a6a55]'}>
                    {stg.icon}
                  </span>
                  <span className="text-[11px] font-mono font-bold whitespace-nowrap">
                    {stg.label}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-[#a3927a] whitespace-nowrap mt-0.5">
                  {stg.sub}
                </div>
              </button>

              {idx < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#544534] flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

