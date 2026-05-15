export type SubscriptionStatus = "Healthy" | "Watch" | "At Risk"

export interface SubscriptionCohortRow {
  id: string
  name: string // e.g. "Mar 2026"
  newSubs: number
  month2Retention: number // percent
  month3Retention: number
  month6Retention: number
  sameDayCancelRate: number
  pauseRate: number
  reactivationRate: number
  trialAbuseScore: number // 0-100, higher = more concerning
  subLtv: number
  subContributionMargin: number
  paybackMonth: string
  status: SubscriptionStatus
  cancelReasons: { reason: string; share: number }[]
  topAcquisitionSources: { source: string; ltv: number; share: number }[]
  topFirstProducts: { product: string; ltv: number; share: number }[]
  topOffers: { offer: string; ltv: number; share: number }[]
  aiReview: string
}

export const subscriptionCohortRows: SubscriptionCohortRow[] = [
  {
    id: "sub-2026-03",
    name: "Mar 2026",
    newSubs: 1402,
    month2Retention: 88.4,
    month3Retention: 82.1,
    month6Retention: 71.4,
    sameDayCancelRate: 7.2,
    pauseRate: 4.8,
    reactivationRate: 12.4,
    trialAbuseScore: 14,
    subLtv: 184,
    subContributionMargin: 96,
    paybackMonth: "Month 2",
    status: "Healthy",
    cancelReasons: [
      { reason: "Too expensive", share: 32 },
      { reason: "Didn't use it enough", share: 24 },
      { reason: "Found alternative", share: 18 },
      { reason: "Quality concerns", share: 14 },
      { reason: "Other", share: 12 },
    ],
    topAcquisitionSources: [
      { source: "Meta UGC creator", ltv: 218, share: 38 },
      { source: "Klaviyo welcome", ltv: 196, share: 22 },
      { source: "Google Search brand", ltv: 162, share: 18 },
    ],
    topFirstProducts: [
      { product: "Starter bundle", ltv: 198, share: 41 },
      { product: "Single SKU", ltv: 168, share: 34 },
      { product: "Sample pack", ltv: 142, share: 25 },
    ],
    topOffers: [
      { offer: "First month free", ltv: 204, share: 44 },
      { offer: "20% off first 3", ltv: 178, share: 32 },
      { offer: "No discount", ltv: 158, share: 24 },
    ],
    aiReview:
      "Strongest cohort in the last 90 days. Month-2 retention exceeds the 85% target. Meta UGC is the highest-LTV acquisition source — confirm with Attribution before scaling spend.",
  },
  {
    id: "sub-2026-04",
    name: "Apr 2026",
    newSubs: 1510,
    month2Retention: 79.2,
    month3Retention: 71.4,
    month6Retention: 0, // not enough time elapsed
    sameDayCancelRate: 14.8,
    pauseRate: 6.2,
    reactivationRate: 9.4,
    trialAbuseScore: 38,
    subLtv: 146,
    subContributionMargin: 64,
    paybackMonth: "Month 3",
    status: "At Risk",
    cancelReasons: [
      { reason: "Same-day cancellation", share: 38 },
      { reason: "Trial abuse signals", share: 18 },
      { reason: "Too expensive", share: 16 },
      { reason: "Didn't use it enough", share: 14 },
      { reason: "Other", share: 14 },
    ],
    topAcquisitionSources: [
      { source: "TikTok promo", ltv: 102, share: 42 },
      { source: "Meta cold creative", ltv: 132, share: 28 },
      { source: "Google PMax", ltv: 118, share: 18 },
    ],
    topFirstProducts: [
      { product: "Sample pack", ltv: 96, share: 48 },
      { product: "Single SKU", ltv: 142, share: 32 },
      { product: "Starter bundle", ltv: 184, share: 20 },
    ],
    topOffers: [
      { offer: "$1 trial", ltv: 88, share: 52 },
      { offer: "First month free", ltv: 158, share: 28 },
      { offer: "20% off first 3", ltv: 174, share: 20 },
    ],
    aiReview:
      "Same-day cancellation rate is double the trailing-90-day average. The $1 trial offer is driving lower-LTV acquisitions. Inspect cancel reasons before adjusting offer mix.",
  },
  {
    id: "sub-2026-02",
    name: "Feb 2026",
    newSubs: 1284,
    month2Retention: 86.1,
    month3Retention: 78.4,
    month6Retention: 68.2,
    sameDayCancelRate: 8.4,
    pauseRate: 5.1,
    reactivationRate: 11.8,
    trialAbuseScore: 18,
    subLtv: 172,
    subContributionMargin: 88,
    paybackMonth: "Month 2",
    status: "Healthy",
    cancelReasons: [
      { reason: "Too expensive", share: 28 },
      { reason: "Didn't use it enough", share: 26 },
      { reason: "Found alternative", share: 18 },
      { reason: "Shipping issues", share: 16 },
      { reason: "Other", share: 12 },
    ],
    topAcquisitionSources: [
      { source: "Meta UGC creator", ltv: 198, share: 36 },
      { source: "Klaviyo welcome", ltv: 188, share: 24 },
      { source: "Google Search brand", ltv: 156, share: 16 },
    ],
    topFirstProducts: [
      { product: "Starter bundle", ltv: 188, share: 38 },
      { product: "Single SKU", ltv: 162, share: 36 },
      { product: "Sample pack", ltv: 138, share: 26 },
    ],
    topOffers: [
      { offer: "First month free", ltv: 196, share: 42 },
      { offer: "20% off first 3", ltv: 168, share: 34 },
      { offer: "No discount", ltv: 152, share: 24 },
    ],
    aiReview:
      "Solid cohort. Performance is in line with the 6-month median. Continue current acquisition mix.",
  },
  {
    id: "sub-2026-01",
    name: "Jan 2026",
    newSubs: 1102,
    month2Retention: 82.8,
    month3Retention: 74.1,
    month6Retention: 64.0,
    sameDayCancelRate: 9.8,
    pauseRate: 5.6,
    reactivationRate: 10.2,
    trialAbuseScore: 22,
    subLtv: 158,
    subContributionMargin: 78,
    paybackMonth: "Month 3",
    status: "Watch",
    cancelReasons: [
      { reason: "Too expensive", share: 30 },
      { reason: "Didn't use it enough", share: 24 },
      { reason: "Found alternative", share: 20 },
      { reason: "Quality concerns", share: 14 },
      { reason: "Other", share: 12 },
    ],
    topAcquisitionSources: [
      { source: "Meta UGC creator", ltv: 188, share: 34 },
      { source: "TikTok promo", ltv: 124, share: 26 },
      { source: "Google Search brand", ltv: 158, share: 18 },
    ],
    topFirstProducts: [
      { product: "Starter bundle", ltv: 178, share: 36 },
      { product: "Single SKU", ltv: 156, share: 34 },
      { product: "Sample pack", ltv: 122, share: 30 },
    ],
    topOffers: [
      { offer: "First month free", ltv: 188, share: 38 },
      { offer: "20% off first 3", ltv: 164, share: 32 },
      { offer: "$1 trial", ltv: 116, share: 30 },
    ],
    aiReview:
      "Trial abuse score is climbing. Watch the next two cohorts before scaling $1 trial offers.",
  },
]

// Subscription-wide rollup metrics
export const subscriptionMetrics = {
  activeSubscribers: 4214,
  netNewLast30Days: 286,
  weightedSubLtv: 168,
  weightedContributionMargin: 82,
  avgMonth2Retention: 84.1,
  benchmarkMonth2Retention: 80,
  trialAbuseRate: 23,
  benchmarkTrialAbuseRate: 12,
}
