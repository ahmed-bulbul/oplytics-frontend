"use client"

import { useEffect, useState } from "react"
import {
  X,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Minus,
  GitCommit,
  Target as TargetIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  ActionableRow,
  healthStatusConfig,
  OutcomeStatus,
} from "./types"
import { ManageStatusPill } from "./manage-status-pill"
import {
  ApprovedActionBadge,
  useApprovedActions,
  useApprovedActionDraftStatus,
  type ApprovedActionDraft,
} from "@/components/dashboard/approved-actions"
import { RefreshCcw, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ManageRowDetailDrawerProps {
  row: ActionableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction?: (action: string) => void
}

function MiniSparkline({ data, status }: { data: number[]; status: string }) {
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

  const strokeColor =
    status === "critical"
      ? "#f43f5e"
      : status === "watch"
        ? "#f59e0b"
        : status === "opportunity"
          ? "#3b82f6"
          : "#10b981"

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full">
      <polyline fill="none" stroke={strokeColor} strokeWidth="2" points={points} />
    </svg>
  )
}

/**
 * Renders the Suggested Next Step content for a row that has an
 * executable approved-action draft attached. Shows the badge + button
 * pair that matches the draft's current lifecycle:
 *   - available: Approved action available · Preview action
 *   - submitted: Submitted Xm ago · View log entry
 *   - failed:    Submission failed · Retry
 *
 * Lives in this file so it can stay close to the drawer's visual
 * styling, but does not depend on drawer-specific state.
 */
function SuggestedActionApprovedBlock({
  draft,
  recommendedAction,
  expectedImpact,
  colorClass,
}: {
  draft: ApprovedActionDraft
  recommendedAction: string
  expectedImpact?: string
  colorClass: string
}) {
  const { openPreview, openLog } = useApprovedActions()
  const { status, entry } = useApprovedActionDraftStatus(draft)

  return (
    <>
      <div className="mb-2">
        <ApprovedActionBadge
          size="sm"
          variant={status}
          timestamp={entry?.timestamp}
        />
      </div>
      <p className={cn("text-sm font-medium", colorClass)}>
        {recommendedAction === "None" ? "No action needed" : recommendedAction}
      </p>
      {expectedImpact && (
        <p className="text-[11px] text-muted-foreground mt-2">
          Expected impact: {expectedImpact}
        </p>
      )}

      {status === "submitted" && entry && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 h-7 text-[11px] gap-1"
          onClick={() => openLog(entry.id)}
        >
          <ScrollText className="h-3 w-3" />
          View log entry
        </Button>
      )}
      {status === "failed" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 h-7 text-[11px] gap-1 border-rose-500/30 text-rose-700 hover:border-rose-500/50 hover:bg-rose-500/5 dark:text-rose-400"
          onClick={() => openPreview(draft)}
        >
          <RefreshCcw className="h-3 w-3" />
          Retry
        </Button>
      )}
      {status === "available" && (
        <Button
          size="sm"
          className="mt-3 h-7 text-[11px]"
          onClick={() => openPreview(draft)}
        >
          Preview action
        </Button>
      )}
    </>
  )
}

export function ManageRowDetailDrawer({
  row,
  open,
  onOpenChange,
  onAction,
}: ManageRowDetailDrawerProps) {
  const [decision, setDecision] = useState("")
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>("Not reviewed")

  // Hydrate local state from the row whenever a new row is opened.
  useEffect(() => {
    if (!row) return
    setDecision(row.decision ?? "")
    setOutcomeStatus(row.outcomeStatus ?? "Not reviewed")
  }, [row])

  if (!row) return null

  const config = healthStatusConfig[row.status]

  const trendIcon = (trend?: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald-500" />
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-rose-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {row.level}
                </span>
                <ManageStatusPill status={row.status} />
              </div>
              <SheetTitle className="text-lg">{row.name}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Why flagged */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Why flagged</p>
            <p className={cn("text-sm", config.color)}>{row.reason}</p>
            {row.confidence && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Confidence: {row.confidence}%
              </p>
            )}
          </div>

          {/* Metrics Grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Current Metrics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Spend</span>
                  {trendIcon(row.spendTrend)}
                </div>
                <p className="text-sm font-semibold">{row.spend}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Revenue</span>
                  {trendIcon(row.revenueTrend)}
                </div>
                <p className="text-sm font-semibold">{row.revenue}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">ROAS</span>
                </div>
                <p className="text-sm font-semibold">{row.roas}</p>
                {row.roasTarget && (
                  <p className="text-[10px] text-muted-foreground">Target: {row.roasTarget}</p>
                )}
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">CPA</span>
                </div>
                <p className="text-sm font-semibold">{row.cpa}</p>
                {row.cpaTarget && (
                  <p className="text-[10px] text-muted-foreground">Target: {row.cpaTarget}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Trend */}
          {row.recentTrend && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">7-Day ROAS Trend</p>
              <div className="rounded-lg border border-border p-3">
                <MiniSparkline data={row.recentTrend} status={row.status} />
              </div>
            </div>
          )}

          {/* Suggested Action */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Suggested Next Step</p>
            <div className={cn("rounded-lg border p-4", config.bgColor, config.borderColor)}>
              {/*
                When the row carries an executable approved-action draft,
                surface the lifecycle of that draft (available → submitted
                → failed) right inside the Suggested Next Step block so
                operators don't need to remember whether they already
                approved it. The badge + button swap together based on
                whether a matching log entry exists.
              */}
              {row.approvedAction ? (
                <SuggestedActionApprovedBlock
                  draft={row.approvedAction}
                  recommendedAction={row.recommendedAction}
                  expectedImpact={row.expectedImpact}
                  colorClass={config.color}
                />
              ) : (
                <>
                  <p className={cn("text-sm font-medium", config.color)}>
                    {row.recommendedAction === "None" ? "No action needed" : row.recommendedAction}
                  </p>
                  {row.expectedImpact && (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Expected impact: {row.expectedImpact}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Decision &amp; outcome */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Decision &amp; outcome
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Decision</label>
              <Input
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder='e.g. "Reduced budget by 30%, kept channel active"'
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Outcome status</label>
                <Select
                  value={outcomeStatus}
                  onValueChange={(v) => setOutcomeStatus(v as OutcomeStatus)}
                >
                  <SelectTrigger size="sm" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not reviewed" className="text-xs">Not reviewed</SelectItem>
                    <SelectItem value="In progress" className="text-xs">In progress</SelectItem>
                    <SelectItem value="Positive outcome" className="text-xs">Positive outcome</SelectItem>
                    <SelectItem value="Negative outcome" className="text-xs">Negative outcome</SelectItem>
                    <SelectItem value="Inconclusive" className="text-xs">Inconclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {row.outcomeReviewDate && (
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TargetIcon className="h-3 w-3" />
                    Review on
                  </label>
                  <p className="h-8 rounded-md border border-input bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                    {row.outcomeReviewDate}
                  </p>
                </div>
              )}
            </div>

            {row.guardrailMetric && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  Guardrail
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {row.guardrailMetric}
                </p>
              </div>
            )}

            {row.actualResult && (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  Actual result
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {row.actualResult}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border pt-4 space-y-2">
          <Button className="w-full" onClick={() => onAction?.("save-decision")}>
            Save decision
          </Button>
          <div className="grid grid-cols-2 gap-2">
            {row.delivery === "Paused" ? (
              <Button variant="outline" size="sm" onClick={() => onAction?.("resume")}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onAction?.("pause")}>
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onAction?.("ignore")}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Ignore
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
