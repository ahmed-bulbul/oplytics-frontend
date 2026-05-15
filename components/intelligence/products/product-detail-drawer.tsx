"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Boxes, Calculator, Sparkles, Users2 } from "lucide-react"
import { ProductRow } from "./product-data"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import { StockoutRiskPill } from "@/components/intelligence/stockout-risk-pill"

interface ProductDetailDrawerProps {
  product: ProductRow | null
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

export function ProductDetailDrawer({
  product,
  open,
  onOpenChange,
}: ProductDetailDrawerProps) {
  if (!product) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
            <IntelligenceStatusPill status={product.status} />
          </div>
          <SheetTitle className="text-lg">{product.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">Demo product · Last 30 days</p>
        </SheetHeader>

        <div className="space-y-5 pt-4">
          {/* Product Economics */}
          <Section title="Product Economics">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Stat label="Revenue" value={formatCurrency(product.revenue)} />
              <Stat label="Orders" value={product.orders.toLocaleString()} />
              <Stat label="AOV" value={`$${product.aov.toFixed(2)}`} />
              <Stat label="COGS" value={formatCurrency(product.cogs)} />
              <Stat label="Gross margin" value={formatCurrency(product.grossMargin)} />
              <Stat
                label="Cont. margin"
                value={`${formatCurrency(product.contributionMargin)} (${product.contributionMarginPct.toFixed(1)}%)`}
              />
            </div>
          </Section>

          {/* Customer Quality */}
          <Section title="Customer Quality">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <Stat label="New customers" value={product.newCustomers.toLocaleString()} />
              <Stat label="CAC" value={`$${product.cac.toFixed(2)}`} />
              <Stat label="30-day LTV" value={`$${product.ltv30.toFixed(2)}`} />
              <Stat label="60-day LTV" value={`$${product.ltv60.toFixed(2)}`} />
              <Stat label="90-day LTV" value={`$${product.ltv90.toFixed(2)}`} />
              <Stat label="Repeat rate" value={`${product.repeatRate}%`} />
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Stockout risk</span>
                </div>
                <StockoutRiskPill risk={product.stockoutRisk} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="On hand"
                  value={`${product.inventoryOnHand.toLocaleString()} units`}
                />
                <Stat
                  label="Sales velocity"
                  value={`${product.salesVelocity}/day`}
                />
                <Stat
                  label="Days of inventory"
                  value={`${product.daysOfInventory}d`}
                />
                <Stat label="Reorder status" value={product.reorderStatus} />
                <Stat
                  label="Revenue at risk"
                  value={`$${product.revenueAtRisk.toLocaleString()}`}
                />
                <Stat
                  label="Cont. margin at risk"
                  value={`$${product.contributionMarginAtRisk.toLocaleString()}`}
                />
              </div>
              {product.adSpend > 0 &&
                (product.stockoutRisk === "High" ||
                  product.stockoutRisk === "Critical") && (
                  <div className="mt-3 flex items-start gap-2 rounded-md bg-rose-500/10 p-2 text-xs text-rose-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Ad spend is currently driving demand to a product with{" "}
                      {product.stockoutRisk.toLowerCase()} stockout risk. Review
                      spend allocation before scaling.
                    </span>
                  </div>
                )}
            </div>
          </Section>

          {/* Risk Signals */}
          <Section title="Risk Signals">
            <div className="space-y-2 rounded-lg border border-border p-3">
              <RiskRow
                label="Refund rate"
                value={`${product.refundRate.toFixed(1)}%`}
                tone={product.refundRate > 5 ? "negative" : "neutral"}
              />
              <RiskRow
                label="Return rate"
                value={`${product.returnRate.toFixed(1)}%`}
                tone={product.returnRate > 5 ? "negative" : "neutral"}
              />
              <RiskRow
                label="Discount dependency"
                value={`${product.discountDependency}%`}
                tone={product.discountDependency > 20 ? "warning" : "neutral"}
              />
              {product.cogsMissing && (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    COGS is set to a category default. Margin estimate may be off until
                    confirmed.
                  </span>
                </div>
              )}
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
                {product.aiReview}
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button size="sm" variant="outline" className="text-xs">
              <Users2 className="mr-1.5 h-3 w-3" />
              Open related cohorts
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Calculator className="mr-1.5 h-3 w-3" />
              Review calculation
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

function RiskRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "warning" | "negative"
}) {
  const toneClass =
    tone === "negative"
      ? "text-rose-600"
      : tone === "warning"
        ? "text-amber-600"
        : "text-foreground"
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${toneClass}`}>{value}</span>
    </div>
  )
}
