import React from 'react';
import { Sparkline } from './Sparkline';

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
    <div style={{ padding: '4px 0 12px' }}>
      <div className="statement-greeting">Good afternoon, {merchantName}</div>
      <h1 className="statement-main-serif">
        MerchIntell protected <span style={{ color: 'var(--accent-purple)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{fmt(protectedRevenue)}</span><br />
        in revenue this month.
      </h1>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-sub)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>{fmt(exposedRevenue)} currently exposed across {activeOpportunitiesCount} opportunities.</span>
        <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
          ↑ 14.2% vs previous period
        </span>
      </div>

      {/* Financial Summary Terminal Panel (Matching Reference) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24, padding: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16
      }}>
        {/* Metric 1: Revenue Protected */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REVENUE PROTECTED
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4, letterSpacing: '-0.5px' }}>
              {fmt(protectedRevenue)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', marginTop: 4 }}>
              ↑ 14.2%
            </div>
          </div>
          <div style={{ paddingTop: 4 }}>
            <Sparkline data={[21000, 23500, 24000, 25800, 26900, 27696]} isNegative={false} width={100} height={32} />
          </div>
        </div>

        {/* Metric 2: Revenue Exposed */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: '1px solid var(--border-color)', paddingLeft: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REVENUE EXPOSED
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--risk-red)', marginTop: 4, letterSpacing: '-0.5px' }}>
              {fmt(exposedRevenue)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--risk-red)', marginTop: 4 }}>
              ↓ 5.6%
            </div>
          </div>
          <div style={{ paddingTop: 4 }}>
            <Sparkline data={[3400, 3100, 2800, 2500, 2300, 2138]} isNegative={true} width={100} height={32} />
          </div>
        </div>

        {/* Metric 3: Inventory Health */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: '1px solid var(--border-color)', paddingLeft: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              INVENTORY HEALTH
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginTop: 4, letterSpacing: '-0.5px' }}>
              {inventoryHealthPct}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', marginTop: 4 }}>
              ↑ 3.1%
            </div>
          </div>
          <div style={{ paddingTop: 4 }}>
            <Sparkline data={[88, 89, 91, 92, 93, 94]} isNegative={false} width={100} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
};
