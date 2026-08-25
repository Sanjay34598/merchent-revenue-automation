import React from 'react';
import {
  PlusCircle, ShoppingBag, DollarSign, Layers, Sliders, RotateCcw
} from 'lucide-react';

interface MerchantActionStripProps {
  onActionClick: (actionKey: 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'recovery' | 'evaluation' | 'audit') => void;
}

export const MerchantActionStrip: React.FC<MerchantActionStripProps> = ({
  onActionClick,
}) => {
  const actions = [
    {
      key: 'sales' as const,
      label: '+ Record sale',
      icon: PlusCircle,
      accent: 'var(--accent-purple)',
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
      accent: 'var(--accent-purple)',
      isPrimary: false,
    },
    {
      key: 'leaks' as const,
      label: 'Recovery',
      icon: RotateCcw,
      accent: 'var(--emerald-green)',
      isPrimary: false,
    },
    {
      key: 'evaluation' as const,
      label: 'Evaluation',
      icon: Sliders,
      accent: 'var(--accent-purple)',
      isPrimary: false,
    },
    {
      key: 'audit' as const,
      label: 'Audit Trail',
      icon: Layers,
      accent: 'var(--text-main)',
      isPrimary: false,
    },
  ];

  return (
    <div className="quick-actions-strip">
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
              border: '1px solid var(--action-tile-border)',
              background: 'var(--action-tile-bg)',
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
              e.currentTarget.style.background = 'var(--action-tile-hover-bg)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--action-tile-bg)';
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
