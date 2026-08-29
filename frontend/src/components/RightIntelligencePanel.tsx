import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface RightIntelligencePanelProps {
  catalog?: ProductItem[];
  onSelectProduct?: (item: ProductItem) => void;
  onViewDecisions?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  catalog = [],
  onSelectProduct,
  onViewDecisions,
}) => {
  const atRiskProducts = catalog.filter(p => p.riskStatus !== 'HEALTHY');
  const topPriorityItems = atRiskProducts.slice(0, 3);

  const riskBadgeStyle = (status: string) => {
    switch (status) {
      case 'SLOW_MOVING': return { label: 'Slow-moving', color: '#c2410c' };
      case 'STOCKOUT': return { label: 'Stockout risk', color: 'var(--risk-red)' };
      case 'MARGIN_LEAK': return { label: 'Margin leak', color: '#1d4ed8' };
      case 'OVERSTOCK': return { label: 'Excess stock', color: '#6d28d9' };
      default: return { label: 'Risk detected', color: 'var(--accent-purple)' };
    }
  };

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const parseProductTitle = (rawName: string) => {
    let clean = rawName.replace(/^PROD-\d+\s*/i, '').replace(/^SEG-\d+\s*/i, '').trim();
    const knownDivisions = ['Scholar Footwear', 'Femme Footwear', 'Junior Apparel', 'Apparel', 'Footwear'];
    for (const div of knownDivisions) {
      if (clean.toLowerCase().startsWith(div.toLowerCase())) {
        clean = clean.substring(div.length).trim();
        break;
      }
    }
    return clean || rawName;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
      {/* TODAY'S PRIORITIES PANEL */}
      <div style={{
        background: 'var(--today-panel-bg)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)', borderRadius: 12, padding: 14,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TODAY'S PRIORITIES
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)' }}>
            Top {topPriorityItems.length} urgent
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topPriorityItems.map((item) => {
            const badge = riskBadgeStyle(item.riskStatus);
            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct ? onSelectProduct(item) : onViewDecisions?.()}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4, padding: '9px 11px',
                  background: 'var(--today-card-bg)', border: '1px solid var(--today-card-border)',
                  borderRadius: 8, cursor: 'pointer', transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--risk-red)' }}>
                    {fmt(item.revenueAtRisk)} exposed
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--today-card-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {parseProductTitle(item.name)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                  <span>STR-1001</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: 'var(--accent-purple)' }}>
                    <span>{item.recommendedAction}</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onViewDecisions}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-purple)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 10,
            display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}
        >
          <span>View all decision priorities</span>
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};
