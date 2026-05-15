"use client"

import {
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
  ComposedChart,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useDateRange } from "@/context/date-range-context"

// ── chart config ───────────────────────────────────────────────────────────────

const chartConfig = {
  actual: {
    label: "Current Period",
    color: "oklch(0.65 0.2 145)",
  },
  target: {
    label: "Target",
    color: "oklch(0.7 0 0)",
  },
  compare: {
    label: "Previous Period",
    color: "oklch(0.6 0.15 280)",
  },
} satisfies ChartConfig

// ── props ─────────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  /** X-axis label, e.g. "Jan 5" */
  day: string
  /** Current period value */
  actual: number
  /** Compare period value — rendered as a dashed line when compareEnabled */
  compare?: number
}

interface RevenueChartProps {
  /** Label used in the chart card header (display only, no internal logic) */
  selectedMetric?: string
  /** Daily data points to plot */
  data: ChartDataPoint[]
  /** Y-axis tick + tooltip value formatter */
  formatter?: (v: number) => string
  /** Optional target / goal value drawn as a horizontal reference line */
  targetValue?: number
}

// ── component ─────────────────────────────────────────────────────────────────

export function RevenueChart({
  data,
  formatter = (v) => v.toString(),
  targetValue,
}: RevenueChartProps) {
  const { compareEnabled } = useDateRange()

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.3 0 0)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
          tickFormatter={formatter}
          width={55}
        />
        <ChartTooltip content={<ChartTooltipContent />} />

        {targetValue !== undefined && (
          <ReferenceLine
            y={targetValue}
            stroke="oklch(0.5 0 0)"
            strokeDasharray="5 5"
            label={{ value: "Target", fill: "oklch(0.6 0 0)", fontSize: 10 }}
          />
        )}

        {/* Dashed target area (kept for backward-compat when caller passes target key) */}
        <Area
          type="monotone"
          dataKey="target"
          stroke="var(--color-target)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Main area — current period */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="var(--color-actual)"
          strokeWidth={2}
          fill="url(#fillActual)"
        />

        {/* Compare line — previous / comparison period */}
        {compareEnabled && (
          <Line
            type="monotone"
            dataKey="compare"
            stroke="var(--color-compare)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
        )}
      </ComposedChart>
    </ChartContainer>
  )
}
