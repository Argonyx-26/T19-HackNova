import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import type {
  NormalizedEvent,
  Situation,
  SituationTransition,
  FutureStatePrediction,
  SimulatedIntervention,
  DecisionSupportRecommendation,
  SituationGraphData,
  InterventionAction,
  ThreatIntelligenceIndicator,
  ATTACKMapping,
  BehavioralAnomaly,
  BlastRadiusData,
  AttackChainData,
  ExplainableRiskData,
  EvaluationMetrics,
  AuditLogEntry,
  SystemMetricsData,
  SystemHealthData,
  SiteCampus,
  TopologyConflict,
  EvidenceShadow,
  WhyNotDecision,
  VLMSituationSynthesis,
  SourceWeatherReport
} from '../types';

import { DigitalTwinCanvas } from '../components/digitaltwin/DigitalTwinCanvas';
import { DevObservabilityDrawer } from '../components/diagnostics/DevObservabilityDrawer';

import { InterventionSandbox } from '../components/interventions/InterventionSandbox';
import { DecisionSupportCard } from '../components/interventions/DecisionSupportCard';
import { SituationGraphView } from '../components/graph/SituationGraphView';
import { MitreAttackPanel } from '../components/intelligence/MitreAttackPanel';
import { ThreatDNAPanel } from '../components/intelligence/ThreatDNAPanel';
import { IntelligenceRelevancePanel } from '../components/intelligence/IntelligenceRelevancePanel';
import { AuditAndHealthPanel } from '../components/governance/AuditAndHealthPanel';
import { FeedbackModal } from '../components/governance/FeedbackModal';

import type { MainNavSection } from '../components/layout/Sidebar';
import { ArgusCameraWall } from '../components/intelligence/ArgusCameraWall';
import { LiveVideoDetectionPanel } from '../components/intelligence/LiveVideoDetectionPanel';
import { LiveWebcamDetector } from '../components/intelligence/LiveWebcamDetector';
import { VideoThreatAnalyzer } from '../components/intelligence/VideoThreatAnalyzer';
import { CrimeScriptPlanner } from '../components/intelligence/CrimeScriptPlanner';
import { SentinelAIAssistant } from '../components/intelligence/SentinelAIAssistant';
import { SituationJourneyView } from '../components/journey/SituationJourneyView';
import { SituationExecutiveConsole } from '../components/situation/SituationExecutiveConsole';

interface DashboardProps {
  activeSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  onSituationStateChange: (state: any) => void;
  onRefreshTrigger?: number;
  devMode: boolean;
  onCloseDevMode: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeSection,
  onSelectSection,
  onSituationStateChange,
  onRefreshTrigger,
  devMode,
  onCloseDevMode,
}) => {
  // Core Operational State
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [currentSituation, setCurrentSituation] = useState<Situation | null>(null);
  const [timeline, setTimeline] = useState<SituationTransition[]>([]);
  const [prediction, setPrediction] = useState<FutureStatePrediction | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulatedIntervention | null>(null);
  const [recommendation, setRecommendation] = useState<DecisionSupportRecommendation | null>(null);
  const [graphData, setGraphData] = useState<SituationGraphData | null>(null);

  // Situational Reasoning & 3D Digital Twin State
  const [campusData, setCampusData] = useState<SiteCampus | null>(null);
  const [topologyConflicts, setTopologyConflicts] = useState<TopologyConflict[]>([]);
  const [evidenceShadow, setEvidenceShadow] = useState<EvidenceShadow | null>(null);
  const [whyNotDecisions, setWhyNotDecisions] = useState<WhyNotDecision[]>([]);
  const [vlmSynthesis, setVlmSynthesis] = useState<VLMSituationSynthesis | null>(null);
  const [sourceWeather, setSourceWeather] = useState<SourceWeatherReport | null>(null);

  // Enterprise Telemetry
  const [threatIndicators, setThreatIndicators] = useState<ThreatIntelligenceIndicator[]>([]);
  const [mitreMappings, setMitreMappings] = useState<ATTACKMapping[]>([]);
  const [behavioralAnomalies, setBehavioralAnomalies] = useState<BehavioralAnomaly[]>([]);
  const [blastRadius, setBlastRadius] = useState<BlastRadiusData | null>(null);
  const [attackChain, setAttackChain] = useState<AttackChainData | null>(null);
  const [riskExplanation, setRiskExplanation] = useState<ExplainableRiskData | null>(null);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);

  // Internal UI Sub-Tabs
  const [cameraSubTab, setCameraSubTab] = useState<'LIVE_YOLO' | 'CAMERA_WALL' | 'LIVE_WEBCAM' | 'VIDEO_ANALYZER' | 'CRIME_SCRIPT'>('LIVE_YOLO');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch live events & source weather
      const [evts, weather] = await Promise.all([
        api.getEvents({ limit: 40 }).catch(() => []),
        api.getSourceWeather().catch(() => null)
      ]);
      setEvents(evts);
      setSourceWeather(weather);

      // 2. Fetch active situations
      const sits = await api.getSituations();
      if (sits.length > 0) {
        const active = sits[0];
        setCurrentSituation(active);
        onSituationStateChange(active.status);

        // 3. Parallel fetch reasoning & telemetry
        const [
          tl, pred, rec, grp,
          campus, conflicts, shadow, whyNot, vlm,
          iocs, mitre, beh, br, chain, risk, metrics, audits, health, sysMet
        ] = await Promise.all([
          api.getSituationTimeline(active.situation_id).catch(() => []),
          api.getSituationPredictions(active.situation_id).catch(() => null),
          api.getSituationRecommendation(active.situation_id).catch(() => null),
          api.getSituationGraph(active.situation_id).catch(() => null),

          // Reasoning APIs
          api.getCampusDigitalTwin().catch(() => null),
          api.getTopologyConflicts().catch(() => []),
          api.getEvidenceShadow(active.situation_id).catch(() => null),
          api.getWhyNotDecisions(active.situation_id).catch(() => []),
          api.getVLMSituationSynthesis(active.situation_id).catch(() => null),

          // Threat Intel & Telemetry
          api.getThreatIndicators().catch(() => []),
          api.getMitreMappings(active.situation_id).catch(() => []),
          api.getBehavioralAnomalies().catch(() => []),
          api.getBlastRadius(active.situation_id).catch(() => null),
          api.getAttackChain(active.situation_id).catch(() => null),
          api.getRiskExplanation(active.situation_id).catch(() => null),
          api.getEvaluationMetrics().catch(() => null),
          api.getAuditTrail().catch(() => []),
          api.getSystemHealth().catch(() => null),
          api.getSystemMetrics().catch(() => null),
        ]);

        setTimeline(tl);
        setPrediction(pred);
        setRecommendation(rec);
        setGraphData(grp);
        setCampusData(campus);
        setTopologyConflicts(conflicts);
        setEvidenceShadow(shadow);
        setWhyNotDecisions(whyNot);
        setVlmSynthesis(vlm);
        setThreatIndicators(iocs);
        setMitreMappings(mitre);
        setBehavioralAnomalies(beh);
        setBlastRadius(br);
        setAttackChain(chain);
        setRiskExplanation(risk);
        setEvaluationMetrics(metrics);
        setAuditLogs(audits);
        setSystemHealth(health);
        setSystemMetrics(sysMet);
      }
    } catch (err) {
      console.error('Failed to poll dashboard telemetry:', err);
    }
  }, [onSituationStateChange]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, onRefreshTrigger]);

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  const handleSimulate = async (action: InterventionAction) => {
    if (!currentSituation) return null;
    setIsLoading(true);
    try {
      const res = await api.simulateIntervention(currentSituation.situation_id, action);
      setActiveSimulation(res);
      const rec = await api.getSituationRecommendation(currentSituation.situation_id);
      setRecommendation(rec);
      return res;
    } catch (e) {
      console.error('Simulation error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full overflow-hidden">
      {/* =========================================================================
          VIEW 1: EXECUTIVE SITUATION CONSOLE (Target 5-Level Visual Hierarchy)
          Hero → Intelligence Workspace (3-col) → Prediction → What-If Intervention
          ========================================================================= */}
      {activeSection === 'overview' && (
        <SituationExecutiveConsole
          situation={currentSituation}
          prediction={prediction}
          recommendation={recommendation}
          graphData={graphData}
          campusData={campusData}
          evidenceShadow={evidenceShadow}
          whyNotDecisions={whyNotDecisions}
          vlmSynthesis={vlmSynthesis}
          threatIndicators={threatIndicators}
          mitreMappings={mitreMappings}
          behavioralAnomalies={behavioralAnomalies}
          blastRadius={blastRadius}
          attackChain={attackChain}
          riskExplanation={riskExplanation}
          events={events}
          activeSimulation={activeSimulation}
          isLoading={isLoading}
          onSimulate={handleSimulate}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onSelectSection={onSelectSection}
          sourceWeather={sourceWeather}
        />
      )}

      {/* =========================================================================
          VIEW: CYBER-PHYSICAL THREAT INTELLIGENCE (T14 Video Command Suite)
          ========================================================================= */}
      {activeSection === 'cyber_physical' && (
        <div className="space-y-6">
          {/* iOS 26 Segmented Glass Pill Sub-Navigation Bar */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-[#140e08]/90 via-[#0d0905]/85 to-[#140e08]/90 p-2 rounded-full border border-[#c9a15d]/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-3xl flex-wrap">
            <button
              onClick={() => setCameraSubTab('LIVE_YOLO')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                cameraSubTab === 'LIVE_YOLO'
                  ? 'bg-gradient-to-b from-[#5c3e1a] via-[#3a2612] to-[#1e1308] text-[#fff6e4] border border-[#f0d28f]/80 shadow-[0_0_20px_rgba(240,210,143,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🎯 Live Video Intelligence (YOLO Engine)</span>
            </button>
            <button
              onClick={() => setCameraSubTab('CAMERA_WALL')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${
                cameraSubTab === 'CAMERA_WALL'
                  ? 'bg-gradient-to-b from-[#4d351a] via-[#312010] to-[#1a1107] text-[#fff6e4] border border-[#f0d28f]/60 shadow-[0_0_18px_rgba(240,210,143,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              🎥 Multi-Camera Vision Wall
            </button>
            <button
              onClick={() => setCameraSubTab('LIVE_WEBCAM')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                cameraSubTab === 'LIVE_WEBCAM'
                  ? 'bg-gradient-to-b from-[#4d1a1a] via-[#311010] to-[#1a0707] text-rose-200 border border-rose-400/60 shadow-[0_0_18px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 Live System USB Webcam Sensor</span>
            </button>
            <button
              onClick={() => setCameraSubTab('VIDEO_ANALYZER')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${
                cameraSubTab === 'VIDEO_ANALYZER'
                  ? 'bg-gradient-to-b from-[#4d351a] via-[#312010] to-[#1a1107] text-[#fff6e4] border border-[#f0d28f]/60 shadow-[0_0_18px_rgba(240,210,143,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              📹 Drop-in Video Threat Analyzer
            </button>
            <button
              onClick={() => setCameraSubTab('CRIME_SCRIPT')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${
                cameraSubTab === 'CRIME_SCRIPT'
                  ? 'bg-gradient-to-b from-[#4d351a] via-[#312010] to-[#1a1107] text-[#fff6e4] border border-[#f0d28f]/60 shadow-[0_0_18px_rgba(240,210,143,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]'
                  : 'text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/5 border border-transparent'
              }`}
            >
              📉 Crime Script & Response Planner
            </button>
          </div>

          {/* Sub-Tab Content */}
          {cameraSubTab === 'LIVE_YOLO' && (
            <LiveVideoDetectionPanel
              onInspectEvidence={() => {
                onSelectSection('situations');
                fetchDashboardData();
              }}
            />
          )}
          {cameraSubTab === 'CAMERA_WALL' && <ArgusCameraWall />}
          {cameraSubTab === 'LIVE_WEBCAM' && <LiveWebcamDetector onEventEmitted={fetchDashboardData} />}
          {cameraSubTab === 'VIDEO_ANALYZER' && <VideoThreatAnalyzer />}
          {cameraSubTab === 'CRIME_SCRIPT' && <CrimeScriptPlanner onSimulate={handleSimulate} />}

          {/* Bottom: Dual-Domain Engine (Threat DNA & Intelligence Relevance) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6">
              <ThreatDNAPanel situationId={currentSituation?.situation_id} />
            </div>
            <div className="lg:col-span-6">
              <IntelligenceRelevancePanel situationId={currentSituation?.situation_id} />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: 5-STAGE SITUATION JOURNEY & INVESTIGATION ROOM
          ========================================================================= */}
      {activeSection === 'situations' && (
        <SituationJourneyView
          situation={currentSituation}
          events={events}
          timeline={timeline}
          prediction={prediction}
          recommendation={recommendation}
          graphData={graphData}
          campusData={campusData}
          evidenceShadow={evidenceShadow}
          whyNotDecisions={whyNotDecisions}
          vlmSynthesis={vlmSynthesis}
          threatIndicators={threatIndicators}
          mitreMappings={mitreMappings}
          behavioralAnomalies={behavioralAnomalies}
          blastRadius={blastRadius}
          attackChain={attackChain}
          riskExplanation={riskExplanation}
          activeSimulation={activeSimulation}
          isLoading={isLoading}
          onSimulate={handleSimulate}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onSelectSection={onSelectSection}
          onRefreshData={fetchDashboardData}
        />
      )}

      {/* =========================================================================
          VIEW 3: THREAT GRAPH & 3D SPATIAL TWIN
          ========================================================================= */}
      {activeSection === 'graph' && (
        <div className="space-y-5">
          <SituationGraphView graphData={graphData} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <DigitalTwinCanvas
                campusData={campusData}
                activeSituationId={currentSituation?.situation_id}
                threatLevel={0.92}
              />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <ThreatDNAPanel situationId={currentSituation?.situation_id} />
              <MitreAttackPanel mappings={mitreMappings} />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: COUNTERFACTUAL SANDBOX & AUDIT LEDGER
          ========================================================================= */}
      {activeSection === 'simulation' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <InterventionSandbox
                onSimulate={handleSimulate}
                activeSimulation={activeSimulation}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-6">
              <DecisionSupportCard recommendation={recommendation} />
            </div>
          </div>
          <AuditAndHealthPanel
            auditLogs={auditLogs}
            metrics={systemMetrics}
            health={systemHealth}
          />
        </div>
      )}

      {/* Operator Feedback Modal */}
      {currentSituation && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          situationId={currentSituation.situation_id}
          predictionId={prediction?.situation_id}
          onClose={() => setIsFeedbackOpen(false)}
          onSubmitted={fetchDashboardData}
        />
      )}

      {/* Developer Diagnostics Drawer */}
      <DevObservabilityDrawer
        isOpen={devMode}
        onClose={onCloseDevMode}
        metrics={systemMetrics}
        health={systemHealth}
        threatCount={threatIndicators.length}
        anomalyCount={behavioralAnomalies.length}
        f1Score={evaluationMetrics?.precision ? parseFloat(evaluationMetrics.precision) : (riskExplanation ? 0.96 : 0.94)}
        conflictCount={topologyConflicts.length}
      />

      {/* T14-Style Natural Language AI Security Assistant Floating Query Bar */}
      <SentinelAIAssistant onSelectSection={(sec) => onSelectSection(sec as MainNavSection)} />
    </div>
  );
};
