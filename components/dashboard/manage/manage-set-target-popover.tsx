"use client"

import { useState, useMemo, type ReactNode } from "react"
import { X, Target, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Period = "1d" | "7d" | "14d" | "30d"

interface ManageSetTargetPopoverProps {
  trigger?: ReactNode
  itemId: string
  itemName: string
  onSave?: (data: { metricId: string; targetValue: string; period: Period }) => void
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "1d", label: "1 Day" },
  { value: "7d", label: "7 Day" },
  { value: "14d", label: "14 Day" },
  { value: "30d", label: "30 Day" },
]

// Available metrics for targeting
const METRICS = [
  { id: "roas", label: "ROAS", type: "multiplier", lastValue: "3.2" },
  { id: "cpa", label: "CPA", type: "currency", lastValue: "24.50" },
  { id: "ctr", label: "CTR", type: "percentage", lastValue: "2.8" },
  { id: "spend", label: "Daily Spend", type: "currency", lastValue: "450" },
  { id: "conversions", label: "Conversions", type: "number", lastValue: "125" },
  { id: "cpc", label: "CPC", type: "currency", lastValue: "1.85" },
  { id: "impressions", label: "Impressions", type: "number", lastValue: "45000" },
  { id: "revenue", label: "Revenue", type: "currency", lastValue: "12500" },
]

function getDateRange(period: Period): { current: string; last: string } {
  const today = new Date()
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
  
  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "14d" ? 14 : 30
  const currentEnd = today
  const currentStart = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  const lastEnd = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000)
  const lastStart = new Date(lastEnd.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  
  return {
    current: `${formatDate(currentStart)} - ${formatDate(currentEnd)}`,
    last: `${formatDate(lastStart)} - ${formatDate(lastEnd)}`,
  }
}

function getPrefix(type: string) {
  return type === "currency" ? "$" : ""
}

function getSuffix(type: string) {
  if (type === "percentage") return "%"
  if (type === "multiplier") return "x"
  return ""
}

export function ManageSetTargetPopover({
  trigger,
  itemId,
  itemName,
  onSave,
}: ManageSetTargetPopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].id)
  const [period, setPeriod] = useState<Period>("7d")
  const [targetValue, setTargetValue] = useState("")

  const metric = METRICS.find((m) => m.id === selectedMetric) || METRICS[0]
  const dates = useMemo(() => getDateRange(period), [period])
  const prefix = getPrefix(metric.type)
  const suffix = getSuffix(metric.type)

  const handleApplySuggestion = () => {
    setTargetValue(metric.lastValue.replace(/,/g, ""))
  }

  const handleSave = () => {
    onSave?.({ metricId: selectedMetric, targetValue, period })
    setOpen(false)
    setTargetValue("")
  }

  const handleCancel = () => {
    setOpen(false)
    setTargetValue("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Set Target
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[360px] p-0"
        align="end"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Set Target Override
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[260px]">
              {itemName}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Metric Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select Metric
            </label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Period */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Time Period
            </label>
            <div className="flex rounded-lg border border-border bg-muted/40 p-1 gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-xs font-medium transition-all",
                    period === p.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Target Value
            </label>
            <div className="relative flex items-center rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              {prefix && (
                <span className="mr-2 text-lg font-medium text-muted-foreground">
                  {prefix}
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              {suffix && (
                <span className="ml-1 text-lg font-medium text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {/* Last Period Suggestion */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Last Period Value
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {prefix}{metric.lastValue}{suffix}
              </p>
            </div>
            <button
              onClick={handleApplySuggestion}
              className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Use as Target
            </button>
          </div>

          {/* Info text */}
          <p className="text-[10px] text-muted-foreground">
            This target will override the global dashboard target for this specific item and will be used for AI recommendations.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!targetValue}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Save Target
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
