/**
 * Channel Performance & Paid Media Efficiency — metric registry
 * --------------------------------------------------------------
 * Single source of truth for every metric that can appear in the Channel
 * Performance table or its per-row diagnostic drawer.
 *
 * Mirrors the Action Center metric grouping (Delivery / Awareness /
 * Engagement / Conversion / Revenue / Video) so the two tables read the
 * same way, and adds a channel-specific "Attribution" group for blended,
 * platform, and Triple Whale comparisons.
 *
 * Each metric:
 *  - has a stable `id` used by the column picker / localStorage
 *  - belongs to a `group` used by the picker (sectioning) and the drawer
 *    (sectioning)
 *  - declares its `source` so we can render a small attribution tag and
 *    tooltip explaining where the number came from
 *  - exposes an `accessor(row)` returning a pre-formatted string. Missing
 *    values return `undefined` so the table can render an em-dash.
 */

export type ChannelStatus = "Healthy" | "At Risk" | "Underperforming"

/**
 * Hierarchy row shape for the Channel Performance table.
 *
 * The five "always populated" fields (spend, revenue, roas, cpa, clicks)
 * are required so the default-visible columns never show empty cells.
 * Everything else is optional surface area for the column picker and the
 * diagnostic drawer.
 */
export interface ChannelRow {
  id: string
  name: string
  status?: ChannelStatus

  // ---- Required core ------------------------------------------------------
  spend: string
  revenue: string
  roas: string
  cpa: string
  clicks: string

  // ---- Compare-mode change strings ---------------------------------------
  spendChange?: string
  revenueChange?: string
  roasChange?: string
  cpaChange?: string
  clicksChange?: string

  // ---- Delivery & Administrative -----------------------------------------
  delivery?: string
  budget?: string
  dailySpend?: string
  attributionWindow?: string

  // ---- Awareness & Top-Funnel --------------------------------------------
  impressions?: string
  reach?: string
  frequency?: string
  cpm?: string

  // ---- Engagement & Consideration ----------------------------------------
  ctr?: string
  linkClicks?: string
  cpc?: string
  landingPageViews?: string

  // ---- Conversion Funnel --------------------------------------------------
  contentViews?: string
  addsToCart?: string
  initiateCheckouts?: string
  purchases?: string
  cr?: string
  cAtc?: string

  // ---- ROI & Revenue ------------------------------------------------------
  aov?: string
  mer?: string
  cac?: string
  ncRoas?: string
  ncRoasTarget?: string

  // ---- Video Performance --------------------------------------------------
  thruPlays?: string
  videoP25?: string
  videoP50?: string
  videoP75?: string
  videoP95?: string

  // ---- Attribution --------------------------------------------------------
  platformRoas?: string
  shopifyBlendedRoas?: string
  viewThroughPct?: string
  tripleWhaleRoas?: string
  tripleWhaleMetaNcRoas?: string

  // ---- Hierarchy ----------------------------------------------------------
  children?: ChannelRow[]
}

/**
 * Group names mirror the Action Center registry exactly so operators get
 * a consistent mental model across the two tables. "Attribution" is
 * channel-specific (cross-source ROAS comparisons).
 */
export type ChannelMetricGroup =
  | "Delivery"
  | "Awareness"
  | "Engagement"
  | "Conversion"
  | "Revenue"
  | "Video"
  | "Attribution"

export const CHANNEL_METRIC_GROUP_LABELS: Record<ChannelMetricGroup, string> = {
  Delivery: "Delivery & Administrative",
  Awareness: "Awareness & Top-Funnel",
  Engagement: "Engagement & Consideration",
  Conversion: "Conversion Funnel",
  Revenue: "ROI & Revenue",
  Video: "Video Performance",
  Attribution: "Attribution",
}

export type MetricSource =
  | "Ad platforms"
  | "Measurement source"
  | "Shopify Blended"
  | "Platform attribution"
  | "Triple Whale"
  | "Computed"

export interface ChannelPerformanceMetric {
  id: string
  label: string
  /** Optional shorter label for the table header where space is tight. */
  shortLabel?: string
  /** Optional inline help shown below the metric in the picker / drawer. */
  description?: string
  /**
   * Concise formula or definition rendered in the calculation popover
   * next to the metric's label. Keep one line where possible so the
   * popover stays compact in table headers.
   */
  formula?: string
  group: ChannelMetricGroup
  source: MetricSource
  align?: "left" | "right"
  /** "status" renders a colored pill instead of a numeric. Defaults to "numeric". */
  kind?: "numeric" | "status"
  /** Whether this column is shown by default. */
  defaultVisible?: boolean
  accessor: (row: ChannelRow) => string | undefined
  changeAccessor?: (row: ChannelRow) => string | undefined
}

export const SOURCE_DESCRIPTIONS: Record<MetricSource, string> = {
  "Ad platforms":
    "Pulled directly from connected ad platforms (Meta, Google, TikTok, etc.).",
  "Measurement source":
    "Calculated using the measurement source selected in the toolbar.",
  "Shopify Blended":
    "Computed by combining Shopify orders with paid media spend across channels.",
  "Platform attribution":
    "Reported by the ad platform's own attribution model.",
  "Triple Whale":
    "Provided by Triple Whale — only visible when the integration is connected.",
  Computed: "Derived from other metrics on this row.",
}

/**
 * Canonical column order. Toggling a metric in the picker preserves this
 * order in the table so the layout stays predictable regardless of click
 * order. Default-visible columns are interleaved with optional ones in
 * group order so the table reads left-to-right by topic.
 */
export const CHANNEL_PERFORMANCE_METRICS: ChannelPerformanceMetric[] = [
  // ---- Delivery & Administrative ----------------------------------------
  {
    id: "delivery",
    label: "Delivery",
    description: "Active, paused, learning, or ended.",
    group: "Delivery",
    source: "Ad platforms",
    align: "left",
    accessor: (r) => r.delivery,
  },
  {
    id: "budget",
    label: "Budget",
    description: "Daily or lifetime spend cap.",
    group: "Delivery",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.budget,
  },
  {
    id: "spend",
    label: "Amount Spent",
    shortLabel: "Spend",
    description: "Total spend for the selected period.",
    formula: "Sum of platform-reported spend across the selected range",
    group: "Delivery",
    source: "Ad platforms",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.spend,
    changeAccessor: (r) => r.spendChange,
  },
  {
    id: "dailySpend",
    label: "Daily Spend",
    description: "Average daily spend over the selected range.",
    formula: "Spend ÷ days in selected range",
    group: "Delivery",
    source: "Computed",
    align: "right",
    accessor: (r) => r.dailySpend,
  },
  {
    id: "attributionWindow",
    label: "Attribution",
    description: "Window used to credit conversions (e.g. 7-day click).",
    group: "Delivery",
    source: "Ad platforms",
    align: "left",
    accessor: (r) => r.attributionWindow,
  },

  // ---- Awareness & Top-Funnel -------------------------------------------
  {
    id: "impressions",
    label: "Impressions",
    shortLabel: "Imps",
    description: "Total times the ad was shown.",
    group: "Awareness",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.impressions,
  },
  {
    id: "reach",
    label: "Reach",
    description: "Unique people who saw the ad.",
    group: "Awareness",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.reach,
  },
  {
    id: "frequency",
    label: "Frequency",
    description: "Average times each person saw the ad.",
    formula: "Impressions ÷ Reach",
    group: "Awareness",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.frequency,
  },
  {
    id: "cpm",
    label: "CPM",
    description: "Cost per 1,000 impressions.",
    formula: "(Spend ÷ Impressions) × 1,000",
    group: "Awareness",
    source: "Ad platforms",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.cpm,
  },

  // ---- Engagement & Consideration ---------------------------------------
  {
    id: "ctr",
    label: "CTR",
    description: "Link click-through rate.",
    formula: "(Link Clicks ÷ Impressions) × 100",
    group: "Engagement",
    source: "Ad platforms",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.ctr,
  },
  {
    id: "linkClicks",
    label: "Link Clicks",
    shortLabel: "Clicks",
    description: "Outbound clicks to your store.",
    group: "Engagement",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.linkClicks ?? r.clicks,
    changeAccessor: (r) => r.clicksChange,
  },
  {
    id: "cpc",
    label: "CPC",
    description: "Cost per link click.",
    formula: "Spend ÷ Link Clicks",
    group: "Engagement",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.cpc,
  },
  {
    id: "landingPageViews",
    label: "LP Views",
    description: "Confirms users actually arrived at your site.",
    group: "Engagement",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.landingPageViews,
  },

  // ---- Conversion Funnel -------------------------------------------------
  {
    id: "contentViews",
    label: "Content Views",
    description: "Number of product pages viewed.",
    group: "Conversion",
    source: "Measurement source",
    align: "right",
    accessor: (r) => r.contentViews,
  },
  {
    id: "addsToCart",
    label: "Adds to Cart",
    description: "Mid-funnel intent signal.",
    group: "Conversion",
    source: "Measurement source",
    align: "right",
    accessor: (r) => r.addsToCart,
  },
  {
    id: "initiateCheckouts",
    label: "Initiate Checkouts",
    shortLabel: "ICs",
    description: "Started but not completed checkout.",
    group: "Conversion",
    source: "Measurement source",
    align: "right",
    accessor: (r) => r.initiateCheckouts,
  },
  {
    id: "purchases",
    label: "Purchases",
    description: "Total successful orders.",
    group: "Conversion",
    source: "Measurement source",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.purchases,
  },
  {
    id: "cr",
    label: "CR",
    description: "Conversion rate from clicks to purchases.",
    formula: "(Purchases ÷ Link Clicks) × 100",
    group: "Conversion",
    source: "Computed",
    align: "right",
    accessor: (r) => r.cr,
  },
  {
    id: "cAtc",
    label: "cATC",
    description: "Cost per add-to-cart.",
    formula: "Spend ÷ Adds to Cart",
    group: "Conversion",
    source: "Computed",
    align: "right",
    accessor: (r) => r.cAtc,
  },

  // ---- ROI & Revenue -----------------------------------------------------
  {
    id: "revenue",
    label: "Purchase Value",
    shortLabel: "Revenue",
    description: "Purchase conversion value.",
    formula: "Sum of attributed purchase value",
    group: "Revenue",
    source: "Measurement source",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.revenue,
    changeAccessor: (r) => r.revenueChange,
  },
  {
    id: "cpa",
    label: "CPA",
    description: "Cost per purchase (all customers).",
    formula: "Spend ÷ Purchases",
    group: "Revenue",
    source: "Measurement source",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.cpa,
    changeAccessor: (r) => r.cpaChange,
  },
  {
    id: "roas",
    label: "ROAS",
    description: "Purchase return on ad spend.",
    formula: "Purchase Value ÷ Spend",
    group: "Revenue",
    source: "Measurement source",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.roas,
    changeAccessor: (r) => r.roasChange,
  },
  {
    id: "aov",
    label: "AOV",
    description: "Average order value (revenue / purchases).",
    formula: "Purchase Value ÷ Purchases",
    group: "Revenue",
    source: "Measurement source",
    align: "right",
    accessor: (r) => r.aov,
  },
  {
    id: "mer",
    label: "MER",
    description:
      "Marketing Efficiency Ratio — total revenue divided by total marketing spend.",
    formula: "Total Shopify Revenue ÷ Total Marketing Spend",
    group: "Revenue",
    source: "Shopify Blended",
    align: "right",
    accessor: (r) => r.mer,
  },
  {
    id: "cac",
    label: "CAC",
    description: "Customer Acquisition Cost — net-new customers only.",
    formula: "Spend ÷ Net-New Customers",
    group: "Revenue",
    source: "Shopify Blended",
    align: "right",
    accessor: (r) => r.cac,
  },
  {
    id: "ncRoas",
    label: "New Customer ROAS",
    shortLabel: "NC ROAS",
    description: "Purchase value from net-new customers divided by ad spend.",
    formula: "New-Customer Purchase Value ÷ Spend",
    group: "Revenue",
    source: "Shopify Blended",
    align: "right",
    accessor: (r) => r.ncRoas,
  },
  {
    id: "ncRoasTarget",
    label: "New Customer ROAS Target",
    shortLabel: "NC ROAS Target",
    description: "Threshold this row needs to clear to be profitable on new customers.",
    group: "Revenue",
    source: "Computed",
    align: "right",
    accessor: (r) => r.ncRoasTarget,
  },

  // ---- Video Performance -------------------------------------------------
  {
    id: "thruPlays",
    label: "ThruPlays",
    description: "Times video played 15+ seconds.",
    group: "Video",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.thruPlays,
  },
  {
    id: "videoP25",
    label: "Video 25%",
    description: "Plays at 25%.",
    group: "Video",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.videoP25,
  },
  {
    id: "videoP50",
    label: "Video 50%",
    description: "Plays at 50%.",
    group: "Video",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.videoP50,
  },
  {
    id: "videoP75",
    label: "Video 75%",
    description: "Plays at 75%.",
    group: "Video",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.videoP75,
  },
  {
    id: "videoP95",
    label: "Video 95%",
    description: "Plays at 95%.",
    group: "Video",
    source: "Ad platforms",
    align: "right",
    accessor: (r) => r.videoP95,
  },

  // ---- Attribution (channel-specific) -----------------------------------
  {
    id: "platformRoas",
    label: "Platform ROAS",
    description: "ROAS reported by the ad platform itself.",
    formula: "Platform-Attributed Revenue ÷ Spend",
    group: "Attribution",
    source: "Platform attribution",
    align: "right",
    accessor: (r) => r.platformRoas,
  },
  {
    id: "shopifyBlendedRoas",
    label: "Shopify Blended ROAS",
    shortLabel: "Blended ROAS",
    description:
      "ROAS computed by combining Shopify orders with paid spend across channels.",
    formula: "Total Shopify Revenue ÷ Total Paid Spend",
    group: "Attribution",
    source: "Shopify Blended",
    align: "right",
    accessor: (r) => r.shopifyBlendedRoas,
  },
  {
    id: "viewThroughPct",
    label: "View-Through %",
    shortLabel: "VT %",
    description:
      "Share of attributed conversions that came from view-through impressions.",
    formula: "(View-Through Conversions ÷ Total Conversions) × 100",
    group: "Attribution",
    source: "Platform attribution",
    align: "right",
    accessor: (r) => r.viewThroughPct,
  },
  {
    id: "tripleWhaleRoas",
    label: "Triple Whale ROAS",
    description: "Only visible when Triple Whale is connected.",
    formula: "Triple Whale-Attributed Revenue ÷ Spend",
    group: "Attribution",
    source: "Triple Whale",
    align: "right",
    accessor: (r) => r.tripleWhaleRoas,
  },
  {
    id: "tripleWhaleMetaNcRoas",
    label: "Triple Whale Meta NC ROAS",
    description: "Only visible when Triple Whale is connected.",
    formula: "Triple Whale Meta New-Customer Revenue ÷ Meta Spend",
    group: "Attribution",
    source: "Triple Whale",
    align: "right",
    accessor: (r) => r.tripleWhaleMetaNcRoas,
  },

  // ---- Status (special pill cell) ---------------------------------------
  // Lives at the end of the column order so it always reads as the
  // rightmost "verdict" column. Excluded from the diagnostic drawer via
  // `kind: "status"`.
  {
    id: "status",
    label: "Status",
    group: "Revenue",
    source: "Computed",
    kind: "status",
    align: "left",
    defaultVisible: true,
    accessor: (r) => r.status,
  },
]

export const CHANNEL_PERFORMANCE_METRICS_BY_ID: Record<
  string,
  ChannelPerformanceMetric
> = Object.fromEntries(CHANNEL_PERFORMANCE_METRICS.map((m) => [m.id, m]))

/**
 * First-paint / reset state for the column picker — derived from
 * `defaultVisible` so we have a single source of truth. Tuned for the
 * dashboard's at-a-glance use case: Spend, CPM, CTR, Purchases,
 * Revenue, CPA, ROAS, Status.
 */
export const DEFAULT_VISIBLE_CHANNEL_METRIC_IDS: string[] =
  CHANNEL_PERFORMANCE_METRICS.filter((m) => m.defaultVisible).map((m) => m.id)

export const CHANNEL_PERFORMANCE_COLUMNS_STORAGE_KEY =
  "optilytics:channel-performance:columns:v1"
