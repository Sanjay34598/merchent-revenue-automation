import React from 'react';
import {
  Home, DollarSign, ShoppingBag, Layers, Sliders,
  Lightbulb, Beaker, RotateCcw, Clock, Activity, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more';
  setActiveTab: (tab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more') => void;
  secondaryTab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status';
  setSecondaryTab: (tab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status') => void;
  totalProductsCount: number;
  itemsAtRiskCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  secondaryTab,
  setSecondaryTab,
  totalProductsCount,
  itemsAtRiskCount,
  isCollapsed,
  setIsCollapsed,
}) => {
  const mainNav = [
    { id: 'home' as const, label: 'Overview', icon: Home },
    { id: 'leaks' as const, label: 'Revenue', icon: DollarSign, badge: itemsAtRiskCount },
    { id: 'inventory' as const, label: 'Inventory', icon: ShoppingBag, badge: totalProductsCount },
    { id: 'decisions' as const, label: 'Decisions', icon: Layers },
    { id: 'whatif' as const, label: 'Simulator', icon: Sliders },
  ];

  const secondaryNav = [
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'experiments' as const, label: 'Experiments', icon: Beaker },
    { id: 'recovery' as const, label: 'Recovery Log', icon: RotateCcw },
    { id: 'timeline' as const, label: 'Audit Timeline', icon: Clock },
    { id: 'status' as const, label: 'Diagnostics', icon: Activity },
  ];

  return (
    <aside
      className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? 68 : 220,
        padding: isCollapsed ? '16px 8px' : '20px 14px',
      }}
    >
      <div>
        {/* Brand Wordmark (Zero Flash Icon) */}
        <div style={{ marginBottom: 24, paddingLeft: isCollapsed ? 4 : 6 }}>
          {!isCollapsed ? (
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-main)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                MerchIntell
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
                AI REVENUE COPILOT
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--accent-purple)' }}>
              MI
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 16 }} />

        {/* Main Navigation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 20 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
              Core Operations
            </div>
          )}
          {mainNav.map(({ id, label, icon: Icon, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={isCollapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '9px' : '8px 10px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--accent-purple-bg)' : 'transparent',
                  color: active ? 'var(--accent-purple)' : 'var(--text-sub)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} color={active ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                  {!isCollapsed && <span>{label}</span>}
                </div>
                {!isCollapsed && badge !== undefined && (
                  <span className="badge-pill" style={{
                    background: id === 'inventory' ? 'var(--bg-subtle)' : 'var(--risk-red-bg)',
                    color: id === 'inventory' ? 'var(--text-main)' : 'var(--risk-red)',
                    border: `1px solid ${id === 'inventory' ? 'var(--border-color)' : 'var(--risk-red-border)'}`,
                    fontSize: 10,
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Intelligence Navigation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
              Intelligence
            </div>
          )}
          {secondaryNav.map(({ id, label, icon: Icon }) => {
            const active = activeTab === 'more' && secondaryTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab('more');
                  setSecondaryTab(id as any);
                }}
                title={isCollapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: isCollapsed ? '9px' : '8px 10px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--accent-purple-bg)' : 'transparent',
                  color: active ? 'var(--accent-purple)' : 'var(--text-sub)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Icon size={16} color={active ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Section: Model Accuracy Widget & Collapse Button */}
      <div>
        {!isCollapsed && (
          <div style={{
            background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
            borderRadius: 8, padding: 12, marginBottom: 12
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              MODEL ACCURACY
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>95.8%</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={12} /> ↑ 2.4%
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>vs last month</div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px', background: 'none', border: '1px solid var(--border-color)',
            borderRadius: 8, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!isCollapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
