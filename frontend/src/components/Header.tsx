import React, { useState } from 'react';
import {
  Store, Sun, Moon, Monitor, Bell, ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more';
  setActiveTab: (tab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more') => void;
  secondaryTab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status';
  setSecondaryTab: (tab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
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
  setShowStoreProfile,
  setShowStatusModal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-header-full">
      
      {/* Left: Brand Identity (Serif Display Wordmark, Zero Flash Icon) */}
      <div
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setActiveTab('home')}
      >
        <div className="brand-wordmark">
          MerchIntell
        </div>
        <div className="brand-subtitle">
          AI REVENUE COPILOT
        </div>
      </div>

      {/* Center: Navigation Pill Bar (Matching Reference) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {[
          { id: 'home' as const, label: 'Overview' },
          { id: 'leaks' as const, label: 'Revenue' },
          { id: 'inventory' as const, label: 'Inventory' },
          { id: 'decisions' as const, label: 'Decisions' },
          { id: 'whatif' as const, label: 'Simulator' },
          { id: 'more' as const, label: 'Insights', isInsight: true },
        ].map(({ id, label, isInsight }) => {
          const active = isInsight ? (activeTab === 'more' && secondaryTab === 'insights') : activeTab === id;
          return (
            <button
              key={id}
              onClick={() => {
                if (isInsight) {
                  setActiveTab('more');
                  setSecondaryTab('insights');
                } else {
                  setActiveTab(id);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 100, border: 'none',
                fontSize: 13, fontWeight: active ? 700 : 500,
                background: active ? 'var(--accent-purple-bg)' : 'transparent',
                color: active ? 'var(--accent-purple)' : 'var(--text-sub)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <span>{label}</span>
              {active && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-purple)'
                }} />
              )}
            </button>
          );
        })}

        {/* More Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px',
              borderRadius: 100, border: 'none', fontSize: 13, fontWeight: (activeTab === 'more' && secondaryTab !== 'insights') ? 700 : 500,
              background: (activeTab === 'more' && secondaryTab !== 'insights') ? 'var(--accent-purple-bg)' : 'transparent',
              color: (activeTab === 'more' && secondaryTab !== 'insights') ? 'var(--accent-purple)' : 'var(--text-sub)',
              cursor: 'pointer',
            }}
          >
            <span>More</span>
            <ChevronDown size={12} color="var(--text-sub)" />
          </button>

          {showMoreMenu && (
            <div style={{
              position: 'absolute', left: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', padding: '6px 0', minWidth: 170, zIndex: 100,
            }}>
              {[
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
                    display: 'block', width: '100%', padding: '8px 16px',
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

      {/* Right Controls: Store Selector, Status Pill, Notifications, Theme, Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Store Profile Selector Pill */}
        <button
          onClick={() => setShowStoreProfile(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 100,
            fontSize: 12, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          <Store size={13} color="var(--text-sub)" />
          <span>GreenBasket Market</span>
          <ChevronDown size={11} color="var(--text-sub)" />
        </button>

        {/* Autopilot Status Pill */}
        <button
          onClick={() => setShowStatusModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', borderRadius: 100,
            fontSize: 12, fontWeight: 600, color: 'var(--emerald-green)', cursor: 'pointer',
          }}
        >
          <span className="monitoring-dot" />
          <span>Autopilot Active</span>
        </button>

        {/* Notifications Icon Button with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={15} color="var(--text-sub)" />
            <span style={{
              position: 'absolute', top: 2, right: 2, width: 15, height: 15,
              borderRadius: '50%', background: 'var(--risk-red)', color: '#ffffff',
              fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              3
            </span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', padding: 16, width: 280, zIndex: 100, fontSize: 12
            }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>Recent Signals</div>
              <div style={{ color: 'var(--text-sub)', lineHeight: 1.5 }}>
                • Fresh Orange Juice 500ml flagged for expiry risk (2 days left).<br />
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
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Moon size={15} color="#8B6CFF" /> : <Sun size={15} color="#f59e0b" />}
          </button>

          {showThemeMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12,
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
                  <Icon size={14} color="var(--text-sub)" />
                  <span>{tLabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-page)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        }}>
          PK
        </div>

      </div>
    </header>
  );
};
