import React from 'react';
import {
  Home, DollarSign, ShoppingBag, Layers, Sliders,
  Lightbulb, Beaker, RotateCcw, Clock, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Sparkline } from './Sparkline';

interface SidebarProps {
  activeTab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more';
  setActiveTab: (tab: 'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more') => void;
  secondaryTab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status';
  setSecondaryTab: (tab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  secondaryTab,
  setSecondaryTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const coreNav = [
    { id: 'home' as const, label: 'Overview', icon: Home },
    { id: 'leaks' as const, label: 'Revenue', icon: DollarSign },
    { id: 'inventory' as const, label: 'Inventory', icon: ShoppingBag },
    { id: 'decisions' as const, label: 'Decisions', icon: Layers },
    { id: 'whatif' as const, label: 'Simulator', icon: Sliders },
  ];

  const intelligenceNav = [
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'experiments' as const, label: 'Experiments', icon: Beaker },
    { id: 'recovery' as const, label: 'Recovery Log', icon: RotateCcw },
    { id: 'timeline' as const, label: 'Audit Timeline', icon: Clock },
    { id: 'status' as const, label: 'System Diagnostics', icon: Activity },
  ];

  return (
    <aside className="sidebar-permanent" style={{ width: isCollapsed ? 68 : 220 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Core Operations Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {coreNav.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={isCollapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: isCollapsed ? '10px' : '9px 12px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--accent-purple-bg)' : 'transparent',
                  color: active ? 'var(--accent-purple)' : 'var(--text-sub)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Icon size={16} color={active ? 'var(--accent-purple)' : 'var(--text-sub)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

        {/* Intelligence Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {intelligenceNav.map(({ id, label, icon: Icon }) => {
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
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: isCollapsed ? '10px' : '9px 12px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--accent-purple-bg)' : 'transparent',
                  color: active ? 'var(--accent-purple)' : 'var(--text-sub)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Icon size={16} color={active ? 'var(--accent-purple)' : 'var(--text-sub)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Section: Model Accuracy Card & Collapse Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Model Accuracy Card Widget (Matching Reference) */}
        {!isCollapsed && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
              Model Accuracy
            </div>
            
            <div style={{ height: 36, marginBottom: 8 }}>
              <Sparkline data={[92.4, 93.1, 92.8, 94.2, 95.0, 95.8]} isNegative={false} width={164} height={36} />
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              95.8%
            </div>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', marginTop: 2 }}>
              ↑ 2.4% vs last month
            </div>
          </div>
        )}

        {/* Collapse Sidebar Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 4px', background: 'none', border: 'none',
            color: 'var(--text-sub)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

      </div>
    </aside>
  );
};
