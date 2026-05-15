"use client"

import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type BenchmarkTone = "better" | "in-line" | "worse"

interface BenchmarkCalloutProps {
  /** The metric value being compared, e.g. "$31.10" or "8.4%" */
  value: string
  /** What this metric is, e.g. "CAC", "Refund rate" */
  metricLabel?: string
  /** A short comparison sentence, e.g. "8% better than similar stores with $75–$100 AOV" */
  comparison: string
  /** Whether the result is better, in-line, or worse than benchmark */
  tone?: BenchmarkTone
  /** Source descriptor: "Demo benchmark", "Coming soon", or a real source name */
  source?: string
  className?: string
}

/**
 * A small inline callout that compares a metric to a peer/category benchmark.
 *
 * IMPORTANT: We label every callout as a demo benchmark by default, since
 * Optilytics does not yet have a proprietary benchmarking dataset. This avoids
 * implying real benchmark data exists.
 */
export function BenchmarkCallout({
  value,
  metricLabel,
  comparison,
  tone = "in-line",
  source = "Demo benchmark",
  className,
}: BenchmarkCalloutProps) {
  const Icon = tone === "better" ? ArrowDown : tone === "worse" ? ArrowUp : Minus
  const toneClasses =
    tone === "better"
      ? "text-emerald-600 bg-emerald-500/5 border-emerald-500/20"
      : tone === "worse"
        ? "text-rose-600 bg-rose-500/5 border-rose-500/20"
        : "text-muted-foreground bg-muted/40 border-border"

  return (
    <div
      className={cn(
        "rounded-md border p-2.5 text-xs",
        toneClasses,
        className,
      )}
    >
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 opacity-60" />
          <span className="text-[10px] uppercase tracking-wider opacity-70">
            {metricLabel ?? "Benchmark"}
          </span>
        </div>
        <span className="rounded bg-background/60 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider opacity-70">
          {source}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold tabular-nums">{value}</span>
        <span className="flex items-center gap-1 text-[11px] leading-relaxed opacity-90">
          <Icon className="h-3 w-3 shrink-0" />
          {comparison}
        </span>
      </div>
    </div>
  )
}
