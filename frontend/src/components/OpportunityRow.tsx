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

  return (
    <div
      className="copilot-list-row"
      onClick={() => onSelect(item)}
      style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        gap: 12,
        transition: 'background-color 0.15s ease'
      }}
    >
      {/* Left: Risk Badge, Clean Product Title & Store */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg,
          border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 4, flexShrink: 0
        }}>
          {badge.label}
        </span>

        <span style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-main)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {cleanTitle}
        </span>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'monospace' }}>
          {storeContext}
        </span>

        <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.8, flexShrink: 0 }}>
          • velocity + stock signal
        </span>
      </div>

      {/* Right: Exposure & Compact Action Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--risk-red)' }}>
            {fmtK(item.revenueAtRisk)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>exposed</span>
        </div>

        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)', color: 'var(--accent-purple)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}
        >
          <span>{item.recommendedAction.split(' ')[0]}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

