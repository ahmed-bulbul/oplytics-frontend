"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface AssumptionRow {
  label: string
  value: string
  source?: string
}

const baseAssumptions: AssumptionRow[] = [
  { label: "AOV", value: "$91.60", source: "Last 30 days, blended" },
  { label: "Gross margin", value: "65.4%", source: "Catalog-weighted from product COGS" },
  { label: "Refund rate", value: "3.4%", source: "Last 30 days, blended" },
  { label: "Blended CAC", value: "$31.10", source: "All paid channels" },
  { label: "CPA target", value: "$22.00", source: "Set in Goals & Targets" },
  { label: "Conversion rate", value: "3.42%", source: "Sessions → orders, last 30 days" },
  { label: "Repeat purchase rate (90d)", value: "26%", source: "12-month average" },
  { label: "Measurement source", value: "Shopify Blended", source: "Platform-reported × deduped" },
  { label: "Date range", value: "Current month-to-date", source: "Updated daily" },
]

interface ForecastAssumptionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForecastAssumptionsSheet({ open, onOpenChange }: ForecastAssumptionsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1.5 border-b border-border pb-4">
          <SheetTitle className="text-base">Forecast assumptions</SheetTitle>
          <p className="text-xs text-muted-foreground text-pretty">
            Forecasts use these inputs by default. Adjust them to model how performance changes
            under different planning scenarios.
          </p>
        </SheetHeader>

        <div className="space-y-3 py-4">
          {baseAssumptions.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-xs font-medium text-foreground">{row.label}</p>
                {row.source && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{row.source}</p>
                )}
              </div>
              <p className="text-sm font-semibold tabular-nums text-foreground">{row.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Adjust assumptions
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
