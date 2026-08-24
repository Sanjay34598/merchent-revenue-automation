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
      case 'EXPIRY':     return { label: 'Expiry risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'Stockout risk', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'MARGIN_LEAK':return { label: 'Margin leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
    }
  };

  const badge = riskBadgeStyle(item.riskStatus);

  // Derive realistic signal text based on risk status
  const getSignalDescription = () => {
    if (item.riskStatus === 'EXPIRY') {
      return `Demand ↓${Math.abs(item.trend3d)}% · ${item.currentStock} units · expires in ${item.expiryDays ?? 2} days`;
    }
    if (item.riskStatus === 'STOCKOUT') {
      return `Demand ↑${Math.abs(item.trend3d)}% · ${item.currentStock} units remaining · ${((item.currentStock / Math.max(item.dailyVelocity, 0.1))).toFixed(1)} days cover`;
    }
    if (item.riskStatus === 'MARGIN_LEAK') {
      return `Supplier cost ↑6.2% · selling price unchanged`;
    }
    if (item.riskStatus === 'OVERSTOCK') {
      return `Stock level high (${item.currentStock} units) · ${((item.currentStock / Math.max(item.dailyVelocity, 0.1))).toFixed(0)} days cover`;
    }
    return `Stock: ${item.currentStock} units · Velocity: ${item.dailyVelocity}/day`;
  };

  return (
    <div
      className="copilot-row"
      onClick={() => onSelect(item)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{item.name}</span>
            <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
              {badge.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {getSignalDescription()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)', letterSpacing: '0.04em' }}>EXPOSED</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)', marginTop: 1 }}>{fmt(item.revenueAtRisk)}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', letterSpacing: '0.04em' }}>RECOVERABLE</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 1 }}>{fmt(item.recoverableRevenue)}</div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 140 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-blue)', letterSpacing: '0.04em' }}>RECOMMENDS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 1 }}>{item.recommendedAction}</div>
        </div>

        <div className="row-arrow-icon" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--text-sub)' }}>
          <span>Review</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};
