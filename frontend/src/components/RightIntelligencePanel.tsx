import React from 'react';
import { ChevronDown, ArrowUpRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { Sparkline } from './Sparkline';

export const RightIntelligencePanel: React.FC = () => {
  const signals = [
    { time: '09:42', icon: ArrowUpRight, title: 'Milk demand spiked', detail: 'Amul Taaza Milk 1L', level: 'High', bg: '#E9F9F2', color: '#08A66A' },
    { time: '09:18', icon: AlertCircle, title: 'Expiry risk increased', detail: '3 products', level: 'Medium', bg: '#FFF6ED', color: '#F2994A' },
    { time: '08:51', icon: AlertCircle, title: 'Margin leak detected', detail: 'Fortune Sunflower Oil 1L', level: 'Medium', bg: '#FFF6ED', color: '#F2994A' },
    { time: '08:21', icon: ShoppingBag, title: 'Stockout risk detected', detail: '2 products', level: 'High', bg: '#FFF0F1', color: '#E5484D' },
  ];

  const contributors = [
    { name: 'Fresh Juice 500ml', amount: 490, pct: 23 },
    { name: 'Mother Dairy Paneer', amount: 360, pct: 17 },
    { name: 'Fortune Oil', amount: 789, pct: 37 },
    { name: 'Others', amount: 499, pct: 23 },
  ];

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 380, flexShrink: 0 }}>

      {/* TODAY'S SIGNALS PANEL (Matching Reference) */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
            Today's signals
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            View all
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {signals.map((sig, idx) => {
            const Icon = sig.icon;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>
                    {sig.time}
                  </span>
                  <Icon size={14} color={sig.color} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13 }}>{sig.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sig.detail}</div>
                  </div>
                </div>
                <span className="badge-pill" style={{ background: sig.bg, color: sig.color, fontSize: 11, fontWeight: 700 }}>
                  {sig.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVENUE AT RISK DARK NAVY PANEL (Matching Reference) */}
      <div style={{
        background: '#101522', color: '#F8FAFC', borderRadius: 16, padding: 22,
        border: '1px solid #20283A', boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
            Revenue at risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#98A2B3', cursor: 'pointer' }}>
            <span>This week</span>
            <ChevronDown size={12} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              ₹2,138
            </div>
            <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 2 }}>
              Across 7 opportunities
            </div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <Sparkline data={[420, 380, 490, 510, 480, 520, 490]} isNegative={true} width={110} height={36} />
          </div>
        </div>

        {/* Top Contributors List */}
        <div style={{ borderTop: '1px solid #20283A', paddingTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            TOP CONTRIBUTORS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {contributors.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{c.name}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{fmt(c.amount)}</span>
                  <span style={{ color: '#98A2B3', fontSize: 12, minWidth: 36, textAlign: 'right' }}>({c.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUTOPILOT PERFORMANCE PANEL (Matching Reference) */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
            Autopilot performance
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-sub)', cursor: 'pointer' }}>
            <span>This month</span>
            <ChevronDown size={12} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'left', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 500 }}>Decisions executed</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>74</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 500 }}>Revenue recovered</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>₹27,696</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 500 }}>Accuracy</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>95.8%</div>
          </div>
        </div>

        {/* Purple Progress Bar */}
        <div>
          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: '92%', height: '100%', background: 'var(--accent-purple)', borderRadius: 100 }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--emerald-green)' }}>
            ↑ 2.4% vs last month
          </div>
        </div>
      </div>

    </div>
  );
};
