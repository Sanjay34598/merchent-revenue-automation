# Profit Leakage Engine

## Overview
The Profit Leakage Engine (`profit_leakage/`) analyzes merchant transactional, inventory, and supplier data to identify and prioritize avoidable monetary losses across 5 core categories.

---

## 🔎 Detection Categories & Formulas

### 1. STOCKOUT LEAKAGE
- **Formula**:
$$\text{Estimated Missed Units} = \max(0, \text{Estimated Unconstrained Demand} - \text{Observed Sales})$$
$$\text{Estimated Opportunity} = \text{Estimated Missed Units} \times (\text{Selling Price} - \text{Unit Cost})$$
- **Terminology**: Labeled as *"Estimated lost-sales opportunity"* with a confidence score ($0.0$ to $1.0$).

---

### 2. OVERSTOCK LEAKAGE
- **Formula**:
$$\text{Excess Units} = \text{Current Inventory} - \text{Expected 14-Day Demand}$$
$$\text{Cash Tied Up} = \text{Excess Units} \times \text{Unit Cost}$$
$$\text{Estimated Opportunity} = \text{Cash Tied Up} \times \text{Holding Risk Rate}$$

---

### 3. EXPIRY LEAKAGE
- **Formula**:
$$\text{Potential Excess Waste} = \max(0, \text{Current Stock} - \text{Demand Before Expiry})$$
$$\text{Potential Waste Value} = \text{Potential Excess Waste} \times \text{Unit Cost}$$
$$\text{Recoverable Value} = \text{Potential Waste Value} \times 0.70 \quad (\text{via 15–20\% clearance discount})$$

---

### 4. DISCOUNT INEFFICIENCY
- **Logic**: Compares baseline 7-day pre-promotional gross profit against promotional gross profit. Flags discounts where margin erosion exceeds volume gain ($\text{Volume Lift} < 15\%$ and $\text{Profit Impact} < 0$).
- **Distinction**: Differentiates low-efficiency margin-eroding discounts from useful clearance discounts on perishables.

---

### 5. SUPPLIER COST LEAKAGE
- **Logic**: Identifies suppliers with longer lead times ($\ge 3$ days) and sub-optimal margins compared to category averages.

---

## ⚖️ Opportunity Priority Scoring (`profit_leakage/scoring.py`)

$$\text{Priority Score} = \text{Financial Impact} \times \text{Confidence} \times \text{Urgency Factor} \times \text{Risk Adjustment}$$

- **Urgency Factors**: Expiry ($1.4$), Stockout ($1.2$), Overstock ($1.0$), Discount ($0.9$), Supplier ($0.8$).
- **Priority Thresholds**:
  - `HIGH`: Score $> 5000$ or Category == Expiry.
  - `MEDIUM`: Score $> 1500$.
  - `LOW`: Score $\le 1500$.
