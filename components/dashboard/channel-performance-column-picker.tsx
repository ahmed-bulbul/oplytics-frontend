"use client"

import { Settings2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  CHANNEL_PERFORMANCE_METRICS,
  CHANNEL_METRIC_GROUP_LABELS,
  DEFAULT_VISIBLE_CHANNEL_METRIC_IDS,
  type ChannelPerformanceMetric,
  type ChannelMetricGroup,
} from "./channel-performance-metrics"

interface ChannelPerformanceColumnPickerProps {
  visibleMetricIds: string[]
  onChange: (ids: string[]) => void
}

/**
 * Sectioned "Customize columns" popover for the Channel Performance table.
 * Mirrors the Action Center picker pattern so operators get a consistent
 * mental model across the two tables. Toggling preserves the canonical
 * registry order so the column layout stays predictable.
 */
export function ChannelPerformanceColumnPicker({
  visibleMetricIds,
  onChange,
}: ChannelPerformanceColumnPickerProps) {
  const visibleSet = new Set(visibleMetricIds)

  const toggle = (id: string) => {
    const next = new Set(visibleSet)
    if (next.has(id)) {
      // Always keep at least one column visible so the table doesn't
      // collapse into a row of names with no metrics next to them.
      if (next.size > 1) next.delete(id)
    } else {
      next.add(id)
    }
    onChange(
      CHANNEL_PERFORMANCE_METRICS.filter((m) => next.has(m.id)).map((m) => m.id),
    )
  }

  const grouped = CHANNEL_PERFORMANCE_METRICS.reduce<
    Record<ChannelMetricGroup, ChannelPerformanceMetric[]>
  >(
    (acc, m) => {
      ;(acc[m.group] ??= []).push(m)
      return acc
    },
    {} as Record<ChannelMetricGroup, ChannelPerformanceMetric[]>,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Customize columns</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums leading-none">
            {visibleMetricIds.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-start justify-between gap-3 border-b border-border p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Customize columns</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick which metrics appear in the table.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onChange(DEFAULT_VISIBLE_CHANNEL_METRIC_IDS)}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-1">
          {(Object.keys(grouped) as ChannelMetricGroup[]).map((group) => (
            <div key={group} className="px-1 py-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {CHANNEL_METRIC_GROUP_LABELS[group]}
              </p>
              <div className="flex flex-col">
                {grouped[group].map((metric) => {
                  const checked = visibleSet.has(metric.id)
                  const lockUncheck = checked && visibleSet.size === 1
                  return (
                    <label
                      key={metric.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                        lockUncheck && "cursor-not-allowed opacity-70",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(metric.id)}
                        disabled={lockUncheck}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium leading-tight">
                          {metric.label}
                        </p>
                        {metric.description && (
                          <p className="text-xs text-muted-foreground">
                            {metric.description}
                          </p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
