"use client"

import { cn } from "@/lib/utils"
import { HealthStatus, healthStatusConfig } from "./types"

interface ManageStatusPillProps {
  status: HealthStatus
  className?: string
}

export function ManageStatusPill({ status, className }: ManageStatusPillProps) {
  const config = healthStatusConfig[status]
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
