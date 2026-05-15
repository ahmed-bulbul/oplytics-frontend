"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  CheckCircle2,
  Clock,
  Pause,
  Play,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  ACTION_TYPE_LABEL,
  OBJECT_TYPE_LABEL,
  PLATFORM_LABEL,
  type ActionLogEntry,
  type ApprovedActionType,
} from "./types"
import { useApprovedActions } from "./approved-actions-context"

const ACTION_ICON: Record<ApprovedActionType, typeof Pause> = {
  pause: Pause,
  enable: Play,
  increase_budget: TrendingUp,
  decrease_budget: TrendingDown,
  set_budget: TrendingUp,
}

function StatusPill({ status }: { status: ActionLogEntry["status"] }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
        Success
      </span>
    )
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:text-slate-300">
        <Clock className="h-2.5 w-2.5" aria-hidden="true" />
        Queued
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-medium text-rose-700 dark:text-rose-400">
      <XCircle className="h-2.5 w-2.5" aria-hidden="true" />
      Failed
    </span>
  )
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Sheet that lists every approved action submitted from Optilytics.
 * Read-only by design — entries are never edited or deleted, mirroring
 * the audit-log expectations operators have for any system that touches
 * paid platforms.
 *
 * Mounted once at the root layout level. Open/close + optional
 * "highlight this entry" deep-link is driven by the approved-actions
 * context, so any surface (cell, drawer, AI card) can call `openLog()`
 * to bring the operator straight to the matching entry.
 */
export function ActionLogSheet() {
  const { log, logSheet, openLog, closeLog } = useApprovedActions()
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  // Scroll the highlighted entry into view when the sheet opens via a
  // deep link from a "View log entry" button.
  useEffect(() => {
    if (!logSheet.open || !logSheet.highlightEntryId) return
    const el = itemRefs.current.get(logSheet.highlightEntryId)
    if (el) {
      // requestAnimationFrame so the sheet has actually rendered.
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }
  }, [logSheet.open, logSheet.highlightEntryId])

  const grouped = useMemo(() => log, [log])

  return (
    <Sheet
      open={logSheet.open}
      onOpenChange={(open) => (open ? openLog() : closeLog())}
    >
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1.5 pb-4 border-b border-border">
          <SheetTitle className="text-base">Action Log</SheetTitle>
          <p className="text-[11px] text-muted-foreground">
            Every approved action submitted from Optilytics. Read-only audit
            trail.
          </p>
        </SheetHeader>

        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Clock className="h-6 w-6" aria-hidden="true" />
            <p className="text-xs">No approved actions yet.</p>
            <p className="text-[11px] max-w-[260px]">
              When an operator approves a recommended action, the full record
              will appear here.
            </p>
          </div>
        ) : (
          <ol className="space-y-3 py-4">
            {grouped.map((entry) => {
              const Icon = ACTION_ICON[entry.actionType]
              const isHighlighted = entry.id === logSheet.highlightEntryId
              return (
                <li
                  key={entry.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(entry.id, el)
                    else itemRefs.current.delete(entry.id)
                  }}
                  className={cn(
                    "rounded-lg border bg-card p-3 space-y-2 transition-colors",
                    // Ring + accent border highlight when the sheet was
                    // deep-linked to this specific entry.
                    isHighlighted
                      ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
                      : "border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground",
                        )}
                      >
                        <Icon className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-tight">
                          {ACTION_TYPE_LABEL[entry.actionType]} ·{" "}
                          {entry.objectName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {PLATFORM_LABEL[entry.platform]} ·{" "}
                          {OBJECT_TYPE_LABEL[entry.objectType]}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={entry.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Previous
                      </p>
                      <p className="text-[11px] font-medium">
                        {entry.previousValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        New
                      </p>
                      <p className="text-[11px] font-medium">
                        {entry.newValue}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <span>
                      {entry.user} · {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-muted-foreground bg-muted/30 rounded px-2 py-1 break-all">
                    {entry.platformResponse}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * The "Action Log" button + count chip used in the Action Center
 * header. Lives separately from the Sheet so the sheet itself can be
 * mounted globally and opened from anywhere via context.
 */
export function ActionLogTriggerButton() {
  const { log, openLog } = useApprovedActions()
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs"
      onClick={() => openLog()}
    >
      Action Log
      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
        {log.length}
      </span>
    </Button>
  )
}
