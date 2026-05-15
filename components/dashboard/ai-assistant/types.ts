import type { ApprovedActionDraft } from "@/components/dashboard/approved-actions/types"

export interface EvidenceItem {
  label: string
  value: string
  comparison: string
  trend?: "positive" | "negative" | "neutral"
}

export interface RecommendationAction {
  label: string
  action:
    | "view_details"
    | "view_evidence"
    | "review_recommendation"
    | "open_in_action_center"
    | "ignore"
}

export type RecommendationType = "opportunity" | "warning" | "watch" | "critical"
export type ConfidenceLevel = "High" | "Medium" | "Low"

export interface Recommendation {
  id: string
  type: RecommendationType
  title: string
  entityType:
    | "Campaign"
    | "Ad Set"
    | "Channel"
    | "Product"
    | "Ad"
    | "Creative"
    | "Cohort"
    | "Goal"
    | "Forecast"
    | "Brief"
    | "Inventory"
    | "Subscription"
    | "Benchmark"
    | "Store"
  entityName: string
  // What happened - short summary of detected trend
  whatHappened: string
  // Evidence metrics
  evidence: EvidenceItem[]
  // Why it matters - business impact in one sentence
  whyItMatters: string
  // Recommended action
  recommendedAction: string
  // Estimated impact
  estimatedImpact: {
    revenue?: string
    margin?: string
    spend?: string
  }
  // Risk / Guardrail
  riskGuardrail: string
  confidence: ConfidenceLevel
  timeWindow: string
  actions: RecommendationAction[]
  /**
   * Approved Actions (Beta) link. When present, the recommendation maps
   * to an executable Meta/Google action that can be approved without
   * leaving Optilytics. The card swaps in an "Approved action available"
   * badge and three buttons: View evidence, Preview change, Open in
   * Action Center. Review-only recommendations (creative, attribution,
   * cohort, inventory, subscription, benchmark, agency rows) leave this
   * field undefined and the original Review/Ignore buttons render.
   */
  approvedAction?: ApprovedActionDraft
}
