export interface HealthStatus {
  status: string;
}

export type PageView = 
  | 'overview'
  | 'leaks'
  | 'decisions'
  | 'approvals'
  | 'timeline'
  | 'changed'
  | 'recovered'
  | 'failures'
  | 'experiments';

export interface OpportunityItem {
  category: string;
  store_id: number;
  product_id: number;
  store: string;
  product: string;
  estimated_opportunity: number;
  confidence: number;
  priority: string;
  priority_score?: number;
  evidence?: string[];
  explanation?: string;
  recommended_action?: string;
}

export interface OpportunitySummary {
  total_estimated_opportunity: number;
  confidence_adjusted_opportunity: number;
  total_opportunities_count: number;
  by_category: Record<string, { count: number; total_impact: number }>;
  opportunities: OpportunityItem[];
}

export interface SimulationScenario {
  order_quantity?: number;
  discount_percent?: number;
  expected_sales: number;
  expected_revenue: number;
  expected_gross_profit: number;
  expected_contribution?: number;
  stockout_probability?: number;
  cash_locked?: number;
  expiry_risk_probability?: number;
  expected_waste_cost?: number;
  policy_validation?: {
    allowed: boolean;
    violations: string[];
  };
}

export interface AgentActionItem {
  id: number;
  store_id: number;
  action_type: string;
  recommendation: string;
  agent_reasoning: string;
  tool_calls?: any;
  evidence?: any;
  expected_outcome?: any;
  confidence: number;
  risk_level: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
  created_at?: string;
  approval?: {
    approved: boolean | null;
    merchant_notes: string | null;
    approved_at: string | null;
  };
}

export interface RevenueOpportunity {
  opportunity_id: string;
  merchant_id: number;
  store_id: number;
  product_id?: number;
  opportunity_type: string;
  estimated_revenue_loss: number;
  estimated_recoverable_revenue: number;
  estimated_profit_impact: number;
  confidence: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  recommended_action: string;
  alternatives: string[];
  created_at: string;
  status: string;
}

export interface DecisionCandidate {
  action_name: string;
  label: string;
  order_quantity: number;
  discount_percent: number;
  expected_sales: number;
  expected_revenue: number;
  expected_gross_profit: number;
  stockout_probability: number;
  waste_probability: number;
  cash_locked: number;
  action_risk_level: string;
  overall_score: number;
  normalized_metrics?: Record<string, number>;
}

export interface UnifiedDecision {
  store_id: number;
  action_id: number;
  product_name: string;
  opportunity: any;
  recommended_action: string;
  winning_candidate: DecisionCandidate;
  do_nothing_comparison: DecisionCandidate;
  scored_candidates: DecisionCandidate[];
  why_this_decision: {
    what_happened: string;
    why_opportunity: string;
    what_expected: string;
    what_if_do_nothing: string;
    alternatives_simulated: string[];
    why_selected: string;
    policy_applied: string;
  };
  why_not_the_other_options: Array<{
    option: string;
    status: string;
    overall_score: number;
    reason: string;
  }>;
  confidence: number;
  risk_level: string;
  requires_approval: boolean;
  audit_timeline: TimelineStep[];
}

export interface TimelineStep {
  stage: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'FAILED';
  details: string;
  timestamp?: string | null;
}

export interface OutcomeRecord {
  total_actions_evaluated: number;
  mean_prediction_error_pct: number;
  total_revenue_recovered: number;
  total_profit_recovered: number;
  waste_avoided_units: number;
  stockouts_avoided_units: number;
  confidence_calibration_delta: number;
  calibrated_base_confidence: number;
  history: any[];
}

export interface FailureRecord {
  id: number;
  failure_type: string;
  predicted_value?: number;
  actual_value?: number;
  error_percentage?: number;
  possible_cause: string;
  recovery_action: string;
  details?: any;
  created_at?: string;
}

export interface Experiment {
  experiment_id: string;
  name: string;
  description: string;
  store_id: number;
  product_name: string;
  strategies: Array<{ arm: string; name: string; description: string }>;
  status: string;
}
