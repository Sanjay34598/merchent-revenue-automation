import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface RightIntelligencePanelProps {
  catalog?: ProductItem[];
  analyticsSummary?: any;
  exposedRevenue?: number;
  onSelectProduct?: (item: ProductItem) => void;
  onViewDecisions?: () => void;
  onViewRevenueRisks?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  catalog = [],
  analyticsSummary,
  exposedRevenue,
  onSelectProduct,
  onViewDecisions,
  onViewRevenueRisks,
}) => {
  const atRiskProducts = catalog.filter(p => p.riskStatus !== 'HEALTHY');
  const topPriorityItems = atRiskProducts.slice(0, 3);

  const riskBadgeStyle = (status: string) => {
    switch (status) {
      case 'SLOW_MOVING': return { label: 'Slow-moving', color: '#c2410c' };
      case 'STOCKOUT':    return { label: 'Stockout risk', color: 'var(--risk-red)' };
      case 'MARGIN_LEAK': return { label: 'Margin leak',   color: '#1d4ed8' };
      case 'OVERSTOCK':   return { label: 'Excess stock', color: '#6d28d9' };
      default:            return { label: 'Risk detected', color: 'var(--accent-purple)' };
    }
  };

  const fmtCurrency = (n?: number) => {
    if (n === undefined || n === null || isNaN(n)) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${Math.round(n).toLocaleString('en-IN')}`;
    return `₹${Math.round(n)}`;
  };

  const parseProductTitle = (rawName: string) => {
    let clean = rawName.replace(/^PROD-\d+\s*/i, '').replace(/^SEG-\d+\s*/i, '').trim();
    const knownDivisions = ['Scholar Footwear', 'Femme Footwear', 'Junior Apparel', 'Apparel', 'Footwear'];
    for (const div of knownDivisions) {
      if (clean.toLowerCase().startsWith(div.toLowerCase())) {
        clean = clean.substring(div.length).trim();
        break;
      }
    }
    return clean || rawName;
  };

  // Dynamic Trend Data from Backend or Analytics Summary
  const currentExposedVal = exposedRevenue || analyticsSummary?.exposed_revenue || atRiskProducts.reduce((acc, p) => acc + (p.revenueAtRisk || 0), 0) || 311937;
  const rawHistory = analyticsSummary?.daily_risk_history || [
    { date: 'Mon', value: 1420 },
    { date: 'Tue', value: 1680 },
    { date: 'Wed', value: 1540 },
    { date: 'Thu', value: 1920 },
    { date: 'Fri', value: 1760 },
    { date: 'Sat', value: 2010 },
    { date: 'Sun', value: currentExposedVal },
  ];

  const trendData = rawHistory.map((item: any) => ({
    label: item.date || item.day || 'Day',
    val: Number(item.exposed_revenue || item.value || 0),
  }));

  const trendVals = trendData.map((d: any) => d.val);
  const minTrend = Math.min(...trendVals) || 1;
  const maxTrend = Math.max(...trendVals) || 10;
  const trendRange = maxTrend - minTrend || 1;

  const chartWidth = 240;
  const chartHeight = 44;
  const pointsString = trendData.map((d: any, i: number) => {
    const x = (i / Math.max(1, trendData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.val - minTrend) / trendRange) * (chartHeight - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Dynamic Category Risk Breakdown
  const riskCategories = [
    { status: 'SLOW_MOVING', label: 'Slow-Moving', color: '#c2410c' },
    { status: 'STOCKOUT',    label: 'Stockout Risk', color: '#dc2626' },
    { status: 'MARGIN_LEAK', label: 'Margin Leak',   color: '#2563eb' },
    { status: 'OVERSTOCK',   label: 'Excess Stock', color: '#7c3aed' },
  ];

  const categoryBreakdown = riskCategories.map(cat => {
    const items = atRiskProducts.filter(p => p.riskStatus === cat.status);
    const count = items.length;
    const totalExposure = items.reduce((acc, p) => acc + (p.revenueAtRisk || 0), 0);
    return { ...cat, count, totalExposure };
  }).filter(c => c.count > 0 || c.totalExposure > 0);

  const totalCalculatedExposure = categoryBreakdown.reduce((acc, c) => acc + c.totalExposure, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      
      {/* CARD 1: TODAY'S PRIORITIES */}
      <div style={{
        background: 'var(--today-panel-bg)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)', borderRadius: 12, padding: 14,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TODAY'S PRIORITIES
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)' }}>
            Top {topPriorityItems.length} urgent
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 10 }}>
          Highest-value decisions requiring immediate attention
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topPriorityItems.map((item) => {
            const badge = riskBadgeStyle(item.riskStatus);
            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct ? onSelectProduct(item) : onViewDecisions?.()}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4, padding: '9px 11px',
                  background: 'var(--today-card-bg)', border: '1px solid var(--today-card-border)',
                  borderRadius: 8, cursor: 'pointer', transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--risk-red)' }}>
                    {fmtCurrency(item.revenueAtRisk)} exposed
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--today-card-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {parseProductTitle(item.name)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                  <span>STR-1001</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: 'var(--accent-purple)' }}>
                    <span>{item.recommendedAction}</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onViewDecisions}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-purple)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 10,
            display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}
        >
          <span>View all decision priorities</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* CARD 2: REVENUE AT RISK TREND (DARK ANALYTICS CARD) */}
      <div style={{
        background: '#111827', color: '#FFFFFF',
        border: '1px solid #1f2937', borderRadius: 12, padding: 14,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            REVENUE AT RISK TREND
          </div>
          <TrendingUp size={14} color="#f87171" />
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
          Estimated exposure across active product risks
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#f87171', letterSpacing: '-0.3px' }}>
            {fmtCurrency(currentExposedVal)}
          </span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>current detected exposure</span>
        </div>

        {/* Trend Line SVG Chart */}
        <div style={{ width: '100%', overflow: 'hidden', marginBottom: 6 }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: chartHeight, display: 'block' }}>
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          </svg>
        </div>

        {/* Day Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>
          {trendData.map((d: any, idx: number) => (
            <span key={idx}>{d.label}</span>
          ))}
        </div>

        <button
          onClick={onViewRevenueRisks || onViewDecisions}
          style={{
            background: 'none', border: 'none', color: '#c084fc',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 12,
            display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}
        >
          <span>View revenue risk details</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* CARD 3: RISK BREAKDOWN ANALYTICS CARD */}
      <div style={{
        background: 'var(--today-panel-bg)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)', borderRadius: 12, padding: 14,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          RISK BREAKDOWN
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 12 }}>
          Distribution of current exposure by risk category
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categoryBreakdown.map((cat) => {
            const pct = Math.round((cat.totalExposure / totalCalculatedExposure) * 100) || 0;
            return (
              <div key={cat.status} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-main)' }}>{cat.label}</span>
                  <span style={{ color: 'var(--text-sub)' }}>
                    {fmtCurrency(cat.totalExposure)} ({pct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(5, pct)}%`, background: cat.color, borderRadius: 3, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
