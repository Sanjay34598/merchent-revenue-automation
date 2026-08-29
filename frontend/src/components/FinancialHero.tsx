import React from 'react';
import { Sparkline } from './Sparkline';

interface FinancialHeroProps {
  merchantName?: string;
  protectedRevenue?: number;
  exposedRevenue?: number;
  expectedRecovery?: number;
  activeOpportunitiesCount?: number;
  totalProductsCount?: number;
  onViewRevenue?: () => void;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  protectedRevenue = 10482110,
  exposedRevenue = 311937,
  expectedRecovery = 203232,
  activeOpportunitiesCount = 7,
  onViewRevenue,
}) => {
  const fmtCurrency = (n?: number) => {
    if (n === undefined || n === null || isNaN(n)) return 'Not calculated';
    if (n === 0) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `₹${Math.round(n).toLocaleString('en-IN')}`;
    return `₹${Math.round(n)}`;
  };

  const grossMarginPct = '44.2%';
  const protectedTrend = [8400000, 8900000, 9200000, 9600000, 10000000, 10200000, protectedRevenue];

  return (
    <div style={{ padding: '0 0 4px' }}>
      
      {/* Above-the-fold Ultra-Compact Introduction */}
      <div style={{ marginBottom: 12 }}>
        <h1 className="statement-main-serif hero-headline" style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
          Know where retail revenue is at risk — before it is lost.
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: '0 0 8px', maxWidth: 680, lineHeight: 1.4 }}>
          Connect sales and inventory signals to detect risks and recommend the next action.
        </p>

        {/* 4-Step Process Flow & Continuous Differentiation Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-sub)',
            textTransform: 'uppercase', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
            padding: '4px 12px', borderRadius: 100
          }}>
            <span>SALES</span>
            <span style={{ opacity: 0.4, color: 'var(--text-muted)' }}>→</span>
            <span>INVENTORY</span>
            <span style={{ opacity: 0.4, color: 'var(--text-muted)' }}>→</span>
            <span>RISK</span>
            <span style={{ opacity: 0.4, color: 'var(--text-muted)' }}>→</span>
            <span style={{ color: 'var(--accent-purple)' }}>ACTION</span>
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            MerchIntell continuously connects sales and inventory signals to find revenue leakage that ordinary dashboards don't explain.
          </span>
        </div>

        {/* Ultra-Compact Decision Intelligence Comparison Pill */}
        <div style={{
          background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 8,
          padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, fontSize: 11, margin: '6px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ORDINARY DASHBOARD:</span>
            <span style={{ color: 'var(--text-sub)' }}>Sales (<em>"What sold?"</em>) · Inventory (<em>"What remains?"</em>)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MERCHINTELL:</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Risk (<em>"What could cost money?"</em>) · Reason (<em>"Why?"</em>) · Action (<em>"Next step"</em>)</span>
          </div>
        </div>
      </div>

      {/* Immediate Transition: YOUR REVENUE AT A GLANCE */}
      <div style={{ marginTop: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            YOUR REVENUE AT A GLANCE
          </div>
          <div
            onClick={onViewRevenue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--accent-purple)', cursor: 'pointer'
            }}
          >
            <Sparkline data={protectedTrend} isNegative={false} width={36} height={14} />
            <span>Baseline verified (40 stores)</span>
          </div>
        </div>

        {/* 3 Metrics Grid — Primary Emphasis on Current Exposure, Potential Recovery & Gross Margin */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10
        }}>
          {/* Metric 1: Current Revenue Exposure */}
          <div style={{
            background: 'var(--risk-red-bg)', border: '2px solid var(--risk-red)',
            borderRadius: 10, padding: '10px 14px', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--risk-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚠️ CURRENT REVENUE EXPOSURE
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--risk-red)', marginTop: 2 }}>
              {fmtCurrency(exposedRevenue)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--risk-red)', fontWeight: 600, marginTop: 2 }}>
              {activeOpportunitiesCount} active risks detected
            </div>
          </div>

          {/* Metric 2: Potential Recovery */}
          <div style={{
            background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              POTENTIAL RECOVERY
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 2 }}>
              {fmtCurrency(expectedRecovery)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', opacity: 0.9, marginTop: 2 }}>
              Recoverable via recommended actions
            </div>
          </div>

          {/* Metric 3: Gross Margin */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GROSS MARGIN
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              {grossMarginPct}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Current category benchmark
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
