import React from 'react';
import {
  PlusCircle, ShoppingBag, DollarSign, Layers, Sliders, RotateCcw
} from 'lucide-react';

interface MerchantActionStripProps {
  onActionClick: (actionKey: 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'recovery') => void;
  atRiskAmount?: number;
  itemsAtRiskCount?: number;
  totalProductsCount?: number;
}

export const MerchantActionStrip: React.FC<MerchantActionStripProps> = ({
  onActionClick,
  atRiskAmount = 2138,
  itemsAtRiskCount = 7,
  totalProductsCount = 150,
}) => {
  const actions = [
    {
      key: 'sales' as const,
      label: 'Record Sale',
      subtext: 'Add transaction',
      icon: PlusCircle,
      accent: 'var(--accent-purple)',
    },
    {
      key: 'inventory' as const,
      label: 'Inventory',
      subtext: `${totalProductsCount} products`,
      icon: ShoppingBag,
      accent: 'var(--text-main)',
    },
    {
      key: 'leaks' as const,
      label: 'Revenue',
      subtext: `₹${atRiskAmount.toLocaleString('en-IN')} at risk`,
      icon: DollarSign,
      accent: 'var(--risk-red)',
    },
    {
      key: 'decisions' as const,
      label: 'Decisions',
      subtext: `${itemsAtRiskCount} actions`,
      icon: Layers,
      accent: 'var(--emerald-green)',
    },
    {
      key: 'whatif' as const,
      label: 'Simulator',
      subtext: 'Test strategy',
      icon: Sliders,
      accent: 'var(--accent-purple)',
    },
    {
      key: 'recovery' as const,
      label: 'Recovery',
      subtext: '₹27.7K recovered',
      icon: RotateCcw,
      accent: 'var(--emerald-green)',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 14,
      margin: '20px 0 28px'
    }}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.key}
            onClick={() => onActionClick(act.key)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'left',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-purple-border)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={18} color={act.accent} />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {act.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                {act.subtext}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
