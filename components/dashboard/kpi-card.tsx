"use client"

import { cn } from "@/lib/utils"
import { SetTargetPopover } from "@/components/dashboard/set-target-popover"
import { MetricDefinition } from "@/components/dashboard/metric-definition"

interface KPICardProps {
  label: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  target?: { label: string; progress: number }
  sparklineData?: number[]
  isSelected?: boolean
  onClick?: () => void
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 24
  const width = 48
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KPICard({
  label,
  value,
  change,
  changeType,
  target,
  sparklineData,
  isSelected,
  onClick,
}: KPICardProps) {
  const sparklineColor =
    changeType === "positive"
      ? "#10b981"
      : changeType === "negative"
        ? "#ef4444"
        : "#9ca3af"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50",
        isSelected && "ring-2 ring-emerald-500 border-emerald-500"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <MetricDefinition metric={label} />
        </div>
        {sparklineData && (
          <Sparkline data={sparklineData} color={sparklineColor} />
        )}
      </div>
      <span className="text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span
        className={cn(
          "text-xs",
          changeType === "positive" && "text-emerald-500",
          changeType === "negative" && "text-red-500",
          changeType === "neutral" && "text-muted-foreground"
        )}
      >
        {change}
      </span>

      {/* Goal section — clicking here opens the Set Target popover without selecting the card */}
      <SetTargetPopover metricLabel={label} defaultValue={target ? target.label.replace(/[^0-9.]/g, "") : ""}>
        <div
          className={cn(
            "mt-2 w-full text-left",
            target
              ? "space-y-1"
              : "group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          )}
          onClick={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
          aria-label={`Set goal for ${label}`}
        >
          {target ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors underline-offset-2 hover:underline">
                  {target.label}
                </span>
                <span className="font-medium text-foreground">{target.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    target.progress >= 100 ? "bg-emerald-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min(target.progress, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <span className="underline-offset-2 group-hover:underline">
              + Set goal
            </span>
          )}
        </div>
      </SetTargetPopover>
    </div>
  )
}
