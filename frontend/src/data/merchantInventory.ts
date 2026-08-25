export interface ProductItem {
  id: number;
  sku: string;
  name: string;
  division: string;
  category: string;
  brand: string;
  sellingUnit: 'kg' | 'g' | 'L' | 'ml' | 'pack' | 'piece' | 'box' | 'dozen';
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
  stockValue: number;
  supplier: string;
  supplierLeadTimeDays: number;
  reorderLevel: number;
  dailyVelocity: number;
  trend3d: number; // percentage change e.g. -21 or +32
  trend7d: number; // percentage change
  forecastDemand: number;
  marginPct: number;
  riskStatus: 'SLOW_MOVING' | 'STOCKOUT' | 'MARGIN_LEAK' | 'OVERSTOCK' | 'HEALTHY';
  revenueAtRisk: number;
  recoverableRevenue: number;
  recommendedAction: string;
  recommendationConfidence: number;
  demandSparkline: number[];
}

export const DIVISIONS = [
  'Scholar Footwear', 'Femme Footwear', 'Junior Apparel'
] as const;

export const CATEGORIES_BY_DIV: Record<string, string[]> = {
  'Scholar Footwear': [
    'Scholar Footwear Derby Classic',
    'Scholar Footwear School Trainer',
    'Scholar Footwear Slip-on Oxford',
    'Scholar Footwear Casual Sneaker'
  ],
  'Femme Footwear': [
    'Femme Footwear Boot Collection',
    'Femme Footwear Sandal Studio',
    'Femme Footwear Stiletto Elegance',
    'Femme Footwear Ballet Flat'
  ],
  'Junior Apparel': [
    'Junior Apparel Denim Essentials',
    'Junior Apparel Sport Active',
    'Junior Apparel Winter Knitwear',
    'Junior Apparel Summer Graphic Tee'
  ]
};

// Realistic Seed Dataset derived from retail_sales_ml_apl.csv & retail_inventory_ml_apl.csv
const REAL_PRODUCTS_SEED: Array<{
  sku: string;
  name: string;
  division: string;
  category: string;
  supplier: string;
  price: number;
  cost: number;
  stock: number;
  velocity: number;
  risk: ProductItem['riskStatus'];
  action: string;
}> = [
  { sku: 'PROD-100043', name: 'PROD-189472 SEG-520541 Femme Footwear Boot Collection Plushfoot', division: 'Femme Footwear', category: 'Femme Footwear Boot Collection', supplier: 'Vendor 0064', price: 151.58, cost: 64.94, stock: 84, velocity: 0.8, risk: 'SLOW_MOVING', action: 'Review markdown strategy' },
  { sku: 'PROD-100128', name: 'PROD-100128 Scholar Footwear Derby Classic Black', division: 'Scholar Footwear', category: 'Scholar Footwear Derby Classic', supplier: 'Vendor 0012', price: 120.00, cost: 55.00, stock: 12, velocity: 4.5, risk: 'STOCKOUT', action: 'Replenish 25 units' },
  { sku: 'PROD-100342', name: 'PROD-100342 Junior Apparel Denim Essentials Indigo', division: 'Junior Apparel', category: 'Junior Apparel Denim Essentials', supplier: 'Vendor 0089', price: 85.00, cost: 68.00, stock: 140, velocity: 1.2, risk: 'MARGIN_LEAK', action: 'Review pricing & supplier cost' },
  { sku: 'PROD-100512', name: 'PROD-100512 Femme Footwear Sandal Studio Strap Gold', division: 'Femme Footwear', category: 'Femme Footwear Sandal Studio', supplier: 'Vendor 0045', price: 195.00, cost: 88.00, stock: 160, velocity: 0.5, risk: 'OVERSTOCK', action: 'Move excess inventory across stores' },
  { sku: 'PROD-100680', name: 'PROD-100680 Scholar Footwear School Trainer White', division: 'Scholar Footwear', category: 'Scholar Footwear School Trainer', supplier: 'Vendor 0012', price: 110.00, cost: 48.00, stock: 45, velocity: 3.2, risk: 'HEALTHY', action: 'Maintain Stock' },
  { sku: 'PROD-100791', name: 'PROD-100791 Junior Apparel Sport Active Hoodie', division: 'Junior Apparel', category: 'Junior Apparel Sport Active', supplier: 'Vendor 0089', price: 75.00, cost: 32.00, stock: 95, velocity: 0.6, risk: 'SLOW_MOVING', action: 'Review markdown strategy' },
  { sku: 'PROD-100844', name: 'PROD-100844 Femme Footwear Stiletto Elegance Velvet', division: 'Femme Footwear', category: 'Femme Footwear Stiletto Elegance', supplier: 'Vendor 0064', price: 240.00, cost: 110.00, stock: 8, velocity: 2.8, risk: 'STOCKOUT', action: 'Replenish 18 units' },
  { sku: 'PROD-100915', name: 'PROD-100915 Scholar Footwear Slip-on Oxford Tan', division: 'Scholar Footwear', category: 'Scholar Footwear Slip-on Oxford', supplier: 'Vendor 0012', price: 135.00, cost: 62.00, stock: 52, velocity: 2.1, risk: 'HEALTHY', action: 'Maintain Stock' },
  { sku: 'PROD-101030', name: 'PROD-101030 Junior Apparel Winter Knitwear Sweater', division: 'Junior Apparel', category: 'Junior Apparel Winter Knitwear', supplier: 'Vendor 0089', price: 92.00, cost: 74.00, stock: 110, velocity: 0.4, risk: 'MARGIN_LEAK', action: 'Review pricing & supplier cost' },
  { sku: 'PROD-101182', name: 'PROD-101182 Femme Footwear Ballet Flat Nude', division: 'Femme Footwear', category: 'Femme Footwear Ballet Flat', supplier: 'Vendor 0045', price: 125.00, cost: 52.00, stock: 38, velocity: 1.8, risk: 'HEALTHY', action: 'Maintain Stock' },
  { sku: 'PROD-101294', name: 'PROD-101294 Scholar Footwear Casual Sneaker Court', division: 'Scholar Footwear', category: 'Scholar Footwear Casual Sneaker', supplier: 'Vendor 0012', price: 145.00, cost: 65.00, stock: 130, velocity: 0.9, risk: 'OVERSTOCK', action: 'Move excess inventory across stores' },
  { sku: 'PROD-101350', name: 'PROD-101350 Junior Apparel Summer Graphic Tee Pack', division: 'Junior Apparel', category: 'Junior Apparel Summer Graphic Tee', supplier: 'Vendor 0089', price: 45.00, cost: 18.00, stock: 64, velocity: 3.5, risk: 'HEALTHY', action: 'Maintain Stock' },
];

export function generateMerchantInventory(): ProductItem[] {
  const items: ProductItem[] = [];

  for (let i = 0; i < 150; i++) {
    const seed = REAL_PRODUCTS_SEED[i % REAL_PRODUCTS_SEED.length];
    const id = 1000 + i;
    const sku = i < REAL_PRODUCTS_SEED.length ? seed.sku : `PROD-1${(0000 + i).toString().padStart(5, '0')}`;
    const name = i < REAL_PRODUCTS_SEED.length ? seed.name : `${seed.division} ${seed.category.split(' ')[2] || 'Item'} Variant #${i + 1}`;
    
    const sellingPrice = seed.price + (i % 7) * 5;
    const costPrice = seed.cost + (i % 5) * 2;
    const marginPct = Math.round(((sellingPrice - costPrice) / sellingPrice) * 1000) / 10;
    const currentStock = Math.max(5, seed.stock + (i % 11) * 3 - (i % 7) * 2);
    const stockValue = Math.round(currentStock * sellingPrice);
    const dailyVelocity = Math.max(0.1, Math.round((seed.velocity + ((i % 5) - 2) * 0.3) * 10) / 10);
    const daysOfCover = Math.round((currentStock / Math.max(dailyVelocity, 0.1)) * 10) / 10;
    
    let riskStatus: ProductItem['riskStatus'] = seed.risk;
    if (i % 8 === 0) riskStatus = 'STOCKOUT';
    else if (i % 9 === 0) riskStatus = 'SLOW_MOVING';
    else if (i % 11 === 0) riskStatus = 'MARGIN_LEAK';
    else if (i % 13 === 0) riskStatus = 'OVERSTOCK';

    let revenueAtRisk = 0;
    let recoverableRevenue = 0;
    let recommendedAction = 'Maintain Stock';

    if (riskStatus === 'STOCKOUT') {
      const shortage = Math.max(10, Math.round(dailyVelocity * 14 - currentStock));
      revenueAtRisk = Math.round(shortage * sellingPrice);
      recoverableRevenue = Math.round(revenueAtRisk * 0.9);
      recommendedAction = `Replenish ${shortage} units`;
    } else if (riskStatus === 'SLOW_MOVING') {
      revenueAtRisk = Math.round(currentStock * costPrice);
      recoverableRevenue = Math.round(revenueAtRisk * 0.65);
      recommendedAction = 'Review markdown strategy';
    } else if (riskStatus === 'MARGIN_LEAK') {
      revenueAtRisk = Math.round(currentStock * (sellingPrice - costPrice) * 0.4);
      recoverableRevenue = Math.round(revenueAtRisk * 0.8);
      recommendedAction = 'Review pricing & supplier cost';
    } else if (riskStatus === 'OVERSTOCK') {
      revenueAtRisk = Math.round(currentStock * costPrice * 0.5);
      recoverableRevenue = Math.round(revenueAtRisk * 0.5);
      recommendedAction = 'Move excess inventory across stores';
    }

    items.push({
      id,
      sku,
      name,
      division: seed.division,
      category: seed.category,
      brand: seed.supplier,
      sellingUnit: 'piece',
      sellingPrice,
      costPrice,
      currentStock,
      stockValue,
      supplier: seed.supplier,
      supplierLeadTimeDays: 3,
      reorderLevel: Math.round(dailyVelocity * 4),
      dailyVelocity,
      trend3d: riskStatus === 'SLOW_MOVING' ? -24 : riskStatus === 'STOCKOUT' ? 31 : (i % 2 === 0 ? 12 : -8),
      trend7d: riskStatus === 'SLOW_MOVING' ? -18 : riskStatus === 'STOCKOUT' ? 25 : (i % 2 === 0 ? 15 : -5),
      forecastDemand: Math.round(dailyVelocity * 7),
      marginPct,
      riskStatus,
      revenueAtRisk,
      recoverableRevenue,
      recommendedAction,
      recommendationConfidence: 0.92,
      demandSparkline: [
        Math.max(1, Math.round(dailyVelocity * 0.8)),
        Math.max(1, Math.round(dailyVelocity * 0.9)),
        Math.max(1, Math.round(dailyVelocity * 1.0)),
        Math.max(1, Math.round(dailyVelocity * 1.1)),
        Math.max(1, Math.round(dailyVelocity * 1.0)),
        Math.max(1, Math.round(dailyVelocity * 1.2)),
        Math.max(1, Math.round(dailyVelocity * 1.3)),
      ]
    });
  }

  return items;
}

export function getInventoryStats(items: ProductItem[]) {
  const totalItems = items.length;
  const totalStockUnits = items.reduce((acc, item) => acc + item.currentStock, 0);
  const totalStockValue = items.reduce((acc, item) => acc + item.stockValue, 0);
  const totalRevenueAtRisk = items.reduce((acc, item) => acc + item.revenueAtRisk, 0);
  const totalRecoverable = items.reduce((acc, item) => acc + item.recoverableRevenue, 0);

  const stockoutCount = items.filter(i => i.riskStatus === 'STOCKOUT').length;
  const slowMovingCount = items.filter(i => i.riskStatus === 'SLOW_MOVING').length;
  const marginLeakCount = items.filter(i => i.riskStatus === 'MARGIN_LEAK').length;
  const overstockCount = items.filter(i => i.riskStatus === 'OVERSTOCK').length;
  const healthyCount = items.filter(i => i.riskStatus === 'HEALTHY').length;

  return {
    totalItems,
    totalStockUnits,
    totalStockValue,
    totalRevenueAtRisk,
    totalRecoverable,
    stockoutCount,
    slowMovingCount,
    marginLeakCount,
    overstockCount,
    healthyCount,
  };
}
