import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface OpportunityRowProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ item, onSelect }) => {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const riskBadge = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'EXPIRY':     return { label: 'Expiry risk',   color: 'var(--risk-red)' };
      case 'STOCKOUT':   return { label: 'Stockout risk', color: '#2563EB' };
      case 'MARGIN_LEAK':return { label: 'Margin leak',   color: 'var(--amber-gold)' };
      case 'OVERSTOCK':  return { label: 'Overstock',     color: '#7C3AED' };
      default:           return { label: 'Attention',     color: 'var(--accent-purple)' };
    }
  };

  const badge = riskBadge(item.riskStatus);

  const getReasonText = () => {
    if (item.riskStatus === 'EXPIRY') {
      return `${item.currentStock} ${item.sellingUnit}s · expires in ${item.expiryDays ?? 3} days`;
    }
    if (item.riskStatus === 'STOCKOUT') {
      return `1.4 days stock cover · ${item.currentStock} ${item.sellingUnit}s remaining`;
    }
    if (item.riskStatus === 'MARGIN_LEAK') {
      return `Supplier cost ↑ 6.2% · Margin ↓ 3.1pp`;
    }
    return `Stock: ${item.currentStock} ${item.sellingUnit}s`;
  };

  return (
    <div
      className="copilot-list-row"
      onClick={() => onSelect(item)}
      style={{ padding: '16px 4px' }}
    >
      {/* Product Name & Context Signal */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>{item.name}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: badge.color }}>
            {badge.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>
          {getReasonText()}
        </div>
      </div>

      {/* Exposed, Recoverable, Recommended Action & Review Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--risk-red)' }}>
            {fmt(item.revenueAtRisk)}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            EXPOSED
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--emerald-green)' }}>
            {fmt(item.recoverableRevenue)}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            RECOVERABLE
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 120 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
            {item.recommendedAction}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            RECOMMENDED
          </div>
        </div>

        <button
          className="row-arrow-icon"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
            borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}
        >
          <span>Review</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
