import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';
import { ProductThumbnail } from './ProductThumbnail';

interface OpportunityRowProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ item, onSelect }) => {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'EXPIRY':     return { label: 'Expiry Risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'Stockout Risk', bg: '#EFF4FF', color: '#3B82F6', border: '#C7D7FE' };
      case 'MARGIN_LEAK':return { label: 'Margin Leak',   bg: '#FFF6ED', color: '#D97706', border: '#FFE0C2' };
      case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' };
      default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
    }
  };

  const badge = riskBadgeStyle(item.riskStatus);

  const getSignalDescription = () => {
    if (item.riskStatus === 'EXPIRY') {
      return `Demand ↓ ${Math.abs(item.trend3d)}% · ${item.currentStock} units left · Expires in ${item.expiryDays ?? 2} days`;
    }
    if (item.riskStatus === 'STOCKOUT') {
      return `Demand ↑ ${Math.abs(item.trend3d)}% · ${item.currentStock} units left · Cover ${(item.currentStock / Math.max(item.dailyVelocity, 0.1)).toFixed(1)} days`;
    }
    if (item.riskStatus === 'MARGIN_LEAK') {
      return `Supplier cost ↑ 6.2% · Margin ↓ 3.1pp`;
    }
    if (item.riskStatus === 'OVERSTOCK') {
      return `Stock level high (${item.currentStock} units) · Cover ${(item.currentStock / Math.max(item.dailyVelocity, 0.1)).toFixed(0)} days`;
    }
    return `Stock: ${item.currentStock} units · Velocity: ${item.dailyVelocity}/day`;
  };

  return (
    <div
      className="copilot-row"
      onClick={() => onSelect(item)}
    >
      {/* Left: Product Thumbnail & Name Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        <ProductThumbnail name={item.name} category={item.category} size={48} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>{item.name}</span>
            <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
              {badge.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 3 }}>
            {item.category} · <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2, fontWeight: 500 }}>
            {getSignalDescription()}
          </div>
        </div>
      </div>

      {/* Right Metrics: Exposed, Recoverable, Recommendation, Review Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)', letterSpacing: '0.04em' }}>EXPOSED</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--risk-red)', marginTop: 2 }}>{fmt(item.revenueAtRisk)}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', letterSpacing: '0.04em' }}>RECOVERABLE</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(item.recoverableRevenue)}</div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 130 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>RECOMMENDS</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{item.recommendedAction}</div>
        </div>

        <button
          className="row-arrow-icon"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px',
            borderRadius: 100, border: 'none', background: 'var(--accent-purple-bg)',
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
