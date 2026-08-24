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
      case 'EXPIRY':     return { label: 'Expiry Risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'Stockout Risk', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'MARGIN_LEAK':return { label: 'Margin Leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
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
              <span className="badge-pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                {product.category}
              </span>
              <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                {badge.label}
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 2px', color: 'var(--text-main)' }}>
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

        {/* Product Key Metrics Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>PRICE</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>₹{product.sellingPrice}</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>COST</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>₹{product.costPrice}</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>MARGIN</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{pct(product.marginPct)}</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>STOCK</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{product.currentStock} units</div>
          </div>
        </div>

        {/* WHY THIS MATTERS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WHY THIS MATTERS
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>
            <div>• Demand trend: <strong style={{ color: product.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>{product.trend3d}% over 3 days</strong></div>
            <div>• Current stock: <strong>{product.currentStock} units remaining</strong></div>
            {product.expiryDays !== null && (
              <div>• Expiry window: <strong style={{ color: product.expiryDays <= 3 ? 'var(--risk-red)' : 'var(--text-main)' }}>{product.expiryDays} days remaining</strong></div>
            )}
            <div>• Current sales velocity: <strong>{product.dailyVelocity} units/day</strong></div>
            <div>• Supplier: <strong>{product.supplier}</strong> (Lead time: {product.supplierLeadTimeDays} day)</div>
          </div>
        </div>

        {/* REVENUE IMPACT */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUE IMPACT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
            <div style={{ background: 'var(--risk-red-bg)', border: '1px solid var(--risk-red-border)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--risk-red)', fontWeight: 700 }}>REVENUE EXPOSED</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)' }}>{fmt(product.revenueAtRisk)}</div>
            </div>
            <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--emerald-green)', fontWeight: 700 }}>EXPECTED RECOVERY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{fmt(product.recoverableRevenue)}</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>WASTE RISK</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>-42%</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>CONFIDENCE</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)' }}>88%</div>
            </div>
          </div>
        </div>

        {/* REVENUEPILOT RECOMMENDS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REVENUEPILOT RECOMMENDS
          </div>
          <div style={{ background: 'var(--primary-blue-bg)', border: '1.5px solid var(--primary-blue-border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 8 }}>
              {product.recommendedAction}
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--primary-blue)' }}>
              <span>Expected sell-through: <strong>+31%</strong></span>
              <span>Expected recovery: <strong>{fmt(product.recoverableRevenue)}</strong></span>
            </div>
          </div>
        </div>

        {/* WHY THIS DECISION? */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WHY THIS DECISION?
          </div>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: 16, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            "Demand has fallen sharply while remaining stock exceeds the expected sell-through before expiry. A 15% discount maximizes expected recovery while preserving more margin than a 20% clearance."
          </div>
        </div>

        {/* ALTERNATIVE STRATEGIES */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ALTERNATIVE STRATEGIES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DO NOTHING</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>₹0 recovery</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>10% DISCOUNT</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>₹271</div>
            </div>
            <div style={{ background: 'var(--primary-blue-bg)', border: '1.5px solid var(--primary-blue)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--primary-blue)', fontWeight: 700 }}>15% DISCOUNT ★</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-blue)', marginTop: 4 }}>₹354</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>20% DISCOUNT</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>₹321</div>
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
            <Sliders size={14} /> Simulate Strategy
          </button>
          <button
            className="btn-copilot btn-copilot-success"
            style={{ flex: 1 }}
            onClick={() => { onApproveAction(product.id); onClose(); }}
          >
            <CheckCircle2 size={14} /> Approve Action
          </button>
        </div>

      </div>
    </div>
  );
};
