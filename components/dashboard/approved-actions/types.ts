/**
 * Approved Actions (Beta) — shared types.
 *
 * Scope (MVP): Meta + Google only, with five executable actions:
 *   pause | enable | increase_budget | decrease_budget | set_budget
 *
 * Everything else (creative edits, targeting, bidding, campaign creation,
 * apply-all, full automation, non-paid surfaces) stays review-only and is
 * NOT representable here on purpose. This keeps the type surface honest:
 * if you can't construct an `ApprovedActionDraft` for a row, that row is
 * review-only by design.
 */

export type AdPlatform = "meta" | "google"

export const PLATFORM_LABEL: Record<AdPlatform, string> = {
  meta: "Meta",
  google: "Google",
}

export type AdObjectType = "campaign" | "ad_set" | "ad_group" | "ad"

export const OBJECT_TYPE_LABEL: Record<AdObjectType, string> = {
  campaign: "Campaign",
  ad_set: "Ad Set",
  ad_group: "Ad Group",
  ad: "Ad",
}

export type ApprovedActionType =
  | "pause"
  | "enable"
  | "increase_budget"
  | "decrease_budget"
  | "set_budget"

export const ACTION_TYPE_LABEL: Record<ApprovedActionType, string> = {
  pause: "Pause",
  enable: "Enable",
  increase_budget: "Increase budget",
  decrease_budget: "Decrease budget",
  set_budget: "Set budget",
}

export type WriteAccessState =
  | "read_only_connected"
  | "write_access_connected"
  | "permission_required"

export const WRITE_ACCESS_LABEL: Record<WriteAccessState, string> = {
  read_only_connected: "Read-only connected",
  write_access_connected: "Write access connected",
  permission_required: "Permission required",
}

/**
 * Numeric budget data for budget actions. Pre-formatted display strings
 * (e.g. "$420/day") still live on the draft so renderers can stay simple,
 * but the numeric form is what guardrails compute against.
 */
export interface BudgetChange {
  current: number
  proposed: number
  unit: "daily" | "lifetime"
  currency: string
}

export interface ApprovedActionEvidence {
  label: string
  value: string
  comparison?: string
  trend?: "positive" | "negative" | "neutral"
}

/**
 * A draft of an executable action attached to a row or recommendation.
 * The `Draft` suffix is intentional: nothing has been submitted yet.
 * Submission happens through the Preview Action modal and produces an
 * `ActionLogEntry`.
 */
export interface ApprovedActionDraft {
  type: ApprovedActionType
  platform: AdPlatform
  objectType: AdObjectType
  /** Human-readable target name, e.g. "Summer Sale". */
  objectName: string
  /** Pre-formatted current value, e.g. "$420/day" or "Active". */
  currentValueLabel: string
  /** Pre-formatted proposed value, e.g. "$500/day" or "Paused". */
  proposedValueLabel: string
  /** Numeric form for budget actions; required when type is a budget change. */
  budget?: BudgetChange
  /** Why we're recommending this — short, plain language. */
  reason: string
  /** Supporting metrics shown in the modal. */
  evidence: ApprovedActionEvidence[]
  /** Risk / watchout copy shown beneath the change summary. */
  riskWatchout: string
  /**
   * Optional confidence (0-100). Drives the "no low-confidence budget
   * increases" guardrail. Omit to skip that guardrail.
   */
  confidence?: number
  /**
   * Hints used by the guardrail evaluator. These are pre-tagged on the
   * row/recommendation so the modal doesn't need to re-derive them.
   */
  hints?: {
    /** SKU tied to this object is at inventory risk. */
    inventoryRisk?: boolean
    /** Object sits under a shared / pooled budget. */
    sharedBudget?: boolean
    /** Action also affects parent or children in the hierarchy. */
    parentChildHierarchy?: boolean
    /** Object is currently contributing positive contribution margin. */
    positiveContributionMargin?: boolean
    /** Object has produced revenue in the recent window. */
    recentRevenue?: boolean
  }
}

/** Severities used by guardrail flags. */
export type GuardrailSeverity = "ok" | "warning" | "blocking"

export interface GuardrailFlag {
  severity: GuardrailSeverity
  label: string
  detail: string
}

export interface ActionLogEntry {
  id: string
  user: string
  /** ISO timestamp. */
  timestamp: string
  platform: AdPlatform
  objectType: AdObjectType
  objectName: string
  actionType: ApprovedActionType
  previousValue: string
  newValue: string
  status: "success" | "queued" | "failed"
  /** Mock platform response payload (a short string is fine for the beta). */
  platformResponse: string
}
