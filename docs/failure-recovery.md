# Failure Recovery & Safety System

Razorpay specifically evaluates automated systems on their resilience and failure handling capabilities.

---

## 1. Supported Failure Types

1. `API_TIMEOUT`: External tool or endpoint call exceeds maximum latency limit.
2. `RAZORPAY_API_FAILURE`: Test API returns invalid status or network failure.
3. `DUPLICATE_ACTION`: Idempotency check detects an attempt to execute an already `EXECUTED` action.
4. `POLICY_REJECTION`: Attempted execution of an action that was `REJECTED` or not `APPROVED`.
5. `INSUFFICIENT_INVENTORY`: Stock availability check fails before supplier order placement.
6. `STALE_FORECAST`: Input demand forecast dataset is >48h old.
7. `INVALID_ACTION`: Missing parameters or corrupted payload.

---

## 2. Failure Handling Protocol

When a failure is detected:
1. **Stop Unsafe Execution**: Immediately abort the execution transaction.
2. **Record FailureEvent**: Create a persistent `FailureEvent` DB record with `failure_type`, `possible_cause`, `recovery_action`, and metadata.
3. **Block Unsafe Retries**: Enforce idempotency checks to prevent infinite or duplicate retry loops.
4. **Fallback to Recommendation-Only Mode**: Automatically switch the store operator from automated mode to recommendation-only status.
5. **Preserve Audit Trail**: Keep all preceding timeline stages intact for post-mortem analysis.
