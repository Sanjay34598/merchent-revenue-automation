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

      {/* 4 Summary Cards Strip matching Reference UI */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10,
        marginBottom: 14
      }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 20 }}>🛍️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--risk-red)' }}>{fmtCurrency(calculatedExposed)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>Currently exposed</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--emerald-green)' }}>{fmtCurrency(calculatedRecovery)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>Potentially recoverable</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 20 }}>🏪</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#2563eb' }}>40</div>
            <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>Stores analyzed</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent-purple)' }}>{opportunities.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 600 }}>Active risks</div>
          </div>
        </div>
      </div>

      {/* Table Header Row (Desktop Only) */}
      <div className="opportunity-table-header" style={{
        display: 'grid', gridTemplateColumns: '110px 1.5fr 80px 2fr 100px 150px', gap: 10,
        padding: '8px 12px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)', fontSize: 10, fontWeight: 800,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'
      }}>
        <div>RISK</div>
        <div>PRODUCT</div>
        <div>STORE</div>
        <div>SIGNAL DRIVING RISK</div>
        <div>EXPOSURE</div>
        <div style={{ textAlign: 'right' }}>RECOMMENDED ACTION</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {opportunities.slice(0, 3).map((item) => (
          <OpportunityRow key={item.id} item={item} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};

