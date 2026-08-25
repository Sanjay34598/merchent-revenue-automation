import React from 'react';
import { Sparkline } from './Sparkline';

interface FinancialHeroProps {
  merchantName?: string;
  protectedRevenue?: number;
  exposedRevenue?: number;
  activeOpportunitiesCount?: number;
  totalProductsCount?: number;
  onViewRevenue?: () => void;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  merchantName = 'Sanjay',
  protectedRevenue = 10482110,
  exposedRevenue = 2829779,
  activeOpportunitiesCount = 36,
  totalProductsCount = 2326,
  onViewRevenue,
}) => {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const protectedTrend = [8400000, 8900000, 9200000, 9600000, 10000000, 10200000, protectedRevenue];

  return (
    <div style={{ padding: '0 0 4px' }}>
      
      {/* Enterprise Infrastructure Live Indicator */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12
      }}>
        <span className="monitoring-dot" />
        <span>AI ACTIVITY · Monitoring {totalProductsCount} dataset products · {activeOpportunitiesCount} active risk opportunities · 7 requiring attention</span>
      </div>

      {/* Main Financial Statement */}
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main-serif">
        Historical revenue analyzed: <span style={{ color: 'var(--accent-purple)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{fmt(protectedRevenue)}</span><br />
        across 40 store outposts (Jun 2025 – Apr 2026).
      </h1>

      {/* Exposed Revenue Subhead & Historical Revenue Trend Line */}
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-sub)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span>
          <button
            onClick={onViewRevenue}
            style={{
              background: 'none', border: 'none', padding: 0, color: 'var(--risk-red)',
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            {fmt(exposedRevenue)}
          </button>
          {' '}currently at risk · {activeOpportunitiesCount} active risk opportunities
        </span>

        {/* Historical Revenue Trend Visualization Pill */}
        <div
          onClick={onViewRevenue}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '3px 10px', background: 'var(--trend-pill-bg)',
            border: '1px solid var(--trend-pill-border)', borderRadius: 100,
            cursor: 'pointer'
          }}
          title="Historical sales baseline trend — click to view revenue analysis"
        >
          <Sparkline data={protectedTrend} isNegative={false} width={50} height={16} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--trend-pill-text)' }}>+14.2% vs baseline</span>
        </div>
      </div>

    </div>
  );
};
