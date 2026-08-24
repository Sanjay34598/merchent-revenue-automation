import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface RightIntelligencePanelProps {
  onViewDecisions?: () => void;
  onViewRevenueRisks?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  onViewDecisions,
  onViewRevenueRisks,
}) => {
  const [hoverData, setHoverData] = useState<{ day: string; value: number } | null>(null);

  const topActions = [
    { num: '01', title: 'Clear Fresh Milk', recovery: 'Recover ~₹1,904', pct: 80, tag: 'Expiry' },
    { num: '02', title: 'Reprice Fresh Paneer', recovery: 'Recover ~₹547', pct: 45, tag: 'Margin' },
    { num: '03', title: 'Reorder Mother Dairy Paneer', recovery: 'Prevent stockout', pct: 25, tag: 'Stockout' },
  ];

  // Real 7-day exposure trend data leading up to ₹2,138
  const riskHistory = [
    { day: 'Mon', value: 1420 },
    { day: 'Tue', value: 1680 },
    { day: 'Wed', value: 1540 },
    { day: 'Thu', value: 1920 },
    { day: 'Fri', value: 1760 },
    { day: 'Sat', value: 2010 },
    { day: 'Sun', value: 2138 },
  ];

  // SVG Area Chart Math
  const minVal = 1200;
  const maxVal = 2400;
  const chartWidth = 260;
  const chartHeight = 60;

  const points = riskHistory.map((d, idx) => {
    const x = (idx / (riskHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

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
                display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.65)', border: '1px solid var(--border-color)',
                borderRadius: 10, cursor: 'pointer', transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {act.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                    {act.title}
                  </div>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </div>

              {/* Priority Bar Indicator & Recovery Value */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <div style={{ width: 90, height: 4, background: 'rgba(20, 30, 50, 0.08)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${act.pct}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: 100 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)' }}>
                  {act.recovery}
                </span>
              </div>
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

      {/* REVENUE AT RISK GRAPH TERMINAL PANEL */}
      <div
        onClick={onViewRevenueRisks}
        style={{
          background: '#101522', color: '#F8FAFC', borderRadius: 18, padding: 20,
          border: '1px solid #20283A', boxShadow: 'var(--shadow-md)', cursor: 'pointer'
        }}
        title="Click to inspect 7-day revenue risk analysis"
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          REVENUE AT RISK
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              ₹2,138
            </div>
            <div style={{ fontSize: 11, color: '#98A2B3', marginTop: 2 }}>
              36 active risk opportunities
            </div>
          </div>

          {hoverData && (
            <div style={{ textAlign: 'right', fontSize: 11, color: '#F43F5E', fontWeight: 700 }}>
              {hoverData.day}: ₹{hoverData.value.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* 7-DAY REVENUE EXPOSURE AREA LINE GRAPH */}
        <div style={{ margin: '14px 0 8px', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 4, letterSpacing: '0.05em' }}>
            7-DAY RISK EXPOSURE TREND
          </div>
          
          <svg width="100%" height="60" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines */}
            <line x1="0" y1="10" x2={chartWidth} y2="10" stroke="#20283A" strokeDasharray="3 3" />
            <line x1="0" y1="35" x2={chartWidth} y2="35" stroke="#20283A" strokeDasharray="3 3" />

            {/* Area Fill */}
            <polygon points={areaPoints} fill="url(#riskGrad)" />

            {/* Smooth Risk Line */}
            <polyline points={points} fill="none" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hover Points */}
            {riskHistory.map((d, idx) => {
              const x = (idx / (riskHistory.length - 1)) * chartWidth;
              const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
              return (
                <circle
                  key={d.day}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#101522"
                  stroke="#F43F5E"
                  strokeWidth="2"
                  onMouseEnter={() => setHoverData(d)}
                  onMouseLeave={() => setHoverData(null)}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />
              );
            })}
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748B', marginTop: 4 }}>
            <span>Mon (₹1,420)</span>
            <span>Sun (₹2,138)</span>
          </div>
        </div>

        <button
          onClick={onViewRevenueRisks}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-purple)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 10,
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
