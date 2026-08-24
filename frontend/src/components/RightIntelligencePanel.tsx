import React from 'react';
import { Shield, Sparkles, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Sparkline } from './Sparkline';

export const RightIntelligencePanel: React.FC = () => {
  const signals = [
    { time: '09:42', title: 'Milk demand spiked', detail: 'Amul Taaza Milk 1L', level: 'HIGH', bg: 'var(--risk-red-bg)', color: 'var(--risk-red)' },
    { time: '09:18', title: 'Expiry risk increased', detail: '3 products', level: 'MEDIUM', bg: '#fff7ed', color: '#c2410c' },
    { time: '08:51', title: 'Margin leak detected', detail: 'Fortune Sunflower Oil 1L', level: 'MEDIUM', bg: '#eff6ff', color: '#1d4ed8' },
    { time: '08:21', title: 'Stockout risk detected', detail: '2 products', level: 'HIGH', bg: 'var(--risk-red-bg)', color: 'var(--risk-red)' },
  ];

  const contributors = [
    { name: 'Fortune Sunflower Oil', amount: 789, pct: 37 },
    { name: 'Fresh Juice 500ml', amount: 490, pct: 23 },
    { name: 'Mother Dairy Paneer', amount: 360, pct: 17 },
    { name: 'Others', amount: 499, pct: 23 },
  ];

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* TODAY'S SIGNALS PANEL */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TODAY'S SIGNALS
          </div>
          <span style={{ fontSize: 11, color: 'var(--accent-purple)', fontWeight: 600 }}>Live Feed</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {signals.map((sig, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11, minWidth: 36 }}>
                {sig.time}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sig.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sig.detail}</div>
              </div>
              <span className="badge-pill" style={{ background: sig.bg, color: sig.color, fontSize: 10 }}>
                {sig.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* REVENUE AT RISK DARK PANEL */}
      <div style={{
        background: 'linear-gradient(145deg, #101522 0%, #151C2B 100%)',
        color: '#F8FAFC', borderRadius: 12, padding: 20, border: '1px solid #1E293B',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          REVENUE AT RISK
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#FF5C67', marginTop: 4, letterSpacing: '-0.5px' }}>
          ₹2,138
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Across 7 opportunities</span>
          <Sparkline data={[420, 380, 490, 510, 480, 520, 490]} isNegative={true} width={70} height={20} />
        </div>

        {/* Top Contributors List */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1E293B' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 }}>
            TOP CONTRIBUTORS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {contributors.map((c, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{c.name}</span>
                  <span style={{ color: '#FF5C67', fontWeight: 700 }}>{fmt(c.amount)} ({c.pct}%)</span>
                </div>
                <div style={{ height: 4, background: '#1E293B', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: '#FF5C67', borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUTOPILOT PERFORMANCE PANEL */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          AUTOPILOT PERFORMANCE
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DECISIONS</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>74</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>RECOVERED</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>₹27.7K</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>ACCURACY</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-purple)', marginTop: 2 }}>95.8%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Monthly Recovery Target</span>
            <span style={{ fontWeight: 700, color: 'var(--emerald-green)' }}>92% of target</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ width: '92%', height: '100%', background: 'var(--emerald-green)', borderRadius: 100 }} />
          </div>
        </div>
      </div>

    </div>
  );
};
