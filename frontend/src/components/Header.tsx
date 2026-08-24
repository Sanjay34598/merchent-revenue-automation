import React, { useState } from 'react';
import {
  Store, Sun, Moon, Monitor, Bell, Menu, Shield
} from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowStoreProfile: (show: boolean) => void;
  setShowStatusModal: (show: boolean) => void;
  toggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  setShowStoreProfile,
  setShowStatusModal,
  toggleSidebar,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-header">
      {/* Left: Mobile Menu Toggle / Context Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4
            }}
          >
            <Menu size={18} />
          </button>
        )}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          GreenBasket Market · <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Commercial IT Park Location</span>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Merchant Store Profile Button */}
        <button
          onClick={() => setShowStoreProfile(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          <Store size={13} color="var(--text-muted)" />
          <span>GreenBasket Market</span>
        </button>

        {/* Autopilot Status Pill */}
        <button
          onClick={() => setShowStatusModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
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
              borderRadius: '50%', background: 'var(--accent-purple)'
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
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Moon size={14} color="#8B6CFF" /> : <Sun size={14} color="#f59e0b" />}
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
    </header>
  );
};
