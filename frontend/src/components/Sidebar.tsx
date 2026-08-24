import React from 'react';
import {
  Home, DollarSign, ShoppingBag, Layers, Sliders,
  Lightbulb, Beaker, RotateCcw, Clock, Activity, ChevronLeft, ChevronRight, FilePlus, ShieldCheck
} from 'lucide-react';
import { Sparkline } from './Sparkline';

interface SidebarProps {
  activeTab: 'home' | 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more';
  setActiveTab: (tab: 'home' | 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more') => void;
  secondaryTab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status' | 'quality';
  setSecondaryTab: (tab: 'insights' | 'recovery' | 'experiments' | 'timeline' | 'status' | 'quality') => void;
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
    { id: 'sales' as const, label: 'Transactions', icon: FilePlus },
    { id: 'leaks' as const, label: 'Revenue', icon: DollarSign },
    { id: 'inventory' as const, label: 'Inventory', icon: ShoppingBag },
    { id: 'decisions' as const, label: 'Decisions', icon: Layers },
  ];

  const intelligenceNav = [
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'whatif' as const, label: 'Simulator', icon: Sliders, isMainTab: true },
    { id: 'recovery' as const, label: 'Recovery Log', icon: RotateCcw },
    { id: 'timeline' as const, label: 'Audit Timeline', icon: Clock },
  ];

  const systemNav = [
    { id: 'quality' as const, label: 'Data Quality', icon: ShieldCheck },
    { id: 'status' as const, label: 'Diagnostics', icon: Activity },
  ];

  return (
    <aside className="sidebar-permanent" style={{ width: isCollapsed ? 64 : 184 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* CORE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 4px' }}>
              CORE
            </div>
          )}
          {coreNav.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
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
                <Icon size={15} color={active ? 'var(--accent-purple)' : 'var(--text-sub)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* INTELLIGENCE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 4px' }}>
              INTELLIGENCE
            </div>
          )}
          {intelligenceNav.map(({ id, label, icon: Icon, isMainTab }) => {
            const active = isMainTab ? (activeTab === id) : (activeTab === 'more' && secondaryTab === id);
            return (
              <button
                key={id}
                onClick={() => {
                  if (isMainTab) {
                    setActiveTab(id as any);
                  } else {
                    setActiveTab('more');
                    setSecondaryTab(id as any);
                  }
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
                <Icon size={15} color={active ? 'var(--accent-purple)' : 'var(--text-sub)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* SYSTEM SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 4px' }}>
              SYSTEM
            </div>
          )}
          {systemNav.map(({ id, label, icon: Icon }) => {
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
                <Icon size={15} color={active ? 'var(--accent-purple)' : 'var(--text-sub)'} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Section: Model Accuracy & Collapse Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!isCollapsed && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: 12, boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Model Accuracy
            </div>
            <div style={{ height: 28, marginBottom: 6 }}>
              <Sparkline data={[92.4, 93.1, 92.8, 94.2, 95.0, 95.8]} isNegative={false} width={130} height={28} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              95.8%
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)', marginTop: 1 }}>
              ↑ 2.4% vs last month
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            padding: '6px 4px', background: 'none', border: 'none',
            color: 'var(--text-sub)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
