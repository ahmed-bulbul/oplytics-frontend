"use client"

import type { ApprovedActionDraft } from "@/components/dashboard/approved-actions/types"

export type HealthStatus = "healthy" | "watch" | "critical" | "opportunity"
export type Priority = 1 | 2 | 3 | 4 | 5
export type Impact = "high" | "medium" | "low"
export type ActionCategory =
  | "Spend"
  | "Creative"
  | "Product"
  | "Attribution"
  | "Cohort"
  | "Inventory"
  | "Subscription"

// Phase 3: outcome statuses for decision tracking
export type OutcomeStatus =
  | "Not reviewed"
  | "In progress"
  | "Positive outcome"
  | "Negative outcome"
  | "Inconclusive"

export interface ActionableRow {
  id: string
  name: string
  level:
    | "Channel"
    | "Campaign"
    | "Ad Set"
    | "Ad"
    | "Creative"
    | "Product"
    | "Cohort"
    | "Inventory"
    | "Subscription"
  status: HealthStatus
  priority: Priority
  impact: Impact
  category?: ActionCategory
  delivery: "Active" | "Paused" | "Ended" | "Learning"
  spend: string
  spendTrend?: "up" | "down" | "stable"
  revenue: string
  revenueTrend?: "up" | "down" | "stable"
  roas: string
  roasTarget?: string
  cpa: string
  cpaTarget?: string
  reason: string
  recommendedAction: string
  confidence?: number
  recentTrend?: number[] // sparkline data
  children?: ActionableRow[]
  // Optional impact context shown alongside recommended actions.
  expectedImpact?: string
  /**
   * Approved Actions (Beta): when present, this row's recommended action
   * maps to one of the five MVP executable actions on Meta or Google.
   * Rows without this field stay review-only — that is the explicit
   * signal the Action Center uses to decide whether to show the
   * "Approved action available" badge and Preview Action button.
   */
  approvedAction?: ApprovedActionDraft
  // Decision / outcome tracking
  decision?: string
  decisionDate?: string
  expectedOutcome?: string
  guardrailMetric?: string
  outcomeReviewDate?: string
  actualResult?: string
  outcomeStatus?: OutcomeStatus

  // ----------------------------------------------------------------------
  // Ad-platform metrics (all optional, all stored as pre-formatted strings)
  // ----------------------------------------------------------------------
  // Delivery & Administrative
  budget?: string                // e.g. "$450/day"
  attributionWindow?: string     // e.g. "7-day click"
  // Awareness & Top-Funnel
  impressions?: string
  reach?: string
  frequency?: string
  cpm?: string
  // Engagement & Consideration
  ctr?: string
  linkClicks?: string
  cpc?: string
  landingPageViews?: string
  // Conversion Funnel
  contentViews?: string
  addsToCart?: string
  initiateCheckouts?: string
  purchases?: string
  // ROI & Revenue (revenue / cpa / roas already exist above)
  aov?: string
  // Video Performance
  thruPlays?: string
  videoP25?: string
  videoP50?: string
  videoP75?: string
  videoP95?: string
}

export const impactConfig: Record<Impact, { label: string; color: string; bgColor: string }> = {
  high: {
    label: "High",
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  low: {
    label: "Low",
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
  },
}

export const healthStatusConfig: Record<HealthStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  healthy: {
    label: "Healthy",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  watch: {
    label: "Watch",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  critical: {
    label: "Critical",
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
  },
  opportunity: {
    label: "Opportunity",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
}
