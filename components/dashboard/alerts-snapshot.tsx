"use client"

import Link from "next/link"
import { BellRing, ChevronRight } from "lucide-react"
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

export function AlertsSnapshot() {
  const active = alerts
    .filter((a) => a.status === "Open" || a.status === "Reviewing")
    .slice(0, 5)
  const openCount = alerts.filter((a) => a.status === "Open").length
  const reviewingCount = alerts.filter((a) => a.status === "Reviewing").length

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BellRing className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-foreground">Active alerts</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {openCount} open, {reviewingCount} under review.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
          <Link href="/planning/alerts">
            View all alerts
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {active.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <PriorityPill priority={a.priority} />
              <div>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.category}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {a.metricChange}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{a.owner}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <PlanningStatusPill status={a.status} />
              {a.link ? (
                <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                  <Link href={a.link}>Inspect</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Inspect
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
