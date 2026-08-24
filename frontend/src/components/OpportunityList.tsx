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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-head">What needs your attention</h2>
          <div className="section-sub">
            RevenuePilot found {opportunities.length} situations where intervention could improve your outcome.
          </div>
        </div>
        <button className="btn-copilot btn-copilot-secondary" onClick={onViewAllInventory}>
          View all 150 catalog items →
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opportunities.map((item) => (
          <OpportunityRow key={item.id} item={item} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};
