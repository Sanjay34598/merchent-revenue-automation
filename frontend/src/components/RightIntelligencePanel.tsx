import React from 'react';
import { ArrowRight } from 'lucide-react';

interface RightIntelligencePanelProps {
  onViewDecisions?: () => void;
  onViewRevenueRisks?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  onViewDecisions,
  onViewRevenueRisks,
}) => {
  const topActions = [
    { num: '01', title: 'Clear Fresh Milk', recovery: 'Recover ~₹1,904', tag: 'Expiry' },
    { num: '02', title: 'Reprice Fresh Paneer', recovery: 'Recover ~₹547', tag: 'Margin' },
    { num: '03', title: 'Reorder Mother Dairy Paneer', recovery: 'Prevent stockout', tag: 'Stockout' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

      {/* TODAY / NEXT BEST ACTIONS SUMMARY PANEL */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(20, 30, 50, 0.06)', borderRadius: 16, padding: 18,
        boxShadow: '0 4px 16px rgba(20, 30, 50, 0.025)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TODAY
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)' }}>
            3 actions could recover ~₹3,120
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topActions.map((act) => (
            <div
              key={act.num}
              onClick={onViewDecisions}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.65)', border: '1px solid var(--border-color)',
                borderRadius: 10, cursor: 'pointer', transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {act.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  {act.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                  {act.recovery}
                </div>
              </div>
              <ArrowRight size={13} color="var(--text-muted)" />
            </div>
          ))}
        </div>

        <button
          onClick={onViewDecisions}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-purple)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 14,
            display: 'flex', alignItems: 'center', gap: 4, padding: 0
          }}
        >
          <span>View decisions</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* REVENUE AT RISK SUMMARY PANEL */}
      <div style={{
        background: '#101522', color: '#F8FAFC', borderRadius: 18, padding: 20,
        border: '1px solid #20283A', boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          REVENUE AT RISK
        </div>

        <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
          ₹2,138
        </div>
        <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 2, marginBottom: 16 }}>
          36 opportunities across store catalog
        </div>

        <div style={{ borderTop: '1px solid #20283A', paddingTop: 12, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0' }}>
            <span>Most exposed category</span>
            <strong style={{ color: '#FFFFFF' }}>Dairy · ₹1,402</strong>
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
