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
  activeOpportunitiesCount = 36,
}) => {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main-serif">
        MerchIntell protected <span style={{ color: 'var(--accent-purple)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{fmt(protectedRevenue)}</span><br />
        in revenue this month.
      </h1>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-sub)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>{fmt(exposedRevenue)} currently exposed across {activeOpportunitiesCount} opportunities.</span>
        <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
          ↑ 14.2% vs previous period
        </span>
      </div>
    </div>
  );
};
