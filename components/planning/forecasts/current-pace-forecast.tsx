"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlanningStatusPill } from "../planning-status-pill"
import { ForecastTrendChart } from "./forecast-trend-chart"

interface PaceRow {
  metric: string
  current: string
  forecast: string
  target: string
  status: "On Track" | "Watch" | "Behind" | "Critical" | "Ahead"
  caption?: string
}

const paceRows: PaceRow[] = [
  {
    metric: "Net Revenue",
    current: "$126,840",
    forecast: "$482,000",
    target: "$500,000",
    status: "Watch",
    caption: "$18K below target if current pace continues",
  },
  {
    metric: "Contribution Margin",
    current: "$75,146",
    forecast: "$286,000",
    target: "$300,000",
    status: "Behind",
    caption: "$14K below target — review CAC and refund rate",
  },
  {
    metric: "Ad Spend",
    current: "$34,200",
    forecast: "$132,000",
    target: "$140,000",
    status: "On Track",
    caption: "Trending under monthly cap",
  },
  {
    metric: "CAC",
    current: "$31.10",
    forecast: "$32.40",
    target: "$30.00",
    status: "Watch",
    caption: "Drifting upward across paid channels",
  },
  {
    metric: "MER",
    current: "3.75x",
    forecast: "3.65x",
    target: "3.50x",
    status: "Ahead",
    caption: "Holding above target driven by email and Meta UGC",
  },
  {
    metric: "Refund Rate",
    current: "3.4%",
    forecast: "3.6%",
    target: "2.5%",
    status: "Critical",
    caption: "Trail Runner sizing complaints driving refund volume",
  },
]

export function CurrentPaceForecast() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Current Pace Forecast</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Where the business is projected to land at month-end if current trends continue.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Modeled from current month-to-date trends
        </span>
      </div>

      <ForecastTrendChart />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Metric</TableHead>
              <TableHead className="text-right text-muted-foreground">Current</TableHead>
              <TableHead className="text-right text-muted-foreground">Forecast (Month-End)</TableHead>
              <TableHead className="text-right text-muted-foreground">Target</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paceRows.map((r) => (
              <TableRow key={r.metric} className="border-border hover:bg-muted/40">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{r.metric}</span>
                    {r.caption && (
                      <span className="text-[11px] text-muted-foreground">{r.caption}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">{r.current}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{r.forecast}</TableCell>
                <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                  {r.target}
                </TableCell>
                <TableCell>
                  <PlanningStatusPill status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
