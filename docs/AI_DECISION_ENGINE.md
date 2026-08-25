# MerchIntell — AI Decision Engine & Safety Guardrails

## Overview

MerchIntell incorporates a structured AI Decision Engine designed to analyze complex retail context and formulate bounded revenue recovery recommendations.

The AI Engine combines:
1. **Structured Context Parser**: Transforms inventory metrics into standardized business context.
2. **Provider Abstraction / Fallback Engine**: Supports LLM providers (OpenAI, Anthropic, Gemini) with a deterministic fallback engine when API keys are unconfigured.
3. **Programmatic Safety Guardrails**: Hardcoded business constraints that validate and clamp AI outputs.
4. **Source Attribution**: Transparently labels whether recommendations originated from `AI_LLM`, `DETERMINISTIC_FALLBACK`, or `SAFETY_GUARDRAIL`.

---

## Safety Guardrails & Stopping Rules

| Guardrail Parameter | Threshold / Value | Enforcement Logic |
|---|---|---|
| **Max Markdown Discount** | `30.0%` | Clamps any AI discount recommendation exceeding 30%. |
| **Minimum Gross Margin** | `10.0%` | Restricts discounts that would reduce product margin below 10%. |
| **Confidence Threshold** | `0.70` | Requires explicit merchant approval if AI confidence is < 0.70. |
| **Exposure Value Cap** | `₹5,000` | Requires explicit merchant approval for interventions with exposure > ₹5,000. |
| **Duplicate Prevention** | `Single Active` | Prevents multiple concurrent recovery actions on the same product SKU. |

---

## Recommendation Schema

```json
{
  "action": "MARKDOWN",
  "discount_percent": 15.0,
  "reasoning": "Inventory days of cover (84d) exceeds 45-day baseline threshold. Recommended 15% markdown.",
  "confidence": 0.88,
  "expected_recovery": 1266,
  "source": "DETERMINISTIC_FALLBACK",
  "requires_approval": true,
  "constraints": [
    "High financial exposure requires merchant approval"
  ]
}
```
