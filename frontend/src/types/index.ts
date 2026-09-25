export type SourceType = 'CCTV' | 'NETWORK' | 'ACCESS' | 'IOT';

export type SituationState = 'NORMAL' | 'ANOMALOUS' | 'SUSPICIOUS' | 'ESCALATING' | 'CRITICAL' | 'CONTAINED';

export type InterventionAction = 'MONITOR' | 'ISOLATE' | 'LOCKDOWN';

export interface NormalizedEvent {
  event_id: string;
  source_type: SourceType;
  event_type: string;
  timestamp: string;
  entity_id: string;
  location_id: string;
  severity: number;
  confidence: number;
  payload: Record<string, any>;
  processed: boolean;
  situation_id?: string;
}

export interface Situation {
  situation_id: string;
  status: SituationState;
  risk_score: number;
  summary: string;
  primary_entity_ids: string[];
  location_ids: string[];
  event_count?: number;
  event_ids?: string[];
  started_at: string;
  updated_at: string;
}

export interface SituationTransition {
  transition_id: string;
  situation_id: string;
  from_state: SituationState;
  to_state: SituationState;
  trigger_event_id: string;
  reason: string;
  risk_delta: number;
  timestamp: string;
}

export interface FutureStatePrediction {
  situation_id: string;
  current_state: SituationState;
  predicted_state: SituationState;
  risk_score: number;
  risk_delta: number;
  horizon: string;
  triggering_factors: string[];
  reason: string;
  created_at: string;
}

export interface SimulatedIntervention {
  situation_id: string;
  action: InterventionAction;
  current_state: SituationState;
  projected_state: SituationState;
  projected_risk: number;
  risk_delta: number;
  operational_impact: string;
  impact_assessment: string;
  is_simulation_only: boolean;
  created_at: string;
}

export interface ActionComparison {
  action: InterventionAction;
  projected_state: SituationState;
  projected_risk: number;
  risk_delta: number;
  operational_impact: string;
  summary: string;
}

export interface DecisionSupportRecommendation {
  recommendation_id: string;
  situation_id: string;
  current_state: SituationState;
  recommended_action: InterventionAction;
  justification: string;
  compared_actions: ActionComparison[];
  operator_authority_notice: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: string;
  source_type?: string;
  severity?: number;
  status?: string;
  zone_type?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface SituationGraphData {
  situation_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: {
    node_count: number;
    edge_count: number;
    density: number;
    connected_components: number;
    max_degree: number;
  };
}

export interface ThreatIntelligenceIndicator {
  indicator_id: string;
  indicator_type: 'IP' | 'DOMAIN' | 'HASH' | 'URL';
  value: string;
  threat_actor?: string;
  campaign?: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_reliability: string;
  context: string;
  tags: string[];
  match_count: number;
  last_seen_at?: string;
}

export interface IndicatorMatch {
  indicator_id: string;
  indicator_type: string;
  value: string;
  threat_actor?: string;
  context: string;
  matched_event_id: string;
  matched_field: string;
  confidence: string;
}

export interface ATTACKMapping {
  mapping_id: string;
  tactic: string;
  technique_id: string;
  technique_name: string;
  evidence: string;
  confidence: number;
  event_ids: string[];
  situation_id?: string;
  created_at: string;
}

export interface BehavioralAnomaly {
  anomaly_id: string;
  entity_id: string;
  baseline_id: string;
  deviation_score: number;
  anomaly_factors: string[];
  trigger_event_id: string;
  situation_id?: string;
  timestamp: string;
}

export interface BlastRadiusAsset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hop_distance: number;
  is_direct: boolean;
  dependency_path: string[];
}

export interface BlastRadiusData {
  situation_id: string;
  direct_affected_count: number;
  potential_affected_count: number;
  high_criticality_assets: string[];
  spread_dimensions: {
    physical_zones: number;
    network_endpoints: number;
    identities: number;
    databases: number;
  };
  affected_assets: BlastRadiusAsset[];
  risk_impact_summary: string;
  generated_at: string;
}

export interface AttackChainStage {
  stage: string;
  stage_order: number;
  detected: boolean;
  matched_event_ids: string[];
  techniques: string[];
  first_seen?: string;
  last_seen?: string;
}

export interface AttackChainData {
  situation_id: string;
  current_stage: string;
  stages_completed: number;
  total_stages: number;
  progression_percentage: number;
  stages: AttackChainStage[];
  reconstructed_at: string;
}

export interface OperatorFeedback {
  feedback_id: string;
  situation_id: string;
  prediction_id?: string;
  feedback_type: 'CORRECT' | 'INCORRECT' | 'UNCERTAIN' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE';
  operator_id: string;
  comments: string;
  predicted_result?: string;
  observed_result?: string;
  created_at: string;
}

export interface EvaluationMetrics {
  total_predictions: number;
  evaluated_count: number;
  confirmed_matches: number;
  deviated_count: number;
  pending_count: number;
  precision: string;
  recall: string;
  average_lead_time_seconds: number;
  status: string;
}

export interface ExplainableRiskData {
  situation_id: string;
  risk_score: number;
  confidence: number;
  trend: string;
  velocity: number;
  risk_drivers: string[];
  impact_summary: string;
  factor_weights: Record<string, number>;
  explanation: {
    decision_type: string;
    target_id: string;
    reason: string;
    evidence_summary: string;
    contributing_event_ids: string[];
    contributing_entity_ids: string[];
    confidence: number;
    rule_or_model: string;
    factors: Record<string, any>;
    timestamp: string;
  };
  timestamp: string;
}

export interface AuditLogEntry {
  audit_id: string;
  action: string;
  operator_id: string;
  role: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface SystemHealthData {
  status: string;
  service: string;
  tagline: string;
  version: string;
  environment: string;
  database: {
    status: string;
    connected: boolean;
  };
  correlation_engine: {
    status: string;
    p95_latency_ms: number;
  };
  source_health: Record<string, string>;
  timestamp: string;
}

export interface SystemMetricsData {
  metric_id: string;
  events_ingested_total: number;
  events_per_second: number;
  active_situations_count: number;
  p95_correlation_latency_ms: number;
  p95_api_latency_ms: number;
  database_status: string;
  correlation_engine_status: string;
  source_health: Record<string, string>;
  timestamp: string;
}
