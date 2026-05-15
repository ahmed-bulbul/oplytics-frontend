import type { PlanningStatus } from "../planning-status-pill"

export type GoalDirection = "above" | "below"

export interface Goal {
  id: string
  metric: string
  group:
    | "Profitability"
    | "Efficiency"
    | "Acquisition"
    | "Retention"
    | "Operations"
  current: string
  currentValue: number
  target: string
  targetValue: number
  direction: GoalDirection // "above" = higher is better, "below" = lower is better
  unit: "currency" | "percent" | "ratio" | "count" | "days"
  status: Extract<PlanningStatus, "On Track" | "Ahead" | "Behind" | "Watch" | "Critical">
  paceLabel: string
  drivers: string
  owner: string
  reviewedAt: string
  // Sparkline / history values to support a small chart later
  history: number[]
}

export const goalGroups = [
  "Profitability",
  "Efficiency",
  "Acquisition",
  "Retention",
  "Operations",
] as const

export const goals: Goal[] = [
  {
    id: "goal_cm",
    metric: "Contribution Margin",
    group: "Profitability",
    current: "$75,146",
    currentValue: 75146,
    target: "$90,000",
    targetValue: 90000,
    direction: "above",
    unit: "currency",
    status: "Behind",
    paceLabel: "83% to goal",
    drivers: "CAC up 1.4%, refunds elevated on Trail Runner",
    owner: "Alex Rivera",
    reviewedAt: "Reviewed Apr 24",
    history: [62000, 65800, 67200, 69400, 70800, 73100, 75146],
  },
  {
    id: "goal_revenue",
    metric: "Net Revenue",
    group: "Profitability",
    current: "$126,840",
    currentValue: 126840,
    target: "$150,000",
    targetValue: 150000,
    direction: "above",
    unit: "currency",
    status: "Behind",
    paceLabel: "85% to goal",
    drivers: "Soft Google Search, Display Prospecting underperforming",
    owner: "Alex Rivera",
    reviewedAt: "Reviewed Apr 24",
    history: [98000, 105000, 110200, 116800, 119400, 123700, 126840],
  },
  {
    id: "goal_cm_pct",
    metric: "Contribution Margin %",
    group: "Profitability",
    current: "59.2%",
    currentValue: 59.2,
    target: "60.0%",
    targetValue: 60,
    direction: "above",
    unit: "percent",
    status: "On Track",
    paceLabel: "0.8pt below target",
    drivers: "Refund rate trending up, otherwise stable",
    owner: "Finance",
    reviewedAt: "Reviewed Apr 22",
    history: [56.8, 57.5, 58.1, 58.4, 58.6, 58.9, 59.2],
  },
  {
    id: "goal_mer",
    metric: "MER",
    group: "Efficiency",
    current: "3.75x",
    currentValue: 3.75,
    target: "3.50x",
    targetValue: 3.5,
    direction: "above",
    unit: "ratio",
    status: "Ahead",
    paceLabel: "+7% above target",
    drivers: "Email and Meta UGC carrying mix",
    owner: "Marketing",
    reviewedAt: "Reviewed Apr 24",
    history: [3.1, 3.25, 3.4, 3.55, 3.62, 3.7, 3.75],
  },
  {
    id: "goal_cac",
    metric: "CAC",
    group: "Acquisition",
    current: "$31.10",
    currentValue: 31.1,
    target: "$30.00",
    targetValue: 30,
    direction: "below",
    unit: "currency",
    status: "Watch",
    paceLabel: "Slightly above target",
    drivers: "PMax overstating, broad ad set inefficient",
    owner: "Marketing",
    reviewedAt: "Reviewed Apr 23",
    history: [29.2, 29.6, 30.1, 30.4, 30.7, 30.9, 31.1],
  },
  {
    id: "goal_cpa",
    metric: "CPA",
    group: "Acquisition",
    current: "$24.39",
    currentValue: 24.39,
    target: "$22.00",
    targetValue: 22,
    direction: "below",
    unit: "currency",
    status: "Behind",
    paceLabel: "11% above target",
    drivers: "Display Prospecting at $79.50 CPA",
    owner: "Marketing",
    reviewedAt: "Reviewed Apr 23",
    history: [23.1, 23.4, 23.8, 24.0, 24.2, 24.3, 24.4],
  },
  {
    id: "goal_aov",
    metric: "AOV",
    group: "Acquisition",
    current: "$91.60",
    currentValue: 91.6,
    target: "$95.00",
    targetValue: 95,
    direction: "above",
    unit: "currency",
    status: "Watch",
    paceLabel: "Flat for 4 weeks",
    drivers: "Bundle attach rate down, refund rate up on Trail Runner",
    owner: "Merchandising",
    reviewedAt: "Reviewed Apr 22",
    history: [91.0, 91.4, 91.5, 91.6, 91.5, 91.6, 91.6],
  },
  {
    id: "goal_new_customers",
    metric: "New Customers",
    group: "Acquisition",
    current: "912",
    currentValue: 912,
    target: "1,000",
    targetValue: 1000,
    direction: "above",
    unit: "count",
    status: "On Track",
    paceLabel: "91% to goal",
    drivers: "Meta UGC scaling well",
    owner: "Marketing",
    reviewedAt: "Reviewed Apr 24",
    history: [650, 720, 780, 830, 860, 890, 912],
  },
  {
    id: "goal_returning_revenue",
    metric: "Returning Customer Revenue",
    group: "Retention",
    current: "$42,180",
    currentValue: 42180,
    target: "$50,000",
    targetValue: 50000,
    direction: "above",
    unit: "currency",
    status: "Watch",
    paceLabel: "84% to goal",
    drivers: "Email click-through softening, sub cohort cancels up",
    owner: "Lifecycle",
    reviewedAt: "Reviewed Apr 22",
    history: [33000, 35400, 37200, 38800, 40100, 41500, 42180],
  },
  {
    id: "goal_refund_rate",
    metric: "Refund Rate",
    group: "Operations",
    current: "3.4%",
    currentValue: 3.4,
    target: "2.5%",
    targetValue: 2.5,
    direction: "below",
    unit: "percent",
    status: "Critical",
    paceLabel: "0.9pt above target",
    drivers: "Trail Runner at 8.4%, sizing complaints",
    owner: "Operations",
    reviewedAt: "Reviewed Apr 24",
    history: [2.7, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4],
  },
  {
    id: "goal_payback",
    metric: "Payback Period",
    group: "Retention",
    current: "62 days",
    currentValue: 62,
    target: "45 days",
    targetValue: 45,
    direction: "below",
    unit: "days",
    status: "Behind",
    paceLabel: "17 days over target",
    drivers: "Recent cohort acquired through PMax",
    owner: "Marketing",
    reviewedAt: "Reviewed Apr 21",
    history: [49, 52, 55, 57, 59, 60, 62],
  },
  {
    id: "goal_sub_m2",
    metric: "Subscription Month-2 Retention",
    group: "Retention",
    current: "82.4%",
    currentValue: 82.4,
    target: "85.0%",
    targetValue: 85,
    direction: "above",
    unit: "percent",
    status: "Watch",
    paceLabel: "2.6pt below target",
    drivers: "Free-trial cohort canceling same-day at 14.8%",
    owner: "Lifecycle",
    reviewedAt: "Reviewed Apr 22",
    history: [85.1, 84.6, 84.0, 83.5, 83.0, 82.7, 82.4],
  },
  {
    id: "goal_inventory_days",
    metric: "Inventory Days Remaining (top SKUs)",
    group: "Operations",
    current: "18 days",
    currentValue: 18,
    target: "30 days",
    targetValue: 30,
    direction: "above",
    unit: "days",
    status: "Critical",
    paceLabel: "12 days under target",
    drivers: "Premium Cotton Tee, Trail Runner low",
    owner: "Operations",
    reviewedAt: "Reviewed Apr 23",
    history: [42, 36, 31, 27, 24, 21, 18],
  },
]

export function progressTowardGoal(goal: Goal): number {
  // Returns 0-100 progress for the visual track. For "below" goals where lower is better,
  // we render as % under target (clamped 0-100).
  if (goal.direction === "above") {
    const pct = (goal.currentValue / goal.targetValue) * 100
    return Math.max(0, Math.min(100, pct))
  }
  // For "below" goals, render how close we are to (or under) the target.
  // 100 = at or under target, dropping toward 0 as we exceed it.
  const overshoot = (goal.currentValue - goal.targetValue) / goal.targetValue
  const score = 100 - overshoot * 100
  return Math.max(0, Math.min(100, score))
}
