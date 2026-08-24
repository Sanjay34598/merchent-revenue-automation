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
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-head">What needs your attention</h2>
          <div className="section-sub">
            MerchIntell found {opportunities.length} situations where intervention could improve your outcome.
          </div>
        </div>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          onClick={onViewAllInventory}
        >
          View all 150 catalog items →
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        {opportunities.map((item) => (
          <OpportunityRow key={item.id} item={item} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};
