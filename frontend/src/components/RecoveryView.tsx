import React from 'react';
import { CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';

export const RecoveryView: React.FC = () => {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const closedLoopTimeline = [
    { stage: 'Detected', time: 'Aug 20, 09:15 AM', status: 'Completed', detail: 'Expiry risk detected on Fresh Juice (18 units)' },
    { stage: 'Recommended', time: 'Aug 20, 09:16 AM', status: 'Completed', detail: '15% clearance discount strategy proposed' },
    { stage: 'Approved', time: 'Aug 20, 10:30 AM', status: 'Completed', detail: 'Merchant approved clearance action' },
    { stage: 'Executed', time: 'Aug 20, 11:00 AM', status: 'Completed', detail: '15% price adjustment pushed to POS catalog' },
    { stage: 'Recovered', time: 'Aug 22, 06:00 PM', status: 'Completed', detail: '16 units sold-through. ₹354 revenue recovered' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="section-head" style={{ fontSize: 26 }}>Closed-Loop Recovered Revenue Audit</h1>
        <div className="section-sub">
          Verification of predicted vs actual monetary recovery outcomes following merchant-approved interventions.
        </div>
      </div>

      {/* Main Metric Banner */}
      <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          TOTAL REVENUE PROTECTED THIS MONTH
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>
          {fmt(27696)}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 16, borderTop: '1px solid var(--emerald-green-border)', paddingTop: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', fontWeight: 700 }}>PREDICTED RECOVERY</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(28920)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', fontWeight: 700 }}>ACTUAL RECOVERY</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>{fmt(27696)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', fontWeight: 700 }}>PREDICTION ACCURACY</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald-green)', marginTop: 2 }}>95.8%</div>
          </div>
        </div>
      </div>

      {/* Closed-Loop Timeline Execution Flow */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>
          Closed-Loop Outcome Timeline (Fresh Juice 500ml)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {closedLoopTimeline.map((step, idx) => (
            <div key={step.stage} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--emerald-green-bg)',
                  border: '1px solid var(--emerald-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircle2 size={16} color="var(--emerald-green)" />
                </div>
                {idx < closedLoopTimeline.length - 1 && (
                  <div style={{ width: 2, height: 28, background: 'var(--border-color)', margin: '4px 0' }} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{step.stage}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.time}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2 }}>{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
