"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ExternalLink, Layers, Sparkles } from "lucide-react"
import { CreativeRow } from "./creative-data"
import { CreativeThumbnail } from "./creative-thumbnail"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"

interface CreativeDetailDrawerProps {
  creative: CreativeRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MiniSpark({ data, accent }: { data: number[]; accent: string }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-9 w-full">
      <polyline points={points} fill="none" stroke={accent} strokeWidth="2" />
    </svg>
  )
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function CreativeDetailDrawer({
  creative,
  open,
  onOpenChange,
}: CreativeDetailDrawerProps) {
  if (!creative) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {creative.format}
            </span>
            <IntelligenceStatusPill status={creative.status} />
            <span className="text-[10px] text-muted-foreground">{creative.channel}</span>
          </div>
          <SheetTitle className="text-lg">{creative.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Demo creative · Last 7 days vs prior 7 days
          </p>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Creative Preview */}
          <section>
            <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
              <CreativeThumbnail
                src={creative.thumbnailUrl}
                alt={creative.name}
                format={creative.format}
                size="lg"
              />
            </div>
          </section>

          {/* Performance Summary */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Stat label="Spend" value={formatCurrency(creative.spend)} />
              <Stat label="Revenue" value={formatCurrency(creative.revenue)} />
              <Stat label="ROAS" value={`${creative.roas.toFixed(2)}x`} />
              <Stat label="CAC" value={`$${creative.cac.toFixed(2)}`} />
              <Stat label="Contribution margin" value={formatCurrency(creative.contributionMargin)} />
              <Stat label="New customer rate" value={`${creative.newCustomerRate}%`} />
            </div>
          </section>

          {/* Creative Attributes */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Creative Attributes
            </h3>
            <dl className="space-y-1.5 rounded-lg border border-border p-3 text-xs">
              <Row label="Format" value={creative.format} />
              <Row label="Hook" value={creative.hook} />
              <Row label="Angle" value={creative.angle} />
              <Row label="Offer" value={creative.offer} />
              <Row label="Landing page" value={creative.landingPage} />
              <Row label="Channel" value={creative.channel} />
            </dl>
          </section>

          {/* Trend */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              7-day Trend
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <TrendCard label="CTR" data={creative.trend.ctr} accent="oklch(0.6 0.15 200)" />
              <TrendCard label="CPA" data={creative.trend.cpa} accent="oklch(0.65 0.18 25)" />
              <TrendCard label="ROAS" data={creative.trend.roas} accent="oklch(0.7 0.15 150)" />
              <TrendCard
                label="Contribution Margin"
                data={creative.trend.contributionMargin}
                accent="oklch(0.65 0.18 280)"
              />
            </div>
          </section>

          {/* AI Review */}
          <section>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Review</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                {creative.aiReview}
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Open in Action Center
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Layers className="mr-1.5 h-3 w-3" />
              View related ads
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  )
}

function TrendCard({ label, data, accent }: { label: string; data: number[]; accent: string }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <MiniSpark data={data} accent={accent} />
    </div>
  )
}
