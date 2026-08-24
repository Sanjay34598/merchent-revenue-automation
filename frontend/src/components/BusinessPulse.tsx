import React from 'react';
import { Sparkline } from './Sparkline';

interface BusinessPulseProps {
  activeRisksCount?: number;
}

export const BusinessPulse: React.FC<BusinessPulseProps> = ({ activeRisksCount = 7 }) => {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-sub)',
      flexWrap: 'wrap',
      gap: 16
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        BUSINESS PULSE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Revenue <strong style={{ color: 'var(--emerald-green)' }}>↑ 8.4%</strong></span>
          <Sparkline data={[8.0, 8.1, 8.2, 8.4]} isNegative={false} width={40} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Demand <strong style={{ color: 'var(--emerald-green)' }}>↑ 12.0%</strong></span>
          <Sparkline data={[11.2, 11.5, 11.8, 12.0]} isNegative={false} width={40} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Gross margin <strong style={{ color: 'var(--emerald-green)' }}>↑ 2.1%</strong></span>
          <Sparkline data={[1.8, 1.9, 2.0, 2.1]} isNegative={false} width={40} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div>
          <span>Inventory <strong style={{ color: 'var(--accent-purple)' }}>Healthy</strong></span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div>
          <span>Active risks <strong style={{ color: 'var(--risk-red)' }}>{activeRisksCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
