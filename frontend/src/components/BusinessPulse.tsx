import React from 'react';

interface BusinessPulseProps {
  activeRisksCount?: number;
}

export const BusinessPulse: React.FC<BusinessPulseProps> = ({ activeRisksCount = 7 }) => {
  return (
    <div style={{
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-sub)',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        BUSINESS PULSE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <span>Revenue <strong style={{ color: 'var(--emerald-green)' }}>↑ 8.4%</strong></span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Demand <strong style={{ color: 'var(--emerald-green)' }}>↑ 12.0%</strong></span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Gross margin <strong style={{ color: 'var(--emerald-green)' }}>↑ 2.1%</strong></span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Inventory <strong style={{ color: 'var(--emerald-green)' }}>Healthy</strong></span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Active risks <strong style={{ color: 'var(--risk-red)' }}>{activeRisksCount}</strong></span>
      </div>
    </div>
  );
};
