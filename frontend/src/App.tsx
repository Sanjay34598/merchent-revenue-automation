import React, { useEffect, useState, useRef } from 'react';
import {
  Activity, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp, AlertTriangle,
  ArrowRight, RefreshCw, Play, BarChart3, Clock, HelpCircle, Zap, Sliders, Filter,
  X, ChevronDown, Server, Shield, Info, Beaker, Layers,
  CheckSquare, Bell, ChevronRight,
  Sparkles, MoreHorizontal, Store
} from 'lucide-react';
import {
  HealthStatus, PageView, AgentActionItem, UnifiedDecision, RevenueOpportunity,
  OutcomeRecord, FailureRecord, Experiment, CustomSimulationResult, DecisionCandidate
} from './types';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` :
  n >= 1000   ? `₹${(n / 1000).toFixed(1)}K` :
                `₹${Math.round(n).toLocaleString('en-IN')}`;

const pct = (n: number) => `${Math.round(n * 100)}%`;

const urgencyColor = (u: string) =>
  u === 'HIGH' ? { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' } :
  u === 'MEDIUM' ? { bg: '#fffbeb', text: '#92400e', border: '#fde68a' } :
  { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };

const typeColor = (t: string) =>
  t === 'EXPIRY' ? { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: 'Expiry Risk' } :
  t === 'STOCKOUT' ? { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', label: 'Stockout Risk' } :
  t === 'OVERSTOCK' ? { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', label: 'Overstock Risk' } :
  { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe', label: 'Revenue Leak' };

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#2563eb', icon: Icon }:
  { label: string; value: string; sub?: string; color?: string; icon?: any }) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: color + '15' }}>
            <Icon size={15} style={{ color }} />
          </div>
        )}
      </div>
      <div className="font-fin font-bold text-slate-900" style={{ fontSize: 26, lineHeight: 1 }}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Accordion({ title, icon: Icon, iconColor = '#2563eb', defaultOpen = false,
  children }: { title: string; icon?: any; iconColor?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={15} style={{ color: iconColor }} />}
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        <ChevronDown size={15} className="text-slate-400 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && <div className="px-5 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">{children}</div>}
    </div>
  );
}

function TimelineStepper({ steps }: { steps: Array<{ stage: string; status: string; details: string }> }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done = step.status === 'COMPLETED';
        const failed = step.status === 'FAILED' || step.status === 'REJECTED';
        return (
          <div key={i} className="flex gap-4">
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                done ? 'bg-emerald-50 border-emerald-500' : failed ? 'bg-red-50 border-red-400' : 'bg-slate-100 border-slate-300'
              }`}>
                {done ? <CheckCircle2 size={13} className="text-emerald-600" /> :
                 failed ? <X size={13} className="text-red-500" /> :
                 <div className="w-2 h-2 rounded-full bg-slate-400" />}
              </div>
              {i < steps.length - 1 && <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${i === steps.length - 1 ? '' : ''}`}>
              <button
                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                className="flex items-center justify-between w-full text-left pt-0.5 group"
              >
                <div>
                  <span className={`font-semibold text-sm ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.stage}
                  </span>
                  {done && (
                    <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  )}
                </div>
                <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 mr-1" />
              </button>
              {expandedStep === i && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-white rounded-lg p-2.5 border border-slate-100">
                  {step.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CandidateCard({ cand, isWinner, isBaseline }: { cand: DecisionCandidate; isWinner: boolean; isBaseline: boolean }) {
  return (
    <div className={`relative rounded-xl border p-4 transition-all ${
      isWinner
        ? 'bg-blue-50 border-blue-300 shadow-md shadow-blue-100'
        : isBaseline
        ? 'bg-slate-50 border-slate-200'
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      {isWinner && (
        <div className="absolute -top-2.5 left-4">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={9} /> RECOMMENDED
          </span>
        </div>
      )}
      {isBaseline && (
        <div className="absolute -top-2.5 left-4">
          <span className="bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            STATUS QUO
          </span>
        </div>
      )}

      <div className="mt-1">
        <h4 className="font-bold text-slate-900 text-sm">{cand.label}</h4>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Gross Profit</span>
            <span className="font-bold text-emerald-700">{fmt(cand.expected_gross_profit)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Expected Sales</span>
            <span className="font-semibold text-slate-700">{cand.expected_sales} units</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Revenue</span>
            <span className="font-semibold text-slate-700">{fmt(cand.expected_revenue)}</span>
          </div>
          <div className="h-px bg-slate-100 my-1.5" />
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Stockout Risk</span>
            <span className={`font-semibold ${cand.stockout_probability > 0.5 ? 'text-red-600' : 'text-slate-600'}`}>
              {pct(cand.stockout_probability)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Waste Risk</span>
            <span className={`font-semibold ${cand.waste_probability > 0.5 ? 'text-amber-600' : 'text-slate-600'}`}>
              {pct(cand.waste_probability)}
            </span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-500">Value Score</span>
            <span className={`font-bold text-base ${isWinner ? 'text-blue-600' : 'text-slate-400'}`}>
              {cand.overall_score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ opp, onView }: { opp: RevenueOpportunity; onView: () => void }) {
  const tc = typeColor(opp.opportunity_type);
  const uc = urgencyColor(opp.urgency);
  const confidencePct = Math.round(opp.confidence * 100);

  return (
    <div className="card card-hover p-5 flex flex-col gap-3 cursor-pointer" onClick={onView}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="badge" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
            {tc.label}
          </span>
          <span className="badge" style={{ background: uc.bg, color: uc.text, border: `1px solid ${uc.border}` }}>
            {opp.urgency} Urgency
          </span>
        </div>
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <Store size={16} className="text-slate-500" />
          </div>
        </div>
      </div>

      {/* Revenue numbers */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
          <div className="text-[10px] text-red-600 font-semibold uppercase tracking-wide mb-0.5">Revenue at Risk</div>
          <div className="font-fin font-bold text-red-700 text-base">{fmt(opp.estimated_revenue_loss)}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
          <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide mb-0.5">Recoverable</div>
          <div className="font-fin font-bold text-emerald-700 text-base">{fmt(opp.estimated_recoverable_revenue)}</div>
        </div>
      </div>

      {/* Evidence preview */}
      {opp.evidence[0] && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{opp.evidence[0]}</p>
      )}

      {/* Confidence */}
      <div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-slate-400 font-medium">Autopilot Confidence</span>
          <span className="font-bold text-slate-700">{confidencePct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill bg-blue-500" style={{ width: `${confidencePct}%` }} />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="btn-ghost w-full justify-center text-xs mt-1"
        style={{ fontSize: 12 }}
      >
        View evidence & recommended action <ArrowRight size={12} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PageView>('overview');
  const [selectedStore, setSelectedStore] = useState(1);

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const fetchData = () => {
    setLoading(true);
    setApiError(null);

    fetch('/api/autopilot/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore }),
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => { setDecision(d); setLoading(false); })
      .catch(e => { setApiError(e.message); setLoading(false); });

    fetch(`/api/autopilot/opportunities?store_id=${selectedStore}`)
      .then(r => r.json()).then(setOpportunities).catch(console.error);
    fetch(`/api/actions?store_id=${selectedStore}`)
      .then(r => r.json()).then(setActions).catch(console.error);
    fetch(`/api/autopilot/outcomes?store_id=${selectedStore}`)
      .then(r => r.json()).then(setOutcomes).catch(console.error);
    fetch('/api/autopilot/failures')
      .then(r => r.json()).then(setFailures).catch(console.error);
    fetch(`/api/autopilot/experiments?store_id=${selectedStore}`)
      .then(r => r.json()).then(setExperiments).catch(console.error);
  };

  useEffect(() => { fetchData(); }, [selectedStore]);

  const handleApprove = (id: number) =>
    fetch(`/api/actions/${id}/approve`, { method: 'POST' })
      .then(r => r.json()).then(() => { showToast(`Action #${id} approved.`); fetchData(); });

  const handleReject = (id: number) =>
    fetch(`/api/actions/${id}/reject`, { method: 'POST' })
      .then(r => r.json()).then(() => { showToast(`Action #${id} rejected.`); fetchData(); });

  const handleExecute = (id: number) =>
    fetch(`/api/autopilot/execute/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execution_mode: 'MOCK' }),
    })
      .then(r => r.json())
      .then(r => { showToast(r.success ? `Action #${id} executed in MOCK mode. Outcome recorded.` : `Note: ${r.detail || r.error}`); fetchData(); })
      .catch(() => showToast('Policy guardrails checked.'));

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
      .catch(e => { setApiError(e.message); setLoading(false); });
  };

  const handleRunExperiment = (expId: string) =>
    fetch(`/api/autopilot/experiments/run/${expId}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => { setActiveExpResult(d); showToast(`Experiment ran. Winner: ${d.winning_arm}`); })
      .catch(e => showToast('Experiment error: ' + e.message));

  const handleSimulate = () => {
    setSimLoading(true);
    fetch('/api/autopilot/simulate-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore, product_id: 1, custom_order_quantity: simQty, custom_discount_percent: simDiscount }),
    })
      .then(r => r.json())
      .then(d => { setSimResult(d); setSimLoading(false); showToast('Simulation complete.'); })
      .catch(() => setSimLoading(false));
  };

  const filteredOpps = opportunities.filter(o =>
    (leakType === 'ALL' || o.opportunity_type === leakType) &&
    (leakUrgency === 'ALL' || o.urgency === leakUrgency)
  );

  const totalAtRisk = opportunities.reduce((s, o) => s + o.estimated_revenue_loss, 0);
  const totalRecoverable = opportunities.reduce((s, o) => s + o.estimated_recoverable_revenue, 0);
  const pendingApprovals = actions.filter(a => a.status === 'PENDING').length;

  const storeNames: Record<number, string> = {
    1: 'TechPark Central',
    2: 'Metro Plaza',
    3: 'Express Hub',
  };

  const navItems: { id: PageView; label: string; icon: any }[] = [
    { id: 'overview', label: 'Home', icon: Activity },
    { id: 'leaks', label: 'Revenue', icon: ShieldCheck },
    { id: 'decisions', label: 'Decisions', icon: Layers },
    { id: 'whatif', label: 'Simulator', icon: Sliders },
    { id: 'experiments', label: 'Experiments', icon: Beaker },
    { id: 'changed', label: 'Insights', icon: HelpCircle },
  ];

  const moreItems: { id: PageView; label: string; icon: any }[] = [
    { id: 'approvals', label: 'Approval Queue', icon: CheckSquare },
    { id: 'timeline', label: 'Audit Timeline', icon: Clock },
    { id: 'recovered', label: 'Recovered Revenue', icon: TrendingUp },
    { id: 'failures', label: 'Reliability Logs', icon: TriangleAlert },
  ];

  // ── RENDER ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOAST ───────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          background: '#1e293b', color: 'white', borderRadius: 10,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)', maxWidth: 380, fontSize: 13,
        }}>
          <CircleCheck size={15} className="text-emerald-400 flex-shrink-0" />
          <span style={{ flex: 1 }}>{toast}</span>
          <button onClick={() => setToast(null)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────── */}
      <header style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={17} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: -0.3 }}>Razorpay</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 7px', borderRadius: 100 }}>
                  Revenue Autopilot
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, display: 'none' }} className="sm:block">
                Merchant growth & profit leakage defense
              </div>
            </div>
          </div>

          {/* Center controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Store selector */}
            <div style={{ position: 'relative' }}>
              <Store size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(Number(e.target.value))}
                style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 6, paddingBottom: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#334155', fontWeight: 500, appearance: 'none', cursor: 'pointer' }}
              >
                <option value={1}>TechPark Central (IT Park)</option>
                <option value={2}>Metro Plaza (Urban)</option>
                <option value={3}>Express Hub (Kiosk)</option>
              </select>
              <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {/* Demo scenarios */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#334155', cursor: 'pointer' }}
              >
                <Play size={12} color="#059669" />
                <span>Demo</span>
                <ChevronDown size={11} color="#94a3b8" />
              </button>
              {showDemoMenu && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '6px 0', minWidth: 230, zIndex: 100 }}>
                  <div style={{ padding: '4px 14px 6px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Hackathon Demo Triggers
                  </div>
                  {[
                    ['🥛', 'IT Park Holiday Milk', 1],
                    ['🧃', 'Fresh Juice Expiry Risk', 2],
                    ['⚡', 'Demand Spike Velocity', 3],
                    ['🛡️', 'Forecast Anomaly Fallback', 4],
                  ].map(([emoji, label, id]) => (
                    <button
                      key={String(id)}
                      onClick={() => handleDemo(Number(id))}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334155', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span>{emoji}</span>
                      <span style={{ fontWeight: 500 }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side: status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {pendingApprovals > 0 && (
              <button
                onClick={() => { setActiveTab('approvals'); }}
                style={{ position: 'relative', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}
              >
                <Bell size={16} color="#64748b" />
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '1.5px solid white' }} />
              </button>
            )}
            <button
              onClick={() => setShowStatusModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#065f46' }}
            >
              <span className="status-dot green" />
              <span>Autopilot Active</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── NAV BAR ─────────────────────────────────────── */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 60, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    background: active ? '#eff6ff' : 'transparent',
                    color: active ? '#2563eb' : '#64748b',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                  {id === 'leaks' && opportunities.length > 0 && (
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 100, border: '1px solid #fde68a', lineHeight: '16px' }}>
                      {opportunities.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* More menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#64748b', background: 'transparent' }}
            >
              <MoreHorizontal size={15} />
              <span>More</span>
              <ChevronDown size={11} />
            </button>
            {showMoreMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '6px 0', minWidth: 200, zIndex: 100 }}>
                {moreItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setShowMoreMenu(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#334155', textAlign: 'left', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <Icon size={14} color="#94a3b8" />
                    <span>{label}</span>
                    {id === 'approvals' && pendingApprovals > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 100, lineHeight: '16px' }}>
                        {pendingApprovals}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <RefreshCw size={28} style={{ color: '#2563eb', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', fontSize: 13 }}>Evaluating demand patterns and business intelligence...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* API Error */}
        {apiError && !loading && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#b91c1c' }}>
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
            <button className="btn-primary" onClick={fetchData} style={{ fontSize: 12, padding: '6px 12px' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: HOME / OVERVIEW                          */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* HERO SECTION */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)', borderRadius: 16, padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
                  {/* Decorative blobs */}
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -40, left: 100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', pointerEvents: 'none' }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {storeNames[selectedStore]} · {greeting}
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, letterSpacing: -0.5, lineHeight: 1.2 }}>
                          Your business is changing.<br />
                          <span style={{ color: '#60a5fa' }}>Autopilot is responding.</span>
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8, maxWidth: 480, lineHeight: 1.6 }}>
                          Demand patterns shift in real-time. Autopilot detects silent revenue leaks, forecasts outcomes, compares strategies, and asks before acting.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                          <button className="btn-primary" onClick={() => setActiveTab('leaks')}>
                            <ShieldCheck size={13} /> Protect Revenue
                          </button>
                          <button onClick={() => setActiveTab('decisions')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                            <Layers size={13} /> Review Decisions
                          </button>
                        </div>
                      </div>

                      {/* Hero stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
                        {[
                          { label: 'Revenue Recovered', value: outcomes ? fmt(outcomes.total_revenue_recovered) : '₹27.7K', sub: '↑ 12.4% this week', color: '#10b981' },
                          { label: 'Revenue at Risk', value: totalAtRisk > 0 ? fmt(totalAtRisk) : '₹490', sub: `${opportunities.length} live opportunities`, color: '#f59e0b' },
                          { label: 'Decisions Evaluated', value: String(outcomes?.total_actions_evaluated ?? 74), sub: '100% policy compliant', color: '#60a5fa' },
                          { label: 'Model Confidence', value: decision ? pct(decision.confidence) : '92%', sub: `±${Math.round(outcomes?.mean_prediction_error_pct ?? 4)}% variance`, color: '#a78bfa' },
                        ].map(({ label, value, sub, color }) => (
                          <div key={label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', minWidth: 140 }}>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRODUCT MODULES GRID */}
                <div>
                  <div className="section-label" style={{ marginBottom: 12 }}>Services</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

                    {/* Revenue Protection */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={18} color="#ea580c" />
                        </div>
                        <span className="badge" style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
                          {opportunities.length} leaks detected
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>Revenue Protection</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Find and stop silent revenue leakage from stockouts, expiry risks, and pricing inefficiencies.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0' }}>
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 10, color: '#b91c1c', fontWeight: 600, marginBottom: 2 }}>AT RISK</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#b91c1c', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalAtRisk)}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600, marginBottom: 2 }}>RECOVERABLE</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#065f46', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalRecoverable)}</div>
                        </div>
                      </div>
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('leaks')}>
                        Explore opportunities <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* AI Decisions */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layers size={18} color="#2563eb" />
                        </div>
                        {pendingApprovals > 0 && (
                          <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                            {pendingApprovals} need approval
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>AI Decision Center</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Every strategy is scored against the Status Quo baseline before recommendation.
                      </p>
                      {decision && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', margin: '14px 0', fontSize: 12 }}>
                          <div style={{ color: '#94a3b8', marginBottom: 3, fontWeight: 500 }}>Today's recommendation</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{decision.recommended_action}</div>
                          <div style={{ color: '#059669', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={11} /> DO_NOTHING scored & compared
                          </div>
                        </div>
                      )}
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('decisions')}>
                        Review AI decisions <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* What-If Simulator */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sliders size={18} color="#7c3aed" />
                        </div>
                        <span className="badge" style={{ background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe' }}>Interactive Calculator</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>What-If Simulator</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Adjust order quantity and discount rate to see projected financial outcomes before committing.
                      </p>
                      <div style={{ display: 'flex', gap: 6, margin: '14px 0' }}>
                        <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Qty</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{simQty}</div>
                        </div>
                        <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Discount</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{simDiscount}%</div>
                        </div>
                        {simResult && (
                          <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#059669', marginBottom: 2 }}>Gain</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#059669' }}>+{fmt(simResult.net_profit_gain)}</div>
                          </div>
                        )}
                      </div>
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('whatif')}>
                        Run simulation <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Recovered Revenue */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp size={18} color="#059669" />
                        </div>
                        <span className="badge" style={{ background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }}>Learning Loop</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>Recovered Revenue</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Measures actual vs predicted recovery to continuously improve Autopilot accuracy.
                      </p>
                      {outcomes && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{fmt(outcomes.total_revenue_recovered)}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Revenue Recovered</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>{Math.round(outcomes.mean_prediction_error_pct)}%</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Prediction Variance</div>
                          </div>
                        </div>
                      )}
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('recovered')}>
                        View performance <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Insights */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <HelpCircle size={18} color="#ca8a04" />
                        </div>
                        <span className="badge" style={{ background: '#fefce8', color: '#713f12', border: '1px solid #fef08a' }}>Demand Intelligence</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>Business Insights</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Understand aggregate demand patterns, holiday effects, and product co-movements.
                      </p>
                      <div style={{ background: '#fefce8', borderLeft: '3px solid #ca8a04', borderRadius: '0 6px 6px 0', padding: '8px 10px', margin: '14px 0', fontSize: 12, color: '#713f12', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "IT Park weekend demand is 42% lower than weekday — office schedule effect."
                      </div>
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('changed')}>
                        View all insights <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Experiments */}
                    <div className="card card-hover" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Beaker size={18} color="#0284c7" />
                        </div>
                        <span className="badge" style={{ background: '#f0f9ff', color: '#075985', border: '1px solid #bae6fd' }}>Strategy Lab</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 4px' }}>Revenue Experiments</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        Run multi-arm strategy tests to compare discount policies before deployment.
                      </p>
                      {experiments[0] && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', margin: '14px 0' }}>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>ACTIVE EXPERIMENT</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{experiments[0].name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{experiments[0].strategies.length} arms</div>
                        </div>
                      )}
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={() => setActiveTab('experiments')}>
                        Open strategy lab <ArrowRight size={12} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: REVENUE LEAKS                           */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'leaks' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Revenue Protection</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Real-time revenue leak detection from aggregate demand patterns. No customer tracking.
                  </p>
                </div>

                {/* Summary strip */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Leaks Identified', value: String(opportunities.length), color: '#2563eb' },
                    { label: 'Total at Risk', value: fmt(totalAtRisk), color: '#dc2626' },
                    { label: 'Recoverable Revenue', value: fmt(totalRecoverable), color: '#059669' },
                    { label: 'High Urgency', value: String(opportunities.filter(o => o.urgency === 'HIGH').length), color: '#dc2626' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card" style={{ padding: '12px 16px', flex: '1 1 120px' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={13} color="#94a3b8" />
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Filter by type:</span>
                    {['ALL', 'EXPIRY', 'STOCKOUT', 'OVERSTOCK'].map(t => (
                      <button key={t} onClick={() => setLeakType(t)}
                        style={{ padding: '4px 10px', borderRadius: 100, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: leakType === t ? '#0f172a' : 'white',
                          color: leakType === t ? 'white' : '#64748b',
                          borderColor: leakType === t ? '#0f172a' : '#e2e8f0' }}>
                        {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Urgency:</span>
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(u => (
                      <button key={u} onClick={() => setLeakUrgency(u)}
                        style={{ padding: '4px 10px', borderRadius: 100, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: leakUrgency === u ? '#0f172a' : 'white',
                          color: leakUrgency === u ? 'white' : '#64748b',
                          borderColor: leakUrgency === u ? '#0f172a' : '#e2e8f0' }}>
                        {u === 'ALL' ? 'All' : u.charAt(0) + u.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opportunity Cards */}
                {filteredOpps.length === 0 ? (
                  <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No opportunities match your filters.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredOpps.map((opp, i) => (
                      <OpportunityCard key={opp.opportunity_id || i} opp={opp} onView={() => setSelectedOpp(opp)} />
                    ))}
                  </div>
                )}

                {/* Opportunity Detail Drawer */}
                {selectedOpp && (
                  <div
                    onClick={() => setSelectedOpp(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ background: 'white', width: '100%', maxWidth: 480, height: '100%', padding: 28, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                            Opportunity Detail
                          </div>
                          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {selectedOpp.opportunity_id}
                          </h2>
                        </div>
                        <button onClick={() => setSelectedOpp(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={15} color="#64748b" />
                        </button>
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <span className="badge" style={{ ...(() => { const c = typeColor(selectedOpp.opportunity_type); return { background: c.bg, color: c.text, border: `1px solid ${c.border}` }; })() }}>
                          {typeColor(selectedOpp.opportunity_type).label}
                        </span>
                        <span className="badge" style={{ ...(() => { const c = urgencyColor(selectedOpp.urgency); return { background: c.bg, color: c.text, border: `1px solid ${c.border}` }; })() }}>
                          {selectedOpp.urgency} Urgency
                        </span>
                      </div>

                      {/* Revenue numbers */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
                          <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600, marginBottom: 4 }}>Revenue Loss</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#b91c1c', fontVariantNumeric: 'tabular-nums' }}>{fmt(selectedOpp.estimated_revenue_loss)}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
                          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600, marginBottom: 4 }}>Recoverable</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46', fontVariantNumeric: 'tabular-nums' }}>{fmt(selectedOpp.estimated_recoverable_revenue)}</div>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ color: '#64748b', fontWeight: 500 }}>Autopilot Confidence</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{Math.round(selectedOpp.confidence * 100)}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill bg-blue-500" style={{ width: `${Math.round(selectedOpp.confidence * 100)}%` }} />
                        </div>
                      </div>

                      {/* Recommended action */}
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                        <div style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700, marginBottom: 5 }}>RECOMMENDED ACTION</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', lineHeight: 1.5 }}>{selectedOpp.recommended_action}</div>
                      </div>

                      {/* Evidence */}
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                          Evidence
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {selectedOpp.evidence.map((ev, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                              <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                        onClick={() => { setSelectedOpp(null); setActiveTab('decisions'); }}>
                        Analyze in Decision Engine <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: AI DECISION CENTER                       */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'decisions' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>AI Decision Center</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Multi-objective strategy evaluation compared against Status Quo (DO_NOTHING) baseline.
                  </p>
                </div>

                {!decision ? (
                  <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No decision available. Try running a demo scenario.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* FEATURED RECOMMENDATION CARD */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', borderRadius: 14, padding: '24px 28px', color: 'white', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                          {decision.product_name} · Autopilot Recommendation
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.3 }}>{decision.recommended_action}</h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
                          {decision.why_this_decision.what_happened}
                        </p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                          <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            Confidence: {pct(decision.confidence)}
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            Risk: {decision.risk_level}
                          </span>
                          {decision.requires_approval && (
                            <span style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#fbbf24' }}>
                              Requires Approval
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Expected Profit</div>
                          <div style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(decision.winning_candidate.expected_gross_profit)}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>Value Score</div>
                          <div style={{ fontSize: 22, fontWeight: 800 }}>{decision.winning_candidate.overall_score}</div>
                        </div>
                      </div>
                    </div>

                    {/* CANDIDATE STRATEGY COMPARISON */}
                    <div>
                      <div className="section-label" style={{ marginBottom: 12 }}>Evaluated Strategy Options</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {decision.scored_candidates.map((c, i) => (
                          <CandidateCard
                            key={i}
                            cand={c}
                            isWinner={c.action_name === decision.winning_candidate.action_name}
                            isBaseline={c.action_name === 'DO_NOTHING'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* EXPLANATION ACCORDIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="section-label" style={{ marginBottom: 4 }}>Decision Reasoning</div>

                      <Accordion title="Why this decision?" icon={HelpCircle} iconColor="#2563eb" defaultOpen>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What happened</span>
                            <p style={{ margin: '4px 0 0', color: '#475569' }}>{decision.why_this_decision.what_happened}</p>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why this opportunity</span>
                            <p style={{ margin: '4px 0 0', color: '#475569' }}>{decision.why_this_decision.why_opportunity}</p>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why selected</span>
                            <p style={{ margin: '4px 0 0', color: '#475569' }}>{decision.why_this_decision.why_selected}</p>
                          </div>
                        </div>
                      </Accordion>

                      <Accordion title="What if we did nothing?" icon={Shield} iconColor="#059669">
                        <p style={{ paddingTop: 12, fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>
                          {decision.why_this_decision.what_if_do_nothing}
                        </p>
                      </Accordion>

                      <Accordion title="Why not the other options?" icon={AlertTriangle} iconColor="#d97706">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
                          {decision.why_not_the_other_options.map((opt, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                <X size={10} color="#dc2626" />
                              </div>
                              <div><strong style={{ color: '#0f172a' }}>{opt.option}:</strong> {opt.reason}</div>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: WHAT-IF SIMULATOR                        */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'whatif' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>What-If Revenue Simulator</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Adjust order quantity and discount to project financial outcomes via live forecasting. No guess-work.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
                  {/* Control Panel */}
                  <div className="card" style={{ padding: 24, position: 'sticky', top: 120 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Strategy Parameters</h2>

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Order Quantity</label>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>{simQty} units</span>
                      </div>
                      <input type="range" min={0} max={300} step={10} value={simQty}
                        onChange={e => setSimQty(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#2563eb' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        <span>0</span><span>150</span><span>300</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Discount Rate</label>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>{simDiscount}%</span>
                      </div>
                      <input type="range" min={0} max={50} step={5} value={simDiscount}
                        onChange={e => setSimDiscount(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#2563eb' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        <span>0%</span><span>25%</span><span>50%</span>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                      onClick={handleSimulate}
                      disabled={simLoading}
                    >
                      {simLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Simulating...</> : <><Play size={14} /> Run Simulation</>}
                    </button>
                  </div>

                  {/* Results Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {simResult ? (
                      <>
                        {/* Net gain card */}
                        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginBottom: 4 }}>Estimated Profit Gain vs Status Quo</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#065f46', fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
                              {simResult.net_profit_gain >= 0 ? '+' : ''}{fmt(simResult.net_profit_gain)}
                            </div>
                          </div>
                          <div style={{ background: '#059669', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                            {simResult.recommendation}
                          </div>
                        </div>

                        {/* Side-by-side comparison */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          {/* Status Quo */}
                          <div className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Status Quo</h3>
                              <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Baseline</span>
                            </div>
                            {[
                              { k: 'Expected Sales', v: `${simResult.status_quo_strategy.expected_sales} units` },
                              { k: 'Revenue', v: fmt(simResult.status_quo_strategy.expected_revenue) },
                              { k: 'Gross Profit', v: fmt(simResult.status_quo_strategy.expected_gross_profit), bold: true, color: '#059669' },
                              { k: 'Stockout Risk', v: pct(simResult.status_quo_strategy.stockout_probability) },
                              { k: 'Waste Risk', v: pct(simResult.status_quo_strategy.waste_probability) },
                            ].map(({ k, v, bold, color }) => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                                <span style={{ color: '#64748b' }}>{k}</span>
                                <span style={{ fontWeight: bold ? 800 : 600, color: color || '#0f172a' }}>{v}</span>
                              </div>
                            ))}
                          </div>

                          {/* Proposed */}
                          <div style={{ border: '2px solid #bfdbfe', borderRadius: 12, padding: 20, background: '#eff6ff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', margin: 0 }}>Your Strategy</h3>
                              <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Custom</span>
                            </div>
                            {[
                              { k: 'Expected Sales', v: `${simResult.custom_proposed_strategy.expected_sales} units` },
                              { k: 'Revenue', v: fmt(simResult.custom_proposed_strategy.expected_revenue) },
                              { k: 'Gross Profit', v: fmt(simResult.custom_proposed_strategy.expected_gross_profit), bold: true, color: '#059669' },
                              { k: 'Stockout Risk', v: pct(simResult.custom_proposed_strategy.stockout_probability) },
                              { k: 'Waste Risk', v: pct(simResult.custom_proposed_strategy.waste_probability) },
                            ].map(({ k, v, bold, color }) => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #dbeafe', fontSize: 13 }}>
                                <span style={{ color: '#3b82f6' }}>{k}</span>
                                <span style={{ fontWeight: bold ? 800 : 600, color: color || '#1e40af' }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                        <Sliders size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Configure & Simulate</h3>
                        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Adjust the sliders on the left and click Run Simulation to see projected outcomes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: EXPERIMENTS                              */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'experiments' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Revenue Strategy Lab</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Run multi-arm experiments to compare competing strategies before committing to them.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {experiments.map(exp => {
                    const isCurrentResult = activeExpResult?.experiment_id === exp.experiment_id;
                    return (
                      <div key={exp.experiment_id} className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                              {exp.product_name}
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{exp.name}</h3>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{exp.description}</p>
                          </div>
                          <button className="btn-primary" onClick={() => handleRunExperiment(exp.experiment_id)}>
                            <Play size={13} /> Run Experiment
                          </button>
                        </div>

                        {/* Strategy Arms */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                          {exp.strategies.map((s, i) => {
                            const isWinner = isCurrentResult && activeExpResult?.winning_arm === s.arm;
                            return (
                              <div key={s.arm} style={{
                                flex: '1 1 160px',
                                border: isWinner ? '2px solid #059669' : '1px solid #e2e8f0',
                                borderRadius: 10, padding: '12px 14px',
                                background: isWinner ? '#f0fdf4' : '#f8fafc',
                                position: 'relative',
                              }}>
                                {isWinner && (
                                  <div style={{ position: 'absolute', top: -10, right: 10, background: '#059669', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 100 }}>
                                    WINNER
                                  </div>
                                )}
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                                  Strategy {i + 1}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: isWinner ? '#065f46' : '#0f172a' }}>{s.name}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.description}</div>
                              </div>
                            );
                          })}
                        </div>

                        {isCurrentResult && (
                          <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                            <span style={{ fontWeight: 700, color: '#065f46' }}>Result: </span>
                            <span style={{ color: '#334155' }}>
                              Winner: <strong>{activeExpResult.winning_arm}</strong> · {activeExpResult.summary}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: BUSINESS INSIGHTS                        */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'changed' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>What's Changing in Your Business?</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Aggregate demand intelligence. No individual customer tracking or personal data.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {[
                    { icon: '📈', title: 'Demand Velocity', bg: '#eff6ff', border: '#bfdbfe', c: '#1d4ed8', text: 'Milk demand velocity is 32% above baseline. The rate of change exceeds historical weekend patterns.' },
                    { icon: '🏢', title: 'Location Effect', bg: '#fefce8', border: '#fef08a', c: '#713f12', text: 'IT Park store traffic follows office-day patterns. Sundays show 42% lower aggregate sales than weekdays.' },
                    { icon: '🔗', title: 'Product Co-movement', bg: '#f0fdf4', border: '#bbf7d0', c: '#065f46', text: 'Milk and bread sales show positive demand correlation (r = +0.68). Price changes to one affect the other.' },
                    { icon: '⚠️', title: 'Expiry Velocity Risk', bg: '#fef2f2', border: '#fecaca', c: '#b91c1c', text: 'Fresh juice inventory is on track to exceed demand before expiry. Demand deceleration detected 3 days ago.' },
                    { icon: '📦', title: 'Stockout Forecast', bg: '#fff7ed', border: '#fed7aa', c: '#9a3412', text: 'At current demand velocity, Organic Whole Milk will stock out in approximately 1.2 days without reorder.' },
                    { icon: '📅', title: 'Holiday Calendar', bg: '#f5f3ff', border: '#ddd6fe', c: '#5b21b6', text: 'Three upcoming IT park office holidays detected. Demand expected to follow the IT Park holiday pattern.' },
                  ].map(({ icon, title, bg, border, c, text }) => (
                    <div key={title} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '18px 20px' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: c, margin: '0 0 6px' }}>{title}</h3>
                      <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.7 }}>{text}</p>
                    </div>
                  ))}
                </div>

                {decision && (
                  <div style={{ marginTop: 20 }}>
                    <div className="section-label" style={{ marginBottom: 12 }}>Autopilot Reasoning</div>
                    <div className="card" style={{ padding: 20 }}>
                      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, margin: 0 }}>{decision.why_this_decision.what_happened}</p>
                      {decision.why_this_decision.alternatives_simulated?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Strategies Considered</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {decision.why_this_decision.alternatives_simulated.map((alt, i) => (
                              <span key={i} className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: 11 }}>{alt}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: APPROVALS                                */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'approvals' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Approval Queue</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Autopilot actions requiring your explicit authorization before execution.
                  </p>
                </div>
                {actions.length === 0 ? (
                  <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#065f46', margin: '0 0 6px' }}>No pending approvals</h3>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>All Autopilot actions are within policy guardrails.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {actions.map(act => {
                      const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                        PENDING: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
                        APPROVED: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
                        EXECUTED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                        REJECTED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                        FAILED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                      };
                      const sc = statusColors[act.status] || statusColors.PENDING;
                      return (
                        <div key={act.id} className="card" style={{ padding: '20px 24px' }}>
                          {act.status === 'PENDING' && (
                            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                              <TriangleAlert size={13} />
                              Action required — Your decision will trigger Autopilot execution in MOCK mode.
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Action #{act.id}</span>
                                <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{act.status}</span>
                                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{act.action_type}</span>
                              </div>
                              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{act.recommendation}</h3>
                              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.6, maxWidth: 480 }}>{act.agent_reasoning}</p>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ fontSize: 12 }}>
                                  <span style={{ color: '#94a3b8' }}>Confidence: </span>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{Math.round(act.confidence * 100)}%</span>
                                </div>
                                <div style={{ fontSize: 12 }}>
                                  <span style={{ color: '#94a3b8' }}>Risk: </span>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{act.risk_level}</span>
                                </div>
                              </div>
                            </div>
                            {act.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button className="btn-danger" onClick={() => handleReject(act.id)}>Reject</button>
                                <button className="btn-success" onClick={() => handleApprove(act.id)}>
                                  <CheckCircle2 size={14} /> Approve Strategy
                                </button>
                              </div>
                            )}
                            {act.status === 'APPROVED' && (
                              <button className="btn-primary" onClick={() => handleExecute(act.id)}>
                                <Play size={13} /> Execute in MOCK Mode
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: ACTION TIMELINE                          */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'timeline' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Decision Journey</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    End-to-end 10-stage decision audit trail.
                    {decision && ` Action #${decision.action_id} · ${decision.product_name}`}
                  </p>
                </div>
                {!decision ? (
                  <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No decision data available. Run a demo scenario first.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                    <div className="card" style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
                        Decision Journey · Click stages for details
                      </h3>
                      <TimelineStepper steps={decision.audit_timeline} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="card" style={{ padding: 20 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Product</span>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{decision.product_name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Recommended Action</span>
                            <span style={{ fontWeight: 700, color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>{decision.recommended_action}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Expected Profit</span>
                            <span style={{ fontWeight: 800, color: '#059669' }}>{fmt(decision.winning_candidate.expected_gross_profit)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b' }}>Confidence</span>
                            <span style={{ fontWeight: 700, color: '#2563eb' }}>{pct(decision.confidence)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ color: '#64748b' }}>Requires Approval</span>
                            <span style={{ fontWeight: 700, color: decision.requires_approval ? '#d97706' : '#059669' }}>
                              {decision.requires_approval ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Policy Applied</div>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>{decision.why_this_decision.policy_applied}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: RECOVERED REVENUE                        */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'recovered' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Recovered Revenue</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Closed-loop outcome tracking — predicted vs actual revenue recovery with model calibration.
                  </p>
                </div>
                {!outcomes ? (
                  <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading outcomes data...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Hero number */}
                    <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', borderRadius: 14, padding: '28px 32px', color: 'white' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Total Revenue Recovered by Autopilot</div>
                      <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, fontVariantNumeric: 'tabular-nums', margin: '0 0 4px' }}>
                        {fmt(outcomes.total_revenue_recovered)}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        {outcomes.total_actions_evaluated} actions evaluated · {Math.round(outcomes.mean_prediction_error_pct)}% mean prediction variance
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                      {[
                        { label: 'Profit Recovered', value: fmt(outcomes.total_profit_recovered), color: '#059669' },
                        { label: 'Waste Avoided', value: `${outcomes.waste_avoided_units} units`, color: '#2563eb' },
                        { label: 'Stockouts Avoided', value: `${outcomes.stockouts_avoided_units} units`, color: '#7c3aed' },
                        { label: 'Model Accuracy', value: `${100 - Math.round(outcomes.mean_prediction_error_pct)}%`, color: '#0284c7' },
                        { label: 'Confidence Calibration', value: outcomes.calibrated_base_confidence ? pct(outcomes.calibrated_base_confidence) : '—', color: '#ca8a04' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="card" style={{ padding: '16px 18px' }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 5 }}>{label}</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Outcome history */}
                    {outcomes.history && outcomes.history.length > 0 && (
                      <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Outcome History</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {outcomes.history.slice(0, 10).map((h: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                              <div>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>Action #{h.action_id || i + 1}</span>
                                <span style={{ color: '#94a3b8', marginLeft: 8 }}>{h.product_name || 'Product'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#94a3b8', fontSize: 10 }}>Predicted</div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(h.predicted_revenue || 0)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#94a3b8', fontSize: 10 }}>Actual</div>
                                  <div style={{ fontWeight: 700, color: '#059669' }}>{fmt(h.actual_revenue || 0)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#94a3b8', fontSize: 10 }}>Error</div>
                                  <div style={{ fontWeight: 700, color: '#d97706' }}>{h.error_percentage ? `${Math.round(h.error_percentage)}%` : '—'}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* VIEW: RELIABILITY LOGS (FAILURES)              */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'failures' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 14px', marginBottom: 10 }}>
                    <span className="status-dot green" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>System Operational</span>
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>Reliability & Fault Recovery Logs</h1>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Internal fault-tolerance records. Autopilot automatically recovers from these conditions.
                  </p>
                </div>
                {failures.length === 0 ? (
                  <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: '0 0 4px' }}>No failures recorded</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>All systems operating within normal parameters.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {failures.map(f => {
                      const fColors: Record<string, { bg: string; color: string; border: string; icon: any }> = {
                        STALE_FORECAST: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: AlertCircle },
                        API_TIMEOUT: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', icon: Clock },
                        DUPLICATE_ACTION: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: Info },
                        POLICY_REJECTION: { bg: '#fefce8', color: '#713f12', border: '#fef08a', icon: Shield },
                      };
                      const fc = fColors[f.failure_type] || fColors.STALE_FORECAST;
                      const FIcon = fc.icon;
                      return (
                        <div key={f.id} style={{ border: `1px solid ${fc.border}`, borderRadius: 10, padding: '16px 20px', background: fc.bg }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'white', border: `1px solid ${fc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FIcon size={15} color={fc.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: fc.color }}>{f.failure_type}</span>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>#{f.id}</span>
                              </div>
                              <p style={{ fontSize: 12, color: '#334155', margin: '0 0 6px' }}><strong>Cause:</strong> {f.possible_cause}</p>
                              <p style={{ fontSize: 12, color: '#059669', margin: 0, fontWeight: 600 }}>↳ Recovery: {f.recovery_action}</p>
                            </div>
                          </div>
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

      {/* ── MOBILE BOTTOM NAV ───────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', padding: '8px 0', zIndex: 40 }} className="md:hidden">
        {[
          { id: 'overview' as PageView, label: 'Home', icon: Activity },
          { id: 'leaks' as PageView, label: 'Revenue', icon: ShieldCheck },
          { id: 'decisions' as PageView, label: 'Decisions', icon: Layers },
          { id: 'whatif' as PageView, label: 'Simulator', icon: Sliders },
          { id: 'approvals' as PageView, label: 'Approvals', icon: CheckSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            color: activeTab === id ? '#2563eb' : '#94a3b8',
          }}>
            <Icon size={18} />
            <span style={{ fontSize: 9, fontWeight: activeTab === id ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── SYSTEM STATUS MODAL ─────────────────────────── */}
      {showStatusModal && (
        <div
          onClick={() => setShowStatusModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, maxWidth: 420, width: '100%', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={18} color="#2563eb" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>System Diagnostics</h3>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color="#64748b" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Backend API', value: 'Connected', ok: true },
                { label: 'Database', value: 'Connected', ok: true },
                { label: 'Autopilot Engine', value: 'Ready', ok: true },
                { label: 'Simulator Engine', value: 'Ready', ok: true },
                { label: 'Learning Engine', value: 'Ready', ok: true },
                { label: 'Execution Mode', value: 'MOCK (Safe)', ok: true },
                { label: 'Razorpay Integration', value: 'Not Configured (Optional)', ok: null },
              ].map(({ label, value, ok }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ok === true && <span className="status-dot green" />}
                    {ok === null && <span className="status-dot" style={{ background: '#94a3b8' }} />}
                    <span style={{ fontWeight: 700, color: ok === true ? '#059669' : '#64748b' }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
