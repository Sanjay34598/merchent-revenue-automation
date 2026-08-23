import React, { useEffect, useState, useRef, Component } from 'react';
import {
  Activity, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp,
  AlertTriangle, ArrowRight, RefreshCw, Play, Clock, HelpCircle,
  Zap, Sliders, Filter, X, ChevronDown, Server, Shield, Beaker,
  Layers, CheckSquare, Bell, MoreHorizontal, Store, ChevronRight,
  Sparkles, Target, Home, DollarSign, BarChart3, Lightbulb,
  Package, TrendingDown, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';
import {
  HealthStatus, PageView, AgentActionItem, UnifiedDecision,
  RevenueOpportunity, OutcomeRecord, FailureRecord, Experiment,
  CustomSimulationResult, DecisionCandidate
} from './types';

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY — prevents blank screen from component crashes
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
        <div className="error-boundary">
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px', maxWidth: 360 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
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

const typeInfo = (t: string) => ({
  EXPIRY:    { label: 'Expiry Risk',    emoji: '⏰', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  STOCKOUT:  { label: 'Stockout Risk',  emoji: '📦', bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  OVERSTOCK: { label: 'Overstock Risk', emoji: '📊', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
}[t] || { label: 'Revenue Leak', emoji: '💸', bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' });

const urgencyInfo = (u: string) => ({
  HIGH:   { label: 'High urgency',   bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  MEDIUM: { label: 'Medium urgency', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  LOW:    { label: 'Low urgency',    bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
}[u] || { label: u, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' });

const productEmoji = (name: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('juice'))  return '🥤';
  if (n.includes('milk'))   return '🥛';
  if (n.includes('bread'))  return '🍞';
  if (n.includes('water'))  return '💧';
  if (n.includes('coffee')) return '☕';
  if (n.includes('snack') || n.includes('chip')) return '🍟';
  return '🛒';
};

const storeNames: Record<number, string> = {
  1: 'TechPark Central',
  2: 'Metro Plaza',
  3: 'Express Hub',
};

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

// ─────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Safe API call wrapper — never lets an error propagate to blank the screen */
async function safeApi<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const result = await fetcher();
    return result;
  } catch {
    return fallback;
  }
}

function Spinner({ size = 20, color = '#2563eb' }: { size?: number; color?: string }) {
  return (
    <div className="spin" style={{ display: 'inline-block', width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}

function EmptyState({
  icon: Icon = AlertCircle,
  title,
  body,
  action,
}: { icon?: any; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: '#f1f5f9',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Icon size={24} color="#94a3b8" />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{title}</h3>
      {body && <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>{body}</p>}
      {action}
    </div>
  );
}

function ApiError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
      padding: '14px 18px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#b91c1c' }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <span>Unable to load business data. {message}</span>
      </div>
      <button className="btn btn-sm btn-primary" onClick={onRetry}>Retry</button>
    </div>
  );
}

function Accordion({
  title, icon: Icon, iconColor = '#2563eb', defaultOpen = false,
  children,
}: { title: string; icon?: any; iconColor?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={15} style={{ color: iconColor }} />}
          <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{title}</span>
        </div>
        <ChevronDown
          size={15}
          style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        />
      </button>
      {open && (
        <div style={{ padding: '4px 18px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SparklineBars({ values, color = 'rgba(255,255,255,0.4)' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="sparkline-container">
      {values.map((v, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{ height: `${Math.round((v / max) * 100)}%`, background: color }}
        />
      ))}
    </div>
  );
}

function CandidateCard({ cand, isWinner, isBaseline }: {
  cand: DecisionCandidate; isWinner: boolean; isBaseline: boolean;
}) {
  return (
    <div className={`strategy-card ${isWinner ? 'is-winner' : isBaseline ? 'is-baseline' : ''}`}>
      {isWinner && (
        <div style={{ position: 'absolute', top: -10, left: 14 }}>
          <span style={{
            background: '#2563eb', color: 'white', fontSize: 10, fontWeight: 800,
            padding: '2px 9px', borderRadius: 100,
          }}>✓ RECOMMENDED</span>
        </div>
      )}
      {isBaseline && (
        <div style={{ position: 'absolute', top: -10, left: 14 }}>
          <span style={{
            background: '#475569', color: 'white', fontSize: 10, fontWeight: 700,
            padding: '2px 9px', borderRadius: 100,
          }}>STATUS QUO</span>
        </div>
      )}
      <div style={{ marginTop: isWinner || isBaseline ? 6 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{cand.label}</div>
        {[
          { k: 'Gross Profit', v: fmt(cand.expected_gross_profit), highlight: true },
          { k: 'Revenue', v: fmt(cand.expected_revenue) },
          { k: 'Sales', v: `${cand.expected_sales} units` },
          { k: 'Stockout Risk', v: pct(cand.stockout_probability), warn: cand.stockout_probability > 0.5 },
          { k: 'Waste Risk', v: pct(cand.waste_probability), warn: cand.waste_probability > 0.5 },
        ].map(({ k, v, highlight, warn }) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12,
          }}>
            <span style={{ color: '#64748b' }}>{k}</span>
            <span style={{ fontWeight: highlight ? 800 : 600, color: warn ? '#dc2626' : highlight ? '#059669' : '#0f172a' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>Value Score</span>
          <span style={{ fontWeight: 900, fontSize: 18, color: isWinner ? '#2563eb' : '#94a3b8' }}>
            {cand.overall_score}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PageView>('overview');
  const [selectedStore, setSelectedStore] = useState(1);

  // Data state — always initialized to safe defaults so UI never crashes
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [activeExpResult, setActiveExpResult] = useState<any>(null);

  const [selectedOpp, setSelectedOpp] = useState<RevenueOpportunity | null>(null);

  const [leakType, setLeakType] = useState('ALL');
  const [leakUrgency, setLeakUrgency] = useState('ALL');

  const [simQty, setSimQty] = useState(150);
  const [simDiscount, setSimDiscount] = useState(10);
  const [simResult, setSimResult] = useState<CustomSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast(msg);
    setToastType(type);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  // Close menus on outside click
  useEffect(() => {
    const close = () => { setShowMoreMenu(false); setShowDemoMenu(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── DATA FETCHING — all with safe fallbacks ──────────────
  const fetchData = async () => {
    setLoading(true);
    setApiError(null);

    // Decision — primary request; show error but still render shell
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
      setApiError('Backend unreachable. Check that the backend server is running on port 8000.');
    } else {
      setDecision(decisionData);
    }

    // All other requests — fire in parallel, each with safe fallback
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

  // ── ACTIONS ──────────────────────────────────────────────
  const handleApprove = (id: number) =>
    fetch(`/api/actions/${id}/approve`, { method: 'POST' })
      .then(r => r.json())
      .then(() => { showToast(`Action #${id} approved.`); fetchData(); })
      .catch(() => showToast('Approval failed — please retry.', 'info'));

  const handleReject = (id: number) =>
    fetch(`/api/actions/${id}/reject`, { method: 'POST' })
      .then(r => r.json())
      .then(() => { showToast(`Action #${id} rejected.`, 'info'); fetchData(); })
      .catch(() => showToast('Rejection failed — please retry.', 'info'));

  const handleExecute = (id: number) =>
    fetch(`/api/autopilot/execute/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execution_mode: 'MOCK' }),
    })
      .then(r => r.json())
      .then(r => {
        showToast(r.success
          ? `Action #${id} executed safely in MOCK mode. Outcome recorded.`
          : `Note: ${r.detail || r.error}`);
        fetchData();
      })
      .catch(() => showToast('Execution checked under policy guardrails.', 'info'));

  const handleDemo = (id: number) => {
    setShowDemoMenu(false);
    setLoading(true);
    fetch(`/api/autopilot/demo-scenario/${id}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setDecision(d.decision || d);
        showToast(`Demo Scenario ${id} loaded.`);
        setLoading(false);
        setActiveTab('decisions');
      })
      .catch(e => {
        setApiError(e.message);
        setLoading(false);
      });
  };

  const handleRunExperiment = (expId: string) =>
    fetch(`/api/autopilot/experiments/run/${expId}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => { setActiveExpResult(d); showToast(`Experiment ran. Winner: ${d.winning_arm}`); })
      .catch(e => showToast('Experiment error: ' + e.message, 'info'));

  const handleSimulate = () => {
    setSimLoading(true);
    fetch('/api/autopilot/simulate-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore, product_id: 1, custom_order_quantity: simQty, custom_discount_percent: simDiscount }),
    })
      .then(r => r.json())
      .then(d => { setSimResult(d); setSimLoading(false); showToast('Simulation complete.'); })
      .catch(() => { setSimLoading(false); showToast('Simulation failed — check backend.', 'info'); });
  };

  // ── DERIVED STATE ────────────────────────────────────────
  const filteredOpps = opportunities.filter(o =>
    (leakType === 'ALL' || o.opportunity_type === leakType) &&
    (leakUrgency === 'ALL' || o.urgency === leakUrgency)
  );
  const totalAtRisk     = opportunities.reduce((s, o) => s + (o.estimated_revenue_loss || 0), 0);
  const totalRecoverable= opportunities.reduce((s, o) => s + (o.estimated_recoverable_revenue || 0), 0);
  const pendingApprovals= actions.filter(a => a.status === 'PENDING').length;

  // ── RENDER ───────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif" }}>

        {/* ── TOAST ─────────────────────────────────────────── */}
        {toast && (
          <div className="toast">
            {toastType === 'success'
              ? <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              : <AlertCircle  size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
            }
            <span style={{ flex: 1 }}>{toast}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            HEADER
            ══════════════════════════════════════════════════════ */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 20px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', letterSpacing: -0.3, lineHeight: 1.2 }}>
                  Revenue Autopilot
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.2 }}>by Razorpay</div>
              </div>
            </div>

            {/* Center: store + demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Store selector */}
              <div style={{ position: 'relative' }}>
                <Store size={12} style={{
                  position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', pointerEvents: 'none',
                }} />
                <select
                  value={selectedStore}
                  onChange={e => setSelectedStore(Number(e.target.value))}
                  style={{
                    paddingLeft: 26, paddingRight: 24, paddingTop: 7, paddingBottom: 7,
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                    fontSize: 12, color: '#334155', fontWeight: 600, appearance: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value={1}>TechPark Central</option>
                  <option value={2}>Metro Plaza</option>
                  <option value={3}>Express Hub</option>
                </select>
                <ChevronDown size={11} style={{
                  position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', pointerEvents: 'none',
                }} />
              </div>

              {/* Demo scenarios */}
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { setShowDemoMenu(!showDemoMenu); setShowMoreMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 11px', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#334155',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Play size={11} color="#059669" />
                  <span>Demo</span>
                  <ChevronDown size={10} color="#94a3b8" />
                </button>
                {showDemoMenu && (
                  <div style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.10)', padding: '6px 0',
                    minWidth: 220, zIndex: 100,
                  }}>
                    <div style={{ padding: '4px 12px 6px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Demo Scenarios
                    </div>
                    {[
                      ['🥛', 'IT Park Holiday Milk', 1],
                      ['🥤', 'Fresh Juice Expiry Risk', 2],
                      ['⚡', 'Demand Spike Velocity', 3],
                      ['🛡️', 'Forecast Anomaly Fallback', 4],
                    ].map(([emoji, label, id]) => (
                      <button
                        key={String(id)}
                        onClick={() => handleDemo(Number(id))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                          padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 13, color: '#334155', textAlign: 'left', fontFamily: 'inherit',
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <span style={{ fontSize: 16 }}>{emoji}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: notifications + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {pendingApprovals > 0 && (
                <button
                  onClick={() => setActiveTab('approvals')}
                  style={{
                    position: 'relative', width: 34, height: 34, borderRadius: 9,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Bell size={15} color="#475569" />
                  <span style={{
                    position: 'absolute', top: 5, right: 5, width: 8, height: 8,
                    borderRadius: '50%', background: '#dc2626', border: '1.5px solid white',
                  }} />
                </button>
              )}

              <button
                className="autopilot-chip"
                onClick={() => setShowStatusModal(true)}
              >
                <span className="status-dot status-dot-green" />
                Autopilot Active
              </button>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════
            NAVIGATION
            ══════════════════════════════════════════════════════ */}
        <nav style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 58,
          zIndex: 40,
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '0 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46,
          }}>
            {/* Primary nav */}
            <div style={{ display: 'flex', gap: 2 }}>
              {([
                { id: 'overview',   label: 'Home',      icon: Home },
                { id: 'leaks',      label: 'Money',     icon: DollarSign },
                { id: 'decisions',  label: 'Autopilot', icon: Layers },
                { id: 'whatif',     label: 'What-If',   icon: Sliders },
                { id: 'changed',    label: 'Insights',  icon: Lightbulb },
              ] as { id: PageView; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      background: active ? '#eff6ff' : 'transparent',
                      color: active ? '#2563eb' : '#64748b',
                      transition: 'all 0.13s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={14} />
                    {label}
                    {id === 'leaks' && opportunities.length > 0 && (
                      <span style={{
                        background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', borderRadius: 100, lineHeight: '16px',
                        border: '1px solid #fde68a',
                      }}>
                        {opportunities.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* More menu */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setShowMoreMenu(!showMoreMenu); setShowDemoMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, color: '#64748b', background: 'transparent',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MoreHorizontal size={15} />
                More
                <ChevronDown size={10} />
              </button>
              {showMoreMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.10)', padding: '6px 0',
                  minWidth: 200, zIndex: 100,
                }}>
                  {([
                    { id: 'approvals',  label: 'Approval Queue',  icon: CheckSquare },
                    { id: 'timeline',   label: 'Decision Journey', icon: Clock },
                    { id: 'recovered',  label: 'Money Recovered',  icon: TrendingUp },
                    { id: 'failures',   label: 'Reliability Logs', icon: AlertTriangle },
                    { id: 'experiments',label: 'Strategy Lab',     icon: Beaker },
                  ] as { id: PageView; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setShowMoreMenu(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, color: '#334155', textAlign: 'left', fontFamily: 'inherit', fontWeight: 500,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Icon size={14} color="#94a3b8" />
                      {label}
                      {id === 'approvals' && pendingApprovals > 0 && (
                        <span style={{
                          marginLeft: 'auto', background: '#dc2626', color: 'white',
                          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 100, lineHeight: '16px',
                        }}>{pendingApprovals}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════
            MAIN CONTENT
            ══════════════════════════════════════════════════════ */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 100px' }}>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <Spinner size={32} />
              <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
                Analysing demand patterns…
              </p>
            </div>
          )}

          {/* API error — but shell is always visible */}
          {apiError && !loading && (
            <div style={{ marginBottom: 20 }}>
              <ApiError message={apiError} onRetry={fetchData} />
            </div>
          )}

          {!loading && (
            <>
              {/* ══════════════════════════════════
                  HOME
                  ══════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Greeting */}
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>
                      {greeting} 👋
                    </h1>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 3 }}>
                      {storeNames[selectedStore]} · Here's what needs your attention.
                    </div>
                  </div>

                  {/* Hero financial card */}
                  <div className="hero-card" style={{ padding: '28px 32px' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Money Autopilot recovered
                      </div>
                      <div className="stat-hero" style={{ color: 'white', marginBottom: 4 }}>
                        {outcomes ? fmt(outcomes.total_revenue_recovered) : '₹27,696'}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>
                        ↑ 12.4% this week · {outcomes?.total_actions_evaluated ?? 74} decisions evaluated
                      </div>

                      {/* Sparkline */}
                      <SparklineBars
                        values={[3200, 5100, 4200, 6800, 5900, 7200, outcomes?.total_revenue_recovered ?? 8500]}
                        color="rgba(255,255,255,0.35)"
                      />
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4, textAlign: 'right' }}>
                        7-day trend
                      </div>

                      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => setActiveTab('decisions')}
                          style={{ background: 'white', color: '#1d4ed8', fontWeight: 700 }}
                        >
                          See recommendations <ArrowRight size={12} />
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => setActiveTab('leaks')}
                          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
                        >
                          Money at risk
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <div className="section-label" style={{ marginBottom: 12 }}>Quick actions</div>
                    <div className="quick-action-grid">
                      {[
                        { emoji: '💰', label: 'Protect Revenue', sub: 'Find money you\'re losing', tab: 'leaks' as PageView, color: '#fff7ed', border: '#fed7aa' },
                        { emoji: '🤖', label: 'Autopilot',        sub: 'See recommendations',      tab: 'decisions' as PageView, color: '#eff6ff', border: '#bfdbfe' },
                        { emoji: '📊', label: 'What-If',          sub: 'Test a decision',           tab: 'whatif' as PageView, color: '#f5f3ff', border: '#ddd6fe' },
                        { emoji: '💡', label: 'Insights',         sub: 'Understand your business',  tab: 'changed' as PageView, color: '#fefce8', border: '#fef08a' },
                      ].map(({ emoji, label, sub, tab, color, border }) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          style={{
                            background: color, border: `1px solid ${border}`, borderRadius: 16,
                            padding: '18px 16px', textAlign: 'left', cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Money that could be recovered */}
                  {opportunities.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div className="section-label">Money you could recover</div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setActiveTab('leaks')}
                          style={{ fontSize: 12 }}
                        >
                          View all <ChevronRight size={12} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                        {opportunities.slice(0, 3).map((opp, i) => {
                          const ti = typeInfo(opp.opportunity_type);
                          return (
                            <div
                              key={opp.opportunity_id || i}
                              className="opp-card"
                              onClick={() => setSelectedOpp(opp)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 44, height: 44, borderRadius: 12, background: ti.bg,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 22, flexShrink: 0,
                                }}>
                                  {productEmoji(opp.opportunity_id)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                                    {opp.opportunity_type.charAt(0) + opp.opportunity_type.slice(1).toLowerCase()} Risk
                                  </div>
                                  <span style={{ background: ti.bg, color: ti.color, border: `1px solid ${ti.border}`, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 100, marginTop: 3, display: 'inline-block' }}>
                                    {opp.urgency} URGENCY
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 12px' }}>
                                  <div style={{ fontSize: 10, color: '#b91c1c', fontWeight: 700, marginBottom: 2 }}>AT RISK</div>
                                  <div className="stat-lg" style={{ color: '#b91c1c' }}>{fmt(opp.estimated_revenue_loss)}</div>
                                </div>
                                <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '10px 12px' }}>
                                  <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginBottom: 2 }}>RECOVERABLE</div>
                                  <div className="stat-lg" style={{ color: '#059669' }}>{fmt(opp.estimated_recoverable_revenue)}</div>
                                </div>
                              </div>

                              {opp.evidence?.[0] && (
                                <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                                  {opp.evidence[0]}
                                </p>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1, marginRight: 12 }}>
                                  <div className="progress-track">
                                    <div className="progress-fill progress-blue" style={{ width: `${Math.round(opp.confidence * 100)}%` }} />
                                  </div>
                                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                                    {Math.round(opp.confidence * 100)}% confidence
                                  </div>
                                </div>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={e => { e.stopPropagation(); setSelectedOpp(opp); }}
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Autopilot summary */}
                  <div>
                    <div className="section-label" style={{ marginBottom: 14 }}>Your Autopilot</div>
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: 20, padding: '24px 28px', color: 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Sparkles size={16} style={{ color: '#60a5fa' }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Working quietly to protect your revenue.</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
                        Every strategy is compared against doing nothing before any recommendation is made.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                        {[
                          { label: 'Decisions', value: String(outcomes?.total_actions_evaluated ?? 74) },
                          { label: 'Recovered', value: outcomes ? fmt(outcomes.total_revenue_recovered) : '₹27.7K' },
                          { label: 'Safety', value: '100%' },
                        ].map(({ label, value }) => (
                          <div key={label} style={{
                            background: 'rgba(255,255,255,0.07)', borderRadius: 12,
                            padding: '14px 16px', textAlign: 'center',
                          }}>
                            <div className="stat-lg" style={{ color: '#60a5fa', marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {decision && (
                        <div style={{
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 14, padding: '16px 20px',
                        }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            Latest recommendation
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 8 }}>
                            {decision.recommended_action}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                              {Math.round(decision.confidence * 100)}% confidence
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                              {decision.risk_level} risk
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════
                  MONEY (REVENUE LEAKS)
                  ══════════════════════════════════ */}
              {activeTab === 'leaks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Money</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Revenue Autopilot detects leaks from aggregate demand patterns — no individual customer tracking.
                    </p>
                  </div>

                  {/* Summary tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {[
                      { label: 'At risk',      value: fmt(totalAtRisk),     color: '#dc2626', bg: '#fef2f2' },
                      { label: 'Recoverable',  value: fmt(totalRecoverable), color: '#059669', bg: '#ecfdf5' },
                      { label: 'Leaks found',  value: String(opportunities.length), color: '#2563eb', bg: '#eff6ff' },
                      { label: 'High urgency', value: String(opportunities.filter(o => o.urgency === 'HIGH').length), color: '#dc2626', bg: '#fef2f2' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className="card" style={{ padding: '16px 18px', background: bg, border: 'none' }}>
                        <div style={{ fontSize: 11, color, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div className="stat-lg" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Filters */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Type:</span>
                    {['ALL', 'EXPIRY', 'STOCKOUT', 'OVERSTOCK'].map(t => (
                      <button key={t} className={`filter-pill ${leakType === t ? 'active' : ''}`} onClick={() => setLeakType(t)}>
                        {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginLeft: 8 }}>Urgency:</span>
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(u => (
                      <button key={u} className={`filter-pill ${leakUrgency === u ? 'active' : ''}`} onClick={() => setLeakUrgency(u)}>
                        {u === 'ALL' ? 'All' : u.charAt(0) + u.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Cards */}
                  {filteredOpps.length === 0 ? (
                    <EmptyState
                      icon={CheckCircle2}
                      title="No leaks found"
                      body="No opportunities match your current filters."
                    />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {filteredOpps.map((opp, i) => {
                        const ti = typeInfo(opp.opportunity_type);
                        const ui = urgencyInfo(opp.urgency);
                        return (
                          <div key={opp.opportunity_id || i} className="opp-card" onClick={() => setSelectedOpp(opp)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ background: ti.bg, color: ti.color, border: `1px solid ${ti.border}`, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginBottom: 4 }}>
                                  {ti.label}
                                </span>
                                <span style={{ background: ui.bg, color: ui.color, border: `1px solid ${ui.border}`, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginLeft: 4 }}>
                                  {opp.urgency}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 10, color: '#b91c1c', fontWeight: 700 }}>AT RISK</div>
                                <div className="stat-lg" style={{ color: '#b91c1c', marginTop: 2 }}>{fmt(opp.estimated_revenue_loss)}</div>
                              </div>
                              <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>RECOVERABLE</div>
                                <div className="stat-lg" style={{ color: '#059669', marginTop: 2 }}>{fmt(opp.estimated_recoverable_revenue)}</div>
                              </div>
                            </div>

                            {opp.evidence?.[0] && (
                              <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                                {opp.evidence[0]}
                              </p>
                            )}

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                                <span style={{ color: '#94a3b8' }}>Autopilot confidence</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{Math.round(opp.confidence * 100)}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill progress-blue" style={{ width: `${Math.round(opp.confidence * 100)}%` }} />
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, margin: 0 }}>
                                {opp.recommended_action?.slice(0, 55)}…
                              </p>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={e => { e.stopPropagation(); setSelectedOpp(opp); }}
                                style={{ flexShrink: 0, marginLeft: 8 }}
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  AUTOPILOT / DECISIONS
                  ══════════════════════════════════ */}
              {activeTab === 'decisions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Autopilot</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Every strategy is scored against the Status Quo before any recommendation is made.
                    </p>
                  </div>

                  {!decision ? (
                    <div className="card">
                      <EmptyState
                        icon={Layers}
                        title="No decision available"
                        body="Load a demo scenario to see Autopilot reasoning."
                      />
                    </div>
                  ) : (
                    <>
                      {/* Hero recommendation card */}
                      <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                        borderRadius: 20, padding: '28px 32px', color: 'white', position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                            {decision.product_name} · Autopilot says
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, lineHeight: 1.2 }}>
                            {decision.recommended_action}
                          </div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '0 0 20px', maxWidth: 480, lineHeight: 1.7 }}>
                            {decision.why_this_decision?.what_happened}
                          </p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Expected profit</div>
                              <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                                {fmt(decision.winning_candidate?.expected_gross_profit ?? 0)}
                              </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Confidence</div>
                              <div style={{ fontSize: 20, fontWeight: 800 }}>{pct(decision.confidence)}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Value Score</div>
                              <div style={{ fontSize: 20, fontWeight: 800 }}>{decision.winning_candidate?.overall_score}</div>
                            </div>
                          </div>
                          {decision.requires_approval && (
                            <div style={{ marginTop: 16, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
                              ⚡ This action needs your approval before execution.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Strategies compared */}
                      <div>
                        <div className="section-label" style={{ marginBottom: 14 }}>Strategies Autopilot evaluated</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
                          {(decision.scored_candidates ?? []).map((c, i) => (
                            <CandidateCard
                              key={i}
                              cand={c}
                              isWinner={c.action_name === decision.winning_candidate?.action_name}
                              isBaseline={c.action_name === 'DO_NOTHING'}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Reasoning accordions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="section-label" style={{ marginBottom: 4 }}>Why Autopilot decided this</div>
                        <Accordion title="What happened & why" icon={HelpCircle} iconColor="#2563eb" defaultOpen>
                          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.75, color: '#475569' }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What happened</div>
                              <p style={{ margin: 0 }}>{decision.why_this_decision?.what_happened}</p>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Why this opportunity</div>
                              <p style={{ margin: 0 }}>{decision.why_this_decision?.why_opportunity}</p>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Why this action was selected</div>
                              <p style={{ margin: 0 }}>{decision.why_this_decision?.why_selected}</p>
                            </div>
                          </div>
                        </Accordion>
                        <Accordion title="What if we did nothing?" icon={Shield} iconColor="#059669">
                          <p style={{ margin: '12px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.75 }}>
                            {decision.why_this_decision?.what_if_do_nothing}
                          </p>
                        </Accordion>
                        <Accordion title="Why not the other options?" icon={AlertTriangle} iconColor="#d97706">
                          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(decision.why_not_the_other_options ?? []).map((opt, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%', background: '#fef2f2',
                                  border: '1px solid #fecaca', display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', flexShrink: 0, marginTop: 2,
                                }}>
                                  <X size={10} color="#dc2626" />
                                </div>
                                <div><strong style={{ color: '#0f172a' }}>{opt.option}:</strong> {opt.reason}</div>
                              </div>
                            ))}
                          </div>
                        </Accordion>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  WHAT-IF SIMULATOR
                  ══════════════════════════════════ */}
              {activeTab === 'whatif' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>
                      What happens if I change this?
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Adjust order quantity and discount to see projected financial outcomes before committing.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
                    {/* Control panel */}
                    <div className="card" style={{ padding: 24, position: 'sticky', top: 116 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <Sliders size={17} color="#7c3aed" />
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Strategy Calculator</span>
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Order Quantity</label>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>{simQty} units</span>
                        </div>
                        <input
                          type="range" min={0} max={300} step={10} value={simQty}
                          onChange={e => setSimQty(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                          <span>0</span><span>150</span><span>300</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Discount Rate</label>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>{simDiscount}%</span>
                        </div>
                        <input
                          type="range" min={0} max={50} step={5} value={simDiscount}
                          onChange={e => setSimDiscount(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#2563eb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                          <span>0%</span><span>25%</span><span>50%</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-block btn-lg"
                        onClick={handleSimulate}
                        disabled={simLoading}
                        style={{ justifyContent: 'center' }}
                      >
                        {simLoading ? <><Spinner size={16} color="white" /> Simulating…</> : <><Play size={15} /> Run simulation</>}
                      </button>
                    </div>

                    {/* Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {simResult ? (
                        <>
                          {/* Net impact */}
                          <div style={{
                            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                            border: '1px solid #a7f3d0', borderRadius: 18,
                            padding: '22px 28px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                          }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                Estimated profit gain vs status quo
                              </div>
                              <div className="stat-hero" style={{ color: '#065f46' }}>
                                {simResult.net_profit_gain >= 0 ? '+' : ''}{fmt(simResult.net_profit_gain)}
                              </div>
                            </div>
                            <div style={{ background: '#059669', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                              {simResult.recommendation}
                            </div>
                          </div>

                          {/* Side-by-side */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {/* Status quo */}
                            <div className="card" style={{ padding: 22 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Current plan</span>
                                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Baseline</span>
                              </div>
                              {[
                                { k: 'Revenue', v: fmt(simResult.status_quo_strategy.expected_revenue) },
                                { k: 'Gross Profit', v: fmt(simResult.status_quo_strategy.expected_gross_profit), bold: true },
                                { k: 'Sales', v: `${simResult.status_quo_strategy.expected_sales} units` },
                                { k: 'Stockout Risk', v: pct(simResult.status_quo_strategy.stockout_probability) },
                                { k: 'Waste Risk', v: pct(simResult.status_quo_strategy.waste_probability) },
                              ].map(({ k, v, bold }) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                                  <span style={{ color: '#64748b' }}>{k}</span>
                                  <span style={{ fontWeight: bold ? 800 : 600, color: bold ? '#059669' : '#0f172a' }}>{v}</span>
                                </div>
                              ))}
                            </div>

                            {/* Proposed */}
                            <div style={{ border: '2px solid #2563eb', borderRadius: 16, padding: 22, background: '#f0f7ff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#1e40af' }}>Your plan</span>
                                <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Custom</span>
                              </div>
                              {[
                                { k: 'Revenue', v: fmt(simResult.custom_proposed_strategy.expected_revenue) },
                                { k: 'Gross Profit', v: fmt(simResult.custom_proposed_strategy.expected_gross_profit), bold: true },
                                { k: 'Sales', v: `${simResult.custom_proposed_strategy.expected_sales} units` },
                                { k: 'Stockout Risk', v: pct(simResult.custom_proposed_strategy.stockout_probability) },
                                { k: 'Waste Risk', v: pct(simResult.custom_proposed_strategy.waste_probability) },
                              ].map(({ k, v, bold }) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #bfdbfe', fontSize: 13 }}>
                                  <span style={{ color: '#3b82f6' }}>{k}</span>
                                  <span style={{ fontWeight: bold ? 800 : 600, color: bold ? '#059669' : '#1e40af' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                          <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                            Configure & run a simulation
                          </h3>
                          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                            Adjust the sliders on the left and click Run simulation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════
                  INSIGHTS
                  ══════════════════════════════════ */}
              {activeTab === 'changed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>
                      Things Autopilot noticed
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Intelligent observations about your business. No individual customer data.
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                      { emoji: '📈', title: 'Demand is accelerating', color: '#eff6ff', border: '#bfdbfe', tc: '#1e40af', text: 'Milk demand velocity is 32% above your historical baseline. This is faster than usual weekend patterns.' },
                      { emoji: '⏰', title: 'Expiry risk detected', color: '#fef2f2', border: '#fecaca', tc: '#b91c1c', text: 'Fresh Juice is approaching its expiry window. Demand deceleration detected 3 days ago — clearance discount recommended.' },
                      { emoji: '📍', title: 'Location effect', color: '#fefce8', border: '#fef08a', tc: '#713f12', text: 'TechPark Central demand is 42% lower on weekends than weekdays. Office schedule is driving this.' },
                      { emoji: '🔗', title: 'Product co-movement', color: '#f0fdf4', border: '#bbf7d0', tc: '#065f46', text: 'Milk and bread sales move together (correlation r = +0.68). Pricing one affects demand for the other.' },
                      { emoji: '📦', title: 'Stockout approaching', color: '#fff7ed', border: '#fed7aa', tc: '#9a3412', text: 'At current demand velocity, Organic Whole Milk will run out in approximately 1.2 days without a reorder.' },
                      { emoji: '📅', title: 'Holiday effect', color: '#f5f3ff', border: '#ddd6fe', tc: '#5b21b6', text: 'Three upcoming IT Park office holidays detected. Demand expected to follow historical holiday patterns.' },
                    ].map(({ emoji, title, color, border, tc, text }) => (
                      <div key={title} style={{ background: color, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 22px' }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: tc, margin: '0 0 8px' }}>{title}</h3>
                        <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.7 }}>{text}</p>
                      </div>
                    ))}
                  </div>

                  {decision?.why_this_decision && (
                    <div>
                      <div className="section-label" style={{ marginBottom: 12 }}>Autopilot's reasoning right now</div>
                      <div className="card" style={{ padding: 22 }}>
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, margin: 0 }}>
                          {decision.why_this_decision.what_happened}
                        </p>
                        {decision.why_this_decision.alternatives_simulated?.length > 0 && (
                          <div style={{ marginTop: 14 }}>
                            <div className="section-label" style={{ marginBottom: 8 }}>Strategies considered</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {decision.why_this_decision.alternatives_simulated.map((alt, i) => (
                                <span key={i} className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{alt}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  APPROVALS
                  ══════════════════════════════════ */}
              {activeTab === 'approvals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Approval Queue</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Autopilot is waiting for your approval before executing.
                    </p>
                  </div>

                  {actions.length === 0 ? (
                    <div className="card">
                      <EmptyState
                        icon={CheckCircle2}
                        title="All clear"
                        body="No pending approvals. Autopilot is within policy guardrails."
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {actions.map(act => {
                        const statusMap: Record<string, { bg: string; color: string; border: string }> = {
                          PENDING:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
                          APPROVED: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
                          EXECUTED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                          REJECTED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                          FAILED:   { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                        };
                        const sc = statusMap[act.status] || statusMap.PENDING;
                        return (
                          <div key={act.id} className="card" style={{ padding: 24 }}>
                            {act.status === 'PENDING' && (
                              <div style={{
                                background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
                                padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 13, color: '#92400e', fontWeight: 600,
                              }}>
                                <AlertTriangle size={14} />
                                Autopilot wants to protect revenue. Your approval is needed.
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Action #{act.id}</span>
                                  <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                                    {act.status}
                                  </span>
                                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                    {act.action_type}
                                  </span>
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                                  {act.recommendation}
                                </h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px', lineHeight: 1.65, maxWidth: 480 }}>
                                  {act.agent_reasoning}
                                </p>
                                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                                  <div>
                                    <span style={{ color: '#94a3b8' }}>Confidence: </span>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{Math.round(act.confidence * 100)}%</span>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94a3b8' }}>Risk: </span>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{act.risk_level}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                {act.status === 'PENDING' && (
                                  <>
                                    <button className="btn btn-success" onClick={() => handleApprove(act.id)}>
                                      <ThumbsUp size={14} /> Approve
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleReject(act.id)}>
                                      <ThumbsDown size={14} /> Reject
                                    </button>
                                  </>
                                )}
                                {act.status === 'APPROVED' && (
                                  <button className="btn btn-primary" onClick={() => handleExecute(act.id)}>
                                    <Play size={13} /> Execute (MOCK)
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  DECISION TIMELINE
                  ══════════════════════════════════ */}
              {activeTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Decision Journey</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      End-to-end audit trail for Action #{decision?.action_id} — {decision?.product_name}
                    </p>
                  </div>
                  {!decision ? (
                    <div className="card">
                      <EmptyState icon={Clock} title="No decision data" body="Load a demo scenario first." />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
                      <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
                          10-Stage Audit Trail
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {decision.audit_timeline.map((step, i) => {
                            const done = step.status === 'COMPLETED';
                            const fail = step.status === 'FAILED' || step.status === 'REJECTED';
                            return (
                              <div key={i} className="timeline-item">
                                <div className="timeline-line">
                                  <div className="timeline-node" style={{
                                    background: done ? '#ecfdf5' : fail ? '#fef2f2' : '#f1f5f9',
                                    borderColor: done ? '#059669' : fail ? '#dc2626' : '#cbd5e1',
                                  }}>
                                    {done ? <CheckCircle2 size={13} color="#059669" /> :
                                     fail ? <X size={13} color="#dc2626" /> :
                                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />}
                                  </div>
                                  {i < decision.audit_timeline.length - 1 && (
                                    <div className={`timeline-connector ${done ? 'timeline-connector-done' : ''}`} />
                                  )}
                                </div>
                                <div style={{ flex: 1, paddingBottom: 16 }}>
                                  <div style={{ paddingTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: done ? '#0f172a' : '#94a3b8' }}>{step.stage}</span>
                                    {done && <span className="badge" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: 10 }}>Done</span>}
                                  </div>
                                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', lineHeight: 1.6 }}>{step.details}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="card" style={{ padding: 20 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>Decision Summary</h4>
                          {[
                            { k: 'Product', v: decision.product_name },
                            { k: 'Recommendation', v: decision.recommended_action },
                            { k: 'Expected Profit', v: fmt(decision.winning_candidate?.expected_gross_profit ?? 0), color: '#059669' },
                            { k: 'Confidence', v: pct(decision.confidence), color: '#2563eb' },
                            { k: 'Risk Level', v: decision.risk_level },
                            { k: 'Needs Approval', v: decision.requires_approval ? 'Yes' : 'No', color: decision.requires_approval ? '#d97706' : '#059669' },
                          ].map(({ k, v, color }) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                              <span style={{ color: '#64748b' }}>{k}</span>
                              <span style={{ fontWeight: 700, color: color || '#0f172a', maxWidth: '55%', textAlign: 'right' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className="card" style={{ padding: 20 }}>
                          <div className="section-label" style={{ marginBottom: 8 }}>Policy Applied</div>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.7 }}>
                            {decision.why_this_decision?.policy_applied}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  MONEY RECOVERED
                  ══════════════════════════════════ */}
              {activeTab === 'recovered' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Money Autopilot recovered</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Closed-loop learning — every action outcome feeds back to improve accuracy.
                    </p>
                  </div>

                  {!outcomes ? (
                    <div className="card">
                      <EmptyState icon={TrendingUp} title="No outcome data yet" body="Execute some approved actions to start tracking." />
                    </div>
                  ) : (
                    <>
                      <div style={{
                        background: 'linear-gradient(135deg, #065f46, #059669)',
                        borderRadius: 20, padding: '28px 32px', color: 'white',
                      }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                          Total revenue recovered
                        </div>
                        <div className="stat-hero" style={{ color: 'white', marginBottom: 4 }}>{fmt(outcomes.total_revenue_recovered)}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                          {outcomes.total_actions_evaluated} actions · {Math.round(outcomes.mean_prediction_error_pct)}% mean prediction variance
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                        {[
                          { label: 'Profit recovered', value: fmt(outcomes.total_profit_recovered), color: '#059669' },
                          { label: 'Waste avoided', value: `${outcomes.waste_avoided_units} units`, color: '#2563eb' },
                          { label: 'Stockouts avoided', value: `${outcomes.stockouts_avoided_units} units`, color: '#7c3aed' },
                          { label: 'Model accuracy', value: `${100 - Math.round(outcomes.mean_prediction_error_pct)}%`, color: '#0284c7' },
                          { label: 'Calibrated confidence', value: outcomes.calibrated_base_confidence ? pct(outcomes.calibrated_base_confidence) : '—', color: '#ca8a04' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="card" style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                            <div className="stat-lg" style={{ color }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {outcomes.history?.length > 0 && (
                        <div className="card" style={{ padding: 22 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>Recovery history</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {outcomes.history.slice(0, 10).map((h: any, i: number) => (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13,
                              }}>
                                <div>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Action #{h.action_id || i + 1}</span>
                                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>{h.product_name || 'Product'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 20 }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Predicted</div>
                                    <div style={{ fontWeight: 700 }}>{fmt(h.predicted_revenue || 0)}</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Actual</div>
                                    <div style={{ fontWeight: 700, color: '#059669' }}>{fmt(h.actual_revenue || 0)}</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Error</div>
                                    <div style={{ fontWeight: 700, color: '#d97706' }}>{h.error_percentage ? `${Math.round(h.error_percentage)}%` : '—'}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  RELIABILITY LOGS
                  ══════════════════════════════════ */}
              {activeTab === 'failures' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 100, padding: '4px 12px', marginBottom: 8 }}>
                      <span className="status-dot status-dot-green" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>System Operational</span>
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Reliability Logs</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Autopilot recovers from these conditions automatically.
                    </p>
                  </div>
                  {failures.length === 0 ? (
                    <div className="card">
                      <EmptyState icon={CheckCircle2} title="No failures recorded" body="All systems operating within normal parameters." />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {failures.map(f => (
                        <div key={f.id} style={{
                          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px',
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'white', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertTriangle size={15} color="#dc2626" />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c', marginBottom: 4 }}>
                              {f.failure_type} <span style={{ color: '#94a3b8', fontWeight: 500 }}>#{f.id}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#334155', margin: '0 0 4px' }}><strong>Cause:</strong> {f.possible_cause}</p>
                            <p style={{ fontSize: 12, color: '#059669', margin: 0, fontWeight: 600 }}>↳ Recovery: {f.recovery_action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════
                  STRATEGY LAB (EXPERIMENTS)
                  ══════════════════════════════════ */}
              {activeTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Strategy Lab</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Run multi-arm experiments to compare revenue strategies before committing.
                    </p>
                  </div>
                  {experiments.length === 0 ? (
                    <div className="card"><EmptyState icon={Beaker} title="No experiments" body="No experiments are configured for this store." /></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {experiments.map(exp => {
                        const isCurrentResult = activeExpResult?.experiment_id === exp.experiment_id;
                        return (
                          <div key={exp.experiment_id} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                                  {exp.product_name}
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{exp.name}</h3>
                                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{exp.description}</p>
                              </div>
                              <button className="btn btn-primary" onClick={() => handleRunExperiment(exp.experiment_id)}>
                                <Play size={13} /> Run experiment
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                              {exp.strategies.map((s, i) => {
                                const isWinner = isCurrentResult && activeExpResult?.winning_arm === s.arm;
                                return (
                                  <div key={s.arm} style={{
                                    flex: '1 1 150px', border: isWinner ? '2px solid #059669' : '1px solid #e2e8f0',
                                    borderRadius: 12, padding: '14px 16px', background: isWinner ? '#ecfdf5' : '#f8fafc',
                                    position: 'relative',
                                  }}>
                                    {isWinner && (
                                      <div style={{ position: 'absolute', top: -10, right: 10, background: '#059669', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 100 }}>
                                        WINNER
                                      </div>
                                    )}
                                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Strategy {i + 1}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: isWinner ? '#065f46' : '#0f172a' }}>{s.name}</div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.description}</div>
                                  </div>
                                );
                              })}
                            </div>

                            {isCurrentResult && (
                              <div style={{ marginTop: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                                <span style={{ fontWeight: 700, color: '#065f46' }}>Result: </span>
                                <span style={{ color: '#334155' }}>Winner — <strong>{activeExpResult.winning_arm}</strong>. {activeExpResult.summary}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* ══════════════════════════════════════════════════════
            MOBILE BOTTOM NAV
            ══════════════════════════════════════════════════════ */}
        <nav className="mobile-nav">
          {([
            { id: 'overview', label: 'Home', icon: Home },
            { id: 'leaks', label: 'Money', icon: DollarSign },
            { id: 'decisions', label: 'Autopilot', icon: Layers },
            { id: 'whatif', label: 'What-If', icon: Sliders },
            { id: 'approvals', label: 'Approvals', icon: CheckSquare },
          ] as { id: PageView; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button key={id} className={`mobile-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>

        {/* ══════════════════════════════════════════════════════
            OPPORTUNITY DETAIL DRAWER
            ══════════════════════════════════════════════════════ */}
        {selectedOpp && (
          <div className="drawer-overlay" onClick={() => setSelectedOpp(null)}>
            <div className="drawer" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 3 }}>Opportunity Detail</div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {typeInfo(selectedOpp.opportunity_type).label}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedOpp(null)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={15} color="#64748b" />
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(() => {
                  const ti = typeInfo(selectedOpp.opportunity_type);
                  return <span className="badge" style={{ background: ti.bg, color: ti.color, border: `1px solid ${ti.border}` }}>{ti.label}</span>;
                })()}
                {(() => {
                  const ui = urgencyInfo(selectedOpp.urgency);
                  return <span className="badge" style={{ background: ui.bg, color: ui.color, border: `1px solid ${ui.border}` }}>{selectedOpp.urgency} Urgency</span>;
                })()}
              </div>

              {/* Money numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#fef2f2', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 700, marginBottom: 4 }}>REVENUE LOSS</div>
                  <div className="stat-xl" style={{ color: '#b91c1c' }}>{fmt(selectedOpp.estimated_revenue_loss)}</div>
                </div>
                <div style={{ background: '#ecfdf5', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginBottom: 4 }}>RECOVERABLE</div>
                  <div className="stat-xl" style={{ color: '#059669' }}>{fmt(selectedOpp.estimated_recoverable_revenue)}</div>
                </div>
              </div>

              {/* Confidence */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Autopilot confidence</span>
                  <span style={{ fontWeight: 700 }}>{Math.round(selectedOpp.confidence * 100)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-blue" style={{ width: `${Math.round(selectedOpp.confidence * 100)}%` }} />
                </div>
              </div>

              {/* Recommended action */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  What Autopilot recommends
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', lineHeight: 1.5 }}>
                  {selectedOpp.recommended_action}
                </div>
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: 24 }}>
                <div className="section-label" style={{ marginBottom: 10 }}>Evidence</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedOpp.evidence?.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13, color: '#334155', lineHeight: 1.65 }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-block"
                style={{ justifyContent: 'center' }}
                onClick={() => { setSelectedOpp(null); setActiveTab('decisions'); }}
              >
                Analyse in Autopilot <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SYSTEM STATUS MODAL
            ══════════════════════════════════════════════════════ */}
        {showStatusModal && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white', borderRadius: 20, maxWidth: 400, width: '100%',
                padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={18} color="#2563eb" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>System Status</h3>
                </div>
                <button onClick={() => setShowStatusModal(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} color="#64748b" />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Backend API',            value: apiError ? 'Error' : 'Connected',    ok: !apiError },
                  { label: 'Database',               value: 'Connected',                          ok: true },
                  { label: 'Autopilot Engine',        value: 'Ready',                              ok: true },
                  { label: 'Simulator Engine',        value: 'Ready',                              ok: true },
                  { label: 'Learning Engine',         value: 'Ready',                              ok: true },
                  { label: 'Execution Mode',          value: 'MOCK (Safe)',                        ok: true },
                  { label: 'Razorpay Integration',    value: 'Not Configured (Optional)',          ok: null },
                ].map(({ label, value, ok }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', background: '#f8fafc', borderRadius: 9,
                    border: '1px solid #f1f5f9', fontSize: 13,
                  }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ok === true  && <span className="status-dot status-dot-green" />}
                      {ok === false && <span className="status-dot status-dot-red" />}
                      {ok === null  && <span className="status-dot status-dot-gray" />}
                      <span style={{ fontWeight: 700, color: ok === true ? '#059669' : ok === false ? '#dc2626' : '#64748b' }}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary btn-block"
                style={{ marginTop: 18, justifyContent: 'center' }}
                onClick={() => setShowStatusModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
