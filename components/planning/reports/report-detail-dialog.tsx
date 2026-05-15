"use client"

import { Download, FileText, Mail, Share2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlanningStatusPill } from "../planning-status-pill"
import type { ReportTemplate } from "./reports-data"

interface ReportDetailDialogProps {
  report: ReportTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailDialog({ report, open, onOpenChange }: ReportDetailDialogProps) {
  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <PlanningStatusPill status={report.status} />
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {report.frequency}
            </span>
          </div>
          <DialogTitle className="pt-1 text-base">{report.name}</DialogTitle>
          <DialogDescription className="text-xs text-pretty">
            {report.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Owner
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{report.owner}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Last generated
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{report.lastGenerated}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Sections included
            </p>
            <ul className="mt-2 space-y-1.5">
              {report.sections.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
            Exports run on the report data pipeline. PDF and CSV exports are available once the
            export backend is connected.
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2 sm:gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email summary
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
