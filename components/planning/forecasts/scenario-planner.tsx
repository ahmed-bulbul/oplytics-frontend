"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Save, GitCompareArrows, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlanningStatusPill } from "../planning-status-pill"

const channelOptions = [
  "Meta Ads",
  "Google Search",
  "Google PMax",
  "TikTok Ads",
  "Email & SMS",
  "Display Prospecting",
] as const

interface ScenarioInputs {
  channel: string
  currentDailySpend: number
  proposedDailySpend: number
  expectedCpa: number
  expectedAov: number
  grossMargin: number // percent (e.g. 65 for 65%)
  refundRate: number // percent
  days: number
}

const defaults: ScenarioInputs = {
  channel: "Meta Ads",
  currentDailySpend: 420,
  proposedDailySpend: 500,
  expectedCpa: 41,
  expectedAov: 91.6,
  grossMargin: 65.4,
  refundRate: 3.4,
  days: 31,
}

function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function fmtCurrency2(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
}

function computeScenario(s: ScenarioInputs) {
  const incrementalDailySpend = Math.max(0, s.proposedDailySpend - s.currentDailySpend)
  const incrementalSpend = incrementalDailySpend * s.days
  const projectedDailySpend = s.proposedDailySpend
  const projectedSpend = projectedDailySpend * s.days

  const safeCpa = s.expectedCpa > 0 ? s.expectedCpa : 1
  const incrementalOrders = incrementalDailySpend > 0 ? (incrementalDailySpend * s.days) / safeCpa : 0
  const projectedOrders = (projectedDailySpend * s.days) / safeCpa
  const projectedRevenue = projectedOrders * s.expectedAov
  const incrementalRevenue = incrementalOrders * s.expectedAov

  // Net contribution after refunds and gross margin, less ad spend
  const netRevenue = projectedRevenue * (1 - s.refundRate / 100)
  const grossProfit = netRevenue * (s.grossMargin / 100)
  const projectedContributionMargin = grossProfit - projectedSpend
  const breakEvenCpa = s.expectedAov * (s.grossMargin / 100) * (1 - s.refundRate / 100)
  const breakEvenRoas = breakEvenCpa > 0 ? s.expectedAov / breakEvenCpa : 0

  // Incremental contribution margin from the *increase only*
  const incrementalGross = incrementalRevenue * (1 - s.refundRate / 100) * (s.grossMargin / 100)
  const incrementalContribution = incrementalGross - incrementalSpend

  const projectedCac = s.expectedCpa // CPA proxy for new-customer cost in this demo
  const cpaHeadroom = breakEvenCpa - s.expectedCpa
  const headroomRatio = breakEvenCpa > 0 ? cpaHeadroom / breakEvenCpa : 0

  let risk: "On Track" | "Watch" | "Behind" | "Critical" = "On Track"
  if (incrementalContribution < 0) risk = "Critical"
  else if (headroomRatio < 0.05) risk = "Watch"
  else if (headroomRatio < 0.15) risk = "Behind"
  else risk = "On Track"

  return {
    incrementalSpend,
    projectedSpend,
    projectedOrders,
    incrementalOrders,
    projectedRevenue,
    incrementalRevenue,
    projectedContributionMargin,
    incrementalContribution,
    projectedCac,
    breakEvenCpa,
    breakEvenRoas,
    risk,
  }
}

export function ScenarioPlanner() {
  const [inputs, setInputs] = useState<ScenarioInputs>(defaults)
  const result = useMemo(() => computeScenario(inputs), [inputs])

  const setNumber =
    (key: keyof ScenarioInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = parseFloat(e.target.value)
      setInputs((prev) => ({ ...prev, [key]: Number.isFinite(next) ? next : 0 }))
    }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Spend Scenario Planner</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Model how revenue, contribution margin, and CAC move under a new spend plan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-4 border-b border-border p-4 lg:col-span-2 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="channel" className="text-xs">
                Channel
              </Label>
              <Select
                value={inputs.channel}
                onValueChange={(v) => setInputs((prev) => ({ ...prev, channel: v }))}
              >
                <SelectTrigger id="channel" size="sm" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="current-spend" className="text-xs">
                Current daily spend
              </Label>
              <Input
                id="current-spend"
                type="number"
                value={inputs.currentDailySpend}
                onChange={setNumber("currentDailySpend")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposed-spend" className="text-xs">
                Proposed daily spend
              </Label>
              <Input
                id="proposed-spend"
                type="number"
                value={inputs.proposedDailySpend}
                onChange={setNumber("proposedDailySpend")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cpa" className="text-xs">
                Expected CPA
              </Label>
              <Input
                id="cpa"
                type="number"
                value={inputs.expectedCpa}
                onChange={setNumber("expectedCpa")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aov" className="text-xs">
                Expected AOV
              </Label>
              <Input
                id="aov"
                type="number"
                value={inputs.expectedAov}
                onChange={setNumber("expectedAov")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="margin" className="text-xs">
                Gross margin %
              </Label>
              <Input
                id="margin"
                type="number"
                value={inputs.grossMargin}
                onChange={setNumber("grossMargin")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refunds" className="text-xs">
                Refund rate %
              </Label>
              <Input
                id="refunds"
                type="number"
                value={inputs.refundRate}
                onChange={setNumber("refundRate")}
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="days" className="text-xs">
                Time period (days)
              </Label>
              <Input
                id="days"
                type="number"
                value={inputs.days}
                onChange={setNumber("days")}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground">
            Scenario summary: <span className="font-medium text-foreground">{inputs.channel}</span>{" "}
            from {fmtCurrency(inputs.currentDailySpend)} → {fmtCurrency(inputs.proposedDailySpend)}{" "}
            per day for {inputs.days} days.
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-4 p-4 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <OutputCard
              label="Incremental spend"
              value={fmtCurrency(result.incrementalSpend)}
              caption={`+${fmtCurrency(
                inputs.proposedDailySpend - inputs.currentDailySpend,
              )}/day`}
            />
            <OutputCard
              label="Projected revenue"
              value={fmtCurrency(result.projectedRevenue)}
              caption={`+${fmtCurrency(result.incrementalRevenue)} vs current`}
            />
            <OutputCard
              label="Projected orders"
              value={Math.round(result.projectedOrders).toLocaleString()}
              caption={`+${Math.round(result.incrementalOrders).toLocaleString()} vs current`}
            />
            <OutputCard
              label="Projected contribution margin"
              value={fmtCurrency(result.projectedContributionMargin)}
              caption={`Incremental: ${fmtCurrency(result.incrementalContribution)}`}
              tone={
                result.projectedContributionMargin > 0
                  ? result.incrementalContribution > 0
                    ? "positive"
                    : "warning"
                  : "negative"
              }
            />
            <OutputCard
              label="Projected CAC"
              value={fmtCurrency2(result.projectedCac)}
              caption={`Break-even CPA: ${fmtCurrency2(result.breakEvenCpa)}`}
              tone={result.projectedCac < result.breakEvenCpa ? "positive" : "negative"}
            />
            <OutputCard
              label="Risk level"
              valueNode={<PlanningStatusPill status={result.risk} className="text-xs" />}
              caption={
                result.risk === "Critical"
                  ? "Incremental contribution turns negative"
                  : result.risk === "Watch"
                    ? "Thin headroom above break-even CPA"
                    : result.risk === "Behind"
                      ? "Limited headroom — review carefully"
                      : "Healthy headroom above break-even"
              }
            />
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> This is a projection only.
            Optilytics does not push spend changes to ad platforms — review the recommendation in
            your ads manager before making any change.
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save scenario
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
              Compare scenarios
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export forecast
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OutputCard({
  label,
  value,
  valueNode,
  caption,
  tone = "default",
}: {
  label: string
  value?: string
  valueNode?: React.ReactNode
  caption?: string
  tone?: "default" | "positive" | "warning" | "negative"
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "negative"
          ? "text-rose-600"
          : "text-foreground"
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className={`mt-1 text-base font-semibold tracking-tight md:text-lg ${toneClass}`}>
        {valueNode ?? value}
      </div>
      {caption && <p className="mt-1 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  )
}
