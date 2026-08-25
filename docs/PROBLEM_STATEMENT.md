# MerchIntell — Problem Statement

## Retail Operations Context

Retail merchants face a persistent operational challenge: **silent profit leakage**. 

In physical retail stores (such as apparel, footwear, and consumer goods), retail systems are historically optimized for accounting and point-of-sale billing rather than real-time revenue protection.

---

## Limitations of Traditional Retail Software

Existing Point-of-Sale (POS) and Enterprise Resource Planning (ERP) software provide backward-looking reports:
1. **Sales Logs**: Record past transactions and revenue totals.
2. **Inventory Spreadsheets**: Track opening stock, sold quantities, and remaining units.
3. **End-of-Month Reports**: Summarize historical gross margins and store sales.

### The Critical Information Gap

Traditional systems do not answer forward-looking operational questions:
- **Risk Identification**: Which SKUs are currently losing potential sales due to stockouts?
- **Root Cause Explanation**: Is a stockout caused by a sudden demand velocity surge, poor reorder threshold setup, or supplier delay?
- **Financial Exposure**: How much revenue is exposed to loss over the next 14–30 days if no intervention occurs?
- **Actionable Guidance**: Should the merchant place a reorder, transfer stock from a nearby store, run a targeted clearance markdown, or do nothing?
- **Closed-Loop Feedback**: How does a single new POS transaction dynamically alter demand velocity and risk priority across 40 store outposts?

---

## Consequences of Unaddressed Revenue Leaks

1. **Uncaptured Stockout Demand**: High-velocity SKUs run out of stock prematurely, turning away ready buyers and reducing store customer retention.
2. **Capital Tied Up in Overstock**: Low-velocity SKUs accumulate excess inventory, tying up working capital and incurring holding costs.
3. **Margin Erosion**: Unplanned emergency discounts or late markdowns degrade gross profit margins.
4. **Information Overload**: Store managers are presented with dense spreadsheets containing thousands of raw product IDs (`PROD-100043`, `SEG-520541`), obscuring actionable priorities.

---

## Objective of MerchIntell

MerchIntell solves this problem by providing an **AI Revenue Copilot** that converts raw sales and inventory data into actionable revenue protection recommendations:

`SALES & INVENTORY DATA` → `DETECT RISK` → `EXPLAIN CAUSE` → `RECOMMEND ACTION`
