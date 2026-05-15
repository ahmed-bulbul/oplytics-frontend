import type { PlanningStatus } from "../planning-status-pill"

export type AlertPriority = "High" | "Medium" | "Low"

export type AlertCategory =
  | "Paid Media"
  | "Creative"
  | "Attribution"
  | "Product"
  | "Cohort"
  | "Inventory"
  | "Subscription"
  | "Profitability"

export interface AlertRow {
  id: string
  priority: AlertPriority
  title: string
  detail: string
  category: AlertCategory
  metricChange: string
  impact: string
  status: Extract<PlanningStatus, "Open" | "Reviewing" | "Waiting" | "Resolved" | "Ignored">
  owner: string
  raisedAt: string
  // Where to send the user when they click "Inspect"
  link?: string
}

export const alerts: AlertRow[] = [
  {
    id: "alt_001",
    priority: "High",
    title: "CAC is above target",
    detail: "Blended CAC has held above target for 5 consecutive days, primarily on Meta and Google PMax.",
    category: "Paid Media",
    metricChange: "+15% WoW",
    impact: "Margin pressure",
    status: "Open",
    owner: "Marketing",
    raisedAt: "2 hours ago",
    link: "/intelligence/attribution",
  },
  {
    id: "alt_002",
    priority: "High",
    title: "Premium Cotton Tee nearing stockout",
    detail: "9 days of inventory remain at current sales velocity; product currently receives paid spend.",
    category: "Inventory",
    metricChange: "9 days left",
    impact: "Revenue risk",
    status: "Open",
    owner: "Operations",
    raisedAt: "5 hours ago",
    link: "/intelligence/products",
  },
  {
    id: "alt_003",
    priority: "High",
    title: "Trail Runner refund rate above threshold",
    detail: "Refund rate at 8.4%, more than 3× store average. Sizing and product page review recommended.",
    category: "Product",
    metricChange: "8.4% (3× store avg)",
    impact: "Margin compression",
    status: "Reviewing",
    owner: "Operations",
    raisedAt: "Yesterday",
    link: "/intelligence/products",
  },
  {
    id: "alt_004",
    priority: "Medium",
    title: "TikTok UTM coverage dropped",
    detail: "UTM coverage fell to 72% across TikTok ad sets. Attribution confidence on TikTok-attributed revenue is now Low.",
    category: "Attribution",
    metricChange: "72% coverage",
    impact: "Lower confidence",
    status: "Open",
    owner: "Analytics",
    raisedAt: "1 day ago",
    link: "/intelligence/attribution",
  },
  {
    id: "alt_005",
    priority: "Medium",
    title: "Carousel Product Grid is fatiguing",
    detail: "CTR down 18%, frequency above 4.0 over 14 days. Refresh or rotation recommended.",
    category: "Creative",
    metricChange: "CTR -18%",
    impact: "CPA risk",
    status: "Reviewing",
    owner: "Marketing",
    raisedAt: "1 day ago",
    link: "/intelligence/creative",
  },
  {
    id: "alt_006",
    priority: "Medium",
    title: "Google Search ROAS below target",
    detail: "Blended ROAS on Google Search dropped to 2.3x against a 2.8x target.",
    category: "Paid Media",
    metricChange: "ROAS 2.3x vs 2.8x",
    impact: "Margin pressure",
    status: "Open",
    owner: "Marketing",
    raisedAt: "2 days ago",
    link: "/action-center",
  },
  {
    id: "alt_007",
    priority: "Medium",
    title: "Subscription Month-2 retention is below target",
    detail: "Month-2 retention slipped to 82.4% vs 85% target — same-day cancels concentrated in free-trial cohort.",
    category: "Subscription",
    metricChange: "82.4% vs 85%",
    impact: "LTV risk",
    status: "Open",
    owner: "Lifecycle",
    raisedAt: "3 days ago",
    link: "/intelligence/cohorts",
  },
  {
    id: "alt_008",
    priority: "Low",
    title: "Recent PMax cohort payback moved from Month 3 to Month 4",
    detail: "A recent cohort acquired through Google PMax is paying back slower than benchmark cohorts on the same channel.",
    category: "Cohort",
    metricChange: "Payback +1 month",
    impact: "Working capital",
    status: "Waiting",
    owner: "Marketing",
    raisedAt: "5 days ago",
    link: "/intelligence/cohorts",
  },
  {
    id: "alt_009",
    priority: "Medium",
    title: "Contribution margin pacing behind target",
    detail: "Month-end contribution margin is forecast to land $14K below target if current pace continues.",
    category: "Profitability",
    metricChange: "-$14K vs target",
    impact: "Profit risk",
    status: "Open",
    owner: "Finance",
    raisedAt: "Today",
    link: "/planning/forecasts",
  },
]

export interface BriefDefinition {
  id: string
  name: string
  cadence: string
  description: string
  highlights: string[]
}

export const briefs: BriefDefinition[] = [
  {
    id: "brief_today",
    name: "Today's Brief",
    cadence: "Daily, 8:00am local",
    description:
      "What changed since yesterday: paid spend, conversions, anomalies, and the most important alerts to review first.",
    highlights: [
      "Performance summary vs yesterday",
      "Open alerts ranked by priority",
      "Metrics off target",
      "Recommended areas to review",
    ],
  },
  {
    id: "brief_weekly",
    name: "Weekly Growth Brief",
    cadence: "Mondays, 8:00am local",
    description:
      "Wins, risks, and pacing for the prior week with a forward-looking pace forecast for the current week.",
    highlights: [
      "Top wins and biggest risks",
      "Goal pacing and forecast",
      "Recommended decisions to review",
      "Links to relevant reports",
    ],
  },
  {
    id: "brief_monthly",
    name: "Monthly Profitability Brief",
    cadence: "First business day of the month",
    description:
      "End-of-month profit, channel mix, product profitability, and cohort movement vs target.",
    highlights: [
      "Profit and contribution margin",
      "Channel and product winners",
      "Cohort and LTV movement",
      "Decisions and outcomes from the month",
    ],
  },
]
