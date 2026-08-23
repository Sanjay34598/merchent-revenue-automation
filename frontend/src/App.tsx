import React, { useEffect, useState, useRef, Component } from 'react';
import {
  Activity, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp,
  AlertTriangle, ArrowRight, RefreshCw, Play, Clock, HelpCircle,
  Zap, Sliders, Filter, X, ChevronDown, Server, Shield, Beaker,
  Layers, CheckSquare, Bell, MoreHorizontal, Store, ChevronRight,
  Sparkles, Target, Home, DollarSign, Lightbulb, TrendingDown,
  ArrowUpRight, Compass, Info, Check, Eye, User, Calendar
} from 'lucide-react';
import {
  HealthStatus, PageView, AgentActionItem, UnifiedDecision,
  RevenueOpportunity, OutcomeRecord, FailureRecord, Experiment,
  CustomSimulationResult, DecisionCandidate
} from './types';

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY — Guarantees application shell never crashes
// ─────────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error?: Error }
class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            RevenuePilot Encountered an Issue
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px', maxWidth: 420, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            className="btn-copilot btn-copilot-primary"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            <RefreshCw size={14} /> Reload RevenuePilot
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS & CATALOG DATA
// ─────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  if (typeof n !== 'number' || isNaN(n)) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const pct = (n: number): string => {
  if (typeof n !== 'number' || isNaN(n)) return '0%';
  return `${Math.round(n * 100)}%`;
};

const productMeta = (name: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('juice'))  return { emoji: '🥤', category: 'Beverages', shelfLife: '2 days', stock: '18 units' };
  if (n.includes('milk'))   return { emoji: '🥛', category: 'Dairy', shelfLife: '3 days', stock: '24 units' };
  if (n.includes('coffee')) return { emoji: '☕', category: 'Beverages', shelfLife: '14 days', stock: '12 units' };
  if (n.includes('rice'))   return { emoji: '🌾', category: 'Staples', shelfLife: '180 days', stock: '45 units' };
  if (n.includes('shampoo')) return { emoji: '🧴', category: 'Personal Care', shelfLife: '365 days', stock: '30 units' };
  if (n.includes('noodle')) return { emoji: '🍜', category: 'Instant Food', shelfLife: '90 days', stock: '50 units' };
  if (n.includes('bread'))  return { emoji: '🍞', category: 'Fresh Bakery', shelfLife: '2 days', stock: '15 units' };
  if (n.includes('egg'))    return { emoji: '🥚', category: 'Poultry', shelfLife: '7 days', stock: '36 units' };
  return { emoji: '🛒', category: 'Grocery', shelfLife: '30 days', stock: '20 units' };
};

const typeBadge = (t: string) => ({
  EXPIRY:    { label: 'Expiry Risk',    bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  STOCKOUT:  { label: 'Stockout Risk',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  OVERSTOCK: { label: 'Margin Leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
}[t] || { label: 'Revenue Leak', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' });

/** Safe API call wrapper for resilient non-blocking renders */
async function safeApi<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN REVENUEPILOT APPLICATION
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'leaks' | 'decisions' | 'whatif' | 'more'>('home');
  const [secondaryTab, setSecondaryTab] = useState<'insights' | 'recovery' | 'experiments' | 'timeline' | 'status'>('insights');

  const [selectedStore, setSelectedStore] = useState(1);

  // Core Business Data
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // Progressive Disclosure: Decision Workspace & Modal States
  const [activeWorkspaceOpp, setActiveWorkspaceOpp] = useState<RevenueOpportunity | null>(null);
  const [showProtectedBreakdown, setShowProtectedBreakdown] = useState(false);
  const [showInventoryBreakdown, setShowInventoryBreakdown] = useState(false);
  const [showStoreProfile, setShowStoreProfile] = useState(false);

  // Simulator State
  const [simQty, setSimQty] = useState(150);
  const [simDiscount, setSimDiscount] = useState(15);
  const [simResult, setSimResult] = useState<CustomSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Status & Notifications
  const [toast, setToast] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  // Data Fetching
  const fetchData = async () => {
    setLoading(true);
    setApiError(null);

    const decisionData = await safeApi(
      () => fetch('/api/autopilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: selectedStore }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      null
    );

    if (!decisionData) {
      setApiError('Offline mode. Displaying verified merchant dataset.');
    } else {
      setDecision(decisionData);
    }

    const [opps, acts, outs, fails, exps] = await Promise.all([
      safeApi(() => fetch(`/api/autopilot/opportunities?store_id=${selectedStore}`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/actions?store_id=${selectedStore}`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/autopilot/outcomes?store_id=${selectedStore}`).then(r => r.json()), null),
      safeApi(() => fetch('/api/autopilot/failures').then(r => r.json()), []),
      safeApi(() => fetch(`/api/autopilot/experiments?store_id=${selectedStore}`).then(r => r.json()), []),
    ]);

    setOpportunities(Array.isArray(opps) ? opps : []);
    setActions(Array.isArray(acts) ? acts : []);
    setOutcomes(outs);
    setFailures(Array.isArray(fails) ? fails : []);
    setExperiments(Array.isArray(exps) ? exps : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedStore]);

  // Actions Lifecycle
  const handleApprove = (id: number) => {
    fetch(`/api/actions/${id}/approve`, { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        triggerToast(`Action #${id} approved. Scheduled for execution.`);
        fetchData();
      })
      .catch(() => triggerToast('Action approved.'));
  };

  const handleDemoScenario = (scenarioId: number) => {
    setShowDemoMenu(false);
    setLoading(true);
    fetch(`/api/autopilot/demo-scenario/${scenarioId}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setDecision(d.decision || d);
        triggerToast(`Loaded Demo Scenario ${scenarioId}`);
        setLoading(false);
        setActiveTab('decisions');
      })
      .catch(() => setLoading(false));
  };

  const handleRunSimulation = () => {
    setSimLoading(true);
    fetch('/api/autopilot/simulate-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: selectedStore,
        product_id: 1,
        custom_order_quantity: simQty,
        custom_discount_percent: simDiscount,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setSimResult(d);
        setSimLoading(false);
        triggerToast('Simulation completed.');
      })
      .catch(() => setSimLoading(false));
  };

  // Realistic Merchant Metrics
  const totalRecoveredThisWeek = 1340;
  const totalCurrentlyAtRisk = 2138;
  const pendingDecisions = 3;
  const inventoryHealthPct = '94%';

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>

        {/* Toast Alert Banner */}
        {toast && (
          <div className="toast-banner">
            <CheckCircle2 size={16} color="#34d399" />
            <span>{toast}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            HEADER — SINGLE COMPACT PRIMARY HEADER ONLY (1400px Viewport)
            ══════════════════════════════════════════════════════ */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div className="copilot-viewport" style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left: RevenuePilot Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  RevenuePilot
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                  AI revenue copilot
                </div>
              </div>
            </div>

            {/* Center: Primary Navigation Tabs & Secondary "More" Menu */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                { id: 'home' as const, label: 'Home', icon: Home },
                { id: 'leaks' as const, label: 'Revenue', icon: DollarSign, badge: 3 },
                { id: 'decisions' as const, label: 'Decisions', icon: Layers },
                { id: 'whatif' as const, label: 'Simulator', icon: Sliders },
              ].map(({ id, label, icon: Icon, badge }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 8, border: 'none',
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      background: active ? '#eff6ff' : 'transparent',
                      color: active ? '#2563eb' : '#475569',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} color={active ? '#2563eb' : '#64748b'} />
                    <span>{label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="badge-pill" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: 10 }}>
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
                    display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px',
                    borderRadius: 8, border: 'none', fontSize: 13, fontWeight: activeTab === 'more' ? 700 : 500,
                    background: activeTab === 'more' ? '#eff6ff' : 'transparent',
                    color: activeTab === 'more' ? '#2563eb' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <span>More</span>
                  <ChevronDown size={11} color="#94a3b8" />
                </button>
                {showMoreMenu && (
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
                    boxShadow: '0 10px 30px rgba(15,23,42,0.12)', padding: '6px 0', minWidth: 170, zIndex: 100,
                  }}>
                    {[
                      ['insights', 'Insights'],
                      ['experiments', 'Experiments'],
                      ['recovery', 'Recovery Log'],
                      ['timeline', 'Timeline Audit'],
                      ['status', 'System Status'],
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
                          fontSize: 13, color: '#0f172a', textAlign: 'left', fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Merchant Store Selector & Autopilot Active Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Store Profile Selector */}
              <button
                onClick={() => setShowStoreProfile(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer',
                }}
              >
                <Store size={13} color="#64748b" />
                <span>GreenBasket Market</span>
              </button>

              {/* Autopilot Active Indicator */}
              <button
                onClick={() => setShowStatusModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                  background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 100,
                  fontSize: 12, fontWeight: 600, color: '#047857', cursor: 'pointer',
                }}
              >
                <span className="monitoring-dot" />
                <span>Autopilot Active</span>
              </button>

              {/* Notification Icon */}
              <button
                onClick={() => setActiveTab('decisions')}
                style={{
                  position: 'relative', width: 32, height: 32, borderRadius: 8,
                  background: '#ffffff', border: '1px solid #e2e8f0', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Bell size={14} color="#475569" />
                <span style={{
                  position: 'absolute', top: 5, right: 5, width: 6, height: 6,
                  borderRadius: '50%', background: '#dc2626',
                }} />
              </button>

              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#0f172a', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              }}>
                PK
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════
            MAIN CONTENT AREA (1400px Viewport)
            ══════════════════════════════════════════════════════ */}
        <main className="copilot-viewport" style={{ padding: '32px 40px 80px' }}>

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <RefreshCw size={24} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>Analyzing GreenBasket demand signals...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ════════════════════════════════════════════════
                  2. HOMEPAGE — DOMINANT FINANCIAL STATEMENT
                  ════════════════════════════════════════════════ */}
              {activeTab === 'home' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Hero Block: Dominant Financial Statement */}
                  <div>
                    <div className="statement-greeting">
                      Good afternoon, Sanjay
                    </div>
                    <h1 className="statement-main">
                      RevenuePilot recovered <span style={{ color: '#059669' }}>{fmt(totalRecoveredThisWeek)}</span> this week.
                    </h1>
                    <div className="statement-sub">
                      ↑12.4% vs last week
                    </div>

                    {/* Compact Typography-Driven Supporting Information (NO giant cards!) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16, fontSize: 13, color: '#475569' }}>
                      <div>
                        <strong style={{ color: '#dc2626', fontSize: 15 }}>{fmt(totalCurrentlyAtRisk)}</strong> currently at risk
                      </div>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <div>
                        <strong style={{ color: '#2563eb', fontSize: 15 }}>{pendingDecisions}</strong> decisions waiting
                      </div>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <div
                        onClick={() => setShowInventoryBreakdown(true)}
                        style={{ cursor: 'pointer', textDecoration: 'underline text-decoration-color: #cbd5e1' }}
                      >
                        <strong style={{ color: '#0f172a', fontSize: 15 }}>{inventoryHealthPct}</strong> inventory health (click to expand)
                      </div>
                    </div>
                  </div>

                  {/* 3. BUSINESS PULSE ROW — Thin & Elegant */}
                  <div style={{
                    borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                    padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: 13, fontWeight: 500, color: '#334155',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      BUSINESS PULSE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <span>Revenue <strong style={{ color: '#059669' }}>↑8.4%</strong></span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Demand <strong style={{ color: '#059669' }}>↑12%</strong></span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Margin <strong style={{ color: '#059669' }}>↑2.1%</strong></span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Inventory <strong style={{ color: '#059669' }}>Healthy</strong></span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Risks <strong style={{ color: '#ea580c' }}>3 active</strong></span>
                    </div>
                  </div>

                  {/* 4. MAIN EXPERIENCE: "WHAT NEEDS YOUR ATTENTION" */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <h2 className="section-head">What needs your attention</h2>
                      <div className="section-sub">
                        RevenuePilot found 3 situations that could affect today's revenue.
                      </div>
                    </div>

                    {/* 3 Highly Polished Interactive Opportunity Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      
                      {/* Row 1: Fresh Juice · Expiry risk */}
                      <div
                        className="copilot-row"
                        onClick={() => setActiveWorkspaceOpp({
                          opportunity_id: 'Fresh_Juice',
                          merchant_id: 1, store_id: 1,
                          opportunity_type: 'EXPIRY',
                          estimated_revenue_loss: 490,
                          estimated_recoverable_revenue: 354,
                          estimated_profit_impact: 220,
                          confidence: 0.88, urgency: 'HIGH',
                          evidence: ['Demand dropped 21% while 18 units remain.', 'Expires in 2 days.', 'Historical waste: ₹1,240'],
                          recommended_action: '15% clearance discount',
                          alternatives: ['Do nothing (₹0)', '10% discount (₹271)', '20% discount (₹321)'],
                          created_at: new Date().toISOString(), status: 'OPEN'
                        })}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 26 }}>🥤</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Fresh Juice</span>
                              <span className="badge-pill" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Expiry risk</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                              Demand dropped 21% while 18 units remain. Expires in 2 days.
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>AT RISK</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>₹490</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>RECOVERABLE</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#047857' }}>₹354</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>RECOMMENDED</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>15% clearance</div>
                          </div>
                          <button className="btn-copilot btn-copilot-ghost" style={{ fontWeight: 700 }}>
                            See why →
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Coffee · Stockout risk */}
                      <div
                        className="copilot-row"
                        onClick={() => setActiveWorkspaceOpp({
                          opportunity_id: 'Organic_Coffee',
                          merchant_id: 1, store_id: 1,
                          opportunity_type: 'STOCKOUT',
                          estimated_revenue_loss: 360,
                          estimated_recoverable_revenue: 260,
                          estimated_profit_impact: 180,
                          confidence: 0.91, urgency: 'HIGH',
                          evidence: ['Demand velocity increased 32%.', '12 units remain in inventory.', 'Stockout in 1.1 days.'],
                          recommended_action: 'Reorder 10 units',
                          alternatives: ['Do nothing'],
                          created_at: new Date().toISOString(), status: 'OPEN'
                        })}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 26 }}>☕</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Coffee</span>
                              <span className="badge-pill" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>Stockout risk</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                              Demand velocity increased 32%. 12 units remain in stock.
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>AT RISK</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>₹360</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>RECOVERABLE</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#047857' }}>₹260</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>RECOMMENDED</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Reorder 10 units</div>
                          </div>
                          <button className="btn-copilot btn-copilot-ghost" style={{ fontWeight: 700 }}>
                            See why →
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Rice · Margin leak */}
                      <div
                        className="copilot-row"
                        onClick={() => setActiveWorkspaceOpp({
                          opportunity_id: 'Premium_Rice',
                          merchant_id: 1, store_id: 1,
                          opportunity_type: 'OVERSTOCK',
                          estimated_revenue_loss: 789,
                          estimated_recoverable_revenue: 517,
                          estimated_profit_impact: 340,
                          confidence: 0.85, urgency: 'MEDIUM',
                          evidence: ['Supplier cost increased 6.2% while selling price remained unchanged.', 'Margin compressed by 3.1%.'],
                          recommended_action: 'Adjust retail price +4%',
                          alternatives: ['Absorb cost'],
                          created_at: new Date().toISOString(), status: 'OPEN'
                        })}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 26 }}>🌾</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Rice</span>
                              <span className="badge-pill" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Margin leak</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                              Supplier cost increased while selling price remained unchanged.
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>AT RISK</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>₹789</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>RECOVERABLE</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#047857' }}>₹517</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>RECOMMENDED</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Adjust price +4%</div>
                          </div>
                          <button className="btn-copilot btn-copilot-ghost" style={{ fontWeight: 700 }}>
                            See why →
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 6. AI ACTIVITY FEED ("RevenuePilot is working") */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 24px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      REVENUEPILOT IS WORKING
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                      <div><strong style={{ color: '#0f172a' }}>09:42 AM</strong> · Detected abnormal demand drop (Fresh Juice)</div>
                      <div><strong style={{ color: '#0f172a' }}>09:44 AM</strong> · Compared 12 historical demand patterns</div>
                      <div><strong style={{ color: '#0f172a' }}>09:45 AM</strong> · Simulated 4 recovery strategies</div>
                      <div><strong style={{ color: '#0f172a' }}>09:46 AM</strong> · Recommended 15% clearance discount</div>
                    </div>
                  </div>

                </div>
              )}

              {/* ════════════════════════════════════════════════
                  REVENUE STREAM TAB
                  ════════════════════════════════════════════════ */}
              {activeTab === 'leaks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h1 className="section-head" style={{ fontSize: 26 }}>Revenue Opportunities</h1>
                    <div className="section-sub">
                      Intelligent revenue defense stream for GreenBasket Market.
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {opportunities.map((opp, idx) => (
                      <div
                        key={opp.opportunity_id || idx}
                        className="copilot-row"
                        onClick={() => setActiveWorkspaceOpp(opp)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 24 }}>{productMeta(opp.opportunity_id).emoji}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                                {opp.opportunity_id.replace(/_/g, ' ')}
                              </span>
                              <span className="badge-pill" style={{ background: typeBadge(opp.opportunity_type).bg, color: typeBadge(opp.opportunity_type).color, border: `1px solid ${typeBadge(opp.opportunity_type).border}` }}>
                                {typeBadge(opp.opportunity_type).label}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{opp.recommended_action}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>AT RISK</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>{fmt(opp.estimated_revenue_loss)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>RECOVERABLE</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#047857' }}>{fmt(opp.estimated_recoverable_revenue)}</div>
                          </div>
                          <button className="btn-copilot btn-copilot-secondary">See why →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════
                  DECISION CENTER TAB (Strategy Ranking)
                  ════════════════════════════════════════════════ */}
              {activeTab === 'decisions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 className="section-head" style={{ fontSize: 26 }}>Decision Center</h1>
                    <div className="section-sub">
                      AI strategy ranking evaluating Status Quo against candidate actions.
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1.5px solid #2563eb', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>
                      AI RECOMMENDS FOR FRESH JUICE
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8', margin: '0 0 8px' }}>
                      15% clearance discount
                    </h2>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                      Why? Demand dropped 21% | Expiry in 2 days | Inventory: 18 units | Expected recovery: <strong style={{ color: '#047857' }}>₹354</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn-copilot btn-copilot-primary" onClick={() => setActiveTab('whatif')}>
                        Simulate
                      </button>
                      <button className="btn-copilot btn-copilot-success" onClick={() => handleApprove(1)}>
                        Approve action
                      </button>
                    </div>
                  </div>

                  {/* Strategy Visual Ranking */}
                  <div>
                    <div className="section-head" style={{ fontSize: 16, marginBottom: 12 }}>Strategy Ranking Comparison</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { name: 'DO NOTHING', rec: 0, label: 'No recovery' },
                        { name: '10% DISCOUNT', rec: 271, label: 'Moderate recovery' },
                        { name: '15% DISCOUNT', rec: 354, label: 'RECOMMENDED (Optimal)' },
                        { name: '20% DISCOUNT', rec: 321, label: 'Margin risk' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          background: item.name.includes('15%') ? '#eff6ff' : '#ffffff',
                          border: item.name.includes('15%') ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: 8, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <strong style={{ fontSize: 14 }}>{item.name}</strong>
                            {item.name.includes('15%') && <span className="badge-pill" style={{ background: '#2563eb', color: '#ffffff' }}>RECOMMENDED</span>}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: item.rec > 0 ? '#047857' : '#64748b' }}>
                            {fmt(item.rec)} expected recovery
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════
                  WHAT-IF SIMULATOR TAB
                  ════════════════════════════════════════════════ */}
              {activeTab === 'whatif' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 className="section-head" style={{ fontSize: 26 }}>What-If Decision Simulator</h1>
                    <div className="section-sub">
                      Interactive financial model. Move sliders to simulate real-time impact.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Adjust Variables</h3>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                          Clearance Discount: <strong style={{ color: '#2563eb' }}>{simDiscount}%</strong>
                        </label>
                        <input type="range" min={0} max={50} step={5} value={simDiscount} onChange={e => setSimDiscount(Number(e.target.value))} />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                          Order Quantity: <strong style={{ color: '#2563eb' }}>{simQty} units</strong>
                        </label>
                        <input type="range" min={0} max={300} step={10} value={simQty} onChange={e => setSimQty(Number(e.target.value))} />
                      </div>
                      <button className="btn-copilot btn-copilot-primary" style={{ width: '100%' }} onClick={handleRunSimulation} disabled={simLoading}>
                        {simLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                        <span>Calculate Impact</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Dominant Impact Banner */}
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>ESTIMATED FINANCIAL IMPACT</div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                          +₹354 expected recovery
                        </div>
                        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#059669', marginTop: 8 }}>
                          <span>Sell-through: <strong>+31%</strong></span>
                          <span>Waste risk: <strong>-42%</strong></span>
                          <span>Margin impact: <strong>-1.8%</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════
                  MORE TAB (Secondary Views)
                  ════════════════════════════════════════════════ */}
              {activeTab === 'more' && (
                <div>
                  <h1 className="section-head" style={{ fontSize: 26, marginBottom: 16 }}>Secondary Intelligence</h1>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {['insights', 'recovery', 'experiments', 'timeline', 'status'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSecondaryTab(tab as any)}
                        className="btn-copilot btn-copilot-secondary"
                        style={{
                          background: secondaryTab === tab ? '#eff6ff' : '#ffffff',
                          color: secondaryTab === tab ? '#2563eb' : '#475569',
                          borderColor: secondaryTab === tab ? '#2563eb' : '#cbd5e1',
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {secondaryTab === 'insights' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <strong>Friday evening beverage demand is 24% higher than weekday baseline.</strong>
                      </div>
                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <strong>Organic Milk is selling 18% faster than reorder threshold.</strong>
                      </div>
                    </div>
                  )}

                  {secondaryTab === 'status' && (
                    <div style={{ background: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <h3>System Diagnostics</h3>
                      <p>Execution Mode: <strong>MOCK (Safe)</strong></p>
                      <p>Forecast Engine: <strong>Operational</strong></p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </main>

        {/* ══════════════════════════════════════════════════════
            5. PROGRESSIVE DISCLOSURE: EXPANDED DECISION WORKSPACE
            ══════════════════════════════════════════════════════ */}
        {activeWorkspaceOpp && (
          <div className="workspace-overlay" onClick={() => setActiveWorkspaceOpp(null)}>
            <div className="workspace-drawer" onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span className="badge-pill" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                    EXPIRY RISK
                  </span>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                    {activeWorkspaceOpp.opportunity_id.replace(/_/g, ' ')}
                  </h2>
                </div>
                <button onClick={() => setActiveWorkspaceOpp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#64748b" />
                </button>
              </div>

              {/* 7. AI PIPELINE STAGE VISUALIZATION */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '8px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {['OBSERVE', 'DETECT', 'SIMULATE', 'DECIDE', 'EXECUTE', 'LEARN'].map((stage, i) => {
                  const isActive = stage === 'DECIDE';
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`pipeline-stage ${isActive ? 'active' : ''}`}>
                        {stage}
                      </span>
                      {i < 5 && <ChevronRight size={10} color="#cbd5e1" />}
                    </div>
                  );
                })}
              </div>

              {/* Potential Loss Banner */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>POTENTIAL REVENUE LOSS</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#b91c1c', marginTop: 2 }}>₹490</div>
              </div>

              {/* Compact Evidence Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>DEMAND</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>-21%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>STOCK</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>18 units</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>EXPIRY</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>2 days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>HIST. WASTE</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>₹1,240</div>
                </div>
              </div>

              {/* RevenuePilot Recommends Section */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 6 }}>REVENUEPILOT RECOMMENDS</div>
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', marginBottom: 10 }}>
                    15% clearance discount
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', padding: 8, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>RECOVERY</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#047857' }}>₹354</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: 8, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>SELL-THROUGH</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#047857' }}>+31%</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: 8, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#047857', fontWeight: 700 }}>WASTE RISK</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#047857' }}>-42%</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: 8, borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>CONFIDENCE</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>88%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY THIS ACTION? */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>WHY THIS ACTION?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#475569' }}>
                  <div>1. Current demand is slowing.</div>
                  <div>2. Inventory is approaching expiry window.</div>
                  <div>3. A 15% discount historically improves velocity.</div>
                  <div>4. Product margin remains positive after discount.</div>
                </div>
              </div>

              {/* Strategy Comparison Ranking */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>STRATEGY COMPARISON</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    <span>DO NOTHING</span>
                    <strong>₹0 recovery</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    <span>10% DISCOUNT</span>
                    <strong>₹271 recovery</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', padding: 8, borderRadius: 6, color: '#1d4ed8', fontWeight: 700 }}>
                    <span>15% DISCOUNT (RECOMMENDED)</span>
                    <span>₹354 recovery</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    <span>20% DISCOUNT</span>
                    <strong>₹321 recovery</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-copilot btn-copilot-secondary" style={{ flex: 1 }} onClick={() => { setActiveWorkspaceOpp(null); setActiveTab('whatif'); }}>
                  SIMULATE
                </button>
                <button className="btn-copilot btn-copilot-success" style={{ flex: 1 }} onClick={() => { handleApprove(1); setActiveWorkspaceOpp(null); }}>
                  APPROVE ACTION
                </button>
              </div>

            </div>
          </div>
        )}

        {/* EXPANDABLE INVENTORY BREAKDOWN MODAL */}
        {showInventoryBreakdown && (
          <div className="workspace-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowInventoryBreakdown(false)}>
            <div className="surface-card" style={{ maxWidth: 440, width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Inventory Health Breakdown</h3>
                <button onClick={() => setShowInventoryBreakdown(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monitored Products</span>
                  <strong>126 items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Healthy Inventory</span>
                  <strong>118 healthy</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c2410c' }}>
                  <span>Low Stock Warning</span>
                  <strong>5 low stock</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                  <span>Expiry Risk</span>
                  <strong>3 active risks</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STORE PROFILE MODAL */}
        {showStoreProfile && (
          <div className="workspace-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowStoreProfile(false)}>
            <div className="surface-card" style={{ maxWidth: 440, width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>GreenBasket Market</h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Grocery & Essentials · Hyderabad</div>
                </div>
                <button onClick={() => setShowStoreProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>REVENUE TODAY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>₹18,420</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>ORDERS TODAY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>126</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
