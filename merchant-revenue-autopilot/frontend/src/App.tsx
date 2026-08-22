import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthStatus, PageView } from './types';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PageView>('dashboard');

  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: HealthStatus) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback try /api/health
        fetch('http://localhost:8000/health')
          .then((res) => res.json())
          .then((data: HealthStatus) => {
            setHealth(data);
            setLoading(false);
          })
          .catch(() => {
            setError(err.message || 'Failed to connect to backend server');
            setLoading(false);
          });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            RA
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-white">Merchant Revenue Autopilot</h1>
            <p className="text-xs text-slate-400">Razorpay Buildathon — AI Growth & Agentic Commerce</p>
          </div>
        </div>

        {/* Backend Connectivity Status Badge */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Backend API:</span>
            {loading ? (
              <span className="text-amber-400 animate-pulse">Connecting...</span>
            ) : health?.status === 'ok' ? (
              <span className="flex items-center text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> OK (/health)
              </span>
            ) : (
              <span className="flex items-center text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Disconnected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 bg-blue-950/40 text-blue-400 border border-blue-800/50 px-3 py-1.5 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guardrails Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'opportunities', label: 'Opportunities', icon: Activity },
            { id: 'simulator', label: 'Simulator', icon: Database },
            { id: 'agent', label: 'Agent Assistant', icon: ShieldCheck },
            { id: 'actions', label: 'Audit Trail', icon: CheckCircle2 },
            { id: 'failures', label: 'Failure Recovery', icon: AlertCircle },
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

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50 mb-3">
                    Phase 1 — Foundation Completed
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Merchant Revenue Autopilot Engine
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                    Deterministic demand intelligence & stockout-aware revenue decision platform. Built with Python FastAPI, React, TypeScript, and SQLAlchemy ORM.
                  </p>
                </div>
              </div>
            </div>

            {/* Health & System Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Backend System</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  FastAPI 0.109+
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Running on Python 3.11 with Pydantic & SQLAlchemy
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Database ORM</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  15 Data Models
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  SQLite / PostgreSQL ready architecture
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <span>Health Status Endpoint</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  {loading ? 'Testing...' : health?.status === 'ok' ? '200 OK (/health)' : 'Error'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {error ? error : 'GET /health returning {"status": "ok"}'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
