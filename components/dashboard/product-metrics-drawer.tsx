"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  PRODUCT_PERFORMANCE_METRICS,
  PRODUCT_SOURCE_DESCRIPTIONS,
  type ProductMetricGroup,
  type ProductMetricSource,
  type ProductRow,
} from "./product-performance-metrics"
import { MetricCalculationPopover } from "./metric-calculation-popover"

/**
 * Diagnostic drawer for a single product / variant row.
 *
 * Important: the row caret keeps its dedicated job of expanding the
 * hierarchy. This drawer is opened by an explicit "View metrics" icon
 * button at the end of each row, so the two interactions never compete.
 */

interface ProductMetricsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: ProductRow | null
  /** Hierarchy label — "Category", "Product", "Variant", etc. */
  level?: string
}

/**
 * Order in which metric groups appear in the drawer. Reads as a
 * diagnostic sentence: How much did it sell? Was it profitable? Did
 * traffic convert? Will we run out? Who's buying? Was it on promo? Are
 * customers happy?
 */
const DRAWER_GROUP_ORDER: ProductMetricGroup[] = [
  "Sales",
  "Profitability",
  "Funnel",
  "Inventory",
  "Customers",
  "Discounts",
  "Returns",
]

const SOURCE_TONE: Record<ProductMetricSource, string> = {
  "Shopify Sales":
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Shopify Profit":
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "Shopify Behavior":
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "Shopify Inventory":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Shopify Customers":
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "Shopify Discounts":
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "Shopify Returns":
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Reviews:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  Computed:
    "border-border bg-muted text-muted-foreground",
}

function SourceTag({ source }: { source: ProductMetricSource }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_TONE[source]}`}
    >
      {source}
    </span>
  )
}

export function ProductMetricsDrawer({
  open,
  onOpenChange,
  row,
  level,
}: ProductMetricsDrawerProps) {
  if (!row) return null

  // Group metrics for the drawer. Status / verdict-style metrics are
  // intentionally excluded — those are table-only summaries, not values
  // that benefit from the diagnostic detail layout.
  const grouped = DRAWER_GROUP_ORDER.map((group) => ({
    group,
    metrics: PRODUCT_PERFORMANCE_METRICS.filter(
      (m) => m.group === group && m.kind !== "status" && m.kind !== "stockoutRisk",
    )
      .map((m) => ({ metric: m, value: m.accessor(row) }))
      .filter(
        (m) => m.value != null && m.value !== "" && m.value !== "—",
      ),
  })).filter((g) => g.metrics.length > 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md md:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="text-base">{row.name}</SheetTitle>
          <SheetDescription>
            {level ? `${level}` : ""}
            {row.sku ? ` · SKU ${row.sku}` : ""}
            {" · "}Diagnostic metrics. Click the info icon next to any
            metric to see how it&apos;s calculated.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-1 pb-6">
          {grouped.map(({ group, metrics }) => (
            <section key={group}>
              <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h3>
              <div className="divide-y divide-border rounded-lg border border-border">
                {metrics.map(({ metric, value }) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {metric.label}
                        </span>
                        <MetricCalculationPopover
                          label={metric.label}
                          description={metric.description}
                          formula={metric.formula}
                          source={metric.source}
                          sourceDescription={
                            PRODUCT_SOURCE_DESCRIPTIONS[metric.source]
                          }
                          className="text-muted-foreground/70"
                        />
                      </div>
                      <div className="mt-1">
                        <SourceTag source={metric.source} />
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold tabular-nums">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
