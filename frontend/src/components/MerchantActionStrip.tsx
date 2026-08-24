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
      accent: '#6C4EFF',
      isRecordSale: true,
    },
    {
      key: 'inventory' as const,
      label: 'Inventory',
      subtext: `${totalProductsCount} products`,
      icon: ShoppingBag,
      accent: 'var(--text-main)',
      isRecordSale: false,
    },
    {
      key: 'leaks' as const,
      label: 'Revenue',
      subtext: `₹${atRiskAmount.toLocaleString('en-IN')} at risk`,
      icon: DollarSign,
      accent: 'var(--risk-red)',
      isRecordSale: false,
    },
    {
      key: 'decisions' as const,
      label: 'Decisions',
      subtext: `${itemsAtRiskCount} actions`,
      icon: Layers,
      accent: 'var(--emerald-green)',
      isRecordSale: false,
    },
    {
      key: 'whatif' as const,
      label: 'Simulator',
      subtext: 'Test strategy',
      icon: Sliders,
      accent: '#6C4EFF',
      isRecordSale: false,
    },
    {
      key: 'recovery' as const,
      label: 'Recovery',
      subtext: '₹27.7K recovered',
      icon: RotateCcw,
      accent: 'var(--emerald-green)',
      isRecordSale: false,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 12,
      margin: '24px 0 28px'
    }}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.key}
            onClick={() => onActionClick(act.key)}
            className="glass-action-tile"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.45)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: act.isRecordSale ? 'rgba(108, 78, 255, 0.1)' : 'rgba(20, 30, 50, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={16} color={act.accent} />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {act.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>
                {act.subtext}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
