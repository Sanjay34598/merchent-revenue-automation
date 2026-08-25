# MerchIntell — 5-Minute Buildathon Demo Script

## Overview
This script is optimized for hackathon judges, recruiters, and technical reviewers. It demonstrates the complete closed-loop AI revenue recovery story in 5 minutes.

---

## Script & Walkthrough Steps

### **0:00 – 0:30: Problem Statement & Main Dashboard**
- **Action**: Open MerchIntell main dashboard.
- **Narrative**: *"Traditional retail dashboards tell merchants what they already lost. MerchIntell detects revenue leaks before they become losses, explains the root cause, executes bounded recovery actions, and measures what was actually recovered."*
- **Highlight**: Hero message, Revenue at Risk metric (`₹2,829,779`), and DETECT → EXPLAIN → ACT → MEASURE workflow.

### **0:30 – 1:30: Revenue Risk & AI Decision Engine**
- **Action**: Click **"Start a Recovery"** or open the **Recovery Command Center**.
- **Narrative**: *"Here in the Recovery Command Center, we see 7 active revenue opportunities. For example, 'Femme Footwear Boot Collection' has 84 days of cover—making it a slow-moving inventory risk with ₹1,948 exposed."*
- **Highlight**: AI root cause diagnosis, safety guardrails (max 30% discount, min 10% margin), and expected recovery.

### **1:30 – 2:30: Executing Bounded Recovery Action**
- **Action**: Click **"Approve & Execute"** on a slow-moving inventory opportunity.
- **Narrative**: *"When we click Approve & Execute, MerchIntell doesn't just show a notification—it executes a bounded price markdown in the POS catalog, updates product state, and logs an immutable audit event."*
- **Highlight**: Immediate pricing update, audit log creation, and recovery rate update.

### **2:30 – 3:30: Live POS Transaction & Stock Ingestion**
- **Action**: Click **"+ NEW BILL"** / Open **POS Terminal**. Select a product, change quantity to 2, select UPI, click **"Complete Sale"**.
- **Narrative**: *"Let's generate a live POS transaction. Notice how product stock is checked in real-time. Upon clicking Complete Sale, inventory is atomically decrements, revenue increases, velocity models update, and risk exposure recalculates automatically."*
- **Highlight**: Real-time stock decrement and transaction stream insertion (`TXN-20260825-XXXX`).

### **3:30 – 4:30: Experimental Recovery Evaluation**
- **Action**: Click **"Evaluation"** in the action strip.
- **Narrative**: *"To prove our business impact, MerchIntell runs a reproducible batch evaluation comparing baseline revenue against our AI strategy across 150 SKUs and 40 stores. We achieve a +19.4% revenue uplift (+₹20,36,390) with a 79% recovery efficiency rate."*
- **Highlight**: Baseline vs Strategy comparison metrics and action distribution charts.

### **4:30 – 5:00: Immutable Audit Trail**
- **Action**: Click **"Audit Trail"**.
- **Narrative**: *"Every state change—POS checkouts, markdowns, AI decisions, and human approvals—is logged in our immutable audit stream. MerchIntell gives merchants complete control, safety, and transparency."*
- **Highlight**: Searchable audit log table with before/after diffs.
