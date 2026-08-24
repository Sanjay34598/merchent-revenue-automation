import React from 'react';
import { ArrowRight } from 'lucide-react';

interface RecentSalesProps {
  onViewAllTransactions: () => void;
  totalTransactions?: number;
  netRevenue?: number;
  avgBill?: number;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  onViewAllTransactions,
  totalTransactions = 8124,
  netRevenue = 359775,
  avgBill = 44.3,
}) => {
  const recentTransactions = [
    { id: 'TXN-20260824-00129', items: 'India Gate Basmati Rice + Fortune Oil', total: 542, pay: 'UPI', time: 'Just now' },
    { id: 'TXN-20260824-00128', items: 'Fresh Milk 1L + Brown Bread', total: 286, pay: 'Cash', time: '14m ago' },
    { id: 'TXN-20260824-00127', items: 'Toor Dal 1kg + Tata Salt', total: 418, pay: 'UPI', time: '42m ago' },
  ];

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div style={{ marginTop: 28 }}>
      
      {/* Compact 30-Day Sales Activity Analytics Header */}
      <div style={{
        background: 'var(--surface)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px',
        marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, fontSize: 12
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          30-DAY SALES ACTIVITY
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontWeight: 600, color: 'var(--text-main)', flexWrap: 'wrap' }}>
          <span><strong>{totalTransactions.toLocaleString()}</strong> Bills</span>
          <span style={{ color: 'var(--border-color)' }}>│</span>
          <span>Net Rev <strong>{fmt(netRevenue)}</strong></span>
          <span style={{ color: 'var(--border-color)' }}>│</span>
          <span>Avg Bill <strong>{fmt(avgBill)}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Recent POS Bills Stream</h3>
        <button
          onClick={onViewAllTransactions}
          style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          View all transactions →
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)' }}>
        {recentTransactions.map((tx) => (
          <div
            key={tx.id}
            onClick={onViewAllTransactions}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 4px', borderBottom: '1px solid var(--border-color)',
              fontSize: 13, cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)' }}>{tx.id}</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{tx.items}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: 'var(--text-sub)', fontSize: 12 }}>{tx.pay}</span>
              <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>₹{tx.total}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
