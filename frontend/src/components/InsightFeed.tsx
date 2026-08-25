import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export const InsightFeed: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const insights = [
    {
      id: 1,
      title: "Weekend demand for Scholar Footwear is 24% higher than weekday baseline.",
      summary: "Consumer purchasing shifts toward weekend store visits for school and formal footwear.",
      evidence: [
        "Aggregate sales data across 40 retail stores shows Saturday/Sunday volume spikes.",
        "Reorder point for Scholar Footwear Derby Classic should trigger on Thursday morning.",
        "Expected revenue opportunity from optimizing weekend stock coverage: ₹34,200/month."
      ]
    },
    {
      id: 2,
      title: "Femme Footwear Boot Collection velocity drops during off-peak periods.",
      summary: "High-value boots experience seasonal velocity shifts across regional outposts.",
      evidence: [
        "Sub-category sales trends indicate concentrated purchasing windows.",
        "Stock cover exceeds 45 days for 12 slow-moving boot SKUs.",
        "Targeted promotional markdown strategy recovers working capital without margin leakage."
      ]
    },
    {
      id: 3,
      title: "Top 5 SKUs account for 48% of current inventory risk exposure.",
      summary: "High inventory value tied up in concentrated slow-moving footwear items.",
      evidence: [
        "Concentrated risk enables targeted merchant intervention rather than blanket catalog discounting.",
        "Total inventory value exposed: ₹18,400 across top slow-moving SKUs."
      ]
    },
    {
      id: 4,
      title: "Supplier lead time averages 3.0 days across footwear and apparel vendors.",
      summary: "Vendor 0064 and Vendor 0012 replenishment cycles are stable across 40 stores.",
      evidence: [
        "Lead time variability is low (<0.5 days), allowing tight reorder point thresholds.",
        "Safety stock levels optimized to minimize excess inventory holding costs."
      ]
    },
    {
      id: 5,
      title: "Products with >60 days of cover tie up working capital across stores.",
      summary: "Slow-moving junior apparel and footwear locking up merchant liquidity.",
      evidence: [
        "18 SKUs identified in Overstock status across stores.",
        "Cross-store inventory rebalancing recommended to optimize stock turnover."
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="section-head" style={{ fontSize: 26 }}>Autonomous Business Insights</h1>
        <div className="section-sub">
          AI-generated operational intelligence derived from 125k+ historical retail sales transactions.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 12, overflow: 'hidden', transition: 'all 0.15s ease'
              }}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: 'rgba(109, 40, 217, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Lightbulb size={16} color="var(--accent-purple)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{item.summary}</div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px 64px', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    DATA EVIDENCE & SUPPORTING ANALYTICS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                    {item.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
