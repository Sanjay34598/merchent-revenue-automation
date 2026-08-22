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
