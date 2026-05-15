"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, BellRing, ClipboardCheck, Sparkles, ChevronRight } from "lucide-react"
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
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { PlanningStatusPill } from "@/components/planning/planning-status-pill"
import { alerts, briefs, type AlertRow } from "@/components/planning/alerts/alerts-data"
import { cn } from "@/lib/utils"

const priorityOptions = ["All priorities", "High", "Medium", "Low"] as const
const categoryOptions = [
  "All categories",
  "Paid Media",
  "Creative",
  "Attribution",
  "Product",
  "Cohort",
  "Inventory",
  "Subscription",
  "Profitability",
] as const
const statusOptions = ["All statuses", "Open", "Reviewing", "Waiting", "Resolved", "Ignored"] as const

function PriorityPill({ priority }: { priority: AlertRow["priority"] }) {
  const styles =
    priority === "High"
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
      : priority === "Medium"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-500"
        : "bg-slate-500/10 text-slate-700 dark:text-slate-400"
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium", styles)}>
      {priority}
    </span>
  )
}

function AlertsPageInner() {
  const [priority, setPriority] = useState<string>("All priorities")
  const [category, setCategory] = useState<string>("All categories")
  const [status, setStatus] = useState<string>("All statuses")

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesPriority = priority === "All priorities" || a.priority === priority
      const matchesCategory = category === "All categories" || a.category === category
      const matchesStatus = status === "All statuses" || a.status === status
      return matchesPriority && matchesCategory && matchesStatus
    })
  }, [priority, category, status])

  const counts = useMemo(() => {
    return {
      total: alerts.length,
      high: alerts.filter((a) => a.priority === "High" && a.status !== "Resolved" && a.status !== "Ignored").length,
      reviewing: alerts.filter((a) => a.status === "Reviewing").length,
      open: alerts.filter((a) => a.status === "Open").length,
    }
  }, [])

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Alerts & Briefs"
        subtitle="Monitor risks across paid media, creative, attribution, products, cohorts, inventory, and subscriptions, and review periodic briefs for your team."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <IntelligenceSummaryCard
          label="Active alerts"
          value={String(counts.open + counts.reviewing)}
          caption="Open or under review"
          icon={BellRing}
        />
        <IntelligenceSummaryCard
          label="High priority"
          value={String(counts.high)}
          caption="Material risk to profit or growth"
          icon={AlertTriangle}
          tone="negative"
        />
        <IntelligenceSummaryCard
          label="In review"
          value={String(counts.reviewing)}
          caption="Owner is investigating"
          icon={ClipboardCheck}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Total tracked"
          value={String(counts.total)}
          caption="All alerts including resolved"
          icon={Sparkles}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-20 text-muted-foreground">Priority</TableHead>
                <TableHead className="text-muted-foreground">Alert</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Metric change</TableHead>
                <TableHead className="text-muted-foreground">Impact</TableHead>
                <TableHead className="text-muted-foreground">Owner</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="border-border hover:bg-muted/40">
                  <TableCell>
                    <PriorityPill priority={a.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{a.title}</span>
                      <span className="text-[11px] text-muted-foreground">{a.detail}</span>
                      <span className="mt-0.5 text-[10px] text-muted-foreground">
                        Raised {a.raisedAt}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {a.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">{a.metricChange}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.impact}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.owner}</TableCell>
                  <TableCell>
                    <PlanningStatusPill status={a.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {a.link ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        asChild
                      >
                        <Link href={a.link}>Inspect</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Inspect
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Briefs */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="text-sm font-medium text-foreground">Briefs</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Periodic summaries that distill performance, risk, and recommendations to review.
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            Manage brief delivery
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {briefs.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {b.cadence}
                </span>
                <PlanningStatusPill status="Ready" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
              <p className="text-xs text-muted-foreground text-pretty">{b.description}</p>
              <ul className="space-y-1.5">
                {b.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-[11px] text-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {h}
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="outline" className="h-8 text-xs justify-between">
                Open brief
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AlertsPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <AlertsPageInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
