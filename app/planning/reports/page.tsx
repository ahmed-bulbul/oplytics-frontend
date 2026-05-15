"use client"

import { useMemo, useState } from "react"
import { FileText, ClipboardCheck, Mail, Calendar } from "lucide-react"
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
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { PlanningStatusPill } from "@/components/planning/planning-status-pill"
import { reportTemplates, type ReportTemplate } from "@/components/planning/reports/reports-data"
import { ReportDetailDialog } from "@/components/planning/reports/report-detail-dialog"

const frequencyOptions = ["All frequencies", "Weekly", "Monthly", "Quarterly", "On Demand"] as const
const statusOptions = ["All statuses", "Ready", "Scheduled", "Draft", "Generating"] as const

function ReportsPageInner() {
  const [frequency, setFrequency] = useState<string>("All frequencies")
  const [status, setStatus] = useState<string>("All statuses")
  const [selected, setSelected] = useState<ReportTemplate | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return reportTemplates.filter((r) => {
      const matchesFreq = frequency === "All frequencies" || r.frequency === frequency
      const matchesStatus = status === "All statuses" || r.status === status
      return matchesFreq && matchesStatus
    })
  }, [frequency, status])

  const counts = useMemo(() => {
    return {
      total: reportTemplates.length,
      ready: reportTemplates.filter((r) => r.status === "Ready").length,
      scheduled: reportTemplates.filter((r) => r.status === "Scheduled").length,
      draft: reportTemplates.filter((r) => r.status === "Draft").length,
    }
  }, [])

  const handleView = (r: ReportTemplate) => {
    setSelected(r)
    setOpen(true)
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Reports"
        subtitle="Save, export, and share performance summaries for your team, finance partners, and clients."
        actions={
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Manage report schedule
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <IntelligenceSummaryCard
          label="Available templates"
          value={String(counts.total)}
          caption="Cover profit, channels, products, and LTV"
          icon={FileText}
        />
        <IntelligenceSummaryCard
          label="Ready"
          value={String(counts.ready)}
          caption="Recently generated or up to date"
          icon={ClipboardCheck}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Scheduled"
          value={String(counts.scheduled)}
          caption="Set to generate automatically"
          icon={Calendar}
        />
        <IntelligenceSummaryCard
          label="Drafts"
          value={String(counts.draft)}
          caption="Not yet configured"
          icon={FileText}
          tone="warning"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((f) => (
              <SelectItem key={f} value={f} className="text-xs">
                {f}
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

      {/* Reports table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Report</TableHead>
                <TableHead className="text-muted-foreground">Frequency</TableHead>
                <TableHead className="text-muted-foreground">Last generated</TableHead>
                <TableHead className="text-muted-foreground">Owner</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer border-border hover:bg-muted/40"
                  onClick={() => handleView(r)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.name}</span>
                      <span className="text-[11px] text-muted-foreground">{r.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {r.frequency}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.lastGenerated}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.owner}</TableCell>
                  <TableCell>
                    <PlanningStatusPill status={r.status} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleView(r)}
                    >
                      {r.status === "Draft" ? "Configure" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReportDetailDialog report={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default function ReportsPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <ReportsPageInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
