import React, { useEffect, useState } from 'react';
import { 
  Activity, ShieldCheck, Database, Layers, CheckCircle2, AlertCircle, 
  TrendingUp, AlertTriangle, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw
} from 'lucide-react';
import { HealthStatus, PageView, OpportunitySummary, AgentActionItem, SimulationScenario } from './types';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<PageView>('dashboard');
  const [selectedStore, setSelectedStore] = useState<number>(1);

  const [summary, setSummary] = useState<OpportunitySummary | null>(null);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [investigation, setInvestigation] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Chat state
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    { role: 'agent', text: 'Hello! I am your AI Revenue Decision Agent. Ask me "Where am I silently losing money?" or select an option below.' }
  ]);

  // Load initial data
  const fetchData = () => {
    setLoading(true);
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'error' }));

    // Fetch opportunity summary
    fetch(`/api/opportunities/summary?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Summary error", err));

    // Fetch audit trail actions
    fetch(`/api/actions?store_id=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setActions(data))
      .catch((err) => console.error("Actions error", err));

    // Run agent investigation
    fetch('/api/agent/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: selectedStore }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInvestigation(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Investigation error", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedStore]);

  const handleApprove = (actionId: number) => {
    fetch(`/api/actions/${actionId}/approve`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        setActionMessage(`Action #${actionId} Approved successfully!`);
        fetchData();
      });
  };

  const handleReject = (actionId: number) => {
    fetch(`/api/actions/${actionId}/reject`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        setActionMessage(`Action #${actionId} Rejected.`);
        fetchData();
      });
  };

  const handleSendChat = (textToSend?: string) => {
    const msg = textToSend || chatMessage;
    if (!msg.trim()) return;

    const newHistory = [...chatHistory, { role: 'user' as const, text: msg }];
    setChatHistory(newHistory);
    setChatMessage('');

    fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, store_id: selectedStore })
    })
      .then((res) => res.json())
      .then((data) => {
        setChatHistory([...newHistory, { role: 'agent', text: data.message }]);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            RA
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-white">Merchant Revenue Autopilot</h1>
            <p className="text-xs text-slate-400">Razorpay Buildathon — AI Growth & Agentic Commerce</p>
          </div>
        </div>

        {/* Controls & Badges */}
        <div className="flex items-center space-x-4 text-xs">
          {/* Store Selector */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium focus:outline-none focus:border-blue-500"
          >
            <option value={1}>Store 1: TechPark Central (IT Park)</option>
            <option value={2}>Store 2: Green Glen Residency (Residential)</option>
            <option value={3}>Store 3: Commercial Street Hub (Commercial)</option>
          </select>

          {/* Backend Status */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Backend API:</span>
            {health?.status === 'ok' ? (
              <span className="flex items-center text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> OK
              </span>
            ) : (
              <span className="flex items-center text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 bg-blue-950/50 text-blue-400 border border-blue-800/60 px-3 py-1.5 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Guardrails Active</span>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'opportunities', label: 'Opportunities', icon: Activity },
            { id: 'simulator', label: 'Decision Simulator', icon: TrendingUp },
            { id: 'agent', label: 'Agent Assistant', icon: MessageSquare },
            { id: 'actions', label: 'Audit Trail & Approvals', icon: CheckCircle2 },
            { id: 'failures', label: 'Failure Recovery', icon: AlertTriangle },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as PageView)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Action Feedback Message */}
            {actionMessage && (
              <div className="bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionMessage}</span>
                </div>
                <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
              </div>
            )}

            {/* PAGE 1: DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      Total Opportunity
                    </div>
                    <div className="text-2xl font-bold text-white">
                      INR {summary?.total_estimated_opportunity ? summary.total_estimated_opportunity.toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 font-medium flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" /> Avoidable Annual Leakage
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      Confidence Adjusted
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      INR {summary?.confidence_adjusted_opportunity ? summary.confidence_adjusted_opportunity.toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Weighted by probability</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      Detected Leaks
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {summary?.total_opportunities_count || 0} Issues
                    </div>
                    <div className="text-xs text-amber-400 mt-1 font-medium">Across 5 Categories</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                      Pending Approval
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {actions.filter(a => a.status === 'PENDING').length} Actions
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Awaiting Merchant Consent</div>
                  </div>
                </div>

                {/* AI Agent Recommendation Card */}
                {investigation && investigation.recommendation && (
                  <div className="bg-slate-900 border border-blue-900/60 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800 mb-2">
                          AI Agent Recommendation (Requires Merchant Approval)
                        </span>
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                          <span>{investigation.recommendation}</span>
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Confidence: {(investigation.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          Risk: {investigation.risk_level}
                        </span>
                      </div>
                    </div>

                    {/* Reasoning & Evidence */}
                    <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800 space-y-3 mb-5">
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">WHY THIS RECOMMENDATION</div>
                        <p className="text-sm text-slate-200 leading-relaxed">{investigation.why_selected}</p>
                      </div>
                      {investigation.evidence && investigation.evidence.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">EVIDENCE & SIGNALS</div>
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            {investigation.evidence.map((ev: string, idx: number) => (
                              <li key={idx}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Approval Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-xs text-slate-400">
                        Status: <span className="font-semibold text-amber-400">{investigation.status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleReject(investigation.action_id)}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-slate-700 transition-all"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(investigation.action_id)}
                          className="flex items-center space-x-1.5 px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Approve Action</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulation Comparison Table */}
                {investigation?.simulation_comparison && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Monte Carlo Decision Simulation Comparison</h3>
                        <p className="text-xs text-slate-400">Simulating candidate actions against probabilistic demand distributions</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Decision Option</th>
                            <th className="px-4 py-3">Expected Sales</th>
                            <th className="px-4 py-3">Stockout Risk %</th>
                            <th className="px-4 py-3">Expected Gross Profit</th>
                            <th className="px-4 py-3">Cash Exposure</th>
                            <th className="px-4 py-3">Guardrail Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {investigation.simulation_comparison.map((sc: SimulationScenario, idx: number) => {
                            const isRecommended = sc.order_quantity === investigation.simulation_comparison.find((s: any) => s.expected_contribution === Math.max(...investigation.simulation_comparison.map((m: any) => m.expected_contribution)))?.order_quantity;
                            return (
                              <tr key={idx} className={isRecommended ? 'bg-blue-950/40 font-medium text-white' : 'hover:bg-slate-800/40'}>
                                <td className="px-4 py-3 flex items-center space-x-2">
                                  <span>{sc.order_quantity ? `Order ${sc.order_quantity} units` : `${sc.discount_percent}% Discount`}</span>
                                  {isRecommended && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-semibold">Recommended</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">{sc.expected_sales} units</td>
                                <td className="px-4 py-3 font-semibold text-amber-400">
                                  {sc.stockout_probability ? `${(sc.stockout_probability * 100).toFixed(1)}%` : '0%'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-emerald-400">INR {sc.expected_gross_profit?.toLocaleString()}</td>
                                <td className="px-4 py-3">INR {sc.cash_locked?.toLocaleString() || 0}</td>
                                <td className="px-4 py-3">
                                  {sc.policy_validation?.allowed ? (
                                    <span className="text-emerald-400 font-medium">✓ Passed</span>
                                  ) : (
                                    <span className="text-rose-400 font-medium">✕ Rejected</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* PAGE 2: OPPORTUNITIES VIEW */}
            {activeTab === 'opportunities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Profit Leakage Opportunities</h2>
                    <p className="text-xs text-slate-400">Identified avoidable financial losses derived from aggregate merchant data</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary?.opportunities.map((op, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          {op.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Priority: <span className="text-rose-400">{op.priority}</span></span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{op.product}</h4>
                        <p className="text-xs text-slate-400">{op.store}</p>
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        INR {op.estimated_opportunity.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-2">(Confidence: {(op.confidence * 100).toFixed(0)}%)</span>
                      </div>
                      {op.evidence && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <div className="font-semibold text-slate-400 uppercase text-[10px]">Evidence</div>
                          {op.evidence.map((ev, eIdx) => (
                            <p key={eIdx}>• {ev}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 3: SIMULATOR VIEW */}
            {activeTab === 'simulator' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-2">Interactive Decision Simulator</h2>
                  <p className="text-xs text-slate-400">Simulate order quantities and discount percentages before committing capital.</p>
                </div>
              </div>
            )}

            {/* PAGE 4: AGENT ASSISTANT VIEW */}
            {activeTab === 'agent' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[600px]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span>AI Revenue Decision Assistant</span>
                </h2>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xl p-4 rounded-xl text-sm whitespace-pre-line ${
                        msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center space-x-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask 'Where am I silently losing money?'..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* PAGE 5: AUDIT TRAIL VIEW */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-1">Agent Action Audit Trail & Approvals</h2>
                  <p className="text-xs text-slate-400">Complete record: Signal → Reasoning → Simulation → Recommendation → Approval → Execution</p>
                </div>

                <div className="space-y-4">
                  {actions.map((act) => (
                    <div key={act.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">Action #{act.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">
                            {act.action_type}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          act.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          act.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {act.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{act.recommendation}</p>
                      <p className="text-xs text-slate-400">{act.agent_reasoning}</p>

                      {act.status === 'PENDING' && (
                        <div className="flex items-center space-x-3 pt-2">
                          <button
                            onClick={() => handleApprove(act.id)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
                          >
                            Approve Action
                          </button>
                          <button
                            onClick={() => handleReject(act.id)}
                            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 text-xs border border-slate-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
