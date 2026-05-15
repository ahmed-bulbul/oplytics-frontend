"use client"

import { useState } from "react"
import { Settings2, GripVertical, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MetricOption {
  id: string
  label: string
}

interface MetricSelectorProps {
  availableMetrics: MetricOption[]
  selectedMetricIds: string[]
  onSelectionChange: (ids: string[]) => void
  maxVisible?: number
}

export function MetricSelector({
  availableMetrics,
  selectedMetricIds,
  onSelectionChange,
  maxVisible = 10,
}: MetricSelectorProps) {
  const [open, setOpen] = useState(false)

  const toggleMetric = (id: string) => {
    if (selectedMetricIds.includes(id)) {
      // Don't allow deselecting if only 1 is selected
      if (selectedMetricIds.length > 1) {
        onSelectionChange(selectedMetricIds.filter((m) => m !== id))
      }
    } else {
      // Don't allow selecting more than maxVisible
      if (selectedMetricIds.length < maxVisible) {
        onSelectionChange([...selectedMetricIds, id])
      }
    }
  }

  const selectAll = () => {
    onSelectionChange(availableMetrics.slice(0, maxVisible).map((m) => m.id))
  }

  const selectDefault = () => {
    onSelectionChange(availableMetrics.slice(0, 10).map((m) => m.id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs md:gap-2 md:text-sm">
          <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Customize</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Customize Metrics</p>
              <p className="text-xs text-muted-foreground">
                Select up to {maxVisible} metrics to display
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {selectedMetricIds.length}/{maxVisible}
            </span>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {availableMetrics.map((metric) => {
            const isSelected = selectedMetricIds.includes(metric.id)
            const isDisabled = !isSelected && selectedMetricIds.length >= maxVisible

            return (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                disabled={isDisabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "text-foreground hover:bg-muted",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1">{metric.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={selectDefault}
          >
            Reset to default
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
