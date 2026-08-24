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
}) => {
  const actions = [
    { key: 'sales' as const, label: '+ Record sale', icon: PlusCircle, isPrimary: true },
    { key: 'inventory' as const, label: 'Inventory', icon: ShoppingBag, isPrimary: false },
    { key: 'leaks' as const, label: 'Revenue', icon: DollarSign, isPrimary: false },
    { key: 'decisions' as const, label: 'Decisions', icon: Layers, isPrimary: false },
    { key: 'whatif' as const, label: 'Simulator', icon: Sliders, isPrimary: false },
    { key: 'recovery' as const, label: 'Recovery', icon: RotateCcw, isPrimary: false },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      margin: '24px 0 28px'
    }}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.key}
            onClick={() => onActionClick(act.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: act.isPrimary ? '7px 16px' : '7px 12px',
              borderRadius: 8,
              border: act.isPrimary ? 'none' : 'none',
              background: act.isPrimary ? 'var(--text-main)' : 'transparent',
              color: act.isPrimary ? 'var(--bg-surface)' : 'var(--text-sub)',
              fontSize: 13,
              fontWeight: act.isPrimary ? 700 : 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!act.isPrimary) {
                e.currentTarget.style.background = 'var(--bg-subtle)';
                e.currentTarget.style.color = 'var(--text-main)';
              }
            }}
            onMouseLeave={(e) => {
              if (!act.isPrimary) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-sub)';
              }
            }}
          >
            <Icon size={14} color={act.isPrimary ? 'var(--bg-surface)' : 'var(--text-sub)'} />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
