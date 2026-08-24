import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { ProductItem } from '../data/merchantInventory';
import { Sparkline } from './Sparkline';

interface InventoryTableProps {
  catalog: ProductItem[];
  totalValue: number;
  itemsAtRiskCount: number;
  onSelectProduct: (item: ProductItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  catalog,
  totalValue,
  itemsAtRiskCount,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'stock' | 'velocity' | 'value'>('risk');

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const suppliers = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach(p => set.add(p.supplier));
    return Array.from(set).sort();
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    let result = catalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesRisk = selectedRiskFilter === 'ALL' || item.riskStatus === selectedRiskFilter;
      const matchesSupplier = selectedSupplier === 'ALL' || item.supplier === selectedSupplier;

      return matchesSearch && matchesCategory && matchesRisk && matchesSupplier;
    });

    result.sort((a, b) => {
      if (sortBy === 'risk') return b.revenueAtRisk - a.revenueAtRisk;
      if (sortBy === 'stock') return b.currentStock - a.currentStock;
      if (sortBy === 'velocity') return b.dailyVelocity - a.dailyVelocity;
      if (sortBy === 'value') return b.stockValue - a.stockValue;
      return 0;
    });

    return result;
  }, [catalog, searchQuery, selectedCategory, selectedRiskFilter, selectedSupplier, sortBy]);

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'EXPIRY':     return { label: 'Expiry risk',   bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'STOCKOUT':   return { label: 'Stockout risk', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'MARGIN_LEAK':return { label: 'Margin leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'Overstock',     bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:           return { label: 'Healthy',       bg: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: 'var(--emerald-green-border)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Operating System Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-head" style={{ fontSize: 26 }}>Inventory Operating System</h1>
          <div className="section-sub">
            {catalog.length} products · {fmt(totalValue)} catalog value · {itemsAtRiskCount} risks · 94% inventory health
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>CATALOG VALUE</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{fmt(totalValue)}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--risk-red)', fontWeight: 700 }}>ACTIVE RISKS</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--risk-red)', marginTop: 1 }}>{itemsAtRiskCount} items</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-surface)',
        padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            placeholder="Search product, SKU or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
              border: '1px solid var(--border-color)', background: 'var(--bg-page)',
              color: 'var(--text-main)', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
          }}
        >
          <option value="ALL">All Categories</option>
          {['Dairy', 'Beverages', 'Bakery', 'Staples', 'Snacks', 'Personal Care', 'Household', 'Frozen Foods', 'Fruits & Vegetables', 'Packaged Foods'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Risk Filter */}
        <select
          value={selectedRiskFilter}
          onChange={(e) => setSelectedRiskFilter(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
          }}
        >
          <option value="ALL">All Risks</option>
          <option value="EXPIRY">Expiry Risk</option>
          <option value="STOCKOUT">Stockout Risk</option>
          <option value="MARGIN_LEAK">Margin Leak</option>
          <option value="OVERSTOCK">Overstock</option>
          <option value="HEALTHY">Healthy</option>
        </select>

        {/* Supplier Filter */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
            maxWidth: 160
          }}
        >
          <option value="ALL">All Suppliers</option>
          {suppliers.slice(0, 10).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
          }}
        >
          <option value="risk">Sort: Risk Priority</option>
          <option value="stock">Sort: Stock Level</option>
          <option value="velocity">Sort: Velocity</option>
          <option value="value">Sort: Stock Value</option>
        </select>
      </div>

      {/* Catalog Operating System Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>SKU</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>UNIT STOCK</th>
              <th>VELOCITY</th>
              <th>MARGIN</th>
              <th>EXPIRY</th>
              <th>RISK</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalog.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No products matched your search or filters.
                </td>
              </tr>
            ) : (
              filteredCatalog.map((item) => {
                const badge = riskBadgeStyle(item.riskStatus);
                const isHealthy = item.riskStatus === 'HEALTHY';
                return (
                  <tr
                    key={item.id}
                    className={isHealthy ? 'row-healthy' : ''}
                    onClick={() => onSelectProduct(item)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.brand}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                      {item.sku}
                    </td>
                    <td>{item.category}</td>
                    <td>₹{item.sellingPrice}/{item.sellingUnit}</td>
                    <td>
                      <strong>{item.currentStock}</strong> {item.sellingUnit}s
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.dailyVelocity} {item.sellingUnit}/day</span>
                        <Sparkline data={item.demandSparkline} isNegative={item.trend3d < 0} />
                      </div>
                    </td>
                    <td style={{ color: 'var(--emerald-green)', fontWeight: 600 }}>
                      {(item.marginPct * 100).toFixed(1)}%
                    </td>
                    <td>
                      {item.expiryDays !== null ? (
                        <span style={{ color: item.expiryDays <= 3 ? 'var(--risk-red)' : 'var(--text-main)', fontWeight: item.expiryDays <= 3 ? 700 : 400 }}>
                          {item.expiryDays} days
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span className="badge-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <button className="btn-copilot btn-copilot-ghost" style={{ padding: '4px 8px', fontSize: 12 }}>
                        View intelligence →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
