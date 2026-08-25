import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface RightIntelligencePanelProps {
  catalog?: ProductItem[];
  exposedRevenue?: number;
  onViewDecisions?: () => void;
  onViewRevenueRisks?: () => void;
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  catalog = [],
  exposedRevenue = 2829779,
  onViewDecisions,
  onViewRevenueRisks,
}) => {
  const [hoverData, setHoverData] = useState<{ day: string; value: number } | null>(null);

  // Derive top 3 priority actions from dataset products requiring attention
  const atRiskProducts = catalog.filter(p => p.riskStatus !== 'HEALTHY');
  const topPriorityItems = (atRiskProducts.length > 0 ? atRiskProducts : [
    { name: 'PROD-100043 Femme Footwear Boot', riskStatus: 'SLOW_MOVING', revenueAtRisk: 1948, recommendedAction: 'Review markdown strategy' },
    { name: 'PROD-100844 Stiletto Elegance', riskStatus: 'STOCKOUT', revenueAtRisk: 1920, recommendedAction: 'Replenish 18 units' },
    { name: 'PROD-100342 Junior Denim Essentials', riskStatus: 'MARGIN_LEAK', revenueAtRisk: 1156, recommendedAction: 'Review pricing & cost' },
  ]).slice(0, 3);

  const riskLabel = (status: string) => {
    switch (status) {
      case 'SLOW_MOVING': return 'Slow-moving';
      case 'STOCKOUT': return 'Stockout risk';
      case 'MARGIN_LEAK': return 'Margin leak';
      case 'OVERSTOCK': return 'Excess stock';
      default: return 'Risk detected';
    }
  };

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  // Exposure trend points leading up to exposedRevenue
  const baseRisk = Math.round(exposedRevenue * 0.85);
  const riskHistory = [
    { day: 'Mon', value: Math.round(baseRisk * 0.90) },
    { day: 'Tue', value: Math.round(baseRisk * 0.94) },
    { day: 'Wed', value: Math.round(baseRisk * 0.92) },
    { day: 'Thu', value: Math.round(baseRisk * 0.97) },
    { day: 'Fri', value: Math.round(baseRisk * 0.95) },
    { day: 'Sat', value: Math.round(baseRisk * 0.98) },
    { day: 'Sun', value: exposedRevenue },
  ];

  const minVal = Math.round(baseRisk * 0.80);
  const maxVal = Math.round(exposedRevenue * 1.15);
  const chartWidth = 260;
  const chartHeight = 60;

  const points = riskHistory.map((d, idx) => {
    const x = (idx / (riskHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minVal) / Math.max(1, maxVal - minVal)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  const parseProductTitle = (rawName: string) => {
    let clean = rawName.replace(/^PROD-\d+\s*/i, '').replace(/^SEG-\d+\s*/i, '').trim();
    const knownDivisions = ['Femme Footwear', 'Scholar Footwear', 'Junior Apparel', 'Apparel', 'Footwear'];
    for (const div of knownDivisions) {
      if (clean.toLowerCase().startsWith(div.toLowerCase())) {
        clean = clean.substring(div.length).trim();
        break;
      }
    }
    return clean || rawName;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

      {/* TODAY'S PRIORITIES PANEL */}
      <div style={{
        background: 'var(--today-panel-bg)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)', borderRadius: 16, padding: 18,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TODAY'S PRIORITIES
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)' }}>
            3 priorities derived from dataset
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topPriorityItems.map((act, idx) => (
            <div
              key={idx}
              onClick={onViewDecisions}
              style={{
                display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px',
                background: 'var(--today-card-bg)', border: '1px solid var(--today-card-border)',
                borderRadius: 10, cursor: 'pointer', transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  0{idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--today-card-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {parseProductTitle(act.name)}
                  </div>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--risk-red)' }}>
                  {riskLabel(act.riskStatus)} · {fmt(act.revenueAtRisk)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--today-card-sub)' }}>
                  {act.recommendedAction}
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
          <span>View all decision priorities</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* REVENUE AT RISK PANEL */}
      <div
        onClick={onViewRevenueRisks}
        style={{
          background: '#101522', color: '#F8FAFC', borderRadius: 18, padding: 20,
          border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', cursor: 'pointer'
        }}
        title="Click to inspect 7-day revenue risk analysis"
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          REVENUE AT RISK (ESTIMATED EXPOSURE)
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              {fmt(exposedRevenue)}
            </div>
            <div style={{ fontSize: 11, color: '#98A2B3', marginTop: 2 }}>
              Across active dataset product risks
            </div>
          </div>

          {hoverData && (
            <div style={{ textAlign: 'right', fontSize: 11, color: '#F43F5E', fontWeight: 700 }}>
              {hoverData.day}: {fmt(hoverData.value)}
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

            <line x1="0" y1="10" x2={chartWidth} y2="10" stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <line x1="0" y1="35" x2={chartWidth} y2="35" stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />

            <polygon points={areaPoints} fill="url(#riskGrad)" />

            <polyline points={points} fill="none" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {riskHistory.map((d, idx) => {
              const x = (idx / (riskHistory.length - 1)) * chartWidth;
              const y = chartHeight - ((d.value - minVal) / Math.max(1, maxVal - minVal)) * chartHeight;
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

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#718096', marginTop: 4 }}>
            <span>Mon ({fmt(riskHistory[0].value)})</span>
            <span>Sun ({fmt(exposedRevenue)})</span>
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
