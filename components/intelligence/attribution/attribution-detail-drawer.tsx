"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sparkles, ExternalLink } from "lucide-react"
import { AttributionRow } from "./attribution-data"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"

interface AttributionDetailDrawerProps {
  row: AttributionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function AttributionDetailDrawer({
  row,
  open,
  onOpenChange,
}: AttributionDetailDrawerProps) {
  if (!row) return null

  const sources = [
    { label: "Platform Reported", value: row.platformReported, hint: "Self-reported by ad platform" },
    { label: "GA4", value: row.ga4, hint: "Cross-domain click-based" },
    { label: "Shopify First-Click", value: row.shopifyFirstClick, hint: "First touch click" },
    { label: "Shopify Last-Click", value: row.shopifyLastClick, hint: "Last touch click" },
    { label: "Post-Purchase Survey", value: row.postPurchaseSurvey, hint: "Self-reported by customer" },
    { label: "Shopify Blended", value: row.blendedTruth, hint: "Shopify Blended measurement source" },
  ]

  const max = Math.max(...sources.map((s) => s.value))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Channel
            </span>
            <IntelligenceStatusPill status={row.confidence} />
          </div>
          <SheetTitle className="text-lg">{row.channel}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Demo attribution comparison · Last 30 days
          </p>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Headline */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Channel Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Stat label="Spend" value={formatCurrency(row.spend)} />
              <Stat label="Blended ROAS" value={row.blendedRoas ? `${row.blendedRoas.toFixed(2)}x` : "—"} />
              <Stat label="Shopify Blended" value={formatCurrency(row.blendedTruth)} />
              <Stat
                label="Contribution margin"
                value={formatCurrency(row.contributionMargin)}
              />
            </div>
          </section>

          {/* Sources comparison */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue by Source
            </h3>
            <div className="space-y-2 rounded-lg border border-border p-3">
              {sources.map((s) => {
                const pct = max > 0 ? (s.value / max) * 100 : 0
                const isBlended = s.label === "Shopify Blended"
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isBlended ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s.label}
                        </span>
                        {isBlended && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                            Truth
                          </span>
                        )}
                      </div>
                      <span className="font-mono">{formatCurrency(s.value)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          isBlended ? "bg-primary" : "bg-muted-foreground/40"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Flag / Risk */}
          {row.flag && (
            <section>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-amber-700">
                    {row.flag === "double_count_risk" && "Double-count risk"}
                    {row.flag === "uplift_unconfirmed" && "Incrementality unconfirmed"}
                    {row.flag === "view_through_dependent" &&
                      "View-through dependent"}
                  </p>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {row.notes}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* AI Review */}
          <section>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Why we trust the blend
                </span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">{row.notes}</p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="mr-1.5 h-3 w-3" />
              View campaigns in Action Center
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
