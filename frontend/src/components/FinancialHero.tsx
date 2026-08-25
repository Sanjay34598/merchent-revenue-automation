import React from 'react';
import { Sparkline } from './Sparkline';

interface FinancialHeroProps {
  merchantName?: string;
  protectedRevenue?: number;
  exposedRevenue?: number;
  activeOpportunitiesCount?: number;
  totalProductsCount?: number;
  onViewRevenue?: () => void;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  merchantName = 'Sanjay',
  protectedRevenue = 10482110,
  exposedRevenue = 2829779,
  activeOpportunitiesCount = 36,
  totalProductsCount = 2326,
  onViewRevenue,
}) => {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const protectedTrend = [8400000, 8900000, 9200000, 9600000, 10000000, 10200000, protectedRevenue];

  return (
    <div style={{ padding: '0 0 12px' }}>
      
      {/* Secondary Context Pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10
      }}>
        <span className="monitoring-dot" />
        <span>REVENUE INTELLIGENCE BASELINE · 40 stores · Jun 2025 – Apr 2026</span>
      </div>

      {/* Hero Headline & Subtitle */}
      <h1 className="statement-main-serif" style={{ fontSize: 32, lineHeight: 1.2, margin: '4px 0 8px' }}>
        Find revenue leaks before they become losses.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-sub)', margin: '0 0 20px', maxWidth: 640, lineHeight: 1.5 }}>
        MerchIntell analyzes sales and inventory data to detect revenue risks, explain why they matter, and recommend the next best action.
      </p>

      {/* Primary Financial Metric Banner */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 14, padding: '18px 22px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--risk-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUE AT RISK
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--risk-red)', marginTop: 2, letterSpacing: '-0.5px' }}>
            {fmt(exposedRevenue)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>
            7 opportunities requiring immediate attention · 40 stores analyzed
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>HISTORICAL BASELINE</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{fmt(protectedRevenue)}</div>
          </div>

          <div
            onClick={onViewRevenue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', background: 'var(--trend-pill-bg)',
              border: '1px solid var(--trend-pill-border)', borderRadius: 100,
              cursor: 'pointer'
            }}
            title="Historical revenue trend — click to view analysis"
          >
            <Sparkline data={protectedTrend} isNegative={false} width={50} height={16} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--trend-pill-text)' }}>Baseline Verified</span>
          </div>
        </div>
      </div>

      {/* 3-Step Product Workflow Banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
        borderRadius: 12, padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>DETECT</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>Find revenue risks</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid var(--border-color)', paddingLeft: 12 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>EXPLAIN</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>Understand why they happen</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid var(--border-color)', paddingLeft: 12 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>ACT</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>Get recommended action</div>
          </div>
        </div>
      </div>

    </div>
  );
};
