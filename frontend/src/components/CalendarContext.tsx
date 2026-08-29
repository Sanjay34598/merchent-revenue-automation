import React, { useState } from 'react';
import { Calendar, Info, X } from 'lucide-react';

interface CalendarContextProps {
  selectedStore?: string;
}

const INDIAN_HOLIDAYS: Record<string, string> = {
  '01-26': 'REPUBLIC DAY',
  '03-14': 'HOLI',
  '03-30': 'RAM NAVAMI',
  '04-11': 'EID AL-FITR',
  '04-14': 'AMBEDKAR JAYANTI',
  '04-18': 'GOOD FRIDAY',
  '05-01': 'MAY DAY',
  '08-15': 'INDEPENDENCE DAY',
  '08-27': 'GANESH CHATURTHI',
  '10-02': 'GANDHI JAYANTI',
  '10-20': 'DUSSEHRA',
  '11-01': 'DIWALI',
  '11-02': 'GOVARDHAN PUJA',
  '11-15': 'GURU NANAK JAYANTI',
  '12-25': 'CHRISTMAS',
};

export const CalendarContext: React.FC<CalendarContextProps> = ({ selectedStore = 'STR-1001' }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dynamic Current Calendar Date from System/Browser Date
  const now = new Date();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthStr = monthNames[now.getMonth()];
  const dayNum = now.getDate();
  const yearNum = now.getFullYear();
  const todayDateStr = `${monthStr} ${dayNum}, ${yearNum}`;

  const weekdayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const weekdayStr = weekdayNames[now.getDay()];

  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const holidayKey = `${mm}-${dd}`;
  const holidayName = INDIAN_HOLIDAYS[holidayKey] || null;

  let retailDayLabel = isWeekend ? 'WEEKEND' : 'BUSINESS DAY';
  if (holidayName) {
    retailDayLabel = isWeekend ? `${holidayName} · WEEKEND` : `${holidayName} · HOLIDAY`;
  }

  const snapshotDateStr = 'AUG 25, 2026';

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
        title="Click to view today's calendar context and dataset snapshot details"
      >
        <Calendar size={12} color="var(--accent-purple)" />
        <span>TODAY · {todayDateStr} · {weekdayStr} · {retailDayLabel}</span>
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
              borderRadius: 16, padding: 24, maxWidth: 460, width: '100%',
              boxShadow: 'var(--shadow-md)', color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  RETAIL CALENDAR & DATASET CONTEXT
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>
                  TODAY: {todayDateStr} · {weekdayStr}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                  Status: <strong>{retailDayLabel}</strong>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DATASET SNAPSHOT DATE</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--text-main)' }}>
                  {snapshotDateStr} Baseline (Latest multi-store POS transaction dataset)
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STORE LOCATION CONTEXT</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--text-main)' }}>
                  {selectedStore} Outpost · Regional Indian Retail Zone
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>
                <strong>Why it matters:</strong> Retail demand velocity and stock cover calculations dynamically reflect live POS transactions recorded against the snapshot baseline.
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
