import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, Sliders } from 'lucide-react';

interface DecisionPipelineProps {
  onOpenSimulator: () => void;
  onApproveAction: (actionId: number) => void;
}

export const DecisionPipeline: React.FC<DecisionPipelineProps> = ({
  onOpenSimulator,
  onApproveAction,
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(5); // Default to RECOMMEND stage

  const pipelineSteps = [
    { label: 'OBSERVE', sub: 'Catalog Stream', info: 'Real-time monitoring of POS transactions, inventory velocity, and day-of-week demand patterns.' },
    { label: 'DETECT', sub: 'Anomaly Risk', info: 'Identified 21% demand fall and 2-day expiry risk on 18 units of Fresh Juice 500ml (GB-FRV-042).' },
    { label: 'FORECAST', sub: 'Elasticity Model', info: 'Price elasticity model estimates volume response to 5%, 10%, 15%, and 20% discount tiers.' },
    { label: 'SIMULATE', sub: 'Monte Carlo', info: 'Ran 1,000 scenario simulations comparing sell-through, gross margin, and waste probability.' },
    { label: 'POLICY', sub: 'Guardrails Check', info: 'Validated candidate strategies against merchant policies: max 25% discount, min 18% margin.' },
    { label: 'RECOMMEND', sub: 'Rank Impact', info: 'Selected 15% clearance discount as optimal strategy, maximizing net recovery at ₹354.' },
    { label: 'EXECUTE', sub: 'POS Integration', info: 'Scheduled approved price update to merchant POS catalog for immediate activation.' },
    { label: 'LEARN', sub: 'Feedback Loop', info: 'Measures post-execution sales variance to calibrate elasticity coefficients for future predictions.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Decision #74</span>
          <span>•</span>
          <span>Target: Fresh Juice 500ml (GB-FRV-042)</span>
        </div>
        <h1 className="section-head" style={{ fontSize: 26 }}>Autonomous Decision Center</h1>
        <div className="section-sub">
          Structured AI decision pipeline evaluating status quo against alternative strategies under policy constraints.
        </div>
      </div>

      {/* Interactive 8-Stage Decision Pipeline Visualizer */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 12, padding: 20, overflowX: 'auto'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14, letterSpacing: '0.05em' }}>
          DECISION PIPELINE EXECUTION (CLICK ANY STAGE TO INSPECT)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 780, justifyContent: 'space-between' }}>
          {pipelineSteps.map((step, idx, arr) => {
            const isSelected = selectedStageIdx === idx;
            return (
              <React.Fragment key={step.label}>
                <div
                  onClick={() => setSelectedStageIdx(idx)}
                  style={{
                    background: isSelected ? 'var(--primary-blue-bg)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                    borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1,
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: isSelected ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{step.sub}</div>
                </div>
                {idx < arr.length - 1 && <ChevronRight size={14} color="var(--text-muted)" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-sub)' }}>
          <strong style={{ color: 'var(--primary-blue)' }}>STAGE {selectedStageIdx + 1}: {pipelineSteps[selectedStageIdx].label}</strong> — {pipelineSteps[selectedStageIdx].info}
        </div>
      </div>

      {/* Recommended Strategy Highlight Box */}
      <div style={{ background: 'var(--bg-surface)', border: '2px solid var(--primary-blue)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RECOMMENDED ACTION FOR FRESH JUICE 500ML
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-blue)', margin: '4px 0 0' }}>
              15% clearance discount
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="badge-pill" style={{ background: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: '1px solid var(--risk-red-border)', fontSize: 12, padding: '4px 10px' }}>
              Revenue exposed: ₹490
            </span>
            <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)', fontSize: 12, padding: '4px 10px' }}>
              Expected recovery: ₹354
            </span>
            <span className="badge-pill" style={{ background: 'var(--primary-blue-bg)', color: 'var(--primary-blue)', border: '1px solid var(--primary-blue-border)', fontSize: 12, padding: '4px 10px' }}>
              Confidence: 88%
            </span>
          </div>
        </div>

        {/* Candidate Strategies Matrix */}
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>STRATEGY OPTION</th>
                <th>DISCOUNT %</th>
                <th>EXPECTED RECOVERY</th>
                <th>SELL-THROUGH</th>
                <th>WASTE RISK</th>
                <th>POLICY CHECK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DO NOTHING (Status Quo)</td>
                <td>0%</td>
                <td>₹0</td>
                <td>+0%</td>
                <td>42% high</td>
                <td>Passed</td>
                <td>Baseline</td>
              </tr>
              <tr>
                <td>10% DISCOUNT</td>
                <td>10%</td>
                <td>₹271</td>
                <td>+18%</td>
                <td>24% med</td>
                <td>Passed</td>
                <td>Sub-optimal</td>
              </tr>
              <tr style={{ background: 'var(--primary-blue-bg)' }}>
                <td><strong>15% DISCOUNT (Recommended)</strong></td>
                <td><strong>15%</strong></td>
                <td><strong style={{ color: 'var(--emerald-green)' }}>₹354</strong></td>
                <td><strong>+31%</strong></td>
                <td><strong>8% low</strong></td>
                <td>Passed</td>
                <td><strong style={{ color: 'var(--primary-blue)' }}>Selected Winner ★</strong></td>
              </tr>
              <tr>
                <td>20% DISCOUNT</td>
                <td>20%</td>
                <td>₹321</td>
                <td>+36%</td>
                <td>5% low</td>
                <td>Passed</td>
                <td>Lower margin efficiency</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Concise AI Rationale */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
            WHY THIS DECISION?
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Demand has fallen 21% over the last 3 days while 18 units remain and the product expires in 2 days. The model compared historical demand patterns and simulated alternative discount strategies. A 15% discount maximizes net recovery (₹354) while preserving more margin than a 20% clearance (₹321 recovery).
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-copilot btn-copilot-primary" onClick={onOpenSimulator}>
            <Sliders size={14} /> Open What-If Simulator →
          </button>
          <button className="btn-copilot btn-copilot-success" onClick={() => onApproveAction(1)}>
            <CheckCircle2 size={14} /> Approve 15% Clearance Action
          </button>
        </div>
      </div>
    </div>
  );
};
