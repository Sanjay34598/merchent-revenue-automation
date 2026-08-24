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
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'EXPIRY':     return { label: 'EXPIRY RISK',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'STOCKOUT RISK', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'MARGIN_LEAK':return { label: 'MARGIN LEAK',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'OVERSTOCK',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:           return { label: 'HEALTHY',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.category}</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              SKU: {product.sku} · Brand: {product.brand}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Exposed Header Metric */}
        <div style={{ background: 'var(--risk-red-bg)', border: '1px solid var(--risk-red-border)', padding: 14, borderRadius: 10, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)', textTransform: 'uppercase' }}>REVENUE EXPOSED</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--risk-red)', marginTop: 2 }}>{fmt(product.revenueAtRisk)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase' }}>EXPECTED RECOVERY</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(product.recoverableRevenue)}</div>
          </div>
        </div>

        {/* WHY THIS MATTERS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WHY THIS MATTERS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center', marginBottom: 10 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DEMAND</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: product.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>
                {product.trend3d}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>STOCK</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{product.currentStock} units</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>EXPIRY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: product.expiryDays && product.expiryDays <= 3 ? 'var(--risk-red)' : 'var(--text-main)' }}>
                {product.expiryDays !== null ? `${product.expiryDays} days` : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
            <span>Velocity: {product.dailyVelocity}/day</span>
            <span>Supplier lead time: {product.supplierLeadTimeDays} days</span>
            <span>Historical waste: {fmt(product.costPrice * 16)}</span>
          </div>
        </div>

        {/* REVENUE IMPACT */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUE IMPACT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>EXPOSED</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)', marginTop: 2 }}>{fmt(product.revenueAtRisk)}</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>RECOVERY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(product.recoverableRevenue)}</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>WASTE RISK</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>↓ 42%</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>CONFIDENCE</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-purple)', marginTop: 2 }}>88%</div>
            </div>
          </div>
        </div>

        {/* MERCHINTELL RECOMMENDS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MERCHINTELL RECOMMENDS
          </div>
          <div style={{ background: 'var(--accent-purple-bg)', border: '1.5px solid var(--accent-purple-border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 8 }}>
              {product.recommendedAction}
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--accent-purple)' }}>
              <span>Expected sell-through: <strong>+31%</strong></span>
              <span>Expected recovery: <strong>{fmt(product.recoverableRevenue)}</strong></span>
            </div>
          </div>
        </div>

        {/* WHY THIS DECISION? */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WHY THIS DECISION?
          </div>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            "Demand has fallen {Math.abs(product.trend3d)}% over the last 3 days while {product.currentStock} units remain and the product expires in {product.expiryDays ?? 2} days. The model compared historical demand patterns and simulated alternative discount strategies."
          </div>
        </div>

        {/* STRATEGY COMPARISON */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            STRATEGY COMPARISON
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DO NOTHING</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>₹0</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>10% DISCOUNT</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>₹271</div>
            </div>
            <div style={{ background: 'var(--accent-purple-bg)', border: '1.5px solid var(--accent-purple)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--accent-purple)', fontWeight: 800 }}>15% DISCOUNT ★</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-purple)', marginTop: 4 }}>₹354</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>20% DISCOUNT</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>₹321</div>
            </div>
          </div>
        </div>

        {/* Drawer Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-copilot btn-copilot-secondary"
            style={{ flex: 1 }}
            onClick={() => { onClose(); onSimulate(product); }}
          >
            <Sliders size={14} /> Simulate strategy
          </button>
          <button
            className="btn-copilot btn-copilot-success"
            style={{ flex: 1 }}
            onClick={() => { onApproveAction(product.id); onClose(); }}
          >
            <CheckCircle2 size={14} /> Approve action
          </button>
        </div>

      </div>
    </div>
  );
};
