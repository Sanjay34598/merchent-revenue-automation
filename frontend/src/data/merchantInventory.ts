export interface ProductItem {
  id: number;
  sku: string;
  name: string;
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
  expiryDays: number | null; // null if non-perishable
  dailyVelocity: number;
  trend3d: number; // percentage change e.g. -21 or +32
  trend7d: number; // percentage change
  forecastDemand: number;
  marginPct: number;
  riskStatus: 'EXPIRY' | 'STOCKOUT' | 'MARGIN_LEAK' | 'OVERSTOCK' | 'HEALTHY';
  revenueAtRisk: number;
  recoverableRevenue: number;
  recommendedAction: string;
  recommendationConfidence: number;
  demandSparkline: number[];
}

const CATEGORIES = [
  'Dairy', 'Beverages', 'Bakery', 'Staples', 'Snacks',
  'Personal Care', 'Household', 'Frozen Foods', 'Fruits & Vegetables', 'Packaged Foods'
] as const;

const BRANDS_BY_CAT: Record<string, string[]> = {
  Dairy: ['Amul', 'Nandini', 'Mother Dairy', 'Country Delight', 'Milky Mist'],
  Beverages: ['Real', 'Paper Boat', 'Tropicana', 'Nescafé', 'Tata Tea'],
  Bakery: ['Britannia', 'Modern', 'English Oven', 'Harvest Gold', 'Bisk Farm'],
  Staples: ['Fortune', 'Aashirvaad', 'Tata Sampann', 'Daawat', 'India Gate'],
  Snacks: ['Lays', 'Haldirams', 'Kurkure', 'Cadbury', 'Parle'],
  'Personal Care': ['Dove', 'Himalaya', 'Nivea', 'Colgate', 'Dabur'],
  Household: ['Vim', 'Surf Excel', 'Colin', 'Harpic', 'GoodKnight'],
  'Frozen Foods': ['McCain', 'Godrej Yummiez', 'Sumeru', 'Safal', 'Keventer'],
  'Fruits & Vegetables': ['FarmFresh', 'Organic Tattva', 'Fresho', 'Mother Earth', 'GreenBasket Local'],
  'Packaged Foods': ['Maggi', 'Knorr', 'Heinz', 'Quaker', 'Saffola'],
};

const ITEMS_BY_CAT: Record<string, Array<{ name: string; price: number; cost: number; perishable: boolean; unit: ProductItem['sellingUnit'] }>> = {
  Dairy: [
    { name: 'Fresh Milk 1L', price: 68, cost: 54, perishable: true, unit: 'pack' },
    { name: 'Fresh Paneer 200g', price: 120, cost: 95, perishable: true, unit: 'pack' },
    { name: 'Curd 500g', price: 45, cost: 34, perishable: true, unit: 'pack' },
    { name: 'Salted Butter 100g', price: 58, cost: 46, perishable: false, unit: 'pack' },
    { name: 'Cheese Slices 200g', price: 140, cost: 110, perishable: false, unit: 'pack' },
    { name: 'Pure Cow Ghee 500ml', price: 380, cost: 300, perishable: false, unit: 'L' },
    { name: 'Fresh Cream 200ml', price: 70, cost: 55, perishable: true, unit: 'pack' },
    { name: 'Chocolate Milk 200ml', price: 35, cost: 26, perishable: true, unit: 'pack' },
    { name: 'Greek Yogurt 100g', price: 50, cost: 38, perishable: true, unit: 'pack' },
    { name: 'Spiced Buttermilk 200ml', price: 20, cost: 14, perishable: true, unit: 'pack' },
    { name: 'Unsalted Khoya 250g', price: 160, cost: 125, perishable: true, unit: 'kg' },
    { name: 'Sweetened Milk 400g', price: 135, cost: 105, perishable: false, unit: 'pack' },
    { name: 'Skimmed Milk Powder 200g', price: 110, cost: 85, perishable: false, unit: 'pack' },
    { name: 'Mango Lassi 200ml', price: 30, cost: 22, perishable: true, unit: 'pack' },
    { name: 'Vanilla Ice Cream 1L', price: 220, cost: 165, perishable: false, unit: 'pack' },
  ],
  Beverages: [
    { name: 'Fresh Orange Juice 1L', price: 130, cost: 98, perishable: true, unit: 'pack' },
    { name: 'Tender Coconut Water 200ml', price: 50, cost: 36, perishable: true, unit: 'pack' },
    { name: 'Organic Coffee Beans 250g', price: 320, cost: 240, perishable: false, unit: 'pack' },
    { name: 'Green Tea 25 Bags', price: 180, cost: 135, perishable: false, unit: 'box' },
    { name: 'Premium Black Tea 500g', price: 260, cost: 195, perishable: false, unit: 'pack' },
    { name: 'Mango Nectar 1L', price: 110, cost: 82, perishable: false, unit: 'pack' },
    { name: 'Cold Brew Coffee 250ml', price: 140, cost: 100, perishable: true, unit: 'pack' },
    { name: 'Energy Drink 250ml', price: 125, cost: 90, perishable: false, unit: 'pack' },
    { name: 'Lemon Soda 300ml', price: 35, cost: 24, perishable: false, unit: 'pack' },
    { name: 'Chamomile Herbal Tea', price: 220, cost: 160, perishable: false, unit: 'box' },
    { name: 'Sparkling Mineral Water 750ml', price: 90, cost: 62, perishable: false, unit: 'pack' },
    { name: 'Fresh Lemonade 500ml', price: 40, cost: 28, perishable: true, unit: 'pack' },
    { name: 'Mix Fruit Punch 1L', price: 120, cost: 88, perishable: false, unit: 'pack' },
    { name: 'Peach Iced Tea 250ml', price: 60, cost: 42, perishable: false, unit: 'pack' },
    { name: 'Chocolate Malt Drink 500g', price: 240, cost: 180, perishable: false, unit: 'pack' },
  ],
  Bakery: [
    { name: 'Whole Wheat Bread 400g', price: 45, cost: 32, perishable: true, unit: 'pack' },
    { name: 'White Bread 400g', price: 40, cost: 28, perishable: true, unit: 'pack' },
    { name: 'Garlic Toast 150g', price: 65, cost: 46, perishable: false, unit: 'pack' },
    { name: 'Multi-Grain Rolls 4pk', price: 55, cost: 38, perishable: true, unit: 'pack' },
    { name: 'Pav Buns 6pk', price: 30, cost: 20, perishable: true, unit: 'pack' },
    { name: 'Milk Bread 400g', price: 48, cost: 34, perishable: true, unit: 'pack' },
    { name: 'Plum Fruit Cake 250g', price: 150, cost: 110, perishable: false, unit: 'pack' },
    { name: 'Chocolate Muffin 2pk', price: 80, cost: 56, perishable: true, unit: 'pack' },
    { name: 'Butter Croissant 2pk', price: 110, cost: 78, perishable: true, unit: 'pack' },
    { name: 'Crispy Toast Rusk 200g', price: 45, cost: 31, perishable: false, unit: 'pack' },
    { name: 'Sesame Bagels 2pk', price: 90, cost: 64, perishable: true, unit: 'pack' },
    { name: 'Glazed Donuts 2pk', price: 95, cost: 66, perishable: true, unit: 'pack' },
    { name: 'Sweet Fruit Buns 4pk', price: 42, cost: 29, perishable: true, unit: 'pack' },
    { name: 'Fudge Brownie 100g', price: 85, cost: 58, perishable: true, unit: 'piece' },
    { name: 'Oatmeal Cookies 200g', price: 120, cost: 84, perishable: false, unit: 'pack' },
  ],
  Staples: [
    { name: 'Premium Basmati Rice', price: 110, cost: 88, perishable: false, unit: 'kg' },
    { name: 'India Gate Basmati Rice', price: 120, cost: 94, perishable: false, unit: 'kg' },
    { name: 'Whole Wheat Atta 5kg', price: 260, cost: 205, perishable: false, unit: 'pack' },
    { name: 'Toor Dal 1kg', price: 165, cost: 130, perishable: false, unit: 'kg' },
    { name: 'Moong Dal 1kg', price: 145, cost: 112, perishable: false, unit: 'kg' },
    { name: 'Chana Dal 1kg', price: 110, cost: 84, perishable: false, unit: 'kg' },
    { name: 'Refined Sugar 1kg', price: 48, cost: 38, perishable: false, unit: 'kg' },
    { name: 'Iodized Crystal Salt 1kg', price: 24, cost: 17, perishable: false, unit: 'pack' },
    { name: 'Sunflower Oil 1L', price: 168, cost: 124, perishable: false, unit: 'L' },
    { name: 'Cold Pressed Mustard Oil 1L', price: 185, cost: 145, perishable: false, unit: 'L' },
    { name: 'Refined Maida 1kg', price: 52, cost: 39, perishable: false, unit: 'kg' },
    { name: 'Thick Poha 1kg', price: 60, cost: 44, perishable: false, unit: 'kg' },
    { name: 'Roasted Rava 1kg', price: 65, cost: 48, perishable: false, unit: 'kg' },
    { name: 'Soya Chunks 200g', price: 45, cost: 32, perishable: false, unit: 'pack' },
    { name: 'Organic Jaggery 1kg', price: 95, cost: 70, perishable: false, unit: 'kg' },
  ],
  Snacks: [
    { name: 'Classic Potato Chips 100g', price: 40, cost: 26, perishable: false, unit: 'pack' },
    { name: 'Masala Peanuts 150g', price: 55, cost: 36, perishable: false, unit: 'pack' },
    { name: 'Navratan Namkeen 200g', price: 65, cost: 44, perishable: false, unit: 'pack' },
    { name: 'Roasted Makhana 100g', price: 160, cost: 112, perishable: false, unit: 'pack' },
    { name: 'Dark Chocolate Bar 80g', price: 120, cost: 82, perishable: false, unit: 'piece' },
    { name: 'Butter Cookies Pack 200g', price: 75, cost: 50, perishable: false, unit: 'pack' },
    { name: 'Spiced Rice Crackers 100g', price: 50, cost: 34, perishable: false, unit: 'pack' },
    { name: 'Cheese Popcorn 80g', price: 60, cost: 40, perishable: false, unit: 'pack' },
    { name: 'Nacho Chips 150g', price: 85, cost: 58, perishable: false, unit: 'pack' },
    { name: 'Dried Fruit Mix 150g', price: 240, cost: 170, perishable: false, unit: 'pack' },
    { name: 'Bikaneri Bhujia 200g', price: 70, cost: 47, perishable: false, unit: 'pack' },
    { name: 'Salted Roasted Cashews 100g', price: 210, cost: 155, perishable: false, unit: 'pack' },
    { name: 'California Almonds 200g', price: 280, cost: 210, perishable: false, unit: 'pack' },
    { name: 'Protein Bar 50g', price: 90, cost: 62, perishable: false, unit: 'piece' },
    { name: 'Chocolate Wafer Roll 150g', price: 80, cost: 54, perishable: false, unit: 'pack' },
  ],
  'Personal Care': [
    { name: 'Herbal Shampoo 340ml', price: 240, cost: 165, perishable: false, unit: 'pack' },
    { name: 'Moisturizing Body Wash 250ml', price: 195, cost: 135, perishable: false, unit: 'pack' },
    { name: 'Herbal Toothpaste 200g', price: 115, cost: 78, perishable: false, unit: 'pack' },
    { name: 'Coconut Hair Oil 250ml', price: 135, cost: 95, perishable: false, unit: 'pack' },
    { name: 'Nourishing Skin Cream 100g', price: 180, cost: 122, perishable: false, unit: 'pack' },
    { name: 'Neem Face Wash 100ml', price: 140, cost: 94, perishable: false, unit: 'pack' },
    { name: 'Bathing Soap 4pk', price: 160, cost: 110, perishable: false, unit: 'pack' },
    { name: 'Deodorant Body Spray 150ml', price: 220, cost: 150, perishable: false, unit: 'pack' },
    { name: 'Twin Blade Razors 5pk', price: 110, cost: 75, perishable: false, unit: 'pack' },
    { name: 'SPF 50 Sunscreen 100ml', price: 340, cost: 235, perishable: false, unit: 'pack' },
    { name: 'Aloe Body Lotion 200ml', price: 210, cost: 142, perishable: false, unit: 'pack' },
    { name: 'Antiseptic Mouthwash 250ml', price: 165, cost: 112, perishable: false, unit: 'pack' },
    { name: 'Hair Conditioner 180ml', price: 210, cost: 144, perishable: false, unit: 'pack' },
    { name: 'Soft Facial Tissues 200s', price: 85, cost: 56, perishable: false, unit: 'box' },
    { name: 'Cotton Pads 50s', price: 65, cost: 42, perishable: false, unit: 'pack' },
  ],
  Household: [
    { name: 'Dishwash Gel 500ml', price: 125, cost: 86, perishable: false, unit: 'pack' },
    { name: 'Detergent Powder 1kg', price: 175, cost: 122, perishable: false, unit: 'pack' },
    { name: 'Floor Cleaner 1L', price: 190, cost: 130, perishable: false, unit: 'L' },
    { name: 'Toilet Cleaner 750ml', price: 145, cost: 98, perishable: false, unit: 'pack' },
    { name: 'Disinfectant Spray 240ml', price: 210, cost: 145, perishable: false, unit: 'pack' },
    { name: 'Garbage Bags 30s', price: 95, cost: 62, perishable: false, unit: 'pack' },
    { name: 'Fabric Wash Liquid 1L', price: 260, cost: 180, perishable: false, unit: 'L' },
    { name: 'Stainless Steel Scrubbers 3pk', price: 45, cost: 28, perishable: false, unit: 'pack' },
    { name: 'Room Air Freshener 220ml', price: 165, cost: 112, perishable: false, unit: 'pack' },
    { name: 'Fabric Conditioner 500ml', price: 180, cost: 124, perishable: false, unit: 'pack' },
    { name: 'Cellulose Sponge Wipes 3pk', price: 85, cost: 55, perishable: false, unit: 'pack' },
    { name: 'Kitchen Paper Towels 2rl', price: 110, cost: 74, perishable: false, unit: 'pack' },
    { name: 'Mosquito Liquid Refill 2pk', price: 170, cost: 118, perishable: false, unit: 'pack' },
    { name: 'Aluminum Foil Roll 18m', price: 140, cost: 95, perishable: false, unit: 'pack' },
    { name: 'Food Cling Wrap 30m', price: 120, cost: 80, perishable: false, unit: 'pack' },
  ],
  'Frozen Foods': [
    { name: 'Frozen Green Peas 500g', price: 95, cost: 65, perishable: false, unit: 'pack' },
    { name: 'Sweet Corn Frozen 500g', price: 110, cost: 76, perishable: false, unit: 'pack' },
    { name: 'Crispy Veg Nuggets 400g', price: 165, cost: 115, perishable: false, unit: 'pack' },
    { name: 'French Fries 750g', price: 180, cost: 125, perishable: false, unit: 'pack' },
    { name: 'Paneer Momos 10pk', price: 195, cost: 135, perishable: false, unit: 'pack' },
    { name: 'Aloo Paratha Frozen 4pk', price: 140, cost: 96, perishable: false, unit: 'pack' },
    { name: 'Chicken Nuggets 500g', price: 260, cost: 185, perishable: false, unit: 'pack' },
    { name: 'Crispy Fish Fingers 300g', price: 290, cost: 210, perishable: false, unit: 'pack' },
    { name: 'Veg Spring Rolls 8pk', price: 175, cost: 120, perishable: false, unit: 'pack' },
    { name: 'Frozen Blueberries 200g', price: 340, cost: 240, perishable: false, unit: 'pack' },
    { name: 'Ice Cream Tub 750ml', price: 250, cost: 175, perishable: false, unit: 'pack' },
    { name: 'Belgian Waffles 4pk', price: 210, cost: 145, perishable: false, unit: 'pack' },
    { name: 'Veg Potato Patties 8pk', price: 150, cost: 102, perishable: false, unit: 'pack' },
    { name: 'Cheese Balls 300g', price: 185, cost: 128, perishable: false, unit: 'pack' },
    { name: 'Soya Momos 10pk', price: 160, cost: 110, perishable: false, unit: 'pack' },
  ],
  'Fruits & Vegetables': [
    { name: 'Organic Royal Gala Apples', price: 220, cost: 165, perishable: true, unit: 'kg' },
    { name: 'Fresh Robusta Bananas', price: 60, cost: 42, perishable: true, unit: 'dozen' },
    { name: 'Hybrid Tomatoes', price: 40, cost: 26, perishable: true, unit: 'kg' },
    { name: 'Red Onions', price: 35, cost: 24, perishable: true, unit: 'kg' },
    { name: 'Fresh Potatoes', price: 30, cost: 20, perishable: true, unit: 'kg' },
    { name: 'Organic Spinach 250g', price: 25, cost: 16, perishable: true, unit: 'pack' },
    { name: 'Fresh Carrots 500g', price: 35, cost: 23, perishable: true, unit: 'kg' },
    { name: 'Green Cucumbers 500g', price: 30, cost: 19, perishable: true, unit: 'kg' },
    { name: 'Nagpur Oranges 1kg', price: 110, cost: 78, perishable: true, unit: 'kg' },
    { name: 'Green Capsicum 250g', price: 35, cost: 22, perishable: true, unit: 'kg' },
    { name: 'Fresh Ginger 100g', price: 20, cost: 12, perishable: true, unit: 'g' },
    { name: 'Garlic Bulbs 200g', price: 45, cost: 30, perishable: true, unit: 'g' },
    { name: 'Fresh Lemons 6pk', price: 30, cost: 18, perishable: true, unit: 'pack' },
    { name: 'Seedless Black Grapes 500g', price: 120, cost: 84, perishable: true, unit: 'kg' },
    { name: 'Fresh Coriander Bunch', price: 15, cost: 8, perishable: true, unit: 'piece' },
  ],
  'Packaged Foods': [
    { name: 'Instant Masala Noodles 4pk', price: 60, cost: 42, perishable: false, unit: 'pack' },
    { name: 'Tomato Ketchup 950g', price: 145, cost: 100, perishable: false, unit: 'pack' },
    { name: 'Penne Pasta 500g', price: 95, cost: 65, perishable: false, unit: 'pack' },
    { name: 'Rolled Oats 1kg', price: 195, cost: 135, perishable: false, unit: 'pack' },
    { name: 'Classic Mayonnaise 250g', price: 90, cost: 62, perishable: false, unit: 'pack' },
    { name: 'Dark Soy Sauce 200ml', price: 65, cost: 44, perishable: false, unit: 'pack' },
    { name: 'Red Chilli Sauce 200ml', price: 55, cost: 37, perishable: false, unit: 'pack' },
    { name: 'Mixed Fruit Jam 500g', price: 160, cost: 110, perishable: false, unit: 'pack' },
    { name: 'Creamy Peanut Butter 350g', price: 180, cost: 125, perishable: false, unit: 'pack' },
    { name: 'Honey Crunch Cornflakes 475g', price: 220, cost: 152, perishable: false, unit: 'pack' },
    { name: 'Wildflower Honey 500g', price: 240, cost: 168, perishable: false, unit: 'pack' },
    { name: 'Mango Pickle Jar 500g', price: 130, cost: 88, perishable: false, unit: 'pack' },
    { name: 'Sweet Corn Soup Mix 4pk', price: 70, cost: 47, perishable: false, unit: 'box' },
    { name: 'Synthetic White Vinegar 610ml', price: 50, cost: 32, perishable: false, unit: 'pack' },
    { name: 'Arrabbiata Pasta Sauce 350g', price: 175, cost: 120, perishable: false, unit: 'pack' },
  ],
};

/** Deterministic pseudo-random seed generator for consistent synthetic merchant catalog */
let seed = 12345;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export function generateMerchantInventory(): ProductItem[] {
  seed = 12345; // reset seed for deterministic generation
  const catalog: ProductItem[] = [];
  let idCounter = 1;

  CATEGORIES.forEach((cat) => {
    const items = ITEMS_BY_CAT[cat] || [];
    const brands = BRANDS_BY_CAT[cat] || ['Generic'];

    items.forEach((item, idx) => {
      const brand = brands[idx % brands.length];
      const sku = `GB-${cat.slice(0, 3).toUpperCase()}-${String(idCounter).padStart(3, '0')}`;
      
      const currentStock = Math.round((rand() * 120 + 8) * 10) / 10;
      const dailyVelocity = Math.round((rand() * 14 + 2) * 10) / 10;
      const reorderLevel = Math.round(dailyVelocity * 4);
      const stockValue = Math.round(currentStock * item.price);
      const marginPct = Number(((item.price - item.cost) / item.price).toFixed(2));
      const supplierLeadTimeDays = Math.floor(rand() * 4) + 2;

      // Expiry days for perishables
      let expiryDays: number | null = null;
      if (item.perishable) {
        expiryDays = Math.floor(rand() * 10) + 1;
      }

      // Demand trend
      const trend3d = Math.round((rand() * 60 - 30));
      const trend7d = Math.round((rand() * 40 - 20));
      const forecastDemand = Math.round(dailyVelocity * 7 * (1 + trend3d / 100));

      // Derive Risk Status logically based on metrics!
      let riskStatus: ProductItem['riskStatus'] = 'HEALTHY';
      let revenueAtRisk = 0;
      let recoverableRevenue = 0;
      let recommendedAction = 'Maintain current stock & pricing';
      let recommendationConfidence = 0.95;

      const daysOfStock = currentStock / Math.max(dailyVelocity, 0.1);

      if (expiryDays !== null && expiryDays <= 3 && currentStock >= 12) {
        riskStatus = 'EXPIRY';
        revenueAtRisk = Math.round(currentStock * item.cost * 0.85);
        recoverableRevenue = Math.round(revenueAtRisk * 0.72);
        recommendedAction = 'Apply 15% clearance discount';
        recommendationConfidence = 0.88;
      } else if (daysOfStock <= 1.8) {
        riskStatus = 'STOCKOUT';
        revenueAtRisk = Math.round(dailyVelocity * 3 * item.price);
        recoverableRevenue = Math.round(revenueAtRisk * 0.78);
        recommendedAction = `Reorder ${Math.max(Math.round(reorderLevel * 2), 20)} ${item.unit}s immediately`;
        recommendationConfidence = 0.91;
      } else if (marginPct < 0.22) {
        riskStatus = 'MARGIN_LEAK';
        revenueAtRisk = Math.round(currentStock * (item.cost * 0.1));
        recoverableRevenue = Math.round(revenueAtRisk * 0.65);
        recommendedAction = 'Adjust retail price +4%';
        recommendationConfidence = 0.85;
      } else if (daysOfStock >= 25) {
        riskStatus = 'OVERSTOCK';
        revenueAtRisk = Math.round((currentStock - reorderLevel * 2) * item.price * 0.3);
        recoverableRevenue = Math.round(revenueAtRisk * 0.60);
        recommendedAction = 'Run weekend bundle promotion';
        recommendationConfidence = 0.84;
      }

      // Generate 7-day sparkline history
      const sparkline: number[] = [];
      let baseV = dailyVelocity;
      for (let d = 0; d < 7; d++) {
        const varPct = (rand() * 0.4 - 0.2);
        sparkline.push(Math.max(1, Math.round(baseV * (1 + varPct))));
      }

      catalog.push({
        id: idCounter++,
        sku,
        name: item.name,
        category: cat,
        brand,
        sellingUnit: item.unit,
        sellingPrice: item.price,
        costPrice: item.cost,
        currentStock,
        stockValue,
        supplier: `${brand} Distribution Ltd`,
        supplierLeadTimeDays,
        reorderLevel,
        expiryDays,
        dailyVelocity,
        trend3d,
        trend7d,
        forecastDemand,
        marginPct,
        riskStatus,
        revenueAtRisk,
        recoverableRevenue,
        recommendedAction,
        recommendationConfidence,
        demandSparkline: sparkline,
      });
    });
  });

  return catalog;
}

/** Pre-computed inventory statistics helper */
export function getInventoryStats(catalog: ProductItem[]) {
  const totalProducts = catalog.length;
  const totalValue = catalog.reduce((sum, p) => sum + p.stockValue, 0);
  const itemsAtRisk = catalog.filter((p) => p.riskStatus !== 'HEALTHY');
  const totalRevenueAtRisk = catalog.reduce((sum, p) => sum + p.revenueAtRisk, 0);
  const totalRecoverable = catalog.reduce((sum, p) => sum + p.recoverableRevenue, 0);
  const healthyCount = catalog.filter((p) => p.riskStatus === 'HEALTHY').length;
  const inventoryHealthPct = Math.round((healthyCount / totalProducts) * 100);

  return {
    totalProducts,
    totalValue,
    itemsAtRiskCount: itemsAtRisk.length,
    totalRevenueAtRisk,
    totalRecoverable,
    healthyCount,
    inventoryHealthPct,
    itemsAtRisk,
  };
}
