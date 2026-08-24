import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export const InsightFeed: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const insights = [
    {
      id: 1,
      title: "Weekend demand for dairy products is 18% higher than weekday demand.",
      summary: "Consumer purchasing shifts toward weekend family consumption for milk, paneer, and curd.",
      evidence: [
        "Aggregate sales data across 45 residential stores shows Saturday/Sunday volume spikes.",
        "Reorder point for Amul Fresh Paneer and Nandini Milk should trigger on Thursday evening instead of Friday.",
        "Expected revenue loss from uncaptured weekend stockouts: ₹4,200/month."
      ]
    },
    {
      id: 2,
      title: "Fresh beverage demand falls 23% during non-working days.",
      summary: "Commercial and office park retail locations experience sharp weekend demand drop.",
      evidence: [
        "IT Park stores show Friday afternoon footfall collapse.",
        "Fresh Orange Juice 500ml and Tender Coconut Water inventory needs 25% lower Friday stocking.",
        "Applying 15% clearance discount on Friday afternoon recovers 78% of perishable value."
      ]
    },
    {
      id: 3,
      title: "Three products account for 62% of current expiry exposure.",
      summary: "Fresh Orange Juice, Mother Dairy Paneer, and Whole Wheat Bread represent majority of risk.",
      evidence: [
        "Concentrated risk enables targeted automated intervention rather than blanket catalog discounting.",
        "Total inventory value exposed: ₹1,340 out of ₹2,138 catalog total."
      ]
    },
    {
      id: 4,
      title: "Supplier lead time increased by 1.4 days this week.",
      summary: "Regional distribution delays affecting Dairy and Frozen Food deliveries.",
      evidence: [
        "Amul Distribution Ltd average lead time increased from 2.1 days to 3.5 days.",
        "Safety stock levels automatically adjusted +20% to prevent stockout risk."
      ]
    },
    {
      id: 5,
      title: "Products with >25 days of stock are tying up ₹18,400 in inventory.",
      summary: "Slow-moving packaged goods and non-perishables locking up merchant working capital.",
      evidence: [
        "14 SKUs identified in Overstock status.",
        "Bundling slow-moving snacks with high-velocity staples recommended to free up liquidity."
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="section-head" style={{ fontSize: 26 }}>Autonomous Business Insights</h1>
        <div className="section-sub">
          Synthesized patterns detected across catalog sales velocity, demand trends, and supplier performance.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 12, padding: 18, cursor: 'pointer',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
              }}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: 'var(--primary-blue-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Lightbulb size={16} color="var(--primary-blue)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {item.summary}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-sub)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: 6 }}>
                    SUPPORTING EVIDENCE & DATA SIGNAL
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                    {item.evidence.map((ev, idx) => (
                      <li key={idx}>{ev}</li>
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
