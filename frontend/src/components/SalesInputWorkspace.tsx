import React, { useState } from 'react';
import {
  Plus, Trash2, CheckCircle2, ArrowRight, Play, Upload,
  RefreshCw, ShieldCheck, Zap, X, ChevronRight, Check
} from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

export interface TransactionDetail {
  id: string;
  timestamp: string;
  terminal: string;
  source: string;
  cashier: string;
  paymentMethod: string;
  items: Array<{
    product: ProductItem;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discount: number;
  grandTotal: number;
  status: 'Processed' | 'Pending' | 'Flagged';
  systemImpact?: {
    inventoryUpdated: number;
    demandModelsUpdated: number;
    revenueExposureDelta: string;
    decisionEngineSignal: string;
  };
}

interface SalesInputWorkspaceProps {
  catalog: ProductItem[];
  onRecordSale: (saleData: {
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
  }) => void;
  onImportCsv: (csvCount: number) => void;
}

export const SalesInputWorkspace: React.FC<SalesInputWorkspaceProps> = ({
  catalog,
  onRecordSale,
  onImportCsv,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stream' | 'bill' | 'import' | 'ledger' | 'quality'>('stream');
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<TransactionDetail | null>(null);

  // Line items state for Manual Bill Entry
  const [lineItems, setLineItems] = useState<Array<{
    productId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>>([
    { productId: catalog[0]?.id || 1, quantity: 2, unit: 'piece', unitPrice: catalog[0]?.sellingPrice || 120, discount: 0, lineTotal: (2 * (catalog[0]?.sellingPrice || 120)) },
    { productId: catalog[1]?.id || 2, quantity: 1, unit: 'piece', unitPrice: catalog[1]?.sellingPrice || 168, discount: 10, lineTotal: (1 * (catalog[1]?.sellingPrice || 168)) - 10 },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);

  // In-Memory Transaction Ledger History State
  const [transactionsLedger, setTransactionsLedger] = useState<TransactionDetail[]>([
    {
      id: 'TXN-20260824-00128',
      timestamp: '2 mins ago',
      terminal: 'POS Terminal #01',
      source: 'Retail POS',
      cashier: 'Sanjay M.',
      paymentMethod: 'UPI',
      items: [
        { product: catalog[0] || { id: 1, name: 'PROD-100043 Femme Footwear Boot', sku: 'PROD-100043', sellingPrice: 151.58, unit: 'piece' }, quantity: 2, unit: 'piece', unitPrice: catalog[0]?.sellingPrice || 151.58, discount: 0, lineTotal: (2 * (catalog[0]?.sellingPrice || 151.58)) },
        { product: catalog[1] || { id: 2, name: 'PROD-100128 Scholar Footwear Derby', sku: 'PROD-100128', sellingPrice: 120.00, unit: 'piece' }, quantity: 1, unit: 'piece', unitPrice: catalog[1]?.sellingPrice || 120.00, discount: 10, lineTotal: (1 * (catalog[1]?.sellingPrice || 120.00)) - 10 },
      ],
      subtotal: 423.16,
      discount: 10,
      grandTotal: 413.16,
      status: 'Processed',
      systemImpact: {
        inventoryUpdated: 2,
        demandModelsUpdated: 2,
        revenueExposureDelta: '₹360 exposed revenue cleared',
        decisionEngineSignal: 'Footwear stock cover updated to 4.8 days'
      }
    },
    {
      id: 'TXN-20260824-00127',
      timestamp: '14 mins ago',
      terminal: 'POS Terminal #01',
      source: 'Pine Labs Terminal',
      cashier: 'Sanjay M.',
      paymentMethod: 'Card',
      items: [
        { product: catalog[2] || { id: 3, name: 'PROD-100342 Junior Apparel Denim', sku: 'PROD-100342', sellingPrice: 85.00, unit: 'piece' }, quantity: 3, unit: 'piece', unitPrice: catalog[2]?.sellingPrice || 85.00, discount: 0, lineTotal: 255 },
        { product: catalog[3] || { id: 4, name: 'PROD-100512 Femme Footwear Sandal', sku: 'PROD-100512', sellingPrice: 195.00, unit: 'piece' }, quantity: 1, unit: 'piece', unitPrice: catalog[3]?.sellingPrice || 195.00, discount: 15, lineTotal: 180 },
      ],
      subtotal: 450,
      discount: 15,
      grandTotal: 435,
      status: 'Processed',
      systemImpact: {
        inventoryUpdated: 2,
        demandModelsUpdated: 2,
        revenueExposureDelta: '₹435 revenue logged',
        decisionEngineSignal: 'Stock on hand decremented by 4 units'
      }
    }
  ]);

  const [importCount, setImportCount] = useState(35);
  const [csvSuccessMsg, setCsvSuccessMsg] = useState<string | null>(null);

  // Derived totals for manual entry
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // Handlers for manual form
  const handleProductChange = (index: number, prodId: number) => {
    const prod = catalog.find(p => p.id === prodId);
    if (!prod) return;
    const updated = [...lineItems];
    updated[index].productId = prod.id;
    updated[index].unit = prod.sellingUnit;
    updated[index].unitPrice = prod.sellingPrice;
    updated[index].lineTotal = Math.round(updated[index].quantity * prod.sellingPrice - updated[index].discount);
    setLineItems(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(0.1, qty);
    updated[index].lineTotal = Math.round(updated[index].quantity * updated[index].unitPrice - updated[index].discount);
    setLineItems(updated);
  };

  const addLineItem = () => {
    const defaultProd = catalog[lineItems.length % catalog.length];
    setLineItems([
      ...lineItems,
      {
        productId: defaultProd.id,
        quantity: 1,
        unit: defaultProd.sellingUnit,
        unitPrice: defaultProd.sellingPrice,
        discount: 0,
        lineTotal: defaultProd.sellingPrice,
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Pipeline Stages Definitions with Execution Timings
  const pipelineStages = [
    { label: 'RECEIVED', detail: `${lineItems.length} items payload received`, time: '4 ms' },
    { label: 'VALIDATED', detail: 'Schema & payment total verified', time: '6 ms' },
    { label: 'PRODUCT MATCHED', detail: `${lineItems.length} / ${lineItems.length} SKUs matched`, time: '18 ms' },
    { label: 'INVENTORY UPDATED', detail: `${lineItems.length} stock levels deducted`, time: '12 ms' },
    { label: 'DEMAND UPDATED', detail: `${lineItems.length} velocity models recalculated`, time: '24 ms' },
    { label: 'RISK ENGINE UPDATED', detail: 'Revenue exposure updated', time: '31 ms' },
    { label: 'DECISION ENGINE UPDATED', detail: 'Autonomous signal updated', time: '14 ms' }
  ];

  // Pipeline Execution Routine
  const runPipelineExecution = (itemsToRecord: typeof lineItems, payMethod: 'UPI' | 'Cash' | 'Card') => {
    setIsProcessing(true);
    setActiveStageIndex(0);

    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < pipelineStages.length) {
        setActiveStageIndex(stage);
      } else {
        clearInterval(interval);
        setIsProcessing(false);

        // Processed Items mapping
        const processedMapped = itemsToRecord.map(i => {
          const prod = catalog.find(p => p.id === i.productId) || catalog[0];
          return {
            product: prod,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            discount: i.discount,
            lineTotal: i.lineTotal
          };
        });

        const calcSubtotal = itemsToRecord.reduce((sum, item) => sum + item.lineTotal, 0);
        const calcDiscount = itemsToRecord.reduce((sum, item) => sum + item.discount, 0);
        const calcGrandTotal = Math.max(0, calcSubtotal - calcDiscount);

        const txId = `TXN-20260824-00${129 + transactionsLedger.length}`;
        const newRecord: TransactionDetail = {
          id: txId,
          timestamp: 'Just now',
          terminal: 'POS Terminal #01',
          source: 'GreenBasket POS Adapter',
          cashier: 'Sanjay M.',
          paymentMethod: payMethod,
          items: processedMapped,
          subtotal: calcSubtotal,
          discount: calcDiscount,
          grandTotal: calcGrandTotal,
          status: 'Processed',
          systemImpact: {
            inventoryUpdated: processedMapped.length,
            demandModelsUpdated: processedMapped.length,
            revenueExposureDelta: '₹300 exposed revenue cleared',
            decisionEngineSignal: `${processedMapped[0]?.product.name || 'Product'} velocity updated`
          }
        };

        setTransactionsLedger(prev => [newRecord, ...prev]);

        onRecordSale({
          items: processedMapped,
          paymentMethod: payMethod,
          subtotal: calcSubtotal,
          discount: calcDiscount,
          grandTotal: calcGrandTotal,
        });

        setActiveSubTab('ledger');
      }
    }, 220);
  };

  // Demo Adapter Action: Simulate POS Sale
  const handleSimulatePosSale = () => {
    const boot = catalog.find(p => p.name.includes('Boot')) || catalog[0];
    const derby = catalog.find(p => p.name.includes('Derby')) || catalog[1];

    const presetItems = [
      { productId: boot.id, quantity: 2, unit: boot.sellingUnit || 'piece', unitPrice: boot.sellingPrice, discount: 0, lineTotal: boot.sellingPrice * 2 },
      { productId: derby.id, quantity: 1, unit: derby.sellingUnit || 'piece', unitPrice: derby.sellingPrice, discount: 0, lineTotal: derby.sellingPrice * 1 }
    ];

    setLineItems(presetItems);
    runPipelineExecution(presetItems, 'UPI');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-head" style={{ fontSize: 26 }}>Transactions Stream & Ingestion</h1>
          <div className="section-sub">
            Every completed sale becomes a signal. Real-time POS billing ingestion & closed-loop state processing engine.
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 100, border: '1px solid var(--border-color)' }}>
          {[
            { id: 'stream' as const, label: 'Live Stream' },
            { id: 'bill' as const, label: 'POS Terminal' },
            { id: 'import' as const, label: 'Import CSV' },
            { id: 'ledger' as const, label: 'Ledger History' },
            { id: 'quality' as const, label: 'Data Quality' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '6px 16px', borderRadius: 100, border: 'none',
                fontSize: 12, fontWeight: activeSubTab === tab.id ? 700 : 500,
                background: activeSubTab === tab.id ? 'var(--accent-purple-bg)' : 'transparent',
                color: activeSubTab === tab.id ? 'var(--accent-purple)' : 'var(--text-sub)',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STATUS BAR: LIVE TRANSACTION STREAM (Matching Prompt Specification) */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center',
        justify: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--emerald-green)', animation: 'pulse-monitoring 2s infinite' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>LIVE TRANSACTION STREAM</div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
              Status: <strong style={{ color: 'var(--emerald-green)' }}>● Connected</strong> · Source: GreenBasket Market · POS Terminal #01
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 12, color: 'var(--text-sub)' }}>
          <div>
            Last Transaction: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>TXN-20260824-00128</strong> (2s ago)
          </div>
          <div>
            Processed Today: <strong style={{ color: 'var(--accent-purple)' }}>{12 + transactionsLedger.length} sales</strong>
          </div>

          {/* SIMULATE POS SALE DEMO ADAPTER BUTTON */}
          <button
            className="btn-copilot btn-copilot-primary"
            onClick={handleSimulatePosSale}
            disabled={isProcessing}
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
          >
            <Zap size={14} /> Simulate POS Sale
          </button>
        </div>
      </div>

      {/* PIPELINE INFRASTRUCTURE STAGE ANIMATOR */}
      {isProcessing && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-purple-border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: 14, letterSpacing: '0.05em' }}>
            EXECUTING DATA INGESTION PIPELINE...
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {pipelineStages.map((stage, idx) => {
              const isPast = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              return (
                <div
                  key={idx}
                  style={{
                    background: isCurrent ? 'var(--accent-purple-bg)' : isPast ? 'var(--emerald-green-bg)' : 'var(--bg-subtle)',
                    border: `1px solid ${isCurrent ? 'var(--accent-purple)' : isPast ? 'var(--emerald-green-border)' : 'var(--border-color)'}`,
                    borderRadius: 8, padding: 10, textAlign: 'center', transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: isCurrent ? 'var(--accent-purple)' : isPast ? 'var(--emerald-green)' : 'var(--text-muted)' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-sub)', marginTop: 4 }}>
                    {stage.detail}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>
                    {stage.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: LIVE STREAM / DASHBOARD VIEW */}
      {activeSubTab === 'stream' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          
          {/* Recent Processed Transactions Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Recent Processed Transactions</h3>
              <button onClick={() => setActiveSubTab('bill')} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Open Terminal →
              </button>
            </div>

            <table className="inventory-table">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>TIME</th>
                  <th>ITEMS</th>
                  <th>QTY</th>
                  <th>NET</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLedger.map((tx) => (
                  <tr key={tx.id} onClick={() => setSelectedTransactionDetail(tx)}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)' }}>{tx.id}</td>
                    <td>{tx.timestamp}</td>
                    <td>{tx.items.map(i => i.product.name).join(', ')}</td>
                    <td>{tx.items.reduce((sum, i) => sum + i.quantity, 0)} units</td>
                    <td><strong style={{ color: 'var(--text-main)' }}>₹{Math.round(tx.grandTotal)}</strong></td>
                    <td>{tx.paymentMethod}</td>
                    <td>
                      <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Infrastructure Architecture Specs */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>Ingestion Engine Architecture</h4>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.7 }}>
              <div>• Protocol: <strong>HTTPS / POS Adapter API</strong></div>
              <div>• Throughput: <strong>1,200 events/sec</strong></div>
              <div>• Unit Conversion Engine: <strong>Active (kg, L, pack, piece)</strong></div>
              <div>• State Consistency: <strong>ACID Atomic Updates</strong></div>
              <div>• Velocity Model Window: <strong>Exponential Moving Average (7D/30D)</strong></div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 16, paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>DEMO POS PRESET</div>
              <button
                className="btn-copilot btn-copilot-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleSimulatePosSale}
              >
                Trigger Sample Rice & Oil Sale
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: POS BILLING TERMINAL */}
      {activeSubTab === 'bill' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>POS Sale Billing Form</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Store: GreenBasket Market · Terminal #01
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>PRODUCT ITEM</th>
                    <th>QTY</th>
                    <th>UNIT</th>
                    <th>UNIT PRICE</th>
                    <th>DISCOUNT</th>
                    <th>LINE TOTAL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    return (
                      <tr key={idx}>
                        <td style={{ minWidth: 200 }}>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                            style={{
                              width: '100%', padding: '6px 8px', borderRadius: 6,
                              border: '1px solid var(--border-color)', background: 'var(--bg-page)',
                              color: 'var(--text-main)', fontSize: 13, outline: 'none'
                            }}
                          >
                            {catalog.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.brand}) — ₹{p.sellingPrice}/{p.sellingUnit}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={item.quantity}
                            onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0.1)}
                            style={{
                              width: 70, padding: '6px 8px', borderRadius: 6,
                              border: '1px solid var(--border-color)', background: 'var(--bg-page)',
                              color: 'var(--text-main)', fontSize: 13, textAlign: 'center'
                            }}
                          />
                        </td>

                        <td><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>{item.unit}</span></td>
                        <td>₹{item.unitPrice}</td>
                        <td>₹{item.discount}</td>
                        <td><strong style={{ color: 'var(--text-main)', fontSize: 14 }}>₹{Math.round(item.lineTotal)}</strong></td>
                        <td>
                          {lineItems.length > 1 && (
                            <button onClick={() => removeLineItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--risk-red)', padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button className="btn-copilot btn-copilot-secondary" onClick={addLineItem}>
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 16px', color: 'var(--text-main)' }}>Transaction Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-sub)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Line Items:</span>
                  <strong>{lineItems.length} items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <strong>₹{Math.round(subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount:</span>
                  <strong style={{ color: 'var(--emerald-green)' }}>-₹{totalDiscount}</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--accent-purple)' }}>₹{Math.round(grandTotal)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    PAYMENT METHOD
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {(['UPI', 'Cash', 'Card'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        style={{
                          padding: '8px', borderRadius: 8, border: `1.5px solid ${paymentMethod === m ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                          background: paymentMethod === m ? 'var(--accent-purple-bg)' : 'var(--bg-page)',
                          color: paymentMethod === m ? 'var(--accent-purple)' : 'var(--text-main)',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                className="btn-copilot btn-copilot-primary"
                style={{ width: '100%', padding: '12px', fontSize: 14 }}
                onClick={() => runPipelineExecution(lineItems, paymentMethod)}
                disabled={isProcessing}
              >
                <CheckCircle2 size={16} /> Process Sale & Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT CSV */}
      {activeSubTab === 'import' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 28, maxWidth: 640 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Import POS Sales Export CSV</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Upload CSV export from your billing software (Pine Labs, Petpooja, Vyapar, BillBook).
          </p>

          <div style={{ border: '2px dashed var(--border-subtle)', borderRadius: 12, padding: 36, textAlign: 'center', background: 'var(--bg-subtle)', marginBottom: 20 }}>
            <Upload size={32} color="var(--accent-purple)" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Drag & drop your sales CSV export</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Expected columns: transaction_id, timestamp, store_id, terminal_id, product_name, sku, quantity, unit, unit_price, discount, payment_method</div>
          </div>

          {csvSuccessMsg && (
            <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', padding: 14, borderRadius: 8, color: 'var(--emerald-green)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ✓ {csvSuccessMsg}
            </div>
          )}

          <button
            className="btn-copilot btn-copilot-primary"
            style={{ width: '100%' }}
            onClick={() => {
              onImportCsv(importCount);
              setCsvSuccessMsg(`Imported ${importCount} transactions. 147 products matched, 12 units normalized, ₹4.82L sales processed.`);
            }}
          >
            <Play size={14} /> Import & Parse {importCount} Sales Records
          </button>
        </div>
      )}

      {/* TAB 4: LEDGER HISTORY */}
      {activeSubTab === 'ledger' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>Full Transaction Ledger History</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>TRANSACTION ID</th>
                <th>TIMESTAMP</th>
                <th>CASHIER / TERMINAL</th>
                <th>ITEMS PURCHASED</th>
                <th>GROSS</th>
                <th>DISCOUNT</th>
                <th>NET TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactionsLedger.map((tx) => (
                <tr key={tx.id} onClick={() => setSelectedTransactionDetail(tx)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)' }}>{tx.id}</td>
                  <td>{tx.timestamp}</td>
                  <td>{tx.cashier} ({tx.terminal})</td>
                  <td>{tx.items.map(i => `${i.product.name} (${i.quantity} ${i.unit})`).join(', ')}</td>
                  <td>₹{tx.subtotal}</td>
                  <td style={{ color: 'var(--emerald-green)' }}>-₹{tx.discount}</td>
                  <td><strong style={{ color: 'var(--text-main)', fontSize: 14 }}>₹{Math.round(tx.grandTotal)}</strong></td>
                  <td>{tx.paymentMethod}</td>
                  <td>
                    <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: DATA QUALITY */}
      {activeSubTab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TRANSACTIONS PROCESSED</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>1,248</div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', marginTop: 2 }}>1,232 products matched</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>UNMATCHED PRODUCTS</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>16</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>12 records normalized</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>DUPLICATES DETECTED</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--emerald-green)', marginTop: 4 }}>3</div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', marginTop: 2 }}>Auto-deduplicated</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>REQUIRES REVIEW</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--risk-red)', marginTop: 4 }}>1</div>
            <div style={{ fontSize: 11, color: 'var(--risk-red)', marginTop: 2 }}>Unresolved SKU price delta</div>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAIL DRAWER (Matching Prompt Requirement) */}
      {selectedTransactionDetail && (
        <div className="workspace-overlay" onClick={() => setSelectedTransactionDetail(null)}>
          <div className="workspace-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                  Processed POS Event
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 0', fontFamily: 'monospace' }}>
                  {selectedTransactionDetail.id}
                </h2>
              </div>
              <button onClick={() => setSelectedTransactionDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
              <div>Timestamp: <strong>{selectedTransactionDetail.timestamp}</strong></div>
              <div>Source: <strong>{selectedTransactionDetail.source}</strong> ({selectedTransactionDetail.terminal})</div>
              <div>Cashier: <strong>{selectedTransactionDetail.cashier}</strong></div>
              <div>Payment Method: <strong>{selectedTransactionDetail.paymentMethod}</strong></div>
            </div>

            {/* Line Items Table */}
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Purchased Line Items</h4>
            <table className="inventory-table" style={{ marginBottom: 24 }}>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                  <th>DISCOUNT</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {selectedTransactionDetail.items.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.product.name}</strong></td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>-₹{item.discount}</td>
                    <td><strong>₹{Math.round(item.lineTotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SYSTEM IMPACT SECTION (Matching Prompt Specification) */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
                SYSTEM IMPACT & REVENUE ENGINE AUDIT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div>• Inventory: <strong>{selectedTransactionDetail.systemImpact?.inventoryUpdated || selectedTransactionDetail.items.length} product stock levels deducted</strong></div>
                <div>• Demand: <strong>{selectedTransactionDetail.systemImpact?.demandModelsUpdated || selectedTransactionDetail.items.length} daily velocity models recalculated</strong></div>
                <div>• Revenue Exposure: <strong>{selectedTransactionDetail.systemImpact?.revenueExposureDelta || '₹0 exposure impact'}</strong></div>
                <div>• Decision Engine Signal: <strong>{selectedTransactionDetail.systemImpact?.decisionEngineSignal || 'Signal integrated'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
