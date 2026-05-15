"use client"

import { useState } from "react"
import { Calculator, ChevronRight, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CalculationRow {
  id: string
  setting: string
  currentLogic: string
  source: string
  detail: {
    description: string
    formula?: string
    notes?: string
  }
}

const calculationRows: CalculationRow[] = [
  {
    id: "cont-margin",
    setting: "Contribution Margin",
    currentLogic: "Net Revenue − COGS − Ad Spend − Refunds − Fees",
    source: "Shopify + COGS + Paid Media",
    detail: {
      description:
        "Profit remaining after all variable costs are subtracted from net revenue.",
      formula:
        "Net Revenue − COGS − Ad Spend − Discounts − Shipping Subsidies − Transaction Fees − Refunds",
      notes:
        "Used as the primary profit health metric across the dashboard. Editing this calculation is not yet available in the demo.",
    },
  },
  {
    id: "cogs",
    setting: "COGS Rules",
    currentLogic: "Per-product COGS, defaults to category average if missing",
    source: "COGS Rules table",
    detail: {
      description: "How cost of goods sold is determined for each product.",
      notes:
        "12 products are currently missing COGS values. Contribution margin may be overstated until these are filled in.",
    },
  },
  {
    id: "shipping",
    setting: "Shipping Cost Assumptions",
    currentLogic: "Flat rate of $4.50 per order",
    source: "Manual assumption",
    detail: {
      description: "Default shipping cost per order applied when no explicit cost is available.",
      notes: "This is a placeholder assumption for the demo and would be configurable in production.",
    },
  },
  {
    id: "fees",
    setting: "Transaction Fee Assumptions",
    currentLogic: "2.9% + $0.30 per order",
    source: "Manual assumption",
    detail: {
      description: "Average payment processing fee applied per order.",
      notes: "Configurable per provider in production.",
    },
  },
  {
    id: "refunds",
    setting: "Refund Handling",
    currentLogic: "Refunds reduce Net Revenue and Contribution Margin",
    source: "Shopify",
    detail: {
      description: "How refunds and returns are reflected across financial metrics.",
      formula: "Net Revenue = Gross Revenue − Discounts − Refunds / Returns",
    },
  },
  {
    id: "tax",
    setting: "Tax Inclusion",
    currentLogic: "Tax excluded from revenue and margin metrics",
    source: "Shopify settings",
    detail: {
      description: "Whether sales tax is included in revenue figures.",
      notes: "Recommended to keep tax excluded for clean profit reporting.",
    },
  },
  {
    id: "cac",
    setting: "CAC Definition",
    currentLogic: "Ad Spend / New Customers",
    source: "Paid Media + Shopify",
    detail: {
      description: "Customer Acquisition Cost.",
      formula: "Total Paid Ad Spend / New Customers in period",
      notes: "Only first-time customers are counted as new.",
    },
  },
  {
    id: "mer",
    setting: "MER Definition",
    currentLogic: "Net Revenue / Ad Spend",
    source: "Shopify + Paid Media",
    detail: {
      description: "Marketing Efficiency Ratio — blended return on ad spend.",
      formula: "Net Revenue / Total Ad Spend",
    },
  },
  {
    id: "attribution",
    setting: "Attribution Window",
    currentLogic: "7-day click, 1-day view",
    source: "Platform default",
    detail: {
      description: "Window used when comparing platform-reported attribution.",
      notes: "Window can vary by source. Switch the Measurement source to compare.",
    },
  },
  {
    id: "new-vs-returning",
    setting: "New vs Returning Customer",
    currentLogic: "First order in lifetime = New, otherwise Returning",
    source: "Shopify customer history",
    detail: {
      description: "How customers are classified for acquisition reporting.",
    },
  },
]

export function CalculationSettings() {
  const [active, setActive] = useState<CalculationRow | null>(null)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>Calculation Settings</CardTitle>
            <CardDescription>
              How key metrics are calculated and where each input comes from. These are
              informational for the current demo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-md border border-border md:block">
          <div className="grid grid-cols-12 gap-3 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Setting</div>
            <div className="col-span-5">Current Logic</div>
            <div className="col-span-3">Source</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div className="divide-y divide-border">
            {calculationRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 items-center gap-3 px-4 py-2.5 text-xs hover:bg-muted/20"
              >
                <div className="col-span-3 font-medium text-foreground">{row.setting}</div>
                <div className="col-span-5 text-muted-foreground">{row.currentLogic}</div>
                <div className="col-span-3 text-muted-foreground">{row.source}</div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActive(row)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Review
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile list */}
        <div className="space-y-2 md:hidden">
          {calculationRows.map((row) => (
            <button
              key={row.id}
              onClick={() => setActive(row)}
              className="flex w-full flex-col gap-1 rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-muted/30"
            >
              <span className="text-xs font-semibold text-foreground">{row.setting}</span>
              <span className="text-[11px] text-muted-foreground">{row.currentLogic}</span>
              <span className="text-[10px] text-muted-foreground/80">Source: {row.source}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                Review
                <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Editing these calculations is not yet available. This view is for review and
          transparency.
        </p>
      </CardContent>

      {/* Review modal */}
      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" />
              {active?.setting}
            </DialogTitle>
            {active?.detail.description && (
              <DialogDescription className="text-xs">
                {active.detail.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {active && (
            <div className="space-y-3">
              <dl className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Current logic</dt>
                  <dd className="text-right font-medium text-foreground">
                    {active.currentLogic}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="text-right font-medium text-foreground">{active.source}</dd>
                </div>
              </dl>

              {active.detail.formula && (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Formula
                  </p>
                  <p className="font-mono text-xs leading-relaxed text-foreground">
                    {active.detail.formula}
                  </p>
                </div>
              )}

              {active.detail.notes && (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {active.detail.notes}
                </p>
              )}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setActive(null)}
            >
              <X className="mr-1 h-3 w-3" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
