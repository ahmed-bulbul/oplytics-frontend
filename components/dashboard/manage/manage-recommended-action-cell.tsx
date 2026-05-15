"use client"

import {
  TrendingUp,
  Pause,
  Play,
  Flag,
  Check,
  TrendingDown,
  RefreshCcw,
  ScrollText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { HealthStatus } from "./types"
import { cn } from "@/lib/utils"
import {
  ApprovedActionBadge,
  useApprovedActions,
  useApprovedActionDraftStatus,
  type ApprovedActionDraft,
  type ApprovedActionType,
} from "@/components/dashboard/approved-actions"

interface ManageRecommendedActionCellProps {
  status: HealthStatus
  recommendedAction: string
  /**
   * When present, this row is eligible for the Approved Actions Beta and
   * the cell renders an "Approved action available" badge plus a Preview
   * Action button that opens the global PreviewActionModal. When absent,
   * the cell falls back to the original review-only button styles so
   * non-paid surfaces (Product, Inventory, Cohort, etc.) and non-MVP
   * paid actions stay visually unchanged.
   */
  approvedAction?: ApprovedActionDraft
  onAction?: (action: string) => void
}

const APPROVED_ICON: Record<ApprovedActionType, typeof Pause> = {
  pause: Pause,
  enable: Play,
  increase_budget: TrendingUp,
  decrease_budget: TrendingDown,
  set_budget: TrendingUp,
}

/**
 * Sub-component so we can call the draft-status hook without violating
 * rules of hooks (the parent renders different branches depending on
 * whether `approvedAction` is set).
 */
function ApprovedActionCellContent({
  draft,
  onAction,
}: {
  draft: ApprovedActionDraft
  onAction?: (action: string) => void
}) {
  const { openPreview, openLog } = useApprovedActions()
  const { status, entry } = useApprovedActionDraftStatus(draft)
  const Icon = APPROVED_ICON[draft.type]

  // Submitted: the operator already approved this action. Replace the
  // call-to-action with a confirmation pill + a "View log entry" button
  // that deep-links to the immutable Action Log scrolled to this entry.
  if (status === "submitted" && entry) {
    return (
      <div className="flex flex-col items-start gap-1">
        <ApprovedActionBadge
          size="xs"
          variant="submitted"
          timestamp={entry.timestamp}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[10px] gap-1 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400"
          onClick={() => {
            openLog(entry.id)
            onAction?.("view-log-entry")
          }}
        >
          <ScrollText className="h-3 w-3" />
          View log entry
        </Button>
      </div>
    )
  }

  // Failed: surface the failure inline and offer a one-click retry that
  // re-opens the Preview modal so the operator can resubmit.
  if (status === "failed") {
    return (
      <div className="flex flex-col items-start gap-1">
        <ApprovedActionBadge size="xs" variant="failed" />
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[10px] gap-1 border-rose-500/30 text-rose-700 hover:border-rose-500/50 hover:bg-rose-500/5 dark:text-rose-400"
          onClick={() => {
            openPreview(draft)
            onAction?.("retry-action")
          }}
        >
          <RefreshCcw className="h-3 w-3" />
          Retry
        </Button>
      </div>
    )
  }

  // Available: the original Beta entry point.
  return (
    <div className="flex flex-col items-start gap-1">
      <ApprovedActionBadge size="xs" />
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-2 text-[10px] gap-1 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5"
        onClick={() => {
          openPreview(draft)
          onAction?.("preview-action")
        }}
      >
        <Icon className="h-3 w-3" />
        Preview action
      </Button>
    </div>
  )
}

export function ManageRecommendedActionCell({
  status,
  recommendedAction,
  approvedAction,
  onAction,
}: ManageRecommendedActionCellProps) {
  // Approved Actions Beta path — a row carrying an executable draft.
  if (approvedAction) {
    return (
      <ApprovedActionCellContent draft={approvedAction} onAction={onAction} />
    )
  }

  if (recommendedAction === "None" || recommendedAction === "Monitor") {
    return (
      <span className="text-[11px] text-muted-foreground">
        {recommendedAction}
      </span>
    )
  }

  const getActionConfig = () => {
    const lower = recommendedAction.toLowerCase()

    // Review-oriented actions are the default — use a neutral outline style
    // with an icon hint that reflects the underlying intent.
    if (lower.includes("budget increase") || lower.includes("scale")) {
      return {
        icon: TrendingUp,
        action: "review-budget-increase",
        variant: "outline" as const,
        className: "",
      }
    }
    if (lower.includes("pause")) {
      return {
        icon: Pause,
        action: "review-pause",
        variant: "outline" as const,
        className: "",
      }
    }
    if (lower.includes("creative refresh") || lower.includes("refresh creative")) {
      return {
        icon: Flag,
        action: "review-creative",
        variant: "outline" as const,
        className: "",
      }
    }
    if (lower.includes("attribution")) {
      return {
        icon: Flag,
        action: "review-attribution",
        variant: "outline" as const,
        className: "",
      }
    }
    if (lower.includes("enable") || lower.includes("resume")) {
      return {
        icon: Play,
        action: "enable",
        variant: "outline" as const,
        className: "",
      }
    }
    if (lower.includes("review") || lower.includes("audit")) {
      return {
        icon: Flag,
        action: "review",
        variant: "outline" as const,
        className: "",
      }
    }
    return {
      icon: Check,
      action: "apply",
      variant: "outline" as const,
      className: "",
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  return (
    <Button
      size="sm"
      variant={config.variant}
      className={cn("h-6 px-2 text-[10px] gap-1", config.className)}
      onClick={() => onAction?.(config.action)}
    >
      <Icon className="h-3 w-3" />
      {recommendedAction}
    </Button>
  )
}
