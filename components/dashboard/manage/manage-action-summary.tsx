"use client"

import { AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Unified filter buckets that line up 1:1 with the Insights panel's
 * three columns. Each chip / column / row-status share the same color
 * language so operators see one consistent mental model:
 *
 *   - attention → rose    → critical + watch rows
 *   - scale     → blue    → opportunity rows
 *   - healthy   → emerald → healthy rows
 */
export type SummaryFilter = "attention" | "scale" | "healthy" | null

interface ActionSummaryProps {
  attention: number
  scale: number
  healthy: number
  estimatedSavings: string
  estimatedGrowth: string
  activeFilter?: SummaryFilter
  onFilterChange?: (filter: SummaryFilter) => void
}

interface SummaryItem {
  id: NonNullable<SummaryFilter>
  icon: typeof AlertTriangle
  label: string
  count: number
  /** Sub-line that contextualizes the chip with a dollar tally. */
  detail: string
  /** Color classes — match the Insights column headers. */
  iconColor: string
  borderActive: string
  ringActive: string
  bgIcon: string
}

export function ManageActionSummary({
  attention,
  scale,
  healthy,
  estimatedSavings,
  estimatedGrowth,
  activeFilter,
  onFilterChange,
}: ActionSummaryProps) {
  const items: SummaryItem[] = [
    {
      id: "attention",
      icon: AlertTriangle,
      label: "Need attention",
      count: attention,
      detail: `${estimatedSavings} at risk`,
      iconColor: "text-rose-600 dark:text-rose-400",
      borderActive: "border-rose-500 dark:border-rose-400",
      ringActive: "ring-rose-500/20",
      bgIcon: "bg-rose-500/10",
    },
    {
      id: "scale",
      icon: TrendingUp,
      label: "Can scale",
      count: scale,
      detail: `${estimatedGrowth} potential`,
      iconColor: "text-blue-600 dark:text-blue-400",
      borderActive: "border-blue-500 dark:border-blue-400",
      ringActive: "ring-blue-500/20",
      bgIcon: "bg-blue-500/10",
    },
    {
      id: "healthy",
      icon: ShieldCheck,
      label: "On track",
      count: healthy,
      detail: "Watch for slips",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderActive: "border-emerald-500 dark:border-emerald-400",
      ringActive: "ring-emerald-500/20",
      bgIcon: "bg-emerald-500/10",
    },
  ]

  const handleClick = (id: SummaryFilter) => {
    if (!onFilterChange) return
    // Toggle: clicking the active chip clears the filter.
    onFilterChange(activeFilter === id ? null : id)
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeFilter === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            aria-pressed={isActive}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all",
              "hover:bg-accent/50",
              isActive
                ? cn("ring-1", item.borderActive, item.ringActive)
                : "border-border",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                item.bgIcon,
              )}
            >
              <Icon className={cn("h-4 w-4", item.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {item.count}
                </span>
                <span className="truncate text-xs font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {item.detail}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
