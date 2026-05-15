"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronRight, ChevronDown, BarChart3, Loader2 } from "lucide-react"
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
import { dashboardApi, formatCompactMoney, formatMoney, type TopProduct } from "@/lib/api/analytics"
import {
  PRODUCT_PERFORMANCE_METRICS_BY_ID,
  DEFAULT_VISIBLE_PRODUCT_METRIC_IDS,
  PRODUCT_PERFORMANCE_COLUMNS_STORAGE_KEY,
  PRODUCT_SOURCE_DESCRIPTIONS,
  type ProductRow,
  type ProductPerformanceMetric,
  type ProductStatus,
  type StockoutRisk,
} from "./product-performance-metrics"
import { ProductPerformanceColumnPicker } from "./product-performance-column-picker"
import { ProductMetricsDrawer } from "./product-metrics-drawer"
import { MetricCalculationPopover } from "./metric-calculation-popover"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(v: number, currency = "USD"): string {
  return Math.abs(v) >= 1_000 ? formatCompactMoney(v, currency) : formatMoney(v, currency)
}

function fmtNumber(v: number): string {
  return v.toLocaleString()
}

/** Map a flat TopProduct from the API into the ProductRow shape the table expects. */
function apiProductToRow(p: TopProduct, currency: string): ProductRow {
  return {
    id: p.product_id,
    name: p.title,
    sku: p.vendor ?? undefined,
    revenue: fmtMoney(Number(p.revenue), currency),
    unitsSold: fmtNumber(p.units_sold),
    orders: fmtNumber(p.orders_count),
    aov: fmtMoney(Number(p.avg_price), currency),
    cr: "—",           // not available from this endpoint
  }
}

/* ------------------------------------------------------------------------ */
/* Demo data                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Three-level hierarchy: Category → Product → Variant. Mirrors how
 * Shopify exposes product data and matches the channel table's
 * Channel → Campaign → Ad Set depth so the two read identically.
 */
const productData: ProductRow[] = [
  {
    id: "apparel",
    name: "Apparel",
    category: "Apparel",
    status: "Healthy",
    revenue: "$84,200",
    revenueChange: "+14.2%",
    grossSales: "$92,800",
    netSales: "$84,200",
    unitsSold: "1,124",
    unitsSoldChange: "+12.8%",
    orders: "920",
    ordersChange: "+11.5%",
    aov: "$91.52",
    cogs: "$30,310",
    grossProfit: "$53,890",
    grossMargin: "64.0%",
    grossMarginChange: "+1.2%",
    contributionMargin: "$45,840",
    cmPercent: "54.4%",
    sessions: "32,100",
    productViews: "48,200",
    atcs: "3,640",
    atcRate: "11.3%",
    checkoutRate: "31.6%",
    cr: "2.86%",
    crChange: "+0.12%",
    inventoryOnHand: "4,820",
    sellThroughRate: "18.9%",
    sellThroughRateChange: "+2.1%",
    inventoryTurnover: "6.4x",
    daysOfInventory: "57",
    stockoutRisk: "Healthy",
    reorderStatus: "On schedule",
    customers: "812",
    newCustomerShare: "61.2%",
    returningCustomerShare: "38.8%",
    repeatPurchaseRate: "22.4%",
    daysToRepeat: "42",
    discountRate: "9.3%",
    discountDollars: "$8,640",
    promoOrderShare: "31.0%",
    refunds: "$2,940",
    refundRate: "3.5%",
    returnRate: "4.1%",
    avgRating: "4.6",
    reviewCount: "318",
    children: [
      {
        id: "apparel-tee",
        name: "Premium Cotton Tee",
        sku: "APP-TEE-PREM",
        category: "Apparel",
        status: "Healthy",
        revenue: "$24,100",
        revenueChange: "+18.6%",
        grossSales: "$26,200",
        netSales: "$24,100",
        unitsSold: "482",
        unitsSoldChange: "+16.4%",
        orders: "420",
        ordersChange: "+15.3%",
        aov: "$57.38",
        cogs: "$8,200",
        grossProfit: "$15,900",
        grossMargin: "66.0%",
        grossMarginChange: "+1.8%",
        contributionMargin: "$13,420",
        cmPercent: "55.7%",
        sessions: "8,200",
        productViews: "12,400",
        atcs: "1,180",
        atcRate: "14.4%",
        checkoutRate: "35.6%",
        cr: "5.12%",
        crChange: "+0.24%",
        inventoryOnHand: "1,240",
        sellThroughRate: "28.0%",
        sellThroughRateChange: "+3.4%",
        inventoryTurnover: "8.2x",
        daysOfInventory: "44",
        stockoutRisk: "Healthy",
        reorderStatus: "On schedule",
        customers: "381",
        newCustomerShare: "58.4%",
        returningCustomerShare: "41.6%",
        repeatPurchaseRate: "26.1%",
        daysToRepeat: "38",
        discountRate: "8.0%",
        discountDollars: "$2,100",
        promoOrderShare: "28.0%",
        refunds: "$680",
        refundRate: "2.8%",
        returnRate: "3.2%",
        avgRating: "4.7",
        reviewCount: "182",
        children: [
          {
            id: "apparel-tee-white-m",
            name: "White / Medium",
            sku: "APP-TEE-PREM-WHT-M",
            status: "Healthy",
            revenue: "$8,400",
            revenueChange: "+22.1%",
            grossSales: "$9,120",
            unitsSold: "168",
            unitsSoldChange: "+19.6%",
            orders: "162",
            aov: "$51.85",
            cogs: "$2,860",
            grossProfit: "$5,540",
            grossMargin: "66.0%",
            contributionMargin: "$4,720",
            cmPercent: "56.2%",
            sessions: "2,840",
            productViews: "4,180",
            atcs: "412",
            atcRate: "14.5%",
            checkoutRate: "37.4%",
            cr: "5.70%",
            inventoryOnHand: "320",
            sellThroughRate: "34.4%",
            inventoryTurnover: "9.6x",
            daysOfInventory: "38",
            stockoutRisk: "Low",
            reorderStatus: "PO #4821 — arrives in 12 days",
            customers: "148",
            newCustomerShare: "56.0%",
            returningCustomerShare: "44.0%",
            repeatPurchaseRate: "29.0%",
            daysToRepeat: "36",
            discountRate: "7.5%",
            discountDollars: "$680",
            promoOrderShare: "26.0%",
            refunds: "$220",
            refundRate: "2.6%",
            returnRate: "2.9%",
            avgRating: "4.8",
            reviewCount: "82",
          },
          {
            id: "apparel-tee-black-l",
            name: "Black / Large",
            sku: "APP-TEE-PREM-BLK-L",
            status: "Stockout Risk",
            revenue: "$6,200",
            revenueChange: "+8.4%",
            grossSales: "$6,720",
            unitsSold: "124",
            unitsSoldChange: "+5.1%",
            orders: "118",
            aov: "$52.54",
            cogs: "$2,110",
            grossProfit: "$4,090",
            grossMargin: "66.0%",
            contributionMargin: "$3,470",
            cmPercent: "56.0%",
            sessions: "1,940",
            productViews: "2,810",
            atcs: "298",
            atcRate: "15.4%",
            checkoutRate: "39.6%",
            cr: "6.08%",
            inventoryOnHand: "82",
            sellThroughRate: "60.2%",
            sellThroughRateChange: "+12.4%",
            inventoryTurnover: "12.4x",
            daysOfInventory: "9",
            stockoutRisk: "Critical",
            reorderStatus: "PO not yet placed",
            customers: "108",
            newCustomerShare: "54.2%",
            returningCustomerShare: "45.8%",
            repeatPurchaseRate: "32.4%",
            daysToRepeat: "34",
            discountRate: "6.2%",
            discountDollars: "$420",
            promoOrderShare: "22.0%",
            refunds: "$140",
            refundRate: "2.3%",
            returnRate: "2.6%",
            avgRating: "4.6",
            reviewCount: "54",
          },
        ],
      },
      {
        id: "apparel-hoodie",
        name: "Heavyweight Fleece Hoodie",
        sku: "APP-HOOD-FLE",
        category: "Apparel",
        status: "Healthy",
        revenue: "$18,900",
        revenueChange: "+11.2%",
        grossSales: "$20,800",
        unitsSold: "242",
        unitsSoldChange: "+9.8%",
        orders: "228",
        aov: "$82.89",
        cogs: "$7,560",
        grossProfit: "$11,340",
        grossMargin: "60.0%",
        grossMarginChange: "+0.4%",
        contributionMargin: "$9,640",
        cmPercent: "51.0%",
        sessions: "5,820",
        productViews: "8,640",
        atcs: "742",
        atcRate: "12.7%",
        checkoutRate: "33.0%",
        cr: "3.92%",
        crChange: "+0.08%",
        inventoryOnHand: "1,180",
        sellThroughRate: "17.0%",
        sellThroughRateChange: "+1.4%",
        inventoryTurnover: "5.2x",
        daysOfInventory: "82",
        stockoutRisk: "Healthy",
        reorderStatus: "On schedule",
        customers: "212",
        newCustomerShare: "63.4%",
        returningCustomerShare: "36.6%",
        repeatPurchaseRate: "18.2%",
        daysToRepeat: "48",
        discountRate: "10.4%",
        discountDollars: "$1,940",
        promoOrderShare: "33.0%",
        refunds: "$680",
        refundRate: "3.6%",
        returnRate: "4.4%",
        avgRating: "4.5",
        reviewCount: "94",
      },
    ],
  },
  {
    id: "footwear",
    name: "Footwear",
    category: "Footwear",
    status: "At Risk",
    revenue: "$32,100",
    revenueChange: "+9.8%",
    grossSales: "$36,400",
    netSales: "$32,100",
    unitsSold: "246",
    unitsSoldChange: "+5.4%",
    orders: "210",
    ordersChange: "+7.2%",
    aov: "$152.86",
    cogs: "$14,420",
    grossProfit: "$17,680",
    grossMargin: "55.1%",
    grossMarginChange: "-1.8%",
    contributionMargin: "$13,840",
    cmPercent: "43.1%",
    sessions: "12,400",
    productViews: "18,200",
    atcs: "984",
    atcRate: "7.9%",
    checkoutRate: "30.4%",
    cr: "1.69%",
    crChange: "+0.03%",
    inventoryOnHand: "1,840",
    sellThroughRate: "11.8%",
    sellThroughRateChange: "-1.2%",
    inventoryTurnover: "3.8x",
    daysOfInventory: "94",
    stockoutRisk: "Healthy",
    reorderStatus: "On schedule",
    customers: "198",
    newCustomerShare: "68.8%",
    returningCustomerShare: "31.2%",
    repeatPurchaseRate: "12.4%",
    daysToRepeat: "61",
    discountRate: "11.8%",
    discountDollars: "$4,290",
    promoOrderShare: "38.0%",
    refunds: "$2,180",
    refundRate: "6.8%",
    returnRate: "8.4%",
    avgRating: "4.2",
    reviewCount: "146",
    children: [
      {
        id: "footwear-runner",
        name: "Trail Runner",
        sku: "FTW-RUN-TRL",
        category: "Footwear",
        status: "At Risk",
        revenue: "$21,400",
        revenueChange: "+6.8%",
        unitsSold: "162",
        ordersChange: "+5.1%",
        unitsSoldChange: "+3.4%",
        orders: "148",
        aov: "$144.59",
        cogs: "$9,810",
        grossProfit: "$11,590",
        grossMargin: "54.2%",
        grossMarginChange: "-2.4%",
        contributionMargin: "$8,940",
        cmPercent: "41.8%",
        sessions: "8,140",
        productViews: "11,820",
        atcs: "612",
        atcRate: "7.5%",
        checkoutRate: "28.4%",
        cr: "1.82%",
        crChange: "-0.04%",
        inventoryOnHand: "1,120",
        sellThroughRate: "12.6%",
        sellThroughRateChange: "-1.8%",
        inventoryTurnover: "3.6x",
        daysOfInventory: "98",
        stockoutRisk: "Healthy",
        reorderStatus: "On schedule",
        customers: "138",
        newCustomerShare: "71.2%",
        returningCustomerShare: "28.8%",
        repeatPurchaseRate: "10.4%",
        daysToRepeat: "64",
        discountRate: "12.4%",
        discountDollars: "$2,840",
        promoOrderShare: "41.0%",
        refunds: "$1,620",
        refundRate: "7.6%",
        returnRate: "9.2%",
        avgRating: "4.1",
        reviewCount: "82",
      },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    category: "Accessories",
    status: "Healthy",
    revenue: "$18,400",
    revenueChange: "+22.4%",
    grossSales: "$19,800",
    netSales: "$18,400",
    unitsSold: "612",
    unitsSoldChange: "+24.1%",
    orders: "498",
    ordersChange: "+19.8%",
    aov: "$36.95",
    cogs: "$5,220",
    grossProfit: "$13,180",
    grossMargin: "71.6%",
    grossMarginChange: "+2.4%",
    contributionMargin: "$11,420",
    cmPercent: "62.1%",
    sessions: "9,800",
    productViews: "14,200",
    atcs: "1,420",
    atcRate: "14.5%",
    checkoutRate: "38.8%",
    cr: "5.08%",
    crChange: "+0.42%",
    inventoryOnHand: "2,640",
    sellThroughRate: "18.8%",
    sellThroughRateChange: "+3.6%",
    inventoryTurnover: "7.2x",
    daysOfInventory: "51",
    stockoutRisk: "Healthy",
    reorderStatus: "On schedule",
    customers: "452",
    newCustomerShare: "44.2%",
    returningCustomerShare: "55.8%",
    repeatPurchaseRate: "31.4%",
    daysToRepeat: "29",
    discountRate: "6.4%",
    discountDollars: "$1,180",
    promoOrderShare: "21.0%",
    refunds: "$420",
    refundRate: "2.3%",
    returnRate: "2.6%",
    avgRating: "4.7",
    reviewCount: "218",
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

const STATUS_TONE: Record<ProductStatus, string> = {
  Healthy:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "At Risk":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Stockout Risk":
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Underperforming:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

const STOCKOUT_TONE: Record<StockoutRisk, string> = {
  Healthy:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Low: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Critical:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Stockout:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

function StatusPill({ status }: { status?: ProductStatus }) {
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

function StockoutPill({ risk }: { risk?: StockoutRisk }) {
  if (!risk) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STOCKOUT_TONE[risk],
      )}
    >
      {risk}
    </span>
  )
}

/**
 * Renders a single dynamic metric cell. Status / stockout-risk metrics
 * render colored pills; everything else renders the formatted string
 * with optional compare-mode change pill.
 */
function MetricCell({
  row,
  metric,
  showCompare,
}: {
  row: ProductRow
  metric: ProductPerformanceMetric
  showCompare: boolean
}) {
  if (metric.kind === "status") {
    return (
      <TableCell className="text-left">
        <StatusPill status={row.status} />
      </TableCell>
    )
  }

  if (metric.kind === "stockoutRisk") {
    return (
      <TableCell className="text-left">
        <StockoutPill risk={row.stockoutRisk} />
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
 * Maps a row's depth in the hierarchy to a human-readable level label.
 * Used in the diagnostic drawer header.
 */
function levelLabelForDepth(depth: number): string {
  if (depth === 0) return "Category"
  if (depth === 1) return "Product"
  return "Variant"
}

function ProductRowComponent({
  row,
  depth = 0,
  showCompare,
  visibleMetrics,
  onViewMetrics,
}: {
  row: ProductRow
  depth?: number
  showCompare: boolean
  visibleMetrics: ProductPerformanceMetric[]
  onViewMetrics: (row: ProductRow, level: string) => void
}) {
  // Categories (depth 0) start expanded so the hierarchy is discoverable
  // on first render — same behavior as the channel performance table.
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <TableRow className="border-border hover:bg-muted/50">
        {/* Name + caret. Caret remains the row's only expand interaction. */}
        <TableCell
          className={cn("font-medium", hasChildren ? "cursor-pointer" : "")}
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
            <div className="min-w-0">
              <div
                className={cn(
                  "truncate",
                  depth > 0 && "text-muted-foreground",
                )}
              >
                {row.name}
              </div>
              {row.sku && (
                <div className="truncate text-[10px] text-muted-foreground">
                  {row.sku}
                </div>
              )}
            </div>
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
          <ProductRowComponent
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

export function ProductPerformance() {
  const { from, to, compareEnabled, compareLabel } = useDateRange()
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null

  /* ----- Live data fetch ------------------------------------------------ */
  const [liveRows, setLiveRows] = useState<ProductRow[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    try {
      const data = await dashboardApi.getTopProducts(orgId, from, to, 50)
      setLiveRows(data.products.map((product) => apiProductToRow(product, data.meta.currency)))
    } catch {
      // fail silently — fall back to demo data
      setLiveRows(null)
    } finally {
      setIsLoading(false)
    }
  }, [orgId, from, to])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const activeRows: ProductRow[] = liveRows ?? []

  /* ----- Column visibility (persisted to localStorage) ------------------ */
  const [visibleMetricIds, setVisibleMetricIds] = useState<string[]>(
    DEFAULT_VISIBLE_PRODUCT_METRIC_IDS,
  )

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        PRODUCT_PERFORMANCE_COLUMNS_STORAGE_KEY,
      )
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (id) =>
            typeof id === "string" && id in PRODUCT_PERFORMANCE_METRICS_BY_ID,
        )
      ) {
        setVisibleMetricIds(
          parsed.length > 0 ? parsed : DEFAULT_VISIBLE_PRODUCT_METRIC_IDS,
        )
      }
    } catch {
      // Corrupt or missing — fall back to defaults silently.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PRODUCT_PERFORMANCE_COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleMetricIds),
      )
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [visibleMetricIds])

  // Resolve ids → metric objects in canonical order.
  const visibleMetrics = visibleMetricIds
    .map((id) => PRODUCT_PERFORMANCE_METRICS_BY_ID[id])
    .filter((m): m is ProductPerformanceMetric => Boolean(m))

  /* ----- Diagnostic drawer state --------------------------------------- */
  const [drawerRow, setDrawerRow] = useState<ProductRow | null>(null)
  const [drawerLevel, setDrawerLevel] = useState<string>("Category")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleViewMetrics = (row: ProductRow, level: string) => {
    setDrawerRow(row)
    setDrawerLevel(level)
    setDrawerOpen(true)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Product Performance
              </h3>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                Source: Shopify
              </span>
              {liveRows !== null && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
                  Live
                </span>
              )}
              {liveRows === null && !isLoading && (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-600">
                  Demo
                </span>
              )}
              {isLoading && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              {compareEnabled && compareLabel && (
                <span className="text-[10px] text-muted-foreground">
                  vs {compareLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveRows !== null
                ? `Top ${liveRows.length} products by revenue · sorted by gross revenue`
                : "No live product-performance data is available for the selected Shopify date range yet."}
            </p>
          </div>
          <div className="shrink-0">
            <ProductPerformanceColumnPicker
              visibleMetricIds={visibleMetricIds}
              onChange={setVisibleMetricIds}
            />
          </div>
        </div>
      </div>

      {activeRows.length > 0 ? (
        <div className="overflow-x-auto">
          <TooltipProvider delayDuration={250}>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Product
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
                          sourceDescription={
                            PRODUCT_SOURCE_DESCRIPTIONS[metric.source]
                          }
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
                {activeRows.map((row) => (
                  <ProductRowComponent
                    key={row.id}
                    row={row}
                    showCompare={false}
                    visibleMetrics={visibleMetrics}
                    onViewMetrics={handleViewMetrics}
                  />
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      ) : (
        <div className="p-6">
          <Empty className="border border-dashed border-border/70 bg-muted/20">
            <EmptyHeader>
              <EmptyTitle>No product data yet</EmptyTitle>
              <EmptyDescription>
                Shopify is connected, but no live product-performance rows were returned for this date range.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      <ProductMetricsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        row={drawerRow}
        level={drawerLevel}
      />
    </div>
  )
}
