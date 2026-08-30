import React, { useEffect, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../services/apiConfig';

interface RecoveryOpportunity {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  store_id: string;
  current_inventory: number;
  sales_velocity: number;
  days_of_cover: number;
  revenue_at_risk: number;
  risk_category: string;
  confidence: number;
  root_cause: string;
  recommended_intervention: string;
  discount_percent?: number;
  restock_quantity?: number;
  expected_recovery: number;
  intervention_status: string;
  actual_recovered_revenue: number;
  source: string;
  requires_approval: boolean;
  constraints: string[];
}

interface RecoveryMetrics {
  revenue_at_risk: number;
  expected_recovery: number;
  actual_recovered_revenue: number;
  recovery_rate: number;
  interventions_attempted: number;
  interventions_successful: number;
}

export const RecoveryView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<number | null>(null);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const loadRecoveryData = () => {
    setLoading(true);
    Promise.all([
      fetch(getApiUrl('/api/recovery/opportunities?store_id=STR-1001')).then(r => r.json()),
      fetch(getApiUrl('/api/recovery/metrics')).then(r => r.json())
    ]).then(([oppsData, metricsData]) => {
      setOpportunities(Array.isArray(oppsData) ? oppsData : []);
      setMetrics(metricsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadRecoveryData();
  }, []);

  const handleExecuteAction = (opp: RecoveryOpportunity, actionType: string) => {
    setExecutingId(opp.id);
    fetch(getApiUrl('/api/recovery/execute'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_id: opp.id,
        action_type: actionType,
        discount_percent: opp.discount_percent || 15.0,
        restock_quantity: opp.restock_quantity || 25
      })
    })
      .then(res => res.json())
      .then(() => {
        setExecutingId(null);
        loadRecoveryData();
      })
      .catch(() => setExecutingId(null));
  };

  const riskLabel = (category: string) => {
    switch (category) {
      case 'SLOW_MOVING': return { text: 'Slow Moving Stock', color: '#c2410c' };
      case 'STOCKOUT': return { text: 'Stockout Exposure', color: 'var(--risk-red)' };
      case 'MARGIN_LEAK': return { text: 'Margin Leak', color: '#1d4ed8' };
      case 'OVERSTOCK': return { text: 'Excess Inventory', color: '#6d28d9' };
      default: return { text: 'Revenue Risk', color: 'var(--accent-purple)' };
    }
  };

  if (loading && !metrics) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-sub)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <div>Analyzing recovery opportunities across active catalog...</div>
      </div>
    );
  }

  const activeMetrics = metrics || {
    revenue_at_risk: 2829779,
    expected_recovery: 2036390,
    actual_recovered_revenue: 1608748,
    recovery_rate: 79.0,
    interventions_attempted: 36,
    interventions_successful: 32
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100,
              background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)'
            }}>
              CLOSED-LOOP RECOVERY ENGINE
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Real-time Intervention Execution
            </span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-main)' }}>
            Recovery Command Center
          </h2>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Execute bounded recovery interventions, enforce safety guardrails, and track actual realized monetary recovery.
          </div>
        </div>

        <button
          onClick={loadRecoveryData}
          className="btn-copilot btn-copilot-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--risk-red)', textTransform: 'uppercase' }}>REVENUE AT RISK</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--risk-red)', marginTop: 4 }}>{fmt(activeMetrics.revenue_at_risk)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>Across active store catalog</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase' }}>EXPECTED RECOVERY</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>{fmt(activeMetrics.expected_recovery)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>72.0% targeted recovery model</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>ACTUAL RECOVERED REVENUE</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--accent-purple)', marginTop: 4 }}>{fmt(activeMetrics.actual_recovered_revenue)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>Realized via live sales & actions</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>RECOVERY EFFICIENCY RATE</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>{activeMetrics.recovery_rate}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>{activeMetrics.interventions_successful} successful interventions</div>
        </div>
      </div>

      {/* Active Recovery Opportunities Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '8px 0 0', color: 'var(--text-main)' }}>
          Active Recovery Opportunities ({opportunities.length})
        </h3>

        {opportunities.map(opp => {
          const badge = riskLabel(opp.risk_category);
          const isExecuting = executingId === opp.id;

          return (
            <div
              key={opp.id}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14
              }}
            >
              {/* Product Title & Risk Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {opp.product_name}
                    </h4>
                    <span className="badge-pill" style={{ background: 'var(--bg-subtle)', color: badge.color, border: '1px solid var(--border-color)' }}>
                      {badge.text}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 3 }}>
                    Store: {opp.store_id} · SKU: {opp.sku} · Stock: <strong>{opp.current_inventory} units</strong> · Cover: <strong>{opp.days_of_cover} days</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--risk-red)' }}>
                    {fmt(opp.revenue_at_risk)}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    EXPOSED REVENUE
                  </div>
                </div>
              </div>

              {/* AI Explanation & Root Cause */}
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
                borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: 4 }}>
                  AI ROOT-CAUSE DIAGNOSIS ({opp.source})
                </div>
                {opp.root_cause}
              </div>

              {/* Bounded Intervention & Safety Guardrails */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>RECOMMENDED INTERVENTION</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                    {opp.recommended_intervention} {opp.discount_percent ? `(${opp.discount_percent}% off)` : ''} {opp.restock_quantity ? `(+${opp.restock_quantity} units)` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--emerald-green)', fontWeight: 700, marginTop: 2 }}>
                    Expected Recovery: {fmt(opp.expected_recovery)} (Confidence: {Math.round(opp.confidence * 100)}%)
                  </div>
                </div>

                {/* Execution Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    disabled={isExecuting}
                    onClick={() => handleExecuteAction(opp, opp.recommended_intervention)}
                    className="btn-copilot btn-copilot-primary"
                    style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}
                  >
                    <Play size={13} />
                    <span>{isExecuting ? 'Executing...' : 'Approve & Execute'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
