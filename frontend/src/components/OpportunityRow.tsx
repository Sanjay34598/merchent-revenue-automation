import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface OpportunityRowProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ item, onSelect }) => {
  const fmtK = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Math.round(n)}`;
  };

  const riskBadge = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'SLOW_MOVING': return { label: 'Slow Moving', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' };
      case 'STOCKOUT':    return { label: 'Stockout Risk', color: 'var(--risk-red)', bg: 'var(--risk-red-bg)', border: 'var(--risk-red-border)' };
      case 'MARGIN_LEAK': return { label: 'Margin Leak', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };
      case 'OVERSTOCK':   return { label: 'Excess Stock', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' };
      default:            return { label: 'Attention', color: 'var(--accent-purple)', bg: 'var(--bg-subtle)', border: 'var(--border-color)' };
    }
  };

  const badge = riskBadge(item.riskStatus);

  const parseCleanTitle = (rawName: string) => {
    let clean = rawName
      .replace(/^PROD-\d+\s*/i, '')
      .replace(/^SEG-\d+\s*/i, '')
      .trim();

    const knownDivisions = [
      'Femme Footwear Boot Collection',
      'Femme Footwear Sandal Studio',
      'Femme Footwear Stiletto Elegance',
      'Femme Footwear Ballet Flat',
      'Scholar Footwear Derby Classic',
      'Scholar Footwear School Trainer',
      'Scholar Footwear Slip-on Oxford',
      'Scholar Footwear Casual Sneaker',
      'Junior Apparel Denim Essentials',
      'Junior Apparel Sport Active',
      'Junior Apparel Winter Knitwear',
      'Junior Apparel Summer Graphic Tee',
      'Femme Footwear',
      'Scholar Footwear',
      'Junior Apparel',
      'Apparel',
      'Footwear'
    ];

    for (const div of knownDivisions) {
      if (clean.toLowerCase().startsWith(div.toLowerCase())) {
        clean = clean.substring(div.length).trim();
        break;
      }
    }

    return clean || rawName;
  };

  const cleanTitle = parseCleanTitle(item.name);
  const storeContext = 'STR-1001';
  const skuText = item.sku || `SKU: ${cleanTitle.substring(0, 3).toUpperCase()}-${String(item.id).padStart(2, '0')}`;

  const signalText = item.riskStatus === 'SLOW_MOVING'
    ? '↓ Velocity · ↑ Stock · Low sell-through'
    : item.riskStatus === 'STOCKOUT'
    ? '↑ Demand · ↓ Stock · Stockout risk'
    : item.riskStatus === 'MARGIN_LEAK'
    ? '↓ Margin · Low benchmark · Leakage'
    : '↓ Velocity · ↑ Stock · Aging inventory';

  return (
    <div
      className="copilot-list-row"
      onClick={() => onSelect(item)}
      style={{
        padding: '10px 12px',
        display: 'grid',
        gridTemplateColumns: '110px 1.5fr 80px 2fr 100px 150px',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease'
      }}
    >
      {/* 1. Risk Badge */}
      <div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg,
          border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 4, display: 'inline-block'
        }}>
          {badge.label}
        </span>
      </div>

      {/* 2. Product Title & SKU */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cleanTitle}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-sub)', fontFamily: 'monospace' }}>
          {skuText.startsWith('SKU:') ? skuText : `SKU: ${skuText}`}
        </div>
      </div>

      {/* 3. Store */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        {storeContext}
      </div>

      {/* 4. Signal Driving Risk */}
      <div style={{ fontSize: 11, color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {signalText}
      </div>

      {/* 5. Exposure */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--risk-red)' }}>
          {fmtK(item.revenueAtRisk)}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>exposed</div>
      </div>

      {/* 6. Recommended Action */}
      <div style={{ textAlign: 'right' }}>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)', color: 'var(--accent-purple)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer'
          }}
        >
          <span>{item.recommendedAction}</span>
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

