import React from 'react';

interface FinancialHeroProps {
  merchantName?: string;
  protectedRevenue?: number;
  exposedRevenue?: number;
  activeOpportunitiesCount?: number;
  onViewRevenue?: () => void;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  merchantName = 'Sanjay',
  protectedRevenue = 27696,
  exposedRevenue = 2138,
  activeOpportunitiesCount = 36,
  onViewRevenue,
}) => {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main-serif">
        MerchIntell protected <span style={{ color: '#6C4EFF', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{fmt(protectedRevenue)}</span><br />
        in revenue this month.
      </h1>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-sub)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
      </div>
    </div>
  );
};
