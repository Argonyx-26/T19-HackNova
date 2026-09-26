import React, { useState } from 'react';
import type {
  Situation,
  FutureStatePrediction,
  DecisionSupportRecommendation,
  SituationGraphData,
  SiteCampus,
  TopologyConflict,
  EvidenceShadow,
  WhyNotDecision,
  VLMSituationSynthesis,
  ThreatIntelligenceIndicator,
  ATTACKMapping,
  BehavioralAnomaly,
  BlastRadiusData,
  AttackChainData,
  ExplainableRiskData,
  SimulatedIntervention,
  InterventionAction,
  NormalizedEvent,
  SituationTransition
} from '../../types';

import { DigitalTwinCanvas } from '../digitaltwin/DigitalTwinCanvas';
import { EvidenceShadowPanel } from '../evidence/EvidenceShadowPanel';
import { WhyNotEnginePanel } from '../evidence/WhyNotEnginePanel';
import { VLMSynthesisCard } from '../intelligence/VLMSynthesisCard';
import { SituationStatusCard } from '../situations/SituationStatusCard';
import { EventFeed } from '../events/EventFeed';
import { FutureStatePanel } from '../predictions/FutureStatePanel';
import { InterventionSandbox } from '../interventions/InterventionSandbox';
import { DecisionSupportCard } from '../interventions/DecisionSupportCard';
import { SituationGraphView } from '../graph/SituationGraphView';
import { FiveCameraGrid } from '../intelligence/FiveCameraGrid';
import { ThreatDNAPanel } from '../intelligence/ThreatDNAPanel';
import { IntelligenceRelevancePanel } from '../intelligence/IntelligenceRelevancePanel';
import { BlastRadiusView } from '../situations/BlastRadiusView';
import { AttackChainView } from '../situations/AttackChainView';
import { RiskExplanationPanel } from '../predictions/RiskExplanationPanel';
import { MitreAttackPanel } from '../intelligence/MitreAttackPanel';
import { BehavioralPanel } from '../intelligence/BehavioralPanel';

import {
  AlertTriangle,
  Cpu,
  Eye,
  Activity,
  ArrowRight
} from 'lucide-react';

export type JourneyStepId = 'situation' | 'evidence' | 'reasoning' | 'prediction' | 'response';

export interface SituationJourneyViewProps {
  situation?: Situation | null;
  currentSituation?: Situation | null;
  prediction: FutureStatePrediction | null;
  recommendation: DecisionSupportRecommendation | null;
  graphData: SituationGraphData | null;
  campusData: SiteCampus | null;
  topologyConflicts?: TopologyConflict[];
  evidenceShadow: EvidenceShadow | null;
  whyNotDecisions: WhyNotDecision[];
  vlmSynthesis: VLMSituationSynthesis | null;
  threatIndicators?: ThreatIntelligenceIndicator[];
  mitreMappings: ATTACKMapping[];
  behavioralAnomalies: BehavioralAnomaly[];
  blastRadius: BlastRadiusData | null;
  attackChain: AttackChainData | null;
  riskExplanation: ExplainableRiskData | null;
  events: NormalizedEvent[];
  timeline?: SituationTransition[];
  activeSimulation: SimulatedIntervention | null;
  isLoading: boolean;
  onSimulate: (action: InterventionAction) => Promise<any>;
  onOpenFeedback: () => void;
  onSelectSection?: (section: any) => void;
  onRefreshData?: () => void;
}

export const SituationJourneyView: React.FC<SituationJourneyViewProps> = ({
  situation,
  currentSituation: propCurrentSituation,
  prediction,
  recommendation,
  graphData,
  campusData,
  evidenceShadow,
  whyNotDecisions,
  vlmSynthesis,
  mitreMappings,
  behavioralAnomalies,
  blastRadius,
  attackChain,
  riskExplanation,
  events,
  activeSimulation,
  isLoading,
  onSimulate,
  onOpenFeedback
}) => {
  const activeSituation = situation || propCurrentSituation || null;
  const [currentStep, setCurrentStep] = useState<JourneyStepId>('situation');
  const [showEventFeedDrawer, setShowEventFeedDrawer] = useState<boolean>(false);

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Optional Ingested Telemetry Drawer */}
      {showEventFeedDrawer && (
        <div className="bg-[#0c0906] border border-[#c9a15d]/30 rounded-2xl p-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800">
            <span className="font-mono text-xs font-bold text-[#f0d28f] uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Ingested Telemetry Stream ({events.length} Normalized Events)
            </span>
            <button
              onClick={() => setShowEventFeedDrawer(false)}
              className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200"
            >
              [Close Stream]
            </button>
          </div>
          <div className="h-64">
            <EventFeed events={events} />
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 1: SITUATION PULSE (WHAT is happening right now?)
          ========================================================================= */}
      {currentStep === 'situation' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Row: Situation Card & Threat Priority Index & VLM Synthesis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-4">
              <SituationStatusCard situation={activeSituation} />

              {/* Threat Priority Index breakdown */}
              <div className="bg-[#0d0905] border border-[#c9a15d]/30 rounded-2xl p-4 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#c9a15d] font-bold flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#f0d28f]" />
                    <span>THREAT PRIORITY INDEX (TPI)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-bold">
                    HIGH PRIORITY
                  </span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-mono font-bold text-rose-400">94.2</span>
                  <span className="text-xs font-mono text-neutral-500">/ 100</span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Driven by rapid spatial breach progression from Floor 4 to Floor 5 Vault, physical keycard mismatch, and simultaneous 820 MB outbound C2 exfiltration.
                </p>

                <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-neutral-900/60">
                    <span className="text-neutral-400">Risk Score</span>
                    <div className="text-rose-400 font-bold text-xs mt-0.5">0.94</div>
                  </div>
                  <div className="p-1.5 rounded bg-neutral-900/60">
                    <span className="text-neutral-400">Confidence</span>
                    <div className="text-cyan-400 font-bold text-xs mt-0.5">0.89</div>
                  </div>
                  <div className="p-1.5 rounded bg-neutral-900/60">
                    <span className="text-neutral-400">Reliability</span>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">0.96</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Situational Synthesis (VLM) & Future Projection */}
            <div className="lg:col-span-7 space-y-4">
              <VLMSynthesisCard synthesis={vlmSynthesis} />
              <FutureStatePanel prediction={prediction} />
            </div>
          </div>

          {/* Bottom Call to Action banner */}
          <div className="p-4 bg-gradient-to-r from-[#1f150b] via-[#120d07] to-[#0a0704] border border-[#c9a15d]/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#c9a15d]/20 text-[#f0d28f]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#fff6e4] font-sans">
                  Ready to inspect Multi-Modal Evidence?
                </div>
                <div className="text-[11px] font-mono text-[#a3927a]">
                  5-camera CCTV streams, physical security ontology & Cyber-Physical Threat DNA profile.
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep('evidence')}
              className="px-4 py-2 rounded-xl bg-[#c9a15d] hover:bg-[#f0d28f] text-[#050403] font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-lg"
            >
              <span>Step 02: Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: MULTI-MODAL EVIDENCE & VISION (WHAT evidence supports/contradicts?)
          ========================================================================= */}
      {currentStep === 'evidence' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top: 5-Camera Grid Command Center */}
          <FiveCameraGrid />

          {/* Bottom Dual-Panel: Cyber-Physical Threat DNA & Evidence Shadow / Why-Not */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 space-y-4">
              <ThreatDNAPanel situationId={activeSituation?.situation_id} />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <EvidenceShadowPanel shadowData={evidenceShadow} />
              <WhyNotEnginePanel decisions={whyNotDecisions} />
            </div>
          </div>

          {/* Step Progression CTA */}
          <div className="p-4 bg-gradient-to-r from-[#1f150b] via-[#120d07] to-[#0a0704] border border-[#c9a15d]/40 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-[#a3927a] font-mono">
              Evidence corroborated across physical, access, and cyber telemetry.
            </div>
            <button
              onClick={() => setCurrentStep('reasoning')}
              className="px-4 py-2 rounded-xl bg-[#c9a15d] hover:bg-[#f0d28f] text-[#050403] font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-lg"
            >
              <span>Step 03: Topology & Graph Reasoning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: TOPOLOGY & GRAPH REASONING (WHERE is it happening & WHY related?)
          ========================================================================= */}
      {currentStep === 'reasoning' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Visual Center: 3D Incident Digital Twin */}
          <DigitalTwinCanvas
            campusData={campusData}
            activeSituationId={activeSituation?.situation_id}
            threatLevel={0.94}
          />

          {/* Spatiotemporal Graph & Blast Radius Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7">
              <SituationGraphView graphData={graphData} />
            </div>
            <div className="lg:col-span-5">
              <BlastRadiusView data={blastRadius} />
            </div>
          </div>

          {/* Step Progression CTA */}
          <div className="p-4 bg-gradient-to-r from-[#1f150b] via-[#120d07] to-[#0a0704] border border-[#c9a15d]/40 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-[#a3927a] font-mono">
              Spatial acceleration mapped across Floor 4 & 5. Blast radius evaluated.
            </div>
            <button
              onClick={() => setCurrentStep('prediction')}
              className="px-4 py-2 rounded-xl bg-[#c9a15d] hover:bg-[#f0d28f] text-[#050403] font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-lg"
            >
              <span>Step 04: Anticipation & CTI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: ANTICIPATION & THREAT INTEL (WHAT could happen next & CTI?)
          ========================================================================= */}
      {currentStep === 'prediction' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Attack Chain Trajectory */}
          <AttackChainView data={attackChain} />

          {/* Dual-Column: Intelligence Relevance Engine & Explainable Risk / ATT&CK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 space-y-4">
              <IntelligenceRelevancePanel situationId={activeSituation?.situation_id} />
              <MitreAttackPanel mappings={mitreMappings} />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <RiskExplanationPanel
                riskData={riskExplanation}
                metrics={null}
              />
              <BehavioralPanel anomalies={behavioralAnomalies} />
            </div>
          </div>

          {/* Step Progression CTA */}
          <div className="p-4 bg-gradient-to-r from-[#1f150b] via-[#120d07] to-[#0a0704] border border-[#c9a15d]/40 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-[#a3927a] font-mono">
              Trajectory modeled: High likelihood of credential escalation in next 5 minutes.
            </div>
            <button
              onClick={() => setCurrentStep('response')}
              className="px-4 py-2 rounded-xl bg-[#c9a15d] hover:bg-[#f0d28f] text-[#050403] font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-lg"
            >
              <span>Step 05: Counterfactual Response</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: RESPONSE & WHAT-IF (WHAT should the authorized operator do?)
          ========================================================================= */}
      {currentStep === 'response' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Decision Support Recommendation Card */}
          <DecisionSupportCard recommendation={recommendation} />

          {/* Counterfactual Response Sandbox */}
          <InterventionSandbox
            onSimulate={onSimulate}
            activeSimulation={activeSimulation}
            isLoading={isLoading}
          />

          {/* Operator Action Authority Notice & Feedback */}
          <div className="p-4 bg-[#0d0905] border border-amber-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-200">
                  OPERATOR EXECUTIVE AUTHORITY NOTICE
                </div>
                <div className="text-neutral-400 font-mono text-[11px]">
                  All intervention actions are simulated. The authorized human operator holds final command authority for executing real-world lockouts or isolations.
                </div>
              </div>
            </div>

            <button
              onClick={onOpenFeedback}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs font-semibold whitespace-nowrap transition"
            >
              Log Governance Decision
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
