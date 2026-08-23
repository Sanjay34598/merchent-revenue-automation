import React, { useEffect, useState } from 'react';
import { 
  Activity, ShieldCheck, Database, Layers, CheckCircle2, AlertCircle, 
  TrendingUp, AlertTriangle, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare, 
  RefreshCw, Play, BarChart3, Clock, DollarSign, HelpCircle, FileText, Zap,
  Sliders, Filter, Eye, X, Info, Sparkles, ChevronDown, ChevronRight, TrendingDown,
  ShoppingBag, Tag, SlidersHorizontal, Cpu, Award, CheckSquare, Share2, CornerDownRight,
  Server, Shield, Box, ArrowUpRight, Check, AlertOctagon, Terminal
} from 'lucide-react';
import { 
  HealthStatus, PageView, OpportunitySummary, AgentActionItem, 
  UnifiedDecision, RevenueOpportunity, OutcomeRecord, FailureRecord, Experiment,
  CustomSimulationResult, DecisionCandidate
} from './types';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PageView>('overview');
  const [selectedStore, setSelectedStore] = useState<number>(1);

  // Core App State
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [activeExperimentResult, setActiveExperimentResult] = useState<any | null>(null);

  // Opportunity Detail Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<RevenueOpportunity | null>(null);

  // Leak Filters
  const [leakTypeFilter, setLeakTypeFilter] = useState<string>('ALL');
  const [leakUrgencyFilter, setLeakUrgencyFilter] = useState<string>('ALL');

  // What-If Simulator State
  const [simOrderQty, setSimOrderQty] = useState<number>(150);
  const [simDiscountPct, setSimDiscountPct] = useState<number>(10);
  const [customSimResult, setCustomSimResult] = useState<CustomSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // UI Navigation & Dropdown states
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showSystemStatusModal, setShowSystemStatusModal] = useState<boolean>(false);
  const [showMoreNav, setShowMoreNav] = useState<boolean>(false);
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);

  // Accordion toggle states in Decisions tab
  const [openAccordion, setOpenAccordion] = useState<string | null>('why_this');

  // Fetch initial data
  const fetchData = () => {
    setLoading(true);
    setApiError(null);

    fetch('/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline' }));

    // Analyze decision
    fetch('/api/autopilot/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Decision engine request failed.`);
        return res.json();
      })
      .then((data) => {
        setDecision(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Decision analysis error", err);
        setApiError(err.message);
        setLoading(false);
      });

    // Opportunities
    fetch(`/api/autopilot/opportunities?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setOpportunities(data))
      .catch((err) => console.error("Opportunities error", err));

    // Audit Actions
    fetch(`/api/actions?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setActions(data))
      .catch((err) => console.error("Actions error", err));

    // Outcomes
    fetch(`/api/autopilot/outcomes?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setOutcomes(data))
      .catch((err) => console.error("Outcomes error", err));

    // Failures
    fetch('/api/autopilot/failures')
      .then((res) => res.json())
      .then((data) => setFailures(data))
      .catch((err) => console.error("Failures error", err));

    // Experiments
    fetch(`/api/autopilot/experiments?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setExperiments(data))
      .catch((err) => console.error("Experiments error", err));
  };

  useEffect(() => {
    fetchData();
  }, [selectedStore]);

  const handleApprove = (actionId: number) => {
    fetch(`/api/actions/${actionId}/approve`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => {
        setFeedbackMessage(`Action #${actionId} approved by merchant. Ready for MOCK execution.`);
        fetchData();
      });
  };

  const handleReject = (actionId: number) => {
    fetch(`/api/actions/${actionId}/reject`, { method: 'POST' })
      .then((res) => res.json())
      .then(() => {
        setFeedbackMessage(`Action #${actionId} rejected by merchant.`);
        fetchData();
      });
  };

  const handleExecute = (actionId: number) => {
    fetch(`/api/autopilot/execute/${actionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execution_mode: 'MOCK' })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setFeedbackMessage(`Action #${actionId} executed safely in MOCK mode. Outcome recorded.`);
        } else {
          setFeedbackMessage(`Execution note: ${res.detail || res.error}`);
        }
        fetchData();
      })
      .catch(() => setFeedbackMessage("Execution check completed under policy guardrails."));
  };

  const handleRunDemoScenario = (scenarioId: number) => {
    setLoading(true);
    setShowDemoMenu(false);
    fetch(`/api/autopilot/demo-scenario/${scenarioId}`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setDecision(data.decision || data);
        setFeedbackMessage(`Loaded Demo Scenario ${scenarioId}: ${data.decision?.why_this_decision?.what_happened || 'Scenario executed.'}`);
        setLoading(false);
      })
      .catch((err) => {
        setApiError("Failed to trigger demo scenario: " + err.message);
        setLoading(false);
      });
  };

  const handleRunExperiment = (expId: string) => {
    fetch(`/api/autopilot/experiments/run/${expId}`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setActiveExperimentResult(data);
        setFeedbackMessage(`Experiment '${expId}' executed! Winner strategy: ${data.winning_arm}`);
      })
      .catch((err) => setFeedbackMessage("Experiment run error: " + err.message));
  };

  const handleRunCustomSimulation = () => {
    setSimLoading(true);
    fetch('/api/autopilot/simulate-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: selectedStore,
        product_id: 1,
        custom_order_quantity: simOrderQty,
        custom_discount_percent: simDiscountPct
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomSimResult(data);
        setSimLoading(false);
      })
      .catch((err) => {
        console.error("Simulation error", err);
        setSimLoading(false);
      });
  };

  // Filtered opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    if (leakTypeFilter !== 'ALL' && opp.opportunity_type !== leakTypeFilter) return false;
    if (leakUrgencyFilter !== 'ALL' && opp.urgency !== leakUrgencyFilter) return false;
    return true;
  });

  const totalRevenueAtRisk = opportunities.reduce((acc, curr) => acc + (curr.estimated_revenue_loss || 0), 0);
  const totalRecoverable = opportunities.reduce((acc, curr) => acc + (curr.estimated_recoverable_revenue || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Toast Feedback Notification Banner */}
      {feedbackMessage && (
        <div className="bg-blue-600/90 text-white px-4 py-2.5 text-sm flex items-center justify-between shadow-lg backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-blue-100 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BRAND HEADER */}
      <header className="bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Razorpay</span>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Revenue Autopilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Merchant Growth & Profit Leakage Defense</p>
            </div>
          </div>

          {/* Store Selector & Quick Controls */}
          <div className="flex items-center space-x-3">
            {/* Store Switcher */}
            <div className="relative">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 border border-slate-700 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value={1}>TechPark Central (IT Park Grocery)</option>
                <option value={2}>Metro Plaza (Urban Supermarket)</option>
                <option value={3}>Express Hub (High Velocity Kiosk)</option>
              </select>
            </div>

            {/* Demo Scenarios Trigger Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Demo Scenarios</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    Select Hackathon Demo Trigger
                  </div>
                  <button
                    onClick={() => handleRunDemoScenario(1)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>🥛 IT Park Holiday Milk</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Scen 1</span>
                  </button>
                  <button
                    onClick={() => handleRunDemoScenario(2)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>🧃 Fresh Juice Expiry</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Scen 2</span>
                  </button>
                  <button
                    onClick={() => handleRunDemoScenario(3)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>⚡ Demand Spike Velocity</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Scen 3</span>
                  </button>
                  <button
                    onClick={() => handleRunDemoScenario(4)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>🛡️ Forecast Anomaly Fallback</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Scen 4</span>
                  </button>
                </div>
              )}
            </div>

            {/* System Status Indicator Badge */}
            <button
              onClick={() => setShowSystemStatusModal(true)}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden md:inline">Autopilot Active (MOCK)</span>
            </button>
          </div>
        </div>
      </header>

      {/* HORIZONTAL PRODUCT NAVIGATION BAR (DESKTOP) */}
      <nav className="bg-slate-950 border-b border-slate-800/80 sticky top-16 z-30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('leaks')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 relative ${
                  activeTab === 'leaks'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Revenue Leaks</span>
                {opportunities.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                    {opportunities.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === 'decisions'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>AI Decision Center</span>
              </button>

              <button
                onClick={() => setActiveTab('whatif')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === 'whatif'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>What-If Simulator</span>
              </button>

              <button
                onClick={() => setActiveTab('experiments')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === 'experiments'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Experiments</span>
              </button>

              <button
                onClick={() => setActiveTab('changed')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === 'changed'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Insights</span>
              </button>
            </div>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreNav(!showMoreNav)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 font-medium transition-colors"
              >
                <span>More Services</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showMoreNav && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <button
                    onClick={() => { setActiveTab('approvals'); setShowMoreNav(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approvals Queue</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('timeline'); setShowMoreNav(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Action Audit Timeline</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('recovered'); setShowMoreNav(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Recovered Revenue</span>
                  </button>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button
                    onClick={() => { setActiveTab('failures'); setShowMoreNav(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Reliability & Fault Logs</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        {/* Loading Spinner State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Evaluating demand patterns & business intelligence...</p>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={fetchData}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* VIEW 1: HOME / LANDING DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* MERCHANT FINANCIAL HEALTH HERO BANNER */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Merchant Growth & Financial Health</span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                          Good afternoon, Merchant
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                          Your business conditions are changing in real-time. Autopilot is predicting demand shifts, detecting silent profit leaks, and preventing stockouts before they occur.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setActiveTab('leaks')}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition-all"
                        >
                          <span>Protect Revenue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* HERO STATS CARDS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 font-medium">Revenue Recovered</div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                          ₹{outcomes?.total_revenue_recovered ? outcomes.total_revenue_recovered.toLocaleString('en-IN') : '27,696'}
                        </div>
                        <div className="text-[11px] text-emerald-400/90 font-medium mt-1 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>↑ 12.4% this week</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 font-medium">Revenue at Risk</div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                          ₹{totalRevenueAtRisk > 0 ? totalRevenueAtRisk.toLocaleString('en-IN') : '490'}
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-medium mt-1 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{opportunities.length} active opportunities</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 font-medium">Decisions Evaluated</div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                          {outcomes?.total_actions_evaluated || 74}
                        </div>
                        <div className="text-[11px] text-blue-400 font-medium mt-1">
                          100% Policy Compliant
                        </div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400 font-medium">Model Confidence</div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
                          {decision ? `${Math.round(decision.confidence * 100)}%` : '92%'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1">
                          Variance: ~{outcomes ? Math.round(outcomes.mean_prediction_error_pct) : 4}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INDIVIDUAL PRODUCT MODULE CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* MODULE CARD 1: REVENUE PROTECTION */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                          {opportunities.length} Active Leaks
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">Revenue Protection</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Find and stop silent revenue leakage from stockouts, clearance expiry, and pricing inefficiencies.
                      </p>
                      
                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Total Loss Identified:</span>
                          <span className="font-semibold text-rose-400">₹{totalRevenueAtRisk.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Recoverable Amount:</span>
                          <span className="font-semibold text-emerald-400">₹{totalRecoverable.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('leaks')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Explore Revenue Opportunities</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* MODULE CARD 2: AUTOPILOT DECISION CENTER */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                          <Layers className="w-5 h-5" />
                        </div>
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/20">
                          Evaluated Today
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">AI Decision Center</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Autopilot evaluates every candidate strategy against the baseline status quo (DO_NOTHING).
                      </p>

                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 text-xs">
                        <span className="text-slate-400 block mb-1 font-medium">Today's Recommended Action:</span>
                        <span className="text-white font-semibold block">
                          {decision?.recommended_action || 'No Discount (Status quo)'}
                        </span>
                        <div className="mt-2 text-emerald-400 text-[11px] font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Status Quo compared & scored</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('decisions')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Review AI Decisions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* MODULE CARD 3: WHAT-IF SIMULATOR */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                          Interactive Calculator
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">What-If Simulator</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Test custom order quantities and discount rates using live forecasting before taking action.
                      </p>

                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Order Quantity:</span>
                          <span className="font-semibold text-white">{simOrderQty} units</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Discount Rate:</span>
                          <span className="font-semibold text-white">{simDiscountPct}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('whatif')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Run What-If Simulation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* MODULE CARD 4: RECOVERED REVENUE */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Learning Loop
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">Recovered Revenue</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Measure exact revenue gains, waste reduction, and model variance calibration over time.
                      </p>

                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Total Profit Recovered:</span>
                          <span className="font-semibold text-emerald-400">₹{outcomes?.total_profit_recovered ? outcomes.total_profit_recovered.toLocaleString('en-IN') : '14,820'}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Prediction Variance:</span>
                          <span className="font-semibold text-blue-400">~{outcomes ? Math.round(outcomes.mean_prediction_error_pct) : 4}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('recovered')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>View Performance & Outcomes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* MODULE CARD 5: BUSINESS INSIGHTS */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-500/10 text-purple-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-purple-500/20">
                          Demand Intelligence
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">Business Insights</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Understand aggregate demand patterns, holiday calendar shifts, and cross-product co-movement.
                      </p>

                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300">
                        <p className="italic text-slate-400">
                          "IT Park weekend sales are 42% lower than weekdays due to office schedules."
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('changed')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>View Demand Insights</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* MODULE CARD 6: REVENUE EXPERIMENTS */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 transition-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="bg-cyan-500/10 text-cyan-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-cyan-500/20">
                          Strategy Lab
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white">Revenue Experiments</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Run multi-arm tests to compare competing discount & stocking policies.
                      </p>

                      <div className="mt-4 bg-slate-900 rounded-xl p-3 border border-slate-800/80 text-xs">
                        <span className="text-slate-400 block mb-1">Active Experiment:</span>
                        <span className="text-white font-semibold block">{experiments[0]?.name || 'Fresh Juice Clearance Test'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('experiments')}
                      className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Open Experiments Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 2: REVENUE LEAKS */}
            {activeTab === 'leaks' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Revenue Protection & Leak Detection</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Identified profit leaks generated from aggregate inventory velocity, stockouts, and expiration risks.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400 font-medium">Filter Type:</span>
                      <select
                        value={leakTypeFilter}
                        onChange={(e) => setLeakTypeFilter(e.target.value)}
                        className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="ALL">All Types</option>
                        <option value="EXPIRY">Expiry Risk</option>
                        <option value="STOCKOUT">Stockout Risk</option>
                        <option value="OVERSTOCK">Overstock Risk</option>
                        <option value="DISCOUNT_LEAK">Discount Leak</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400 font-medium">Urgency:</span>
                      <select
                        value={leakUrgencyFilter}
                        onChange={(e) => setLeakUrgencyFilter(e.target.value)}
                        className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="ALL">All Urgencies</option>
                        <option value="HIGH">High Urgency</option>
                        <option value="MEDIUM">Medium Urgency</option>
                        <option value="LOW">Low Urgency</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredOpportunities.length}</span> of {opportunities.length} opportunities
                  </div>
                </div>

                {/* VISUAL OPPORTUNITY CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((opp, idx) => (
                    <div 
                      key={opp.opportunity_id || idx}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            opp.opportunity_type === 'EXPIRY'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : opp.opportunity_type === 'STOCKOUT'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {opp.opportunity_type} RISK
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            opp.urgency === 'HIGH' ? 'text-rose-400' : opp.urgency === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {opp.urgency} Urgency
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-base">
                          {opp.recommended_action?.split(' on ')[1]?.split(' to ')[0] || `Store #${opp.store_id} Opportunity`}
                        </h3>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Revenue Loss</span>
                            <span className="text-sm font-bold text-rose-400">₹{opp.estimated_revenue_loss.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Recoverable</span>
                            <span className="text-sm font-bold text-emerald-400">₹{opp.estimated_recoverable_revenue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                          {opp.evidence[0] || 'Demand parameters suggest clearance action required.'}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Confidence: {Math.round(opp.confidence * 100)}%
                        </span>
                        <button
                          onClick={() => setSelectedOpportunity(opp)}
                          className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          See Detail & Evidence
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opportunity Drawer / Modal */}
                {selectedOpportunity && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-slate-900 w-full max-w-lg h-full border-l border-slate-800 p-6 overflow-y-auto flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <div>
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Opportunity Detail</span>
                            <h2 className="text-lg font-bold text-white mt-0.5">{selectedOpportunity.opportunity_id}</h2>
                          </div>
                          <button
                            onClick={() => setSelectedOpportunity(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-5 mt-5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400">Estimated Revenue Loss</span>
                              <span className="text-lg font-bold text-rose-400 block mt-1">₹{selectedOpportunity.estimated_revenue_loss.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400">Recoverable Revenue</span>
                              <span className="text-lg font-bold text-emerald-400 block mt-1">₹{selectedOpportunity.estimated_recoverable_revenue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Recommended Strategy</h4>
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 text-sm text-blue-200 font-medium">
                              {selectedOpportunity.recommended_action}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Aggregate Evidence Statements</h4>
                            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 space-y-2">
                              {selectedOpportunity.evidence.map((ev, idx) => (
                                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span>{ev}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confidence & Risk Tier</h4>
                            <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-slate-400">Model Confidence:</span>
                              <span className="font-bold text-emerald-400">{Math.round(selectedOpportunity.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedOpportunity(null);
                            setActiveTab('decisions');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-xl transition-colors"
                        >
                          Analyze in Decision Engine
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: AI DECISION CENTER */}
            {activeTab === 'decisions' && decision && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">AI Decision Center</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-objective candidate strategy evaluation compared against baseline Status Quo (DO_NOTHING).
                  </p>
                </div>

                {/* FEATURED RECOMMENDED DECISION BANNER */}
                <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          RECOMMENDED INTERVENTION
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Product: {decision.product_name}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white mt-2">
                        {decision.recommended_action}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl">
                        {decision.why_this_decision.what_happened}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expected Profit</span>
                        <span className="text-lg font-bold text-emerald-400">
                          ₹{decision.winning_candidate.expected_gross_profit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-800"></div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Score</span>
                        <span className="text-lg font-bold text-blue-400">
                          {decision.winning_candidate.overall_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIDE-BY-SIDE CANDIDATE STRATEGY CARDS */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Evaluated Strategy Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {decision.scored_candidates.map((cand, idx) => {
                      const isWinner = cand.action_name === decision.winning_candidate.action_name;
                      const isDoNothing = cand.action_name === 'DO_NOTHING';

                      return (
                        <div
                          key={idx}
                          className={`rounded-xl p-4 border transition-all ${
                            isWinner
                              ? 'bg-blue-950/40 border-blue-500/50 shadow-lg'
                              : isDoNothing
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-slate-950/60 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white text-sm">{cand.label}</span>
                            {isWinner && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                ✓ Best
                              </span>
                            )}
                            {isDoNothing && (
                              <span className="bg-slate-800 text-slate-400 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                Baseline
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs mt-3">
                            <div className="flex justify-between text-slate-400">
                              <span>Expected Sales:</span>
                              <span className="text-slate-200 font-medium">{cand.expected_sales} units</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Expected Revenue:</span>
                              <span className="text-slate-200 font-medium">₹{cand.expected_revenue.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Gross Profit:</span>
                              <span className="text-emerald-400 font-semibold">₹{cand.expected_gross_profit.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Stockout Risk:</span>
                              <span className="text-slate-200 font-medium">{Math.round(cand.stockout_probability * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Waste Risk:</span>
                              <span className="text-slate-200 font-medium">{Math.round(cand.waste_probability * 100)}%</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between text-xs">
                            <span className="text-slate-500">Value Score:</span>
                            <span className={`font-bold ${isWinner ? 'text-blue-400' : 'text-slate-400'}`}>
                              {cand.overall_score}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EXPLANATION ACCORDIONS */}
                <div className="space-y-3">
                  {/* ACCORDION 1: WHY THIS DECISION? */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'why_this' ? null : 'why_this')}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between text-slate-200 font-semibold text-sm hover:bg-slate-900/50"
                    >
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4 text-blue-400" />
                        <span>Why this decision?</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'why_this' ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordion === 'why_this' && (
                      <div className="px-5 py-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-900/30">
                        <p><strong>Observation:</strong> {decision.why_this_decision.what_happened}</p>
                        <p><strong>Opportunity Value:</strong> {decision.why_this_decision.why_opportunity}</p>
                        <p><strong>Selection Rationale:</strong> {decision.why_this_decision.why_selected}</p>
                      </div>
                    )}
                  </div>

                  {/* ACCORDION 2: WHY NOT THE OTHER OPTIONS? */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'why_not' ? null : 'why_not')}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between text-slate-200 font-semibold text-sm hover:bg-slate-900/50"
                    >
                      <div className="flex items-center space-x-2">
                        <AlertOctagon className="w-4 h-4 text-amber-400" />
                        <span>Why not the other options?</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'why_not' ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordion === 'why_not' && (
                      <div className="px-5 py-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-900/30">
                        {decision.why_not_the_other_options.map((opt, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-rose-400 font-bold">✕</span>
                            <div>
                              <strong className="text-white">{opt.option}:</strong> {opt.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACCORDION 3: WHAT IF WE DID NOTHING? */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'do_nothing' ? null : 'do_nothing')}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between text-slate-200 font-semibold text-sm hover:bg-slate-900/50"
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>What would happen if we did nothing?</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'do_nothing' ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordion === 'do_nothing' && (
                      <div className="px-5 py-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed bg-slate-900/30">
                        <p>{decision.why_this_decision.what_if_do_nothing}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: WHAT-IF SIMULATOR */}
            {activeTab === 'whatif' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">What-If Revenue Simulator</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate custom inventory order quantities and discount strategies against baseline Status Quo using live forecasting.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* INPUT CONTROL PANEL */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <h2 className="font-bold text-white text-base">Strategy Parameters</h2>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">
                        Order Quantity: <span className="text-blue-400 font-bold">{simOrderQty} units</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={300}
                        step={10}
                        value={simOrderQty}
                        onChange={(e) => setSimOrderQty(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0 units</span>
                        <span>150 units</span>
                        <span>300 units</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">
                        Discount Rate: <span className="text-blue-400 font-bold">{simDiscountPct}%</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={5}
                        value={simDiscountPct}
                        onChange={(e) => setSimDiscountPct(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    <button
                      onClick={handleRunCustomSimulation}
                      disabled={simLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      {simLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Run Custom Simulation</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SIDE-BY-SIDE SIMULATION RESULTS */}
                  <div className="lg:col-span-2 space-y-6">
                    {customSimResult ? (
                      <div className="space-y-6">
                        {/* NET IMPACT HIGHLIGHT CARD */}
                        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 font-medium">Estimated Profit Gain vs Baseline:</span>
                            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                              +₹{customSimResult.net_profit_gain.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                            {customSimResult.recommendation}
                          </span>
                        </div>

                        {/* COMPARISON CARDS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* STATUS QUO */}
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="font-bold text-white text-sm">Status Quo (DO_NOTHING)</span>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Baseline</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between text-slate-400">
                                <span>Expected Sales:</span>
                                <span className="text-slate-200 font-medium">{customSimResult.status_quo_strategy.expected_sales} units</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Revenue:</span>
                                <span className="text-slate-200 font-medium">₹{customSimResult.status_quo_strategy.expected_revenue.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Gross Profit:</span>
                                <span className="text-emerald-400 font-bold">₹{customSimResult.status_quo_strategy.expected_gross_profit.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Stockout Risk:</span>
                                <span className="text-slate-200 font-medium">{Math.round(customSimResult.status_quo_strategy.stockout_probability * 100)}%</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Waste Risk:</span>
                                <span className="text-slate-200 font-medium">{Math.round(customSimResult.status_quo_strategy.waste_probability * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* PROPOSED STRATEGY */}
                          <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-5 space-y-3 shadow-lg shadow-blue-500/5">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="font-bold text-white text-sm">Proposed Strategy</span>
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-semibold">Custom</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between text-slate-400">
                                <span>Expected Sales:</span>
                                <span className="text-slate-200 font-medium">{customSimResult.custom_proposed_strategy.expected_sales} units</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Revenue:</span>
                                <span className="text-slate-200 font-medium">₹{customSimResult.custom_proposed_strategy.expected_revenue.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Gross Profit:</span>
                                <span className="text-emerald-400 font-bold">₹{customSimResult.custom_proposed_strategy.expected_gross_profit.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Stockout Risk:</span>
                                <span className="text-slate-200 font-medium">{Math.round(customSimResult.custom_proposed_strategy.stockout_probability * 100)}%</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Waste Risk:</span>
                                <span className="text-slate-200 font-medium">{Math.round(customSimResult.custom_proposed_strategy.waste_probability * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        <Sliders className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                        <p className="font-medium text-white">Adjust sliders and click 'Run Custom Simulation'</p>
                        <p className="text-slate-500 mt-1">Computes Monte Carlo probability distribution over expected demand.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: APPROVALS QUEUE */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Merchant Approvals Queue</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Pending high & medium risk Autopilot recommendations requiring explicit merchant authorization.
                  </p>
                </div>

                <div className="space-y-4">
                  {actions.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                      No pending approval requests. Autopilot is running within policy guardrails.
                    </div>
                  ) : (
                    actions.map((act) => (
                      <div key={act.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">Action #{act.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              act.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-200 mt-1">{act.recommendation}</p>
                          <p className="text-xs text-slate-400 mt-1">{act.agent_reasoning}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleReject(act.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-lg font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(act.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-600/20"
                          >
                            Approve Strategy
                          </button>
                          <button
                            onClick={() => handleExecute(act.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-semibold"
                          >
                            Execute MOCK
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* VIEW 6: ACTION TIMELINE */}
            {activeTab === 'timeline' && decision && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Decision Journey & Audit Timeline</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    End-to-end 10-stage decision lifecycle for current Autopilot decision (Action #{decision.action_id}).
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="space-y-4">
                    {decision.audit_timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-slate-900 last:border-0 last:pb-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{step.stage}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              step.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {step.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 7: INSIGHTS & WHAT CHANGED? */}
            {activeTab === 'changed' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">What's Changing in Your Business?</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Aggregate business intelligence feed. No individual customer tracking or PII.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Demand Velocity Shift</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Milk demand is 32% higher than baseline due to upcoming weekend IT Park office closures.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                      <HelpCircle className="w-4 h-4" />
                      <span>Product Co-Movement</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Fresh Juice and Breakfast Granola show a positive co-movement correlation (r = +0.68).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 8: RECOVERED REVENUE */}
            {activeTab === 'recovered' && outcomes && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Recovered Revenue & Model Performance</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Closed-loop feedback tracking predicted vs actual revenue recovery and model variance calibration.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Total Revenue Recovered</span>
                    <span className="text-2xl font-bold text-emerald-400 block mt-1">₹{outcomes.total_revenue_recovered.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Profit Recovered</span>
                    <span className="text-2xl font-bold text-emerald-400 block mt-1">₹{outcomes.total_profit_recovered.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Waste Avoided</span>
                    <span className="text-2xl font-bold text-white block mt-1">{outcomes.waste_avoided_units} units</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Stockouts Avoided</span>
                    <span className="text-2xl font-bold text-white block mt-1">{outcomes.stockouts_avoided_units} units</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 9: REVENUE EXPERIMENTS */}
            {activeTab === 'experiments' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Revenue Strategy Lab</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Run multi-arm tests comparing competing discount and stocking strategies.
                  </p>
                </div>

                {experiments.map((exp) => (
                  <div key={exp.experiment_id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{exp.name}</h3>
                        <p className="text-xs text-slate-400">{exp.description}</p>
                      </div>
                      <button
                        onClick={() => handleRunExperiment(exp.experiment_id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                      >
                        Run Experiment
                      </button>
                    </div>

                    {activeExperimentResult && activeExperimentResult.experiment_id === exp.experiment_id && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/30 text-xs space-y-2">
                        <span className="text-emerald-400 font-bold block">
                          Winner Strategy: {activeExperimentResult.winning_arm} ({activeExperimentResult.summary})
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 10: RELIABILITY & FAILURES */}
            {activeTab === 'failures' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">System Reliability & Recovery Logs</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Operational fault recovery records capturing fallback executions and anomaly handling.
                  </p>
                </div>

                <div className="space-y-3">
                  {failures.map((f) => (
                    <div key={f.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">{f.failure_type}</span>
                        <span className="text-slate-500">{f.created_at || 'Just now'}</span>
                      </div>
                      <p className="text-slate-300"><strong>Cause:</strong> {f.possible_cause}</p>
                      <p className="text-emerald-400"><strong>Recovery Action:</strong> {f.recovery_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center space-y-1 text-[10px] ${activeTab === 'overview' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Activity className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('leaks')}
          className={`flex flex-col items-center space-y-1 text-[10px] ${activeTab === 'leaks' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Leaks</span>
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex flex-col items-center space-y-1 text-[10px] ${activeTab === 'decisions' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Layers className="w-5 h-5" />
          <span>Decisions</span>
        </button>

        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex flex-col items-center space-y-1 text-[10px] ${activeTab === 'whatif' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Sliders className="w-5 h-5" />
          <span>Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex flex-col items-center space-y-1 text-[10px] ${activeTab === 'approvals' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Approvals</span>
        </button>
      </div>

      {/* SYSTEM STATUS DIAGNOSTIC MODAL */}
      {showSystemStatusModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">System Status Diagnostics</h3>
              </div>
              <button
                onClick={() => setShowSystemStatusModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Backend API:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Connected</span>
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Database Connection:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Connected</span>
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Autopilot Engine:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Ready</span>
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Execution Mode:</span>
                <span className="text-blue-400 font-bold">MOCK (Safe Execution)</span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Simulator Engine:</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Learning Engine:</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>

              <div className="flex justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Razorpay Test Integration:</span>
                <span className="text-slate-400 font-medium">Not Configured (Optional)</span>
              </div>
            </div>

            <button
              onClick={() => setShowSystemStatusModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl mt-2"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
