export type ProductStatus =
  | "Profitable"
  | "Strong LTV"
  | "Low Margin"
  | "Needs COGS"
  | "High Refunds"
  | "Watch"
  | "Stockout Risk"

export type ProductCategory = "Apparel" | "Footwear" | "Accessories" | "Home" | "Outdoor"

export type StockoutRisk = "Low" | "Moderate" | "High" | "Critical"
export type ReorderStatus = "Healthy" | "Reorder soon" | "Reorder placed" | "Backorder"

export interface ProductRow {
  id: string
  name: string
  category: ProductCategory
  revenue: number
  orders: number
  aov: number
  cogs: number
  grossMargin: number
  adSpend: number
  contributionMargin: number
  contributionMarginPct: number
  refundRate: number
  cac: number
  ltv90: number
  repeatRate: number
  status: ProductStatus
  // Drawer-only details
  newCustomers: number
  ltv30: number
  ltv60: number
  returnRate: number
  discountDependency: number
  cogsMissing?: boolean
  aiReview: string
  // Phase 3B — Inventory-aware analytics
  inventoryOnHand: number
  salesVelocity: number // units per day
  daysOfInventory: number
  stockoutRisk: StockoutRisk
  reorderStatus: ReorderStatus
  revenueAtRisk: number
  contributionMarginAtRisk: number
}

export const productRows: ProductRow[] = [
  {
    id: "premium-cotton-tee-white",
    name: "Premium Cotton Tee - White",
    category: "Apparel",
    revenue: 41200,
    orders: 489,
    aov: 84.25,
    cogs: 18840,
    grossMargin: 22360,
    adSpend: 9940,
    contributionMargin: 12420,
    contributionMarginPct: 30.1,
    refundRate: 1.8,
    cac: 24.1,
    ltv90: 142.4,
    repeatRate: 34,
    status: "Profitable",
    newCustomers: 412,
    ltv30: 91.4,
    ltv60: 121.0,
    returnRate: 2.1,
    discountDependency: 12,
    aiReview:
      "This product is a strong acquisition product. CAC is below average and 90-day LTV is above the store average. Margin remains healthy after ad spend.",
    inventoryOnHand: 420,
    salesVelocity: 38,
    daysOfInventory: 11,
    stockoutRisk: "High",
    reorderStatus: "Reorder soon",
    revenueAtRisk: 24100,
    contributionMarginAtRisk: 7260,
  },
  {
    id: "running-sneaker",
    name: "Running Sneaker",
    category: "Footwear",
    revenue: 36800,
    orders: 218,
    aov: 168.81,
    cogs: 19200,
    grossMargin: 17600,
    adSpend: 8200,
    contributionMargin: 9400,
    contributionMarginPct: 25.5,
    refundRate: 3.2,
    cac: 36.4,
    ltv90: 148.2,
    repeatRate: 22,
    status: "Strong LTV",
    newCustomers: 198,
    ltv30: 102.0,
    ltv60: 128.6,
    returnRate: 4.1,
    discountDependency: 8,
    aiReview:
      "Highest 90-day LTV in the catalog at $148.20. Repeat rate is on the lower side at 22% but order value compensates. Consider as a hero acquisition product.",
    inventoryOnHand: 686,
    salesVelocity: 12,
    daysOfInventory: 57,
    stockoutRisk: "Low",
    reorderStatus: "Healthy",
    revenueAtRisk: 0,
    contributionMarginAtRisk: 0,
  },
  {
    id: "everyday-hoodie",
    name: "Everyday Hoodie",
    category: "Apparel",
    revenue: 28400,
    orders: 320,
    aov: 88.75,
    cogs: 14200,
    grossMargin: 14200,
    adSpend: 5396,
    contributionMargin: 8804,
    contributionMarginPct: 31,
    refundRate: 2.4,
    cac: 31.8,
    ltv90: 118.5,
    repeatRate: 28,
    status: "Low Margin",
    newCustomers: 254,
    ltv30: 88.7,
    ltv60: 104.3,
    returnRate: 2.9,
    discountDependency: 22,
    aiReview:
      "Contribution margin is 31%, which is below the store average of 36%. Discount dependency is 22%. Review pricing or COGS before scaling spend.",
    inventoryOnHand: 1220,
    salesVelocity: 18,
    daysOfInventory: 68,
    stockoutRisk: "Low",
    reorderStatus: "Healthy",
    revenueAtRisk: 0,
    contributionMarginAtRisk: 0,
  },
  {
    id: "trail-runner",
    name: "Trail Runner",
    category: "Footwear",
    revenue: 19200,
    orders: 122,
    aov: 157.38,
    cogs: 10880,
    grossMargin: 8320,
    adSpend: 4720,
    contributionMargin: 3600,
    contributionMarginPct: 18.8,
    refundRate: 8.4,
    cac: 38.6,
    ltv90: 132.0,
    repeatRate: 19,
    status: "High Refunds",
    newCustomers: 108,
    ltv30: 88.0,
    ltv60: 110.5,
    returnRate: 9.6,
    discountDependency: 6,
    aiReview:
      "Refund rate of 8.4% is more than 3x store average. Review sizing or product description before adding spend. Margin is at risk if refunds continue.",
    inventoryOnHand: 540,
    salesVelocity: 7,
    daysOfInventory: 77,
    stockoutRisk: "Low",
    reorderStatus: "Healthy",
    revenueAtRisk: 0,
    contributionMarginAtRisk: 0,
  },
  {
    id: "merino-quarter-sock",
    name: "Merino Quarter Sock",
    category: "Accessories",
    revenue: 11200,
    orders: 412,
    aov: 27.18,
    cogs: 4480,
    grossMargin: 6720,
    adSpend: 1680,
    contributionMargin: 5040,
    contributionMarginPct: 45,
    refundRate: 0.6,
    cac: 12.1,
    ltv90: 88.4,
    repeatRate: 41,
    status: "Profitable",
    newCustomers: 268,
    ltv30: 41.2,
    ltv60: 68.0,
    returnRate: 0.9,
    discountDependency: 4,
    aiReview:
      "Highest contribution margin % in catalog. Strong repeat rate suggests this is a great upsell or cross-sell candidate after acquisition.",
    inventoryOnHand: 184,
    salesVelocity: 24,
    daysOfInventory: 8,
    stockoutRisk: "Critical",
    reorderStatus: "Reorder placed",
    revenueAtRisk: 6700,
    contributionMarginAtRisk: 3010,
  },
  {
    id: "linen-button-up",
    name: "Linen Button-Up",
    category: "Apparel",
    revenue: 14800,
    orders: 142,
    aov: 104.23,
    cogs: 8140,
    grossMargin: 6660,
    adSpend: 0,
    contributionMargin: 6660,
    contributionMarginPct: 45,
    refundRate: 2.1,
    cac: 0,
    ltv90: 110.5,
    repeatRate: 26,
    status: "Needs COGS",
    cogsMissing: true,
    newCustomers: 92,
    ltv30: 80.0,
    ltv60: 96.0,
    returnRate: 2.6,
    discountDependency: 14,
    aiReview:
      "COGS is set to a category default. Confirm true unit cost in Calculation Settings to improve contribution margin accuracy.",
    inventoryOnHand: 312,
    salesVelocity: 5,
    daysOfInventory: 62,
    stockoutRisk: "Low",
    reorderStatus: "Healthy",
    revenueAtRisk: 0,
    contributionMarginAtRisk: 0,
  },
  {
    id: "wool-throw-blanket",
    name: "Wool Throw Blanket",
    category: "Home",
    revenue: 9400,
    orders: 78,
    aov: 120.51,
    cogs: 4700,
    grossMargin: 4700,
    adSpend: 2050,
    contributionMargin: 2650,
    contributionMarginPct: 28.2,
    refundRate: 1.2,
    cac: 38.4,
    ltv90: 138.0,
    repeatRate: 24,
    status: "Watch",
    newCustomers: 54,
    ltv30: 95.0,
    ltv60: 118.0,
    returnRate: 1.8,
    discountDependency: 18,
    aiReview:
      "Margin is acceptable but CAC is creeping above target. Watch for one more week before deciding on spend changes.",
    inventoryOnHand: 56,
    salesVelocity: 3,
    daysOfInventory: 19,
    stockoutRisk: "Moderate",
    reorderStatus: "Reorder soon",
    revenueAtRisk: 1450,
    contributionMarginAtRisk: 410,
  },
  {
    id: "all-weather-jacket",
    name: "All-Weather Jacket",
    category: "Outdoor",
    revenue: 22400,
    orders: 96,
    aov: 233.33,
    cogs: 11760,
    grossMargin: 10640,
    adSpend: 3920,
    contributionMargin: 6720,
    contributionMarginPct: 30,
    refundRate: 4.6,
    cac: 41.2,
    ltv90: 156.4,
    repeatRate: 21,
    status: "Strong LTV",
    newCustomers: 78,
    ltv30: 120.0,
    ltv60: 138.0,
    returnRate: 5.2,
    discountDependency: 9,
    aiReview:
      "High order value drives strong LTV. Refund rate is moderate at 4.6%. If sizing returns continue, margin could compress.",
    inventoryOnHand: 84,
    salesVelocity: 4,
    daysOfInventory: 21,
    stockoutRisk: "Moderate",
    reorderStatus: "Reorder placed",
    revenueAtRisk: 5840,
    contributionMarginAtRisk: 1750,
  },
]
