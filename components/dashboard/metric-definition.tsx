"use client"

import { Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MetricDef {
  description: string
  formula?: string
  notes?: string
  source?: string
}

const DEFINITIONS: Record<string, MetricDef> = {
  Revenue: {
    description: "Total gross revenue generated from all sales channels within the selected date range, before any deductions.",
    formula: "Sum of all order values (before refunds, discounts, or returns)",
    notes: "Includes all payment methods and currencies, converted to your base currency.",
    source: "Shopify",
  },
  "Net Revenue": {
    description: "Revenue after refunds, returns, and discounts have been deducted.",
    formula: "Gross Revenue - Refunds - Returns - Discounts",
    notes: "This is the actual revenue retained by the business.",
    source: "Shopify",
  },
  Orders: {
    description: "Total number of confirmed orders placed across all sales channels within the selected date range.",
    formula: "Count of all orders with a confirmed or completed status",
    notes: "Excludes cancelled and pending orders. Includes both new and returning customer orders.",
    source: "Shopify",
  },
  "Ad Spend": {
    description: "Total amount spent across all active paid advertising channels within the selected date range.",
    formula: "Sum of spend across Meta Ads + Google Ads + TikTok Ads",
    notes: "Reported in your base currency. Spend is pulled daily from each platform's API.",
    source: "Meta Ads + Google Ads + TikTok Ads",
  },
  MER: {
    description: "Marketing Efficiency Ratio measures how much revenue is generated for every dollar spent on advertising.",
    formula: "Total Revenue / Total Ad Spend",
    notes: "A higher MER indicates more efficient use of ad budget. Does not account for organic revenue.",
    source: "Shopify + Paid Media",
  },
  "Contribution Margin %": {
    description: "Contribution Margin % is the share of net revenue remaining after all variable costs.",
    formula: "(Net Revenue - COGS - Ad Spend - Discounts - Shipping Subsidies - Transaction Fees - Refunds) / Net Revenue",
    notes: "The primary profit health ratio. Tracks margin durability over time, independent of revenue scale.",
    source: "Shopify + COGS Rules + Paid Media",
  },
  AOV: {
    description: "Average Order Value is the mean dollar amount spent each time a customer places an order.",
    formula: "Total Revenue / Total Number of Orders",
    notes: "Useful for tracking the impact of upsell and cross-sell strategies over time.",
    source: "Shopify",
  },
  CPA: {
    description: "Cost Per Acquisition is the average ad spend required to acquire one paying customer.",
    formula: "Total Ad Spend / Total Number of Orders (from paid channels)",
    notes: "Only orders attributed to paid channels are counted. Attribution window is 7-day click, 1-day view.",
    source: "Shopify + Paid Media",
  },
  CAC: {
    description: "Customer Acquisition Cost is the total cost to acquire one new customer, including ad spend and other marketing costs.",
    formula: "Total Marketing Spend / Number of New Customers Acquired",
    notes: "Broader than CPA — includes all marketing costs, not just paid ads. Excludes returning customers.",
    source: "Shopify + Paid Media",
  },
  "New Customers": {
    description: "Total number of customers who made their first-ever purchase within the selected date range.",
    formula: "Count of orders where customer has no prior purchase history",
    notes: "Identified by email address and customer ID across all connected sales channels.",
    source: "Shopify",
  },
  Returning: {
    description: "Total number of customers who have made at least one previous purchase and placed another order within the selected date range.",
    formula: "Count of orders where customer has at least 1 prior purchase",
    notes: "A higher returning customer rate generally indicates strong retention and product-market fit.",
    source: "Shopify",
  },
  ROAS: {
    description: "Return on Ad Spend measures the revenue generated for every dollar spent on a specific campaign or channel.",
    formula: "Attributed Revenue / Ad Spend",
    notes: "Uses platform-reported attribution. Compare with MER for blended view.",
    source: "Platform-reported",
  },
  "Conv. Rate": {
    description: "Conversion Rate is the percentage of sessions that result in a purchase.",
    formula: "Orders / Sessions × 100",
    notes: "Higher rates indicate better funnel efficiency.",
    source: "Shopify + GA4",
  },
  LTV: {
    description: "Lifetime Value is the predicted total revenue a customer will generate over their relationship with your brand.",
    formula: "Average Order Value × Purchase Frequency × Customer Lifespan",
    notes: "Used to determine how much you can afford to spend on acquisition.",
    source: "Shopify (calculated)",
  },
  "Gross Profit": {
    description: "Revenue minus Cost of Goods Sold before marketing and operating expenses.",
    formula: "Revenue - COGS",
    notes: "Does not include marketing spend or other operating costs.",
    source: "Shopify + COGS Rules",
  },
  Sessions: {
    description: "Total number of unique browsing sessions on your store within the selected date range.",
    formula: "Count of unique sessions (30-min inactivity window)",
    notes: "One visitor can have multiple sessions.",
    source: "Shopify + GA4",
  },
  // Subscription / retention
  MRR: {
    description: "Monthly Recurring Revenue is the predictable monthly revenue from active subscriptions.",
    formula: "Sum of (active subscriptions × billing amount, normalized to monthly)",
    notes: "Excludes one-off purchases. Annual plans are amortized to a monthly equivalent.",
    source: "Shopify Subscriptions",
  },
  NRR: {
    description: "Net Revenue Retention measures how much subscription revenue you keep, expand, or lose from existing customers.",
    formula: "(Starting MRR + Expansion - Contraction - Churn) / Starting MRR",
    notes: "100%+ means existing customers are growing in value. Below 100% indicates net contraction.",
    source: "Shopify Subscriptions",
  },
  "Subscription LTV": {
    description: "Average lifetime value of a subscriber based on observed retention and average revenue per user.",
    formula: "Average subscription duration × Average monthly revenue per subscriber",
    notes: "Updated as cohorts mature. Newer cohorts use blended forecasted retention.",
    source: "Shopify Subscriptions",
  },
  "Active Subscribers": {
    description: "Subscribers with at least one active recurring plan as of today.",
    formula: "Count of subscribers with status = active",
    notes: "Paused subscribers are excluded.",
    source: "Shopify Subscriptions",
  },
  "Churn Rate": {
    description: "Percentage of active subscribers who cancelled in the period.",
    formula: "Cancellations / Active Subscribers at start of period",
    notes: "Voluntary churn only — failed-payment churn is tracked separately.",
    source: "Shopify Subscriptions",
  },
  "M2 Retention": {
    description: "Share of a cohort that is still active in their second billing month.",
    formula: "Active subscribers in month 2 / total subscribers acquired in month 1",
    notes: "Heavily predictive of long-term LTV. Drops below benchmark are an early warning.",
    source: "Shopify Subscriptions",
  },
  Payback: {
    description: "Number of days for a customer's contribution margin to repay their acquisition cost.",
    formula: "CAC / (Average daily contribution margin per customer)",
    notes: "Shorter payback frees up cash to reinvest in growth. 60-90 days is a healthy DTC range.",
    source: "Shopify + Paid Media + COGS Rules",
  },
  // Inventory
  "Refund Rate": {
    description: "Percentage of orders that are refunded within the period.",
    formula: "Refunded orders / Total orders × 100",
    notes: "Spikes often indicate sizing, fit, or quality issues that compress margin.",
    source: "Shopify",
  },
  "Days of Inventory": {
    description: "Estimated number of days of stock remaining at the current sales velocity.",
    formula: "On-hand units / Average daily sales velocity",
    notes: "Below 14 days is a stockout-risk threshold for ad-driven SKUs.",
    source: "Shopify Inventory + Sales",
  },
  "Stockout Risk": {
    description: "Likelihood that a SKU will run out of inventory before the next replenishment.",
    formula: "Days of Inventory < lead-time threshold",
    notes: "High-risk SKUs receiving paid spend are flagged for review.",
    source: "Shopify Inventory + Sales",
  },
  // Creative
  CTR: {
    description: "Click-Through Rate is the percentage of impressions that result in a click.",
    formula: "Clicks / Impressions × 100",
    notes: "Higher CTR usually correlates with stronger creative-message fit.",
    source: "Meta Ads + TikTok Ads + Google Ads",
  },
  "Thumb-stop Rate": {
    description: "Percentage of viewers who stop scrolling within the first 3 seconds of a video ad.",
    formula: "3-second views / Impressions × 100",
    notes: "Industry benchmark is ~30%. Below 25% indicates weak hooks.",
    source: "Meta Ads + TikTok Ads",
  },
  "Hook Rate": {
    description: "Percentage of viewers who watch past the first 3 seconds of a video ad.",
    formula: "3-second video views / Total impressions × 100",
    notes: "Closely related to thumb-stop rate — both measure opening seconds.",
    source: "Meta Ads + TikTok Ads",
  },
  // Profit Hero sub-metric cards
  "Est. COGS": {
    description: "Estimated cost of goods sold for orders within the selected date range, derived from your COGS Rules.",
    formula: "Sum of (units sold × unit cost) across all orders in range",
    notes: "Uses default per-SKU costs from COGS Rules when actual landed cost is unavailable. Update overrides in Settings → Calculations.",
    source: "COGS Rules",
  },
  "Est. Gross Margin": {
    description: "Estimated profit remaining after subtracting cost of goods from net revenue, before marketing and operating costs.",
    formula: "Net Revenue − Est. COGS",
    notes: "Does not include ad spend, shipping subsidies, transaction fees, or returns. For full margin health, see Contribution Margin.",
    source: "Shopify + COGS Rules",
  },
  "Refunds / Returns": {
    description: "Total dollar value of refunds and product returns processed within the selected date range.",
    formula: "Sum of refunded order amounts + sum of return values",
    notes: "Includes both full and partial refunds. Spikes typically point to sizing, fit, or quality issues.",
    source: "Shopify",
  },
  // Goals / pacing
  Pacing: {
    description: "How current month-to-date performance compares to where it should be to hit the monthly goal.",
    formula: "Actual MTD / (Goal × % of month elapsed)",
    notes: "100% means on-track. Below 100% is behind pace, above is ahead.",
    source: "Goals & Targets",
  },
  // Cohort analysis
  Cohort: {
    description: "A group of customers grouped by the month they first purchased. Each row tracks the same customers over time so you can compare retention and LTV across cohorts.",
    formula: "Customers grouped by first-purchase month",
    notes: "Cohorts are immutable once formed — a customer stays in their original cohort even if they purchase again.",
    source: "Shopify customer/order data",
  },
  "New Users": {
    description: "The number of customers who made their first-ever purchase within the cohort's start month.",
    formula: "Count of customers with no prior order history in the cohort's start month",
    notes: "Defines the size of the cohort. Subsequent retention columns are measured against this base.",
    source: "Shopify",
  },
  Breakeven: {
    description: "The month in which the cohort's cumulative net revenue equals or exceeds the cost to acquire it (CAC).",
    formula: "First month where Σ (cumulative contribution per customer) ≥ CAC",
    notes: "Earlier breakeven means faster payback and more cash to reinvest in growth. M3 or sooner is healthy for most DTC brands.",
    source: "Shopify + Paid Media + COGS Rules",
  },
  "Cohort Retention": {
    description: "Percentage of customers from this cohort who placed at least one additional order in the given month after their first purchase.",
    formula: "Active customers in month N / Total customers in cohort × 100",
    notes: "M0 is always 100% (everyone purchased in their start month). Retention is non-cumulative — each column is its own month.",
    source: "Shopify",
  },
  // Subscription metrics
  "New Subscribers": {
    description: "Customers who started their first-ever subscription within the selected period.",
    formula: "Count of unique customers with their first active subscription in the period",
    notes: "A customer who upgrades or adds a second subscription is not counted again here.",
    source: "Shopify Subscriptions",
  },
  "New Subscriptions": {
    description: "Total number of new subscription contracts created in the period, including additional subscriptions from existing subscribers.",
    formula: "Count of subscriptions where created_at is within the period",
    notes: "Always greater than or equal to New Subscribers because one customer can hold multiple subscriptions.",
    source: "Shopify Subscriptions",
  },
  "Cancellation Rate": {
    description: "Percentage of active subscribers who cancelled their subscription during the period.",
    formula: "Cancellations / Active Subscribers at start of period × 100",
    notes: "Only voluntary cancellations are counted. Failed-payment churn is reported separately as involuntary churn.",
    source: "Shopify Subscriptions",
  },
  "Subscription Retention": {
    description: "Percentage of subscribers from initial signup who are still actively subscribed at the given month milestone.",
    formula: "Active subscribers at month N / Subscribers acquired at month 0 × 100",
    notes: "Heavily predictive of long-term LTV. Drops between milestones flag where churn is concentrated in the lifecycle.",
    source: "Shopify Subscriptions",
  },
}

interface MetricDefinitionProps {
  metric: string
}

export function MetricDefinition({ metric }: MetricDefinitionProps) {
  const def = DEFINITIONS[metric]
  if (!def) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors focus:outline-none"
          aria-label={`Definition for ${metric}`}
        >
          <Info className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {metric}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {def.description}
            </p>
          </div>

          {def.formula && (
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Formula</p>
              <p className="text-xs font-mono text-foreground leading-relaxed">
                {def.formula}
              </p>
            </div>
          )}

          {def.notes && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
              {def.notes}
            </p>
          )}

          {def.source && (
            <div className="flex items-center gap-1.5 border-t border-border pt-2 mt-2">
              <span className="text-[10px] font-medium text-muted-foreground">Source:</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                {def.source}
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
