/**
 * Product Performance — metric registry
 * --------------------------------------
 * Single source of truth for every metric that can appear in the Product
 * Performance table or its per-row diagnostic drawer.
 *
 * Metric groups follow the surfaces Shopify itself exposes for product
 * analytics:
 *
 *   - Sales & Revenue      → Sales reports + Order reports
 *   - Profitability        → Profit reports (requires COGS)
 *   - Traffic & Funnel     → Behavior + Acquisition reports
 *   - Inventory            → Inventory reports (sell-through, turnover)
 *   - Customer Mix         → Customer reports (new / returning split)
 *   - Discount & Promotion → Discount reports
 *   - Returns & Quality    → Returns + Reviews
 *
 * Mirrors the Channel Performance registry pattern so operators get the
 * same column-picker and diagnostic-drawer mental model on both tables.
 */

export type ProductStatus =
  | "Healthy"
  | "At Risk"
  | "Stockout Risk"
  | "Underperforming"

export type StockoutRisk = "Stockout" | "Critical" | "Low" | "Healthy"

/**
 * Hierarchy row shape for the Product Performance table.
 *
 * Required fields (revenue, unitsSold, orders, cr) are always populated so
 * the default-visible columns never render empty cells. Everything else
 * is optional surface area for the column picker and drawer.
 */
export interface ProductRow {
  id: string
  name: string
  sku?: string
  category?: string
  status?: ProductStatus

  // ---- Required core ------------------------------------------------------
  revenue: string         // Net sales (Shopify's headline product metric)
  unitsSold: string
  orders: string
  cr: string              // Conversion rate (orders / sessions)

  // ---- Compare-mode change strings ---------------------------------------
  revenueChange?: string
  unitsSoldChange?: string
  ordersChange?: string
  crChange?: string
  grossMarginChange?: string
  sellThroughRateChange?: string

  // ---- Sales & Revenue ---------------------------------------------------
  grossSales?: string
  netSales?: string
  aov?: string
  refunds?: string
  refundRate?: string

  // ---- Profitability -----------------------------------------------------
  cogs?: string
  grossProfit?: string
  grossMargin?: string
  contributionMargin?: string
  cmPercent?: string

  // ---- Traffic & Funnel --------------------------------------------------
  sessions?: string
  productViews?: string
  atcs?: string           // raw add-to-cart count
  atcRate?: string        // ATCs / sessions
  checkoutRate?: string   // initiate checkout / ATCs

  // ---- Inventory ---------------------------------------------------------
  inventoryOnHand?: string
  sellThroughRate?: string
  inventoryTurnover?: string
  daysOfInventory?: string
  stockoutRisk?: StockoutRisk
  reorderStatus?: string

  // ---- Customer Mix ------------------------------------------------------
  customers?: string
  newCustomerShare?: string
  returningCustomerShare?: string
  repeatPurchaseRate?: string
  daysToRepeat?: string

  // ---- Discount & Promotion ----------------------------------------------
  discountRate?: string
  discountDollars?: string
  promoOrderShare?: string

  // ---- Returns & Quality -------------------------------------------------
  returnRate?: string
  avgRating?: string
  reviewCount?: string

  // ---- Hierarchy ----------------------------------------------------------
  children?: ProductRow[]
}

/**
 * Group names map closely to Shopify's report categories so the
 * vocabulary is familiar to merchants. "Returns" is intentionally split
 * out from Sales because operators triage refund/return spikes
 * separately from velocity drops.
 */
export type ProductMetricGroup =
  | "Sales"
  | "Profitability"
  | "Funnel"
  | "Inventory"
  | "Customers"
  | "Discounts"
  | "Returns"

export const PRODUCT_METRIC_GROUP_LABELS: Record<ProductMetricGroup, string> = {
  Sales: "Sales & Revenue",
  Profitability: "Profitability",
  Funnel: "Traffic & Funnel",
  Inventory: "Inventory & Velocity",
  Customers: "Customer Mix",
  Discounts: "Discount & Promotion",
  Returns: "Returns & Quality",
}

/**
 * Source of each metric, used by the drawer's per-metric attribution
 * tag and tooltip. Mirrors the Channel Performance pattern.
 */
export type ProductMetricSource =
  | "Shopify Sales"
  | "Shopify Profit"
  | "Shopify Behavior"
  | "Shopify Inventory"
  | "Shopify Customers"
  | "Shopify Discounts"
  | "Shopify Returns"
  | "Reviews"
  | "Computed"

export const PRODUCT_SOURCE_DESCRIPTIONS: Record<ProductMetricSource, string> = {
  "Shopify Sales":
    "Pulled from Shopify's Sales / Order reports for the selected range.",
  "Shopify Profit":
    "From Shopify Profit reports. Requires per-SKU cost-per-item to be set.",
  "Shopify Behavior":
    "From Shopify Behavior reports — sessions, product views, and add-to-cart events.",
  "Shopify Inventory":
    "From Shopify Inventory reports — month-end snapshots + daily stock movements.",
  "Shopify Customers":
    "From Shopify Customer reports — new vs. returning split and repeat-purchase patterns.",
  "Shopify Discounts":
    "From Shopify's discount + promotion reports.",
  "Shopify Returns":
    "From Shopify Order reports — refunds and returns by product.",
  Reviews:
    "From your connected reviews app (e.g. Judge.me, Yotpo, Loox).",
  Computed: "Derived from other metrics on this row.",
}

export interface ProductPerformanceMetric {
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
  group: ProductMetricGroup
  source: ProductMetricSource
  align?: "left" | "right"
  /**
   * "status" renders a colored pill instead of a numeric. Used for
   * Status (overall health) and Stockout Risk. Defaults to "numeric".
   */
  kind?: "numeric" | "status" | "stockoutRisk"
  /** Whether this column is shown by default. */
  defaultVisible?: boolean
  accessor: (row: ProductRow) => string | undefined
  changeAccessor?: (row: ProductRow) => string | undefined
}

/**
 * Canonical column order. Toggling a metric in the picker preserves this
 * order in the table so the layout stays predictable regardless of click
 * order. Default-visible columns are interleaved with optional ones in
 * group order so the table reads left-to-right by topic.
 */
export const PRODUCT_PERFORMANCE_METRICS: ProductPerformanceMetric[] = [
  // ---- Status (verdict pill) --------------------------------------------
  {
    id: "status",
    label: "Status",
    description: "Overall health verdict combining velocity, margin, and inventory.",
    group: "Sales",
    source: "Computed",
    align: "left",
    kind: "status",
    defaultVisible: true,
    accessor: (r) => r.status,
  },

  // ---- Sales & Revenue ---------------------------------------------------
  {
    id: "revenue",
    label: "Net Sales",
    description:
      "Gross sales minus discounts and returns. Shopify's primary product metric.",
    formula: "Gross Sales − Discounts − Returns",
    group: "Sales",
    source: "Shopify Sales",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.revenue,
    changeAccessor: (r) => r.revenueChange,
  },
  {
    id: "grossSales",
    label: "Gross Sales",
    description: "Total sales before discounts and returns.",
    formula: "Sum of order line totals before discounts and returns",
    group: "Sales",
    source: "Shopify Sales",
    align: "right",
    accessor: (r) => r.grossSales,
  },
  {
    id: "unitsSold",
    label: "Units Sold",
    description: "Total units sold in the selected range.",
    group: "Sales",
    source: "Shopify Sales",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.unitsSold,
    changeAccessor: (r) => r.unitsSoldChange,
  },
  {
    id: "orders",
    label: "Orders",
    description: "Number of orders containing this product.",
    group: "Sales",
    source: "Shopify Sales",
    align: "right",
    accessor: (r) => r.orders,
    changeAccessor: (r) => r.ordersChange,
  },
  {
    id: "aov",
    label: "AOV",
    description: "Average order value (revenue / orders).",
    formula: "Net Sales ÷ Orders",
    group: "Sales",
    source: "Computed",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.aov,
  },

  // ---- Profitability -----------------------------------------------------
  {
    id: "cogs",
    label: "COGS",
    description: "Cost of goods sold for the units sold.",
    formula: "Sum of (units sold × cost per item)",
    group: "Profitability",
    source: "Shopify Profit",
    align: "right",
    accessor: (r) => r.cogs,
  },
  {
    id: "grossProfit",
    label: "Gross Profit",
    description: "Net sales minus COGS.",
    formula: "Net Sales − COGS",
    group: "Profitability",
    source: "Shopify Profit",
    align: "right",
    accessor: (r) => r.grossProfit,
  },
  {
    id: "grossMargin",
    label: "Gross Margin",
    description: "Gross profit as a percentage of net sales.",
    formula: "(Gross Profit ÷ Net Sales) × 100",
    group: "Profitability",
    source: "Shopify Profit",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.grossMargin,
    changeAccessor: (r) => r.grossMarginChange,
  },
  {
    id: "contributionMargin",
    label: "Contribution Margin",
    description: "Gross profit minus variable costs (shipping, fulfillment, returns).",
    formula: "Gross Profit − Shipping − Fulfillment − Returns",
    group: "Profitability",
    source: "Computed",
    align: "right",
    accessor: (r) => r.contributionMargin,
  },
  {
    id: "cmPercent",
    label: "Contribution Margin %",
    description: "Contribution margin as a percentage of net sales.",
    formula: "(Contribution Margin ÷ Net Sales) × 100",
    group: "Profitability",
    source: "Computed",
    align: "right",
    accessor: (r) => r.cmPercent,
  },

  // ---- Traffic & Funnel --------------------------------------------------
  {
    id: "sessions",
    label: "Sessions",
    description: "Unique store sessions that landed on this product page.",
    group: "Funnel",
    source: "Shopify Behavior",
    align: "right",
    accessor: (r) => r.sessions,
  },
  {
    id: "productViews",
    label: "Product Views",
    description: "Total product detail page views.",
    group: "Funnel",
    source: "Shopify Behavior",
    align: "right",
    accessor: (r) => r.productViews,
  },
  {
    id: "atcs",
    label: "Adds to Cart",
    description: "Times this product was added to a cart.",
    group: "Funnel",
    source: "Shopify Behavior",
    align: "right",
    accessor: (r) => r.atcs,
  },
  {
    id: "atcRate",
    label: "Add-to-Cart Rate",
    description: "Adds-to-cart divided by sessions.",
    formula: "(Adds to Cart ÷ Sessions) × 100",
    group: "Funnel",
    source: "Computed",
    align: "right",
    accessor: (r) => r.atcRate,
  },
  {
    id: "checkoutRate",
    label: "Checkout Rate",
    description: "Started checkouts divided by adds-to-cart.",
    formula: "(Initiated Checkouts ÷ Adds to Cart) × 100",
    group: "Funnel",
    source: "Computed",
    align: "right",
    accessor: (r) => r.checkoutRate,
  },
  {
    id: "cr",
    label: "Conversion Rate",
    description: "Orders divided by sessions on this product.",
    formula: "(Orders ÷ Sessions) × 100",
    group: "Funnel",
    source: "Computed",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.cr,
    changeAccessor: (r) => r.crChange,
  },

  // ---- Inventory ---------------------------------------------------------
  {
    id: "stockoutRisk",
    label: "Stockout Risk",
    description: "Probability the SKU will sell out before reorder lands.",
    formula: "Days of Inventory ≤ replenishment lead time",
    group: "Inventory",
    source: "Computed",
    align: "left",
    kind: "stockoutRisk",
    accessor: (r) => r.stockoutRisk,
  },
  {
    id: "inventoryOnHand",
    label: "Inventory On Hand",
    description: "Current units in stock across all locations.",
    group: "Inventory",
    source: "Shopify Inventory",
    align: "right",
    accessor: (r) => r.inventoryOnHand,
  },
  {
    id: "sellThroughRate",
    label: "Sell-Through Rate",
    description:
      "Units sold ÷ (units sold + units on hand) over the selected range.",
    formula: "(Units Sold ÷ (Units Sold + Units On Hand)) × 100",
    group: "Inventory",
    source: "Shopify Inventory",
    align: "right",
    defaultVisible: true,
    accessor: (r) => r.sellThroughRate,
    changeAccessor: (r) => r.sellThroughRateChange,
  },
  {
    id: "inventoryTurnover",
    label: "Inventory Turnover",
    description: "Annualized turns — how many times inventory cycles per year.",
    formula: "Annualized Units Sold ÷ Average Inventory",
    group: "Inventory",
    source: "Shopify Inventory",
    align: "right",
    accessor: (r) => r.inventoryTurnover,
  },
  {
    id: "daysOfInventory",
    label: "Days of Inventory",
    description: "Days of stock remaining at current sell-through rate.",
    formula: "Inventory On Hand ÷ Average Daily Units Sold",
    group: "Inventory",
    source: "Computed",
    align: "right",
    accessor: (r) => r.daysOfInventory,
  },
  {
    id: "reorderStatus",
    label: "Reorder Status",
    description: "Whether a PO has been placed and when stock will arrive.",
    group: "Inventory",
    source: "Shopify Inventory",
    align: "left",
    accessor: (r) => r.reorderStatus,
  },

  // ---- Customer Mix ------------------------------------------------------
  {
    id: "customers",
    label: "Customers",
    description: "Unique customers who bought this product.",
    group: "Customers",
    source: "Shopify Customers",
    align: "right",
    accessor: (r) => r.customers,
  },
  {
    id: "newCustomerShare",
    label: "New Customer Share",
    description: "Share of orders from first-time customers.",
    formula: "(Orders from First-Time Customers ÷ Total Orders) × 100",
    group: "Customers",
    source: "Shopify Customers",
    align: "right",
    accessor: (r) => r.newCustomerShare,
  },
  {
    id: "returningCustomerShare",
    label: "Returning Customer Share",
    description: "Share of orders from returning customers.",
    formula: "(Orders from Returning Customers ÷ Total Orders) × 100",
    group: "Customers",
    source: "Shopify Customers",
    align: "right",
    accessor: (r) => r.returningCustomerShare,
  },
  {
    id: "repeatPurchaseRate",
    label: "Repeat Purchase Rate",
    description:
      "Share of customers who purchased this product again within 90 days.",
    formula: "(Customers who repurchased within 90d ÷ All Customers) × 100",
    group: "Customers",
    source: "Shopify Customers",
    align: "right",
    accessor: (r) => r.repeatPurchaseRate,
  },
  {
    id: "daysToRepeat",
    label: "Days to Repeat",
    description: "Median days to second purchase for this product.",
    formula: "Median(days between 1st and 2nd purchase)",
    group: "Customers",
    source: "Shopify Customers",
    align: "right",
    accessor: (r) => r.daysToRepeat,
  },

  // ---- Discount & Promotion ----------------------------------------------
  {
    id: "discountRate",
    label: "Discount Rate",
    description: "Average discount percentage applied to orders.",
    formula: "(Discount Dollars ÷ Gross Sales) × 100",
    group: "Discounts",
    source: "Shopify Discounts",
    align: "right",
    accessor: (r) => r.discountRate,
  },
  {
    id: "discountDollars",
    label: "Discount $",
    description: "Total discount dollars applied for the selected range.",
    formula: "Sum of discount amounts applied to orders",
    group: "Discounts",
    source: "Shopify Discounts",
    align: "right",
    accessor: (r) => r.discountDollars,
  },
  {
    id: "promoOrderShare",
    label: "Promo Order Share",
    description: "Share of orders that used a promo code.",
    formula: "(Orders with Promo Code ÷ Total Orders) × 100",
    group: "Discounts",
    source: "Shopify Discounts",
    align: "right",
    accessor: (r) => r.promoOrderShare,
  },

  // ---- Returns & Quality -------------------------------------------------
  {
    id: "refunds",
    label: "Refunds",
    description: "Total refund dollars issued.",
    formula: "Sum of refunded order amounts",
    group: "Returns",
    source: "Shopify Returns",
    align: "right",
    accessor: (r) => r.refunds,
  },
  {
    id: "refundRate",
    label: "Refund Rate",
    description: "Refund dollars as a percentage of net sales.",
    formula: "(Refund Dollars ÷ Net Sales) × 100",
    group: "Returns",
    source: "Computed",
    align: "right",
    accessor: (r) => r.refundRate,
  },
  {
    id: "returnRate",
    label: "Return Rate",
    description: "Units returned as a percentage of units sold.",
    formula: "(Units Returned ÷ Units Sold) × 100",
    group: "Returns",
    source: "Shopify Returns",
    align: "right",
    accessor: (r) => r.returnRate,
  },
  {
    id: "avgRating",
    label: "Avg Rating",
    description: "Average product review rating.",
    formula: "Sum of ratings ÷ Review Count",
    group: "Returns",
    source: "Reviews",
    align: "right",
    accessor: (r) => r.avgRating,
  },
  {
    id: "reviewCount",
    label: "Reviews",
    description: "Total reviews submitted.",
    group: "Returns",
    source: "Reviews",
    align: "right",
    accessor: (r) => r.reviewCount,
  },
]

export const PRODUCT_PERFORMANCE_METRICS_BY_ID: Record<
  string,
  ProductPerformanceMetric
> = Object.fromEntries(
  PRODUCT_PERFORMANCE_METRICS.map((m) => [m.id, m]),
)

/**
 * Default visible columns. Ordered so the table reads left-to-right as a
 * single sentence about the product:
 * "Status, Revenue, Units, AOV, Gross Margin %, Conversion Rate, Sell-through".
 */
export const DEFAULT_VISIBLE_PRODUCT_METRIC_IDS: string[] =
  PRODUCT_PERFORMANCE_METRICS.filter((m) => m.defaultVisible).map((m) => m.id)

export const PRODUCT_PERFORMANCE_COLUMNS_STORAGE_KEY =
  "optilytics:product-performance:columns:v1"
