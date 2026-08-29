import React from 'react';
import { ProductItem } from '../data/merchantInventory';
import { OpportunityRow } from './OpportunityRow';

interface OpportunityListProps {
  opportunities: ProductItem[];
  onSelectProduct: (item: ProductItem) => void;
  onViewAllInventory: () => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  onSelectProduct,
  onViewAllInventory,
}) => {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            WHAT NEEDS ATTENTION
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
            {opportunities.length} revenue opportunities detected from sales + inventory signals
          </div>
        </div>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          onClick={onViewAllInventory}
        >
          View all opportunities →
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        {opportunities.slice(0, 3).map((item) => (
          <OpportunityRow key={item.id} item={item} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};

