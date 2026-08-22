# Synthetic Data Generation Architecture

## Overview
The `scripts/generate_data.py` script creates a 12-month (365 days), 3-store, 20-product merchant dataset with realistic demand dynamics, seasonalities, holidays, stockout censoring, and perishability constraints.

---

## 🏬 Store Profiles & Location Context
1. **TechPark Central (`IT_PARK`)**:
   - **Pattern**: Strong Mon–Fri demand (~220 units milk/day), significant drop on Sundays (~95 units/day, ~57% drop) and public holidays (~45% drop).
2. **Green Glen Residency (`RESIDENTIAL`)**:
   - **Pattern**: Higher weekend demand (+30% grocery footfall), balanced weekday demand.
3. **Commercial Street Hub (`COMMERCIAL`)**:
   - **Pattern**: High weekend shopping footfall (+40%), event-sensitive spikes, higher vulnerability to heatwaves/monsoon rains.

---

## 🛒 Product Catalog Strategy
- **Perishables (Short Shelf-Life)**: Milk (2d), Fresh Juice (3d), Yogurt (5d), Bread (3d).
- **Staples (Non-Perishable)**: Rice (365d), Wheat Flour (180d), Cooking Oil (365d).
- **Beverages & Packaged Goods**: Soft Drinks (180d), Mineral Water (365d), Biscuits, Chips, Instant Noodles.

---

## 🧮 Multi-Factor Demand Multiplier Model
Rather than generating random noise, demand is derived deterministically:

$$\text{Expected Demand} = \text{Base Demand} \times \text{Store Factor} \times \text{Category Event Factor} \times \text{Discount Factor} \times \text{Noise}$$

- **Noise**: Normal distribution $\mathcal{N}(1.0, 0.08)$ keeping the output explainable and reproducible (`seed=42`).

---

## 🔁 Reproduction Command
```bash
python scripts/generate_data.py
python scripts/inspect_data.py
```
