"use client"

import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-600",
  Moderate: "bg-amber-500/10 text-amber-600",
  High: "bg-rose-500/10 text-rose-600",
  Critical: "bg-rose-500/15 text-rose-700",
}

interface StockoutRiskPillProps {
  risk: "Low" | "Moderate" | "High" | "Critical"
  className?: string
}

export function StockoutRiskPill({ risk, className }: StockoutRiskPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        styles[risk] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {risk}
    </span>
  )
}
