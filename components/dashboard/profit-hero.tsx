"use client"

import { useState, useEffect, useCallback } from "react"
import { Calculator, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MetricDefinition } from "./metric-definition"
import { useDateRange } from "@/context/date-range-context"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi, type DashboardKpisResponse, formatCompactMoney, formatGrowthPct, formatMoney, growthChangeType } from "@/lib/api/analytics"

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(v: number, currency: string): string {
  return Math.abs(v) >= 1_000 ? formatCompactMoney(v, currency) : formatMoney(v, currency)
}

function fmtRate(v: number, decimals = 2): string {
  return `${v.toFixed(decimals)}x`
}

// ── Formula + sources ─────────────────────────────────────────────────────────

const formulaLines = [
  "Net Revenue",
  "− Est. COGS",
  "− Ad Spend",
  "− Refunds / Returns",
  "− Discounts",
  "− Shipping Subsidies",
  "− Transaction Fees",
  "= Contribution Margin",
]

const sourceRows = [
  { label: "Net Revenue source", value: "Shopify" },
  { label: "COGS source", value: "COGS Rules (setup required)" },
  { label: "Ad Spend source", value: "Connected ad platforms" },
  { label: "Refunds source", value: "Shopify (included in Net Sales)" },
]

// ── Sub-metric type ────────────────────────────────────────────────────────────

interface SubMetric {
  label: string
  value: string
  trend?: "up" | "down" | "neutral" | "none"
  source?: string
  isLive?: boolean
  isPending?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfitHero() {
  const { from, to, compareLabel } = useDateRange()
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null

  const [open, setOpen] = useState(false)
  const [kpiData, setKpiData] = useState<DashboardKpisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    try {
      const data = await dashboardApi.getKpis(orgId, from, to)
      setKpiData(data)
    } catch {
      // fail silently — card will show "—"
    } finally {
      setIsLoading(false)
    }
  }, [orgId, from, to])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived values ─────────────────────────────────────────────────────────
  const netSales        = kpiData ? Number(kpiData.kpis.netSales)   : null
  const adSpend         = kpiData ? Number(kpiData.kpis.adSpend)    : null
  const mer             = kpiData ? Number(kpiData.kpis.mer)        : null
  const revenueGrowth   = kpiData ? kpiData.growth.revenueGrowth    : null
  const currency        = kpiData?.currency ?? "USD"

  /**
   * "Marketing Contribution" = Net Sales − Ad Spend.
   * This is the best approximation of Contribution Margin available until the
   * user sets up COGS rules. Displayed as the hero metric with a clear label.
   */
  const marketingContribution =
    netSales !== null && adSpend !== null ? netSales - adSpend : null

  const hasCogs    = false   // COGS rules not implemented yet
  const hasAdSpend = adSpend !== null && adSpend > 0

  // Trend indicator for the hero metric
  const heroTrend =
    revenueGrowth !== null
      ? growthChangeType(revenueGrowth)
      : "neutral"

  // ── Sub-metrics grid ───────────────────────────────────────────────────────
  const subMetrics: SubMetric[] = [
    {
      label: "Net Revenue",
      value: netSales !== null ? fmtMoney(netSales, currency) : "—",
      trend: revenueGrowth !== null
        ? (revenueGrowth > 0.001 ? "up" : revenueGrowth < -0.001 ? "down" : "neutral")
        : "none",
      source: "Shopify",
      isLive: netSales !== null,
    },
    {
      label: "Ad Spend",
      value: adSpend !== null ? (adSpend > 0 ? fmtMoney(adSpend, currency) : `${formatMoney(0, currency)} — no ads connected`) : "—",
      trend: "neutral",
      source: hasAdSpend ? "Connected platforms" : "No ad channels",
      isLive: adSpend !== null,
    },
    {
      label: "MER",
      value: mer !== null && mer > 0 ? fmtRate(mer) : hasAdSpend ? "0.00x" : "—",
      trend: "neutral",
      source: "Calculated",
      isLive: mer !== null && hasAdSpend,
    },
    {
      label: "Est. COGS",
      value: "—",
      trend: "none",
      source: "COGS Rules (not set up)",
      isPending: true,
    },
    {
      label: "Est. Gross Margin",
      value: hasCogs ? "—" : "—",
      trend: "none",
      source: "Calculated (needs COGS)",
      isPending: true,
    },
    {
      label: "Contribution Margin %",
      value: hasCogs ? "—" : "—",
      trend: "none",
      source: "Calculated (needs COGS)",
      isPending: true,
    },
  ]

  // ── Hero metric: use marketingContribution when available ─────────────────
  const heroValue = marketingContribution !== null
    ? fmtMoney(marketingContribution, currency)
    : netSales !== null
      ? fmtMoney(netSales, currency)
      : "—"

  const heroLabel = marketingContribution !== null
    ? "Marketing Contribution"
    : "Net Revenue"

  const heroSubLabel = hasCogs
    ? "Contribution Margin"
    : marketingContribution !== null
      ? "Net Revenue − Ad Spend (COGS pending)"
      : "Full CM requires COGS setup"

  // Source tag changes based on what's connected
  const sourceTag = hasAdSpend
    ? "Shopify + Connected Ad Platforms"
    : "Shopify"

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-emerald-500/5 p-5">
      {/* Main Metric */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {heroLabel}
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              Profit Health
            </span>
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {heroValue}
            </span>

            {revenueGrowth !== null && (
              <>
                <span
                  className={[
                    "flex items-center gap-1 text-sm font-medium",
                    heroTrend === "positive" ? "text-emerald-600" : heroTrend === "negative" ? "text-red-500" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {heroTrend === "positive"
                    ? <TrendingUp className="h-4 w-4" />
                    : heroTrend === "negative"
                      ? <TrendingDown className="h-4 w-4" />
                      : <Minus className="h-4 w-4" />}
                  {formatGrowthPct(revenueGrowth)}
                </span>
                <span className="text-xs text-muted-foreground">
                  vs {compareLabel ?? "prev period"}
                </span>
              </>
            )}
          </div>

          {/* Sub-label explaining what is / isn't included */}
          {!hasCogs && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {heroSubLabel}
            </p>
          )}
        </div>

        {/* Source + View calculation */}
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
            Source: {sourceTag}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            <Calculator className="h-3 w-3" />
            View calculation
          </button>
        </div>
      </div>

      {/* Sub-metrics Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {subMetrics.map((metric) => (
          <div
            key={metric.label}
            className={[
              "rounded-lg border px-3 py-2",
              metric.isPending
                ? "border-dashed border-border/50 bg-muted/30"
                : "border-border/50 bg-card/50",
            ].join(" ")}
          >
            <div className="mb-0.5 flex items-center justify-between gap-1">
              <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <span className="truncate">{metric.label}</span>
                <MetricDefinition metric={metric.label} />
              </span>
              {metric.trend === "up"      && <TrendingUp  className="h-3 w-3 shrink-0 text-emerald-500" />}
              {metric.trend === "down"    && <TrendingDown className="h-3 w-3 shrink-0 text-red-500" />}
              {metric.trend === "neutral" && <Minus className="h-3 w-3 shrink-0 text-muted-foreground" />}
            </div>
            <p className={[
              "text-sm font-semibold",
              metric.isPending ? "text-muted-foreground" : "text-foreground",
            ].join(" ")}>
              {metric.value}
            </p>
            {metric.source && (
              <p className="text-[9px] text-muted-foreground/70">{metric.source}</p>
            )}
          </div>
        ))}
      </div>

      {/* Formula Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" />
              Contribution Margin Formula
            </DialogTitle>
            <DialogDescription className="text-xs">
              How contribution margin is calculated and where each input comes from.
              Fields marked <span className="text-amber-600 font-medium">pending</span> require
              additional setup before they contribute to the total.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <ul className="space-y-1 font-mono text-xs text-foreground">
                {formulaLines.map((line) => (
                  <li
                    key={line}
                    className={
                      line.startsWith("=")
                        ? "border-t border-border pt-1.5 mt-1.5 font-semibold text-foreground"
                        : ""
                    }
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Live values */}
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Connected — Live data
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Net Revenue</dt>
                  <dd className="font-medium text-foreground">
                    {netSales !== null ? fmtMoney(netSales, currency) : "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Ad Spend</dt>
                  <dd className="font-medium text-foreground">
                    {adSpend !== null ? fmtMoney(adSpend, currency) : "—"}
                    {adSpend !== null && adSpend === 0 && (
                      <span className="ml-1 text-muted-foreground">(no platforms connected)</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Pending values */}
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Pending setup
              </p>
              <dl className="space-y-1.5 text-xs">
                {sourceRows.slice(1).map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button asChild size="sm" variant="outline" className="text-xs">
              <a href="/settings?tab=calculations">Review Calculation Settings</a>
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
