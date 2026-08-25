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
      case 'SLOW_MOVING':return { label: 'Slow moving',   color: '#c2410c' };
      case 'STOCKOUT':   return { label: 'Stockout risk', color: 'var(--risk-red)' };
      case 'MARGIN_LEAK':return { label: 'Margin leak',   color: '#1d4ed8' };
      case 'OVERSTOCK':  return { label: 'Excess stock',  color: '#6d28d9' };
      default:           return { label: 'Attention',     color: 'var(--accent-purple)' };
    }
  };

  const badge = riskBadge(item.riskStatus);

  const getReasonText = () => {
    if (item.riskStatus === 'SLOW_MOVING') {
      return `${item.currentStock} units · ${Math.round(item.currentStock / Math.max(0.1, item.dailyVelocity))} days stock cover`;
    }
    if (item.riskStatus === 'STOCKOUT') {
      return `${Math.round(item.currentStock / Math.max(0.1, item.dailyVelocity))} days stock cover · ${item.currentStock} units remaining`;
    }
    if (item.riskStatus === 'MARGIN_LEAK') {
      return `Margin is ${item.marginPct}% · below category target`;
    }
    return `Stock: ${item.currentStock} units · Velocity: ${item.dailyVelocity}/day`;
  };

  const parseProductAndStore = (rawName: string, categoryName?: string) => {
    let clean = rawName.replace(/^PROD-\d+\s*/i, '').replace(/^SEG-\d+\s*/i, '').trim();
    let storeContext = categoryName || 'Femme Footwear';
    let productTitle = clean;

    const knownDivisions = ['Femme Footwear', 'Scholar Footwear', 'Junior Apparel', 'Apparel', 'Footwear'];
    for (const div of knownDivisions) {
      if (clean.toLowerCase().startsWith(div.toLowerCase())) {
        storeContext = div;
        productTitle = clean.substring(div.length).trim();
        break;
      }
    }

    return {
      title: productTitle || clean,
      store: storeContext,
    };
  };

  const parsed = parseProductAndStore(item.name, item.category);

  return (
    <div
      className="copilot-list-row"
      onClick={() => onSelect(item)}
      style={{ padding: '14px 4px' }}
    >
      {/* Product Name & Context Signal */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap' }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>
            {parsed.title}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, flexShrink: 0 }}>
            {badge.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 3 }}>
          {parsed.store} · STR-1001 · {getReasonText()}
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
