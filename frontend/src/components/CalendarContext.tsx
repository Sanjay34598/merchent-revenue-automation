import React, { useState } from 'react';
import { Calendar, Info, X } from 'lucide-react';

interface CalendarContextProps {
  selectedStore?: string;
}

export const CalendarContext: React.FC<CalendarContextProps> = ({ selectedStore = 'STR-1001' }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const todayDateStr = 'AUG 25, 2026';
  const weekdayStr = 'TUESDAY';
  const contextLabel = 'REGIONAL RETAIL DAY';

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)', borderRadius: 100,
          fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
          cursor: 'pointer', userSelect: 'none'
        }}
        title="Click to view today's regional calendar & retail context"
      >
        <Calendar size={12} color="var(--accent-purple)" />
        <span>DATA SNAPSHOT · {todayDateStr} · {contextLabel}</span>
        <Info size={11} color="var(--text-muted)" />
      </div>

      {showDetailModal && (
        <div
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(9, 11, 16, 0.4)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: 24, maxWidth: 440, width: '100%',
              boxShadow: 'var(--shadow-md)', color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  BASELINE DATASET CONTEXT
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  {todayDateStr} · {weekdayStr}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-sub)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STORE LOCATION CONTEXT</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--text-main)' }}>
                  {selectedStore} Outpost · Regional Retail Zone
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CALENDAR STATUS</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--text-main)' }}>
                  Mid-Week Trading Day · Regional Festive Promotion Active
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>
                <strong>Why it matters:</strong> Footwear and apparel demand velocity may fluctuate compared to normal business baselines. MerchIntell recalculates stock cover using live POS transactions on top of the historical sales baseline.
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                marginTop: 20, width: '100%', padding: '10px',
                background: 'var(--text-main)', color: 'var(--bg-page)',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
