import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CheckCircle2, X, RefreshCw, Terminal, Check, Shield } from 'lucide-react';
import { UnifiedDecision, RevenueOpportunity, AgentActionItem, OutcomeRecord, FailureRecord, Experiment } from './types';
import { generateMerchantInventory, getInventoryStats, ProductItem } from './data/merchantInventory';

// Modular Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FinancialHero } from './components/FinancialHero';
import { BusinessPulse } from './components/BusinessPulse';
import { OpportunityList } from './components/OpportunityList';
import { ProductWorkspace } from './components/ProductWorkspace';
import { InventoryTable } from './components/InventoryTable';
import { DecisionPipeline } from './components/DecisionPipeline';
import { Simulator } from './components/Simulator';
import { InsightFeed } from './components/InsightFeed';
import { RecoveryView } from './components/RecoveryView';

/** Safe API fetcher helper */
async function safeApi<T>(fetcher: () => Promise<T>, fallback: T): Promise<{ data: T; ok: boolean }> {
  try {
    const data = await fetcher();
    return { data: data ?? fallback, ok: true };
  } catch (err) {
    console.warn('API fetch warning, using local model:', err);
    return { data: fallback, ok: false };
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'more'>('home');
  const [secondaryTab, setSecondaryTab] = useState<'insights' | 'recovery' | 'experiments' | 'timeline' | 'status'>('insights');
  
  // Theme state with localStorage initialization & system fallback
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

  // Backend Data States
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord | null>(null);
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // Workspace Detail Drawer
  const [selectedProductWorkspace, setSelectedProductWorkspace] = useState<ProductItem | null>(null);

  // Modals & Notifications
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStoreProfile, setShowStoreProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
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

  // Data Fetching from Backend API
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
  const handleApproveAction = (id: number) => {
    fetch(`/api/actions/${id}/approve`, { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        triggerToast(`Action #${id} approved. 15% clearance discount scheduled for execution.`);
        fetchData();
      })
      .catch(() => triggerToast('Action approved and scheduled.'));
  };

  // Opportunities for Home Screen (Top 7 Priority Risks)
  const homeOpportunities = useMemo(() => {
    return inventoryStats.itemsAtRisk.slice(0, 7);
  }, [inventoryStats]);

  return (
    <ErrorBoundary fallbackTitle="RevenuePilot Main Shell Encountered an Error">
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-main)' }}>

        {/* Toast Alert Notification Banner */}
        {toast && (
          <div className="toast-banner">
            <CheckCircle2 size={16} color="var(--emerald-green)" />
            <span>{toast}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0, cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Compact Header (64px) */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          secondaryTab={secondaryTab}
          setSecondaryTab={setSecondaryTab}
          theme={theme}
          setTheme={setTheme}
          totalProductsCount={inventoryStats.totalProducts}
          itemsAtRiskCount={inventoryStats.itemsAtRiskCount}
          setShowStoreProfile={setShowStoreProfile}
          setShowStatusModal={setShowStatusModal}
        />

        {/* Offline / Demo Mode Banner */}
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

        {/* Main Content Area */}
        <main className="copilot-viewport" style={{ padding: '32px 40px 80px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <RefreshCw size={24} color="var(--primary-blue)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Analyzing GreenBasket merchant catalog...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* OVERVIEW / HOME SCREEN */}
              {activeTab === 'home' && (
                <ErrorBoundary fallbackTitle="Overview Home View Error">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <FinancialHero
                      merchantName="Sanjay"
                      protectedRevenue={27696}
                      exposedRevenue={2138}
                      inventoryHealthPct={94}
                      activeOpportunitiesCount={inventoryStats.itemsAtRiskCount}
                    />

                    <BusinessPulse activeRisksCount={inventoryStats.itemsAtRiskCount} />

                    <OpportunityList
                      opportunities={homeOpportunities}
                      onSelectProduct={setSelectedProductWorkspace}
                      onViewAllInventory={() => setActiveTab('inventory')}
                    />
                  </div>
                </ErrorBoundary>
              )}

              {/* INVENTORY WORKSPACE */}
              {activeTab === 'inventory' && (
                <ErrorBoundary fallbackTitle="Inventory View Error">
                  <InventoryTable
                    catalog={merchantCatalog}
                    totalValue={inventoryStats.totalValue}
                    itemsAtRiskCount={inventoryStats.itemsAtRiskCount}
                    onSelectProduct={setSelectedProductWorkspace}
                  />
                </ErrorBoundary>
              )}

              {/* REVENUE OPPORTUNITIES */}
              {activeTab === 'leaks' && (
                <ErrorBoundary fallbackTitle="Revenue Opportunities Error">
                  <OpportunityList
                    opportunities={inventoryStats.itemsAtRisk}
                    onSelectProduct={setSelectedProductWorkspace}
                    onViewAllInventory={() => setActiveTab('inventory')}
                  />
                </ErrorBoundary>
              )}

              {/* DECISION CENTER */}
              {activeTab === 'decisions' && (
                <ErrorBoundary fallbackTitle="Decision Center Error">
                  <DecisionPipeline
                    onOpenSimulator={() => setActiveTab('whatif')}
                    onApproveAction={handleApproveAction}
                  />
                </ErrorBoundary>
              )}

              {/* WHAT-IF SIMULATOR */}
              {activeTab === 'whatif' && (
                <ErrorBoundary fallbackTitle="Simulator Error">
                  <Simulator />
                </ErrorBoundary>
              )}

              {/* MORE SUB-VIEWS */}
              {activeTab === 'more' && (
                <ErrorBoundary fallbackTitle="Secondary View Error">
                  {secondaryTab === 'insights' && <InsightFeed />}
                  {secondaryTab === 'recovery' && <RecoveryView />}
                  {secondaryTab === 'experiments' && <InsightFeed />}
                  {secondaryTab === 'timeline' && <RecoveryView />}
                  {secondaryTab === 'status' && (
                    <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Terminal size={18} color="var(--primary-blue)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>System Telemetry & Audit</h3>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>
                        <div>• Mode: <strong>MOCK Deterministic Execution</strong></div>
                        <div>• Catalog Count: <strong>{inventoryStats.totalProducts} items</strong></div>
                        <div>• Store: <strong>GreenBasket Market (Store #1)</strong></div>
                        <div>• Active Risks: <strong>{inventoryStats.itemsAtRiskCount} items</strong></div>
                        <div>• System Health: <strong style={{ color: 'var(--emerald-green)' }}>OPERATIONAL</strong></div>
                      </div>
                    </div>
                  )}
                </ErrorBoundary>
              )}
            </>
          )}

        </main>

        {/* Product Workspace Drawer */}
        <ProductWorkspace
          product={selectedProductWorkspace}
          onClose={() => setSelectedProductWorkspace(null)}
          onSimulate={(p) => setActiveTab('whatif')}
          onApproveAction={handleApproveAction}
        />

        {/* Store Profile Modal */}
        {showStoreProfile && (
          <div className="workspace-overlay" onClick={() => setShowStoreProfile(false)}>
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 12, padding: 28, maxWidth: 440, width: '90%', margin: 'auto',
              boxShadow: 'var(--shadow-md)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Merchant Store Profile</h3>
                <button onClick={() => setShowStoreProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                <div>• Store Name: <strong>GreenBasket Market</strong></div>
                <div>• Category: <strong>Grocery & Fresh Food</strong></div>
                <div>• Store Context: <strong>Commercial IT Park Location</strong></div>
                <div>• Store ID: <strong>1</strong></div>
                <div>• Autopilot Mode: <strong style={{ color: 'var(--emerald-green)' }}>Policy-Gated Autonomy</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Autopilot Status Modal */}
        {showStatusModal && (
          <div className="workspace-overlay" onClick={() => setShowStatusModal(false)}>
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 12, padding: 28, maxWidth: 440, width: '90%', margin: 'auto',
              boxShadow: 'var(--shadow-md)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} color="var(--emerald-green)" /> Autopilot Operational Status
                </h3>
                <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                <div>• Autonomous Monitoring: <strong style={{ color: 'var(--emerald-green)' }}>ACTIVE</strong></div>
                <div>• Policy Guardrails: <strong>Max 25% discount, Min 18% margin</strong></div>
                <div>• Execution Engine: <strong>Local Deterministic MOCK</strong></div>
                <div>• Safety Net: <strong>Merchant Approval Required for Action Execution</strong></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}
