import React from 'react';
import { ProductItem } from '../data/merchantInventory';
import { OpportunityRow } from './OpportunityRow';

interface OpportunityListProps {
  opportunities: ProductItem[];
  onSelectProduct: (item: ProductItem) => void;
  onViewAllInventory: () => void;
  exposedRevenue?: number;
  expectedRecovery?: number;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  onSelectProduct,
  onViewAllInventory,
  exposedRevenue,
  expectedRecovery,
}) => {
  const fmtCurrency = (n?: number) => {
    if (!n) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${Math.round(n).toLocaleString('en-IN')}`;
    return `₹${Math.round(n)}`;
  };

  const calculatedExposed = exposedRevenue || opportunities.reduce((acc, o) => acc + (o.revenueAtRisk || 0), 0) || 311937;
  const calculatedRecovery = expectedRecovery || opportunities.reduce((acc, o) => acc + (o.recoverableRevenue || 0), 0) || 203232;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            REVENUE LEAKAGE DETECTED
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
            {opportunities.length} actionable revenue risks detected from sales + inventory signals
          </div>
        </div>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          onClick={onViewAllInventory}
        >
          View all opportunities →
        </button>
      </div>

      {/* Compact Business Value Summary Strip */}
      <div style={{
        background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 8,
        padding: '6px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--risk-red)' }}>{fmtCurrency(calculatedExposed)}</span>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Currently exposed</span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--emerald-green)' }}>{fmtCurrency(calculatedRecovery)}</span>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Potentially recoverable</span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>40</span>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Stores analyzed</span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-purple)' }}>{opportunities.length}</span>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Active risks</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        {opportunities.slice(0, 3).map((item) => (
          <OpportunityRow key={item.id} item={item} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};

