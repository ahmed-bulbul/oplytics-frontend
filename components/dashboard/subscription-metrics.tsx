"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { MetricDefinition } from "@/components/dashboard/metric-definition"
import { dashboardApi, SubscriptionMetricsResponse, formatCompactMoney } from "@/lib/api/analytics"
import { useDateRange } from "@/context/date-range-context"
import { useAuth } from "@/contexts/AuthContext"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-muted", className)} />
  )
}

// ─── Empty state (no subscription data) ───────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="text-2xl">📭</span>
      <p className="mt-2 text-sm font-medium text-foreground">No subscription data yet</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Subscription metrics appear once your Shopify store has active subscription contracts
        (requires Shopify Subscriptions, ReCharge, Bold or a compatible app).
      </p>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SubscriptionMetrics() {
  const { from, to } = useDateRange()
  const { user } = useAuth()
  const orgId = user?.orgUuid ?? null

  const [data, setData] = useState<SubscriptionMetricsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!orgId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await dashboardApi.getSubscriptionMetrics(orgId, from, to)
      setData(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load subscription metrics")
    } finally {
      setIsLoading(false)
    }
  }, [orgId, from, to])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  // Derived display values
  const currency = data?.currency ?? "USD"

  const mrrFormatted = data ? formatCompactMoney(data.mrr, currency) : "—"
  const cancellationRateFormatted = data
    ? `${Number(data.cancellationRate).toFixed(2)}%`
    : "—"

  const retentionRate = data?.retention?.retentionRate ?? null
  const retentionFormatted = retentionRate !== null ? `${Number(retentionRate).toFixed(1)}%` : "—"
  const cohortSize = data?.retention?.cohortSize ?? 0

  const isEmpty = !isLoading && !error && data !== null && data.activeSubscriptions === 0

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* ── Header ── */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Subscription Metrics
            </h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Shopify Subscriptions
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Recurring Revenue Focus</span>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="border-b border-border bg-red-50/50 px-4 py-2 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {isEmpty && <EmptyState />}

      {/* ── KPI tiles ── */}
      {!isEmpty && (
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4 sm:gap-4 sm:p-4">
          {/* MRR */}
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
              MRR
              <MetricDefinition metric="MRR" />
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base md:text-lg">
                {mrrFormatted}
              </span>
            )}
            {isLoading ? (
              <Skeleton className="mt-0.5 h-3 w-28" />
            ) : (
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {data ? `${data.activeSubscriptions.toLocaleString()} active contracts` : ""}
              </span>
            )}
          </div>

          {/* New Subscribers */}
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
              New Subscribers
              <MetricDefinition metric="New Subscribers" />
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base md:text-lg">
                {data ? data.newSubscribers.toLocaleString() : "—"}
              </span>
            )}
            {isLoading ? (
              <Skeleton className="mt-0.5 h-3 w-28" />
            ) : (
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {data ? `${data.activeSubscribers.toLocaleString()} total active` : ""}
              </span>
            )}
          </div>

          {/* New Subscriptions */}
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
              New Subscriptions
              <MetricDefinition metric="New Subscriptions" />
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base md:text-lg">
                {data ? data.newSubscriptions.toLocaleString() : "—"}
              </span>
            )}
            {isLoading ? (
              <Skeleton className="mt-0.5 h-3 w-28" />
            ) : (
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                in selected period
              </span>
            )}
          </div>

          {/* Cancellation Rate */}
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
              Cancellation Rate
              <MetricDefinition metric="Cancellation Rate" />
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-14" />
            ) : (
              <span
                className={cn(
                  "text-sm font-semibold tracking-tight sm:text-base md:text-lg",
                  data && data.cancellationRate > 0
                    ? data.cancellationRate < 5
                      ? "text-emerald-500"
                      : data.cancellationRate < 10
                      ? "text-yellow-500"
                      : "text-red-500"
                    : "text-foreground"
                )}
              >
                {cancellationRateFormatted}
              </span>
            )}
            {isLoading ? (
              <Skeleton className="mt-0.5 h-3 w-28" />
            ) : (
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                in selected period
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Retention section ── */}
      {!isEmpty && (
        <div className="border-t border-border p-4">
          <h4 className="mb-1 text-sm font-medium text-foreground">
            Subscriber Retention
          </h4>
          <p className="mb-4 text-xs text-muted-foreground">
            Of subscribers who started in this period, how many remain active today.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {/* Cohort size */}
            <div className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-2 sm:p-4">
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <span className="text-base font-bold text-foreground sm:text-lg md:text-xl">
                  {cohortSize.toLocaleString()}
                </span>
              )}
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
                Cohort size
                <MetricDefinition metric="Subscription Retention" />
              </span>
            </div>

            {/* Retained */}
            <div className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-2 sm:p-4">
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <span className="text-base font-bold text-foreground sm:text-lg md:text-xl">
                  {data ? (data.retention?.retained ?? 0).toLocaleString() : "—"}
                </span>
              )}
              <span className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
                Still active
              </span>
            </div>

            {/* Retention rate */}
            <div className="col-span-2 flex flex-col items-center rounded-lg border border-border bg-muted/30 p-2 sm:col-span-1 sm:p-4">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span
                  className={cn(
                    "text-base font-bold sm:text-lg md:text-xl",
                    retentionRate !== null && retentionRate >= 70
                      ? "text-emerald-500"
                      : retentionRate !== null && retentionRate >= 40
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                >
                  {retentionFormatted}
                </span>
              )}
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
                Retention rate
                <MetricDefinition metric="Subscription Retention" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
