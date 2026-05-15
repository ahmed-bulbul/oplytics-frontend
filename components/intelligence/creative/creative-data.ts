export type CreativeStatus =
  | "Scaling"
  | "Healthy"
  | "Fatiguing"
  | "Needs Review"
  | "Underperforming"

export type CreativeFormat =
  | "Static"
  | "UGC video"
  | "Founder video"
  | "Testimonial"
  | "Carousel"
  | "Product demo"
  | "Offer ad"

export type CreativeAngle =
  | "Testimonial"
  | "Founder story"
  | "Product demo"
  | "Problem / solution"
  | "Offer / sale"
  | "Comparison"
  | "Education"

export type CreativeChannel = "Meta Ads" | "TikTok Ads" | "Google Ads" | "YouTube"

export interface CreativeRow {
  id: string
  name: string
  /**
   * Path to a square (1:1) thumbnail rendered in the table and at the top of
   * the detail drawer. Stored under /public/creatives/.
   */
  thumbnailUrl: string
  format: CreativeFormat
  angle: CreativeAngle
  channel: CreativeChannel
  spend: number
  revenue: number
  roas: number
  cpa: number
  cac: number
  contributionMargin: number
  ctr: number
  thumbstop: number
  newCustomerRate: number
  status: CreativeStatus
  hook: string
  offer: string
  landingPage: string
  trend: {
    ctr: number[]
    cpa: number[]
    roas: number[]
    contributionMargin: number[]
  }
  aiReview: string
}

export const creativeRows: CreativeRow[] = [
  {
    id: "founder-demo",
    name: "Founder Demo Video",
    thumbnailUrl: "/creatives/founder-demo.jpg",
    format: "Founder video",
    angle: "Founder story",
    channel: "Meta Ads",
    spend: 6420,
    revenue: 24800,
    roas: 3.86,
    cpa: 31.2,
    cac: 33.4,
    contributionMargin: 8420,
    ctr: 2.1,
    thumbstop: 28,
    newCustomerRate: 72,
    status: "Healthy",
    hook: "Founder explanation",
    offer: "Free trial / demo",
    landingPage: "Product page",
    trend: {
      ctr: [2.6, 2.5, 2.4, 2.3, 2.2, 2.15, 2.1],
      cpa: [27.8, 28.4, 29.1, 29.7, 30.2, 30.8, 31.2],
      roas: [4.1, 4.05, 3.98, 3.95, 3.92, 3.9, 3.86],
      contributionMargin: [9100, 8980, 8800, 8700, 8580, 8500, 8420],
    },
    aiReview:
      "Performance is still healthy, but CTR has declined 14% over the last 7 days. Review the opening hook before increasing spend.",
  },
  {
    id: "ugc-testimonial-mashup",
    name: "UGC Testimonial Mashup",
    thumbnailUrl: "/creatives/ugc-testimonial-mashup.jpg",
    format: "UGC video",
    angle: "Testimonial",
    channel: "Meta Ads",
    spend: 4280,
    revenue: 19340,
    roas: 4.52,
    cpa: 28.4,
    cac: 28.4,
    contributionMargin: 6940,
    ctr: 2.8,
    thumbstop: 33,
    newCustomerRate: 81,
    status: "Scaling",
    hook: "Real customer reactions",
    offer: "Bundle discount",
    landingPage: "Bundle landing",
    trend: {
      ctr: [2.4, 2.45, 2.5, 2.6, 2.7, 2.75, 2.8],
      cpa: [33.1, 32.4, 31.6, 30.5, 29.8, 29.0, 28.4],
      roas: [3.9, 4.05, 4.18, 4.3, 4.42, 4.48, 4.52],
      contributionMargin: [5800, 6020, 6300, 6500, 6720, 6850, 6940],
    },
    aiReview:
      "Strong new customer rate at 81% with stable thumbstop above 30%. CAC is below target, suggesting room to scale spend with monitoring.",
  },
  {
    id: "summer-sale-static",
    name: "Summer Sale Static",
    thumbnailUrl: "/creatives/summer-sale-static.jpg",
    format: "Static",
    angle: "Offer / sale",
    channel: "Meta Ads",
    spend: 3120,
    revenue: 13104,
    roas: 4.2,
    cpa: 24.8,
    cac: 38.6,
    contributionMargin: 4180,
    ctr: 1.7,
    thumbstop: 19,
    newCustomerRate: 41,
    status: "Healthy",
    hook: "Still relying on ROAS alone?",
    offer: "20% off seasonal",
    landingPage: "Sale collection",
    trend: {
      ctr: [1.6, 1.65, 1.68, 1.7, 1.72, 1.71, 1.7],
      cpa: [26.0, 25.8, 25.4, 25.1, 24.9, 24.85, 24.8],
      roas: [3.95, 4.02, 4.1, 4.15, 4.18, 4.19, 4.2],
      contributionMargin: [3700, 3820, 3920, 4020, 4100, 4140, 4180],
    },
    aiReview:
      "Highest ROAS in account, driven by promo offer. New customer rate is below brand average — review whether this is incremental revenue or repeat buyer demand.",
  },
  {
    id: "carousel-product-grid",
    name: "Carousel Product Grid",
    thumbnailUrl: "/creatives/carousel-product-grid.jpg",
    format: "Carousel",
    angle: "Product demo",
    channel: "Meta Ads",
    spend: 2840,
    revenue: 7820,
    roas: 2.75,
    cpa: 41.2,
    cac: 49.1,
    contributionMargin: 1340,
    ctr: 1.2,
    thumbstop: 12,
    newCustomerRate: 56,
    status: "Fatiguing",
    hook: "Carousel of bestsellers",
    offer: "None",
    landingPage: "Catalog page",
    trend: {
      ctr: [1.6, 1.55, 1.5, 1.4, 1.32, 1.25, 1.2],
      cpa: [34.5, 36.0, 37.4, 38.8, 39.9, 40.5, 41.2],
      roas: [3.4, 3.25, 3.1, 2.98, 2.88, 2.82, 2.75],
      contributionMargin: [2100, 1960, 1820, 1690, 1540, 1430, 1340],
    },
    aiReview:
      "Frequency has crossed 4.0 with CTR down 25% over 14 days. Recommend reviewing creative refresh before adding spend.",
  },
  {
    id: "tiktok-ugc-unboxing",
    name: "TikTok UGC Unboxing",
    thumbnailUrl: "/creatives/tiktok-ugc-unboxing.jpg",
    format: "UGC video",
    angle: "Product demo",
    channel: "TikTok Ads",
    spend: 1890,
    revenue: 7180,
    roas: 3.8,
    cpa: 19.4,
    cac: 22.1,
    contributionMargin: 2410,
    ctr: 3.4,
    thumbstop: 37,
    newCustomerRate: 78,
    status: "Scaling",
    hook: "Still relying on ROAS alone?",
    offer: "First-order discount",
    landingPage: "Hero product",
    trend: {
      ctr: [2.8, 2.95, 3.05, 3.15, 3.25, 3.3, 3.4],
      cpa: [24.0, 23.0, 22.1, 21.0, 20.4, 19.8, 19.4],
      roas: [3.2, 3.3, 3.45, 3.55, 3.65, 3.72, 3.8],
      contributionMargin: [1850, 1980, 2100, 2200, 2280, 2350, 2410],
    },
    aiReview:
      "Highest thumbstop rate at 37% across portfolio with strong new customer rate. Hook performance suggests room to test similar variants.",
  },
  {
    id: "lifestyle-shot",
    name: "Lifestyle Shot Static",
    thumbnailUrl: "/creatives/lifestyle-shot.jpg",
    format: "Static",
    angle: "Education",
    channel: "Meta Ads",
    spend: 1650,
    revenue: 2475,
    roas: 1.5,
    cpa: 58.9,
    cac: 64.2,
    contributionMargin: -340,
    ctr: 0.9,
    thumbstop: 9,
    newCustomerRate: 31,
    status: "Underperforming",
    hook: "Brand lifestyle imagery",
    offer: "None",
    landingPage: "Homepage",
    trend: {
      ctr: [1.3, 1.2, 1.1, 1.0, 0.95, 0.92, 0.9],
      cpa: [42.0, 46.5, 50.0, 53.0, 55.5, 57.5, 58.9],
      roas: [2.1, 1.95, 1.8, 1.7, 1.6, 1.55, 1.5],
      contributionMargin: [380, 240, 100, -40, -160, -260, -340],
    },
    aiReview:
      "Negative contribution margin for 5 consecutive days. Recommend pausing or refreshing the angle before continuing spend.",
  },
  {
    id: "comparison-static",
    name: "Comparison Chart Static",
    thumbnailUrl: "/creatives/comparison-static.jpg",
    format: "Static",
    angle: "Comparison",
    channel: "Google Ads",
    spend: 2240,
    revenue: 8064,
    roas: 3.6,
    cpa: 27.6,
    cac: 31.8,
    contributionMargin: 2580,
    ctr: 4.1,
    thumbstop: 24,
    newCustomerRate: 64,
    status: "Healthy",
    hook: "Optilytics vs ROAS-only tools",
    offer: "Free demo",
    landingPage: "Comparison page",
    trend: {
      ctr: [3.9, 3.95, 4.0, 4.0, 4.05, 4.08, 4.1],
      cpa: [29.5, 29.0, 28.5, 28.1, 27.9, 27.7, 27.6],
      roas: [3.4, 3.45, 3.5, 3.55, 3.58, 3.59, 3.6],
      contributionMargin: [2240, 2310, 2400, 2460, 2510, 2550, 2580],
    },
    aiReview:
      "Stable performance with above-average CTR. Holds well on Google Ads — consider testing as a Meta Ads variant.",
  },
  {
    id: "founder-podcast-clip",
    name: "Founder Podcast Clip",
    thumbnailUrl: "/creatives/founder-podcast-clip.jpg",
    format: "Founder video",
    angle: "Education",
    channel: "Meta Ads",
    spend: 1420,
    revenue: 4824,
    roas: 3.4,
    cpa: 33.1,
    cac: 36.0,
    contributionMargin: 1380,
    ctr: 2.4,
    thumbstop: 31,
    newCustomerRate: 69,
    status: "Needs Review",
    hook: "What most growth dashboards get wrong",
    offer: "Free trial",
    landingPage: "Lead capture",
    trend: {
      ctr: [2.6, 2.55, 2.5, 2.48, 2.45, 2.42, 2.4],
      cpa: [31.0, 31.5, 32.0, 32.5, 32.8, 33.0, 33.1],
      roas: [3.6, 3.55, 3.5, 3.48, 3.45, 3.42, 3.4],
      contributionMargin: [1520, 1490, 1460, 1430, 1410, 1390, 1380],
    },
    aiReview:
      "Performance has softened slightly while frequency climbed above 3.5. Consider rotating in a refreshed cut before adding spend.",
  },
]

export const fatiguedSpendTotal = creativeRows
  .filter((c) => c.status === "Fatiguing" || c.status === "Needs Review")
  .reduce((sum, c) => sum + c.spend, 0)

export const creativeCounts = {
  needsReview: creativeRows.filter((c) => c.status === "Needs Review" || c.status === "Fatiguing").length,
}
