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
