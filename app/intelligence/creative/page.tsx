"use client"

import { useMemo, useState } from "react"
import { Award, Flame, AlertTriangle, Quote, Sparkles, TrendingUp } from "lucide-react"
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
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import {
  creativeRows,
  creativeCounts,
  fatiguedSpendTotal,
  CreativeRow,
} from "@/components/intelligence/creative/creative-data"
import { CreativeDetailDrawer } from "@/components/intelligence/creative/creative-detail-drawer"
import { CreativeThumbnail } from "@/components/intelligence/creative/creative-thumbnail"
import { BenchmarkCallout } from "@/components/intelligence/benchmark-callout"

const formatOptions = [
  "All formats",
  "Static",
  "UGC video",
  "Founder video",
  "Testimonial",
  "Carousel",
  "Product demo",
  "Offer ad",
] as const

const angleOptions = [
  "All angles",
  "Testimonial",
  "Founder story",
  "Product demo",
  "Problem / solution",
  "Offer / sale",
  "Comparison",
  "Education",
] as const

const statusOptions = [
  "All statuses",
  "Scaling",
  "Healthy",
  "Fatiguing",
  "Needs Review",
  "Underperforming",
] as const

function CreativePerformanceInner() {
  const [formatFilter, setFormatFilter] = useState<string>("All formats")
  const [angleFilter, setAngleFilter] = useState<string>("All angles")
  const [statusFilter, setStatusFilter] = useState<string>("All statuses")
  const [selected, setSelected] = useState<CreativeRow | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return creativeRows.filter((c) => {
      const matchesFormat = formatFilter === "All formats" || c.format === formatFilter
      const matchesAngle = angleFilter === "All angles" || c.angle === angleFilter
      const matchesStatus = statusFilter === "All statuses" || c.status === statusFilter
      return matchesFormat && matchesAngle && matchesStatus
    })
  }, [formatFilter, angleFilter, statusFilter])

  const handleView = (row: CreativeRow) => {
    setSelected(row)
    setOpen(true)
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Creative Performance"
        subtitle="Understand which ads, hooks, formats, and angles are driving profitable growth."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            {formatOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={angleFilter} onValueChange={setAngleFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Angle" />
          </SelectTrigger>
          <SelectContent>
            {angleOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <MeasurementSourceSelector />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <IntelligenceSummaryCard
          label="Top by Contribution Margin"
          value="Founder Demo Video"
          caption="+$8,420 contribution margin"
          icon={Award}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Best New Customer Creative"
          value="UGC Testimonial Mashup"
          caption="CAC: $28.40"
          icon={Sparkles}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Creative Fatigue"
          value={`${creativeCounts.needsReview} need review`}
          caption="Frequency or CTR signals are declining"
          icon={Flame}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Highest ROAS"
          metricKey="ROAS"
          value="Summer Sale Static"
          caption="ROAS: 4.2x"
          icon={TrendingUp}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Best Hook"
          metricKey="Hook Rate"
          value="Still relying on ROAS alone?"
          caption="Thumbstop rate: 37%"
          icon={Quote}
        />
        <IntelligenceSummaryCard
          label="Spend Under Review"
          value={`$${fatiguedSpendTotal.toLocaleString()}`}
          caption="Tied to fatiguing or low-confidence creatives"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      {/* Benchmark callouts */}
      <div className="grid gap-3 md:grid-cols-2">
        <BenchmarkCallout
          metricLabel="Meta CPM"
          value="$22.40"
          comparison="6% below similar spend-level Shopify accounts ($23.80 median)."
          tone="better"
        />
        <BenchmarkCallout
          metricLabel="Thumbstop rate"
          value="28%"
          comparison="In line with category benchmark of 25–30% for UGC-heavy catalogs."
          tone="in-line"
        />
      </div>

      {/* Creative Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Creatives</h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Connected ad platforms
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} creative{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[260px] text-muted-foreground">Creative</TableHead>
                <TableHead className="text-muted-foreground">Format</TableHead>
                <TableHead className="text-muted-foreground">Angle</TableHead>
                <TableHead className="text-muted-foreground">Channel</TableHead>
                <TableHead className="text-right text-muted-foreground">Spend</TableHead>
                <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
                <TableHead className="text-right text-muted-foreground">ROAS</TableHead>
                <TableHead className="text-right text-muted-foreground">CPA</TableHead>
                <TableHead className="text-right text-muted-foreground">CAC</TableHead>
                <TableHead className="text-right text-muted-foreground">Contribution Margin</TableHead>
                <TableHead className="text-right text-muted-foreground">CTR</TableHead>
                <TableHead className="text-right text-muted-foreground">Thumbstop</TableHead>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <CreativeThumbnail
                        src={c.thumbnailUrl}
                        alt={c.name}
                        format={c.format}
                      />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.format}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.angle}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.channel}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${c.spend.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${c.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.roas.toFixed(2)}x</TableCell>
                  <TableCell className="text-right font-mono text-xs">${c.cpa.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">${c.cac.toFixed(2)}</TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${
                      c.contributionMargin < 0 ? "text-rose-600" : "text-foreground"
                    }`}
                  >
                    ${c.contributionMargin.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.ctr.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.thumbstop}%</TableCell>
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

      <CreativeDetailDrawer
        creative={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}

export default function CreativePerformancePage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <CreativePerformanceInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
