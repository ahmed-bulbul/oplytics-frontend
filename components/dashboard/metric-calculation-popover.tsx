"use client"

import { Info } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Lightweight popover that explains how a metric is calculated.
 *
 * Click-based (not hover) so it:
 *   - Works reliably on touch devices.
 *   - Stays open while operators read the formula.
 *   - Plays well inside table headers / drawer rows where hover would
 *     fight with sortable / clickable parent elements.
 *
 * The trigger is a small Info icon styled to look like an inline glyph
 * next to a column label. We stop click propagation on both the trigger
 * and the content so opening the popover does not trigger any
 * surrounding sort / row-toggle handlers.
 */
export interface MetricCalculationPopoverProps {
  /** The metric's display label — used as the popover's heading. */
  label: string
  /** Plain-language explanation of what the metric measures. */
  description?: string
  /** Concise formula or definition rendered in a mono-font tile. */
  formula?: string
  /** Free-form notes to surface caveats / benchmarks under the formula. */
  notes?: string
  /** Short source tag rendered as a chip (e.g. "Shopify", "Meta"). */
  source?: string
  /** Longer description of the source surfaced under the chip. */
  sourceDescription?: string
  /** Allow callers to tweak trigger styling (e.g. add text-right). */
  className?: string
}

export function MetricCalculationPopover({
  label,
  description,
  formula,
  notes,
  source,
  sourceDescription,
  className,
}: MetricCalculationPopoverProps) {
  // If we have nothing useful to render, don't add visual noise.
  if (!description && !formula && !notes && !source) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center text-muted-foreground/50 transition-colors",
            "hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
            className,
          )}
          aria-label={`How ${label} is calculated`}
        >
          <Info className="h-3 w-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        onClick={(e) => e.stopPropagation()}
        className="w-72 space-y-3 p-4"
      >
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {description && (
            <p className="text-sm leading-relaxed text-foreground">
              {description}
            </p>
          )}
        </div>

        {formula && (
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Formula
            </p>
            <p className="font-mono text-xs leading-relaxed text-foreground">
              {formula}
            </p>
          </div>
        )}

        {notes && (
          <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
            {notes}
          </p>
        )}

        {source && (
          <div className="space-y-1 border-t border-border pt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                Source
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                {source}
              </span>
            </div>
            {sourceDescription && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {sourceDescription}
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
