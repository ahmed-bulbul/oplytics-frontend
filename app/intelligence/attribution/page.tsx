"use client"

import { useState } from "react"
import { AlertTriangle, GitCompareArrows, ShieldCheck, Sparkles } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import {
  attributionRows,
  AttributionRow,
} from "@/components/intelligence/attribution/attribution-data"
import { AttributionDetailDrawer } from "@/components/intelligence/attribution/attribution-detail-drawer"
import { BenchmarkCallout } from "@/components/intelligence/benchmark-callout"

function formatCurrency(n: number) {
  if (n === 0) return "—"
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function AttributionInner() {
  const [selected, setSelected] = useState<AttributionRow | null>(null)
  const [open, setOpen] = useState(false)

  const handleView = (row: AttributionRow) => {
    setSelected(row)
    setOpen(true)
  }

  const totalBlended = attributionRows.reduce((sum, r) => sum + r.blendedTruth, 0)
  const totalPlatform = attributionRows.reduce((sum, r) => sum + r.platformReported, 0)
  const overstatement = totalPlatform - totalBlended

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Attribution"
        subtitle="Compare each channel's revenue across measurement sources to find the truth behind the numbers."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <IntelligenceSummaryCard
          label="Shopify Blended Revenue"
          value={formatCurrency(totalBlended)}
          caption="Shopify Blended measurement source"
          icon={ShieldCheck}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Platform Overstatement"
          value={`+${formatCurrency(overstatement)}`}
          caption="Sum of ad platform self-reports vs. blend"
          icon={AlertTriangle}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Highest-Confidence Channel"
          value="Meta Ads"
          caption="Click + survey signals align"
          icon={Sparkles}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Largest Discrepancy"
          value="Google PMax"
          caption="Platform reports 2.3× the blended value"
          icon={GitCompareArrows}
          tone="warning"
        />
      </div>

      {/* Benchmark callouts */}
      <div className="grid gap-3 md:grid-cols-2">
        <BenchmarkCallout
          metricLabel="MER"
          value="3.7x"
          comparison="In line with $1M–$5M Shopify category benchmark of 3.5–3.9x."
          tone="in-line"
        />
        <BenchmarkCallout
          metricLabel="CAC"
          value="$31.10"
          comparison="8% better than similar stores with $75–$100 AOV ($33.80 median)."
          tone="better"
        />
      </div>

      {/* Attribution Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Channel attribution</h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Meta · Google · GA4 · Shopify · Survey
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {attributionRows.length} channels
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[160px] text-muted-foreground">Channel</TableHead>
                <TableHead className="text-right text-muted-foreground">Spend</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Platform reported
                </TableHead>
                <TableHead className="text-right text-muted-foreground">GA4</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Shopify first-click
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Shopify last-click
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Survey
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Shopify Blended
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Blended ROAS
                </TableHead>
                <TableHead className="text-muted-foreground">Confidence</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributionRows.map((r) => (
                <TableRow
                  key={r.id}
                  className="border-border hover:bg-muted/40 cursor-pointer"
                  onClick={() => handleView(r)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{r.channel}</span>
                      {r.flag && (
                        <span title="Risk flag">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(r.spend)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(r.platformReported)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(r.ga4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(r.shopifyFirstClick)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(r.shopifyLastClick)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(r.postPurchaseSurvey)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    {formatCurrency(r.blendedTruth)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.blendedRoas ? `${r.blendedRoas.toFixed(2)}x` : "—"}
                  </TableCell>
                  <TableCell>
                    <IntelligenceStatusPill status={r.confidence} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => handleView(r)}
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AttributionDetailDrawer row={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default function AttributionPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <AttributionInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
