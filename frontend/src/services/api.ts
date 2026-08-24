/**
 * Centralized API Service for MerchIntell Frontend
 * Single source of truth for fetching data-derived backend analytics & transaction state
 */

export interface AnalyticsSummary {
  total_transactions: number;
  gross_revenue: number;
  total_discounts: number;
  net_revenue: number;
  average_bill_value: number;
  protected_revenue: number;
  exposed_revenue: number;
  active_risk_opportunities: number;
  requiring_attention: number;
  total_products_monitored: number;
  expected_recovery_today: number;
  daily_risk_history: Array<{ day: string; value: number }>;
  payment_method_distribution: Record<string, number>;
  top_categories: Array<[string, number]>;
  data_quality: {
    transactions_processed: number;
    automatically_matched_pct: number;
    records_normalized_pct: number;
    records_requiring_review_pct: number;
    is_demo_dataset: boolean;
    demo_dataset_notice: string;
  };
  data_as_of: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  discounts: number;
  transactions: number;
}

export interface ProductPerformanceItem {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  selling_price: number;
  unit: string;
  sold_stock_30d: number;
  daily_velocity: number;
  current_stock: number;
  days_of_cover: number;
  revenue_generated: number;
  risk_type: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/analytics/summary');
    return handleResponse<AnalyticsSummary>(res);
  },

  async getRevenueTrend(): Promise<RevenueTrendPoint[]> {
    const res = await fetch('/api/analytics/revenue-trend');
    return handleResponse<RevenueTrendPoint[]>(res);
  },

  async getProductPerformance(limit = 10): Promise<ProductPerformanceItem[]> {
    const res = await fetch(`/api/analytics/product-performance?limit=${limit}`);
    return handleResponse<ProductPerformanceItem[]>(res);
  },

  async getTransactions(limit = 20) {
    const res = await fetch(`/api/transactions?limit=${limit}`);
    return handleResponse<any[]>(res);
  },

  async recordTransaction(payload: any) {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async getInventory() {
    const res = await fetch('/api/inventory');
    return handleResponse<any[]>(res);
  },

  async getRisks() {
    const res = await fetch('/api/risks');
    return handleResponse<any[]>(res);
  },

  async getDataQuality() {
    const res = await fetch('/api/data-quality');
    return handleResponse<any>(res);
  }
};
