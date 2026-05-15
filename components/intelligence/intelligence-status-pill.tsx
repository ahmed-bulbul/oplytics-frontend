"use client"

import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  // Creative
  Scaling: "bg-emerald-500/10 text-emerald-600",
  Healthy: "bg-emerald-500/10 text-emerald-600",
  Fatiguing: "bg-amber-500/10 text-amber-600",
  "Needs Review": "bg-amber-500/10 text-amber-600",
  Underperforming: "bg-rose-500/10 text-rose-600",
  // Product
  Profitable: "bg-emerald-500/10 text-emerald-600",
  "Strong LTV": "bg-emerald-500/10 text-emerald-600",
  "Low Margin": "bg-amber-500/10 text-amber-600",
  "Needs COGS": "bg-amber-500/10 text-amber-600",
  "High Refunds": "bg-rose-500/10 text-rose-600",
  Watch: "bg-slate-500/10 text-slate-600",
  "Stockout Risk": "bg-rose-500/10 text-rose-600",
  // Cohort
  "Slow Payback": "bg-amber-500/10 text-amber-600",
  "High Churn": "bg-rose-500/10 text-rose-600",
  // Subscription
  "At Risk": "bg-rose-500/10 text-rose-600",
  Stable: "bg-emerald-500/10 text-emerald-600",
  // Stockout risk levels (when used as status pill)
  Critical: "bg-rose-500/10 text-rose-600",
  Moderate: "bg-amber-500/10 text-amber-600",
  // Attribution confidence
  High: "bg-emerald-500/10 text-emerald-600",
  Medium: "bg-amber-500/10 text-amber-600",
  Low: "bg-rose-500/10 text-rose-600",
}

interface IntelligenceStatusPillProps {
  status: string
  className?: string
}

export function IntelligenceStatusPill({ status, className }: IntelligenceStatusPillProps) {
  const style = statusStyles[status] ?? "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}
