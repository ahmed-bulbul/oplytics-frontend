"use client"

import { useMemo, useState } from "react"
import {
  Award,
  Target as TargetIcon,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
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
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { PlanningStatusPill } from "@/components/planning/planning-status-pill"
import {
  Goal,
  goals,
  goalGroups,
  progressTowardGoal,
} from "@/components/planning/goals/goals-data"
import { GoalDetailDialog } from "@/components/planning/goals/goal-detail-dialog"
import { cn } from "@/lib/utils"

const statusOptions = [
  "All statuses",
  "On Track",
  "Ahead",
  "Behind",
  "Watch",
  "Critical",
] as const

const groupOptions = ["All groups", ...goalGroups] as const

function ProgressBar({ goal }: { goal: Goal }) {
  const pct = progressTowardGoal(goal)
  const color =
    goal.status === "Critical"
      ? "bg-rose-500"
      : goal.status === "Behind" || goal.status === "Watch"
        ? "bg-amber-500"
        : "bg-emerald-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  )
}

function GoalsPageInner() {
  const [statusFilter, setStatusFilter] = useState<string>("All statuses")
  const [groupFilter, setGroupFilter] = useState<string>("All groups")
  const [selected, setSelected] = useState<Goal | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      const matchesStatus = statusFilter === "All statuses" || g.status === statusFilter
      const matchesGroup = groupFilter === "All groups" || g.group === groupFilter
      return matchesStatus && matchesGroup
    })
  }, [statusFilter, groupFilter])

  const counts = useMemo(() => {
    return {
      total: goals.length,
      onTrack: goals.filter((g) => g.status === "On Track" || g.status === "Ahead").length,
      watch: goals.filter((g) => g.status === "Watch").length,
      behind: goals.filter((g) => g.status === "Behind").length,
      critical: goals.filter((g) => g.status === "Critical").length,
    }
  }, [])

  const handleView = (g: Goal) => {
    setSelected(g)
    setOpen(true)
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Goals & Targets"
        subtitle="Compare current performance to monthly targets across profitability, efficiency, acquisition, retention, and operations."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groupOptions.map((g) => (
              <SelectItem key={g} value={g} className="text-xs">
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <IntelligenceSummaryCard
          label="Tracked Goals"
          value={String(counts.total)}
          caption="Across 5 metric groups"
          icon={TargetIcon}
        />
        <IntelligenceSummaryCard
          label="On Track / Ahead"
          value={String(counts.onTrack)}
          caption="Pacing at or above target"
          icon={Award}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Watch"
          value={String(counts.watch)}
          caption="Slipping toward target risk"
          icon={TrendingDown}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Behind"
          value={String(counts.behind)}
          caption="Below pace, needs review"
          icon={TrendingUp}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Critical"
          value={String(counts.critical)}
          caption="Material risk to month-end"
          icon={AlertTriangle}
          tone="negative"
        />
      </div>

      {/* Goals table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Metric</TableHead>
                <TableHead className="text-muted-foreground">Group</TableHead>
                <TableHead className="text-right text-muted-foreground">Current</TableHead>
                <TableHead className="text-right text-muted-foreground">Target</TableHead>
                <TableHead className="text-muted-foreground">Pace</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Owner</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => (
                <TableRow
                  key={g.id}
                  className="cursor-pointer border-border hover:bg-muted/40"
                  onClick={() => handleView(g)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{g.metric}</span>
                      <span className="text-[11px] text-muted-foreground">{g.drivers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {g.group}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{g.current}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                    {g.target}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <ProgressBar goal={g} />
                      <span className="text-[11px] text-muted-foreground">{g.paceLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanningStatusPill status={g.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{g.owner}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleView(g)}
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

      <GoalDetailDialog goal={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default function GoalsPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <GoalsPageInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
