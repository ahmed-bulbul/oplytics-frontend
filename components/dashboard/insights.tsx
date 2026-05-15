"use client"

import { TrendingUp, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InsightItem {
  id: string
  title: string
  description: string
  action: string
  /**
   * Dashboard pathway: when set, clicking the insight selects this metric
   * in the parent's KPI strip. Action Center insights leave this undefined
   * and use `onItemClick` instead.
   */
  metricLabel?: string
  /**
   * Optional small uppercase label rendered above the action chevron —
   * used by Action Center insights to surface the row's level (Campaign,
   * Ad Set, Inventory, Product, etc.) so the reader can orient quickly
   * without re-reading the title.
   */
  meta?: string
}

export interface InsightItems {
  keyChanges: InsightItem[]
  attention: InsightItem[]
  opportunities: InsightItem[]
}

/**
 * Three column buckets shared with the Action Center filter chips and
 * the table's row-status colors. Mapping:
 *
 *   - attention → "Attention Needed" column → rose
 *   - scale     → "Opportunities"    column → blue
 *   - healthy   → "On Track"         column → emerald
 *
 * The string values intentionally match `SummaryFilter` so the same
 * identifier drives both surfaces.
 */
export type InsightColumnKey = "attention" | "scale" | "healthy"

interface InsightsProps {
  /**
   * Optional. When supplied, clicking an insight selects the matching metric
   * on the parent surface (used by the dashboard KPI strip). When omitted —
   * e.g. on the Action Center page — clicks fall back to `onItemClick`.
   */
  onSelectMetric?: (metric: string) => void
  /**
   * Optional. The currently selected metric label. When omitted no row is
   * marked active.
   */
  selectedMetric?: string
  /**
   * Optional override of the three insight columns. When undefined, the
   * default dashboard insights ship. Action Center supplies row-bound
   * items derived from the table below.
   */
  items?: InsightItems
  /**
   * Optional. Called with the clicked item. Takes precedence over
   * `onSelectMetric` so callers can route clicks however they want
   * (e.g. open a row drawer instead of selecting a KPI).
   */
  onItemClick?: (item: InsightItem) => void
  /**
   * Currently active column-level filter. When set, the matching column
   * header renders in its "active" state — and the corresponding chip
   * is rendered as pressed elsewhere on the page (Action Center).
   */
  selectedKey?: InsightColumnKey | null
  /**
   * Toggle a column-level filter. Pass `null` to clear. When this prop
   * is omitted, column headers render as static labels (default
   * dashboard usage).
   */
  onSelectKey?: (key: InsightColumnKey | null) => void
  /**
   * Right-aligned summary slot for the panel header. Used by the Action
   * Center to surface the dollar tally that previously lived in a
   * confused fourth filter chip.
   */
  headerSummary?: React.ReactNode
}

const DEFAULT_KEY_CHANGES: InsightItem[] = [
  {
    id: "revenue-up",
    title: "Revenue up 12.4%",
    description: "Driven by stronger performance from Meta Ads and Email",
    action: "View",
    metricLabel: "Revenue",
  },
  {
    id: "new-customers-up",
    title: "New customers up 14.6%",
    description: "Acquisition volume increased week over week",
    action: "Inspect",
    metricLabel: "New Customers",
  },
  {
    id: "margin-up",
    title: "Contribution margin up 1.8%",
    description: "Margin improved while spend stayed below target",
    action: "View",
    metricLabel: "Contribution Margin %",
  },
]

const DEFAULT_ATTENTION_NEEDED: InsightItem[] = [
  {
    id: "cac-trending",
    title: "CAC is trending upward",
    description: "Up 1.4% versus last week",
    action: "Inspect",
    metricLabel: "CAC",
  },
  {
    id: "google-efficiency",
    title: "Google Search may be less efficient",
    description: "Monitor cost pressure before increasing spend",
    action: "Open",
    metricLabel: "CPA",
  },
  {
    id: "campaign-under-target",
    title: "One campaign is under target",
    description: "A lower-performing campaign may be pulling down results",
    action: "View",
    metricLabel: "ROAS",
  },
]

const DEFAULT_OPPORTUNITIES: InsightItem[] = [
  {
    id: "summer-sale",
    title: "Increase Summer Sale budget",
    description: "Performance suggests room to scale efficiently",
    action: "Open",
    metricLabel: "Ad Spend",
  },
  {
    id: "email-efficient",
    title: "Email remains highly efficient",
    description: "Revenue is strong relative to spend",
    action: "View",
    metricLabel: "MER",
  },
  {
    id: "premium-tee",
    title: "Premium Cotton Tee outperforming",
    description: "Conversion rate is above the broader baseline",
    action: "Inspect",
    metricLabel: "Conv. Rate",
  },
]

interface ColumnConfig {
  key: InsightColumnKey
  title: string
  icon: typeof TrendingUp
  // Color language shared with the filter chips and row status pills.
  iconColor: string
  bgIcon: string
  borderActive: string
  ringActive: string
  bgActive: string
}

const COLUMNS: ColumnConfig[] = [
  {
    key: "attention",
    title: "Attention Needed",
    icon: AlertTriangle,
    iconColor: "text-rose-600 dark:text-rose-400",
    bgIcon: "bg-rose-500/10",
    borderActive: "border-rose-500 dark:border-rose-400",
    ringActive: "ring-rose-500/20",
    bgActive: "bg-rose-500/5",
  },
  {
    key: "scale",
    title: "Opportunities",
    icon: TrendingUp,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgIcon: "bg-blue-500/10",
    borderActive: "border-blue-500 dark:border-blue-400",
    ringActive: "ring-blue-500/20",
    bgActive: "bg-blue-500/5",
  },
  {
    key: "healthy",
    title: "On Track",
    icon: ShieldCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgIcon: "bg-emerald-500/10",
    borderActive: "border-emerald-500 dark:border-emerald-400",
    ringActive: "ring-emerald-500/20",
    bgActive: "bg-emerald-500/5",
  },
]

function InsightItemComponent({
  item,
  onSelect,
  isActive,
}: {
  item: InsightItem
  onSelect: () => void
  isActive: boolean
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
        "hover:bg-muted/60",
        isActive && "bg-muted/80 ring-1 ring-border",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-tight text-foreground">
          {item.title}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </div>
      {/*
        Right-side action affordance. Stacks an optional level meta tag
        above the chevron so action-bound insights can advertise the
        row level (Campaign, Ad Set, Inventory, Product, etc.) without
        bloating the title line.
      */}
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        {item.meta && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {item.meta}
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {item.action}
          <ChevronRight className="h-3 w-3" />
        </span>
      </span>
    </button>
  )
}

function InsightColumn({
  config,
  items,
  onItemSelect,
  selectedMetric,
  isActive,
  isFilterable,
  onToggleFilter,
}: {
  config: ColumnConfig
  items: InsightItem[]
  onItemSelect: (item: InsightItem) => void
  selectedMetric?: string
  isActive: boolean
  isFilterable: boolean
  onToggleFilter: () => void
}) {
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card/50 transition-colors",
        isActive
          ? cn(config.borderActive, "ring-1", config.ringActive, config.bgActive)
          : "border-border",
      )}
    >
      {/*
        Column header doubles as the toggle filter when `isFilterable`
        is true. Aria-pressed announces the active state for assistive
        tech, and a small "Filtering" / "Filter" chip on the right makes
        the affordance obvious without crowding the title.
      */}
      <button
        type="button"
        disabled={!isFilterable}
        onClick={onToggleFilter}
        aria-pressed={isActive}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-t-lg px-3 py-2 text-left transition-colors",
          isFilterable && "hover:bg-muted/40 cursor-pointer",
          !isFilterable && "cursor-default",
        )}
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              config.bgIcon,
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
          </span>
          <span className="text-xs font-semibold text-foreground">{config.title}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            {items.length}
          </span>
        </span>
        {isFilterable && (
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
              isActive
                ? cn(
                    "border-transparent ring-1",
                    config.ringActive,
                    config.iconColor,
                  )
                : "border-border text-muted-foreground",
            )}
          >
            {isActive ? "Filtering" : "Filter"}
          </span>
        )}
      </button>

      {/* Items */}
      <div className="space-y-1 px-2 pb-2 pt-1">
        {items.map((item) => (
          <InsightItemComponent
            key={item.id}
            item={item}
            onSelect={() => onItemSelect(item)}
            isActive={!!selectedMetric && item.metricLabel === selectedMetric}
          />
        ))}
      </div>
    </div>
  )
}

export function Insights({
  onSelectMetric,
  selectedMetric,
  items,
  onItemClick,
  selectedKey,
  onSelectKey,
  headerSummary,
}: InsightsProps) {
  const keyChanges = items?.keyChanges ?? DEFAULT_KEY_CHANGES
  const attentionNeeded = items?.attention ?? DEFAULT_ATTENTION_NEEDED
  const opportunities = items?.opportunities ?? DEFAULT_OPPORTUNITIES

  const itemsByKey: Record<InsightColumnKey, InsightItem[]> = {
    attention: attentionNeeded,
    scale: opportunities,
    healthy: keyChanges,
  }

  /**
   * Click router. `onItemClick` (Action Center) takes precedence over
   * `onSelectMetric` (Dashboard) so a single component can serve both
   * pathways without each caller needing to know about the other.
   */
  const handleSelect = (item: InsightItem) => {
    if (onItemClick) {
      onItemClick(item)
      return
    }
    if (item.metricLabel) {
      onSelectMetric?.(item.metricLabel)
    }
  }

  const isFilterable = Boolean(onSelectKey)
  const handleToggleFilter = (key: InsightColumnKey) => {
    if (!onSelectKey) return
    onSelectKey(selectedKey === key ? null : key)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Insights</h3>
          <p className="text-[11px] text-muted-foreground">
            What changed, what needs attention, where to lean in.
          </p>
        </div>
        {/*
          Right-aligned summary slot. Defaults to the same tally text
          we used to show inline so existing dashboard usages don't
          change visually; Action Center supplies its own dollar-impact
          string here.
        */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:mt-0">
          {headerSummary ?? (
            <>
              <span className="text-rose-600 dark:text-rose-400">
                {attentionNeeded.length} need{attentionNeeded.length === 1 ? "s" : ""} attention
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-blue-600 dark:text-blue-400">
                {opportunities.length} opportunit{opportunities.length === 1 ? "y" : "ies"}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {keyChanges.length} on track
              </span>
            </>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLUMNS.map((config) => (
          <InsightColumn
            key={config.key}
            config={config}
            items={itemsByKey[config.key]}
            onItemSelect={handleSelect}
            selectedMetric={selectedMetric}
            isActive={selectedKey === config.key}
            isFilterable={isFilterable}
            onToggleFilter={() => handleToggleFilter(config.key)}
          />
        ))}
      </div>
    </div>
  )
}
