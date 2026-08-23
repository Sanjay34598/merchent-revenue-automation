# Policy-Gated Autonomy Architecture

The Merchant Revenue Autopilot enforces strict policy guardrails to prevent unmonitored financial execution.

---

## 1. Risk Tiering & Autonomy Rules

| Risk Tier | Criteria / Trigger | Approval Required? | Execution Mode |
|---|---|---|---|
| **LOW_RISK** | Forecast updates, internal price recs, low-impact adjustments | No (Auto-executable / Ready) | `MOCK` / `RAZORPAY_TEST_MODE` |
| **MEDIUM_RISK** | Standard reorders, discounts within merchant limits (e.g. ≤20%) | **YES** (Merchant Approval) | `RAZORPAY_TEST_MODE` |
| **HIGH_RISK** | Financial transactions > cap, discounts > 30%, refund actions | **YES** (Strict Manual Only) | Safe Mock Only |

> [!IMPORTANT]
> No action ever executes real monetary payments. All executions run strictly in `MOCK` or `RAZORPAY_TEST_MODE`.

---

## 2. Policy Enforcement & Audit Flow

```
Agent Proposes Action (PENDING)
  ↓
Policy Check (LOW / MEDIUM / HIGH)
  ↓
Merchant Approval Required (APPROVED / REJECTED)
  ↓
Idempotency & Duplicate Check
  ↓
ActionExecutor.execute_action()
  ↓
Status Updated (EXECUTED) & ActionOutcome Recorded
```

### Unapproved Execution Blocking:
Attempting to execute an action without explicit merchant approval returns `HTTP 400 (APPROVAL_REQUIRED)` and logs a policy violation event.

### Duplicate Execution Prevention:
Attempting to re-execute an already `EXECUTED` action returns `HTTP 409 (DUPLICATE_BLOCKED)` and logs a `DUPLICATE_ACTION` `FailureEvent`.
