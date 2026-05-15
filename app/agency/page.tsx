"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  PackageX,
  Target,
  Search,
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { IntelligenceSummaryCard } from "@/components/intelligence/intelligence-summary-card"
import { agencyStores, AgencyStore, StoreHealth } from "@/components/agency/agency-data"
import { cn } from "@/lib/utils"

const healthOptions = ["All health", "Healthy", "Watch", "Critical"] as const
const categoryOptions = [
  "All categories",
  "Apparel",
  "Outdoor",
  "Footwear",
  "Home",
  "Accessories",
  "Food & Beverage",
] as const

const sortOptions = [
  { value: "revenue", label: "Revenue (high to low)" },
  { value: "cm", label: "Contribution margin %" },
  { value: "actions", label: "Open actions (most first)" },
  { value: "mom", label: "MoM revenue change" },
] as const

function HealthDot({ health }: { health: StoreHealth }) {
  const cls =
    health === "Healthy"
      ? "bg-emerald-500"
      : health === "Watch"
        ? "bg-amber-500"
        : "bg-rose-500"
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", cls)} aria-hidden />
      <span className="text-xs">{health}</span>
    </span>
  )
}

function MoMCell({ value }: { value: number }) {
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  const tone = positive ? "text-emerald-600" : "text-rose-600"
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs", tone)}>
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}

export default function AgencyPage() {
  const [search, setSearch] = useState("")
  const [health, setHealth] = useState<string>("All health")
  const [category, setCategory] = useState<string>("All categories")
  const [sortBy, setSortBy] = useState<string>("revenue")

  const filtered = useMemo(() => {
    let rows = agencyStores.filter((s) => {
      const matchesSearch =
        !search.trim() || s.name.toLowerCase().includes(search.toLowerCase())
      const matchesHealth = health === "All health" || s.health === health
      const matchesCategory = category === "All categories" || s.category === category
      return matchesSearch && matchesHealth && matchesCategory
    })
    rows = [...rows].sort((a, b) => {
      switch (sortBy) {
        case "cm":
          return b.contributionMarginPct - a.contributionMarginPct
        case "actions":
          return b.openActions - a.openActions
        case "mom":
          return b.monthOverMonthRevenue - a.monthOverMonthRevenue
        case "revenue":
        default:
          return b.revenue - a.revenue
      }
    })
    return rows
  }, [search, health, category, sortBy])

  const stats = useMemo(() => {
    const rows = agencyStores
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
    const totalCm = rows.reduce((s, r) => s + r.contributionMargin, 0)
    const blendedCmPct = (totalCm / totalRevenue) * 100
    const critical = rows.filter((r) => r.health === "Critical").length
    const totalOpenActions = rows.reduce((s, r) => s + r.openActions, 0)
    const totalGoalsAtRisk = rows.reduce((s, r) => s + r.goalsAtRisk, 0)
    const totalStockoutRisks = rows.reduce((s, r) => s + r.stockoutRiskCount, 0)
    return {
      totalRevenue,
      totalCm,
      blendedCmPct,
      critical,
      totalOpenActions,
      totalGoalsAtRisk,
      totalStockoutRisks,
    }
  }, [])

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Agency"
        subtitle="Multi-store performance roll-up. Compare contribution margin, blended ROAS, and open actions across your portfolio."
      />

      {/* Portfolio summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <IntelligenceSummaryCard
          label="Total revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}k`}
          caption={`${agencyStores.length} stores · this month`}
          icon={Building2}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Blended CM%"
          value={`${stats.blendedCmPct.toFixed(1)}%`}
          caption={`$${(stats.totalCm / 1000).toFixed(0)}k contribution margin`}
          icon={TrendingUp}
          tone="positive"
        />
        <IntelligenceSummaryCard
          label="Stores at risk"
          value={String(stats.critical)}
          caption="Critical health status"
          icon={AlertTriangle}
          tone={stats.critical > 0 ? "negative" : "positive"}
        />
        <IntelligenceSummaryCard
          label="Open actions"
          value={String(stats.totalOpenActions)}
          caption="Across all stores"
          icon={CheckCircle2}
          tone="warning"
        />
        <IntelligenceSummaryCard
          label="Goals at risk"
          value={String(stats.totalGoalsAtRisk)}
          caption="Pacing behind target"
          icon={Target}
          tone={stats.totalGoalsAtRisk > 0 ? "warning" : "positive"}
        />
        <IntelligenceSummaryCard
          label="Stockout risks"
          value={String(stats.totalStockoutRisks)}
          caption="High/critical SKUs"
          icon={PackageX}
          tone={stats.totalStockoutRisks > 0 ? "warning" : "positive"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Select value={health} onValueChange={setHealth}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Health" />
          </SelectTrigger>
          <SelectContent>
            {healthOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger size="sm" className="h-8 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Export portfolio
          </Button>
          <Button size="sm" className="h-8 text-xs">
            Compare stores
          </Button>
        </div>
      </div>

      {/* Stores table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">Store</TableHead>
              <TableHead className="text-muted-foreground">Health</TableHead>
              <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
              <TableHead className="text-right text-muted-foreground">MoM</TableHead>
              <TableHead className="text-right text-muted-foreground">Spend</TableHead>
              <TableHead className="text-right text-muted-foreground">CM %</TableHead>
              <TableHead className="text-right text-muted-foreground">ROAS</TableHead>
              <TableHead className="text-right text-muted-foreground">CAC</TableHead>
              <TableHead className="text-right text-muted-foreground">Refund %</TableHead>
              <TableHead className="text-right text-muted-foreground">Open</TableHead>
              <TableHead className="text-right text-muted-foreground">Goals</TableHead>
              <TableHead className="text-right text-muted-foreground">Stockouts</TableHead>
              <TableHead className="text-muted-foreground">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <StoreRow key={s.id} store={s} />
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  No stores match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-muted-foreground">
        Agency mode lets you switch between or compare stores. Click any row to drill into that store&apos;s
        full Optilytics workspace, or use Compare to see two stores side-by-side.
      </p>
    </div>
  )
}

function StoreRow({ store }: { store: AgencyStore }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{store.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {store.category} · {store.spendTier} · last review {store.lastReview}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <HealthDot health={store.health} />
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        ${store.revenue.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <MoMCell value={store.monthOverMonthRevenue} />
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        ${store.spend.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        {store.contributionMarginPct.toFixed(1)}%
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        {store.blendedRoas.toFixed(2)}x
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        ${store.cac.toFixed(2)}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono text-xs",
          store.refundRate > 5 && "text-rose-600",
        )}
      >
        {store.refundRate.toFixed(1)}%
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        {store.openActions > 0 ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {store.openActions}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        {store.goalsAtRisk > 0 ? (
          <span className="text-amber-600">{store.goalsAtRisk}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs">
        {store.stockoutRiskCount > 0 ? (
          <span className="text-amber-600">{store.stockoutRiskCount}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{store.owner}</TableCell>
    </TableRow>
  )
}
