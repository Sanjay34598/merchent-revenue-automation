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
      <div style={{ marginBottom: 14 }}>
        <h1 className="statement-main-serif hero-headline" style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
          Know where retail revenue is at risk — before it is lost.
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: '0 0 10px', maxWidth: 640, lineHeight: 1.4 }}>
          Connect sales and inventory signals to detect risks and recommend the next action.
        </p>

        {/* Minimal 4-Step Process Flow */}
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
      </div>

      {/* Immediate Transition: YOUR REVENUE AT A GLANCE */}
      <div style={{ marginTop: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            YOUR REVENUE AT A GLANCE
          </div>
          <div
            onClick={onViewRevenue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--accent-purple)', cursor: 'pointer'
            }}
          >
            <Sparkline data={protectedTrend} isNegative={false} width={40} height={14} />
            <span>Baseline verified (40 stores)</span>
          </div>
        </div>

        {/* 4 Metrics Grid — Strongest visual emphasis on Revenue at Risk */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HISTORICAL REVENUE
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
              {fmtCurrency(protectedRevenue)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Dataset baseline
            </div>
          </div>

          {/* Primary Problem Metric: Revenue at Risk */}
          <div style={{
            background: 'var(--risk-red-bg)', border: '2px solid var(--risk-red)',
            borderRadius: 10, padding: '10px 14px', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--risk-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚠️ REVENUE AT RISK
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--risk-red)', marginTop: 4 }}>
              {fmtCurrency(exposedRevenue)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--risk-red)', fontWeight: 600, marginTop: 2 }}>
              {activeOpportunitiesCount} priority risks detected
            </div>
          </div>

          <div style={{
            background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXPECTED RECOVERY
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>
              {fmtCurrency(expectedRecovery)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', opacity: 0.9, marginTop: 2 }}>
              Via recommended action
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GROSS MARGIN
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
              {grossMarginPct}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Category average
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
