"use client"

import { cn } from "@/lib/utils"

export type PlanningStatus =
  | "On Track"
  | "Ahead"
  | "Behind"
  | "Watch"
  | "Critical"
  | "Open"
  | "Reviewing"
  | "Waiting"
  | "Resolved"
  | "Ignored"
  | "Ready"
  | "Draft"
  | "Scheduled"
  | "Generating"
  | "Healthy"

const statusStyles: Record<PlanningStatus, string> = {
  // Goal pace
  "On Track": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Ahead: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Behind: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
  Watch: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
  Critical: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  // Alert states
  Open: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Reviewing: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
  Waiting: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Ignored: "bg-muted text-muted-foreground",
  // Reports
  Ready: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  Scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Generating: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
}

interface PlanningStatusPillProps {
  status: PlanningStatus
  className?: string
}

export function PlanningStatusPill({ status, className }: PlanningStatusPillProps) {
  const style = statusStyles[status] ?? "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        style,
        className,
      )}
    >
      {status}
    </span>
  )
}
