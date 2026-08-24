import React from 'react';

interface FinancialHeroProps {
  merchantName?: string;
  protectedRevenue?: number;
  exposedRevenue?: number;
  inventoryHealthPct?: number;
  activeOpportunitiesCount?: number;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  merchantName = 'Sanjay',
  protectedRevenue = 27696,
  exposedRevenue = 2138,
  inventoryHealthPct = 94,
  activeOpportunitiesCount = 7,
}) => {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ padding: '8px 0 12px' }}>
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main">
        RevenuePilot protected <span style={{ color: 'var(--emerald-green)' }}>{fmt(protectedRevenue)}</span> in revenue this month.
      </h1>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-sub)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>{fmt(exposedRevenue)} is currently exposed across {activeOpportunitiesCount} opportunities.</span>
        <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
          ↑ 14.2% vs previous period
        </span>
      </div>

      {/* 3 Compact Typography-Driven Metrics (NOT giant cards) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 40, marginTop: 24, padding: '16px 0 8px',
        borderTop: '1px solid var(--border-color)', flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUE PROTECTED
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>
            {fmt(protectedRevenue)}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUE EXPOSED
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--risk-red)', marginTop: 2 }}>
            {fmt(exposedRevenue)}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            INVENTORY HEALTH
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
            {inventoryHealthPct}%
          </div>
        </div>
      </div>
    </div>
  );
};
