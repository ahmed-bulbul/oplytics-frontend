"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AdvancedFilter } from "@/components/dashboard/advanced-filter"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { KPICard } from "@/components/dashboard/kpi-card"
import { DateRangeProvider, useDateRange } from "@/context/date-range-context"
import { RevenueChart, type ChartDataPoint } from "@/components/dashboard/revenue-chart"
import { ChannelPerformance } from "@/components/dashboard/channel-performance"
import { ProductPerformance } from "@/components/dashboard/product-performance"
import { CohortAnalysis } from "@/components/dashboard/cohort-analysis"
import { SubscriptionMetrics } from "@/components/dashboard/subscription-metrics"
import { MetricSelector } from "@/components/dashboard/metric-selector"
import { ProfitHero } from "@/components/dashboard/profit-hero"
import { MeasurementSourceSelector } from "@/components/dashboard/measurement-source-selector"
import { TodaysBrief } from "@/components/dashboard/todays-brief"
import { useAuth } from "@/contexts/AuthContext"
import {
  dashboardApi,
  type DashboardKpisResponse,
  type DashboardGrowthResponse,
  formatAxisDate,
  formatCompactMoney,
  formatMoney,
  formatGrowthPct,
  growthChangeType,
} from "@/lib/api/analytics"

// ── Static chart data (for metrics not yet backed by the API) ──────────────────
// When the API eventually covers these, replace the static entry with real data.

type StaticChartEntry = {
  data: ChartDataPoint[]
  format: (v: number) => string
  targetValue?: number
}

const STATIC_CHART: Record<string, StaticChartEntry> = {
  "Ad Spend": {
    data: [
      { day: "Day 1", actual: 4200, compare: 4000 },
      { day: "Day 2", actual: 4100, compare: 3900 },
      { day: "Day 3", actual: 4350, compare: 4100 },
      { day: "Day 4", actual: 4600, compare: 4200 },
      { day: "Day 5", actual: 4400, compare: 4050 },
      { day: "Day 6", actual: 4250, compare: 3950 },
      { day: "Day 7", actual: 4150, compare: 3900 },
    ],
    format: (v) => `$${(v / 1000).toFixed(1)}k`,
    targetValue: 4500,
  },
  MER: {
    data: [
      { day: "Day 1", actual: 3.4, compare: 3.1 },
      { day: "Day 2", actual: 3.6, compare: 3.2 },
      { day: "Day 3", actual: 3.8, compare: 3.4 },
      { day: "Day 4", actual: 3.3, compare: 3.0 },
      { day: "Day 5", actual: 3.9, compare: 3.5 },
      { day: "Day 6", actual: 4.1, compare: 3.6 },
      { day: "Day 7", actual: 4.0, compare: 3.5 },
    ],
    format: (v) => `${v.toFixed(1)}x`,
  },
  "Contribution Margin %": {
    data: [
      { day: "Day 1", actual: 57.2, compare: 55.4 },
      { day: "Day 2", actual: 57.6, compare: 55.9 },
      { day: "Day 3", actual: 58.1, compare: 56.3 },
      { day: "Day 4", actual: 58.4, compare: 56.7 },
      { day: "Day 5", actual: 58.6, compare: 57.0 },
      { day: "Day 6", actual: 58.9, compare: 57.2 },
      { day: "Day 7", actual: 59.2, compare: 57.5 },
    ],
    format: (v) => `${v.toFixed(1)}%`,
  },
  AOV: {
    data: [
      { day: "Day 1", actual: 88.5, compare: 82.1 },
      { day: "Day 2", actual: 91.2, compare: 84.5 },
      { day: "Day 3", actual: 89.8, compare: 83.2 },
      { day: "Day 4", actual: 92.1, compare: 85.8 },
      { day: "Day 5", actual: 90.5, compare: 84.0 },
      { day: "Day 6", actual: 93.2, compare: 86.5 },
      { day: "Day 7", actual: 94.1, compare: 87.0 },
    ],
    format: (v) => `$${v.toFixed(0)}`,
  },
  CPA: {
    data: [
      { day: "Day 1", actual: 26.5, compare: 28.2 },
      { day: "Day 2", actual: 25.2, compare: 27.5 },
      { day: "Day 3", actual: 24.8, compare: 26.8 },
      { day: "Day 4", actual: 27.1, compare: 29.0 },
      { day: "Day 5", actual: 23.5, compare: 25.8 },
      { day: "Day 6", actual: 22.8, compare: 25.2 },
      { day: "Day 7", actual: 23.1, compare: 25.0 },
    ],
    format: (v) => `$${v.toFixed(2)}`,
  },
  CAC: {
    data: [
      { day: "Day 1", actual: 32.5, compare: 35.2 },
      { day: "Day 2", actual: 31.2, compare: 34.0 },
      { day: "Day 3", actual: 30.8, compare: 33.5 },
      { day: "Day 4", actual: 33.1, compare: 36.0 },
      { day: "Day 5", actual: 29.5, compare: 32.8 },
      { day: "Day 6", actual: 28.8, compare: 32.0 },
      { day: "Day 7", actual: 30.1, compare: 33.2 },
    ],
    format: (v) => `$${v.toFixed(2)}`,
  },
  "New Customers": {
    data: [
      { day: "Day 1", actual: 98, compare: 85 },
      { day: "Day 2", actual: 112, compare: 95 },
      { day: "Day 3", actual: 125, compare: 105 },
      { day: "Day 4", actual: 105, compare: 92 },
      { day: "Day 5", actual: 132, compare: 112 },
      { day: "Day 6", actual: 145, compare: 120 },
      { day: "Day 7", actual: 152, compare: 125 },
    ],
    format: (v) => v.toString(),
  },
  Returning: {
    data: [
      { day: "Day 1", actual: 52, compare: 45 },
      { day: "Day 2", actual: 58, compare: 50 },
      { day: "Day 3", actual: 64, compare: 55 },
      { day: "Day 4", actual: 55, compare: 48 },
      { day: "Day 5", actual: 68, compare: 58 },
      { day: "Day 6", actual: 72, compare: 62 },
      { day: "Day 7", actual: 78, compare: 65 },
    ],
    format: (v) => v.toString(),
  },
  ROAS: {
    data: [
      { day: "Day 1", actual: 3.5, compare: 3.2 },
      { day: "Day 2", actual: 3.8, compare: 3.5 },
      { day: "Day 3", actual: 4.0, compare: 3.7 },
      { day: "Day 4", actual: 3.9, compare: 3.6 },
      { day: "Day 5", actual: 4.1, compare: 3.8 },
      { day: "Day 6", actual: 4.15, compare: 3.9 },
      { day: "Day 7", actual: 4.21, compare: 4.0 },
    ],
    format: (v) => `${v.toFixed(2)}x`,
  },
  "Conv. Rate": {
    data: [
      { day: "Day 1", actual: 3.1, compare: 2.9 },
      { day: "Day 2", actual: 3.2, compare: 3.0 },
      { day: "Day 3", actual: 3.28, compare: 3.05 },
      { day: "Day 4", actual: 3.32, compare: 3.1 },
      { day: "Day 5", actual: 3.35, compare: 3.15 },
      { day: "Day 6", actual: 3.4, compare: 3.2 },
      { day: "Day 7", actual: 3.42, compare: 3.25 },
    ],
    format: (v) => `${v.toFixed(2)}%`,
  },
  LTV: {
    data: [
      { day: "Day 1", actual: 265, compare: 255 },
      { day: "Day 2", actual: 270, compare: 260 },
      { day: "Day 3", actual: 275, compare: 265 },
      { day: "Day 4", actual: 278, compare: 268 },
      { day: "Day 5", actual: 280, compare: 270 },
      { day: "Day 6", actual: 282, compare: 272 },
      { day: "Day 7", actual: 284.5, compare: 274 },
    ],
    format: (v) => `$${v.toFixed(0)}`,
  },
  "Gross Profit": {
    data: [
      { day: "Day 1", actual: 78000, compare: 71000 },
      { day: "Day 2", actual: 82000, compare: 74000 },
      { day: "Day 3", actual: 84000, compare: 76000 },
      { day: "Day 4", actual: 86000, compare: 78000 },
      { day: "Day 5", actual: 90000, compare: 81000 },
      { day: "Day 6", actual: 92500, compare: 83000 },
      { day: "Day 7", actual: 94280, compare: 85000 },
    ],
    format: (v) => `$${(v / 1000).toFixed(0)}k`,
  },
  Sessions: {
    data: [
      { day: "Day 1", actual: 35000, compare: 32000 },
      { day: "Day 2", actual: 37000, compare: 33500 },
      { day: "Day 3", actual: 38000, compare: 34500 },
      { day: "Day 4", actual: 38500, compare: 35000 },
      { day: "Day 5", actual: 39000, compare: 35500 },
      { day: "Day 6", actual: 40000, compare: 36500 },
      { day: "Day 7", actual: 41024, compare: 37500 },
    ],
    format: (v) => `${(v / 1000).toFixed(0)}k`,
  },
}

// ── Metric definitions ─────────────────────────────────────────────────────────

type MetricId =
  | "revenue" | "orders" | "ad-spend" | "mer" | "cont-margin-pct"
  | "aov" | "cpa" | "cac" | "new-customers" | "returning"
  | "roas" | "conversion-rate" | "ltv" | "gross-profit" | "sessions"

interface MetricDef {
  id: MetricId
  label: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  target?: { label: string; progress: number }
  sparklineData?: number[]
}

// Static baseline metrics (values overwritten by live API data)
const BASELINE_METRICS: MetricDef[] = [
  {
    id: "revenue",
    label: "Revenue",
    value: "—",
    change: "— vs last period",
    changeType: "neutral",
    sparklineData: [45, 52, 49, 63, 58, 72, 68, 75, 82, 78, 85],
  },
  {
    id: "orders",
    label: "Orders",
    value: "—",
    change: "— vs last period",
    changeType: "neutral",
    sparklineData: [30, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52],
  },
  {
    id: "ad-spend",
    label: "Ad Spend",
    value: "—",
    change: "— vs last period",
    changeType: "neutral" as const,
    target: { label: "TARGET: $40K", progress: 0 },
    sparklineData: [],
  },
  {
    id: "mer",
    label: "MER",
    value: "—",
    change: "— vs last period",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "cont-margin-pct",
    label: "Contribution Margin %",
    value: "—",
    change: "— vs last period",
    changeType: "neutral" as const,
    target: { label: "TARGET: 60%", progress: 0 },
    sparklineData: [],
  },
  {
    id: "aov",
    label: "AOV",
    value: "—",
    change: "— vs last period",
    changeType: "neutral",
    sparklineData: [90, 91, 90.5, 92, 91, 92, 91.5, 91, 92, 91.5, 91.6],
  },
  {
    id: "cpa",
    label: "CPA",
    value: "—",
    change: "— vs last period",
    changeType: "neutral" as const,
    target: { label: "TARGET: $22.00", progress: 0 },
    sparklineData: [],
  },
  {
    id: "cac",
    label: "CAC",
    value: "—",
    change: "— vs last period",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "new-customers",
    label: "New Customers",
    value: "—",
    change: "— vs last period",
    changeType: "neutral",
    sparklineData: [650, 680, 700, 720, 750, 780, 800, 830, 860, 890, 912],
  },
  {
    id: "returning",
    label: "Returning",
    value: "—",
    change: "— vs last period",
    changeType: "neutral",
    sparklineData: [420, 430, 440, 445, 450, 460, 465, 475, 480, 485, 490],
  },
  {
    id: "roas",
    label: "ROAS",
    value: "—",
    change: "Coming soon",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "conversion-rate",
    label: "Conv. Rate",
    value: "—",
    change: "Coming soon",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "ltv",
    label: "LTV",
    value: "—",
    change: "Coming soon",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "gross-profit",
    label: "Gross Profit",
    value: "—",
    change: "Coming soon",
    changeType: "neutral" as const,
    sparklineData: [],
  },
  {
    id: "sessions",
    label: "Sessions",
    value: "—",
    change: "Coming soon",
    changeType: "neutral" as const,
    sparklineData: [],
  },
]

const defaultSelectedIds = BASELINE_METRICS.slice(0, 10).map((m) => m.id)

// ── Formatters ─────────────────────────────────────────────────────────────────

function safeDivide(a: number, b: number): number {
  return b > 0 ? a / b : 0
}

function growthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0
  return (current - previous) / previous
}

function fmtRevenue(v: number, currency: string): string {
  return formatCompactMoney(v, currency)
}

function fmtCurrency(v: number, currency: string): string {
  return formatMoney(v, currency)
}

function fmtCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return Math.round(v).toLocaleString()
}

// ── Dashboard inner component ──────────────────────────────────────────────────

function DashboardInner() {
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null

  const { from, to, compareFrom, compareTo, compareEnabled, compareLabel } = useDateRange()

  const [selectedMetric, setSelectedMetric] = useState("Revenue")
  const [visibleMetricIds, setVisibleMetricIds] = useState<string[]>(defaultSelectedIds)

  // ── API state ──────────────────────────────────────────────────────────────
  const [kpiData, setKpiData] = useState<DashboardKpisResponse | null>(null)
  const [compareKpiData, setCompareKpiData] = useState<DashboardKpisResponse | null>(null)
  const [growthData, setGrowthData] = useState<DashboardGrowthResponse | null>(null)
  const [compareGrowthData, setCompareGrowthData] = useState<DashboardGrowthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ── Fetch data whenever the date range or org changes ─────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    try {
      const fetches: Promise<unknown>[] = [
        dashboardApi.getKpis(orgId, from, to),
        dashboardApi.getGrowth(orgId, from, to),
      ]
      if (compareEnabled && compareFrom && compareTo) {
        fetches.push(dashboardApi.getGrowth(orgId, compareFrom, compareTo))
        fetches.push(dashboardApi.getKpis(orgId, compareFrom, compareTo))
      }

      const results = await Promise.allSettled(fetches)

      if (results[0].status === "fulfilled") {
        setKpiData(results[0].value as DashboardKpisResponse)
      }
      if (results[1].status === "fulfilled") {
        setGrowthData(results[1].value as DashboardGrowthResponse)
      }
      if (results.length > 2 && results[2].status === "fulfilled") {
        setCompareGrowthData(results[2].value as DashboardGrowthResponse)
      } else {
        setCompareGrowthData(null)
      }
      if (results.length > 3 && results[3].status === "fulfilled") {
        setCompareKpiData(results[3].value as DashboardKpisResponse)
      } else {
        setCompareKpiData(null)
      }
    } catch {
      // Errors are handled per-promise via allSettled; nothing extra needed
    } finally {
      setIsLoading(false)
    }
  }, [orgId, from, to, compareEnabled, compareFrom, compareTo])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // ── Merge real API data into the static metric definitions ─────────────────
  const comparisonText = compareEnabled && compareLabel
    ? `vs ${compareLabel}`
    : "vs prev period"
  const dashboardCurrency = kpiData?.currency ?? growthData?.meta.currency ?? "USD"

  const liveMetrics: MetricDef[] = useMemo(() => {
    return BASELINE_METRICS.map((m) => {
      if (!kpiData) {
        // While loading, keep baseline but update comparison suffix
        return { ...m, change: m.change.replace(/vs .+$/, comparisonText) }
      }

      const { kpis, growth } = kpiData
      const prevKpis = compareKpiData?.kpis ?? null

      // Pre-compute derived values for current period
      const curAdSpend  = Number(kpis.adSpend)
      const curMer      = Number(kpis.mer)
      const curNetSales = Number(kpis.netSales)
      const curOrders   = kpis.totalOrders
      const curNewCust  = kpis.newCustomers
      const curCpa      = safeDivide(curAdSpend, curOrders)
      const curCac      = safeDivide(curAdSpend, curNewCust)
      const curCmPct    = curNetSales > 0
        ? safeDivide(curNetSales - curAdSpend, curNetSales) * 100
        : 0

      // Pre-compute derived values for previous period (if available)
      const prevAdSpend  = prevKpis ? Number(prevKpis.adSpend)  : 0
      const prevMer      = prevKpis ? Number(prevKpis.mer)      : 0
      const prevNetSales = prevKpis ? Number(prevKpis.netSales) : 0
      const prevOrders   = prevKpis ? prevKpis.totalOrders      : 0
      const prevNewCust  = prevKpis ? prevKpis.newCustomers     : 0
      const prevCpa      = safeDivide(prevAdSpend, prevOrders)
      const prevCac      = safeDivide(prevAdSpend, prevNewCust)
      const prevCmPct    = prevNetSales > 0
        ? safeDivide(prevNetSales - prevAdSpend, prevNetSales) * 100
        : 0

      switch (m.id) {
        case "revenue": {
          const sparkline = growthData?.data.timeseries.revenue.map((r) => Number(r.value)) ?? m.sparklineData
          return {
            ...m,
            value: fmtRevenue(Number(kpis.totalRevenue), dashboardCurrency),
            change: `${formatGrowthPct(growth.revenueGrowth)} ${comparisonText}`,
            changeType: growthChangeType(growth.revenueGrowth),
            sparklineData: sparkline,
          }
        }
        case "orders": {
          const sparkline = growthData?.data.timeseries.orders.map((r) => Number(r.value)) ?? m.sparklineData
          return {
            ...m,
            value: fmtCount(kpis.totalOrders),
            change: `${formatGrowthPct(growth.orderGrowth)} ${comparisonText}`,
            changeType: growthChangeType(growth.orderGrowth),
            sparklineData: sparkline,
          }
        }
        case "aov":
          return {
            ...m,
            value: fmtCurrency(Number(kpis.averageOrderValue), dashboardCurrency),
            change: `— ${comparisonText}`,
            changeType: "neutral" as const,
          }
        case "new-customers":
          return {
            ...m,
            value: fmtCount(curNewCust),
            change: `— ${comparisonText}`,
            changeType: "neutral" as const,
          }
        case "returning":
          return {
            ...m,
            value: fmtCount(kpis.returningCustomers),
            change: `— ${comparisonText}`,
            changeType: "neutral" as const,
          }

        // ── Ad Spend ────────────────────────────────────────────────────────
        case "ad-spend": {
          const rate = prevKpis ? growthRate(curAdSpend, prevAdSpend) : null
          return {
            ...m,
            value: curAdSpend > 0 ? fmtRevenue(curAdSpend, dashboardCurrency) : formatCompactMoney(0, dashboardCurrency),
            change: rate !== null
              ? `${formatGrowthPct(rate)} ${comparisonText}`
              : `— ${comparisonText}`,
            target: { label: `TARGET: ${formatCompactMoney(40_000, dashboardCurrency)}`, progress: 85 },
            // For spend, lower is better only when targeting efficiency;
            // here we treat neutral — operator decides if lower spend is bad or good
            changeType: rate !== null ? growthChangeType(rate) : ("neutral" as const),
          }
        }

        // ── MER ─────────────────────────────────────────────────────────────
        case "mer": {
          const rate = prevKpis ? growthRate(curMer, prevMer) : null
          return {
            ...m,
            value: curAdSpend > 0 ? `${curMer.toFixed(2)}x` : "—",
            change: rate !== null
              ? `${formatGrowthPct(rate)} ${comparisonText}`
              : `— ${comparisonText}`,
            changeType: rate !== null ? growthChangeType(rate) : ("neutral" as const),
          }
        }

        // ── Contribution Margin % (net of ad spend; COGS pending) ───────────
        case "cont-margin-pct": {
          const rate = prevKpis && prevCmPct > 0 ? growthRate(curCmPct, prevCmPct) : null
          return {
            ...m,
            value: curNetSales > 0 ? `${curCmPct.toFixed(1)}%` : "—",
            change: rate !== null
              ? `${formatGrowthPct(rate)} ${comparisonText}`
              : `— ${comparisonText}`,
            changeType: rate !== null ? growthChangeType(rate) : ("neutral" as const),
          }
        }

        // ── CPA (Cost Per Order) ─────────────────────────────────────────────
        case "cpa": {
          const rate = prevKpis && prevCpa > 0 ? growthRate(curCpa, prevCpa) : null
          return {
            ...m,
            value: curAdSpend > 0 && curOrders > 0 ? fmtCurrency(curCpa, dashboardCurrency) : "—",
            change: rate !== null
              ? `${formatGrowthPct(rate)} ${comparisonText}`
              : `— ${comparisonText}`,
            target: { label: `TARGET: ${formatMoney(22, dashboardCurrency)}`, progress: 110 },
            // Lower CPA is better
            changeType: rate !== null ? growthChangeType(rate, true) : ("neutral" as const),
          }
        }

        // ── CAC (Cost Per New Customer) ──────────────────────────────────────
        case "cac": {
          const rate = prevKpis && prevCac > 0 ? growthRate(curCac, prevCac) : null
          return {
            ...m,
            value: curAdSpend > 0 && curNewCust > 0 ? fmtCurrency(curCac, dashboardCurrency) : "—",
            change: rate !== null
              ? `${formatGrowthPct(rate)} ${comparisonText}`
              : `— ${comparisonText}`,
            // Lower CAC is better
            changeType: rate !== null ? growthChangeType(rate, true) : ("neutral" as const),
          }
        }

        // ── Metrics not yet backed by live API data ──────────────────────────
        case "roas":
        case "conversion-rate":
        case "ltv":
        case "gross-profit":
        case "sessions":
          return { ...m, value: "—", change: "Coming soon", changeType: "neutral" as const }

        default:
          return { ...m, change: m.change.replace(/vs .+$/, comparisonText) }
      }
    })
  }, [kpiData, compareKpiData, growthData, comparisonText, dashboardCurrency])

  // ── Build chart data for the currently selected metric ─────────────────────
  const { activeChartData, activeFormatter, activeTargetValue } = useMemo((): {
    activeChartData: ChartDataPoint[]
    activeFormatter: (v: number) => string
    activeTargetValue?: number
  } => {
    // Revenue — backed by API timeseries
    if (selectedMetric === "Revenue" && growthData) {
      const current = growthData.data.timeseries.revenue
      const compareArr = compareGrowthData?.data.timeseries.revenue ?? []
      const data: ChartDataPoint[] = current.map((pt, i) => ({
        day: formatAxisDate(pt.date),
        actual: Number(pt.value),
        compare: compareArr[i] !== undefined ? Number(compareArr[i].value) : undefined,
      }))
      return { activeChartData: data, activeFormatter: (v) => fmtRevenue(v, dashboardCurrency) }
    }

    // Orders — backed by API timeseries
    if (selectedMetric === "Orders" && growthData) {
      const current = growthData.data.timeseries.orders
      const compareArr = compareGrowthData?.data.timeseries.orders ?? []
      const data: ChartDataPoint[] = current.map((pt, i) => ({
        day: formatAxisDate(pt.date),
        actual: Number(pt.value),
        compare: compareArr[i] !== undefined ? Number(compareArr[i].value) : undefined,
      }))
      return { activeChartData: data, activeFormatter: (v) => Math.round(v).toString() }
    }

    // New Customers — backed by API timeseries (new_customers)
    if (selectedMetric === "New Customers" && growthData) {
      const current = growthData.data.timeseries.new_customers
      const compareArr = compareGrowthData?.data.timeseries.new_customers ?? []
      const data: ChartDataPoint[] = current.map((pt, i) => ({
        day: formatAxisDate(pt.date),
        actual: Number(pt.value),
        compare: compareArr[i] !== undefined ? Number(compareArr[i].value) : undefined,
      }))
      return { activeChartData: data, activeFormatter: (v) => Math.round(v).toString() }
    }

    // All other metrics → static chart data
    const entry = STATIC_CHART[selectedMetric]
    if (entry) {
      const formatter =
        selectedMetric === "Ad Spend" || selectedMetric === "Gross Profit"
          ? (v: number) => fmtRevenue(v, dashboardCurrency)
          : selectedMetric === "AOV" || selectedMetric === "CPA" || selectedMetric === "CAC" || selectedMetric === "LTV"
            ? (v: number) => fmtCurrency(v, dashboardCurrency)
            : entry.format
      return {
        activeChartData: entry.data,
        activeFormatter: formatter,
        activeTargetValue: entry.targetValue,
      }
    }

    // Fallback: empty chart
    return { activeChartData: [], activeFormatter: (v) => v.toString() }
  }, [selectedMetric, growthData, compareGrowthData, dashboardCurrency])

  // ── Filter + split for card grid ───────────────────────────────────────────
  const visibleMetrics = liveMetrics.filter((m) => visibleMetricIds.includes(m.id))
  const row1 = visibleMetrics.slice(0, 5)
  const row2 = visibleMetrics.slice(5, 10)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Profit Command Center
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground md:mt-1 md:text-sm">
              Your profit-first analytics dashboard for Shopify growth.
            </p>
          </div>
        </header>

        {/*
          Sticky filter toolbar.
        */}
        <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker />

            <AdvancedFilter />

            <MetricSelector
              availableMetrics={BASELINE_METRICS.map((m) => ({ id: m.id, label: m.label }))}
              selectedMetricIds={visibleMetricIds}
              onSelectionChange={setVisibleMetricIds}
              maxVisible={10}
            />

            <div className="ml-auto">
              <MeasurementSourceSelector />
            </div>
          </div>
        </div>

        {/* Today's Brief */}
        <TodaysBrief />

        {/* Profit Hero */}
        <ProfitHero />

        {/* KPI Cards — mobile single grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {visibleMetrics.map((kpi) => (
            <KPICard
              key={kpi.id}
              {...kpi}
              isSelected={selectedMetric === kpi.label}
              onClick={() => setSelectedMetric(kpi.label)}
            />
          ))}
        </div>

        {/* KPI Cards — desktop two rows of 5 */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {row1.map((kpi) => (
            <KPICard
              key={kpi.id}
              {...kpi}
              isSelected={selectedMetric === kpi.label}
              onClick={() => setSelectedMetric(kpi.label)}
            />
          ))}
        </div>
        {row2.length > 0 && (
          <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {row2.map((kpi) => (
              <KPICard
                key={kpi.id}
                {...kpi}
                isSelected={selectedMetric === kpi.label}
                onClick={() => setSelectedMetric(kpi.label)}
              />
            ))}
          </div>
        )}

        {/* Revenue / Metric Chart — full width */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {selectedMetric}
                {isLoading && (
                  <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                    Loading…
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Daily performance — {comparisonText}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Current</span>
              </div>
              {compareEnabled && (
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: "oklch(0.6 0.15 280)" }} />
                  <span className="text-muted-foreground">Previous Period</span>
                </div>
              )}
            </div>
          </div>
          <RevenueChart
            selectedMetric={selectedMetric}
            data={activeChartData}
            formatter={activeFormatter}
            targetValue={activeTargetValue}
          />
        </div>

        {/* Channel Performance */}
        <ChannelPerformance />

        {/* Product Performance */}
        <ProductPerformance />

        {/* Cohort Analysis */}
        <CohortAnalysis />

        {/* Subscription Metrics */}
        <SubscriptionMetrics />
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <DateRangeProvider>
      <DashboardInner />
    </DateRangeProvider>
  )
}
