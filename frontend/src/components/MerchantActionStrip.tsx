import React from 'react';
import {
  PlusCircle, ShoppingBag, DollarSign, Layers, Sliders, RotateCcw
} from 'lucide-react';

interface MerchantActionStripProps {
  onActionClick: (actionKey: 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'recovery') => void;
}

export const MerchantActionStrip: React.FC<MerchantActionStripProps> = ({
  onActionClick,
}) => {
  const actions = [
    {
      key: 'sales' as const,
      label: '+ Record sale',
      icon: PlusCircle,
      accent: '#6C4EFF',
      isPrimary: true,
    },
    {
      key: 'inventory' as const,
      label: 'Inventory',
      icon: ShoppingBag,
      accent: 'var(--text-main)',
      isPrimary: false,
    },
    {
      key: 'leaks' as const,
      label: 'Revenue',
      icon: DollarSign,
      accent: 'var(--risk-red)',
      isPrimary: false,
    },
    {
      key: 'decisions' as const,
      label: 'Decisions',
      icon: Layers,
      accent: 'var(--emerald-green)',
      isPrimary: false,
    },
    {
      key: 'whatif' as const,
      label: 'Simulator',
      icon: Sliders,
      accent: '#6C4EFF',
      isPrimary: false,
    },
    {
      key: 'recovery' as const,
      label: 'Recovery',
      icon: RotateCcw,
      accent: 'var(--emerald-green)',
      isPrimary: false,
    },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      margin: '24px 0 28px'
    }}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.key}
            onClick={() => onActionClick(act.key)}
            className="glass-action-tile"
            style={{
              height: 48,
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: act.isPrimary ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.45)',
              color: 'var(--text-main)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 160ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = act.isPrimary ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Icon size={15} color={act.accent} />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
