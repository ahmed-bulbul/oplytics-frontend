"use client"

import { useMemo, useState } from "react"
import {
  Award,
  TrendingDown,
  Users2,
  Sparkles,
  Timer,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { MeasurementSourceSelector } from "@/components/dashboard/measurement-source-selector"
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import {
  cohortRows,
  CohortRow,
} from "@/components/intelligence/cohorts/cohorts-data"
import { CohortDetailDrawer } from "@/components/intelligence/cohorts/cohort-detail-drawer"
import { SubscriptionView } from "@/components/intelligence/cohorts/subscription-view"
import { ChannelLogoGroup } from "@/components/intelligence/cohorts/channel-logo"
import { BenchmarkCallout } from "@/components/intelligence/benchmark-callout"

const channelOptions = [
  "All channels",
  "Meta Ads",
  "Google Search",
  "Google PMax",
  "TikTok Ads",
  "Klaviyo Email",
] as const

const ltvWindows = [
  { id: "30d", label: "30-Day LTV", key: "ltv30" as const },
  { id: "60d", label: "60-Day LTV", key: "ltv60" as const },
  { id: "90d", label: "90-Day LTV", key: "ltv90" as const },
  { id: "180d", label: "180-Day LTV", key: "ltv180" as const },
  { id: "365d", label: "365-Day LTV", key: "ltv365" as const },
] as const

function MiniCurve({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-6 w-20">
      <polyline
        points={points}
        fill="none"
        stroke="oklch(0.7 0.15 150)"
        strokeWidth="2"
      />
    </svg>
  )
}

function CohortsInner() {
  const [channelFilter, setChannelFilter] = useState<string>("All channels")
  const [ltvWindow, setLtvWindow] = useState<string>("90d")
  const [selected, setSelected] = useState<CohortRow | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return cohortRows.filter(
      (c) =>
        channelFilter === "All channels" ||
        c.channelMix.some((m) => m.channel === channelFilter),
    )
  }, [channelFilter])

  const ltvKey = ltvWindows.find((w) => w.id === ltvWindow)?.key ?? "ltv90"

  const handleView = (row: CohortRow) => {
    setSelected(row)
    setOpen(true)
  }

  // Best cohort for selected window
  const bestCohort = filtered.reduce(
    (best, c) => (c[ltvKey] > (best?.[ltvKey] ?? 0) ? c : best),
    filtered[0],
  )

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Cohorts & LTV"
        subtitle="Track customer cohorts over time to understand retention, repeat purchase, and lifetime value."
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All cohorts</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 md:space-y-6">

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Acquisition channel" />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ltvWindow} onValueChange={setLtvWindow}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="LTV window" />
          </SelectTrigger>
          <SelectContent>
            {ltvWindows.map((w) => (
              <SelectItem key={w.id} value={w.id} className="text-xs">
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <MeasurementSourceSelector />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <IntelligenceSummaryCard
          label="Best Cohort by LTV"
          value={bestCohort?.name ?? "—"}
          caption={`90-Day LTV: $${bestCohort?.ltv90.toFixed(0) ?? "—"}`}
          icon={Award}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Highest 90-Day LTV"
          value="Nov 2025"
          caption="$124 (Klaviyo Email)"
          icon={Sparkles}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Slowest Payback"
          metricKey="Payback"
          value="Recent PMax cohort"
          caption="78 days · Google PMax"
          icon={Timer}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Highest Churn"
          metricKey="Churn Rate"
          value="Sep 2025"
          caption="Sharp drop after month 3"
          icon={TrendingDown}
          tone="negative"
        />
        <IntelligenceSummaryCard
          label="Total New Customers"
          value={cohortRows
            .reduce((s, c) => s + c.newCustomers, 0)
            .toLocaleString()}
          caption="Last 7 cohorts"
          icon={Users2}
        />
      </div>

      {/* Cohort Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Cohorts</h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Shopify orders + customer table
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} cohort{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[120px] text-muted-foreground">Cohort</TableHead>
                <TableHead className="text-muted-foreground">Acq. Channel</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  New customers
                </TableHead>
                <TableHead className="text-right text-muted-foreground">CAC</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  {ltvWindows.find((w) => w.id === ltvWindow)?.label}
                </TableHead>
                <TableHead className="text-right text-muted-foreground">Repeat %</TableHead>
                <TableHead className="text-right text-muted-foreground">Payback</TableHead>
                <TableHead className="text-right text-muted-foreground">CM / Customer</TableHead>
                <TableHead className="text-muted-foreground">Retention</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="border-border hover:bg-muted/40 cursor-pointer"
                  onClick={() => handleView(c)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <ChannelLogoGroup mix={c.channelMix} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {c.newCustomers.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${c.cac.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    ${c[ltvKey].toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {c.repeatPurchaseRate}%
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${
                      c.paybackDays > 60 ? "text-amber-600" : "text-foreground"
                    }`}
                  >
                    {c.paybackDays}d
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${c.contributionMarginPerCustomer.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <MiniCurve data={c.retention} />
                  </TableCell>
                  <TableCell>
                    <IntelligenceStatusPill status={c.status} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => handleView(c)}
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

      <CohortDetailDrawer cohort={selected} open={open} onOpenChange={setOpen} />

      <BenchmarkCallout
        metricLabel="Repeat purchase rate"
        value="28%"
        comparison="In line with category benchmark of 26–30% for Apparel + Footwear catalogs."
        tone="in-line"
      />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CohortsPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <CohortsInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
