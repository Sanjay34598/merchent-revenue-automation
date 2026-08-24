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
  protectedRevenue = 27696,
  exposedRevenue = 2138,
  activeOpportunitiesCount = 36,
  totalProductsCount = 150,
  onViewRevenue,
}) => {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const protectedTrend = [22400, 23800, 24500, 25200, 26100, 26900, 27696];

  return (
    <div style={{ padding: '0 0 4px' }}>
      
      {/* Enterprise Infrastructure Live Indicator */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12
      }}>
        <span className="monitoring-dot" />
        <span>AI ACTIVITY · Monitoring {totalProductsCount} products · {activeOpportunitiesCount} risks detected · 7 requiring attention</span>
      </div>

      {/* Main Financial Statement */}
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main-serif">
        MerchIntell protected <span style={{ color: '#6C4EFF', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{fmt(protectedRevenue)}</span><br />
        in revenue this month.
      </h1>

      {/* Exposed Revenue Subhead & Subtle 30-Day Protection Trend Line */}
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
          {' '}currently at risk · {activeOpportunitiesCount} opportunities
        </span>

        {/* Subtle Protected Revenue Trend Visualization */}
        <div
          onClick={onViewRevenue}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '3px 10px', background: 'rgba(255,255,255,0.6)',
            border: '1px solid var(--border-color)', borderRadius: 100,
            cursor: 'pointer'
          }}
          title="Protected revenue 30-day trend — click to view revenue analysis"
        >
          <Sparkline data={protectedTrend} isNegative={false} width={50} height={16} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)' }}>+14.2% vs prev period</span>
        </div>
      </div>

    </div>
  );
};
