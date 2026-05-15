"use client"

import { useMemo, useState } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MetricKind = "currency" | "count" | "rate-x" | "rate-pct"

interface MetricSpec {
  label: string
  current: number
  forecast: number
  target: number
  status: string
  kind: MetricKind
  /**
   * For currency/count metrics this is cumulative MTD (so the line ramps
   * upward to match the table values). For rates it is the rolling daily value.
   */
  cumulative: boolean
}

const TOTAL_DAYS = 30
const ACTUAL_DAYS = 8 // current MTD reflects ~day 8 of the month

const METRICS: Record<string, MetricSpec> = {
  "Net Revenue": {
    label: "Net Revenue",
    current: 126840,
    forecast: 482000,
    target: 500000,
    status: "Watch",
    kind: "currency",
    cumulative: true,
  },
  "Contribution Margin": {
    label: "Contribution Margin",
    current: 75146,
    forecast: 286000,
    target: 300000,
    status: "Behind",
    kind: "currency",
    cumulative: true,
  },
  "Ad Spend": {
    label: "Ad Spend",
    current: 34200,
    forecast: 132000,
    target: 140000,
    status: "On Track",
    kind: "currency",
    cumulative: true,
  },
  CAC: {
    label: "CAC",
    current: 31.10,
    forecast: 32.40,
    target: 30.00,
    status: "Watch",
    kind: "currency",
    cumulative: false,
  },
  MER: {
    label: "MER",
    current: 3.75,
    forecast: 3.65,
    target: 3.50,
    status: "Ahead",
    kind: "rate-x",
    cumulative: false,
  },
  "Refund Rate": {
    label: "Refund Rate",
    current: 3.4,
    forecast: 3.6,
    target: 2.5,
    status: "Critical",
    kind: "rate-pct",
    cumulative: false,
  },
}

function formatValue(kind: MetricKind, v: number): string {
  if (kind === "currency") {
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${v.toFixed(2)}`
  }
  if (kind === "count") return Math.round(v).toLocaleString()
  if (kind === "rate-x") return `${v.toFixed(2)}x`
  return `${v.toFixed(1)}%`
}

function formatValueDetailed(kind: MetricKind, v: number): string {
  if (kind === "currency") {
    if (v >= 10000) {
      return `$${Math.round(v).toLocaleString()}`
    }
    return `$${v.toFixed(2)}`
  }
  if (kind === "count") return Math.round(v).toLocaleString()
  if (kind === "rate-x") return `${v.toFixed(2)}x`
  return `${v.toFixed(2)}%`
}

interface ChartPoint {
  day: number
  dayLabel: string
  actual: number | null
  forecast: number | null
  forecastLow: number | null
  forecastRange: [number, number] | null
  targetPace: number | null
}

/**
 * Builds a per-day series for the selected metric. Actuals fill days 1..ACTUAL_DAYS
 * landing on the table's current MTD value. Forecast continues from that handoff
 * point to the table's month-end forecast value, with a widening confidence band.
 */
function buildSeries(metric: MetricSpec): ChartPoint[] {
  const points: ChartPoint[] = []
  const cutover = ACTUAL_DAYS

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    let actual: number | null = null
    let forecast: number | null = null
    let forecastLow: number | null = null
    let forecastRange: [number, number] | null = null
    let targetPace: number | null = null

    if (metric.cumulative) {
      // Cumulative metrics ramp up from 0 to current at cutover, then to forecast at end.
      if (day <= cutover) {
        // Light, deterministic noise around a linear ramp to current MTD
        const t = day / cutover
        const noise = Math.sin(day * 1.3) * 0.02
        actual = Math.max(0, metric.current * (t + noise))
      }
      if (day === cutover) {
        forecast = actual
        forecastLow = actual
        forecastRange = [actual ?? 0, actual ?? 0]
      }
      if (day > cutover) {
        const t = (day - cutover) / (TOTAL_DAYS - cutover)
        const projected = metric.current + (metric.forecast - metric.current) * t
        forecast = projected
        // Band widens linearly from ±2% at cutover to ±10% at month-end
        const widthPct = 0.02 + 0.08 * t
        const low = projected * (1 - widthPct)
        const high = projected * (1 + widthPct)
        forecastLow = low
        forecastRange = [low, high]
      }
      // Target pace is a straight line from 0 to target across the month
      targetPace = (metric.target * day) / TOTAL_DAYS
    } else {
      // Rate metrics oscillate around current value, then drift to forecast value.
      if (day <= cutover) {
        const noise = Math.sin(day * 1.7) * (metric.current * 0.04)
        actual = metric.current + noise
      }
      if (day === cutover) {
        forecast = actual
        forecastLow = actual
        forecastRange = [actual ?? metric.current, actual ?? metric.current]
      }
      if (day > cutover) {
        const t = (day - cutover) / (TOTAL_DAYS - cutover)
        const projected = metric.current + (metric.forecast - metric.current) * t
        forecast = projected
        const widthPct = 0.03 + 0.09 * t
        const low = projected * (1 - widthPct)
        const high = projected * (1 + widthPct)
        forecastLow = low
        forecastRange = [low, high]
      }
      // Target line is the goal value (flat horizontal — the daily target).
      targetPace = metric.target
    }

    points.push({
      day,
      dayLabel: `Day ${day}`,
      actual,
      forecast,
      forecastLow,
      forecastRange,
      targetPace,
    })
  }
  return points
}

const chartConfig = {
  actual: {
    label: "Actual",
    color: "oklch(0.65 0.18 230)", // primary blue
  },
  forecast: {
    label: "Forecast",
    color: "oklch(0.72 0.18 50)", // orange
  },
  forecastRange: {
    label: "Forecast range",
    color: "oklch(0.72 0.18 50)",
  },
  targetPace: {
    label: "Target pace",
    color: "oklch(0.55 0 0)",
  },
} satisfies ChartConfig

interface TooltipPayloadEntry {
  payload: ChartPoint
}

function ForecastTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  metric: MetricSpec
}) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  const isActual = point.actual !== null && point.forecast === null
  const isHandoff = point.actual !== null && point.forecast !== null

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            isActual || isHandoff ? "bg-sky-500" : "bg-orange-500"
          }`}
        />
        <span className="font-medium text-foreground">
          {isActual || isHandoff ? "Actual" : "Forecast"} · {point.dayLabel}
        </span>
      </div>

      {point.actual !== null && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Actual</span>
          <span className="font-mono text-foreground">
            {formatValueDetailed(metric.kind, point.actual)}
          </span>
        </div>
      )}

      {point.forecast !== null && point.actual === null && (
        <>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Forecast</span>
            <span className="font-mono text-foreground">
              {formatValueDetailed(metric.kind, point.forecast)}
            </span>
          </div>
          {point.forecastRange && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Range</span>
              <span className="font-mono text-foreground">
                {formatValueDetailed(metric.kind, point.forecastRange[0])} –{" "}
                {formatValueDetailed(metric.kind, point.forecastRange[1])}
              </span>
            </div>
          )}
        </>
      )}

      {point.targetPace !== null && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">
            {metric.cumulative ? "Target pace" : "Target"}
          </span>
          <span className="font-mono text-muted-foreground">
            {formatValueDetailed(metric.kind, point.targetPace)}
          </span>
        </div>
      )}

      <div className="mt-1.5 border-t border-border pt-1.5 text-[10px] text-muted-foreground">
        Measurement: Shopify Blended
      </div>
    </div>
  )
}

export function ForecastTrendChart() {
  const [selectedMetric, setSelectedMetric] = useState<string>("Net Revenue")
  const metric = METRICS[selectedMetric]

  const data = useMemo(() => buildSeries(metric), [metric])

  return (
    <div className="space-y-3 border-b border-border p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Forecasted {metric.label}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Actual performance to date with projected month-end range based on current pace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Metric</span>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(METRICS).map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full md:h-[320px]">
        <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-forecast)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--color-forecast)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.3 0 0)" />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
            tickFormatter={(v) => `${v}`}
            interval={3}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
            tickFormatter={(v) => formatValue(metric.kind, v)}
            width={60}
            domain={["auto", "auto"]}
          />

          <ChartTooltip content={<ForecastTooltip metric={metric} />} cursor={{ stroke: "oklch(0.4 0 0)" }} />

          {/* Confidence band */}
          <Area
            type="monotone"
            dataKey="forecastRange"
            stroke="none"
            fill="url(#forecastBandGradient)"
            isAnimationActive={false}
          />

          {/* Target reference line */}
          {metric.cumulative ? (
            <ReferenceLine
              y={metric.target}
              stroke="oklch(0.55 0 0)"
              strokeDasharray="5 5"
              label={{
                value: `Target ${formatValue(metric.kind, metric.target)}`,
                fill: "oklch(0.65 0 0)",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          ) : (
            <ReferenceLine
              y={metric.target}
              stroke="oklch(0.55 0 0)"
              strokeDasharray="5 5"
              label={{
                value: `Target ${formatValue(metric.kind, metric.target)}`,
                fill: "oklch(0.65 0 0)",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          )}

          {/* Forecast begins marker */}
          <ReferenceLine
            x={ACTUAL_DAYS}
            stroke="oklch(0.55 0 0)"
            strokeDasharray="3 3"
            label={{
              value: "Forecast begins",
              fill: "oklch(0.65 0 0)",
              fontSize: 10,
              position: "top",
            }}
          />

          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="var(--color-forecast)"
            strokeWidth={2.25}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>

      {/* Legend + helper copy */}
      <div className="flex flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded-full bg-sky-500" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3 rounded-full"
              style={{ background: "oklch(0.72 0.18 50)" }}
            />
            Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-3 rounded-sm opacity-60"
              style={{ background: "oklch(0.72 0.18 50 / 0.18)" }}
            />
            Range
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 border-t-[1.5px] border-dashed border-muted-foreground/70" />
            Target
          </span>
        </div>
        <span className="text-muted-foreground">x-axis: day of month</span>
      </div>

      <p className="rounded-md border border-border bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">How to read this forecast:</span>{" "}
        Actual performance is shown through the latest synced day. Forecasted values are projected
        from current pace and assumptions. The shaded area represents the expected range, not a
        guarantee.
      </p>
    </div>
  )
}
