import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface RecentSalesProps {
  onViewAllTransactions: () => void;
  onSimulatePosSale?: () => void;
}

export const RecentSales: React.FC<RecentSalesProps> = ({
  onViewAllTransactions,
  onSimulatePosSale,
}) => {
  const recentTransactions = [
    { id: 'TXN-20260824-00129', items: 'India Gate Basmati Rice + Fortune Oil', qty: '4.0 units', total: 542, pay: 'UPI', time: 'Just now' },
    { id: 'TXN-20260824-00128', items: 'Fresh Milk 1L + Brown Bread', qty: '3.0 units', total: 286, pay: 'Cash', time: '14m ago' },
    { id: 'TXN-20260824-00127', items: 'Toor Dal 1kg + Tata Salt', qty: '2.0 units', total: 418, pay: 'UPI', time: '42m ago' },
  ];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Recent Sales Activity</h3>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
            POS Terminal #01 · Live transaction feed
          </div>
        </div>

        {onSimulatePosSale && (
          <button
            className="btn-copilot btn-copilot-secondary"
            onClick={onSimulatePosSale}
            style={{ fontSize: 11, padding: '5px 12px' }}
          >
            + Simulate POS Sale
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>TRANSACTION ID</th>
              <th>ITEMS PURCHASED</th>
              <th>NET AMOUNT</th>
              <th>PAYMENT</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} onClick={onViewAllTransactions}>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)' }}>{tx.id}</td>
                <td>{tx.items}</td>
                <td><strong style={{ color: 'var(--text-main)', fontSize: 14 }}>₹{tx.total}</strong></td>
                <td><span className="badge-pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-sub)' }}>{tx.pay}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onViewAllTransactions}
        style={{
          background: 'none', border: 'none', color: 'var(--accent-purple)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 14,
          display: 'flex', alignItems: 'center', gap: 4, padding: 0
        }}
      >
        <span>View all transactions</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
