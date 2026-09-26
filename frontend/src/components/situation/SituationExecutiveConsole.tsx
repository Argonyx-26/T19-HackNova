import React, { useState } from 'react';
import type {
  Situation,
  FutureStatePrediction,
  DecisionSupportRecommendation,
  SituationGraphData,
  SiteCampus,
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
  NormalizedEvent
} from '../../types';

import { SituationHero } from './SituationHero';
import { DigitalTwinCanvas } from '../digitaltwin/DigitalTwinCanvas';
import { SituationGraphView } from '../graph/SituationGraphView';
import { FiveCameraGrid } from '../intelligence/FiveCameraGrid';
import { ThreatDNAPanel } from '../intelligence/ThreatDNAPanel';
import { IntelligenceRelevancePanel } from '../intelligence/IntelligenceRelevancePanel';
import { EvidenceShadowPanel } from '../evidence/EvidenceShadowPanel';
import { WhyNotEnginePanel } from '../evidence/WhyNotEnginePanel';
import { FutureStatePanel } from '../predictions/FutureStatePanel';
import { AttackChainView } from '../situations/AttackChainView';
import { InterventionSandbox } from '../interventions/InterventionSandbox';
import { DecisionSupportCard } from '../interventions/DecisionSupportCard';
import { EventFeed } from '../events/EventFeed';
import { MitreAttackPanel } from '../intelligence/MitreAttackPanel';

import {
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

export interface SituationExecutiveConsoleProps {
  situation: Situation | null;
  prediction: FutureStatePrediction | null;
  recommendation: DecisionSupportRecommendation | null;
  graphData: SituationGraphData | null;
  campusData: SiteCampus | null;
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
  activeSimulation: SimulatedIntervention | null;
  isLoading: boolean;
  onSimulate: (action: InterventionAction) => Promise<any>;
  onOpenFeedback: () => void;
  onSelectSection?: (section: any) => void;
  sourceWeather?: any;
}

export const SituationExecutiveConsole: React.FC<SituationExecutiveConsoleProps> = ({
  situation,
  prediction,
  recommendation,
  graphData,
  campusData,
  evidenceShadow,
  whyNotDecisions,
  threatIndicators: _threatIndicators = [],
  mitreMappings,
  blastRadius: _blastRadius,
  attackChain,
  events,
  activeSimulation,
  isLoading,
  onSimulate,
  onOpenFeedback: _onOpenFeedback,
  sourceWeather: _sourceWeather
}) => {
  const [centerView, setCenterView] = useState<'3D_TWIN' | 'GRAPH' | 'VISION_WALL'>('3D_TWIN');
  const [showRawEventDrawer, setShowRawEventDrawer] = useState<boolean>(false);
  const [showMitreDrawer, setShowMitreDrawer] = useState<boolean>(false);

  // Evidence Checklist Items derived from multi-modal sensors
  const evidenceChecklist = [
    {
      id: 'badge',
      label: 'Badge Reader #B-402 (Floor 4)',
      type: 'PHYSICAL_ACCESS',
      status: 'VERIFIED',
      detail: 'Unauthorized keycard badge retry: entity person-104'
    },
    {
      id: 'door',
      label: 'Vault Perimeter Access Gate (Floor 5)',
      type: 'PERIMETER_DOOR',
      status: 'VERIFIED',
      detail: 'Forced physical door switch contact sensor tripped'
    },
    {
      id: 'cctv',
      label: 'CCTV Camera 04 (Server Vault)',
      type: 'VISION_ANALYTICS',
      status: 'ANOMALOUS',
      detail: 'Visual bounding box person-104 carrying unapproved device'
    },
    {
      id: 'network',
      label: 'Core Switch Rack 02 (185.220.101.5)',
      type: 'CYBER_NETWORK',
      status: 'ANOMALOUS',
      detail: '820 MB/s high-volume encrypted outbound transfer'
    }
  ];

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* =========================================================================
          SECTION 1: MAIN ACTIVE SITUATION HERO BANNER
          ========================================================================= */}
      <SituationHero
        situation={situation}
        confidenceScore={87}
        threatPriorityIndex={94.2}
        activeState={situation?.status || 'CRITICAL'}
        onViewEvidence={() => scrollToSection('section-intelligence-workspace')}
        onViewWhy={() => scrollToSection('section-reasoning-why')}
        onViewWhatIf={() => scrollToSection('section-what-if')}
      />

      {/* =========================================================================
          SECTION 2: INTELLIGENCE WORKSPACE (Responsive Multi-Column Workspace)
          Left: Multi-Modal Evidence | Center: 3D Twin & Graph | Right: Why? Reasoning
          ========================================================================= */}
      <div id="section-intelligence-workspace" className="space-y-4 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0d28f] shadow-[0_0_8px_#f0d28f]" />
            <h3 className="font-sans font-bold text-base sm:text-lg text-[#fff6e4] tracking-tight">
              Intelligence Workspace
            </h3>
            <span className="font-mono text-[10px] text-[#a3927a] hidden md:inline">
              [EVIDENCE · SPATIAL TOPOLOGY · REASONING]
            </span>
          </div>

          {/* Center Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 bg-[#0f0b07] p-1 rounded-xl border border-[#c9a15d]/20">
            <button
              onClick={() => setCenterView('3D_TWIN')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                centerView === '3D_TWIN'
                  ? 'bg-[#3a2814] text-[#f0d28f] border border-[#f0d28f]/40 shadow-sm'
                  : 'text-[#a3927a] hover:text-white'
              }`}
            >
              🏢 <span className="hidden sm:inline">3D Building</span> Twin
            </button>
            <button
              onClick={() => setCenterView('GRAPH')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                centerView === 'GRAPH'
                  ? 'bg-[#3a2814] text-[#f0d28f] border border-[#f0d28f]/40 shadow-sm'
                  : 'text-[#a3927a] hover:text-white'
              }`}
            >
              🕸️ <span className="hidden sm:inline">Spatiotemporal</span> Graph
            </button>
            <button
              onClick={() => setCenterView('VISION_WALL')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                centerView === 'VISION_WALL'
                  ? 'bg-[#3a2814] text-[#f0d28f] border border-[#f0d28f]/40 shadow-sm'
                  : 'text-[#a3927a] hover:text-white'
              }`}
            >
              🎥 <span className="hidden sm:inline">5-Camera</span> Wall
            </button>
          </div>
        </div>

        {/* Responsive Multi-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-start w-full min-w-0">
          {/* LEFT COLUMN: Evidence Checklist & Multi-Modal Indicators */}
          <div className="col-span-1 md:col-span-1 xl:col-span-4 space-y-4 min-w-0 w-full">
            <div className="bg-[#0b0805]/90 border border-[#c9a15d]/25 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#c9a15d]/15 pb-2.5">
                <span className="font-mono text-xs font-bold text-[#f0d28f] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Evidence Signals (4 Correlated)</span>
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#1f150b] text-[#c9a15d] border border-[#c9a15d]/30">
                  REAL-TIME
                </span>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {evidenceChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#140e08]/70 border border-[#c9a15d]/20 hover:border-[#c9a15d]/40 transition space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-sans text-[#fff6e4] flex items-center gap-1.5 truncate">
                        {item.status === 'VERIFIED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="text-[9px] font-mono text-[#a3927a] uppercase shrink-0">
                        {item.type.split('_')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#a3927a] leading-tight pl-5">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Evidence Shadow Indicator */}
              <div className="pt-2 border-t border-[#c9a15d]/15">
                <div className="flex items-center justify-between text-xs font-mono text-[#a3927a]">
                  <span>Evidence Reliability:</span>
                  <strong className="text-emerald-400">96.4%</strong>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[#a3927a] mt-1">
                  <span>Cross-Sensor Cohesion:</span>
                  <strong className="text-[#f0d28f]">High (4 / 4)</strong>
                </div>
              </div>
            </div>

            {/* Threat DNA Profile Card */}
            <ThreatDNAPanel situationId={situation?.situation_id} />
          </div>

          {/* CENTER COLUMN: Interactive 3D Building Twin / Spatiotemporal Graph / Camera Wall */}
          <div className="col-span-1 md:col-span-1 xl:col-span-5 space-y-4 min-w-0 w-full">
            {centerView === '3D_TWIN' && (
              <div className="relative w-full overflow-hidden rounded-2xl">
                <DigitalTwinCanvas
                  campusData={campusData}
                  activeSituationId={situation?.situation_id}
                  threatLevel={0.94}
                />
              </div>
            )}

            {centerView === 'GRAPH' && (
              <div className="relative w-full overflow-hidden rounded-2xl">
                <SituationGraphView graphData={graphData} />
              </div>
            )}

            {centerView === 'VISION_WALL' && (
              <div className="relative w-full overflow-hidden rounded-2xl">
                <FiveCameraGrid />
              </div>
            )}

            {/* Quick Toggle Helper */}
            <div className="p-3 bg-[#0b0805]/70 border border-[#c9a15d]/20 rounded-xl flex items-center justify-between text-xs font-mono text-[#a3927a]">
              <span className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-[#f0d28f] shrink-0" />
                <span className="truncate">Omega Tower · Floor 4 & 5 Vault</span>
              </span>
              <span className="text-[#f0d28f] shrink-0 font-bold">LATERAL SPREAD</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Why? / Reasoning & Conflict Explanation */}
          <div id="section-reasoning-why" className="col-span-1 md:col-span-2 xl:col-span-3 space-y-4 min-w-0 w-full">
            <div className="bg-[#0b0805]/90 border border-[#c9a15d]/25 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#c9a15d]/15 pb-2.5">
                <span className="font-mono text-xs font-bold text-[#f0d28f] uppercase tracking-wider">
                  WHY THE SYSTEM BELIEVES THIS
                </span>
              </div>

              {/* Supporting vs Conflicting Signals */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="text-xs font-bold font-sans text-emerald-300">
                    3 Supporting Signals
                  </div>
                  <ul className="text-[11px] font-mono text-[#a3927a] space-y-0.5 list-disc list-inside">
                    <li>Temporal synchrony (&lt;2s) badge & network</li>
                    <li>Spatial acceleration along corridor</li>
                    <li>Threat Actor signature (MIMIKATZ)</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="text-xs font-bold font-sans text-amber-300">
                    1 Conflicting Signal
                  </div>
                  <p className="text-[11px] font-mono text-[#a3927a] leading-tight">
                    RFID tag #991 reported badge return at main lobby (ruled out as tailgating spoof).
                  </p>
                </div>
              </div>
            </div>

            {/* Why-Not Engine Card */}
            <WhyNotEnginePanel decisions={whyNotDecisions} />

            {/* Evidence Shadow Card */}
            <EvidenceShadowPanel shadowData={evidenceShadow} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: PREDICTION ("WHAT MAY HAPPEN NEXT?")
          ========================================================================= */}
      <div className="space-y-4 w-full min-w-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8b25c] shadow-[0_0_8px_#e8b25c]" />
          <h3 className="font-sans font-bold text-base sm:text-lg text-[#fff6e4] tracking-tight">
            Threat Anticipation & Attack Chain Progression
          </h3>
          <span className="font-mono text-[10px] text-[#a3927a] hidden sm:inline">
            [WHAT COULD HAPPEN NEXT?]
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full min-w-0">
          <div className="lg:col-span-7 min-w-0 w-full">
            <AttackChainView data={attackChain} />
          </div>
          <div className="lg:col-span-5 space-y-4 min-w-0 w-full">
            <FutureStatePanel prediction={prediction} />
            <IntelligenceRelevancePanel situationId={situation?.situation_id} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: WHAT-IF & COUNTERFACTUAL INTERVENTIONS
          ========================================================================= */}
      <div id="section-what-if" className="space-y-4 w-full min-w-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <h3 className="font-sans font-bold text-base sm:text-lg text-[#fff6e4] tracking-tight">
            Counterfactual Sandbox & Intervention Simulation
          </h3>
          <span className="font-mono text-[10px] text-[#a3927a] hidden sm:inline">
            [WHAT IF WE INTERVENE?]
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full min-w-0">
          <div className="lg:col-span-6 min-w-0 w-full">
            <InterventionSandbox
              onSimulate={onSimulate}
              activeSimulation={activeSimulation}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-6 min-w-0 w-full">
            <DecisionSupportCard recommendation={recommendation} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: PROGRESSIVE DISCLOSURE DRAWERS (Non-intrusive Advanced Telemetry)
          ========================================================================= */}
      <div className="pt-4 border-t border-[#c9a15d]/20 flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Raw Events Stream */}
          <button
            onClick={() => setShowRawEventDrawer(!showRawEventDrawer)}
            className="px-3 py-1.5 rounded-xl bg-[#0f0b07] hover:bg-[#1a1208] border border-[#c9a15d]/30 text-xs font-mono text-[#fbf3e3] flex items-center space-x-2 transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Raw Event Stream ({events.length})</span>
            {showRawEventDrawer ? <ChevronUp className="w-3.5 h-3.5 text-[#a3927a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#a3927a]" />}
          </button>

          {/* Toggle MITRE ATT&CK Matrix */}
          <button
            onClick={() => setShowMitreDrawer(!showMitreDrawer)}
            className="px-3 py-1.5 rounded-xl bg-[#0f0b07] hover:bg-[#1a1208] border border-[#c9a15d]/30 text-xs font-mono text-[#fbf3e3] flex items-center space-x-2 transition cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#f0d28f]" />
            <span>MITRE ATT&CK Matrix ({mitreMappings.length})</span>
            {showMitreDrawer ? <ChevronUp className="w-3.5 h-3.5 text-[#a3927a]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#a3927a]" />}
          </button>
        </div>

        <div className="text-[10px] font-mono text-[#a3927a]">
          SENTINEL-X REASONING CORE · ALL INTEL ENGINES ACTIVE
        </div>
      </div>

      {/* Raw Event Drawer */}
      {showRawEventDrawer && (
        <div className="bg-[#0a0704]/95 border border-[#c9a15d]/30 rounded-2xl p-4 shadow-2xl animate-fadeIn w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-2 mb-3">
            <span className="font-mono text-xs font-bold text-[#f0d28f]">
              LIVE NORMALIZED TELEMETRY INGESTION STREAM
            </span>
            <button
              onClick={() => setShowRawEventDrawer(false)}
              className="text-xs font-mono text-[#a3927a] hover:text-white cursor-pointer"
            >
              [Close]
            </button>
          </div>
          <div className="h-72">
            <EventFeed events={events} />
          </div>
        </div>
      )}

      {/* MITRE Drawer */}
      {showMitreDrawer && (
        <div className="bg-[#0a0704]/95 border border-[#c9a15d]/30 rounded-2xl p-4 shadow-2xl animate-fadeIn w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-2 mb-3">
            <span className="font-mono text-xs font-bold text-[#f0d28f]">
              MITRE ATT&CK TACTICS & TECHNIQUES MAPPING
            </span>
            <button
              onClick={() => setShowMitreDrawer(false)}
              className="text-xs font-mono text-[#a3927a] hover:text-white cursor-pointer"
            >
              [Close]
            </button>
          </div>
          <MitreAttackPanel mappings={mitreMappings} />
        </div>
      )}
    </div>
  );
};
