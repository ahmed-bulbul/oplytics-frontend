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
  ACTION_CENTER_METRICS,
  DEFAULT_VISIBLE_METRIC_IDS,
  METRIC_GROUP_LABELS,
  type ActionCenterMetric,
  type MetricGroup,
} from "./action-center-metrics"

interface ActionCenterColumnPickerProps {
  visibleMetricIds: string[]
  onChange: (ids: string[]) => void
}

/**
 * Sectioned column picker for the Action Center table. Toggling a metric
 * preserves the canonical column order from `ACTION_CENTER_METRICS` so the
 * visible columns always render left-to-right in the same order, regardless
 * of the order the user clicked them.
 */
export function ActionCenterColumnPicker({
  visibleMetricIds,
  onChange,
}: ActionCenterColumnPickerProps) {
  const visibleSet = new Set(visibleMetricIds)

  const toggle = (id: string) => {
    const next = new Set(visibleSet)
    if (next.has(id)) {
      // Don't allow zero metric columns — operators always need at least
      // one numeric column to anchor their scan.
      if (next.size > 1) next.delete(id)
    } else {
      next.add(id)
    }
    onChange(
      ACTION_CENTER_METRICS.filter((m) => next.has(m.id)).map((m) => m.id),
    )
  }

  // Group while preserving the registry order so the picker mirrors the
  // table's natural column order.
  const grouped = ACTION_CENTER_METRICS.reduce<Record<MetricGroup, ActionCenterMetric[]>>(
    (acc, m) => {
      ;(acc[m.group] ??= []).push(m)
      return acc
    },
    {} as Record<MetricGroup, ActionCenterMetric[]>,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Columns</span>
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
            onClick={() => onChange(DEFAULT_VISIBLE_METRIC_IDS)}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-1">
          {(Object.keys(grouped) as MetricGroup[]).map((group) => (
            <div key={group} className="px-1 py-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {METRIC_GROUP_LABELS[group]}
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
