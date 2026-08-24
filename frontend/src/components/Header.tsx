import React, { useState } from 'react';
import {
  ChevronDown, Store, Sun, Moon, Monitor, Bell
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more';
  setActiveTab: (tab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more') => void;
  secondaryTab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status';
  setSecondaryTab: (tab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  totalProductsCount: number;
  itemsAtRiskCount: number;
  setShowStoreProfile: (show: boolean) => void;
  setShowStatusModal: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  secondaryTab,
  setSecondaryTab,
  theme,
  setTheme,
  totalProductsCount,
  itemsAtRiskCount,
  setShowStoreProfile,
  setShowStatusModal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="copilot-viewport" style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Text-First Brand Identity (Zero Icons) */}
        <div
          style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setActiveTab('home')}
        >
          <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-main)', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
            RevenuePilot
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.01em', marginTop: 1 }}>
            AI revenue copilot
          </div>
        </div>

        {/* Center: Text Navigation with Subtle Active Indicators */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { id: 'home' as const, label: 'Overview' },
            { id: 'leaks' as const, label: 'Revenue', badge: itemsAtRiskCount },
            { id: 'inventory' as const, label: 'Inventory', badge: totalProductsCount },
            { id: 'decisions' as const, label: 'Decisions' },
            { id: 'whatif' as const, label: 'Simulator' },
          ].map(({ id, label, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--primary-blue-bg)' : 'transparent',
                  color: active ? 'var(--primary-blue)' : 'var(--text-sub)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <span>{label}</span>
                {badge !== undefined && (
                  <span className="badge-pill" style={{
                    background: id === 'inventory' ? 'var(--bg-subtle)' : '#fef3c7',
                    color: id === 'inventory' ? 'var(--text-main)' : '#92400e',
                    fontSize: 10,
                    padding: '1px 6px'
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary "More" Dropdown Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                borderRadius: 8, border: 'none', fontSize: 13, fontWeight: activeTab === 'more' ? 700 : 500,
                background: activeTab === 'more' ? 'var(--primary-blue-bg)' : 'transparent',
                color: activeTab === 'more' ? 'var(--primary-blue)' : 'var(--text-sub)',
                cursor: 'pointer',
              }}
            >
              <span>More</span>
              <ChevronDown size={11} color="var(--text-muted)" />
            </button>

            {showMoreMenu && (
              <div style={{
                position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
                boxShadow: 'var(--shadow-md)', padding: '6px 0', minWidth: 170, zIndex: 100,
              }}>
                {[
                  ['insights', 'Insights'],
                  ['experiments', 'Experiments'],
                  ['recovery', 'Recovery Log'],
                  ['timeline', 'Audit Timeline'],
                  ['status', 'System Diagnostics'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab('more');
                      setSecondaryTab(key as any);
                      setShowMoreMenu(false);
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: 'var(--text-main)', textAlign: 'left', fontWeight: 500,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Merchant Profile, Autopilot Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowStoreProfile(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 8,
              fontSize: 12, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
            }}
          >
            <Store size={13} color="var(--text-muted)" />
            <span>GreenBasket Market</span>
          </button>

          <button
            onClick={() => setShowStatusModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', borderRadius: 100,
              fontSize: 12, fontWeight: 600, color: 'var(--emerald-green)', cursor: 'pointer',
            }}
          >
            <span className="monitoring-dot" />
            <span>Autopilot Active</span>
          </button>

          {/* Notifications Icon Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Bell size={14} color="var(--text-muted)" />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 6, height: 6,
                borderRadius: '50%', background: 'var(--primary-blue)'
              }} />
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
                boxShadow: 'var(--shadow-md)', padding: 14, width: 280, zIndex: 100, fontSize: 12
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>Recent Signals</div>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • Fresh Juice 500ml flagged for expiry risk (2 days left).<br />
                  • Amul Taaza Milk stockout prevented automatically.<br />
                  • Weekly recovery report generated.
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Toggle Theme Mode"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? <Moon size={14} color="#3b82f6" /> : <Sun size={14} color="#f59e0b" />}
            </button>

            {showThemeMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10,
                boxShadow: 'var(--shadow-md)', padding: '6px 0', minWidth: 140, zIndex: 100,
              }}>
                {[
                  ['light', 'Light Mode', Sun],
                  ['dark', 'Dark Mode', Moon],
                  ['system', 'System Mode', Monitor],
                ].map(([tKey, tLabel, Icon]: any) => (
                  <button
                    key={tKey}
                    onClick={() => { setTheme(tKey); setShowThemeMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      padding: '8px 14px', background: theme === tKey ? 'var(--bg-subtle)' : 'none',
                      border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-main)', fontWeight: 500,
                    }}
                  >
                    <Icon size={14} color="var(--text-muted)" />
                    <span>{tLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-page)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
          }}>
            PK
          </div>
        </div>
      </div>
    </header>
  );
};
