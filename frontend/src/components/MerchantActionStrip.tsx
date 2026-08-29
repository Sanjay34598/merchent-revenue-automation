import React from 'react';
import { PlusCircle, ShoppingBag, Layers, Sliders, RotateCcw } from 'lucide-react';

interface MerchantActionStripProps {
  onActionClick: (actionKey: 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'recovery' | 'evaluation' | 'audit') => void;
}

export const MerchantActionStrip: React.FC<MerchantActionStripProps> = ({
  onActionClick,
}) => {
  const primaryAction = {
    key: 'sales' as const,
    label: '+ Record Sale',
    icon: PlusCircle,
  };

  const secondaryActions = [
    { key: 'inventory' as const, label: 'Inventory', icon: ShoppingBag },
    { key: 'decisions' as const, label: 'Decisions', icon: Layers },
    { key: 'whatif' as const, label: 'Simulator', icon: Sliders },
    { key: 'recovery' as const, label: 'Recovery', icon: RotateCcw },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Primary Action Button */}
        <button
          onClick={() => onActionClick(primaryAction.key)}
          style={{
            height: 40,
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent-purple)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(109, 40, 217, 0.25)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <PlusCircle size={16} />
          <span>{primaryAction.label}</span>
        </button>

        {/* Secondary Workspace Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {secondaryActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={() => onActionClick(act.key)}
                style={{
                  height: 38,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Icon size={14} color="var(--text-sub)" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Navigation Links for Advanced Workspaces */}
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', paddingLeft: 2 }}>
        <span>Advanced Workspaces:</span>
        <button
          onClick={() => onActionClick('evaluation')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Batch Evaluation
        </button>
        <span>·</span>
        <button
          onClick={() => onActionClick('audit')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Audit Trail
        </button>
      </div>
    </div>
  );
};
