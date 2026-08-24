import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface RightIntelligencePanelProps {
  onSelectPriority?: (productName: string) => void;
  onViewRevenueRisks?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  onSelectPriority,
  onViewRevenueRisks,
}) => {
  const priorities = [
    {
      name: 'Fresh Milk 1L',
      badge: 'Expiry Risk',
      detail: '57 units · expires in 3 days · ₹2,616 exposed',
      rec: '15% clearance',
      color: 'var(--risk-red)',
    },
    {
      name: 'Fortune Sunflower Oil',
      badge: 'Margin Leak',
      detail: 'Margin down 3.1pp · ₹789 exposed',
      rec: 'Adjust price +4%',
      color: 'var(--amber-gold)',
    },
    {
      name: 'Mother Dairy Paneer',
      badge: 'Stockout Risk',
      detail: '1.4 days stock cover · ₹360 exposed',
      rec: 'Reorder 20 units',
      color: '#3B82F6',
    },
  ];

  const contributors = [
    { name: 'Fresh Juice 500ml', amount: 490 },
    { name: 'Fortune Oil 1L', amount: 789 },
    { name: 'Mother Dairy Paneer', amount: 360 },
    { name: 'Others', amount: 499 },
  ];

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 340, flexShrink: 0 }}>

      {/* TODAY'S PRIORITIES PANEL */}
      <div className="glass-tile" style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
          Today's Priorities
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {priorities.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.5)', border: '1px solid var(--border-color)',
                borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>{item.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: item.color }}>
                  {item.badge}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                {item.detail}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                  Rec: {item.rec}
                </span>
                <button
                  className="btn-copilot btn-copilot-ghost"
                  style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700 }}
                  onClick={() => onSelectPriority && onSelectPriority(item.name)}
                >
                  Review →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REVENUE AT RISK DARK PANEL */}
      <div style={{
        background: '#101522', color: '#F8FAFC', borderRadius: 18, padding: 22,
        border: '1px solid #20283A', boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>
          Revenue at risk
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              ₹2,138
            </div>
            <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 2 }}>
              Across 7 products
            </div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <Sparkline data={[420, 380, 490, 510, 480, 520, 490]} isNegative={true} width={90} height={28} />
          </div>
        </div>

        {/* Top Product Contributors */}
        <div style={{ borderTop: '1px solid #20283A', paddingTop: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {contributors.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{c.name}</span>
                <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{fmt(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onViewRevenueRisks}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-purple)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 14,
            display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}
        >
          <span>View revenue risks</span>
          <ArrowRight size={12} />
        </button>
      </div>

    </div>
  );
};
