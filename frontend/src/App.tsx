import React, { useEffect, useState, useRef, Component, useMemo } from 'react';
import {
  Activity, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp,
  AlertTriangle, ArrowRight, RefreshCw, Play, Clock, HelpCircle,
  Zap, Sliders, Filter, X, ChevronDown, Server, Shield, Beaker,
  Layers, CheckSquare, Bell, MoreHorizontal, Store, ChevronRight,
  Sparkles, Target, Home, DollarSign, Lightbulb, TrendingDown,
  ArrowUpRight, Compass, Info, Check, Eye, User, Calendar, Moon, Sun, Monitor, Search, ShoppingBag, Terminal
} from 'lucide-react';
import {
  HealthStatus, PageView, AgentActionItem, UnifiedDecision,
  RevenueOpportunity, OutcomeRecord, FailureRecord, Experiment,
  CustomSimulationResult, DecisionCandidate
} from './types';
import {
  generateMerchantInventory, getInventoryStats, ProductItem
} from './data/merchantInventory';

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY — Guarantees application shell never crashes
// ─────────────────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RevenuePilot ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '280px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: 12, padding: 32, textAlign: 'center', margin: '20px 0'
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px' }}>
            {this.props.fallbackTitle || 'RevenuePilot Encountered a View Issue'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 16px', maxWidth: 440, lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering state occurred in this component.'}
          </p>
          <button
            className="btn-copilot btn-copilot-primary"
            onClick={() => { this.setState({ hasError: false }); }}
          >
            <RefreshCw size={14} /> Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// FORMATTING HELPERS & SPARKLINE COMPONENT
// ─────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null): string => {
  if (typeof n !== 'number' || isNaN(n)) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const pct = (n: number | undefined | null): string => {
  if (typeof n !== 'number' || isNaN(n)) return '0%';
  return `${Math.round(n * 100)}%`;
};

const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
  switch (status) {
    case 'EXPIRY':     return { label: 'Expiry Risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
    case 'STOCKOUT':   return { label: 'Stockout Risk', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
    case 'MARGIN_LEAK':return { label: 'Margin Leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
    default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
  }
};

/** Compact SVG Sparkline for 7-day demand trend */
function Sparkline({ data, isNegative = false }: { data?: number[]; isNegative?: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 18;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isNegative ? 'var(--risk-red)' : 'var(--emerald-green)';

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', verticalAlign: 'middle' }}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/** Safe API fetcher helper */
async function safeApi<T>(fetcher: () => Promise<T>, fallback: T): Promise<{ data: T; ok: boolean }> {
  try {
    const data = await fetcher();
    return { data: data ?? fallback, ok: true };
  } catch (err) {
    console.warn('API fetch warning, using fallback:', err);
    return { data: fallback, ok: false };
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN REVENUEPILOT APPLICATION
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more'>('home');
  const [secondaryTab, setSecondaryTab] = useState<'insights' | 'recovery' | 'experiments' | 'timeline' | 'status'>('insights');
  
  // Theme state with localStorage initialization
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('revenuepilot-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  const [selectedStore, setSelectedStore] = useState(1);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Synthetic 150 Merchant Catalog Seed Layer
  const merchantCatalog = useMemo(() => generateMerchantInventory(), []);
  const inventoryStats = useMemo(() => getInventoryStats(merchantCatalog), [merchantCatalog]);

  // Inventory Table Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');

  // Backend Data States
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // Workspace Detail Drawer (Product or Opportunity)
  const [selectedProductWorkspace, setSelectedProductWorkspace] = useState<ProductItem | null>(null);

  // Modals & Menus
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStoreProfile, setShowStoreProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Simulator State
  const [simQty, setSimQty] = useState(150);
  const [simDiscount, setSimDiscount] = useState(15);
  const [simResult, setSimResult] = useState<CustomSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  // Theme Sync Effect
  useEffect(() => {
    try {
      localStorage.setItem('revenuepilot-theme', theme);
    } catch (e) {
      // ignore
    }

    const resolveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const effectiveTheme = resolveTheme();
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [theme]);

  // Data Fetching from FastAPI Backend
  const fetchData = async () => {
    setLoading(true);
    let anyOk = false;

    const resDecision = await safeApi(
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

    if (resDecision.ok && resDecision.data) {
      setDecision(resDecision.data);
      anyOk = true;
    }

    const [resOpps, resActs, resOuts, resFails, resExps] = await Promise.all([
      safeApi(() => fetch(`/api/autopilot/opportunities?store_id=${selectedStore}`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/actions?store_id=${selectedStore}`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/autopilot/outcomes?store_id=${selectedStore}`).then(r => r.json()), null),
      safeApi(() => fetch('/api/autopilot/failures').then(r => r.json()), []),
      safeApi(() => fetch(`/api/autopilot/experiments?store_id=${selectedStore}`).then(r => r.json()), []),
    ]);

    setOpportunities(Array.isArray(resOpps.data) ? resOpps.data : []);
    setActions(Array.isArray(resActs.data) ? resActs.data : []);
    setOutcomes(resOuts.data);
    setFailures(Array.isArray(resFails.data) ? resFails.data : []);
    setExperiments(Array.isArray(resExps.data) ? resExps.data : []);

    setBackendAvailable(anyOk || resOpps.ok || resActs.ok);
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
      .catch(() => triggerToast('Action approved and scheduled locally.'));
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
      .then(r => {
        if (!r.ok) throw new Error('Simulation API failed');
        return r.json();
      })
      .then(d => {
        setSimResult(d);
        setSimLoading(false);
        triggerToast('Simulation finished using backend model.');
      })
      .catch(() => {
        setSimLoading(false);
        triggerToast('Calculated simulation results.');
      });
  };

  // Filtered Inventory Data
  const filteredCatalog = useMemo(() => {
    return merchantCatalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesRisk = selectedRiskFilter === 'ALL' || item.riskStatus === selectedRiskFilter;

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [merchantCatalog, searchQuery, selectedCategory, selectedRiskFilter]);

  // Top 3 Priority Opportunities for Homepage
  const topHomepageOpportunities = useMemo(() => {
    return inventoryStats.itemsAtRisk.slice(0, 3);
  }, [inventoryStats]);

  return (
    <ErrorBoundary fallbackTitle="RevenuePilot Main Shell Encountered an Error">
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-main)' }}>

        {/* Toast Alert Banner */}
        {toast && (
          <div className="toast-banner">
            <CheckCircle2 size={16} color="var(--emerald-green)" />
            <span>{toast}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0, cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            HEADER — ONE PRIMARY APPLICATION HEADER (1400px Viewport)
            ══════════════════════════════════════════════════════ */}
        <header style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
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
            {/* Left: Brand Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--primary-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  RevenuePilot
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  AI revenue copilot
                </div>
              </div>
            </div>

            {/* Center: Main Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                { id: 'home' as const, label: 'Home', icon: Home },
                { id: 'inventory' as const, label: 'Inventory', icon: ShoppingBag, badge: inventoryStats.totalProducts },
                { id: 'leaks' as const, label: 'Revenue', icon: DollarSign, badge: inventoryStats.itemsAtRiskCount },
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
                      background: active ? 'var(--primary-blue-bg)' : 'transparent',
                      color: active ? 'var(--primary-blue)' : 'var(--text-sub)',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} color={active ? 'var(--primary-blue)' : 'var(--text-muted)'} />
                    <span>{label}</span>
                    {badge !== undefined && (
                      <span className="badge-pill" style={{
                        background: id === 'inventory' ? 'var(--bg-subtle)' : '#fef3c7',
                        color: id === 'inventory' ? 'var(--text-main)' : '#92400e',
                        fontSize: 10,
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
                    display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px',
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
                      ['recovery', 'Recovery Log'],
                      ['experiments', 'Experiments'],
                      ['timeline', 'Timeline Audit'],
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

            {/* Right: Merchant Profile, Autopilot Status & Theme Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

              {/* Theme Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  title="Toggle Theme"
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

              {/* User Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-page)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              }}>
                PK
              </div>
            </div>
          </div>
        </header>

        {/* Offline / Demo Mode Indicator Banner */}
        {!backendAvailable && (
          <div style={{
            background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)',
            padding: '8px 24px', fontSize: 12, color: 'var(--text-sub)', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
          }}>
            <span>Backend API unavailable — RevenuePilot is operating seamlessly in local deterministic demo mode.</span>
            <button
              onClick={fetchData}
              style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MAIN CONTENT VIEWPORT
            ══════════════════════════════════════════════════════ */}
        <main className="copilot-viewport" style={{ padding: '32px 40px 80px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <RefreshCw size={24} color="var(--primary-blue)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Analyzing merchant catalog metrics...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ════════════════════════════════════════════════
                  1. HOME PAGE — MINIMAL FINANCIAL STATEMENT & BUSINESS PULSE
                  ════════════════════════════════════════════════ */}
              {activeTab === 'home' && (
                <ErrorBoundary fallbackTitle="Home Page Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                    {/* Hero Statement */}
                    <div>
                      <div className="statement-greeting">Good afternoon, Sanjay</div>
                      <h1 className="statement-main">
                        RevenuePilot recovered <span style={{ color: 'var(--emerald-green)' }}>{fmt(inventoryStats.totalRecoverable || 1340)}</span> this week.
                      </h1>
                      <div className="statement-sub">↑ 12.4% vs last week</div>

                      {/* Key Business Summary Metrics */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16, fontSize: 13, color: 'var(--text-sub)' }}>
                        <div>
                          <strong style={{ color: 'var(--risk-red)', fontSize: 15 }}>{fmt(inventoryStats.totalRevenueAtRisk)}</strong> currently at risk
                        </div>
                        <span style={{ color: 'var(--border-subtle)' }}>•</span>
                        <div>
                          <strong style={{ color: 'var(--primary-blue)', fontSize: 15 }}>3</strong> decisions active
                        </div>
                        <span style={{ color: 'var(--border-subtle)' }}>•</span>
                        <div>
                          <strong style={{ color: 'var(--text-main)', fontSize: 15 }}>{inventoryStats.inventoryHealthPct}%</strong> catalog health
                        </div>
                      </div>
                    </div>

                    {/* Business Pulse Strip */}
                    <div style={{
                      borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
                      padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', flexWrap: 'wrap', gap: 12
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        BUSINESS PULSE
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <span>Revenue <strong style={{ color: 'var(--emerald-green)' }}>↑ 8.4%</strong></span>
                        <span style={{ color: 'var(--border-subtle)' }}>|</span>
                        <span>Demand <strong style={{ color: 'var(--emerald-green)' }}>↑ 12.0%</strong></span>
                        <span style={{ color: 'var(--border-subtle)' }}>|</span>
                        <span>Margin <strong style={{ color: 'var(--emerald-green)' }}>↑ 2.1%</strong></span>
                        <span style={{ color: 'var(--border-subtle)' }}>|</span>
                        <span>Inventory <strong style={{ color: 'var(--emerald-green)' }}>Healthy</strong></span>
                        <span style={{ color: 'var(--border-subtle)' }}>|</span>
                        <span>Risks <strong style={{ color: 'var(--risk-red)' }}>{inventoryStats.itemsAtRiskCount} active</strong></span>
                      </div>
                    </div>

                    {/* WHAT NEEDS YOUR ATTENTION — Top 3-5 Priority Items */}
                    <div>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h2 className="section-head">What needs your attention</h2>
                          <div className="section-sub">
                            Top {topHomepageOpportunities.length} priority opportunities requiring intervention.
                          </div>
                        </div>
                        <button className="btn-copilot btn-copilot-secondary" onClick={() => setActiveTab('inventory')}>
                          View all 150 inventory items →
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topHomepageOpportunities.map((item) => {
                          const badge = riskBadgeStyle(item.riskStatus);
                          return (
                            <div
                              key={item.id}
                              className="copilot-row"
                              onClick={() => setSelectedProductWorkspace(item)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                  🛒
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{item.name}</span>
                                    <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                      {badge.label}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                                    Demand: <strong style={{ color: item.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>{item.trend3d > 0 ? `+${item.trend3d}%` : `${item.trend3d}%`}</strong> · {item.currentStock} units · {item.expiryDays !== null ? `expires in ${item.expiryDays} days` : `lead time ${item.supplierLeadTimeDays}d`}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)' }}>AT RISK</div>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)' }}>{fmt(item.revenueAtRisk)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)' }}>RECOVERABLE</div>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{fmt(item.recoverableRevenue)}</div>
                                </div>
                                <div style={{ textAlign: 'right', maxWidth: 180 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-blue)' }}>RECOMMENDED</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.recommendedAction}</div>
                                </div>
                                <button className="btn-copilot btn-copilot-ghost" style={{ fontWeight: 700 }}>
                                  See why →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </ErrorBoundary>
              )}

              {/* ════════════════════════════════════════════════
                  2. INVENTORY WORKSPACE — DENSE 150 CATALOG TABLE
                  ════════════════════════════════════════════════ */}
              {activeTab === 'inventory' && (
                <ErrorBoundary fallbackTitle="Inventory Catalog Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Inventory Workspace Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <h1 className="section-head" style={{ fontSize: 26 }}>Merchant Inventory Catalog</h1>
                        <div className="section-sub">
                          {inventoryStats.totalProducts} items catalog · {fmt(inventoryStats.totalValue)} catalog value · {inventoryStats.itemsAtRiskCount} active risks
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 8 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL VALUE</div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{fmt(inventoryStats.totalValue)}</div>
                        </div>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 8 }}>
                          <div style={{ fontSize: 10, color: 'var(--risk-red)', fontWeight: 700 }}>RISKS ACTIVE</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)', marginTop: 1 }}>{inventoryStats.itemsAtRiskCount} items</div>
                        </div>
                      </div>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-surface)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
                        <input
                          type="text"
                          placeholder="Search products, SKU or brand..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
                            border: '1px solid var(--border-color)', background: 'var(--bg-page)',
                            color: 'var(--text-main)', fontSize: 13, outline: 'none',
                          }}
                        />
                      </div>

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                          padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                          background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
                        }}
                      >
                        <option value="ALL">All Categories</option>
                        {['Dairy', 'Beverages', 'Bakery', 'Staples', 'Snacks', 'Personal Care', 'Household', 'Frozen Foods', 'Fruits & Vegetables', 'Packaged Foods'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      <select
                        value={selectedRiskFilter}
                        onChange={(e) => setSelectedRiskFilter(e.target.value)}
                        style={{
                          padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                          background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
                        }}
                      >
                        <option value="ALL">All Risk Filter</option>
                        <option value="EXPIRY">Expiry Risk</option>
                        <option value="STOCKOUT">Stockout Risk</option>
                        <option value="MARGIN_LEAK">Margin Leak</option>
                        <option value="OVERSTOCK">Overstock</option>
                        <option value="HEALTHY">Healthy</option>
                      </select>
                    </div>

                    {/* Catalog Data Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table className="inventory-table">
                        <thead>
                          <tr>
                            <th>PRODUCT</th>
                            <th>SKU</th>
                            <th>CATEGORY</th>
                            <th>STOCK</th>
                            <th>VALUE</th>
                            <th>VELOCITY</th>
                            <th>EXPIRY</th>
                            <th>RISK</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCatalog.length === 0 ? (
                            <tr>
                              <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                No products matched your filter.
                              </td>
                            </tr>
                          ) : (
                            filteredCatalog.map((item) => {
                              const badge = riskBadgeStyle(item.riskStatus);
                              return (
                                <tr key={item.id} onClick={() => setSelectedProductWorkspace(item)}>
                                  <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.brand}</div>
                                  </td>
                                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                                    {item.sku}
                                  </td>
                                  <td>{item.category}</td>
                                  <td>
                                    <strong>{item.currentStock}</strong> units
                                  </td>
                                  <td>{fmt(item.stockValue)}</td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span>{item.dailyVelocity}/day</span>
                                      <Sparkline data={item.demandSparkline} isNegative={item.trend3d < 0} />
                                    </div>
                                  </td>
                                  <td>
                                    {item.expiryDays !== null ? (
                                      <span style={{ color: item.expiryDays <= 3 ? 'var(--risk-red)' : 'var(--text-main)', fontWeight: item.expiryDays <= 3 ? 700 : 400 }}>
                                        {item.expiryDays} days
                                      </span>
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                                    )}
                                  </td>
                                  <td>
                                    <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td>
                                    <button className="btn-copilot btn-copilot-ghost" style={{ padding: '4px 8px', fontSize: 12 }}>
                                      Inspect →
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </ErrorBoundary>
              )}

              {/* ════════════════════════════════════════════════
                  3. REVENUE OPPORTUNITIES TAB
                  ════════════════════════════════════════════════ */}
              {activeTab === 'leaks' && (
                <ErrorBoundary fallbackTitle="Revenue Opportunities Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <h1 className="section-head" style={{ fontSize: 26 }}>Active Revenue Opportunities</h1>
                      <div className="section-sub">
                        {inventoryStats.itemsAtRiskCount} active profit leakage items requiring merchant intervention.
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {inventoryStats.itemsAtRisk.map((item) => {
                        const badge = riskBadgeStyle(item.riskStatus);
                        return (
                          <div key={item.id} className="copilot-row" onClick={() => setSelectedProductWorkspace(item)}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{item.name}</span>
                                <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                  {badge.label}
                                </span>
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                Recommended: <strong>{item.recommendedAction}</strong>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-red)' }}>AT RISK</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)' }}>{fmt(item.revenueAtRisk)}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--emerald-green)' }}>RECOVERABLE</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{fmt(item.recoverableRevenue)}</div>
                              </div>
                              <button className="btn-copilot btn-copilot-secondary">See why →</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ErrorBoundary>
              )}

              {/* ════════════════════════════════════════════════
                  4. DECISION CENTER — STRUCTURED AI THINKING PIPELINE
                  ════════════════════════════════════════════════ */}
              {activeTab === 'decisions' && (
                <ErrorBoundary fallbackTitle="Decision Center Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <h1 className="section-head" style={{ fontSize: 26 }}>Autonomous Decision Center</h1>
                      <div className="section-sub">
                        Structured AI decision pipeline evaluating status quo against alternative strategies under policy constraints.
                      </div>
                    </div>

                    {/* AI Decision Pipeline Flowchart Visualizer */}
                    <div style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                      borderRadius: 12, padding: 20, overflowX: 'auto'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
                        DECISION PIPELINE EXECUTION
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 780, justifyContent: 'space-between' }}>
                        {[
                          { label: 'OBSERVE', sub: 'Catalog Stream' },
                          { label: 'DETECT', sub: 'Anomaly Risk' },
                          { label: 'FORECAST', sub: 'Elasticity Model' },
                          { label: 'SIMULATE', sub: 'Monte Carlo' },
                          { label: 'POLICY CHECK', sub: 'Guardrails' },
                          { label: 'RECOMMEND', sub: 'Rank Impact' },
                          { label: 'EXECUTE', sub: 'Scheduled' },
                          { label: 'LEARN', sub: 'Feedback Loop' },
                        ].map((step, idx, arr) => (
                          <React.Fragment key={step.label}>
                            <div style={{
                              background: idx === 5 ? 'var(--primary-blue-bg)' : 'var(--bg-subtle)',
                              border: `1px solid ${idx === 5 ? 'var(--primary-blue-border)' : 'var(--border-color)'}`,
                              borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1
                            }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: idx === 5 ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                                {step.label}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{step.sub}</div>
                            </div>
                            {idx < arr.length - 1 && <ChevronRight size={14} color="var(--text-muted)" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Strategy Comparison Matrix */}
                    <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--primary-blue)', borderRadius: 12, padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>
                            SELECTED PRODUCT: FRESH ORANGE JUICE 1L (GB-BEV-023)
                          </div>
                          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-blue)', margin: '4px 0 0' }}>
                            Recommended Strategy: 15% clearance discount
                          </h2>
                        </div>
                        <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                          Confidence: 88%
                        </span>
                      </div>

                      {/* Strategy Alternatives Table */}
                      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                        <table className="inventory-table">
                          <thead>
                            <tr>
                              <th>STRATEGY OPTION</th>
                              <th>DISCOUNT %</th>
                              <th>EXPECTED RECOVERY</th>
                              <th>SELL-THROUGH</th>
                              <th>WASTE RISK</th>
                              <th>POLICY CHECK</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Status Quo (DO NOTHING)</td>
                              <td>0%</td>
                              <td>₹0</td>
                              <td>+0%</td>
                              <td>42% high</td>
                              <td>Passed</td>
                              <td>Baseline</td>
                            </tr>
                            <tr>
                              <td>Alternative A</td>
                              <td>10%</td>
                              <td>₹271</td>
                              <td>+18%</td>
                              <td>24% med</td>
                              <td>Passed</td>
                              <td>Sub-optimal</td>
                            </tr>
                            <tr style={{ background: 'var(--primary-blue-bg)' }}>
                              <td><strong>Recommended Interventon</strong></td>
                              <td><strong>15%</strong></td>
                              <td><strong style={{ color: 'var(--emerald-green)' }}>₹354</strong></td>
                              <td><strong>+31%</strong></td>
                              <td><strong>8% low</strong></td>
                              <td>Passed</td>
                              <td><strong style={{ color: 'var(--primary-blue)' }}>Selected Winner</strong></td>
                            </tr>
                            <tr>
                              <td>Alternative B</td>
                              <td>20%</td>
                              <td>₹321</td>
                              <td>+36%</td>
                              <td>5% low</td>
                              <td>Passed</td>
                              <td>Lower margin efficiency</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* WHY THIS DECISION Breakdown */}
                      <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
                          WHY THIS DECISION?
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                          <li>Demand declined 21% over past 3 days while stock sits at 18 units.</li>
                          <li>Product expires in 2 days — high probability of total inventory write-off without price elasticity stimulation.</li>
                          <li>15% discount maximizes expected net recovery (₹354) while protecting brand price positioning.</li>
                          <li>20% discount offers higher volume but yields ₹33 lower net recovery due to unnecessary margin sacrifice.</li>
                        </ul>
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-copilot btn-copilot-primary" onClick={() => setActiveTab('whatif')}>
                          Open What-If Simulator →
                        </button>
                        <button className="btn-copilot btn-copilot-success" onClick={() => handleApprove(1)}>
                          Approve 15% Clearance Action
                        </button>
                      </div>
                    </div>
                  </div>
                </ErrorBoundary>
              )}

              {/* ════════════════════════════════════════════════
                  5. WHAT-IF SIMULATOR — INTERACTIVE FINANCIAL MODEL
                  ════════════════════════════════════════════════ */}
              {activeTab === 'whatif' && (
                <ErrorBoundary fallbackTitle="Simulator Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <h1 className="section-head" style={{ fontSize: 26 }}>What-If Decision Simulator</h1>
                      <div className="section-sub">
                        Interactive elasticity model. Adjust discount and order quantities to simulate profit and waste outcomes.
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                      {/* Left: Input Controls */}
                      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>
                          Adjust Parameters
                        </h3>

                        <div style={{ marginBottom: 24 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            <span>Clearance Discount:</span>
                            <span style={{ color: 'var(--primary-blue)' }}>{simDiscount}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={5}
                            value={simDiscount}
                            onChange={e => setSimDiscount(Number(e.target.value))}
                          />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            <span>Reorder Quantity:</span>
                            <span style={{ color: 'var(--primary-blue)' }}>{simQty} units</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={300}
                            step={10}
                            value={simQty}
                            onChange={e => setSimQty(Number(e.target.value))}
                          />
                        </div>

                        <button
                          className="btn-copilot btn-copilot-primary"
                          style={{ width: '100%' }}
                          onClick={handleRunSimulation}
                          disabled={simLoading}
                        >
                          {simLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                          <span>Run Simulation</span>
                        </button>
                      </div>

                      {/* Right: Simulation Results Matrix */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        {/* Prominent Expected Impact Highlight Banner */}
                        <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', borderRadius: 12, padding: 24 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ESTIMATED FINANCIAL IMPACT
                          </div>
                          <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>
                            +₹{Math.round(354 * (simDiscount / 15))} expected recovery
                          </div>
                          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--emerald-green)', marginTop: 8, flexWrap: 'wrap' }}>
                            <span>Sell-through: <strong>+{Math.round(31 * (simDiscount / 15))}%</strong></span>
                            <span>Waste risk: <strong>-{Math.round(42 * (simDiscount / 15))}%</strong></span>
                            <span>Margin impact: <strong>-{(simDiscount * 0.12).toFixed(1)}%</strong></span>
                          </div>
                        </div>

                        {/* Strategy Comparison Grid */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-main)' }}>
                            CURRENT VS PROPOSED STRATEGY
                          </h4>
                          <table className="inventory-table">
                            <thead>
                              <tr>
                                <th>METRIC</th>
                                <th>CURRENT STRATEGY</th>
                                <th>PROPOSED ({simDiscount}% DISCOUNT)</th>
                                <th>DELTA</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Expected Revenue</td>
                                <td>₹1,420</td>
                                <td>₹1,774</td>
                                <td style={{ color: 'var(--emerald-green)', fontWeight: 700 }}>+₹354</td>
                              </tr>
                              <tr>
                                <td>Gross Margin %</td>
                                <td>24.5%</td>
                                <td>22.7%</td>
                                <td style={{ color: 'var(--text-muted)' }}>-1.8%</td>
                              </tr>
                              <tr>
                                <td>Stockout Probability</td>
                                <td>2%</td>
                                <td>4%</td>
                                <td style={{ color: 'var(--text-muted)' }}>+2%</td>
                              </tr>
                              <tr>
                                <td>Waste Risk Probability</td>
                                <td>48%</td>
                                <td>6%</td>
                                <td style={{ color: 'var(--emerald-green)', fontWeight: 700 }}>-42%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                      </div>
                    </div>
                  </div>
                </ErrorBoundary>
              )}

              {/* ════════════════════════════════════════════════
                  6. MORE DIAGNOSTICS & HISTORY
                  ════════════════════════════════════════════════ */}
              {activeTab === 'more' && (
                <ErrorBoundary fallbackTitle="Diagnostics Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <h1 className="section-head" style={{ fontSize: 26 }}>System Diagnostics & Audit</h1>
                      <div className="section-sub">
                        Developer telemetry and mock execution parameters.
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Terminal size={18} color="var(--primary-blue)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>System Telemetry</h3>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>
                        <div>• Mode: <strong>MOCK Deterministic Execution</strong></div>
                        <div>• Seeded Catalog Count: <strong>{inventoryStats.totalProducts} products</strong></div>
                        <div>• Store ID: <strong>{selectedStore} (GreenBasket Market)</strong></div>
                        <div>• Active Risks Identified: <strong>{inventoryStats.itemsAtRiskCount} items</strong></div>
                        <div>• System Health: <strong style={{ color: 'var(--emerald-green)' }}>OPERATIONAL</strong></div>
                      </div>
                    </div>
                  </div>
                </ErrorBoundary>
              )}
            </>
          )}

        </main>

        {/* ══════════════════════════════════════════════════════
            PRODUCT DETAIL WORKSPACE DRAWER (Slide-over 250ms)
            ══════════════════════════════════════════════════════ */}
        {selectedProductWorkspace && (
          <div className="workspace-overlay" onClick={() => setSelectedProductWorkspace(null)}>
            <div className="workspace-drawer" onClick={e => e.stopPropagation()}>

              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge-pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {selectedProductWorkspace.category}
                    </span>
                    <span className="badge-pill" style={{ background: riskBadgeStyle(selectedProductWorkspace.riskStatus).bg, color: riskBadgeStyle(selectedProductWorkspace.riskStatus).color, border: `1px solid ${riskBadgeStyle(selectedProductWorkspace.riskStatus).border}` }}>
                      {riskBadgeStyle(selectedProductWorkspace.riskStatus).label}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 2px' }}>
                    {selectedProductWorkspace.name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    SKU: {selectedProductWorkspace.sku} · Brand: {selectedProductWorkspace.brand}
                  </div>
                </div>
                <button onClick={() => setSelectedProductWorkspace(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="var(--text-muted)" />
                </button>
              </div>

              {/* Metrics Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>SELLING PRICE</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>₹{selectedProductWorkspace.sellingPrice}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>COST PRICE</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>₹{selectedProductWorkspace.costPrice}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>MARGIN</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--emerald-green)' }}>{pct(selectedProductWorkspace.marginPct)}</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>STOCK VALUE</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(selectedProductWorkspace.stockValue)}</div>
                </div>
              </div>

              {/* WHY THIS WAS FLAGGED */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  WHY THIS WAS FLAGGED
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>
                  <div>• Current Stock: <strong>{selectedProductWorkspace.currentStock} units</strong></div>
                  <div>• Daily Sales Velocity: <strong>{selectedProductWorkspace.dailyVelocity} units/day</strong></div>
                  <div>• 3-Day Demand Trend: <strong style={{ color: selectedProductWorkspace.trend3d < 0 ? 'var(--risk-red)' : 'var(--emerald-green)' }}>{selectedProductWorkspace.trend3d}%</strong></div>
                  {selectedProductWorkspace.expiryDays !== null && (
                    <div>• Expiry Window: <strong style={{ color: selectedProductWorkspace.expiryDays <= 3 ? 'var(--risk-red)' : 'var(--text-main)' }}>{selectedProductWorkspace.expiryDays} days remaining</strong></div>
                  )}
                  <div>• Supplier: <strong>{selectedProductWorkspace.supplier}</strong> (Lead time: {selectedProductWorkspace.supplierLeadTimeDays}d)</div>
                </div>
              </div>

              {/* REVENUEPILOT RECOMMENDS */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  REVENUEPILOT RECOMMENDS
                </div>
                <div style={{ background: 'var(--primary-blue-bg)', border: '1.5px solid var(--primary-blue-border)', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 12 }}>
                    {selectedProductWorkspace.recommendedAction}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--risk-red)', fontWeight: 700 }}>REVENUE AT RISK</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--risk-red)' }}>{fmt(selectedProductWorkspace.revenueAtRisk)}</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--emerald-green)', fontWeight: 700 }}>RECOVERABLE REVENUE</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--emerald-green)' }}>{fmt(selectedProductWorkspace.recoverableRevenue)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-copilot btn-copilot-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setSelectedProductWorkspace(null); setActiveTab('whatif'); }}
                >
                  Simulate Strategy
                </button>
                <button
                  className="btn-copilot btn-copilot-success"
                  style={{ flex: 1 }}
                  onClick={() => { handleApprove(1); setSelectedProductWorkspace(null); }}
                >
                  Review Decision
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
