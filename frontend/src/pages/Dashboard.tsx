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
  SystemHealthData
} from '../types';
import { SituationStatusCard } from '../components/situations/SituationStatusCard';
import { EventFeed } from '../components/events/EventFeed';
import { SituationTimeline } from '../components/timeline/SituationTimeline';
import { FutureStatePanel } from '../components/predictions/FutureStatePanel';
import { InterventionSandbox } from '../components/interventions/InterventionSandbox';
import { DecisionSupportCard } from '../components/interventions/DecisionSupportCard';
import { SituationGraphView } from '../components/graph/SituationGraphView';
import { GlobalSituationalMap } from '../components/map/GlobalSituationalMap';
import { ThreatIntelPanel } from '../components/intelligence/ThreatIntelPanel';
import { MitreAttackPanel } from '../components/intelligence/MitreAttackPanel';
import { BehavioralPanel } from '../components/intelligence/BehavioralPanel';
import { BlastRadiusView } from '../components/situations/BlastRadiusView';
import { AttackChainView } from '../components/situations/AttackChainView';
import { RiskExplanationPanel } from '../components/predictions/RiskExplanationPanel';
import { AuditAndHealthPanel } from '../components/governance/AuditAndHealthPanel';
import { FeedbackModal } from '../components/governance/FeedbackModal';

import { Map, Cpu, ShieldAlert, Crosshair, Activity, MessageSquare } from 'lucide-react';

interface DashboardProps {
  onSituationStateChange: (state: any) => void;
  onRefreshTrigger?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSituationStateChange,
  onRefreshTrigger
}) => {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [currentSituation, setCurrentSituation] = useState<Situation | null>(null);
  const [timeline, setTimeline] = useState<SituationTransition[]>([]);
  const [prediction, setPrediction] = useState<FutureStatePrediction | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulatedIntervention | null>(null);
  const [recommendation, setRecommendation] = useState<DecisionSupportRecommendation | null>(null);
  const [graphData, setGraphData] = useState<SituationGraphData | null>(null);

  // New Enterprise Telemetry State
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardTab, setDashboardTab] = useState<'map' | 'analytics' | 'intel' | 'impact' | 'governance'>('map');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch live events
      const evts = await api.getEvents({ limit: 40 });
      setEvents(evts);

      // 2. Fetch active situation
      const sits = await api.getSituations();
      if (sits.length > 0) {
        const active = sits[0];
        setCurrentSituation(active);
        onSituationStateChange(active.status);

        // 3. Parallel fetch detail telemetry
        const [
          tl, pred, rec, grp,
          iocs, mitre, beh, br, chain, risk, metrics, audits, health, sysMet
        ] = await Promise.all([
          api.getSituationTimeline(active.situation_id).catch(() => []),
          api.getSituationPredictions(active.situation_id).catch(() => null),
          api.getSituationRecommendation(active.situation_id).catch(() => null),
          api.getSituationGraph(active.situation_id).catch(() => null),
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

  // Polling loop
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, onRefreshTrigger]);

  const handleSimulate = async (action: InterventionAction) => {
    if (!currentSituation) return null;
    setIsLoading(true);
    try {
      const res = await api.simulateIntervention(currentSituation.situation_id, action);
      setActiveSimulation(res);
      // Refresh recommendation to reflect latest comparison
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
    <div className="space-y-4">
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between bg-neutral-900/60 border border-neutral-800/80 px-4 py-2.5 rounded-xl gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDashboardTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              dashboardTab === 'map'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>GLOBAL MAP</span>
          </button>

          <button
            onClick={() => setDashboardTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              dashboardTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>SITUATION SUITE</span>
          </button>

          <button
            onClick={() => setDashboardTab('intel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              dashboardTab === 'intel'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>THREAT INTEL & ATT&CK</span>
          </button>

          <button
            onClick={() => setDashboardTab('impact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              dashboardTab === 'impact'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>BLAST RADIUS & KILL-CHAIN</span>
          </button>

          <button
            onClick={() => setDashboardTab('governance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              dashboardTab === 'governance'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>GOVERNANCE & TELEMETRY</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>OPERATOR FEEDBACK</span>
          </button>

          <div className="text-[11px] font-mono text-neutral-400 hidden xl:flex items-center space-x-3">
            <span>Active Threat: <strong className="text-red-400 font-semibold">{currentSituation?.status || 'NORMAL'}</strong></span>
            <span className="text-neutral-600">|</span>
            <span>Risk Velocity: <strong className="text-amber-400 font-semibold">{(prediction?.risk_delta ?? 0) > 0 ? `+${prediction?.risk_delta}` : (prediction?.risk_delta ?? 0)} pts</strong></span>
          </div>
        </div>
      </div>

      {/* VIEW 1: GLOBAL SITUATIONAL MAP (OSIRIS-STYLE) */}
      {dashboardTab === 'map' && (
        <div className="space-y-6">
          <GlobalSituationalMap
            activeSituation={currentSituation}
            events={events}
            onSelectSituation={() => setDashboardTab('analytics')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <SituationStatusCard situation={currentSituation} />
            </div>
            <div className="lg:col-span-6">
              <FutureStatePanel prediction={prediction} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL SITUATION INTELLIGENCE SUITE */}
      {dashboardTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <SituationStatusCard situation={currentSituation} />
            </div>
            <div className="lg:col-span-5">
              <FutureStatePanel prediction={prediction} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <SituationGraphView graphData={graphData} />
            </div>
            <div className="lg:col-span-5">
              <EventFeed events={events} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          <SituationTimeline timeline={timeline} />
        </div>
      )}

      {/* VIEW 3: THREAT INTEL & ATT&CK MATRIX */}
      {dashboardTab === 'intel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <ThreatIntelPanel indicators={threatIndicators} />
            </div>
            <div className="lg:col-span-6">
              <MitreAttackPanel mappings={mitreMappings} />
            </div>
          </div>

          <BehavioralPanel anomalies={behavioralAnomalies} />
        </div>
      )}

      {/* VIEW 4: BLAST RADIUS & KILL-CHAIN */}
      {dashboardTab === 'impact' && (
        <div className="space-y-6">
          <AttackChainView data={attackChain} />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <BlastRadiusView data={blastRadius} />
            </div>
            <div className="lg:col-span-6">
              <RiskExplanationPanel
                riskData={riskExplanation}
                metrics={evaluationMetrics}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: GOVERNANCE & TELEMETRY */}
      {dashboardTab === 'governance' && (
        <div className="space-y-6">
          <AuditAndHealthPanel
            auditLogs={auditLogs}
            metrics={systemMetrics}
            health={systemHealth}
          />

          <RiskExplanationPanel
            riskData={riskExplanation}
            metrics={evaluationMetrics}
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
    </div>
  );
};
