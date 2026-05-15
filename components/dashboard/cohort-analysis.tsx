"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { MetricDefinition } from "@/components/dashboard/metric-definition"
import { useDateRange } from "@/context/date-range-context"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi, formatCompactMoney, formatMoney, type DashboardCohortResponse, type CohortEntry } from "@/lib/api/analytics"

// ── Types ─────────────────────────────────────────────────────────────────────

interface CohortDisplayRow {
  cohortLabel: string
  newUsers: string
  cac: string
  ltv: string
  retention: (string | null)[]   // M0..Mn as formatted % strings, null = not yet available
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(v: number, currency: string): string {
  return Math.abs(v) >= 1_000
    ? formatCompactMoney(v, currency)
    : formatMoney(v, currency, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function fmtCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return v.toLocaleString()
}

/**
 * Format a cohort month date ("2024-01-01") into a human-readable label.
 * Shows relative label when within the last 12 months, otherwise "Mon YYYY".
 */
function formatCohortLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number)
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1  // 1-based
  const monthsAgo = (nowYear - year) * 12 + (nowMonth - month)

  if (monthsAgo === 0) return "This month"
  if (monthsAgo === 1) return "Last month"
  if (monthsAgo <= 12) return `${monthsAgo} months ago`

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${MONTHS[month - 1]} ${year}`
}

/** Map a live CohortEntry into the display row shape. */
function entryToDisplayRow(entry: CohortEntry, maxMonths: number, currency: string): CohortDisplayRow {
  // Build a lookup: month → retentionRate
  const byMonth = new Map(entry.retention.map((r) => [r.month, r]))

  const retention: (string | null)[] = []
  for (let m = 0; m <= maxMonths; m++) {
    const point = byMonth.get(m)
    if (point === undefined) {
      retention.push(null)
    } else {
      // retention_rate is a fraction (0–1); format as %
      const pct = Number(point.retention_rate) * 100
      retention.push(`${pct.toFixed(1)}%`)
    }
  }

  return {
    cohortLabel: formatCohortLabel(entry.cohort_month),
    newUsers: fmtCount(entry.cohort_size),
    cac: "—",   // CAC requires ad-spend attribution not in cohort table
    ltv: fmtMoney(Number(entry.avg_ltv), currency),
    retention,
  }
}

/** Heat-map colour based on retention percentage value. */
function getRetentionColor(value: string | null): string {
  if (!value) return ""
  const num = parseFloat(value.replace("%", ""))
  if (num >= 100) return "bg-emerald-500/30"
  if (num >= 20)  return "bg-emerald-500/20"
  if (num >= 10)  return "bg-emerald-500/10"
  return "bg-emerald-500/5"
}

// ── Column header with info popover ──────────────────────────────────────────

function CohortHeader({
  label,
  metric,
  align = "left",
}: {
  label: string
  metric: string
  align?: "left" | "right" | "center"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        align === "right"  && "justify-end",
        align === "center" && "justify-center",
      )}
    >
      {label}
      <MetricDefinition metric={metric} />
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CohortAnalysis() {
  const { from, to } = useDateRange()
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null

  const [cohortData, setCohortData] = useState<DashboardCohortResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCohorts = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    try {
      const data = await dashboardApi.getCohorts(orgId, from, to)
      if (data && Array.isArray(data.cohorts)) {
        setCohortData(data)
      } else {
        setCohortData(null)
      }
    } catch {
      setCohortData(null)
    } finally {
      setIsLoading(false)
    }
  }, [orgId, from, to])

  useEffect(() => { fetchCohorts() }, [fetchCohorts])

  // ── Resolve display rows and column headers ────────────────────────────────
  // Guard against cohorts being null/undefined — backend may return an empty or
  // differently shaped response when no cohort data is available yet.
  const hasLiveData =
    cohortData !== null &&
    Array.isArray(cohortData.cohorts) &&
    cohortData.cohorts.length > 0
  const maxMonths = hasLiveData ? Math.max(cohortData!.max_months ?? 0, 0) : 0

  const displayRows: CohortDisplayRow[] = hasLiveData
    ? cohortData!.cohorts.map((e) => entryToDisplayRow(e, maxMonths, cohortData!.meta.currency))
    : []

  // Column labels: M0, M1, M2 … up to maxMonths
  const monthColumns = Array.from({ length: maxMonths + 1 }, (_, i) => `M${i}`)

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">
            Customer Cohort Analysis
          </h3>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            Source: Shopify customer/order data
          </span>
          {hasLiveData && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
              Live
            </span>
          )}
          {!hasLiveData && !isLoading && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              No cohort data yet
            </span>
          )}
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>
        {hasLiveData && (
          <p className="mt-1 text-xs text-muted-foreground">
            {cohortData!.cohorts.length} cohort{cohortData!.cohorts.length !== 1 ? "s" : ""} ·
            up to M{maxMonths} retention · currency: {cohortData!.meta.currency}
          </p>
        )}
      </div>

      {hasLiveData ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <CohortHeader label="Cohort" metric="Cohort" />
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <CohortHeader label="New Users" metric="New Users" align="right" />
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <CohortHeader label="CAC" metric="CAC" align="right" />
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  <CohortHeader label="LTV" metric="LTV" align="right" />
                </TableHead>
                {monthColumns.map((m) => (
                  <TableHead key={m} className="text-center text-muted-foreground">
                    <CohortHeader label={m} metric="Cohort Retention" align="center" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row) => (
                <TableRow key={row.cohortLabel} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium">{row.cohortLabel}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.newUsers}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.cac}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.ltv}</TableCell>
                  {row.retention.map((value, i) => (
                    <TableCell
                      key={i}
                      className={cn("text-center tabular-nums", getRetentionColor(value))}
                    >
                      {value ?? <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                  ))}
                  {Array.from({ length: maxMonths + 1 - row.retention.length }).map((_, i) => (
                    <TableCell key={`pad-${i}`} className="text-center text-muted-foreground/30">
                      —
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No cohort data yet</EmptyTitle>
              <EmptyDescription>
                Cohorts will appear after Shopify customers place orders across one or more months within the selected date range.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  )
}
