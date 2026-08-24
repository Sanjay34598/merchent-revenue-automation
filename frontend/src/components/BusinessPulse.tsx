import React from 'react';

interface BusinessPulseProps {
  activeRisksCount?: number;
  atRiskAmount?: number;
}

export const BusinessPulse: React.FC<BusinessPulseProps> = ({
  atRiskAmount = 2138
}) => {
  return (
    <div style={{
      background: 'transparent',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-sub)',
      flexWrap: 'wrap',
      gap: 16,
      margin: '8px 0 20px'
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        BUSINESS PULSE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <span>Revenue <strong style={{ color: 'var(--emerald-green)' }}>↑ 8.4%</strong></span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>
        
        <div>
          <span>Demand <strong style={{ color: 'var(--emerald-green)' }}>↑ 12.0%</strong></span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div>
          <span>Gross margin <strong style={{ color: 'var(--emerald-green)' }}>↑ 2.1%</strong></span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div>
          <span>Inventory <strong style={{ color: 'var(--accent-purple)' }}>Healthy</strong></span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>|</span>

        <div>
          <span>At Risk <strong style={{ color: 'var(--risk-red)' }}>₹{atRiskAmount.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>
    </div>
  );
};
