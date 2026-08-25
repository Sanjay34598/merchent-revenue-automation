import React, { useState } from 'react';
import {
  Store, Sun, Moon, Monitor, Bell, ChevronDown
} from 'lucide-react';

interface HeaderProps {
  selectedStore?: string | number;
  onStoreChange?: (storeId: string) => void;
  onBrandClick: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowStoreProfile: (show: boolean) => void;
  setShowStatusModal: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedStore = 'STR-1001',
  onStoreChange,
  onBrandClick,
  theme,
  setTheme,
  setShowStoreProfile,
  setShowStatusModal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // Generate 40 real store options STR-1001 to STR-1040
  const storeOptions = Array.from({ length: 40 }, (_, i) => `STR-${1001 + i}`);
  const currentStoreLabel = typeof selectedStore === 'number' ? `STR-${selectedStore}` : selectedStore;

  return (
    <header className="top-floating-header">
      
      {/* Left: Understated Serif Brand Wordmark */}
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

      {/* Right: Floating Utility Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Dynamic Data Status Pill */}
        <div
          style={{
            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
            background: 'var(--demo-pill-bg)', color: 'var(--demo-pill-text)', border: '1px solid var(--demo-pill-border)',
            letterSpacing: '0.04em', cursor: 'help'
          }}
          title="AI-assisted revenue intelligence backed by historical retail sales & inventory dataset."
        >
          HISTORICAL DATASET · 125,751 SALES · 284,755 INVENTORY RECORDS
        </div>

        {/* Store Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowStoreDropdown(!showStoreDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 100,
              fontSize: 12, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Store size={13} color="var(--text-sub)" />
            <span>{currentStoreLabel}</span>
            <ChevronDown size={11} color="var(--text-sub)" />
          </button>

          {showStoreDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', padding: '6px 0', maxHeight: 240, overflowY: 'auto', minWidth: 160, zIndex: 100,
            }}>
              {storeOptions.map(st => (
                <button
                  key={st}
                  onClick={() => {
                    if (onStoreChange) onStoreChange(st);
                    setShowStoreDropdown(false);
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 14px', background: currentStoreLabel === st ? 'var(--bg-subtle)' : 'none',
                    border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-main)', fontWeight: 500
                  }}
                >
                  {st} (Retail Outpost)
                </button>
              ))}
            </div>
          )}
        </div>

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
              background: 'var(--surface)', border: '1px solid var(--border-color)',
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
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', padding: 16, width: 280, zIndex: 100, fontSize: 12
            }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>Notifications</div>
              <div style={{ color: 'var(--text-sub)', lineHeight: 1.5 }}>
                • PROD-100043 markdown review ready.<br />
                • POS sale processed (TXN-00128). Stock updated.<br />
                • Store STR-1001 inventory reconciled.
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
              background: 'var(--surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Moon size={14} color="var(--accent-purple)" /> : <Sun size={14} color="#f59e0b" />}
          </button>

          {showThemeMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 12,
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
