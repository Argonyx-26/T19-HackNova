export type SourceType = 'CCTV' | 'NETWORK' | 'ACCESS' | 'IOT';

export type SituationState = 'NORMAL' | 'ANOMALOUS' | 'SUSPICIOUS' | 'ESCALATING' | 'CRITICAL' | 'CONTAINED';

export type MainNavSection =
  | 'overview'
  | 'situations'
  | 'cyber_physical'
  | 'graph'
  | 'simulation';

export type InterventionAction = 'MONITOR' | 'ISOLATE' | 'LOCKDOWN';

export type UserRole = 'admin' | 'analyst' | 'jury';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  clearance: string;
  avatar: string;
  department: string;
  token?: string;
  loginTime: string;
}

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

export type IndicatorCategory = 'NETWORK_OBSERVABLE' | 'BEHAVIORAL' | 'KNOWLEDGE' | 'ENVIRONMENTAL';
export type IntelRelevance = 'RELATED' | 'POSSIBLY_RELATED' | 'UNRELATED';

export interface ThreatIntelligenceIndicator {
  indicator_id: string;
  indicator_type: string;  // Extended: IP, DOMAIN, HASH, URL, EMAIL, ACCOUNT, DEVICE, LATERAL_MOVEMENT, etc.
  category: IndicatorCategory;
  value: string;
  threat_actor?: string;
  campaign?: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_reliability: string;
  context: string;
  tags: string[];
  match_count: number;
  last_seen_at?: string;
  relevance: IntelRelevance;
  linked_physical_behavior?: string;
}

export type PhysicalBehaviorType =
  | 'LOITERING'
  | 'TAILGATING'
  | 'FORCED_ENTRY'
  | 'RESTRICTED_ZONE_ENTRY'
  | 'WEAPON_LIKE_OBJECT'
  | 'CROWD_FORMATION'
  | 'UNUSUAL_MOVEMENT'
  | 'OBJECT_ABANDONMENT'
  | 'ACCESS_CAMERA_MISMATCH'
  | 'IMPOSSIBLE_MOVEMENT';

export type ZoneClassification = 'PUBLIC' | 'CONTROLLED' | 'RESTRICTED' | 'CRITICAL';
export type BehaviorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PhysicalBehaviorEvent {
  event_id: string;
  behavior_type: PhysicalBehaviorType;
  camera_id: string;
  track_ids: string[];
  zone_id: string;
  zone_classification: ZoneClassification;
  severity: BehaviorSeverity;
  behavior_confidence: number;
  dwell_time_seconds?: number;
  entity_count?: number;
  access_event_id?: string;
  correlated_event_ids: string[];
  movement_trajectory?: string;
  object_class?: string;
  physical_note: string;
  situation_id?: string;
  timestamp: string;
}

export interface SecurityZone {
  camera_id: string;
  zone_id: string;
  zone_name: string;
  classification: ZoneClassification;
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
  is_direct?: boolean;
  compromise_likelihood?: number;
  dependency_path?: string[];
}

export interface BlastRadiusData {
  situation_id: string;
  direct_affected_count: number;
  potential_affected_count: number;
  high_criticality_assets: string[];
  spread_dimensions: {
    physical_zones?: number;
    network_endpoints?: number;
    identities?: number;
    databases?: number;
  };
  affected_assets: BlastRadiusAsset[];
  risk_impact_summary: string;
  calculated_at?: string;
  generated_at?: string;
}

export interface AttackChainStage {
  stage: string;
  stage_order: number;
  detected: boolean;
  event_ids?: string[];
  matched_event_ids?: string[];
  technique_ids?: string[];
  techniques?: string[];
  first_seen_at?: string;
  last_seen_at?: string;
  first_seen?: string;
  last_seen?: string;
  evidence?: string;
}

export interface AttackChainData {
  situation_id: string;
  current_stage: string;
  stages_completed: number;
  total_stages: number;
  progression_percentage: number;
  stages: AttackChainStage[];
  created_at?: string;
  updated_at?: string;
  reconstructed_at?: string;
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

// -------------------------------------------------------------
// SENTINEL-X REASONING & DIGITAL TWIN TYPINGS
// -------------------------------------------------------------

export type EvidenceType = 'SUPPORTING' | 'CONTRADICTORY' | 'MISSING';

export interface EvidenceItem {
  evidence_id: string;
  evidence_type: EvidenceType;
  source_modality: string;
  event_id?: string;
  title: string;
  detail: string;
  confidence: number;
  timestamp: string;
  location_id?: string;
  entity_id?: string;
  source_health_status: string;
}

export interface EvidenceShadow {
  situation_id: string;
  overall_confidence: number;
  decision_model_used: string;
  supporting_evidence: EvidenceItem[];
  contradictory_evidence: EvidenceItem[];
  missing_evidence: EvidenceItem[];
  source_health_summary: Record<string, string>;
  calculated_at: string;
}

export type WhyNotRejectionReason =
  | 'ENTITY_MISMATCH'
  | 'SPATIAL_DISTANCE_EXCEEDED'
  | 'TEMPORAL_WINDOW_EXCEEDED'
  | 'SOURCE_RELIABILITY_INSUFFICIENT'
  | 'TOPOLOGY_ISOLATION'
  | 'INCONSISTENT_THREAT_MODALITY';

export interface WhyNotDecision {
  decision_id: string;
  situation_id: string;
  rejected_event_id: string;
  rejected_event_type: string;
  rejected_source: string;
  reasons: WhyNotRejectionReason[];
  explanation: string;
  spatial_distance_meters?: number;
  temporal_gap_seconds?: number;
  threshold_limits: Record<string, any>;
  evaluated_at: string;
}

export interface VLMSituationSynthesis {
  situation_id: string;
  model_name: string;
  inference_type: string;
  executive_summary: string;
  evidence_synthesis: string;
  key_anomalies: string[];
  possible_next_developments: string[];
  suggested_operator_checklist: string[];
  grounded_evidence_ids: string[];
  confidence: number;
  latency_ms: number;
  created_at: string;
}

export type SensorFeedStatus = 'ONLINE' | 'DEGRADED' | 'DELAYED' | 'OFFLINE' | 'STALE';

export interface SensorFeedHealth {
  source_type: string;
  status: SensorFeedStatus;
  latency_ms: number;
  packet_loss_pct: number;
  last_heartbeat: string;
  total_events_today: number;
  quality_score: number;
  active_channel_count: number;
  status_detail: string;
}

export interface SourceWeatherReport {
  overall_system_health: string;
  active_sources: number;
  degraded_sources: number;
  feeds: SensorFeedHealth[];
  timestamp: string;
}

export interface SpatialAsset {
  asset_id: string;
  name: string;
  asset_type: string;
  zone_id: string;
  floor_number: number;
  coordinates_3d: { x: number; y: number; z: number };
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NORMAL' | 'SUSPICIOUS' | 'COMPROMISED' | 'OFFLINE';
  ip_address?: string;
  mac_address?: string;
}

export interface Zone {
  zone_id: string;
  name: string;
  floor_number: number;
  classification: 'PUBLIC' | 'STANDARD' | 'RESTRICTED' | 'CRITICAL_VAULT';
  polygon_2d: number[][];
  center_3d: { x: number; y: number; z: number };
  adjacent_zone_ids: string[];
  assets: SpatialAsset[];
  threat_level: number;
}

export interface BuildingFloor {
  floor_number: number;
  name: string;
  elevation_meters: number;
  zones: Zone[];
  is_compromised: boolean;
}

export interface Building {
  building_id: string;
  name: string;
  site_id: string;
  total_floors: number;
  floors: BuildingFloor[];
  center_gps: { lat: number; lng: number };
  bounding_box_3d: { width: number; height: number; depth: number };
}

export interface SiteCampus {
  site_id: string;
  name: string;
  code: string;
  buildings: Building[];
  geofence_center: { lat: number; lng: number };
  active_situations_count: number;
}

export interface TopologyConflict {
  conflict_id: string;
  conflict_type: string;
  category: 'DATA_ERROR' | 'TOPOLOGY_ERROR' | 'SECURITY_THREAT' | string;
  entity_id: string;
  reported_location: string;
  expected_location: string;
  confidence: number;
  description: string;
  timestamp: string;
  resolved: boolean;
}

// -------------------------------------------------------------------
// THREAT DNA — Cyber-Physical Incident Profile
// -------------------------------------------------------------------

export type EvidenceStrength = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface PhysicalDomainProfile {
  observed_behavior?: string;
  behavior_note: string;
  movement_trajectory?: string;
  zone_classification?: string;
  zone_id?: string;
  camera_ids: string[];
  track_ids: string[];
  dwell_seconds?: number;
  entity_count?: number;
  behavior_confidence: number;
}

export interface AccessDomainProfile {
  credential_state?: string;
  badge_event_id?: string;
  access_point?: string;
  auth_anomaly: boolean;
  failed_attempts: number;
  authorization_gap?: string;
  access_note: string;
}

export interface CyberDomainProfile {
  endpoint_id?: string;
  connection_target?: string;
  protocol?: string;
  data_volume_mb?: number;
  anomaly_type?: string;
  network_event_ids: string[];
  cyber_note: string;
  has_cyber_evidence: boolean;
}

export interface IntelligenceDomainProfile {
  ioc_matches: string[];
  ioc_values: string[];
  ttp_relevance: IntelRelevance;
  mitre_technique_ids: string[];
  mitre_tactic?: string;
  threat_group_mentioned?: string;
  campaign_mentioned?: string;
  threat_actor_attribution: string;
  attribution_note: string;
  intel_note: string;
}

export interface FusionScores {
  visual_anomaly_strength: number;
  behavior_confidence: number;
  access_anomaly_score: number;
  network_anomaly_score: number;
  asset_criticality_weight: number;
  intel_relevance_weight: number;
  correlation_confidence: number;
  situation_confidence: number;
  evidence_strength: EvidenceStrength;
  ttp_relevance: IntelRelevance;
}

export interface ThreatDNA {
  dna_id: string;
  situation_id: string;
  physical_domain: PhysicalDomainProfile;
  access_domain: AccessDomainProfile;
  cyber_domain: CyberDomainProfile;
  intelligence_domain: IntelligenceDomainProfile;
  fusion_scores: FusionScores;
  supporting_evidence_ids: string[];
  contradictory_evidence_ids: string[];
  missing_evidence_list: string[];
  incident_summary: string;
  investigation_steps: string[];
  is_cyber_physical: boolean;
  domains_active: string[];
  generated_at: string;
}

export interface CyberPhysicalFusionScore {
  situation_id: string;
  is_cyber_physical: boolean;
  domains_active: string[];
  fusion_scores: FusionScores;
  evidence_strength: EvidenceStrength;
  ttp_relevance: IntelRelevance;
  attribution_note: string;
}
