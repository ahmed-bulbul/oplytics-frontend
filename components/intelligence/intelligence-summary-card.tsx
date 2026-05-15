"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricDefinition } from "@/components/dashboard/metric-definition"

interface IntelligenceSummaryCardProps {
  label: string
  value: string
  caption?: string
  icon?: LucideIcon
  tone?: "default" | "positive" | "warning" | "negative"
  footer?: ReactNode
  /**
   * When provided, renders the metric-definition info icon next to the label.
   * Should match a key in the MetricDefinition glossary (e.g. "MER", "Payback").
   */
  metricKey?: string
}

const toneStyles: Record<NonNullable<IntelligenceSummaryCardProps["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-emerald-600",
  warning: "text-amber-600",
  negative: "text-rose-600",
}

const iconBgStyles: Record<NonNullable<IntelligenceSummaryCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  positive: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  negative: "bg-rose-500/10 text-rose-600",
}

export function IntelligenceSummaryCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "default",
  footer,
  metricKey,
}: IntelligenceSummaryCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {metricKey && <MetricDefinition metric={metricKey} />}
        </div>
        {Icon && (
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", iconBgStyles[tone])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className={cn("text-lg font-semibold tracking-tight md:text-xl", toneStyles[tone])}>
        {value}
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground leading-relaxed">{caption}</p>
      )}
      {footer && <div className="mt-1 border-t border-border pt-2">{footer}</div>}
    </div>
  )
}
