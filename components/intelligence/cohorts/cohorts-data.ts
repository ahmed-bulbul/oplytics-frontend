export type CohortStatus = "Healthy" | "Watch" | "Slow Payback" | "High Churn" | "Strong LTV"

export interface CohortRow {
  id: string
  name: string // e.g. "Mar 2026"
  /**
   * The dominant acquisition channel for this cohort. Kept for the drawer
   * header / channel filter; the per-row UI renders `channelMix` instead so
   * we can show multiple acquisition channels ordered by share.
   */
  acquisitionChannel: string
  /**
   * Full mix of acquisition channels with their share of new customers in
   * this cohort. Shares are expressed as percentages (0-100) and should sum
   * to roughly 100. Order is not meaningful — UI sorts by share desc.
   */
  channelMix: { channel: string; share: number }[]
  newCustomers: number
  cac: number
  // Average revenue per customer at each window
  ltv30: number
  ltv60: number
  ltv90: number
  ltv180: number
  ltv365: number
  // Repeat behavior
  repeatPurchaseRate: number
  daysToSecondPurchase: number
  paybackDays: number
  contributionMarginPerCustomer: number
  status: CohortStatus
  // Retention curve (% of customers active at each month)
  retention: number[] // 12 entries, month 0..11
  // Drawer
  topProducts: { name: string; share: number }[]
  aiReview: string
}

export const cohortRows: CohortRow[] = [
  {
    id: "2026-03",
    name: "Mar 2026",
    acquisitionChannel: "Meta Ads",
    channelMix: [
      { channel: "Meta Ads", share: 58 },
      { channel: "Google Search", share: 22 },
      { channel: "TikTok Ads", share: 12 },
      { channel: "Klaviyo Email", share: 8 },
    ],
    newCustomers: 1284,
    cac: 31.4,
    ltv30: 64.2,
    ltv60: 88.4,
    ltv90: 102.5,
    ltv180: 128.4,
    ltv365: 158.2,
    repeatPurchaseRate: 32,
    daysToSecondPurchase: 41,
    paybackDays: 38,
    contributionMarginPerCustomer: 22.4,
    status: "Strong LTV",
    retention: [100, 38, 28, 22, 19, 16, 14, 13, 12, 11, 10, 9],
    topProducts: [
      { name: "Premium Cotton Tee", share: 28 },
      { name: "Everyday Hoodie", share: 18 },
      { name: "Merino Quarter Sock", share: 12 },
    ],
    aiReview:
      "This cohort is the strongest acquisition cohort of the last 6 months. 90-day LTV is 14% above the trailing 6-month average. Recommend treating Meta as a priority acquisition channel pending Attribution review.",
  },
  {
    id: "2026-02",
    name: "Feb 2026",
    acquisitionChannel: "Meta Ads",
    channelMix: [
      { channel: "Meta Ads", share: 55 },
      { channel: "Google Search", share: 20 },
      { channel: "Google PMax", share: 14 },
      { channel: "Klaviyo Email", share: 11 },
    ],
    newCustomers: 1102,
    cac: 32.8,
    ltv30: 58.4,
    ltv60: 82.1,
    ltv90: 96.8,
    ltv180: 122.5,
    ltv365: 152.6,
    repeatPurchaseRate: 29,
    daysToSecondPurchase: 47,
    paybackDays: 44,
    contributionMarginPerCustomer: 18.6,
    status: "Healthy",
    retention: [100, 36, 26, 21, 18, 15, 13, 12, 11, 10, 10, 9],
    topProducts: [
      { name: "Premium Cotton Tee", share: 26 },
      { name: "Running Sneaker", share: 14 },
      { name: "Everyday Hoodie", share: 12 },
    ],
    aiReview:
      "Performing in line with the 12-month median. Consistent with healthy growth pace; no immediate action recommended.",
  },
  {
    id: "2026-01",
    name: "Jan 2026",
    acquisitionChannel: "Google Search",
    channelMix: [
      { channel: "Google Search", share: 46 },
      { channel: "Meta Ads", share: 28 },
      { channel: "Google PMax", share: 14 },
      { channel: "Klaviyo Email", share: 12 },
    ],
    newCustomers: 942,
    cac: 28.2,
    ltv30: 49.8,
    ltv60: 71.4,
    ltv90: 86.2,
    ltv180: 110.1,
    ltv365: 138.4,
    repeatPurchaseRate: 24,
    daysToSecondPurchase: 56,
    paybackDays: 52,
    contributionMarginPerCustomer: 14.8,
    status: "Watch",
    retention: [100, 32, 23, 18, 15, 13, 11, 10, 9, 9, 8, 8],
    topProducts: [
      { name: "Premium Cotton Tee", share: 24 },
      { name: "Linen Button-Up", share: 16 },
      { name: "Wool Throw Blanket", share: 9 },
    ],
    aiReview:
      "Repeat purchase rate dipped slightly relative to Q4 cohorts. Acceptable for now, but monitor 60-day LTV when Feb data closes.",
  },
  {
    id: "2025-12",
    name: "Dec 2025",
    acquisitionChannel: "TikTok Ads",
    channelMix: [
      { channel: "TikTok Ads", share: 44 },
      { channel: "Meta Ads", share: 28 },
      { channel: "Google Search", share: 16 },
      { channel: "Klaviyo Email", share: 12 },
    ],
    newCustomers: 716,
    cac: 22.4,
    ltv30: 48.2,
    ltv60: 64.0,
    ltv90: 73.8,
    ltv180: 92.4,
    ltv365: 118.6,
    repeatPurchaseRate: 19,
    daysToSecondPurchase: 64,
    paybackDays: 41,
    contributionMarginPerCustomer: 16.2,
    status: "Watch",
    retention: [100, 28, 19, 14, 12, 10, 9, 8, 7, 7, 6, 6],
    topProducts: [
      { name: "Premium Cotton Tee", share: 30 },
      { name: "Merino Quarter Sock", share: 14 },
      { name: "Everyday Hoodie", share: 9 },
    ],
    aiReview:
      "Holiday cohort acquired at lower CAC, but retention is below cohorts acquired through Meta. TikTok customers may be more promo-driven; consider segmenting in retention email flows.",
  },
  {
    id: "2025-11",
    name: "Nov 2025",
    acquisitionChannel: "Klaviyo Email",
    channelMix: [
      { channel: "Klaviyo Email", share: 52 },
      { channel: "Meta Ads", share: 22 },
      { channel: "Google Search", share: 16 },
      { channel: "Google PMax", share: 10 },
    ],
    newCustomers: 412,
    cac: 12.6,
    ltv30: 78.2,
    ltv60: 102.1,
    ltv90: 124.2,
    ltv180: 156.4,
    ltv365: 192.4,
    repeatPurchaseRate: 41,
    daysToSecondPurchase: 32,
    paybackDays: 18,
    contributionMarginPerCustomer: 38.4,
    status: "Strong LTV",
    retention: [100, 48, 36, 30, 27, 24, 22, 21, 20, 19, 18, 18],
    topProducts: [
      { name: "Premium Cotton Tee", share: 22 },
      { name: "Running Sneaker", share: 18 },
      { name: "All-Weather Jacket", share: 12 },
    ],
    aiReview:
      "Highest LTV cohort tracked. Email-acquired customers may be repeat-leaning; review with Attribution to confirm true incrementality.",
  },
  {
    id: "2025-10",
    name: "Oct 2025",
    acquisitionChannel: "Google PMax",
    channelMix: [
      { channel: "Google PMax", share: 48 },
      { channel: "Meta Ads", share: 24 },
      { channel: "Google Search", share: 18 },
      { channel: "TikTok Ads", share: 10 },
    ],
    newCustomers: 824,
    cac: 38.4,
    ltv30: 42.6,
    ltv60: 58.2,
    ltv90: 66.4,
    ltv180: 82.4,
    ltv365: 104.6,
    repeatPurchaseRate: 18,
    daysToSecondPurchase: 72,
    paybackDays: 78,
    contributionMarginPerCustomer: 8.2,
    status: "Slow Payback",
    retention: [100, 26, 18, 13, 11, 9, 8, 7, 7, 6, 6, 5],
    topProducts: [
      { name: "Premium Cotton Tee", share: 28 },
      { name: "Trail Runner", share: 16 },
      { name: "Everyday Hoodie", share: 10 },
    ],
    aiReview:
      "Payback is over 78 days, longer than the 45-day target. CAC from PMax is also elevated. Recommend reviewing PMax attribution risk in the Attribution tab.",
  },
  {
    id: "2025-09",
    name: "Sep 2025",
    acquisitionChannel: "Meta Ads",
    channelMix: [
      { channel: "Meta Ads", share: 60 },
      { channel: "Google Search", share: 22 },
      { channel: "Google PMax", share: 12 },
      { channel: "Klaviyo Email", share: 6 },
    ],
    newCustomers: 1011,
    cac: 36.2,
    ltv30: 52.4,
    ltv60: 71.2,
    ltv90: 84.0,
    ltv180: 102.4,
    ltv365: 122.0,
    repeatPurchaseRate: 22,
    daysToSecondPurchase: 58,
    paybackDays: 64,
    contributionMarginPerCustomer: 10.4,
    status: "High Churn",
    retention: [100, 24, 16, 12, 10, 8, 7, 6, 6, 5, 5, 5],
    topProducts: [
      { name: "Premium Cotton Tee", share: 32 },
      { name: "Linen Button-Up", share: 14 },
      { name: "Wool Throw Blanket", share: 11 },
    ],
    aiReview:
      "Retention drops sharply after month 3. Compare creative and offer mix from this period — discount-heavy acquisition may be a contributing factor.",
  },
]
