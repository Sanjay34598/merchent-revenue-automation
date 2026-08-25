# MerchIntell — Recruiter & Judge 10-Second Demo Guide

## Objective

This guide outlines a fast, compelling demonstration script for technical reviewers, recruiters, and hackathon judges to understand MerchIntell within 10 seconds.

---

## 10-Second Demonstration Script

### Step 1: Open the Application (0–3 Seconds)
- **What the user sees**:
  - Statement Headline: *"Find revenue leaks before they become losses."*
  - Subtitle: *"MerchIntell analyzes sales and inventory data to detect revenue risks, explain why they matter, and recommend the next best action."*
  - Primary Metric Banner: **REVENUE AT RISK `₹2,829,779`**
  - Operational Workflow Strip: `01 DETECT` → `02 EXPLAIN` → `03 ACT`
- **Key takeaway**: In 3 seconds, the reviewer understands MerchIntell is an AI revenue copilot detecting exposed money in retail stores.

### Step 2: Inspect a Revenue Risk & Rationale (3–6 Seconds)
- **Action**: Click on the top opportunity item (e.g., *Boot Collection Plushfoot*).
- **What the user sees**:
  - The **Product Intelligence Drawer** slides over from the right.
  - Explains exact stock counts (`30 units`), stock cover (`300 days`), 30-day velocity, and deterministic risk reasoning.
  - Displays raw SKU ID (`PROD-100043`) and Segment ID (`SEG-520541`) inside the drawer without cluttering the main dashboard.
- **Key takeaway**: Information disclosure is progressive and evidence-based.

### Step 3: Execute a Live POS Transaction (6–10 Seconds)
- **Action**: Click **`+ Record Sale`** or navigate to **Transactions Stream** and click **`+ New Sale`**.
- **What the user sees**:
  - Select *Boot Collection Plushfoot*, set quantity to `2`, select payment `UPI`, click **`Complete Sale`**.
  - Processing telemetry displays: `RECEIVED` → `MATCHED` → `INVENTORY UPDATED` → `VELOCITY UPDATED` → `RISK UPDATED`.
  - Customer receipt generates (`INV-20260825-XXXX`).
  - Stock decrements, demand velocity recalculates, and Revenue at Risk updates dynamically on the main dashboard.
- **Key takeaway**: Closed-loop transaction processing directly mutates operational intelligence in real-time.

---

## Controlled Live Store Activity Feature

Demonstrate the **Live Store Activity System** on the Transactions Stream page:
- Highlight the **`● Auto-billing ON (30-90s)`** indicator.
- Click **`[ Pause ]`** to pause automatic background sales.
- Click **`[ Generate Sale ]`** to trigger an instant inventory-aware sale, demonstrating live ledger updates and stock mutations.
