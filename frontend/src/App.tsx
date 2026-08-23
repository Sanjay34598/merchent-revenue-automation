import React, { useEffect, useState } from 'react';
import { 
  Activity, ShieldCheck, Database, Layers, CheckCircle2, AlertCircle, 
  TrendingUp, AlertTriangle, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare, 
  RefreshCw, Play, BarChart3, Clock, DollarSign, HelpCircle, FileText, Zap
} from 'lucide-react';
import { 
  HealthStatus, PageView, OpportunitySummary, AgentActionItem, 
  UnifiedDecision, RevenueOpportunity, OutcomeRecord, FailureRecord, Experiment
} from './types';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<PageView>('overview');
  const [selectedStore, setSelectedStore] = useState<number>(1);

  // Core Phase 5 State
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [activeExperimentResult, setActiveExperimentResult] = useState<any | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeDemoStory, setActiveDemoStory] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = () => {
    setLoading(true);
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline' }));

    // Run unified decision analysis
    fetch('/api/autopilot/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore })
    })
      .then((res) => res.json())
      .then((data) => {
        setDecision(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Decision analysis error", err);
        setLoading(false);
      });

    // Fetch opportunities
    fetch(`/api/autopilot/opportunities?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setOpportunities(data))
      .catch((err) => console.error("Opportunities error", err));

    // Fetch audit trail actions
    fetch(`/api/actions?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setActions(data))
      .catch((err) => console.error("Actions error", err));

    // Fetch outcomes & learning
    fetch(`/api/autopilot/outcomes?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setOutcomes(data))
      .catch((err) => console.error("Outcomes error", err));

    // Fetch failure logs
    fetch('/api/autopilot/failures')
      .then((res) => res.json())
      .then((data) => setFailures(data))
      .catch((err) => console.error("Failures error", err));

    // List experiments (side-effect free GET)
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
      .then((res) => {
        setFeedbackMessage(`Action #${actionId} approved by merchant. Queued for test execution.`);
        fetchData();
      });
  };

  const handleReject = (actionId: number) => {
    fetch(`/api/actions/${actionId}/reject`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        setFeedbackMessage(`Action #${actionId} rejected by merchant.`);
        fetchData();
      });
  };

  const handleExecute = (actionId: number) => {
    fetch(`/api/autopilot/execute/${actionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execution_mode: 'RAZORPAY_TEST_MODE' })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setFeedbackMessage(`Action #${actionId} executed safely in RAZORPAY_TEST_MODE. Outcome recorded.`);
        } else {
          setFeedbackMessage(`Execution error: ${res.detail || res.error}`);
        }
        fetchData();
      })
      .catch((err) => setFeedbackMessage("Execution call failed. Checked policy and duplicate prevention."));
  };

  const handleRunDemoScenario = (scenarioId: number) => {
    fetch('/api/autopilot/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId })
    })
      .then((res) => res.json())
      .then((data) => {
        setActiveDemoStory(`Demo Scenario ${scenarioId}: ${data.scenario_name} — ${data.story}`);
        if (data.why_this_decision) {
          setDecision(data);
          setActiveTab('decisions');
        } else if (data.strategy_comparison) {
          setActiveExperimentResult(data);
          setActiveTab('experiments');
        } else if (data.fallback_mode) {
          setActiveTab('failures');
        }
        fetchData();
      });
  };

  const handleRunExperiment = (expId: string) => {
    fetch(`/api/autopilot/experiments/${expId}/run?store_id=${selectedStore}`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setActiveExperimentResult(data);
        setFeedbackMessage(`Experiment '${expId}' executed in test simulation mode.`);
        setActiveTab('experiments');
      });
  };

  const totalLoss = opportunities.reduce((acc, o) => acc + o.estimated_revenue_loss, 0);
  const totalRecoverable = opportunities.reduce((acc, o) => acc + o.estimated_recoverable_revenue, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Professional Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            RP
          </div>
          <div>
            <h1 className="font-semibold text-base tracking-tight text-white flex items-center space-x-2">
              <span>Razorpay Merchant Revenue Autopilot</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-normal">Phase 5 Closed-Loop</span>
            </h1>
            <p className="text-xs text-slate-400">Aggregate Growth Intelligence & Policy-Gated Commerce</p>
          </div>
        </div>

        {/* Header Controls & Status Badges */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Store Selector */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded font-medium focus:outline-none focus:border-blue-500"
          >
            <option value={1}>Store 1: TechPark Central (IT Park)</option>
            <option value={2}>Store 2: Green Glen Residency (Residential)</option>
            <option value={3}>Store 3: Commercial Street Hub (Commercial)</option>
          </select>

          {/* Backend Status */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">API:</span>
            {health?.status === 'ok' ? (
              <span className="text-emerald-400 font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> OK
              </span>
            ) : (
              <span className="text-rose-400 font-medium flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mode: RAZORPAY_TEST_MODE</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Merchant Control Center
          </div>
          {[
            { id: 'overview', label: '1. Overview', icon: Layers },
            { id: 'leaks', label: '2. Revenue Leaks', icon: Activity },
            { id: 'decisions', label: '3. AI Decisions', icon: TrendingUp },
            { id: 'approvals', label: '4. Approval Center', icon: CheckCircle2 },
            { id: 'timeline', label: '5. Action Timeline', icon: Clock },
            { id: 'changed', label: '6. What Changed?', icon: HelpCircle },
            { id: 'recovered', label: '7. Recovered Revenue', icon: DollarSign },
            { id: 'failures', label: '8. Failure Center', icon: AlertTriangle },
            { id: 'experiments', label: '9. Revenue Experiments', icon: Zap },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as PageView)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">
              Deterministic Demo Scenarios
            </div>
            {[
              { id: 1, label: '1. IT Park Holiday Milk' },
              { id: 2, label: '2. Fresh Juice Expiry' },
              { id: 3, label: '3. Demand Spike Velocity' },
              { id: 4, label: '4. Forecast Anomaly Fallback' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleRunDemoScenario(sc.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-blue-950 hover:text-blue-300 text-slate-300 border border-slate-700 transition-all text-left"
              >
                <span className="truncate">{sc.label}</span>
                <Play className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Feedback Banner */}
            {feedbackMessage && (
              <div className="bg-slate-900 border border-emerald-700/80 text-emerald-300 px-4 py-2.5 rounded text-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{feedbackMessage}</span>
                </div>
                <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Demo Story Banner */}
            {activeDemoStory && (
              <div className="bg-blue-950/60 border border-blue-800 text-blue-200 px-4 py-3 rounded text-xs space-y-1">
                <div className="font-semibold text-blue-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active Scenario Run</span>
                  </span>
                  <button onClick={() => setActiveDemoStory(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-slate-300 leading-relaxed">{activeDemoStory}</p>
              </div>
            )}

            {/* 1. OVERVIEW VIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded p-4">
                    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-1">
                      Identified Revenue Loss
                    </div>
                    <div className="text-2xl font-bold text-white">
                      INR {totalLoss.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-amber-400 mt-1">Across {opportunities.length} leakage areas</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded p-4">
                    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-1">
                      Estimated Recoverable
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      INR {totalRecoverable.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Weighted by model confidence</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded p-4">
                    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-1">
                      Actual Profit Recovered
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      INR {outcomes?.total_profit_recovered ? outcomes.total_profit_recovered.toLocaleString() : '0'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Measured from executed actions</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded p-4">
                    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-1">
                      Pending Approvals
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {actions.filter(a => a.status === 'PENDING').length} Actions
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Awaiting merchant sign-off</div>
                  </div>
                </div>

                {/* Closed-Loop Overview Card */}
                {decision && (
                  <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
                          Primary AI Decision Proposal
                        </span>
                        <h2 className="text-lg font-bold text-white mt-1">{decision.recommended_action}</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded font-medium border border-slate-700">
                          Confidence: {(decision.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-1 bg-blue-950 text-blue-300 text-xs rounded font-medium border border-blue-800">
                          Risk: {decision.risk_level}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{decision.why_this_decision.why_selected}</p>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => setActiveTab('decisions')}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <span>View Full Decision Breakdown</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700"
                      >
                        View 10-Stage Audit Timeline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. REVENUE LEAKS VIEW */}
            {activeTab === 'leaks' && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Detected Revenue Opportunities & Leaks</h2>
                    <p className="text-xs text-slate-400">Aggregated from store sales velocity, stockout signals, and expiry timelines</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Total: {opportunities.length} Items</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Est. Revenue Loss</th>
                        <th className="p-3">Recoverable</th>
                        <th className="p-3">Confidence</th>
                        <th className="p-3">Urgency</th>
                        <th className="p-3">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {opportunities.map((opp) => (
                        <tr key={opp.opportunity_id} className="hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-medium text-slate-400">{opp.opportunity_id}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-800 border border-slate-700 text-blue-300">
                              {opp.opportunity_type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-white">INR {opp.estimated_revenue_loss.toLocaleString()}</td>
                          <td className="p-3 font-semibold text-emerald-400">INR {opp.estimated_recoverable_revenue.toLocaleString()}</td>
                          <td className="p-3">{(opp.confidence * 100).toFixed(0)}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              opp.urgency === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              opp.urgency === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {opp.urgency}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{opp.recommended_action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. AI DECISIONS VIEW */}
            {activeTab === 'decisions' && decision && (
              <div className="space-y-5">
                {/* Decision Header */}
                <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded">
                        AI Recommended Action
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1">{decision.recommended_action}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded border border-emerald-800">
                        Score: {decision.winning_candidate.overall_score.toFixed(3)}
                      </span>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded border border-slate-700">
                        Risk: {decision.risk_level}
                      </span>
                    </div>
                  </div>

                  {/* Decision Confidence + Evidence Bar */}
                  <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                      Decision Confidence & Supporting Evidence
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1">
                      <div>
                        <div className="text-slate-400 text-[10px]">Expected Gross Profit</div>
                        <div className="font-bold text-emerald-400">INR {decision.winning_candidate.expected_gross_profit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Stockout Risk</div>
                        <div className="font-semibold text-amber-400">{(decision.winning_candidate.stockout_probability * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Waste Risk</div>
                        <div className="font-semibold text-slate-300">{(decision.winning_candidate.waste_probability * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Cash Locked</div>
                        <div className="font-semibold text-slate-300">INR {decision.winning_candidate.cash_locked.toLocaleString()}</div>
                      </div>
                    </div>
                    {decision.opportunity?.evidence && (
                      <div className="pt-2 border-t border-slate-850">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">AGGREGATE SIGNALS & CO-MOVEMENT EVIDENCE:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {decision.opportunity.evidence.map((ev: string, idx: number) => (
                            <li key={idx}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Multi-Candidate Comparison Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Action Simulation Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                          <tr>
                            <th className="p-2.5">Candidate Action</th>
                            <th className="p-2.5">Expected Sales</th>
                            <th className="p-2.5">Gross Profit</th>
                            <th className="p-2.5">Stockout Risk</th>
                            <th className="p-2.5">Waste Risk</th>
                            <th className="p-2.5">Cash Locked</th>
                            <th className="p-2.5">Norm. Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {decision.scored_candidates.map((c, idx) => {
                            const isWin = c.action_name === decision.winning_candidate.action_name;
                            const isDoNothing = c.action_name in { DO_NOTHING: 1, NO_DISCOUNT: 1 };
                            return (
                              <tr key={idx} className={isWin ? 'bg-blue-950/40 font-semibold text-white' : 'hover:bg-slate-800/40'}>
                                <td className="p-2.5 flex items-center space-x-2">
                                  <span>{c.label}</span>
                                  {isWin && <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-600 text-white font-bold">SELECTED</span>}
                                  {isDoNothing && <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">STATUS QUO</span>}
                                </td>
                                <td className="p-2.5">{c.expected_sales} units</td>
                                <td className="p-2.5 font-bold text-emerald-400">INR {c.expected_gross_profit.toLocaleString()}</td>
                                <td className="p-2.5 text-amber-400">{(c.stockout_probability * 100).toFixed(1)}%</td>
                                <td className="p-2.5 font-mono text-slate-400">{(c.waste_probability * 100).toFixed(1)}%</td>
                                <td className="p-2.5">INR {c.cash_locked.toLocaleString()}</td>
                                <td className="p-2.5 font-bold text-blue-300">{c.overall_score.toFixed(3)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card: WHAT WOULD HAPPEN IF WE DID NOTHING? */}
                  <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>What would happen if we did nothing? (Status Quo Analysis)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{decision.why_this_decision.what_if_do_nothing}</p>
                  </div>

                  {/* Card: WHY THIS DECISION? (7 Questions) */}
                  <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-3 text-xs">
                    <div className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                      Structured "WHY THIS DECISION?" Rationale
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">1. What happened?</span>
                        <p>{decision.why_this_decision.what_happened}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">2. Why is this an opportunity?</span>
                        <p>{decision.why_this_decision.why_opportunity}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">3. What does system expect?</span>
                        <p>{decision.why_this_decision.what_expected}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">4. Alternatives simulated?</span>
                        <p>{decision.why_this_decision.alternatives_simulated.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">5. Why this action selected?</span>
                        <p>{decision.why_this_decision.why_selected}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">6. Risk / Policy constraint?</span>
                        <p>{decision.why_this_decision.policy_applied}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card: WHY NOT THE OTHER OPTIONS? */}
                  <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      WHY NOT THE OTHER OPTIONS? (Rejection Analysis)
                    </div>
                    <div className="space-y-2">
                      {decision.why_not_the_other_options.map((rej, idx) => (
                        <div key={idx} className="flex items-start space-x-2 border-b border-slate-850 pb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-900 font-bold shrink-0 mt-0.5">
                            REJECTED
                          </span>
                          <div>
                            <span className="font-semibold text-white">{rej.option}</span>
                            <span className="text-slate-400 ml-1 text-[11px]">— {rej.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approval Action Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Merchant Sign-off: <span className="font-semibold text-amber-400">REQUIRED BEFORE TEST EXECUTION</span>
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleReject(decision.action_id)}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 rounded text-xs font-semibold"
                      >
                        Reject Action
                      </button>
                      <button
                        onClick={() => handleApprove(decision.action_id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm"
                      >
                        Approve Action
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPROVAL CENTER VIEW */}
            {activeTab === 'approvals' && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Merchant Action Approval Center</h2>
                    <p className="text-xs text-slate-400">Policy-gated actions requiring explicit merchant authorization before test execution</p>
                  </div>
                  <span className="text-xs text-slate-400">Pending: {actions.filter(a => a.status === 'PENDING').length}</span>
                </div>

                <div className="space-y-3">
                  {actions.map((act) => (
                    <div key={act.id} className="bg-slate-950 border border-slate-800 rounded p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-400">Action #{act.id}</span>
                          <span className="font-bold text-white">{act.recommendation}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          act.status === 'EXECUTED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          act.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {act.status}
                        </span>
                      </div>

                      <p className="text-slate-300">{act.agent_reasoning}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                        <span className="text-slate-400 text-[11px]">
                          Risk: <strong className="text-slate-200">{act.risk_level}</strong> | Confidence: {(act.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="flex items-center space-x-2">
                          {act.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleReject(act.id)}
                                className="px-3 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 rounded text-xs"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApprove(act.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                              >
                                Approve
                              </button>
                            </>
                          )}
                          {act.status === 'APPROVED' && (
                            <button
                              onClick={() => handleExecute(act.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Execute (Test Mode)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ACTION TIMELINE VIEW */}
            {activeTab === 'timeline' && decision && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">Human-Readable 10-Stage Audit Trail Timeline</h2>
                  <p className="text-xs text-slate-400">Complete closed-loop decision lifecycle representation</p>
                </div>

                <div className="space-y-3">
                  {decision.audit_timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded border border-slate-800 text-xs">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        step.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        step.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white tracking-wider">{step.stage}</span>
                          <span className={`text-[10px] font-semibold ${
                            step.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-400'
                          }`}>{step.status}</span>
                        </div>
                        <p className="text-slate-300">{step.details}</p>
                        {step.timestamp && <span className="text-[10px] text-slate-500 font-mono block">{step.timestamp}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. WHAT CHANGED? VIEW */}
            {activeTab === 'changed' && decision && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">What Changed? — Natural Language Business Explanation</h2>
                  <p className="text-xs text-slate-400">Explaining underlying demand shifts from aggregate store features</p>
                </div>

                <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-blue-300 text-sm">
                    Store Location & Event Pattern Discovery
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {decision.why_this_decision.what_happened}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    "Historical aggregate store sales show that IT-park stores experience a 45-55% drop in demand on Sundays and public holidays. 
                    Rather than placing the standard weekday order of 200 units, the system dynamically forecasted demand at ~110 units and selected 
                    the optimal order quantity to eliminate waste while protecting gross profit."
                  </p>
                </div>
              </div>
            )}

            {/* 7. RECOVERED REVENUE VIEW */}
            {activeTab === 'recovered' && outcomes && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">Empirical Outcome Measurement & Learning</h2>
                  <p className="text-xs text-slate-400">Measuring actual recovered revenue and calibrating future decision confidence</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <div className="text-slate-400">Total Profit Recovered</div>
                    <div className="text-xl font-bold text-emerald-400">INR {outcomes.total_profit_recovered.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <div className="text-slate-400">Mean Prediction Error</div>
                    <div className="text-xl font-bold text-blue-400">{outcomes.mean_prediction_error_pct.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <div className="text-slate-400">Calibrated Base Confidence</div>
                    <div className="text-xl font-bold text-white">{(outcomes.calibrated_base_confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-slate-300 uppercase tracking-wider">Executed Action Outcome History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                        <tr>
                          <th className="p-2.5">Action ID</th>
                          <th className="p-2.5">Predicted Impact</th>
                          <th className="p-2.5">Actual Impact</th>
                          <th className="p-2.5">Variance</th>
                          <th className="p-2.5">Prediction Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {outcomes.history.map((h, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-mono text-slate-400">#{h.action_id}</td>
                            <td className="p-2.5">INR {h.predicted_impact.toLocaleString()}</td>
                            <td className="p-2.5 font-bold text-emerald-400">INR {h.actual_impact.toLocaleString()}</td>
                            <td className="p-2.5 text-slate-300">INR {h.variance.toLocaleString()}</td>
                            <td className="p-2.5 text-blue-400">{h.prediction_error_pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 8. FAILURE CENTER VIEW */}
            {activeTab === 'failures' && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">Failure Recovery & Safety Center</h2>
                  <p className="text-xs text-slate-400">Controlled failure scenarios, duplicate action prevention, and fallback logs</p>
                </div>

                <div className="space-y-3 text-xs">
                  {failures.length === 0 ? (
                    <p className="text-slate-400 py-4">No unhandled failure events recorded. System operating safely.</p>
                  ) : (
                    failures.map((f) => (
                      <div key={f.id} className="bg-slate-950 border border-slate-800 rounded p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-400">{f.failure_type}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{f.created_at}</span>
                        </div>
                        <p className="text-slate-300"><strong>Cause:</strong> {f.possible_cause}</p>
                        <p className="text-emerald-400"><strong>Recovery Action:</strong> {f.recovery_action}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 9. REVENUE EXPERIMENTS VIEW */}
            {activeTab === 'experiments' && (
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-5">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Controlled Revenue Strategy Experiments</h2>
                    <p className="text-xs text-slate-400">Multi-arm strategy comparison in simulation test mode (Side-effect free list)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {experiments.map((exp) => (
                    <div key={exp.experiment_id} className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{exp.experiment_id}</span>
                        <h3 className="font-bold text-white text-sm mt-0.5">{exp.name}</h3>
                        <p className="text-slate-400 text-[11px] mt-1">{exp.description}</p>
                      </div>

                      <button
                        onClick={() => handleRunExperiment(exp.experiment_id)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Strategy Comparison Experiment</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Active Experiment Results */}
                {activeExperimentResult && (
                  <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="font-bold text-white">{activeExperimentResult.name} — Result</span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold">
                        Winner: {activeExperimentResult.winning_strategy}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{activeExperimentResult.selection_rationale}</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                          <tr>
                            <th className="p-2">Arm</th>
                            <th className="p-2">Strategy</th>
                            <th className="p-2">Predicted Sales</th>
                            <th className="p-2">Expected Revenue</th>
                            <th className="p-2">Gross Profit</th>
                            <th className="p-2">Waste Cost</th>
                            <th className="p-2">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activeExperimentResult.strategy_comparison?.map((sc: any, idx: number) => (
                            <tr key={idx} className={sc.arm === activeExperimentResult.winning_strategy ? 'bg-blue-950/40 font-semibold text-white' : ''}>
                              <td className="p-2">{sc.arm}</td>
                              <td className="p-2">{sc.strategy_name || sc.label}</td>
                              <td className="p-2">{sc.predicted_sales || sc.expected_sales} units</td>
                              <td className="p-2">INR {(sc.predicted_revenue || sc.expected_revenue).toLocaleString()}</td>
                              <td className="p-2 font-bold text-emerald-400">INR {sc.expected_gross_profit.toLocaleString()}</td>
                              <td className="p-2 text-rose-400">INR {(sc.expected_waste_cost || 0).toLocaleString()}</td>
                              <td className="p-2 font-bold text-blue-300">{(sc.overall_score || 0).toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
