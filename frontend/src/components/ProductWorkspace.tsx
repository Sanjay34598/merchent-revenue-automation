import React, { useEffect } from 'react';
import { X, Sliders, CheckCircle2 } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

interface ProductWorkspaceProps {
  product: ProductItem | null;
  onClose: () => void;
  onSimulate: (product: ProductItem) => void;
  onApproveAction: (actionId: number) => void;
}

export const ProductWorkspace: React.FC<ProductWorkspaceProps> = ({
  product,
  onClose,
  onSimulate,
  onApproveAction,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'SLOW_MOVING': return { label: 'SLOW MOVING', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'STOCKOUT':    return { label: 'STOCKOUT RISK', bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'MARGIN_LEAK': return { label: 'MARGIN LEAK',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':   return { label: 'EXCESS INVENTORY', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:            return { label: 'HEALTHY',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
    }
  };

  const badge = riskBadgeStyle(product.riskStatus);

  return (
    <div className="workspace-overlay" onClick={onClose}>
      <div className="workspace-drawer" onClick={e => e.stopPropagation()}>

        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontWeight: 700 }}>
                {badge.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.division || product.category}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              SKU: {product.sku} · Supplier: {product.supplier}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* DETECTED RISK SUMMARY */}
        <div style={{ background: 'var(--risk-red-bg)', border: '1px solid var(--risk-red-border)', padding: 14, borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--risk-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DETECTED RISK
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {product.riskStatus === 'SLOW_MOVING' && `Slow-moving inventory holding ${product.currentStock} units with declining velocity.`}
            {product.riskStatus === 'STOCKOUT' && `High stockout risk with only ${Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days of stock cover remaining.`}
            {product.riskStatus === 'MARGIN_LEAK' && `Margin leakage detected: current gross margin is ${product.marginPct}%, below target category benchmark.`}
            {product.riskStatus === 'OVERSTOCK' && `Excess inventory cover holding ${product.currentStock} units in stock.`}
            {product.riskStatus === 'HEALTHY' && `Product demand velocity and inventory levels are balanced.`}
          </div>
        </div>

        {/* EVIDENCE: RELEVANT SALES & INVENTORY SIGNALS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            EVIDENCE (OPERATIONAL SIGNALS)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>VELOCITY</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: product.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>
                {product.dailyVelocity} /day
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>STOCK</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{product.currentStock} units</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>COVER</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>MARGIN</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: product.marginPct < 30 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>
                {product.marginPct}%
              </div>
            </div>
          </div>
        </div>

        {/* WHY IT MATTERS: BUSINESS CONSEQUENCE & EXPOSURE */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            WHY IT MATTERS
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-main)', lineHeight: 1.5, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 8 }}>
            Total revenue exposure is <strong>{fmt(product.revenueAtRisk)}</strong>.
            {product.riskStatus === 'SLOW_MOVING' && ` Excess inventory locks up working capital in unsold units while demand velocity declines.`}
            {product.riskStatus === 'STOCKOUT' && ` Stockout risk threatens lost sales revenue during peak demand cycles.`}
            {product.riskStatus === 'MARGIN_LEAK' && ` Low margin erodes profitability on every unit sold relative to category benchmarks.`}
            {product.riskStatus === 'OVERSTOCK' && ` Prolonged holding increases storage costs and risk of obsolescence.`}
          </div>
        </div>

        {/* RECOMMENDED ACTION */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            RECOMMENDED ACTION
          </div>
          <div style={{ border: '1px solid var(--accent-purple)', background: 'rgba(109, 40, 217, 0.04)', padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 2 }}>
              {product.recommendedAction}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
              Based on current sales velocity of {product.dailyVelocity} units/day and {Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days of stock cover.
            </div>
          </div>
        </div>

        {/* EXPECTED IMPACT */}
        <div style={{ marginBottom: 24, background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', padding: 12, borderRadius: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            EXPECTED IMPACT
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 2 }}>
            Recover {fmt(product.recoverableRevenue)} of exposed revenue
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => onSimulate(product)}
            style={{
              flex: 1, padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
              borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Sliders size={14} />
            <span>Simulate What-If</span>
          </button>
          <button
            onClick={() => onApproveAction(product.id)}
            style={{
              flex: 1, padding: '10px 14px', background: 'var(--accent-purple)', color: '#FFFFFF',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <CheckCircle2 size={14} />
            <span>Approve Action</span>
          </button>
        </div>

      </div>
    </div>
  );
};
