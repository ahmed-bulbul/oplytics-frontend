"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sparkles, ExternalLink, Repeat } from "lucide-react"
import type { SubscriptionCohortRow } from "./subscription-data"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"

interface Props {
  cohort: SubscriptionCohortRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailDrawer({ cohort, open, onOpenChange }: Props) {
  if (!cohort) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Subscription cohort
            </span>
            <IntelligenceStatusPill status={cohort.status} />
          </div>
          <SheetTitle className="text-lg">{cohort.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {cohort.newSubs.toLocaleString()} new subscribers · Sub LTV $
            {cohort.subLtv} · payback {cohort.paybackMonth}
          </p>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Retention */}
          <Section title="Retention">
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
              <Stat
                label="Month 2"
                value={`${cohort.month2Retention.toFixed(1)}%`}
              />
              <Stat
                label="Month 3"
                value={`${cohort.month3Retention.toFixed(1)}%`}
              />
              <Stat
                label="Month 6"
                value={
                  cohort.month6Retention > 0
                    ? `${cohort.month6Retention.toFixed(1)}%`
                    : "—"
                }
              />
            </div>
          </Section>

          {/* Cancel signals */}
          <Section title="Cancel & Pause Signals">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <Stat
                label="Same-day cancel"
                value={`${cohort.sameDayCancelRate.toFixed(1)}%`}
              />
              <Stat
                label="Pause rate"
                value={`${cohort.pauseRate.toFixed(1)}%`}
              />
              <Stat
                label="Reactivation rate"
                value={`${cohort.reactivationRate.toFixed(1)}%`}
              />
              <Stat
                label="Trial abuse score"
                value={`${cohort.trialAbuseScore}/100`}
              />
            </div>
          </Section>

          {/* Cancel reasons */}
          <Section title="Cancel Reasons">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {cohort.cancelReasons.map((r) => (
                <div key={r.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{r.reason}</span>
                    <span className="font-mono text-muted-foreground">
                      {r.share}%
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${Math.min(r.share * 2.5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* LTV by source */}
          <Section title="LTV by Acquisition Source">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {cohort.topAcquisitionSources.map((s) => (
                <LtvRow
                  key={s.source}
                  label={s.source}
                  ltv={s.ltv}
                  share={s.share}
                />
              ))}
            </div>
          </Section>

          {/* LTV by first product */}
          <Section title="LTV by First Product">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {cohort.topFirstProducts.map((p) => (
                <LtvRow
                  key={p.product}
                  label={p.product}
                  ltv={p.ltv}
                  share={p.share}
                />
              ))}
            </div>
          </Section>

          {/* LTV by offer */}
          <Section title="LTV by Offer">
            <div className="space-y-2 rounded-lg border border-border p-3">
              {cohort.topOffers.map((o) => (
                <LtvRow
                  key={o.offer}
                  label={o.offer}
                  ltv={o.ltv}
                  share={o.share}
                />
              ))}
            </div>
          </Section>

          {/* AI Review */}
          <section>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  AI Review
                </span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                {cohort.aiReview}
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <Repeat className="mr-1.5 h-3 w-3" />
              Inspect cancel reasons
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="mr-1.5 h-3 w-3" />
              View offer detail
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
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

function LtvRow({
  label,
  ltv,
  share,
}: {
  label: string
  ltv: number
  share: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground">{share}%</span>
          <span className="font-mono font-semibold text-foreground">
            ${ltv}
          </span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(share * 2.5, 100)}%` }}
        />
      </div>
    </div>
  )
}
