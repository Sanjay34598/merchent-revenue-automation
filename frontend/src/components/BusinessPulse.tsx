import React from 'react';
import { Sparkline } from './Sparkline';

interface BusinessPulseProps {
  onViewRevenue?: () => void;
  onViewDemand?: () => void;
  onViewInventory?: () => void;
}

export const BusinessPulse: React.FC<BusinessPulseProps> = ({
  onViewRevenue,
  onViewDemand,
  onViewInventory,
}) => {
  return (
    <div className="business-pulse-strip" style={{
      background: 'transparent',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '6px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--text-sub)',
      flexWrap: 'wrap',
      gap: 14,
      margin: '4px 0 10px'
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        BUSINESS PULSE
      </div>
      <div className="business-pulse-metrics" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        
        {/* Revenue Metric with Micro Trend */}
        <div
          onClick={onViewRevenue}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          title="Click to view Revenue workspace"
        >
          <span>Revenue <strong style={{ color: 'var(--emerald-green)' }}>↑ 8.4%</strong></span>
          <Sparkline data={[10, 12, 14, 13, 16, 18, 20]} isNegative={false} width={28} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>
        
        {/* Demand Metric with Micro Trend */}
        <div
          onClick={onViewDemand}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          title="Click to view Decisions & Demand workspace"
        >
          <span>Demand <strong style={{ color: 'var(--emerald-green)' }}>↑ 12.0%</strong></span>
          <Sparkline data={[8, 9, 11, 14, 15, 17, 19]} isNegative={false} width={28} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>

        {/* Gross Margin Metric with Micro Trend */}
        <div
          onClick={onViewRevenue}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          title="Click to view Revenue Margin workspace"
        >
          <span>Gross margin <strong style={{ color: 'var(--emerald-green)' }}>↑ 2.1%</strong></span>
          <Sparkline data={[21, 21.2, 21.5, 21.8, 22.0, 22.1, 22.1]} isNegative={false} width={28} height={14} />
        </div>
        <span style={{ color: 'var(--border-color)' }}>│</span>

        {/* Inventory Metric */}
        <div
          onClick={onViewInventory}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          title="Click to view Inventory workspace"
        >
          <span>Inventory <strong style={{ color: 'var(--accent-purple)' }}>Healthy</strong></span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald-green)' }} />
        </div>

      </div>
    </div>
  );
};
