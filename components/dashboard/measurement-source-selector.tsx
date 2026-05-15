"use client"

import { Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * MVP measurement-source surface.
 *
 * For the MVP every dashboard section depends on Shopify as the source
 * of truth (revenue, orders, customers, products, cohorts, refunds,
 * inventory) blended with channel-reported spend / impressions /
 * platform purchases. Showing a clickable Measurement dropdown today
 * implies the operator can swap that core source per-page, which we
 * cannot honor end-to-end yet — so this surface stays read-only.
 *
 * Visual treatment:
 *   - Renders as a small inline chip (text + Info icon), NOT a button.
 *     It is informational context, not a peer to the action buttons
 *     (Filter, Metric Selector, etc.).
 *   - Click opens a Popover that uses the SAME structure as the
 *     metric calculation popover used throughout the dashboard:
 *       title (uppercase) → description → source chip + description.
 *     This keeps every "tell me how this number was made" surface
 *     consistent across the product.
 *
 * The component name is intentionally preserved so that when multiple
 * real measurement sources are connected (Triple Whale, Northbeam,
 * post-purchase survey, incrementality testing) we can re-introduce a
 * dropdown here without touching any page mount sites.
 */
export function MeasurementSourceSelector() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Data view: Shopify blended"
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none"
        >
          <span className="hidden sm:inline">Data view:</span>
          <span className="font-medium text-foreground">Shopify blended</span>
          <Info className="h-3 w-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 space-y-3 p-4"
      >
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Data view
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            All metrics on this dashboard are calculated from Shopify
            orders blended with platform-reported ad spend and your COGS
            rules.
          </p>
        </div>

        <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
          Additional measurement providers (Triple Whale, Northbeam,
          post-purchase survey, incrementality) can be enabled in
          Settings → Integrations. Once connected, you&apos;ll be able to
          switch the data view per page.
        </p>

        <div className="space-y-1 border-t border-border pt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              Source
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
              Shopify blended
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Shopify orders + connected ad platform spend &amp; impressions,
            blended into MER, CPA, CAC, and contribution margin.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
