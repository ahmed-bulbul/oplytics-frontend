"use client"

import { cn } from "@/lib/utils"
import { HealthStatus } from "./types"

interface ManageReasonCellProps {
  reason: string
  status: HealthStatus
  className?: string
}

export function ManageReasonCell({ reason, status, className }: ManageReasonCellProps) {
  const statusColors: Record<HealthStatus, string> = {
    healthy: "text-muted-foreground",
    watch: "text-amber-600/80",
    critical: "text-rose-600/80",
    opportunity: "text-blue-600/80",
  }

  return (
    <p className={cn("text-[11px] leading-snug max-w-[200px] truncate", statusColors[status], className)}>
      {reason}
    </p>
  )
}
