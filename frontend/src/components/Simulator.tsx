import React, { useState } from 'react';
import { Play, RefreshCw, Sliders } from 'lucide-react';

interface SimulatorProps {
  onRunBackendSimulation?: (qty: number, discount: number) => void;
  simLoading?: boolean;
}

export const Simulator: React.FC<SimulatorProps> = ({
  onRunBackendSimulation,
  simLoading = false,
}) => {
  const [discount, setDiscount] = useState(15);
  const [orderQty, setOrderQty] = useState(150);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  // Deterministic financial elasticity simulation calculation
  const baseRevenue = 2840;
  const proposedRevenue = Math.round(2840 + 354 * (discount / 15) + (orderQty - 150) * 1.8);
  const revenueDelta = proposedRevenue - baseRevenue;

  const sellThroughDelta = Math.round(31 * (discount / 15));
  const wasteRiskDelta = Math.round(42 * (discount / 15));
  const marginPct = (24.5 - discount * 0.12).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Title */}
      <div>
        <h1 className="section-head" style={{ fontSize: 26 }}>What happens if you change the strategy?</h1>
        <div className="section-sub">
          Interactive elasticity model. Adjust discount percentages and order quantities to simulate profit and waste outcomes.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        
        {/* Left: Input Sliders */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={16} color="var(--primary-blue)" /> Adjust Parameters
          </h3>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span>Clearance Discount:</span>
              <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{discount}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span>Order Quantity:</span>
              <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{orderQty} units</span>
            </div>
            <input
              type="range"
              min={0}
              max={300}
              step={10}
              value={orderQty}
              onChange={e => setOrderQty(Number(e.target.value))}
            />
          </div>

          <button
            className="btn-copilot btn-copilot-primary"
            style={{ width: '100%' }}
            onClick={() => onRunBackendSimulation?.(orderQty, discount)}
            disabled={simLoading}
          >
            {simLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
            <span>Calculate Impact</span>
          </button>
        </div>

        {/* Right: Simulation Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Prominent Expected Impact Highlight Banner */}
          <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXPECTED REVENUE IMPACT
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>
              +{fmt(revenueDelta)} expected recovery
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--emerald-green)', marginTop: 8, flexWrap: 'wrap' }}>
              <span>Sell-through: <strong>+{sellThroughDelta}%</strong></span>
              <span>Waste risk: <strong>-{wasteRiskDelta}%</strong></span>
              <span>Gross Margin: <strong>{marginPct}%</strong></span>
              <span>Cash locked: <strong>₹{orderQty * 45}</strong></span>
            </div>
          </div>

          {/* Current Strategy vs Proposed Strategy Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-main)' }}>
              CURRENT VS PROPOSED STRATEGY COMPARISON
            </h4>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>FINANCIAL METRIC</th>
                  <th>CURRENT STRATEGY</th>
                  <th>PROPOSED ({discount}% DISCOUNT)</th>
                  <th>IMPACT DELTA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Expected Revenue</td>
                  <td>{fmt(baseRevenue)}</td>
                  <td><strong>{fmt(proposedRevenue)}</strong></td>
                  <td style={{ color: 'var(--emerald-green)', fontWeight: 800 }}>+{fmt(revenueDelta)}</td>
                </tr>
                <tr>
                  <td>Gross Profit</td>
                  <td>₹695</td>
                  <td>₹804</td>
                  <td style={{ color: 'var(--emerald-green)', fontWeight: 700 }}>+₹109</td>
                </tr>
                <tr>
                  <td>Gross Margin %</td>
                  <td>24.5%</td>
                  <td>{marginPct}%</td>
                  <td style={{ color: 'var(--text-muted)' }}>-{(24.5 - Number(marginPct)).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Stockout Risk Probability</td>
                  <td>2%</td>
                  <td>4%</td>
                  <td style={{ color: 'var(--text-muted)' }}>+2%</td>
                </tr>
                <tr>
                  <td>Waste Risk Probability</td>
                  <td>48%</td>
                  <td>{Math.max(2, 48 - wasteRiskDelta)}%</td>
                  <td style={{ color: 'var(--emerald-green)', fontWeight: 700 }}>-{wasteRiskDelta}%</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};
