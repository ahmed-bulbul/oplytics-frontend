"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight, ChevronDown, BarChart3 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { useDateRange } from "@/context/date-range-context"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/lib/api/analytics"
import {
  CHANNEL_PERFORMANCE_METRICS_BY_ID,
  DEFAULT_VISIBLE_CHANNEL_METRIC_IDS,
  CHANNEL_PERFORMANCE_COLUMNS_STORAGE_KEY,
  SOURCE_DESCRIPTIONS,
  type ChannelRow,
  type ChannelPerformanceMetric,
  type ChannelStatus,
} from "./channel-performance-metrics"
import { ChannelPerformanceColumnPicker } from "./channel-performance-column-picker"
import { ChannelMetricsDrawer } from "./channel-metrics-drawer"
import { MetricCalculationPopover } from "./metric-calculation-popover"

/* ------------------------------------------------------------------------ */
/* Demo data                                                                */
/* ------------------------------------------------------------------------ */

const channelData: ChannelRow[] = [
  {
    id: "meta",
    name: "Meta Ads",
    status: "Healthy",
    delivery: "Active",
    budget: "$1,800/day",
    attributionWindow: "7-day click",
    spend: "$12,402",
    spendChange: "+8.2%",
    dailySpend: "$1,772/day",
    revenue: "$48,210",
    revenueChange: "+12.4%",
    roas: "3.88x",
    roasChange: "+3.9%",
    mer: "3.12",
    purchases: "484",
    cpa: "$25.60",
    cpaChange: "-2.1%",
    cac: "$30.50",
    aov: "$99.61",
    cr: "1.13%",
    ncRoas: "2.85x",
    ncRoasTarget: "2.50x",
    cpc: "$0.29",
    cpm: "$9.94",
    ctr: "3.44%",
    cAtc: "$4.20",
    clicks: "42,901",
    linkClicks: "42,901",
    clicksChange: "+5.6%",
    impressions: "1,247,500",
    reach: "892,400",
    frequency: "1.40",
    landingPageViews: "37,840",
    contentViews: "26,980",
    addsToCart: "3,420",
    initiateCheckouts: "1,650",
    thruPlays: "182,400",
    videoP25: "498,200",
    videoP50: "342,100",
    videoP75: "224,800",
    videoP95: "142,300",
    platformRoas: "4.21x",
    shopifyBlendedRoas: "3.65x",
    viewThroughPct: "18.0%",
    children: [
      {
        id: "meta-q4",
        name: "Campaign: Q4 Winter Push",
        status: "Healthy",
        delivery: "Active",
        budget: "$1,200/day",
        attributionWindow: "7-day click",
        spend: "$8,200",
        spendChange: "+6.5%",
        dailySpend: "$1,171/day",
        revenue: "$31,500",
        revenueChange: "+10.2%",
        roas: "3.84x",
        roasChange: "+3.5%",
        mer: "3.12",
        purchases: "315",
        cpa: "$26.03",
        cpaChange: "-1.8%",
        cac: "$32.10",
        aov: "$100.00",
        cr: "1.12%",
        ncRoas: "2.78x",
        ncRoasTarget: "2.50x",
        cpc: "$0.29",
        cpm: "$10.05",
        ctr: "3.45%",
        cAtc: "$4.30",
        clicks: "28,100",
        linkClicks: "28,100",
        clicksChange: "+4.2%",
        impressions: "815,920",
        reach: "584,200",
        frequency: "1.40",
        landingPageViews: "24,650",
        contentViews: "17,420",
        addsToCart: "2,210",
        initiateCheckouts: "1,080",
        thruPlays: "118,200",
        videoP25: "324,800",
        videoP50: "221,400",
        videoP75: "146,100",
        videoP95: "92,800",
        platformRoas: "4.18x",
        shopifyBlendedRoas: "3.61x",
        viewThroughPct: "19.0%",
        children: [
          {
            id: "meta-q4-apparel",
            name: "Ad Set: Apparel_Interest_US",
            status: "Healthy",
            delivery: "Active",
            budget: "$600/day",
            attributionWindow: "7-day click",
            spend: "$4,100",
            spendChange: "+5.1%",
            dailySpend: "$586/day",
            revenue: "$15,200",
            revenueChange: "+8.7%",
            roas: "3.71x",
            roasChange: "+3.4%",
            mer: "3.12",
            purchases: "152",
            cpa: "$26.97",
            cpaChange: "-0.9%",
            cac: "$33.20",
            aov: "$100.00",
            cr: "1.23%",
            ncRoas: "2.65x",
            ncRoasTarget: "2.50x",
            cpc: "$0.33",
            cpm: "$10.50",
            ctr: "3.18%",
            cAtc: "$4.50",
            clicks: "12,400",
            linkClicks: "12,400",
            clicksChange: "+3.1%",
            impressions: "390,476",
            reach: "278,900",
            frequency: "1.40",
            landingPageViews: "10,920",
            contentViews: "7,720",
            addsToCart: "988",
            initiateCheckouts: "478",
            thruPlays: "54,200",
            videoP25: "152,400",
            videoP50: "104,800",
            videoP75: "68,400",
            videoP95: "42,100",
            platformRoas: "4.05x",
            shopifyBlendedRoas: "3.50x",
            viewThroughPct: "20.0%",
          },
        ],
      },
    ],
  },
  {
    id: "google",
    name: "Google Search",
    status: "Healthy",
    delivery: "Active",
    budget: "$1,200/day",
    attributionWindow: "Data-driven",
    spend: "$8,100",
    spendChange: "+4.5%",
    dailySpend: "$1,157/day",
    revenue: "$32,400",
    revenueChange: "+9.8%",
    roas: "4.00x",
    roasChange: "+5.1%",
    mer: "3.12",
    purchases: "360",
    cpa: "$22.50",
    cpaChange: "-3.2%",
    cac: "$26.10",
    aov: "$90.00",
    cr: "2.37%",
    ncRoas: "2.95x",
    ncRoasTarget: "2.50x",
    cpc: "$0.53",
    cpm: "$53.29",
    ctr: "10.0%",
    cAtc: "$3.90",
    clicks: "15,200",
    linkClicks: "15,200",
    clicksChange: "+6.7%",
    impressions: "152,000",
    reach: "118,400",
    frequency: "1.28",
    landingPageViews: "13,950",
    contentViews: "9,830",
    addsToCart: "1,520",
    initiateCheckouts: "720",
    platformRoas: "4.30x",
    shopifyBlendedRoas: "3.80x",
    viewThroughPct: "4.0%",
  },
  {
    id: "email",
    name: "Email Marketing",
    status: "Healthy",
    delivery: "Active",
    attributionWindow: "Last click",
    spend: "$1,200",
    spendChange: "+2.1%",
    dailySpend: "$171/day",
    revenue: "$22,900",
    revenueChange: "+15.3%",
    roas: "19.08x",
    roasChange: "+12.9%",
    mer: "3.12",
    purchases: "285",
    cpa: "$4.21",
    cpaChange: "-5.4%",
    cac: "$5.50",
    aov: "$80.35",
    cr: "3.39%",
    ncRoas: "8.50x",
    ncRoasTarget: "5.00x",
    cpc: "$0.14",
    cAtc: "$2.10",
    clicks: "8,400",
    linkClicks: "8,400",
    clicksChange: "+7.8%",
    landingPageViews: "7,920",
    contentViews: "5,480",
    addsToCart: "920",
    initiateCheckouts: "440",
    shopifyBlendedRoas: "18.50x",
  },
]

/* ------------------------------------------------------------------------ */
/* Cell helpers                                                             */
/* ------------------------------------------------------------------------ */

function CompareValue({ change }: { change?: string }) {
  if (!change) return null
  const isPositive = change.startsWith("+")
  const isNegative = change.startsWith("-")
  return (
    <span
      className={cn(
        "ml-1 text-[10px]",
        isPositive && "text-emerald-500",
        isNegative && "text-red-500",
        !isPositive && !isNegative && "text-muted-foreground",
      )}
    >
      {change}
    </span>
  )
}

const STATUS_TONE: Record<ChannelStatus, string> = {
  Healthy:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "At Risk":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Underperforming:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

function StatusPill({ status }: { status?: ChannelStatus }) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STATUS_TONE[status],
      )}
    >
      {status}
    </span>
  )
}

/**
 * Renders a single dynamic metric cell. Status metrics render a colored
 * pill; everything else renders the formatted string with optional
 * compare-mode change pill.
 */
function MetricCell({
  row,
  metric,
  showCompare,
}: {
  row: ChannelRow
  metric: ChannelPerformanceMetric
  showCompare: boolean
}) {
  if (metric.kind === "status") {
    return (
      <TableCell className="text-left">
        <StatusPill status={row.status} />
      </TableCell>
    )
  }

  const value = metric.accessor(row)
  const change = showCompare ? metric.changeAccessor?.(row) : undefined

  return (
    <TableCell
      className={cn(
        metric.align === "right" ? "text-right tabular-nums" : "text-left",
      )}
    >
      {value ?? <span className="text-muted-foreground">—</span>}
      {change && <CompareValue change={change} />}
    </TableCell>
  )
}

/* ------------------------------------------------------------------------ */
/* Row                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Maps a row's depth in the hierarchy to a human-readable level label used
 * in the diagnostic drawer header.
 */
function levelLabelForDepth(depth: number): string {
  if (depth === 0) return "Channel"
  if (depth === 1) return "Campaign"
  return "Ad Set"
}

function ChannelRowComponent({
  row,
  depth = 0,
  showCompare,
  visibleMetrics,
  onViewMetrics,
}: {
  row: ChannelRow
  depth?: number
  showCompare: boolean
  visibleMetrics: ChannelPerformanceMetric[]
  onViewMetrics: (row: ChannelRow, level: string) => void
}) {
  // Channels (depth 0) start expanded so the hierarchy is discoverable on
  // first render — same behavior as the previous implementation.
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <TableRow className="border-border hover:bg-muted/50">
        {/* Name + caret. Caret remains the row's only expand interaction. */}
        <TableCell
          className={cn(
            "font-medium",
            hasChildren ? "cursor-pointer" : "",
          )}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className={cn(depth > 0 && "text-muted-foreground")}>
              {row.name}
            </span>
          </div>
        </TableCell>

        {/* Dynamic metric columns */}
        {visibleMetrics.map((metric) => (
          <MetricCell
            key={metric.id}
            row={row}
            metric={metric}
            showCompare={showCompare}
          />
        ))}

        {/* Per-row "View metrics" diagnostic action — explicitly separate
            from the row caret so the two interactions never conflict. */}
        <TableCell className="w-[1%] whitespace-nowrap text-right">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewMetrics(row, levelLabelForDepth(depth))
                }}
                aria-label={`View metrics for ${row.name}`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">View metrics</TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>

      {expanded &&
        row.children?.map((child) => (
          <ChannelRowComponent
            key={child.id}
            row={child}
            depth={depth + 1}
            showCompare={showCompare}
            visibleMetrics={visibleMetrics}
            onViewMetrics={onViewMetrics}
          />
        ))}
    </>
  )
}

/* ------------------------------------------------------------------------ */
/* Main                                                                     */
/* ------------------------------------------------------------------------ */

export function ChannelPerformance() {
  const { compareEnabled, compareLabel, from, to } = useDateRange()
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null
  const [hasConnectedAdChannel, setHasConnectedAdChannel] = useState(true)

  /* ----- Column visibility (persisted to localStorage) ------------------ */
  const [visibleMetricIds, setVisibleMetricIds] = useState<string[]>(
    DEFAULT_VISIBLE_CHANNEL_METRIC_IDS,
  )

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        CHANNEL_PERFORMANCE_COLUMNS_STORAGE_KEY,
      )
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (id) =>
            typeof id === "string" && id in CHANNEL_PERFORMANCE_METRICS_BY_ID,
        )
      ) {
        setVisibleMetricIds(
          parsed.length > 0 ? parsed : DEFAULT_VISIBLE_CHANNEL_METRIC_IDS,
        )
      }
    } catch {
      // Corrupt or missing — fall back to defaults silently.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHANNEL_PERFORMANCE_COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleMetricIds),
      )
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [visibleMetricIds])

  // Resolve ids → metric objects in canonical order.
  const visibleMetrics = visibleMetricIds
    .map((id) => CHANNEL_PERFORMANCE_METRICS_BY_ID[id])
    .filter((m): m is ChannelPerformanceMetric => Boolean(m))

  /* ----- Diagnostic drawer state --------------------------------------- */
  const [drawerRow, setDrawerRow] = useState<ChannelRow | null>(null)
  const [drawerLevel, setDrawerLevel] = useState<string>("Channel")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleViewMetrics = (row: ChannelRow, level: string) => {
    setDrawerRow(row)
    setDrawerLevel(level)
    setDrawerOpen(true)
  }

  useEffect(() => {
    let cancelled = false

    async function loadAdChannelState() {
      if (!orgId) return
      try {
        const data = await dashboardApi.getKpis(orgId, from, to)
        if (!cancelled) {
          setHasConnectedAdChannel(Number(data.kpis.adSpend) > 0)
        }
      } catch {
        if (!cancelled) {
          setHasConnectedAdChannel(true)
        }
      }
    }

    loadAdChannelState()
    return () => {
      cancelled = true
    }
  }, [orgId, from, to])

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Channel Performance & Paid Media Efficiency
              </h3>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                Source: Connected ad platforms
              </span>
              {compareEnabled && compareLabel && (
                <span className="text-[10px] text-muted-foreground">
                  vs {compareLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Compare spend, revenue, ROAS, traffic cost, and conversion
              quality by channel, campaign, and ad set.
            </p>
          </div>
          <div className="shrink-0">
            <ChannelPerformanceColumnPicker
              visibleMetricIds={visibleMetricIds}
              onChange={setVisibleMetricIds}
            />
          </div>
        </div>
      </div>

  

      {hasConnectedAdChannel ? (
        <div className="overflow-x-auto">
          <TooltipProvider delayDuration={250}>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Channel / Campaign / Ad Set
                  </TableHead>
                  {visibleMetrics.map((metric) => (
                    <TableHead
                      key={metric.id}
                      className={cn(
                        "whitespace-nowrap text-muted-foreground",
                        metric.align === "right" && "text-right",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          metric.align === "right" && "justify-end",
                        )}
                      >
                        {metric.shortLabel ?? metric.label}
                        <MetricCalculationPopover
                          label={metric.label}
                          description={metric.description}
                          formula={metric.formula}
                          source={metric.source}
                          sourceDescription={SOURCE_DESCRIPTIONS[metric.source]}
                        />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="w-[1%] whitespace-nowrap text-right text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelData.map((row) => (
                  <ChannelRowComponent
                    key={row.id}
                    row={row}
                    showCompare={compareEnabled}
                    visibleMetrics={visibleMetrics}
                    onViewMetrics={handleViewMetrics}
                  />
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      ) : (
        <div className="p-8">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No ad channels connected</EmptyTitle>
              <EmptyDescription>
                Connect Meta, Google, or another paid media platform from Integrations to see live channel performance here.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild>
              <Link href="/integrations">Add channel</Link>
            </Button>
          </Empty>
        </div>
      )}

      <ChannelMetricsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        row={drawerRow}
        level={drawerLevel}
      />
    </div>
  )
}
