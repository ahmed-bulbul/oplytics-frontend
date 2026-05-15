import type { PlanningStatus } from "../planning-status-pill"

export type ReportFrequency = "Weekly" | "Monthly" | "Quarterly" | "On Demand"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  frequency: ReportFrequency
  lastGenerated: string
  owner: string
  status: Extract<PlanningStatus, "Ready" | "Draft" | "Scheduled" | "Generating">
  sections: string[]
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "rep_weekly_growth",
    name: "Weekly Growth Report",
    description:
      "Net revenue, MER, CAC, contribution margin, and channel mix vs target for the week.",
    frequency: "Weekly",
    lastGenerated: "2 days ago",
    owner: "Alex Rivera",
    status: "Ready",
    sections: [
      "Executive summary",
      "KPI performance",
      "Channel performance",
      "Top wins and risks",
      "Recommendations to review",
    ],
  },
  {
    id: "rep_profit",
    name: "Profitability Report",
    description:
      "Contribution margin by channel, product, and cohort with refund and shipping impact.",
    frequency: "Monthly",
    lastGenerated: "Not scheduled",
    owner: "Finance",
    status: "Draft",
    sections: [
      "Contribution margin breakdown",
      "Refund and shipping impact",
      "Product-level profitability",
      "Channel contribution",
      "Data health summary",
    ],
  },
  {
    id: "rep_paid_media",
    name: "Paid Media Report",
    description:
      "Paid spend, Shopify Blended ROAS vs platform-reported ROAS, attribution confidence, and over/underspending channels.",
    frequency: "Weekly",
    lastGenerated: "Yesterday",
    owner: "Marketing",
    status: "Ready",
    sections: [
      "Spend and revenue summary",
      "Channel ROAS vs target",
      "Platform vs Shopify Blended",
      "Recommended areas to review",
    ],
  },
  {
    id: "rep_creative",
    name: "Creative Performance Report",
    description:
      "Creative-level CTR, frequency, ROAS, fatigue signals, and top scaling assets.",
    frequency: "Weekly",
    lastGenerated: "Yesterday",
    owner: "Marketing",
    status: "Ready",
    sections: [
      "Top scaling creatives",
      "Creative fatigue watchlist",
      "Format and angle breakdown",
      "Refresh recommendations",
    ],
  },
  {
    id: "rep_product",
    name: "Product Profitability Report",
    description:
      "Per-product margin, refund rate, AOV, ad-attributed share, and SKUs to review.",
    frequency: "Monthly",
    lastGenerated: "12 days ago",
    owner: "Merchandising",
    status: "Scheduled",
    sections: [
      "Top profitable SKUs",
      "Margin compressed SKUs",
      "Refund and return drivers",
      "Inventory and velocity flags",
    ],
  },
  {
    id: "rep_attribution",
    name: "Attribution Confidence Report",
    description:
      "UTM coverage, Shopify Blended deltas vs platform-reported, and channels with low confidence.",
    frequency: "Monthly",
    lastGenerated: "8 days ago",
    owner: "Analytics",
    status: "Ready",
    sections: [
      "UTM coverage by channel",
      "Platform overstatement deltas",
      "Confidence by source",
      "Coverage gaps to review",
    ],
  },
  {
    id: "rep_cohorts",
    name: "Cohorts & LTV Report",
    description:
      "Acquisition cohorts by channel, repeat behavior, payback period, and LTV by acquisition source.",
    frequency: "Monthly",
    lastGenerated: "Last month",
    owner: "Lifecycle",
    status: "Scheduled",
    sections: [
      "Cohort retention curves",
      "Payback period by channel",
      "LTV by acquisition source",
      "Subscription retention summary",
    ],
  },
  {
    id: "rep_executive",
    name: "Executive Summary",
    description:
      "One-page roll-up of profit, growth, risks, and decisions for leadership review.",
    frequency: "Monthly",
    lastGenerated: "Apr 1, 2026",
    owner: "Alex Rivera",
    status: "Ready",
    sections: [
      "Profit and revenue snapshot",
      "Goal status",
      "Top wins",
      "Top risks",
      "Decisions made and outcomes",
    ],
  },
]
