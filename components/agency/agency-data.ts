export type StoreHealth = "Healthy" | "Watch" | "Critical"

export interface AgencyStore {
  id: string
  name: string
  category: string
  spendTier: "$50k-$100k" | "$100k-$250k" | "$250k-$500k" | "$500k+"
  revenue: number
  spend: number
  contributionMargin: number
  contributionMarginPct: number
  blendedRoas: number
  cac: number
  refundRate: number
  stockoutRiskCount: number
  openActions: number
  goalsAtRisk: number
  health: StoreHealth
  lastReview: string
  owner: string
  monthOverMonthRevenue: number // % change
}

export const agencyStores: AgencyStore[] = [
  {
    id: "northwind-apparel",
    name: "Northwind Apparel",
    category: "Apparel",
    spendTier: "$100k-$250k",
    revenue: 482000,
    spend: 124800,
    contributionMargin: 174300,
    contributionMarginPct: 36.2,
    blendedRoas: 3.86,
    cac: 31.1,
    refundRate: 3.4,
    stockoutRiskCount: 3,
    openActions: 6,
    goalsAtRisk: 1,
    health: "Watch",
    lastReview: "Apr 24",
    owner: "Mara R.",
    monthOverMonthRevenue: 8.4,
  },
  {
    id: "summit-outdoor",
    name: "Summit Outdoor Co.",
    category: "Outdoor",
    spendTier: "$250k-$500k",
    revenue: 928400,
    spend: 318600,
    contributionMargin: 296100,
    contributionMarginPct: 31.9,
    blendedRoas: 2.91,
    cac: 42.6,
    refundRate: 5.1,
    stockoutRiskCount: 1,
    openActions: 4,
    goalsAtRisk: 0,
    health: "Healthy",
    lastReview: "Apr 25",
    owner: "Jordan T.",
    monthOverMonthRevenue: 3.1,
  },
  {
    id: "bayside-home",
    name: "Bayside Home",
    category: "Home",
    spendTier: "$50k-$100k",
    revenue: 196300,
    spend: 64200,
    contributionMargin: 51400,
    contributionMarginPct: 26.2,
    blendedRoas: 3.06,
    cac: 39.9,
    refundRate: 6.7,
    stockoutRiskCount: 0,
    openActions: 9,
    goalsAtRisk: 2,
    health: "Critical",
    lastReview: "Apr 22",
    owner: "Sam P.",
    monthOverMonthRevenue: -4.6,
  },
  {
    id: "ridgeline-footwear",
    name: "Ridgeline Footwear",
    category: "Footwear",
    spendTier: "$250k-$500k",
    revenue: 712800,
    spend: 198400,
    contributionMargin: 252600,
    contributionMarginPct: 35.4,
    blendedRoas: 3.59,
    cac: 36.2,
    refundRate: 4.2,
    stockoutRiskCount: 2,
    openActions: 5,
    goalsAtRisk: 0,
    health: "Healthy",
    lastReview: "Apr 25",
    owner: "Mara R.",
    monthOverMonthRevenue: 6.8,
  },
  {
    id: "fieldnotes-paper",
    name: "Fieldnotes Paper Co.",
    category: "Accessories",
    spendTier: "$50k-$100k",
    revenue: 142500,
    spend: 38900,
    contributionMargin: 49800,
    contributionMarginPct: 34.9,
    blendedRoas: 3.66,
    cac: 28.4,
    refundRate: 2.1,
    stockoutRiskCount: 0,
    openActions: 2,
    goalsAtRisk: 0,
    health: "Healthy",
    lastReview: "Apr 26",
    owner: "Priya N.",
    monthOverMonthRevenue: 11.2,
  },
  {
    id: "harbor-coffee",
    name: "Harbor Coffee Roasters",
    category: "Food & Beverage",
    spendTier: "$100k-$250k",
    revenue: 304100,
    spend: 88600,
    contributionMargin: 92800,
    contributionMarginPct: 30.5,
    blendedRoas: 3.43,
    cac: 22.8,
    refundRate: 1.8,
    stockoutRiskCount: 4,
    openActions: 7,
    goalsAtRisk: 1,
    health: "Watch",
    lastReview: "Apr 23",
    owner: "Jordan T.",
    monthOverMonthRevenue: 2.4,
  },
]
