"use client"

import Link from "next/link"
import { Target, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanningStatusPill } from "@/components/planning/planning-status-pill"
import { goals, progressTowardGoal, type Goal } from "@/components/planning/goals/goals-data"
import { cn } from "@/lib/utils"

// Surface the most strategically important goals on the Dashboard.
const featuredGoalIds = [
  "goal_cm",
  "goal_revenue",
  "goal_mer",
  "goal_cac",
  "goal_refund_rate",
  "goal_sub_m2",
]

export function GoalsSnapshot() {
  const featured = goals.filter((g) => featuredGoalIds.includes(g.id))

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Target className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-foreground">Goals & Targets</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How current performance compares to your monthly targets.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
          <Link href="/planning/goals">
            View all goals
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">
        {featured.map((g, i) => (
          <GoalTile
            key={g.id}
            goal={g}
            // Hide the right border on the last column at each breakpoint
            className={cn(
              i % 2 === 1 && "sm:border-r-0 lg:border-r",
              i % 3 === 2 && "lg:border-r-0",
            )}
          />
        ))}
      </div>
    </section>
  )
}

function GoalTile({ goal, className }: { goal: Goal; className?: string }) {
  const pct = progressTowardGoal(goal)
  const color =
    goal.status === "Critical"
      ? "bg-rose-500"
      : goal.status === "Behind" || goal.status === "Watch"
        ? "bg-amber-500"
        : "bg-emerald-500"

  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {goal.metric}
        </p>
        <PlanningStatusPill status={goal.status} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            {goal.current}
          </p>
          <p className="text-[11px] text-muted-foreground">Target {goal.target}</p>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground">{goal.paceLabel}</p>
    </div>
  )
}
