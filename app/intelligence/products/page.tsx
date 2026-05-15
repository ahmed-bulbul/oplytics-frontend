"use client"

import { useMemo, useState } from "react"
import {
  Award,
  TrendingDown,
  AlertTriangle,
  Users2,
  Sparkles,
  PackageX,
  Boxes,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { MeasurementSourceSelector } from "@/components/dashboard/measurement-source-selector"
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { IntelligenceStatusPill } from "@/components/intelligence/intelligence-status-pill"
import {
  productRows,
  ProductRow,
} from "@/components/intelligence/products/product-data"
import { ProductDetailDrawer } from "@/components/intelligence/products/product-detail-drawer"
import { StockoutRiskPill } from "@/components/intelligence/stockout-risk-pill"
import { BenchmarkCallout } from "@/components/intelligence/benchmark-callout"

const categoryOptions = [
  "All categories",
  "Apparel",
  "Footwear",
  "Accessories",
  "Home",
  "Outdoor",
] as const

const statusOptions = [
  "All statuses",
  "Profitable",
  "Strong LTV",
  "Low Margin",
  "Needs COGS",
  "High Refunds",
  "Watch",
  "Stockout Risk",
] as const

const inventoryOptions = [
  "All inventory",
  "Low (≤ 14 days)",
  "Healthy (15–60 days)",
  "Overstock (> 60 days)",
] as const

const marginOptions = [
  "All margins",
  "≥ 40% margin",
  "25–40% margin",
  "< 25% margin",
] as const

function ProductsInner() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All categories")
  const [statusFilter, setStatusFilter] = useState<string>("All statuses")
  const [marginFilter, setMarginFilter] = useState<string>("All margins")
  const [inventoryFilter, setInventoryFilter] = useState<string>("All inventory")
  const [selected, setSelected] = useState<ProductRow | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return productRows.filter((p) => {
      const matchesCategory =
        categoryFilter === "All categories" || p.category === categoryFilter
      const matchesStatus = statusFilter === "All statuses" || p.status === statusFilter
      const matchesMargin =
        marginFilter === "All margins" ||
        (marginFilter === "≥ 40% margin" && p.contributionMarginPct >= 40) ||
        (marginFilter === "25–40% margin" &&
          p.contributionMarginPct >= 25 &&
          p.contributionMarginPct < 40) ||
        (marginFilter === "< 25% margin" && p.contributionMarginPct < 25)
      const matchesInventory =
        inventoryFilter === "All inventory" ||
        (inventoryFilter === "Low (≤ 14 days)" && p.daysOfInventory <= 14) ||
        (inventoryFilter === "Healthy (15–60 days)" &&
          p.daysOfInventory > 14 &&
          p.daysOfInventory <= 60) ||
        (inventoryFilter === "Overstock (> 60 days)" && p.daysOfInventory > 60)
      return matchesCategory && matchesStatus && matchesMargin && matchesInventory
    })
  }, [categoryFilter, statusFilter, marginFilter, inventoryFilter])

  // Inventory roll-ups for the cards row
  const inventoryStats = useMemo(() => {
    const rows = productRows
    const atRisk = rows.filter(
      (p) => p.stockoutRisk === "High" || p.stockoutRisk === "Critical",
    )
    const safeToScale = rows.filter(
      (p) =>
        p.stockoutRisk === "Low" &&
        p.contributionMarginPct >= 30 &&
        p.daysOfInventory >= 30,
    )
    const totalRevenueAtRisk = rows.reduce((s, p) => s + p.revenueAtRisk, 0)
    const totalCmAtRisk = rows.reduce((s, p) => s + p.contributionMarginAtRisk, 0)
    const lowInvWithSpend = rows.filter(
      (p) =>
        (p.stockoutRisk === "High" || p.stockoutRisk === "Critical") &&
        p.adSpend > 0,
    )
    return {
      atRiskCount: atRisk.length,
      safeToScaleCount: safeToScale.length,
      totalRevenueAtRisk,
      totalCmAtRisk,
      lowInvWithSpendCount: lowInvWithSpend.length,
    }
  }, [])

  const handleView = (row: ProductRow) => {
    setSelected(row)
    setOpen(true)
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Product Profitability"
        subtitle="See which products drive revenue, margin, repeat purchase, and long-term customer value."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={marginFilter} onValueChange={setMarginFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Margin range" />
          </SelectTrigger>
          <SelectContent>
            {marginOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Inventory" />
          </SelectTrigger>
          <SelectContent>
            {inventoryOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <MeasurementSourceSelector />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <IntelligenceSummaryCard
          label="Most Profitable Product"
          value="Premium Cotton Tee"
          caption="Cont. margin: $12,420"
          icon={Award}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Highest 90-Day LTV"
          value="All-Weather Jacket"
          caption="$156.40"
          icon={Users2}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Lowest Margin"
          value="Trail Runner"
          caption="Cont. margin %: 18.8%"
          icon={TrendingDown}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Highest Refund Rate"
          metricKey="Refund Rate"
          value="Trail Runner"
          caption="Refund rate: 8.4%"
          icon={AlertTriangle}
          tone="negative"
        />
        <IntelligenceSummaryCard
          label="Best Acquisition Product"
          value="Premium Cotton Tee"
          caption="CAC: $24.10"
          icon={Sparkles}
          tone="positive"
        />
      </div>

      {/* Inventory-aware section */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Inventory signals
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Stockout risk, days of inventory, and revenue at risk from current
              ad spend mix.
            </p>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Source: Shopify inventory
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <IntelligenceSummaryCard
            label="Products at stockout risk"
            metricKey="Stockout Risk"
            value={String(inventoryStats.atRiskCount)}
            caption="High or critical risk in next 14 days"
            icon={PackageX}
            tone="negative"
          />
          <IntelligenceSummaryCard
            label="Safe to scale"
            value={String(inventoryStats.safeToScaleCount)}
            caption="≥30 days inventory · margin ≥30%"
            icon={Boxes}
            tone="positive"
          />
          <IntelligenceSummaryCard
            label="Revenue at risk"
            value={`$${inventoryStats.totalRevenueAtRisk.toLocaleString()}`}
            caption="If at-risk SKUs sell out"
            icon={AlertTriangle}
            tone="warning"
          />
          <IntelligenceSummaryCard
            label="Cont. margin at risk"
            value={`$${inventoryStats.totalCmAtRisk.toLocaleString()}`}
            caption="Margin tied to at-risk SKUs"
            icon={TrendingDown}
            tone="warning"
          />
          <IntelligenceSummaryCard
            label="At-risk SKUs receiving spend"
            value={String(inventoryStats.lowInvWithSpendCount)}
            caption="Review spend allocation"
            icon={AlertTriangle}
            tone={
              inventoryStats.lowInvWithSpendCount > 0 ? "warning" : "positive"
            }
          />
        </div>
        <BenchmarkCallout
          metricLabel="Refund rate"
          value="3.4%"
          comparison="Higher than category benchmark of 2.6% for Apparel + Footwear catalogs."
          tone="worse"
        />
      </div>

      {/* Product Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Products</h3>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Source: Shopify + COGS Rules
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[200px] text-muted-foreground">Product</TableHead>
                <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
                <TableHead className="text-right text-muted-foreground">Orders</TableHead>
                <TableHead className="text-right text-muted-foreground">AOV</TableHead>
                <TableHead className="text-right text-muted-foreground">COGS</TableHead>
                <TableHead className="text-right text-muted-foreground">Ad Spend</TableHead>
                <TableHead className="text-right text-muted-foreground">Contribution Margin</TableHead>
                <TableHead className="text-right text-muted-foreground">CM %</TableHead>
                <TableHead className="text-right text-muted-foreground">Refund %</TableHead>
                <TableHead className="text-right text-muted-foreground">CAC</TableHead>
                <TableHead className="text-right text-muted-foreground">90-Day LTV</TableHead>
                <TableHead className="text-right text-muted-foreground">Repeat %</TableHead>
                <TableHead className="text-right text-muted-foreground">Inventory</TableHead>
                <TableHead className="text-right text-muted-foreground">Days Left</TableHead>
                <TableHead className="text-muted-foreground">Stockout</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-border hover:bg-muted/40 cursor-pointer"
                  onClick={() => handleView(p)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {p.orders.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.aov.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.cogs.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.adSpend.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${p.contributionMargin < 0 ? "text-rose-600" : "text-foreground"}`}
                  >
                    ${p.contributionMargin.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {p.contributionMarginPct.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${p.refundRate > 5 ? "text-rose-600" : "text-foreground"}`}
                  >
                    {p.refundRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.cac.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    ${p.ltv90.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {p.repeatRate}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {p.inventoryOnHand.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs ${
                      p.daysOfInventory <= 14
                        ? "text-rose-600"
                        : p.daysOfInventory <= 30
                          ? "text-amber-600"
                          : "text-foreground"
                    }`}
                  >
                    {p.daysOfInventory}d
                  </TableCell>
                  <TableCell>
                    <StockoutRiskPill risk={p.stockoutRisk} />
                  </TableCell>
                  <TableCell>
                    <IntelligenceStatusPill status={p.status} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => handleView(p)}
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProductDetailDrawer product={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default function ProductProfitabilityPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <ProductsInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
