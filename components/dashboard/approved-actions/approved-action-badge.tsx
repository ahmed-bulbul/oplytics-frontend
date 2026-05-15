import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Format an ISO timestamp as a short relative string for the submitted
 * pill: "just now", "2m ago", "3h ago", "2d ago". Anything older than
 * a week falls back to a short absolute date so operators get a sense
 * of recency without parsing distant timestamps.
 */
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 45) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export type ApprovedActionBadgeVariant = "available" | "submitted" | "failed"

/**
 * Status pill that summarizes where an executable draft sits in its
 * lifecycle. Used inline on Action Center rows, in the row drawer's
 * Suggested Next Step block, and on AI Assistant cards.
 *
 * - available: the draft has not been submitted yet (default state)
 * - submitted: a matching log entry exists (success or queued); shows
 *   relative time so operators can see at a glance how recent the
 *   change was
 * - failed: most recent matching log entry failed; the surface should
 *   typically pair this with a Retry button
 */
export function ApprovedActionBadge({
  className,
  size = "sm",
  variant = "available",
  timestamp,
}: {
  className?: string
  /** sm: inline cells, xs: very tight headers. */
  size?: "xs" | "sm"
  variant?: ApprovedActionBadgeVariant
  /**
   * ISO timestamp for the submitted variant. Rendered as a short
   * relative string ("2m ago") next to the label.
   */
  timestamp?: string
}) {
  const sizeClass = cn(
    size === "xs" && "px-1.5 py-0.5 text-[9px]",
    size === "sm" && "px-2 py-0.5 text-[10px]",
  )
  const iconClass = size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"

  if (variant === "submitted") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/12 font-medium text-emerald-700 dark:text-emerald-400",
          sizeClass,
          className,
        )}
        title="This recommended action has been submitted to the platform."
      >
        <CheckCircle2 className={iconClass} aria-hidden="true" />
        <span>Submitted</span>
        {timestamp && (
          <span className="font-normal text-emerald-700/70 dark:text-emerald-400/70">
            · {formatRelative(timestamp)}
          </span>
        )}
      </span>
    )
  }

  if (variant === "failed") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 font-medium text-rose-700 dark:text-rose-400",
          sizeClass,
          className,
        )}
        title="The last submission for this action failed. You can retry from the preview."
      >
        <AlertCircle className={iconClass} aria-hidden="true" />
        Submission failed
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400",
        sizeClass,
        className,
      )}
      title="This recommendation can be approved and executed from Optilytics."
    >
      <ShieldCheck className={iconClass} aria-hidden="true" />
      Approved action available
    </span>
  )
}
