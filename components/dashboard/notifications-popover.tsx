"use client"

import Link from "next/link"
import { Bell, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { PlanningStatusPill } from "@/components/planning/planning-status-pill"
import { alerts, type AlertRow } from "@/components/planning/alerts/alerts-data"
import { cn } from "@/lib/utils"

function PriorityPill({ priority }: { priority: AlertRow["priority"] }) {
  const styles =
    priority === "High"
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
      : priority === "Medium"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-500"
        : "bg-slate-500/10 text-slate-700 dark:text-slate-400"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        styles,
      )}
    >
      {priority}
    </span>
  )
}

export function NotificationsPopover() {
  const active = alerts.filter(
    (a) => a.status === "Open" || a.status === "Reviewing",
  )
  const openCount = alerts.filter((a) => a.status === "Open").length
  const reviewingCount = alerts.filter((a) => a.status === "Reviewing").length
  const visible = active.slice(0, 5)
  const hasUnread = openCount > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(420px,calc(100vw-2rem))] overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {openCount} open, {reviewingCount} under review
            </p>
          </div>
          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
            <Link href="/planning/alerts">
              View all
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">
              No open or reviewing alerts right now.
            </p>
          </div>
        ) : (
          <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
            {visible.map((a) => {
              const Inner = (
                <div className="flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/50">
                  <div className="mt-0.5">
                    <PriorityPill priority={a.priority} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      {a.detail}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {a.category}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {a.metricChange}
                      </span>
                      <PlanningStatusPill status={a.status} />
                    </div>
                  </div>
                </div>
              )
              return (
                <li key={a.id}>
                  {a.link ? (
                    <Link
                      href={a.link}
                      className="block focus:outline-none focus-visible:bg-muted/60"
                    >
                      {Inner}
                    </Link>
                  ) : (
                    Inner
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-4 py-2.5">
          <Button asChild size="sm" variant="outline" className="h-7 w-full text-xs">
            <Link href="/planning/alerts">Open alerts center</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
