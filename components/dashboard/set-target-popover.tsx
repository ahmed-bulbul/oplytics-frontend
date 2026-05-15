"use client"

import { useState, useMemo, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Period = "monthly" | "quarterly" | "yearly"

interface SetTargetPopoverProps {
  children?: ReactNode
  metricLabel?: string
  defaultValue?: string
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

// Last period suggestion values per metric
const LAST_PERIOD_VALUES: Record<string, string> = {
  Revenue: "215,780",
  Orders: "1,289",
  "Ad Spend": "31,400",
  MER: "3.51",
  "Contribution Margin %": "58.6",
  AOV: "89.40",
  CPA: "25.90",
  CAC: "29.10",
  "New Customers": "834",
  Returning: "455",
}

function getDateRange(period: Period): { current: string; last: string } {
  // Use fixed reference date matching dashboard (Oct 2023)
  const now = new Date(2024, 0, 1) // Jan 2024 as "current"

  if (period === "monthly") {
    return {
      current: "Jan 01 - Jan 31, 2024",
      last: "Dec 01 - Dec 31, 2023",
    }
  }
  if (period === "quarterly") {
    return {
      current: "Jan 01 - Mar 31, 2024",
      last: "Oct 01 - Dec 31, 2023",
    }
  }
  return {
    current: "Jan 01 - Dec 31, 2024",
    last: "Jan 01 - Dec 31, 2023",
  }
}

const isCurrency = (label: string) =>
  ["Revenue", "Ad Spend", "AOV", "CPA", "CAC"].includes(label)
const isPercentage = (label: string) => label === "Contribution Margin %"
const isMultiplier = (label: string) => label === "MER"

function formatUnit(label: string) {
  if (isCurrency(label)) return "$"
  if (isPercentage(label)) return "%"
  if (isMultiplier(label)) return "x"
  return ""
}

export function SetTargetPopover({
  children,
  metricLabel = "Revenue",
  defaultValue = "",
}: SetTargetPopoverProps) {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<Period>("monthly")
  const [targetValue, setTargetValue] = useState(defaultValue || "")

  const dates = useMemo(() => getDateRange(period), [period])
  const lastPeriodValue = LAST_PERIOD_VALUES[metricLabel] ?? "—"
  const prefix = isCurrency(metricLabel) ? "$" : ""
  const suffix = isPercentage(metricLabel) ? "%" : isMultiplier(metricLabel) ? "x" : ""

  const handleApplySuggestion = () => {
    setTargetValue(lastPeriodValue.replace(/,/g, ""))
  }

  const handleSave = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            Set Target
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[340px] p-0"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div>
            <h4 className="text-base font-semibold text-foreground">
              Set {metricLabel} Target
            </h4>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-5">
          {/* Time Period */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time Period
            </p>
            <div className="flex rounded-lg border border-border bg-muted/40 p-1 gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                    period === p.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date range info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date Range
                </p>
                <p className="mt-0.5 text-sm text-foreground">{dates.current}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Period
                </p>
                <p className="mt-0.5 text-sm text-foreground">{dates.last}</p>
              </div>
            </div>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Value{isCurrency(metricLabel) ? " ($)" : isPercentage(metricLabel) ? " (%)" : isMultiplier(metricLabel) ? " (x)" : ""}
            </p>
            <div className="relative flex items-center rounded-lg border border-border bg-muted/40 px-4 py-3">
              {prefix && (
                <span className="mr-2 text-xl font-medium text-muted-foreground">
                  {prefix}
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-2xl font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              {suffix && (
                <span className="ml-1 text-xl font-medium text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {/* Last Period Suggestion */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Period
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {prefix}{lastPeriodValue}{suffix}
              </p>
            </div>
            <button
              onClick={handleApplySuggestion}
              className="text-xs font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Apply Suggestion
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
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
