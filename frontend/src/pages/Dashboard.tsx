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
  InterventionAction
} from '../types';
import { SituationStatusCard } from '../components/situations/SituationStatusCard';
import { EventFeed } from '../components/events/EventFeed';
import { SituationTimeline } from '../components/timeline/SituationTimeline';
import { FutureStatePanel } from '../components/predictions/FutureStatePanel';
import { InterventionSandbox } from '../components/interventions/InterventionSandbox';
import { DecisionSupportCard } from '../components/interventions/DecisionSupportCard';
import { SituationGraphView } from '../components/graph/SituationGraphView';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        const [tl, pred, rec, grp] = await Promise.all([
          api.getSituationTimeline(active.situation_id).catch(() => []),
          api.getSituationPredictions(active.situation_id).catch(() => null),
          api.getSituationRecommendation(active.situation_id).catch(() => null),
          api.getSituationGraph(active.situation_id).catch(() => null),
        ]);

        setTimeline(tl);
        setPrediction(pred);
        setRecommendation(rec);
        setGraphData(grp);
      }
    } catch (err) {
      console.error('Failed to poll dashboard telemetry:', err);
    }
  }, [onSituationStateChange]);

  // Polling loop
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2500);
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
    <div className="space-y-6">
      {/* Top Split: Situation Status (Left) & Future-State Prediction (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SituationStatusCard situation={currentSituation} />
        </div>
        <div className="lg:col-span-5">
          <FutureStatePanel prediction={prediction} />
        </div>
      </div>

      {/* Middle Split: NetworkX Graph Topology (Left) & Live Event Ingestion Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SituationGraphView graphData={graphData} />
        </div>
        <div className="lg:col-span-5">
          <EventFeed events={events} />
        </div>
      </div>

      {/* Lower Split: Counterfactual "What-If" Simulation & Decision Support */}
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

      {/* Bottom Section: Situation Evolution Timeline */}
      <SituationTimeline timeline={timeline} />
    </div>
  );
};
