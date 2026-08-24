import React, { useState } from 'react';
import {
  Store, Sun, Moon, Monitor, Bell, ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onBrandClick: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowStoreProfile: (show: boolean) => void;
  setShowStatusModal: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBrandClick,
  theme,
  setTheme,
  setShowStoreProfile,
  setShowStatusModal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-floating-header">
      
      {/* Left: Small, Restrained Wordmark (Zero Flash Icon) */}
      <div
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', userSelect: 'none' }}
        onClick={onBrandClick}
      >
        <div className="brand-wordmark">
          MerchIntell
        </div>
        <div className="brand-subtitle">
          AI REVENUE COPILOT
        </div>
      </div>

      {/* Right: Floating Utility Controls (No Header Box Container) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setShowStoreProfile(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 100,
            fontSize: 12, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          <Store size={13} color="var(--text-sub)" />
          <span>GreenBasket Market</span>
          <ChevronDown size={11} color="var(--text-sub)" />
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

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={14} color="var(--text-sub)" />
            <span style={{
              position: 'absolute', top: 1, right: 1, width: 14, height: 14,
              borderRadius: '50%', background: 'var(--risk-red)', color: '#ffffff',
              fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
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
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>Notifications</div>
              <div style={{ color: 'var(--text-sub)', lineHeight: 1.5 }}>
                • Fresh Milk 1L clearance discount ready for review.<br />
                • POS sale processed (TXN-00129). Inventory updated.<br />
                • Weekly recovery target 92% achieved.
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="Toggle Theme Mode"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Moon size={14} color="#8B6CFF" /> : <Sun size={14} color="#f59e0b" />}
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

        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-page)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
        }}>
          PK
        </div>
      </div>
    </header>
  );
};
