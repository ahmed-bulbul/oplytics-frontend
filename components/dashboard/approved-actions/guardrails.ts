import type { ApprovedActionDraft, GuardrailFlag } from "./types"

/**
 * Hard caps required by the beta:
 *   - Budget increases capped at +20%
 *   - Budget decreases capped at -30%
 * `set_budget` is treated as either an increase or a decrease relative
 * to the current value and uses the same caps.
 */
export const MAX_BUDGET_INCREASE_PCT = 0.2
export const MAX_BUDGET_DECREASE_PCT = 0.3

/**
 * Minimum confidence required to approve a budget *increase*. Decreases,
 * pauses, and enables are not gated on confidence — the operator is still
 * the one approving them, and review-only is the right path when we have
 * no executable suggestion at all.
 */
export const MIN_BUDGET_INCREASE_CONFIDENCE = 75

/**
 * Evaluate every guardrail relevant to a draft and return a flat list of
 * flags. Modal logic decides which severities are blocking; this function
 * stays pure so it's trivial to unit-test later.
 */
export function evaluateGuardrails(
  draft: ApprovedActionDraft,
): GuardrailFlag[] {
  const flags: GuardrailFlag[] = []

  // ---------------------------------------------------------------
  // Budget caps
  // ---------------------------------------------------------------
  const budgetActions: ApprovedActionDraft["type"][] = [
    "increase_budget",
    "decrease_budget",
    "set_budget",
  ]

  if (budgetActions.includes(draft.type) && draft.budget) {
    const { current, proposed } = draft.budget
    const delta = proposed - current
    const pct = current > 0 ? delta / current : 0

    if (delta > 0) {
      const increasePct = pct
      const cap = MAX_BUDGET_INCREASE_PCT
      flags.push({
        severity: increasePct > cap + 1e-9 ? "blocking" : "ok",
        label: "Budget increase cap",
        detail:
          increasePct > cap + 1e-9
            ? `Proposed increase is ${(increasePct * 100).toFixed(0)}%, above the ${(cap * 100).toFixed(0)}% cap.`
            : `Proposed increase is ${(increasePct * 100).toFixed(0)}%, within the ${(cap * 100).toFixed(0)}% cap.`,
      })

      if (
        draft.type !== "decrease_budget" &&
        typeof draft.confidence === "number" &&
        draft.confidence < MIN_BUDGET_INCREASE_CONFIDENCE
      ) {
        flags.push({
          severity: "blocking",
          label: "Confidence required for increases",
          detail: `Recommendation confidence is ${draft.confidence}%, below the ${MIN_BUDGET_INCREASE_CONFIDENCE}% threshold for budget increases.`,
        })
      }
    } else if (delta < 0) {
      const decreasePct = Math.abs(pct)
      const cap = MAX_BUDGET_DECREASE_PCT
      flags.push({
        severity: decreasePct > cap + 1e-9 ? "blocking" : "ok",
        label: "Budget decrease cap",
        detail:
          decreasePct > cap + 1e-9
            ? `Proposed decrease is ${(decreasePct * 100).toFixed(0)}%, beyond the ${(cap * 100).toFixed(0)}% cap.`
            : `Proposed decrease is ${(decreasePct * 100).toFixed(0)}%, within the ${(cap * 100).toFixed(0)}% cap.`,
      })
    }
  }

  // ---------------------------------------------------------------
  // Hint-driven warnings. These are non-blocking by intent — they're
  // surfaced so the operator is informed before approving, but the
  // human is still the decision-maker.
  // ---------------------------------------------------------------
  const hints = draft.hints ?? {}

  if (hints.inventoryRisk) {
    flags.push({
      severity: "warning",
      label: "Inventory risk",
      detail:
        "Linked SKU is approaching stock-out. Review reorder timing before increasing spend.",
    })
  }

  if (hints.sharedBudget) {
    flags.push({
      severity: "warning",
      label: "Shared budget",
      detail:
        "This object sits under a shared/pooled budget. Changes here may affect sibling objects.",
    })
  }

  if (hints.parentChildHierarchy) {
    flags.push({
      severity: "warning",
      label: "Parent/child hierarchy",
      detail:
        "Action will propagate to or from related parent/child objects in the platform.",
    })
  }

  if (hints.positiveContributionMargin && draft.type === "pause") {
    flags.push({
      severity: "warning",
      label: "Positive contribution margin",
      detail:
        "Object is currently producing positive contribution margin. Confirm pause is intentional.",
    })
  }

  if (hints.recentRevenue && draft.type === "pause") {
    flags.push({
      severity: "warning",
      label: "Recent revenue",
      detail:
        "Object has produced revenue in the recent window. Confirm pause is intentional.",
    })
  }

  return flags
}

/**
 * True if any blocking flag is present — used by the modal to disable
 * the "Approve and submit" button.
 */
export function hasBlockingGuardrail(flags: GuardrailFlag[]): boolean {
  return flags.some((f) => f.severity === "blocking")
}
