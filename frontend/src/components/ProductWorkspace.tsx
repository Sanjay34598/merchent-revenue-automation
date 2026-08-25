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

        {/* Exposed & Recoverable Revenue Header Metric */}
        <div style={{ background: 'var(--risk-red-bg)', border: '1px solid var(--risk-red-border)', padding: 14, borderRadius: 10, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)', textTransform: 'uppercase' }}>ESTIMATED EXPOSURE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--risk-red)', marginTop: 2 }}>{fmt(product.revenueAtRisk)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase' }}>EXPECTED RECOVERY</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(product.recoverableRevenue)}</div>
          </div>
        </div>

        {/* CURRENT STATE & WHY THIS MATTERS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CURRENT STATE & METRICS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center', marginBottom: 10 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DEMAND VELOCITY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: product.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>
                {product.dailyVelocity} units/day
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>STOCK ON HAND</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{product.currentStock} units</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>GROSS MARGIN</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: product.marginPct < 30 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>
                {product.marginPct}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>STOCK COVER</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>UNIT PRICE</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{fmt(product.sellingPrice)}</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>UNIT COST</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{fmt(product.costPrice)}</div>
            </div>
          </div>
        </div>

        {/* WHY THIS MATTERS EXPLANATION */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WHY THIS MATTERS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5, background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            Current stock count is {product.currentStock} units with a sales velocity of {product.dailyVelocity} units/day.
            {product.riskStatus === 'SLOW_MOVING' && ` Demand velocity dropped while ${product.currentStock} units remain in inventory, locking up ${fmt(product.currentStock * product.costPrice)} in capital.`}
            {product.riskStatus === 'STOCKOUT' && ` Demand velocity is high and stock cover is low (${Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days remaining), leading to potential lost revenue.`}
            {product.riskStatus === 'MARGIN_LEAK' && ` Gross margin of ${product.marginPct}% is below the target category benchmark, causing margin leakage.`}
            {product.riskStatus === 'OVERSTOCK' && ` Inventory cover exceeds target days of supply with ${product.currentStock} units held.`}
            {product.riskStatus === 'HEALTHY' && ` Stock levels and demand velocity are balanced.`}
          </div>
        </div>

        {/* AI RECOMMENDED ACTION */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RECOMMENDED MERCHANT ACTION
          </div>
          <div style={{ border: '1px solid var(--accent-purple)', background: 'rgba(109, 40, 217, 0.04)', padding: 14, borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-purple)', marginBottom: 4 }}>
              {product.recommendedAction}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4 }}>
              Reason: Recent velocity is {product.dailyVelocity} units/day and current stock covers approximately {Math.round(product.currentStock / Math.max(0.1, product.dailyVelocity))} days.
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
          <button
            onClick={() => onSimulate(product)}
            style={{
              flex: 1, padding: '12px 16px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
              borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <Sliders size={16} />
            <span>Simulate What-If</span>
          </button>
          <button
            onClick={() => onApproveAction(product.id)}
            style={{
              flex: 1, padding: '12px 16px', background: 'var(--accent-purple)', color: '#FFFFFF',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>Approve Action</span>
          </button>
        </div>

      </div>
    </div>
  );
};
