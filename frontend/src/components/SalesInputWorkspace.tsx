import React, { useState } from 'react';
import {
  Plus, Trash2, CheckCircle2, ArrowRight, Play, Upload, FileText,
  RefreshCw, ShieldCheck, Database, Layers, Check
} from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';

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
  const [activeSubTab, setActiveSubTab] = useState<'bill' | 'import' | 'ledger' | 'quality'>('bill');
  
  // Billing Form Line Items
  const [lineItems, setLineItems] = useState<Array<{
    productId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>>([
    { productId: catalog[0]?.id || 1, quantity: 2.5, unit: 'kg', unitPrice: catalog[0]?.sellingPrice || 110, discount: 0, lineTotal: (2.5 * (catalog[0]?.sellingPrice || 110)) },
    { productId: catalog[1]?.id || 2, quantity: 2.0, unit: 'pack', unitPrice: catalog[1]?.sellingPrice || 31, discount: 0, lineTotal: (2.0 * (catalog[1]?.sellingPrice || 31)) },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [importCount, setImportCount] = useState(25);
  const [csvProcessedMsg, setCsvProcessedMsg] = useState<string | null>(null);

  // Derive totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // Line item change handler
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

  // Demo Presets Handler
  const applyPreset = (presetName: string) => {
    if (presetName === 'rice-oil') {
      const rice = catalog.find(p => p.name.includes('Rice')) || catalog[0];
      const oil = catalog.find(p => p.name.includes('Oil')) || catalog[1];
      setLineItems([
        { productId: rice.id, quantity: 2.5, unit: 'kg', unitPrice: rice.sellingPrice, discount: 0, lineTotal: 2.5 * rice.sellingPrice },
        { productId: oil.id, quantity: 1.5, unit: 'L', unitPrice: oil.sellingPrice, discount: 10, lineTotal: (1.5 * oil.sellingPrice) - 10 },
      ]);
    } else if (presetName === 'milk-bread') {
      const milk = catalog.find(p => p.name.includes('Milk')) || catalog[0];
      const bread = catalog.find(p => p.name.includes('Bread')) || catalog[1];
      setLineItems([
        { productId: milk.id, quantity: 2.0, unit: 'pack', unitPrice: milk.sellingPrice, discount: 0, lineTotal: 2 * milk.sellingPrice },
        { productId: bread.id, quantity: 1.0, unit: 'pack', unitPrice: bread.sellingPrice, discount: 5, lineTotal: bread.sellingPrice - 5 },
      ]);
    } else if (presetName === 'family') {
      const rice = catalog.find(p => p.name.includes('Rice')) || catalog[0];
      const milk = catalog.find(p => p.name.includes('Milk')) || catalog[1];
      const bread = catalog.find(p => p.name.includes('Bread')) || catalog[2];
      const salt = catalog.find(p => p.name.includes('Salt')) || catalog[3];
      setLineItems([
        { productId: rice.id, quantity: 5.0, unit: 'kg', unitPrice: rice.sellingPrice, discount: 20, lineTotal: 5 * rice.sellingPrice - 20 },
        { productId: milk.id, quantity: 3.0, unit: 'pack', unitPrice: milk.sellingPrice, discount: 0, lineTotal: 3 * milk.sellingPrice },
        { productId: bread.id, quantity: 2.0, unit: 'pack', unitPrice: bread.sellingPrice, discount: 0, lineTotal: 2 * bread.sellingPrice },
        { productId: salt.id, quantity: 1.0, unit: 'pack', unitPrice: salt.sellingPrice, discount: 0, lineTotal: salt.sellingPrice },
      ]);
    }
  };

  // Submit Sale Handler with Data Ingestion Pipeline Execution
  const handleSubmitSale = () => {
    setIsProcessing(true);
    const stages = [
      'RECEIVING SALE STREAM...',
      'VALIDATING TRANSACTION SCHEMA...',
      'UPDATING INVENTORY LEVELS & UNITS...',
      'RECALCULATING DEMAND VELOCITY...',
      'UPDATING REVENUE RISK INTELLIGENCE...'
    ];

    let current = 0;
    setProcessingStage(stages[0]);

    const interval = setInterval(() => {
      current++;
      if (current < stages.length) {
        setProcessingStage(stages[current]);
      } else {
        clearInterval(interval);
        setIsProcessing(false);

        // Map items
        const processedItems = lineItems.map(item => {
          const prod = catalog.find(p => p.id === item.productId)!;
          return {
            product: prod,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            discount: item.discount,
            lineTotal: item.lineTotal,
          };
        });

        onRecordSale({
          items: processedItems,
          paymentMethod,
          subtotal,
          discount: totalDiscount,
          grandTotal,
        });

        setActiveSubTab('ledger');
      }
    }, 350);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-head" style={{ fontSize: 26 }}>Sales Data Ingestion</h1>
          <div className="section-sub">
            Feed MerchIntell with your store's sales. Every bill becomes a signal for revenue, inventory and demand intelligence.
          </div>
        </div>

        {/* View Mode Selector */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 100, border: '1px solid var(--border-color)' }}>
          {[
            { id: 'bill' as const, label: 'Enter POS Bill' },
            { id: 'import' as const, label: 'Import CSV Sales' },
            { id: 'ledger' as const, label: 'Sales Ledger' },
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

      {/* Data Ingestion Pipeline Diagram */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 20px', overflowX: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
          REAL-TIME DATA INGESTION PIPELINE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, color: 'var(--text-main)', minWidth: 700, justifyContent: 'space-between' }}>
          <span>POS / BILL</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span>INGEST</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span>NORMALIZE</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span>SKU MATCH</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span>INVENTORY UPDATE</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span>VELOCITY RECALC</span> <ArrowRight size={12} color="var(--accent-purple)" />
          <span style={{ color: 'var(--accent-purple)' }}>REVENUE RISK SIGNAL</span>
        </div>
      </div>

      {/* TAB A: ENTER POS BILL */}
      {activeSubTab === 'bill' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          
          {/* Left: POS Bill Line Item Form */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>New Sale (POS Billing)</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Store: GreenBasket Market · Terminal #01 · TXN-20260824-00128
                </div>
              </div>

              {/* Demo Preset Buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-copilot btn-copilot-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => applyPreset('rice-oil')}>
                  Preset: Rice + Oil
                </button>
                <button className="btn-copilot btn-copilot-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => applyPreset('milk-bread')}>
                  Preset: Milk + Bread
                </button>
                <button className="btn-copilot btn-copilot-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => applyPreset('family')}>
                  Preset: Family Basket
                </button>
              </div>
            </div>

            {/* Line Items Table */}
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
                    const currentProd = catalog.find(p => p.id === item.productId) || catalog[0];
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

                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                            {item.unit}
                          </span>
                        </td>

                        <td>₹{item.unitPrice}</td>

                        <td>₹{item.discount}</td>

                        <td>
                          <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>₹{Math.round(item.lineTotal)}</strong>
                        </td>

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

          {/* Right: Bill Summary & Record Button */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 16px', color: 'var(--text-main)' }}>
                Transaction Summary
              </h4>

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

                {/* Payment Method Selector */}
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

            {/* Record Sale Action */}
            <div style={{ marginTop: 24 }}>
              {isProcessing ? (
                <div style={{ background: 'var(--accent-purple-bg)', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                  <RefreshCw size={18} color="var(--accent-purple)" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', marginTop: 6 }}>
                    {processingStage}
                  </div>
                </div>
              ) : (
                <button
                  className="btn-copilot btn-copilot-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 14 }}
                  onClick={handleSubmitSale}
                >
                  <CheckCircle2 size={16} /> Record Sale & Process Signal
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB B: IMPORT SALES (CSV IMPORT) */}
      {activeSubTab === 'import' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 28, maxWidth: 640 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Import POS Sales History</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Upload CSV export from your POS system (Pine Labs, Petpooja, Vyapar, BillBook, etc.).
          </p>

          <div style={{
            border: '2px dashed var(--border-subtle)', borderRadius: 12, padding: 36,
            textAlign: 'center', background: 'var(--bg-subtle)', marginBottom: 20
          }}>
            <Upload size={32} color="var(--accent-purple)" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Drag & drop your sales CSV here
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Expected columns: timestamp, transaction_id, sku, product, quantity, unit, unit_price, discount
            </div>
          </div>

          {csvProcessedMsg && (
            <div style={{ background: 'var(--emerald-green-bg)', border: '1px solid var(--emerald-green-border)', padding: 14, borderRadius: 8, color: 'var(--emerald-green)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ✓ {csvProcessedMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn-copilot btn-copilot-primary"
              style={{ flex: 1 }}
              onClick={() => {
                onImportCsv(importCount);
                setCsvProcessedMsg(`Successfully imported ${importCount} POS transactions. Inventory levels & demand signals updated.`);
              }}
            >
              <Play size={14} /> Import {importCount} Demo Transactions
            </button>
          </div>
        </div>
      )}

      {/* TAB C: SALES LEDGER */}
      {activeSubTab === 'ledger' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px' }}>Processed Sales Ledger</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>TRANSACTION ID</th>
                <th>TIMESTAMP</th>
                <th>PRODUCTS PURCHASED</th>
                <th>GRAND TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>TXN-20260824-00128</td>
                <td>Just now</td>
                <td>
                  {lineItems.map(i => {
                    const p = catalog.find(x => x.id === i.productId);
                    return `${p?.name || 'Product'} (${i.quantity} ${i.unit})`;
                  }).join(', ')}
                </td>
                <td><strong style={{ color: 'var(--accent-purple)' }}>₹{Math.round(grandTotal)}</strong></td>
                <td>{paymentMethod}</td>
                <td>
                  <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                    Processed
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>TXN-20260824-00127</td>
                <td>21:14 PM</td>
                <td>India Gate Basmati Rice (2.5 kg), Amul Taaza Milk 1L (2 pack)</td>
                <td><strong>₹337</strong></td>
                <td>UPI</td>
                <td>
                  <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                    Processed
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>TXN-20260824-00126</td>
                <td>20:58 PM</td>
                <td>Fortune Sunflower Oil 1L (1.5 L)</td>
                <td><strong>₹242</strong></td>
                <td>Cash</td>
                <td>
                  <span className="badge-pill" style={{ background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)' }}>
                    Processed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB D: DATA QUALITY */}
      {activeSubTab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>PROCESSED TRANSACTIONS</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>1,248</div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', marginTop: 2 }}>98.7% auto-matched</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>NORMALIZED RECORDS</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>12</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Unit conversion applied</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>REQUIRES REVIEW</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--risk-red)', marginTop: 4 }}>3</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Unmapped SKU codes</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL SALES INGESTED</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-purple)', marginTop: 4 }}>₹4.82L</div>
            <div style={{ fontSize: 11, color: 'var(--emerald-green)', marginTop: 2 }}>Synced with POS</div>
          </div>
        </div>
      )}

    </div>
  );
};
