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
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'stock' | 'velocity' | 'value'>('risk');

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const divisions = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach(p => p.division && set.add(p.division));
    return Array.from(set).sort();
  }, [catalog]);

  const suppliers = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach(p => p.supplier && set.add(p.supplier));
    return Array.from(set).sort();
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    let result = catalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDivision = selectedDivision === 'ALL' || item.division === selectedDivision;
      const matchesRisk = selectedRiskFilter === 'ALL' || item.riskStatus === selectedRiskFilter;
      const matchesSupplier = selectedSupplier === 'ALL' || item.supplier === selectedSupplier;

      return matchesSearch && matchesDivision && matchesRisk && matchesSupplier;
    });

    result.sort((a, b) => {
      if (sortBy === 'risk') return b.revenueAtRisk - a.revenueAtRisk;
      if (sortBy === 'stock') return b.currentStock - a.currentStock;
      if (sortBy === 'velocity') return b.dailyVelocity - a.dailyVelocity;
      if (sortBy === 'value') return b.stockValue - a.stockValue;
      return 0;
    });

    return result;
  }, [catalog, searchQuery, selectedDivision, selectedRiskFilter, selectedSupplier, sortBy]);

  const riskBadgeStyle = (status: ProductItem['riskStatus']) => {
    switch (status) {
      case 'SLOW_MOVING': return { label: 'Slow moving', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'STOCKOUT':   return { label: 'Stockout risk', bg: 'var(--risk-red-bg)', color: 'var(--risk-red)', border: 'var(--risk-red-border)' };
      case 'MARGIN_LEAK':return { label: 'Margin leak',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'OVERSTOCK':  return { label: 'Excess stock',  bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
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
            {catalog.length} dataset products · {fmt(totalValue)} catalog value · {itemsAtRiskCount} active risks
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
            placeholder="Search product, SKU or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
              border: '1px solid var(--border-color)', background: 'var(--bg-page)',
              color: 'var(--text-main)', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Division Filter */}
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-page)', color: 'var(--text-main)', fontSize: 13, outline: 'none',
          }}
        >
          <option value="ALL">All Divisions</option>
          {divisions.map(d => (
            <option key={d} value={d}>{d}</option>
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
          <option value="SLOW_MOVING">Slow Moving Inventory</option>
          <option value="STOCKOUT">Stockout Risk</option>
          <option value="MARGIN_LEAK">Margin Leak</option>
          <option value="OVERSTOCK">Excess Inventory</option>
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
              <th>DIVISION</th>
              <th>PRICE</th>
              <th>UNIT STOCK</th>
              <th>VELOCITY</th>
              <th>MARGIN</th>
              <th>STOCK COVER</th>
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
                const daysCover = Math.round(item.currentStock / Math.max(0.1, item.dailyVelocity));
                return (
                  <tr
                    key={item.id}
                    className={isHealthy ? 'row-healthy' : ''}
                    onClick={() => onSelectProduct(item)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.supplier}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                      {item.sku}
                    </td>
                    <td>{item.division || item.category}</td>
                    <td>₹{item.sellingPrice.toFixed(2)}</td>
                    <td>
                      <strong>{item.currentStock}</strong> units
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.dailyVelocity}/day</span>
                        <Sparkline data={item.demandSparkline} isNegative={item.trend3d < 0} />
                      </div>
                    </td>
                    <td style={{ color: item.marginPct < 30 ? 'var(--risk-red)' : 'var(--emerald-green)', fontWeight: 600 }}>
                      {item.marginPct.toFixed(1)}%
                    </td>
                    <td>
                      <span style={{ color: daysCover < 5 ? 'var(--risk-red)' : 'var(--text-main)', fontWeight: daysCover < 5 ? 700 : 400 }}>
                        {daysCover} days
                      </span>
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
