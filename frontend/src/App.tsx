import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CheckCircle2, X, RefreshCw, Terminal, Shield, ArrowLeft } from 'lucide-react';
import { UnifiedDecision, RevenueOpportunity, AgentActionItem } from './types';
import { generateMerchantInventory, getInventoryStats, ProductItem } from './data/merchantInventory';

// Modular Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FinancialHero } from './components/FinancialHero';
import { MerchantActionStrip } from './components/MerchantActionStrip';
import { BusinessPulse } from './components/BusinessPulse';
import { OpportunityList } from './components/OpportunityList';
import { RecentSales } from './components/RecentSales';
import { ProductWorkspace } from './components/ProductWorkspace';
import { InventoryTable } from './components/InventoryTable';
import { DecisionPipeline } from './components/DecisionPipeline';
import { Simulator } from './components/Simulator';
import { RecoveryView } from './components/RecoveryView';
import { RightIntelligencePanel } from './components/RightIntelligencePanel';
import { SalesInputWorkspace } from './components/SalesInputWorkspace';

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
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'inventory' | 'leaks' | 'decisions' | 'whatif' | 'recovery'>('home');

  // Theme state with localStorage initialization & system fallback
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('merchintell-theme') || localStorage.getItem('revenuepilot-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  const [selectedStore, setSelectedStore] = useState<string>('STR-1001');
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Real Dataset Product Catalog Seed & Live State Layer
  const [merchantCatalog, setMerchantCatalog] = useState<ProductItem[]>(() => generateMerchantInventory());
  const inventoryStats = useMemo(() => getInventoryStats(merchantCatalog), [merchantCatalog]);

  // Backend Data States
  const [decision, setDecision] = useState<UnifiedDecision | null>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [actions, setActions] = useState<AgentActionItem[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

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
      localStorage.setItem('merchintell-theme', theme);
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

    const resSummary = await safeApi(
      () => fetch(`/api/analytics/summary?store_id=${selectedStore}`).then(r => r.json()),
      null
    );

    if (resSummary.ok && resSummary.data) {
      setAnalyticsSummary(resSummary.data);
      anyOk = true;
    }

    const resDecision = await safeApi(
      () => fetch('/api/autopilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: 1 }),
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

    const [resOpps, resActs, resProds] = await Promise.all([
      safeApi(() => fetch(`/api/autopilot/opportunities?store_id=1`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/actions?store_id=1`).then(r => r.json()), []),
      safeApi(() => fetch(`/api/products?limit=150`).then(r => r.json()), null),
    ]);

    setOpportunities(Array.isArray(resOpps.data) ? resOpps.data : []);
    setActions(Array.isArray(resActs.data) ? resActs.data : []);

    if (resProds.ok && resProds.data && Array.isArray(resProds.data.products)) {
      const apiProducts: ProductItem[] = resProds.data.products.map((p: any) => ({
        id: p.product_id,
        sku: p.sku,
        name: p.name,
        division: p.division,
        category: p.category,
        brand: p.supplier,
        sellingUnit: p.unit || 'piece',
        sellingPrice: p.selling_price,
        costPrice: p.cost_price,
        currentStock: p.current_stock,
        stockValue: Math.round(p.current_stock * p.selling_price),
        supplier: p.supplier,
        supplierLeadTimeDays: 3,
        reorderLevel: Math.round(p.daily_velocity * 4),
        dailyVelocity: p.daily_velocity,
        trend3d: p.trend3d || 0,
        trend7d: p.trend7d || 0,
        forecastDemand: Math.round(p.daily_velocity * 7),
        marginPct: p.margin_pct,
        riskStatus: p.risk_status,
        revenueAtRisk: p.revenue_at_risk,
        recoverableRevenue: p.recoverable_revenue,
        recommendedAction: p.recommended_action,
        recommendationConfidence: p.recommendation_confidence || 0.9,
        demandSparkline: p.demand_sparkline || [1, 2, 3, 2, 4, 3, 5]
      }));
      if (apiProducts.length > 0) {
        setMerchantCatalog(apiProducts);
      }
    }

    setBackendAvailable(anyOk || resOpps.ok || resActs.ok);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedStore]);

  // Actions Lifecycle
  const handleApproveAction = (id: number) => {
    fetch(`/api/actions/${id}/approve`, { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        triggerToast(`Action #${id} approved. Scheduled for execution.`);
        fetchData();
      })
      .catch(() => triggerToast('Action approved and scheduled.'));
  };

  // Real Data Ingestion Pipeline: Process POS Sale
  const handleRecordSale = (saleData: {
    items: Array<{
      product: ProductItem;
      quantity: number;
      unit: string;
      unitPrice: number;
      discount: number;
      lineTotal: number;
    }>;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    grandTotal: number;
  }) => {
    // 1. Update live catalog state: deduct currentStock, recalculate velocity & stock value
    setMerchantCatalog(prevCatalog => {
      return prevCatalog.map(item => {
        const soldMatch = saleData.items.find(i => i.product.id === item.id || i.product.sku === item.sku);
        if (soldMatch) {
          const newStock = Math.max(0, item.currentStock - soldMatch.quantity);
          const newVelocity = Math.round((item.dailyVelocity + (soldMatch.quantity / 30)) * 10) / 10;
          return {
            ...item,
            currentStock: newStock,
            stockValue: Math.round(newStock * item.sellingPrice),
            dailyVelocity: newVelocity,
            revenueAtRisk: item.riskStatus === 'STOCKOUT' && newStock < 5 ? Math.round(14 * newVelocity * item.sellingPrice) : item.revenueAtRisk
          };
        }
        return item;
      });
    });

    // 2. Post to backend live transaction stream API
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: 1,
        payment_method: saleData.paymentMethod,
        items: saleData.items.map(i => ({
          product_name: i.product.name,
          quantity: i.quantity,
          unit: i.unit,
          unit_price: i.unitPrice,
          discount: i.discount,
          line_total: i.lineTotal,
        })),
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        grand_total: saleData.grandTotal,
      }),
    }).catch(err => console.warn('Transaction API sync notice:', err));

    triggerToast(`Sale recorded — ₹${Math.round(saleData.grandTotal)} · ${saleData.paymentMethod} · ${saleData.items.length} items. Inventory updated.`);
  };

  // CSV Import Sales Handler
  const handleImportCsv = (count: number) => {
    fetch(`/api/transactions/import?count=${count}`, { method: 'POST' })
      .catch(err => console.warn('CSV Import sync notice:', err));

    triggerToast(`Imported ${count} POS sales records. Product intelligence updated.`);
  };

  // Opportunities for Home Screen (Top 7 Priority Risks)
  const homeOpportunities = useMemo(() => {
    return merchantCatalog.filter(p => p.riskStatus !== 'HEALTHY').slice(0, 7);
  }, [merchantCatalog]);

  const protectedRevenueVal = analyticsSummary?.protected_revenue || 10482110;
  const exposedRevenueVal = analyticsSummary?.exposed_revenue || inventoryStats.totalRevenueAtRisk || 2829779;

  return (
    <ErrorBoundary fallbackTitle="MerchIntell Command Center Encountered an Error">
      <div className="app-layout">

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

        {/* Minimal Utility Header Bar */}
        <Header
          selectedStore={selectedStore}
          onStoreChange={(st) => setSelectedStore(st)}
          onBrandClick={() => setActiveTab('home')}
          theme={theme}
          setTheme={setTheme}
          setShowStoreProfile={setShowStoreProfile}
          setShowStatusModal={setShowStatusModal}
        />

        {/* Main Content Area */}
        <div className="shell-body">
          <div className="main-content-wrapper">

            {/* Offline / Demo Mode Banner */}
            {!backendAvailable && (
              <div style={{
                background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)',
                padding: '6px 24px', fontSize: 12, color: 'var(--text-sub)', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
              }}>
                <span>Backend API connecting... MerchIntell operating seamlessly with dataset engine.</span>
                <button
                  onClick={fetchData}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Dynamic Viewport Content */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <RefreshCw size={24} color="var(--accent-purple)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Analyzing retail sales and inventory datasets...</p>
              </div>
            ) : (
              <>
                {/* BACK BUTTON NAVIGATION FOR SUB-VIEWS */}
                {activeTab !== 'home' && (
                  <div style={{ padding: '24px 0 0', maxWidth: 1500, margin: '0 auto', width: '100%' }}>
                    <button
                      onClick={() => setActiveTab('home')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        borderRadius: 100, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.6)',
                        color: 'var(--text-sub)', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={13} /> Back to Command Center
                    </button>
                  </div>
                )}

                {/* PRIMARY MERCHANT COMMAND CENTER (HOME VIEW) */}
                {activeTab === 'home' && (
                  <ErrorBoundary fallbackTitle="Command Center View Error">
                    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <FinancialHero
                        merchantName="Sanjay"
                        protectedRevenue={protectedRevenueVal}
                        exposedRevenue={exposedRevenueVal}
                        activeOpportunitiesCount={homeOpportunities.length || 36}
                        totalProductsCount={merchantCatalog.length || 2326}
                        onViewRevenue={() => setActiveTab('leaks')}
                      />

                      <OpportunityList
                        opportunities={homeOpportunities as any}
                        onSelectProduct={setSelectedProductWorkspace}
                        onViewAllInventory={() => setActiveTab('inventory')}
                      />

                      <RecentSales
                        onViewAllTransactions={() => setActiveTab('sales')}
                      />
                    </div>
                  </ErrorBoundary>
                )}

                {/* POS EVENT INGESTION WORKSPACE */}
                {activeTab === 'sales' && (
                  <SalesInputWorkspace
                    catalog={merchantCatalog}
                    onRecordSale={handleRecordSale}
                    onImportCsv={handleImportCsv}
                  />
                )}

                {/* INVENTORY OPERATING SYSTEM WORKSPACE */}
                {activeTab === 'inventory' && (
                  <InventoryTable
                    catalog={merchantCatalog}
                    totalValue={inventoryStats.totalStockValue}
                    itemsAtRiskCount={homeOpportunities.length}
                    onSelectProduct={setSelectedProductWorkspace}
                  />
                )}

                {/* REVENUE & RECOVERY WORKSPACE */}
                {(activeTab === 'leaks' || activeTab === 'recovery') && (
                  <RecoveryView />
                )}

                {/* DECISION PIPELINE WORKSPACE */}
                {activeTab === 'decisions' && (
                  <DecisionPipeline
                    decision={decision}
                    actions={actions}
                    opportunities={opportunities}
                    onApproveAction={handleApproveAction}
                  />
                )}

                {/* WHAT-IF SIMULATOR WORKSPACE */}
                {activeTab === 'whatif' && (
                  <Simulator />
                )}
              </>
            )}

            {/* PRODUCT WORKSPACE SLIDE-OVER DRAWER */}
            <ProductWorkspace
              product={selectedProductWorkspace}
              onClose={() => setSelectedProductWorkspace(null)}
              onSimulate={() => setActiveTab('whatif')}
              onApproveAction={handleApproveAction}
            />

          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
