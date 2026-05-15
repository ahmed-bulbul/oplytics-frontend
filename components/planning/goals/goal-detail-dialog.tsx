"use client"

import { useEffect, useState } from "react"
import { Target, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlanningStatusPill } from "../planning-status-pill"
import { Goal, progressTowardGoal } from "./goals-data"
import { cn } from "@/lib/utils"

interface GoalDetailDialogProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MiniSparkline({ data, status }: { data: number[]; status: Goal["status"] }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")
  const color =
    status === "Critical"
      ? "#f43f5e"
      : status === "Behind"
        ? "#f59e0b"
        : status === "Watch"
          ? "#f59e0b"
          : "#10b981"
  return (
    <svg viewBox="0 0 100 40" className="h-12 w-full">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  )
}

export function GoalDetailDialog({ goal, open, onOpenChange }: GoalDetailDialogProps) {
  const [editTarget, setEditTarget] = useState(false)
  const [draftTarget, setDraftTarget] = useState("")

  useEffect(() => {
    if (goal) {
      setDraftTarget(goal.target)
      setEditTarget(false)
    }
  }, [goal])

  if (!goal) return null

  const progress = progressTowardGoal(goal)
  const isAhead = goal.status === "Ahead"
  const isCritical = goal.status === "Critical" || goal.status === "Behind"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Target className="h-3.5 w-3.5" />
            </span>
            <PlanningStatusPill status={goal.status} />
          </div>
          <DialogTitle className="pt-1 text-base">{goal.metric}</DialogTitle>
          <DialogDescription className="text-xs">
            {goal.group} &middot; Owned by {goal.owner} &middot; {goal.reviewedAt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current vs target */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Current
                </p>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {goal.current}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Target
                </p>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {goal.target}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    isAhead && "bg-emerald-500",
                    !isAhead && !isCritical && "bg-emerald-500",
                    goal.status === "Watch" && "bg-amber-500",
                    isCritical && goal.status === "Behind" && "bg-amber-500",
                    goal.status === "Critical" && "bg-rose-500",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{goal.paceLabel}</p>
            </div>
          </div>

          {/* Trend */}
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Recent trend
              </p>
              {goal.direction === "above" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>
            <MiniSparkline data={goal.history} status={goal.status} />
          </div>

          {/* Drivers */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Key drivers
            </p>
            <p className="mt-1 text-sm text-foreground">{goal.drivers}</p>
          </div>

          {/* Update target */}
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Target value
              </p>
              {!editTarget ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setEditTarget(true)}
                >
                  Update target
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setDraftTarget(goal.target)
                    setEditTarget(false)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {editTarget ? (
              <div className="mt-3 space-y-2">
                <Label htmlFor="goal-target" className="text-xs">
                  New target
                </Label>
                <Input
                  id="goal-target"
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(e.target.value)}
                  placeholder={goal.target}
                  className="h-8 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Targets are demo-only in this preview. They will persist once Goals & Targets
                  is connected to the backend.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-foreground">{goal.target}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Inspect drivers
          </Button>
          {editTarget && (
            <Button
              onClick={() => {
                setEditTarget(false)
                onOpenChange(false)
              }}
            >
              Save target
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
