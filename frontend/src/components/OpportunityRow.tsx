import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface OpportunityRowProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ item, onSelect }) => {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'EXPIRY':     return { label: 'Expiry Risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'Stockout Risk', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'MARGIN_LEAK':return { label: 'Margin Leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
    }
  };

  const badge = riskBadgeStyle(item.riskStatus);

  return (
    <div
      className="copilot-row"
      onClick={() => onSelect(item)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8, background: 'var(--bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
        }}>
          🛒
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{item.name}</span>
            <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
              {badge.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {item.category} · <span style={{ fontFamily: 'monospace' }}>{item.sku}</span> · Demand: <strong style={{ color: item.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>{item.trend3d > 0 ? `+${item.trend3d}%` : `${item.trend3d}%`}</strong> · {item.currentStock} units remaining {item.expiryDays !== null ? `· Expires in ${item.expiryDays} days` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)' }}>EXPOSED</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)' }}>{fmt(item.revenueAtRisk)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)' }}>RECOVERABLE</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{fmt(item.recoverableRevenue)}</div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: 180 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-blue)' }}>RECOMMENDS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.recommendedAction}</div>
        </div>
        <div className="row-arrow-icon" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--text-sub)' }}>
          <span>Review</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};
