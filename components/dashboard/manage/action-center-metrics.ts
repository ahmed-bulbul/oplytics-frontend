"use client"

import type { ActionableRow } from "./types"

/**
 * Logical groupings used to organize the column picker. The order here
 * controls the section order shown in the picker AND the natural left-to-right
 * order of columns that appear in the table when picked.
 */
export type MetricGroup =
  | "Delivery"
  | "Awareness"
  | "Engagement"
  | "Conversion"
  | "Revenue"
  | "Video"

export const METRIC_GROUP_LABELS: Record<MetricGroup, string> = {
  Delivery: "Delivery & Administrative",
  Awareness: "Awareness & Top-Funnel",
  Engagement: "Engagement & Consideration",
  Conversion: "Conversion Funnel",
  Revenue: "ROI & Revenue",
  Video: "Video Performance",
}

export interface ActionCenterMetric {
  id: string
  label: string
  /**
   * Short copy shown in the table header when space is tight. Falls back to
   * `label` when omitted.
   */
  shortLabel?: string
  /**
   * One-line tooltip / picker description so operators understand what the
   * column actually shows.
   */
  description?: string
  group: MetricGroup
  /**
   * Cell alignment. Numerics right-align with `tabular-nums`; categorical
   * fields like Delivery / Attribution align left.
   */
  align: "left" | "right"
  /**
   * Whether this column is shown by default before the user customizes.
   * Picked to match the most common at-a-glance view: Spend / Impressions /
   * CPM / CTR / Purchases / Revenue / CPA / ROAS / AOV.
   */
  defaultVisible?: boolean
  /**
   * Returns the pre-formatted cell value for a row, or "—" when the row
   * does not carry that metric (e.g. an Inventory row has no CPM).
   */
  accessor: (row: ActionableRow) => string
}

const DASH = "—"
const value = (raw: string | undefined): string => raw ?? DASH

/**
 * Single source of truth for every column the Action Center table can
 * display. The page reads `defaultVisible` for first-paint state, the
 * picker uses `group` to render sectioned checkboxes, and the table uses
 * `accessor` + `align` to render each cell.
 */
export const ACTION_CENTER_METRICS: ActionCenterMetric[] = [
  // -------- Delivery & Administrative --------
  {
    id: "delivery",
    label: "Delivery",
    description: "Active, paused, learning, or ended.",
    group: "Delivery",
    align: "left",
    accessor: (r) => value(r.delivery),
  },
  {
    id: "budget",
    label: "Budget",
    description: "Daily or lifetime spend cap.",
    group: "Delivery",
    align: "right",
    accessor: (r) => value(r.budget),
  },
  {
    id: "spend",
    label: "Amount Spent",
    shortLabel: "Spend",
    description: "Total spend for the selected period.",
    group: "Delivery",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.spend),
  },
  {
    id: "attributionWindow",
    label: "Attribution",
    description: "Window used to credit conversions (e.g. 7-day click).",
    group: "Delivery",
    align: "left",
    accessor: (r) => value(r.attributionWindow),
  },

  // -------- Awareness & Top-Funnel --------
  {
    id: "impressions",
    label: "Impressions",
    description: "Total times the ad was shown.",
    group: "Awareness",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.impressions),
  },
  {
    id: "reach",
    label: "Reach",
    description: "Unique people who saw the ad.",
    group: "Awareness",
    align: "right",
    accessor: (r) => value(r.reach),
  },
  {
    id: "frequency",
    label: "Frequency",
    description: "Average times each person saw the ad.",
    group: "Awareness",
    align: "right",
    accessor: (r) => value(r.frequency),
  },
  {
    id: "cpm",
    label: "CPM",
    description: "Cost per 1,000 impressions.",
    group: "Awareness",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.cpm),
  },

  // -------- Engagement & Consideration --------
  {
    id: "ctr",
    label: "CTR",
    description: "Link click-through rate.",
    group: "Engagement",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.ctr),
  },
  {
    id: "linkClicks",
    label: "Link Clicks",
    description: "Outbound clicks to your store.",
    group: "Engagement",
    align: "right",
    accessor: (r) => value(r.linkClicks),
  },
  {
    id: "cpc",
    label: "CPC",
    description: "Cost per link click.",
    group: "Engagement",
    align: "right",
    accessor: (r) => value(r.cpc),
  },
  {
    id: "landingPageViews",
    label: "LP Views",
    description: "Confirms users actually arrived at your site.",
    group: "Engagement",
    align: "right",
    accessor: (r) => value(r.landingPageViews),
  },

  // -------- Conversion Funnel --------
  {
    id: "contentViews",
    label: "Content Views",
    description: "Number of product pages viewed.",
    group: "Conversion",
    align: "right",
    accessor: (r) => value(r.contentViews),
  },
  {
    id: "addsToCart",
    label: "Adds to Cart",
    description: "Mid-funnel intent signal.",
    group: "Conversion",
    align: "right",
    accessor: (r) => value(r.addsToCart),
  },
  {
    id: "initiateCheckouts",
    label: "Initiate Checkouts",
    description: "Started but not completed checkout.",
    group: "Conversion",
    align: "right",
    accessor: (r) => value(r.initiateCheckouts),
  },
  {
    id: "purchases",
    label: "Purchases",
    description: "Total successful orders.",
    group: "Conversion",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.purchases),
  },

  // -------- ROI & Revenue --------
  {
    id: "revenue",
    label: "Revenue",
    description: "Purchase conversion value.",
    group: "Revenue",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.revenue),
  },
  {
    id: "cpa",
    label: "CPA",
    description: "Cost per purchase.",
    group: "Revenue",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.cpa),
  },
  {
    id: "roas",
    label: "ROAS",
    description: "Purchase return on ad spend.",
    group: "Revenue",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.roas),
  },
  {
    id: "aov",
    label: "AOV",
    description: "Average order value (revenue / purchases).",
    group: "Revenue",
    align: "right",
    defaultVisible: true,
    accessor: (r) => value(r.aov),
  },

  // -------- Video Performance --------
  {
    id: "thruPlays",
    label: "ThruPlays",
    description: "Times video played 15+ seconds.",
    group: "Video",
    align: "right",
    accessor: (r) => value(r.thruPlays),
  },
  {
    id: "videoP25",
    label: "Video 25%",
    description: "Plays at 25%.",
    group: "Video",
    align: "right",
    accessor: (r) => value(r.videoP25),
  },
  {
    id: "videoP50",
    label: "Video 50%",
    description: "Plays at 50%.",
    group: "Video",
    align: "right",
    accessor: (r) => value(r.videoP50),
  },
  {
    id: "videoP75",
    label: "Video 75%",
    description: "Plays at 75%.",
    group: "Video",
    align: "right",
    accessor: (r) => value(r.videoP75),
  },
  {
    id: "videoP95",
    label: "Video 95%",
    description: "Plays at 95%.",
    group: "Video",
    align: "right",
    accessor: (r) => value(r.videoP95),
  },
]

/** O(1) lookup helper used by the table renderer. */
export const ACTION_CENTER_METRICS_BY_ID: Record<string, ActionCenterMetric> =
  ACTION_CENTER_METRICS.reduce<Record<string, ActionCenterMetric>>((acc, m) => {
    acc[m.id] = m
    return acc
  }, {})

/** First-paint / reset state for the column picker. */
export const DEFAULT_VISIBLE_METRIC_IDS: string[] = ACTION_CENTER_METRICS
  .filter((m) => m.defaultVisible)
  .map((m) => m.id)

/** Persisted-state key used by the page when reading/writing localStorage. */
export const ACTION_CENTER_COLUMNS_STORAGE_KEY = "action-center.visible-columns.v1"
