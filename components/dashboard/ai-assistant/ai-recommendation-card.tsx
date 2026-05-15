"use client"

import { useState } from "react"
import {
  TrendingUp,
  AlertTriangle,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
  RefreshCcw,
  ScrollText,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Recommendation, RecommendationType } from "./types"
import { AiEvidenceList } from "./ai-evidence-list"
import {
  ApprovedActionBadge,
  useApprovedActions,
  useApprovedActionDraftStatus,
  type ApprovedActionDraft,
} from "@/components/dashboard/approved-actions"

interface AiRecommendationCardProps {
  recommendation: Recommendation
  isSelected?: boolean
  onSelect?: (recommendation: Recommendation) => void
  onAction?: (recommendation: Recommendation, action: string) => void
}

const typeConfig: Record<RecommendationType, {
  label: string
  icon: typeof TrendingUp
  badgeClass: string
  accentClass: string
}> = {
  opportunity: {
    label: "Opportunity",
    icon: TrendingUp,
    badgeClass: "bg-emerald-500/10 text-emerald-600",
    accentClass: "border-l-emerald-500",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    badgeClass: "bg-amber-500/10 text-amber-600",
    accentClass: "border-l-amber-500",
  },
  watch: {
    label: "Watch",
    icon: Eye,
    badgeClass: "bg-slate-500/10 text-slate-600",
    accentClass: "border-l-slate-400",
  },
  critical: {
    label: "Critical",
    icon: AlertCircle,
    badgeClass: "bg-red-500/10 text-red-600",
    accentClass: "border-l-red-500",
  },
}

export function AiRecommendationCard({
  recommendation,
  isSelected = false,
  onSelect,
  onAction,
}: AiRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[recommendation.type]
  const Icon = config.icon

  // Approved Actions Beta gate. When a recommendation maps to an MVP
  // executable action (Meta/Google · pause/enable/budget), the card
  // swaps in an executable button row that reflects the draft's
  // submission lifecycle. Otherwise the original review-only buttons
  // stay.
  const isExecutable = Boolean(recommendation.approvedAction)

  return (
    <div
      className={cn(
        "rounded-lg border border-border border-l-[3px] bg-card transition-all",
        config.accentClass,
        isSelected && "ring-1 ring-primary/50 bg-accent/40"
      )}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => {
          setExpanded(!expanded)
          onSelect?.(recommendation)
        }}
        className="w-full p-2.5 text-left hover:bg-accent/30 transition-colors"
      >
        {/* Type Badge + Title */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide", config.badgeClass)}>
                <Icon className="h-2.5 w-2.5" />
                {config.label}
              </span>
              <span className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-medium",
                recommendation.confidence === "High" && "bg-emerald-500/10 text-emerald-600",
                recommendation.confidence === "Medium" && "bg-amber-500/10 text-amber-600",
                recommendation.confidence === "Low" && "bg-slate-500/10 text-slate-600"
              )}>
                {recommendation.confidence} Confidence
              </span>
              {isExecutable && recommendation.approvedAction && (
                <ApprovedActionLifecycleBadge
                  draft={recommendation.approvedAction}
                />
              )}
            </div>
            <h4 className="text-[11px] font-semibold leading-tight text-foreground">
              {recommendation.title}
            </h4>
          </div>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </div>

        {/* Entity Label */}
        <p className="mb-1.5 text-[10px] text-muted-foreground">
          <span className="font-medium">{recommendation.entityType}:</span>{" "}
          {recommendation.entityName}
          <span className="mx-1.5 text-border">|</span>
          <span>{recommendation.timeWindow}</span>
        </p>

        {/* What Happened - Always show a preview */}
        <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
          {recommendation.whatHappened}
        </p>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border px-2.5 py-2 space-y-3">
          {/* Evidence Section */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Evidence
            </p>
            <AiEvidenceList evidence={recommendation.evidence} />
          </div>

          {/* Why It Matters */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Why It Matters
            </p>
            <p className="text-[10px] leading-relaxed text-foreground">
              {recommendation.whyItMatters}
            </p>
          </div>

          {/* Recommended Action */}
          <div className="rounded-md bg-primary/5 border border-primary/10 px-2 py-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-primary mb-0.5">
              Recommended Action
            </p>
            <p className="text-[10px] font-medium text-foreground">
              {recommendation.recommendedAction}
            </p>
          </div>

          {/* Estimated Impact */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Estimated Impact
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendation.estimatedImpact.revenue && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                  Revenue: {recommendation.estimatedImpact.revenue}
                </span>
              )}
              {recommendation.estimatedImpact.margin && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                  Margin: {recommendation.estimatedImpact.margin}
                </span>
              )}
              {recommendation.estimatedImpact.spend && (
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                  Spend: {recommendation.estimatedImpact.spend}
                </span>
              )}
            </div>
          </div>

          {/* Risk / Guardrail */}
          <div className="flex items-start gap-1.5 rounded-md bg-amber-500/5 border border-amber-500/10 px-2 py-1.5">
            <Shield className="h-3 w-3 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 mb-0.5">
                Risk / Guardrail
              </p>
              <p className="text-[10px] leading-relaxed text-foreground">
                {recommendation.riskGuardrail}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isExecutable && recommendation.approvedAction ? (
              <ApprovedActionLifecycleButtons
                draft={recommendation.approvedAction}
                onAction={(action) => onAction?.(recommendation, action)}
              />
            ) : (
              // Review-only recommendations keep the original button mix
              // defined per recommendation in the data layer.
              recommendation.actions.map((action) => (
                <Button
                  key={action.action}
                  size="sm"
                  variant={action.action === "review_recommendation" ? "default" : "outline"}
                  className={cn(
                    "h-6 text-[10px]",
                    action.action === "review_recommendation" && "bg-primary hover:bg-primary/90",
                    action.action === "ignore" && "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction?.(recommendation, action.action)
                  }}
                >
                  {action.label}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Lifecycle-aware badge shown next to the type/confidence pills in the
 * card header. Mirrors the behavior on Action Center cells so the same
 * draft reads consistently no matter which surface the operator is
 * looking at.
 */
function ApprovedActionLifecycleBadge({ draft }: { draft: ApprovedActionDraft }) {
  const { status, entry } = useApprovedActionDraftStatus(draft)
  return (
    <ApprovedActionBadge
      size="xs"
      variant={status}
      timestamp={entry?.timestamp}
    />
  )
}

/**
 * Lifecycle-aware button row for the expanded section of an executable
 * recommendation. The exact button mix swaps based on whether the draft
 * has been submitted yet:
 *
 *  - available: View evidence · Preview change · Open in Action Center
 *  - submitted: View log entry  ·                Open in Action Center
 *  - failed:    Retry           ·                Open in Action Center
 *
 * "Open in Action Center" stays in every variant so operators can always
 * jump back to the row's full diagnostic context regardless of state.
 */
function ApprovedActionLifecycleButtons({
  draft,
  onAction,
}: {
  draft: ApprovedActionDraft
  onAction?: (action: string) => void
}) {
  const { openPreview, openLog } = useApprovedActions()
  const { status, entry } = useApprovedActionDraftStatus(draft)

  const openInActionCenter = (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="h-6 text-[10px]"
      onClick={(e) => {
        e.stopPropagation()
        onAction?.("open_in_action_center")
      }}
    >
      <Link href="/action-center">
        <ExternalLink className="mr-1 h-3 w-3" />
        Open in Action Center
      </Link>
    </Button>
  )

  if (status === "submitted" && entry) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/5 dark:text-emerald-400"
          onClick={(e) => {
            e.stopPropagation()
            openLog(entry.id)
            onAction?.("view_log_entry")
          }}
        >
          <ScrollText className="mr-1 h-3 w-3" />
          View log entry
        </Button>
        {openInActionCenter}
      </>
    )
  }

  if (status === "failed") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] border-rose-500/30 text-rose-700 hover:bg-rose-500/5 dark:text-rose-400"
          onClick={(e) => {
            e.stopPropagation()
            openPreview(draft)
            onAction?.("retry")
          }}
        >
          <RefreshCcw className="mr-1 h-3 w-3" />
          Retry
        </Button>
        {openInActionCenter}
      </>
    )
  }

  // Available — original executable trio.
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-6 text-[10px]"
        onClick={(e) => {
          e.stopPropagation()
          onAction?.("view_evidence")
        }}
      >
        <Eye className="mr-1 h-3 w-3" />
        View evidence
      </Button>
      <Button
        size="sm"
        className="h-6 text-[10px]"
        onClick={(e) => {
          e.stopPropagation()
          openPreview(draft)
          onAction?.("preview_change")
        }}
      >
        Preview change
      </Button>
      {openInActionCenter}
    </>
  )
}
