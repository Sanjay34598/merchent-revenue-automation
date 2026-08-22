export interface HealthStatus {
  status: string;
}

export type PageView = 
  | 'dashboard'
  | 'opportunities'
  | 'simulator'
  | 'agent'
  | 'actions'
  | 'failures';

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
