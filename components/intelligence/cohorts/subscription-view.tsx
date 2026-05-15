"use client"

import { useState } from "react"
import {
  Repeat,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Users2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import { BenchmarkCallout } from "@/components/intelligence/benchmark-callout"
import {
  subscriptionCohortRows,
  subscriptionMetrics,
  type SubscriptionCohortRow,
} from "./subscription-data"
import { SubscriptionDetailDrawer } from "./subscription-detail-drawer"

export function SubscriptionView() {
  const [selected, setSelected] = useState<SubscriptionCohortRow | null>(null)
  const [open, setOpen] = useState(false)

  const handleView = (row: SubscriptionCohortRow) => {
    setSelected(row)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Subscription header band */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Subscription Retention Intelligence
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Track Month-2 retention, same-day cancels, pause and reactivation
              rates, cancel reasons, and subscription LTV by acquisition source.
            </p>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Source: Shopify subscriptions + Recharge
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <IntelligenceSummaryCard
          label="Active subscribers"
          metricKey="Active Subscribers"
          value={subscriptionMetrics.activeSubscribers.toLocaleString()}
          caption={`+${subscriptionMetrics.netNewLast30Days} net new (30d)`}
          icon={Users2}
        />
        <IntelligenceSummaryCard
          label="Avg Month-2 retention"
          metricKey="M2 Retention"
          value={`${subscriptionMetrics.avgMonth2Retention.toFixed(1)}%`}
          caption={`Trailing 90 days · target 85%`}
          icon={Repeat}
          tone={
            subscriptionMetrics.avgMonth2Retention >= 85 ? "positive" : "warning"
          }
        />
        <IntelligenceSummaryCard
          label="Sub LTV (weighted)"
          metricKey="Subscription LTV"
          value={`$${subscriptionMetrics.weightedSubLtv}`}
          caption={`Cont. margin: $${subscriptionMetrics.weightedContributionMargin}`}
          icon={Sparkles}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Same-day cancel"
          value="11.4%"
          caption="Trailing 30 days"
          icon={TrendingDown}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Trial abuse score"
          value={`${subscriptionMetrics.trialAbuseRate}%`}
          caption="Heuristic score"
          icon={AlertTriangle}
          tone={
            subscriptionMetrics.trialAbuseRate >
            subscriptionMetrics.benchmarkTrialAbuseRate
              ? "warning"
              : "positive"
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <BenchmarkCallout
          metricLabel="Month-2 retention"
          value={`${subscriptionMetrics.avgMonth2Retention.toFixed(1)}%`}
          comparison={`${(subscriptionMetrics.avgMonth2Retention - subscriptionMetrics.benchmarkMonth2Retention).toFixed(1)} pts above category benchmark of ${subscriptionMetrics.benchmarkMonth2Retention}%.`}
          tone="better"
        />
        <BenchmarkCallout
          metricLabel="Trial abuse rate"
          value={`${subscriptionMetrics.trialAbuseRate}%`}
          comparison={`Higher than category benchmark of ${subscriptionMetrics.benchmarkTrialAbuseRate}%. Review $1 trial offer.`}
          tone="worse"
        />
      </div>

      {/* Subscription cohort table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Subscription cohorts
            </h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Shopify subscriptions
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {subscriptionCohortRows.length} cohorts
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Cohort</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  New subs
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  M2 retention
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  M3 retention
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Same-day cancel
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Sub LTV
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Payback
                </TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionCohortRows.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer border-border hover:bg-muted/40"
                  onClick={() => handleView(c)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {c.newSubs.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${
                      c.month2Retention < 80
                        ? "text-rose-600"
                        : c.month2Retention < 85
                          ? "text-amber-600"
                          : "text-foreground"
                    }`}
                  >
                    {c.month2Retention.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {c.month3Retention.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${
                      c.sameDayCancelRate > 12
                        ? "text-rose-600"
                        : c.sameDayCancelRate > 9
                          ? "text-amber-600"
                          : "text-foreground"
                    }`}
                  >
                    {c.sameDayCancelRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    ${c.subLtv}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {c.paybackMonth}
                  </TableCell>
                  <TableCell>
                    <IntelligenceStatusPill status={c.status} />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => handleView(c)}
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <SubscriptionDetailDrawer
        cohort={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
