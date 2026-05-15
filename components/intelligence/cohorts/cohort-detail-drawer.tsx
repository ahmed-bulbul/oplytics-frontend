"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sparkles, ExternalLink, ShoppingBag } from "lucide-react"
import { CohortRow } from "./cohorts-data"
import { ChannelLogo } from "./channel-logo"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"

interface CohortDetailDrawerProps {
  cohort: CohortRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function RetentionCurve({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-16 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="oklch(0.7 0.15 150)"
        strokeWidth="2"
      />
    </svg>
  )
}

export function CohortDetailDrawer({
  cohort,
  open,
  onOpenChange,
}: CohortDetailDrawerProps) {
  if (!cohort) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Cohort
            </span>
            <IntelligenceStatusPill status={cohort.status} />
          </div>
          <SheetTitle className="text-lg">{cohort.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Acquired through {cohort.acquisitionChannel} · {cohort.newCustomers.toLocaleString()} new customers
          </p>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Acquisition */}
          <Section title="Acquisition">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Stat label="New customers" value={cohort.newCustomers.toLocaleString()} />
              <Stat label="CAC" value={`$${cohort.cac.toFixed(2)}`} />
              <Stat
                label="Cont. margin / customer"
                value={`$${cohort.contributionMarginPerCustomer.toFixed(2)}`}
              />
              <Stat label="Payback" value={`${cohort.paybackDays} days`} />
            </div>
          </Section>

          {/* Channel mix */}
          <Section title="Acquisition Channels">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {[...cohort.channelMix]
                .sort((a, b) => b.share - a.share)
                .map((m) => (
                  <div key={m.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-foreground">
                        <ChannelLogo channel={m.channel} size={16} />
                        {m.channel}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {Math.round(m.share)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${m.share}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </Section>

          {/* LTV at windows */}
          <Section title="LTV by Window">
            <div className="grid grid-cols-5 gap-2 rounded-lg border border-border p-3 text-center">
              <LtvCol label="30d" value={cohort.ltv30} />
              <LtvCol label="60d" value={cohort.ltv60} />
              <LtvCol label="90d" value={cohort.ltv90} />
              <LtvCol label="180d" value={cohort.ltv180} />
              <LtvCol label="365d" value={cohort.ltv365} />
            </div>
          </Section>

          {/* Retention */}
          <Section title="Retention Curve">
            <div className="rounded-lg border border-border p-3">
              <RetentionCurve data={cohort.retention} />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>M0</span>
                <span>M3</span>
                <span>M6</span>
                <span>M9</span>
                <span>M11</span>
              </div>
            </div>
          </Section>

          {/* Repeat behavior */}
          <Section title="Repeat Behavior">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <Stat
                label="Repeat purchase rate"
                value={`${cohort.repeatPurchaseRate}%`}
              />
              <Stat
                label="Avg days to 2nd purchase"
                value={`${cohort.daysToSecondPurchase}`}
              />
            </div>
          </Section>

          {/* Top products */}
          <Section title="Top Products in this Cohort">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {cohort.topProducts.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      {p.name}
                    </span>
                    <span className="font-mono text-muted-foreground">{p.share}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${p.share * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* AI Review */}
          <section>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Review</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                {cohort.aiReview}
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="mr-1.5 h-3 w-3" />
              View campaigns
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Compare with prior cohort
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
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

function LtvCol({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">${value.toFixed(0)}</div>
    </div>
  )
}
