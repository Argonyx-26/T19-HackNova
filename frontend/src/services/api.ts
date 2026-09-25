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

const API_BASE = 'http://127.0.0.1:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; service: string; database: string }>(res);
  },

  // Events
  async getEvents(params?: { limit?: number; source_type?: string; entity_id?: string }): Promise<NormalizedEvent[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.source_type) query.set('source_type', params.source_type);
    if (params?.entity_id) query.set('entity_id', params.entity_id);
    const res = await fetch(`${API_BASE}/api/events?${query.toString()}`);
    return handleResponse<NormalizedEvent[]>(res);
  },

  async getEvent(eventId: string): Promise<NormalizedEvent> {
    const res = await fetch(`${API_BASE}/api/events/${eventId}`);
    return handleResponse<NormalizedEvent>(res);
  },

  // Situations
  async getSituations(): Promise<Situation[]> {
    const res = await fetch(`${API_BASE}/api/situations`);
    return handleResponse<Situation[]>(res);
  },

  async getSituation(situationId: string): Promise<Situation> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}`);
    return handleResponse<Situation>(res);
  },

  async getSituationTimeline(situationId: string): Promise<SituationTransition[]> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/timeline`);
    return handleResponse<SituationTransition[]>(res);
  },

  async getSituationGraph(situationId: string): Promise<SituationGraphData> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/graph`);
    return handleResponse<SituationGraphData>(res);
  },

  // Predictions
  async getSituationPredictions(situationId: string): Promise<FutureStatePrediction> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/predictions`);
    return handleResponse<FutureStatePrediction>(res);
  },

  // Counterfactual Interventions
  async simulateIntervention(situationId: string, action: InterventionAction): Promise<SimulatedIntervention> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    return handleResponse<SimulatedIntervention>(res);
  },

  // Decision Support
  async getSituationRecommendation(situationId: string): Promise<DecisionSupportRecommendation> {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/recommendation`);
    return handleResponse<DecisionSupportRecommendation>(res);
  },

  // Simulation Controls
  async startSimulation(scenario: string = 'escalation_alpha', speed: number = 1.0) {
    const res = await fetch(`${API_BASE}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, speed }),
    });
    return handleResponse<{ status: string; message: string }>(res);
  },

  async stopSimulation() {
    const res = await fetch(`${API_BASE}/api/simulation/stop`, { method: 'POST' });
    return handleResponse<{ status: string }>(res);
  },

  async getSimulationStatus() {
    const res = await fetch(`${API_BASE}/api/simulation/status`);
    return handleResponse<{ running: boolean; current_step: number; total_steps: number }>(res);
  },

  // Real-world Context Feeds (USGS, Flights, Maritime, Layers)
  async getEarthquakes() {
    const res = await fetch(`${API_BASE}/api/context/earthquakes`);
    return handleResponse<any[]>(res);
  },

  async getFlights() {
    const res = await fetch(`${API_BASE}/api/context/flights`);
    return handleResponse<any[]>(res);
  },

  async getMaritime() {
    const res = await fetch(`${API_BASE}/api/context/maritime`);
    return handleResponse<any[]>(res);
  },

  async getLayers() {
    const res = await fetch(`${API_BASE}/api/context/layers`);
    return handleResponse<{ intel_layers: any[]; context_layers: any[] }>(res);
  },

  // Threat Intelligence
  async getThreatIndicators(type?: string) {
    const query = type ? `?indicator_type=${type}` : '';
    const res = await fetch(`${API_BASE}/api/intelligence/threat-intel/indicators${query}`);
    return handleResponse<any[]>(res);
  },

  // MITRE ATT&CK
  async getMitreMappings(situationId?: string) {
    const url = situationId
      ? `${API_BASE}/api/intelligence/mitre/situations/${situationId}`
      : `${API_BASE}/api/intelligence/mitre/mappings`;
    const res = await fetch(url);
    return handleResponse<any[]>(res);
  },

  // Behavioral
  async getBehavioralAnomalies(limit: number = 30) {
    const res = await fetch(`${API_BASE}/api/intelligence/behavioral/anomalies?limit=${limit}`);
    return handleResponse<any[]>(res);
  },

  // Blast Radius
  async getBlastRadius(situationId: string) {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/blast-radius`);
    return handleResponse<any>(res);
  },

  // Attack Chain
  async getAttackChain(situationId: string) {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/attack-chain`);
    return handleResponse<any>(res);
  },

  // Risk Explanation
  async getRiskExplanation(situationId: string) {
    const res = await fetch(`${API_BASE}/api/situations/${situationId}/risk-explanation`);
    return handleResponse<any>(res);
  },

  // Governance & Feedback
  async submitFeedback(data: {
    situation_id: string;
    feedback_type: string;
    comments: string;
    prediction_id?: string;
    observed_result?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/governance/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sentinel-operator-key'
      },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async getSituationFeedback(situationId: string) {
    const res = await fetch(`${API_BASE}/api/governance/feedback/situation/${situationId}`);
    return handleResponse<any[]>(res);
  },

  async getEvaluationMetrics() {
    const res = await fetch(`${API_BASE}/api/governance/evaluation/metrics`);
    return handleResponse<any>(res);
  },

  async getAuditTrail(limit: number = 30) {
    const res = await fetch(`${API_BASE}/api/governance/audit?limit=${limit}`, {
      headers: { 'X-API-Key': 'sentinel-operator-key' }
    });
    return handleResponse<any[]>(res);
  },

  // System Health & Telemetry
  async getSystemHealth() {
    const res = await fetch(`${API_BASE}/api/system/health`);
    return handleResponse<any>(res);
  },

  async getSystemMetrics() {
    const res = await fetch(`${API_BASE}/api/system/metrics`);
    return handleResponse<any>(res);
  }
};
