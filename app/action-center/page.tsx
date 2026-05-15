"use client"

import { useEffect, useState } from "react"
import { ChevronRight, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { AdvancedFilter } from "@/components/dashboard/advanced-filter"
import { MeasurementSourceSelector } from "@/components/dashboard/measurement-source-selector"
import { Insights, type InsightItem, type InsightItems } from "@/components/dashboard/insights"
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import {
  ActionableRow,
  actionableData,
  actionSummary,
  ManageActionSummary,
  ManageStatusPill,
  ManageReasonCell,
  ManageActionCell,
  ManageRecommendedActionCell,
  ManageBulkActionBar,
  ManageRowDetailDrawer,
  SummaryFilter,
  impactConfig,
  ActionCenterColumnPicker,
  ACTION_CENTER_METRICS_BY_ID,
  DEFAULT_VISIBLE_METRIC_IDS,
  ACTION_CENTER_COLUMNS_STORAGE_KEY,
  type ActionCenterMetric,
} from "@/components/dashboard/manage"
import {
  ConnectionStatus,
  ActionLogTriggerButton,
} from "@/components/dashboard/approved-actions"

type ViewLevel = "all" | "campaigns" | "adsets" | "ads"

/**
 * Status-aware cell renderer used by the dynamic metric loop. Most metrics
 * render as plain right-aligned numerics, but ROAS turns rose for critical
 * rows / blue for opportunity rows, and CPA turns rose for critical rows —
 * preserving the visual cues that existed before the columns became
 * configurable.
 */
function MetricCell({ row, metric }: { row: ActionableRow; metric: ActionCenterMetric }) {
  const value = metric.accessor(row)

  if (metric.id === "roas") {
    return (
      <TableCell className="text-right tabular-nums text-sm">
        <span
          className={cn(
            row.status === "critical" && "text-rose-600",
            row.status === "opportunity" && "text-blue-600",
          )}
        >
          {value}
        </span>
      </TableCell>
    )
  }

  if (metric.id === "cpa") {
    return (
      <TableCell className="text-right tabular-nums text-sm">
        <span className={cn(row.status === "critical" && "text-rose-600")}>
          {value}
        </span>
      </TableCell>
    )
  }

  return (
    <TableCell
      className={cn(
        "text-sm",
        metric.align === "right" ? "text-right tabular-nums" : "text-left",
      )}
    >
      {value}
    </TableCell>
  )
}

function ActionableRowComponent({
  row,
  depth = 0,
  selected,
  visibleMetrics,
  onSelect,
  onView,
  onAction,
}: {
  row: ActionableRow
  depth?: number
  selected: boolean
  visibleMetrics: ActionCenterMetric[]
  onSelect: (id: string, checked: boolean) => void
  onView: (row: ActionableRow) => void
  onAction: (row: ActionableRow, action: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = row.children && row.children.length > 0

  return (
    <>
      <TableRow 
        className={cn(
          "border-border hover:bg-muted/50 cursor-pointer",
          selected && "bg-primary/5"
        )}
      >
        {/* Checkbox */}
        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(row.id, checked as boolean)}
          />
        </TableCell>
        {/* Priority */}
        <TableCell className="text-center">
          <span className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
            row.priority <= 2 && "bg-rose-500/10 text-rose-600",
            row.priority === 3 && "bg-amber-500/10 text-amber-600",
            row.priority >= 4 && "bg-slate-500/10 text-slate-600"
          )}>
            {row.priority}
          </span>
        </TableCell>
        {/* Name */}
        <TableCell
          className="font-medium"
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <span className={cn("truncate", depth > 0 && "text-muted-foreground")}>
              {row.name}
            </span>
          </div>
        </TableCell>
        {/* Level */}
        <TableCell>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {row.level}
          </span>
        </TableCell>
        {/* Status */}
        <TableCell>
          <ManageStatusPill status={row.status} />
        </TableCell>
        {/* Impact */}
        <TableCell>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded",
            impactConfig[row.impact].bgColor,
            impactConfig[row.impact].color
          )}>
            {impactConfig[row.impact].label}
          </span>
        </TableCell>
        {/* Dynamic metric columns (driven by the column picker) */}
        {visibleMetrics.map((metric) => (
          <MetricCell key={metric.id} row={row} metric={metric} />
        ))}
        {/* Reason */}
        <TableCell>
          <ManageReasonCell reason={row.reason} status={row.status} />
        </TableCell>
        {/* Recommended Action */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <ManageRecommendedActionCell
            status={row.status}
            recommendedAction={row.recommendedAction}
            approvedAction={row.approvedAction}
            onAction={(action) => onAction(row, action)}
          />
        </TableCell>
        {/* Actions */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <ManageActionCell
            isActive={row.status !== "critical"}
            itemId={row.id}
            itemName={row.name}
            onView={() => onView(row)}
            onAction={(action) => onAction(row, action)}
          />
        </TableCell>
      </TableRow>
      {expanded &&
        row.children?.map((child) => (
          <ActionableRowComponent
            key={child.id}
            row={child}
            depth={depth + 1}
            selected={selected}
            visibleMetrics={visibleMetrics}
            onSelect={onSelect}
            onView={onView}
            onAction={onAction}
          />
        ))}
    </>
  )
}

function ManagePageInner() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailRow, setDetailRow] = useState<ActionableRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>(null)

  /**
   * Visible metric column ids. Persisted across page loads so an operator's
   * preferred view sticks. We hydrate from localStorage in an effect (rather
   * than `useState` initializer) so server-rendered HTML stays consistent
   * between client and server and we don't trigger a hydration mismatch.
   */
  const [visibleMetricIds, setVisibleMetricIds] =
    useState<string[]>(DEFAULT_VISIBLE_METRIC_IDS)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACTION_CENTER_COLUMNS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed) &&
        parsed.every((id) => typeof id === "string" && id in ACTION_CENTER_METRICS_BY_ID)
      ) {
        setVisibleMetricIds(parsed.length > 0 ? parsed : DEFAULT_VISIBLE_METRIC_IDS)
      }
    } catch {
      // Corrupt or missing — fall back to defaults silently.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ACTION_CENTER_COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleMetricIds),
      )
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [visibleMetricIds])

  // Materialize the visible metrics in their canonical column order so
  // header cells and body cells stay in lockstep.
  const visibleMetrics = visibleMetricIds
    .map((id) => ACTION_CENTER_METRICS_BY_ID[id])
    .filter((m): m is ActionCenterMetric => Boolean(m))

  // Helper to check if row matches summary filter.
  //
  // Three buckets, one-to-one with the Insights panel columns and the
  // filter chips: critical + watch fold together as "attention", and
  // healthy rows get their own bucket so operators can verify their
  // best campaigns aren't quietly slipping. Same vocabulary across the
  // chips, the column headers, and this filter — that consistency is
  // the whole point of the consolidation.
  const matchesSummaryFilter = (row: ActionableRow): boolean => {
    if (!summaryFilter) return true
    switch (summaryFilter) {
      case "attention":
        return row.status === "critical" || row.status === "watch"
      case "scale":
        return row.status === "opportunity"
      case "healthy":
        return row.status === "healthy"
      default:
        return true
    }
  }

  // Recursively filter data including children
  const filterWithChildren = (rows: ActionableRow[]): ActionableRow[] => {
    return rows.reduce<ActionableRow[]>((acc, row) => {
      const matchesLevel = viewLevel === "all" ||
        (viewLevel === "campaigns" && row.level === "Campaign") ||
        (viewLevel === "adsets" && row.level === "Ad Set") ||
        (viewLevel === "ads" && row.level === "Ad")

      const matchesSummary = matchesSummaryFilter(row)
      const filteredChildren = row.children ? filterWithChildren(row.children) : []

      // Include row if it matches OR if any of its children match
      if (
        (matchesLevel && matchesSummary) ||
        filteredChildren.length > 0
      ) {
        acc.push({
          ...row,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        })
      }
      
      return acc
    }, [])
  }

  const filteredData = filterWithChildren(actionableData)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>()
      const addIds = (rows: ActionableRow[]) => {
        rows.forEach((row) => {
          allIds.add(row.id)
          if (row.children) addIds(row.children)
        })
      }
      addIds(filteredData)
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const handleView = (row: ActionableRow) => {
    setDetailRow(row)
    setDrawerOpen(true)
  }

  const handleAction = (row: ActionableRow, action: string) => {
    // Mock action handling - in production this would call backend
    console.log(`Action: ${action} on ${row.name}`)
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on ${Array.from(selectedIds).join(", ")}`)
    setSelectedIds(new Set())
  }

  const allSelected = filteredData.length > 0 && 
    filteredData.every((row) => selectedIds.has(row.id))

  /**
   * Flatten the (possibly nested) action data into a Map keyed by row id
   * so an insight item can resolve back to its row in O(1) when clicked,
   * even if the row lives inside a parent campaign's `children` array.
   */
  const rowsById = (() => {
    const map = new Map<string, ActionableRow>()
    const walk = (rows: ActionableRow[]) => {
      rows.forEach((row) => {
        map.set(row.id, row)
        if (row.children) walk(row.children)
      })
    }
    walk(actionableData)
    return map
  })()

  /**
   * Action-Center insight items derived directly from the table below.
   * Every entry's `id` matches a row id in `actionableData`, so clicking
   * an insight opens that row's detail drawer — guaranteeing the panel
   * and the table are always describing the same world. Phrasing
   * mirrors the row's `reason` / `expectedImpact` so the operator hears
   * one consistent voice across both surfaces.
   */
  const insightsItems: InsightItems = {
    keyChanges: [
      {
        id: "tiktok-ugc",
        title: "TikTok UGC ROAS hit 4.0x",
        description: "Strongest performer in the table — CPA at $18 vs $30 target.",
        action: "Open",
        meta: "Campaign",
      },
      {
        id: "google-search",
        title: "Google Search efficiency softening",
        description: "ROAS down 9% this week while CPC ticks up — watch closely.",
        action: "Open",
        meta: "Campaign",
      },
      {
        id: "summer-sale",
        title: "Summer Sale above target 7 days",
        description: "ROAS 3.2x with stable spend — shows headroom to scale.",
        action: "Open",
        meta: "Campaign",
      },
    ],
    attention: [
      {
        id: "display-prospecting",
        title: "Display Prospecting CPA 60% over target",
        description: "Ten-plus days at $72 vs $45 — $1,200/wk margin at risk.",
        action: "Open",
        meta: "Campaign",
      },
      {
        id: "inventory-cotton-tee-stockout",
        title: "Premium Cotton Tee — 11 days of stock",
        description: "$24,100 revenue at risk if SKU sells out before reorder.",
        action: "Open",
        meta: "Inventory",
      },
      {
        id: "product-trail-runner-refunds",
        title: "Trail Runner refund rate 8.4%",
        description: "Three times the store average — $1,400/wk margin at risk.",
        action: "Open",
        meta: "Product",
      },
    ],
    opportunities: [
      {
        id: "summer-sale",
        title: "Increase Summer Sale budget",
        description: "Approved action available · +$900/wk margin (modeled).",
        action: "Preview",
        meta: "Campaign",
      },
      {
        id: "tiktok-ugc",
        title: "Scale TikTok UGC further",
        description: "Confidence 95% · +$2,400/wk revenue if reallocated.",
        action: "Open",
        meta: "Campaign",
      },
      {
        id: "summer-sale-interest",
        title: "Lean into Interest Targeting - Fashion",
        description: "Approved action available · child of Summer Sale, 88% confidence.",
        action: "Preview",
        meta: "Ad Set",
      },
    ],
  }

  /**
   * Routes an insight click back to the row's detail drawer. If the row
   * is nested inside a parent (e.g. an ad set under Summer Sale), it
   * still opens correctly because we resolved through `rowsById`.
   */
  const handleInsightClick = (item: InsightItem) => {
    const row = rowsById.get(item.id)
    if (!row) return
    setDetailRow(row)
    setDrawerOpen(true)
  }

  return (
    <div className="p-4 space-y-4 md:p-6 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">Action Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5 md:text-sm md:mt-1">
            Prioritized actions to improve profit, reduce wasted spend, and scale what&apos;s working.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground italic">
            AI recommends. Human approves. Optilytics executes and logs.
          </p>
        </div>
        {/*
          Approved Actions Beta surface: shows operators which paid-platform
          connections currently support executing approved actions, plus a
          one-click entry into the immutable Action Log. Both pieces live
          here so they are discoverable from the same surface that lists
          the approval-eligible rows.
        */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <ConnectionStatus />
          <ActionLogTriggerButton />
        </div>
      </div>

      {/*
        Sticky filter toolbar. Lives outside the header block so its
        sticky containing block is the full-height page wrapper, which
        keeps it pinned to the top of the scroll area for the entire page
        rather than just while the title is visible. Negative horizontal
        margins cancel the page padding so the backdrop spans full width
        beneath the global top bar.
      */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker />
          <AdvancedFilter />
          <div className="ml-auto">
            <MeasurementSourceSelector />
          </div>
        </div>
      </div>

      {/*
        Filter chips. Three buckets that exactly mirror the Insights
        panel columns below — clicking either surface drives the same
        `summaryFilter` state, so the chips and column headers act as
        two views of one control.
      */}
      <ManageActionSummary
        attention={actionSummary.attention}
        scale={actionSummary.scale}
        healthy={actionSummary.healthy}
        estimatedSavings={actionSummary.estimatedSavings}
        estimatedGrowth={actionSummary.estimatedGrowth}
        activeFilter={summaryFilter}
        onFilterChange={setSummaryFilter}
      />

      {/*
        Insights — items are derived from `actionableData` so the panel
        always mirrors the table below; clicks on items open that row's
        detail drawer, and clicks on column headers toggle the same
        `summaryFilter` the chips control. The dollar tally that used
        to live in a fourth filter chip now sits in the panel header
        as plain summary copy, where a stat belongs.
      */}
      <Insights
        items={insightsItems}
        onItemClick={handleInsightClick}
        selectedKey={summaryFilter}
        onSelectKey={setSummaryFilter}
        headerSummary={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-foreground">
              <span className="font-semibold tabular-nums">
                {actionSummary.estimatedImpact}
              </span>{" "}
              <span className="text-muted-foreground">est. weekly impact</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-rose-600 dark:text-rose-400">
              {actionSummary.estimatedSavings} at risk
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-blue-600 dark:text-blue-400">
              {actionSummary.estimatedGrowth} potential
            </span>
          </span>
        }
      />

      {/* Main Table Card */}
      <div className="rounded-lg border border-border bg-card">
        {/* Table Header */}
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={viewLevel} onValueChange={(v) => setViewLevel(v as ViewLevel)}>
            <TabsList className="h-9 w-full justify-start gap-1 bg-transparent p-0 md:w-auto">
              <TabsTrigger value="all" className="text-xs px-4 h-7 data-[state=active]:bg-muted">All</TabsTrigger>
              <TabsTrigger value="campaigns" className="text-xs px-4 h-7 data-[state=active]:bg-muted">Campaigns</TabsTrigger>
              <TabsTrigger value="adsets" className="text-xs px-4 h-7 data-[state=active]:bg-muted">Ad Sets</TabsTrigger>
              <TabsTrigger value="ads" className="text-xs px-4 h-7 data-[state=active]:bg-muted">Ads</TabsTrigger>
            </TabsList>
          </Tabs>
          {/*
            Column picker is scoped to this table — placing it next to the
            view-level Tabs keeps "what rows" and "what columns" controls
            visually grouped and clearly distinct from the page-wide sticky
            filter toolbar above.
          */}
          <ActionCenterColumnPicker
            visibleMetricIds={visibleMetricIds}
            onChange={setVisibleMetricIds}
          />
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="border-b border-border p-3">
            <ManageBulkActionBar
              selectedCount={selectedIds.size}
              onAction={handleBulkAction}
              onClearSelection={() => setSelectedIds(new Set())}
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground text-center w-14">Priority</TableHead>
                <TableHead className="text-muted-foreground min-w-[180px]">Name</TableHead>
                <TableHead className="text-muted-foreground">Level</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Impact</TableHead>
                {visibleMetrics.map((metric) => (
                  <TableHead
                    key={metric.id}
                    className={cn(
                      "text-muted-foreground whitespace-nowrap",
                      metric.align === "right" && "text-right",
                    )}
                  >
                    {metric.shortLabel ?? metric.label}
                  </TableHead>
                ))}
                <TableHead className="text-muted-foreground min-w-[160px]">Reason</TableHead>
                <TableHead className="text-muted-foreground">Recommended Action</TableHead>
                <TableHead className="text-right text-muted-foreground w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <ActionableRowComponent
                  key={row.id}
                  row={row}
                  selected={selectedIds.has(row.id)}
                  visibleMetrics={visibleMetrics}
                  onSelect={handleSelect}
                  onView={handleView}
                  onAction={handleAction}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Drawer */}
      <ManageRowDetailDrawer
        row={detailRow}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAction={(action) => {
          if (detailRow) handleAction(detailRow, action)
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

export default function ManagePage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <ManagePageInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
