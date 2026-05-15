"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  Loader2,
  Search,
  ChevronDown,
  Star,
  Share2,
  Package,
  Users,
  Repeat,
  Boxes,
  Target,
  Clock,
  Calendar,
  Zap,
  Layers,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CHANNEL_PERFORMANCE_METRICS,
  CHANNEL_METRIC_GROUP_LABELS,
  type ChannelMetricGroup,
} from "@/components/dashboard/channel-performance-metrics"
import {
  PRODUCT_PERFORMANCE_METRICS,
  PRODUCT_METRIC_GROUP_LABELS,
  type ProductMetricGroup,
} from "@/components/dashboard/product-performance-metrics"

interface GoogleSheetsSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "destination" | "data" | "schedule" | "connecting" | "success"
type Frequency = "real-time" | "hourly" | "daily" | "weekly"
type DestinationMode = "existing" | "new"

interface MetricOption {
  id: string
  label: string
  description?: string
}

/**
 * A subgroup within a section. Mirrors the canonical groupings used by
 * the dashboard's "Customize columns" pickers (e.g. Sales & Revenue,
 * Profitability, Conversion Funnel) so the operator sees the same
 * vocabulary in the same shape they see on the dashboard.
 */
interface SyncMetricGroup {
  id: string
  label: string
  metrics: MetricOption[]
}

/**
 * Per-section channel scope.
 *
 *   "blended"     — section's metrics are inherently rolled up across
 *                   every channel and exposing a per-channel filter
 *                   would imply a calculation the dashboard doesn't
 *                   actually do (Core KPIs are the canonical example).
 *                   We render a static "Blended" indicator so the
 *                   operator knows what they're getting.
 *
 *   "per-channel" — channel context shapes the export. For Channel
 *                   Performance, each selected channel becomes its
 *                   own destination tab. For Product Performance,
 *                   each row is a product but the metric values are
 *                   scoped to the selected storefronts. We render an
 *                   inline channel-chip picker; the default empty
 *                   selection means "include all channels", and any
 *                   custom subset narrows the export to those.
 *
 *   undefined     — channel is not a meaningful dimension for this
 *                   section (cohorts, subscriptions, goals). No
 *                   control is rendered.
 */
type ChannelScope = "blended" | "per-channel"

interface SyncSection {
  id: string
  label: string
  description: string
  icon: LucideIcon
  /**
   * Sections are always organized into one or more groups. Sections
   * without a natural sub-grouping use a single group whose label is
   * suppressed in the UI (rendered as a flat list). This keeps the
   * iteration helpers uniform regardless of section type.
   */
  groups: SyncMetricGroup[]
  /** Channel context for this section. See ChannelScope. */
  channelScope?: ChannelScope
}

type ChannelOption = { id: string; label: string; dot: string }

/**
 * The full set of channels available as a filter target for
 * "per-channel" sections. Mirrors the channel list in the dashboard's
 * Filter menu so operators see the same vocabulary across surfaces.
 * The brand dot keeps each chip recognizable at a glance; the chip
 * itself is what flips on/off.
 */
const EXPORT_CHANNELS: ChannelOption[] = [
  { id: "shopify", label: "Shopify", dot: "bg-[#96BF48]" },
  { id: "amazon", label: "Amazon", dot: "bg-[#FF9900]" },
  { id: "meta-ads", label: "Meta Ads", dot: "bg-[#0668E1]" },
  { id: "google-ads", label: "Google Ads", dot: "bg-[#4285F4]" },
  { id: "tiktok-ads", label: "TikTok Ads", dot: "bg-foreground" },
  { id: "amazon-ads", label: "Amazon Ads", dot: "bg-[#232F3E]" },
  { id: "reddit-ads", label: "Reddit Ads", dot: "bg-[#FF4500]" },
  { id: "linkedin-ads", label: "LinkedIn Ads", dot: "bg-[#0A66C2]" },
]

/**
 * E-commerce-only subset of EXPORT_CHANNELS, used for Product
 * Performance. Per-product metrics roll up to a storefront, not to a
 * paid platform — exposing Meta/Google/TikTok here would imply a
 * "products attributed to Meta Ads" calculation that the dashboard
 * doesn't actually compute today. So we restrict the picker to the
 * channels where products genuinely originate.
 */
const ECOMMERCE_CHANNELS: ChannelOption[] = EXPORT_CHANNELS.filter((c) =>
  ["shopify", "amazon"].includes(c.id),
)

/**
 * Returns the channel set a given section's picker should use. Channel
 * Performance sees every channel; Product Performance and Inventory
 * see only storefronts since per-product and per-SKU data attributes
 * to a storefront, not a paid platform. Keeping this as a single
 * helper means the toggle/reset logic doesn't need to special-case
 * per section.
 */
function channelOptionsFor(section: SyncSection): ChannelOption[] {
  if (section.id === "product-performance" || section.id === "inventory") {
    return ECOMMERCE_CHANNELS
  }
  return EXPORT_CHANNELS
}

/**
 * Convert a typed registry record into the dialog's group/metric shape.
 *
 * The registries themselves are the single source of truth for column
 * labels, descriptions, and grouping — so by routing the sync picker
 * through them, every metric the operator can show on the dashboard is
 * also a metric they can pipe into Sheets, with the same label and the
 * same group affinity.
 *
 * Order is preserved from the registry so groups read in the same
 * left-to-right order as columns on the dashboard table.
 */
function buildGroupsFromRegistry<G extends string, M extends { id: string; label: string; description?: string; group: G }>(
  metrics: readonly M[],
  groupLabels: Record<G, string>,
): SyncMetricGroup[] {
  // We use a Map (not a plain object) so insertion order matches the
  // first-seen group order in the registry, which is itself canonical.
  const buckets = new Map<G, MetricOption[]>()
  for (const metric of metrics) {
    const existing = buckets.get(metric.group)
    const entry: MetricOption = {
      id: metric.id,
      label: metric.label,
      description: metric.description,
    }
    if (existing) existing.push(entry)
    else buckets.set(metric.group, [entry])
  }
  return Array.from(buckets.entries()).map(([groupKey, items]) => ({
    id: groupKey,
    label: groupLabels[groupKey],
    metrics: items,
  }))
}

/**
 * Dashboard-hero KPI list. Mirrors the `allMetrics` array in
 * `app/page.tsx` 1:1 — labels and IDs must stay in sync so saved
 * Sheet syncs continue to point at the right metric after a label
 * change. We intentionally inline this rather than importing from
 * `app/page.tsx` to avoid pulling client-only metric-card data
 * (sparklines, change strings) into this dialog.
 */
const CORE_KPI_METRICS: MetricOption[] = [
  { id: "revenue", label: "Revenue" },
  { id: "orders", label: "Orders" },
  { id: "ad-spend", label: "Ad Spend" },
  { id: "mer", label: "MER" },
  { id: "cont-margin-pct", label: "Contribution Margin %" },
  { id: "aov", label: "AOV" },
  { id: "cpa", label: "CPA" },
  { id: "cac", label: "CAC" },
  { id: "new-customers", label: "New Customers" },
  { id: "returning", label: "Returning" },
  { id: "roas", label: "ROAS" },
  { id: "conversion-rate", label: "Conv. Rate" },
  { id: "ltv", label: "LTV" },
  { id: "gross-profit", label: "Gross Profit" },
  { id: "sessions", label: "Sessions" },
]

/**
 * Sections mirror the dashboard's information architecture so an
 * operator who knows where a metric lives in the dashboard knows
 * where it'll end up in their spreadsheet (one tab per section,
 * with Channel Performance fanning out into one tab per selected
 * channel).
 *
 * Channel Performance and Product Performance are
 * sourced directly from the dashboard's "Customize columns"
 * registries, so every column the operator can show on the dashboard
 * is also a column they can sync to Sheets.
 */
const SYNC_SECTIONS: SyncSection[] = [
  {
    id: "core-kpis",
    label: "Core KPIs",
    icon: Star,
    description: "Headline metrics from the dashboard hero row",
    groups: [{ id: "all", label: "Core KPIs", metrics: CORE_KPI_METRICS }],
    // Core KPIs are house-level rollups across paid + organic channels.
    // Surface a "Blended" indicator so the operator knows these can't
    // be sliced per-channel without leaving this section.
    channelScope: "blended",
  },
  {
    id: "channel-performance",
    label: "Channel Performance",
    icon: Share2,
    description: "Spend, ROAS, CPA, and full ad-funnel metrics across paid channels",
    groups: buildGroupsFromRegistry<ChannelMetricGroup, (typeof CHANNEL_PERFORMANCE_METRICS)[number]>(
      CHANNEL_PERFORMANCE_METRICS,
      CHANNEL_METRIC_GROUP_LABELS,
    ),
    // Each selected channel exports as its own tab in the destination
    // spreadsheet, so an operator can scan a paid-platform-by-paid-
    // platform breakdown without manual filtering. The chip picker
    // governs which channels get a tab.
    channelScope: "per-channel",
  },
  {
    id: "product-performance",
    label: "Product Performance",
    icon: Package,
    description: "Per-SKU revenue, profitability, inventory, and quality metrics",
    groups: buildGroupsFromRegistry<ProductMetricGroup, (typeof PRODUCT_PERFORMANCE_METRICS)[number]>(
      PRODUCT_PERFORMANCE_METRICS,
      PRODUCT_METRIC_GROUP_LABELS,
    ),
    // Each selected storefront exports as its own tab. Per-product
    // numbers stay separate per channel — a SKU's Shopify revenue
    // and Amazon revenue are independent ledgers we never merge —
    // and only the total rows at the bottom of each tab are blended
    // for that storefront. The chip picker is scoped to e-commerce
    // channels since per-product data attributes to a storefront,
    // not a paid platform.
    channelScope: "per-channel",
  },
  {
    id: "customer-cohorts",
    label: "Customer Cohorts",
    icon: Users,
    description: "Acquisition cohorts and lifetime value",
    groups: [
      {
        id: "all",
        label: "Customer Cohorts",
        metrics: [
          { id: "new-users", label: "New Users by Cohort" },
          { id: "retention", label: "Cohort Retention" },
          { id: "ltv", label: "Lifetime Value" },
          { id: "repeat-rate", label: "Repeat Rate" },
          { id: "time-to-second", label: "Time to Second Order" },
        ],
      },
    ],
  },
  {
    id: "subscription-metrics",
    label: "Subscription Metrics",
    icon: Repeat,
    description: "Active subscribers, MRR, and churn",
    groups: [
      {
        id: "all",
        label: "Subscription Metrics",
        metrics: [
          { id: "active-subs", label: "Active Subscribers" },
          { id: "mrr", label: "MRR" },
          { id: "new-subs", label: "New Subscribers" },
          { id: "cancellations", label: "Cancellation Rate" },
          { id: "sub-retention", label: "Subscription Retention" },
        ],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    description: "Stock on hand, days of stock, and stockout alerts",
    groups: [
      {
        id: "all",
        label: "Inventory",
        metrics: [
          { id: "soh", label: "Stock on Hand" },
          { id: "doh", label: "Days of Stock" },
          { id: "reorder-point", label: "Reorder Point" },
          { id: "stockouts", label: "Active Stockouts" },
        ],
      },
    ],
    // Stock counts and stockout alerts live per storefront — Shopify
    // inventory and FBA inventory are independent ledgers we don't
    // merge. Each selected storefront gets its own tab so warehouse
    // and ops teams can scan the right channel without filtering.
    channelScope: "per-channel",
  },
  {
    id: "goals",
    label: "Goals & Pacing",
    icon: Target,
    description: "Monthly target progress and pacing variance",
    groups: [
      {
        id: "all",
        label: "Goals & Pacing",
        metrics: [
          { id: "goal-vs-actual", label: "Goal vs Actual" },
          { id: "pacing", label: "Pacing %" },
          { id: "variance", label: "Variance to Target" },
        ],
      },
    ],
  },
]

/** Flatten a section's groups into the full metric list for that tab. */
function getAllSectionMetrics(section: SyncSection): MetricOption[] {
  return section.groups.flatMap((g) => g.metrics)
}

const keyFor = (sectionId: string, metricId: string) => `${sectionId}.${metricId}`

/**
 * Sensible default selection — Core KPIs + the dashboard's default
 * visible Channel Performance columns + a couple of cohort signals.
 * Picks the metrics most operators want piped into a board-update
 * spreadsheet without overwhelming the default state.
 */
const DEFAULT_SELECTION = (() => {
  const keys = new Set<string>()
  // All Core KPIs
  CORE_KPI_METRICS.forEach((m) => keys.add(keyFor("core-kpis", m.id)))
  // The same Channel Performance columns the dashboard table shows by
  // default — keeps the Sheet's first state aligned with what the
  // operator is already used to seeing.
  CHANNEL_PERFORMANCE_METRICS.filter((m) => m.defaultVisible).forEach((m) =>
    keys.add(keyFor("channel-performance", m.id)),
  )
  // Two cohort signals every board update tends to want
  keys.add(keyFor("customer-cohorts", "ltv"))
  keys.add(keyFor("customer-cohorts", "retention"))
  return keys
})()

const FREQUENCY_OPTIONS: {
  id: Frequency
  label: string
  icon: LucideIcon
  description: string
}[] = [
  { id: "real-time", label: "Real-time", icon: Zap, description: "Push every change as it happens" },
  { id: "hourly", label: "Hourly", icon: Clock, description: "Refresh on the top of every hour" },
  { id: "daily", label: "Daily", icon: Calendar, description: "Refresh once a day at the chosen time" },
  { id: "weekly", label: "Weekly", icon: Calendar, description: "Refresh weekly on the chosen day" },
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

/**
 * Re-skinned to match the OAuth-style connect dialogs (Meta Ads,
 * Amazon, etc.) so the integrations page reads as one cohesive
 * surface. The "data selection" step adopts a column-customizer
 * pattern — sections expand to reveal individual metric checkboxes
 * grouped by the same vocabulary the dashboard's "Customize columns"
 * popovers use, with section-level tri-state checkboxes, search,
 * presets, and a running total — so operators can sync exactly what
 * they want instead of being limited to whole-section toggles.
 */
export function GoogleSheetsSyncDialog({
  open,
  onOpenChange,
}: GoogleSheetsSyncDialogProps) {
  const [step, setStep] = useState<Step>("destination")
  const [destinationMode, setDestinationMode] = useState<DestinationMode>("existing")
  const [sheetUrl, setSheetUrl] = useState("")
  const [newSheetName, setNewSheetName] = useState("Optilytics Live Sync")
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(DEFAULT_SELECTION)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["core-kpis"]))
  const [search, setSearch] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("daily")
  const [dailyTime, setDailyTime] = useState("06:00")
  const [weeklyDay, setWeeklyDay] = useState("monday")
  /**
   * Per-section channel selection for "per-channel" sections. The
   * keys are section ids; the values are arrays of channel ids from
   * EXPORT_CHANNELS. An empty array (or missing key) means "include
   * all channels", which is the default and the most common case.
   * We model "all" as empty rather than "every-id-listed" so toggling
   * a single chip cleanly transitions the section into custom mode
   * without snapshotting the full channel list at the moment of click.
   */
  const [datasetChannels, setDatasetChannels] = useState<Record<string, string[]>>({})

  const totalAvailable = useMemo(
    () => SYNC_SECTIONS.reduce((acc, s) => acc + getAllSectionMetrics(s).length, 0),
    [],
  )

  // Filter sections by search; auto-expand all matching sections so
  // the operator immediately sees what their query hit. We filter at
  // the metric level inside each group, then drop empty groups, then
  // drop empty sections.
  const visibleSections = useMemo(() => {
    if (!search.trim()) return SYNC_SECTIONS
    const q = search.toLowerCase()
    return SYNC_SECTIONS.map((s) => ({
      ...s,
      groups: s.groups
        .map((g) => ({
          ...g,
          metrics: g.metrics.filter((m) => m.label.toLowerCase().includes(q)),
        }))
        .filter((g) => g.metrics.length > 0),
    })).filter((s) => s.groups.length > 0)
  }, [search])

  const effectiveExpanded = search.trim()
    ? new Set(visibleSections.map((s) => s.id))
    : expanded

  function toggleMetric(sectionId: string, metricId: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      const k = keyFor(sectionId, metricId)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  function toggleSection(section: SyncSection) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      const allKeys = getAllSectionMetrics(section).map((m) => keyFor(section.id, m.id))
      const allSelected = allKeys.every((k) => next.has(k))
      if (allSelected) {
        allKeys.forEach((k) => next.delete(k))
      } else {
        allKeys.forEach((k) => next.add(k))
      }
      return next
    })
  }

  function toggleGroup(sectionId: string, group: SyncMetricGroup) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      const allKeys = group.metrics.map((m) => keyFor(sectionId, m.id))
      const allSelected = allKeys.every((k) => next.has(k))
      if (allSelected) allKeys.forEach((k) => next.delete(k))
      else allKeys.forEach((k) => next.add(k))
      return next
    })
  }

  function toggleExpanded(sectionId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  /**
   * Toggle a single channel for a section. The transition from "all"
   * (empty array) to "custom" is the interesting case: when the
   * operator clicks one chip while in "all" mode, we snapshot every
   * OTHER channel into the selection — i.e. the click reads as
   * "remove this one from my export", not "include only this one".
   * Once in custom mode, normal add/remove semantics apply.
   *
   * `availableChannels` is the channel list this particular section
   * exposes — Channel Performance sees every channel, Product
   * Performance sees only storefronts. Passing it in keeps the
   * "snapshot all others" and "collapse back to all-mode" math
   * scoped to the right denominator.
   */
  function toggleSectionChannel(
    sectionId: string,
    channelId: string,
    availableChannels: ChannelOption[],
  ) {
    setDatasetChannels((prev) => {
      const current = prev[sectionId] ?? []
      // "all" mode → first click excludes this channel from the set
      if (current.length === 0) {
        const without = availableChannels.filter((c) => c.id !== channelId).map((c) => c.id)
        return { ...prev, [sectionId]: without }
      }
      // Custom mode → toggle membership normally
      const next = current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId]
      // Custom selection that ended up containing every available
      // channel for this section maps back to "all" mode so the chip
      // row collapses cleanly.
      if (next.length === availableChannels.length) {
        const { [sectionId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [sectionId]: next }
    })
  }

  /** Reset a section back to "all channels included". */
  function resetSectionChannels(sectionId: string) {
    setDatasetChannels((prev) => {
      if (!prev[sectionId]) return prev
      const { [sectionId]: _, ...rest } = prev
      return rest
    })
  }

  /**
   * Test whether a channel is currently part of the section's export.
   * "all" mode (empty array) returns true for every channel — so the
   * chip row visually communicates "all 8 are included" without
   * having to materialize the full list in state.
   */
  function isChannelIncluded(sectionId: string, channelId: string): boolean {
    const current = datasetChannels[sectionId]
    if (!current || current.length === 0) return true
    return current.includes(channelId)
  }

  /** Short summary string used in the collapsed section subtitle. */
  function channelScopeSummary(section: SyncSection): string | null {
    if (section.channelScope === "blended") return "Blended"
    if (section.channelScope === "per-channel") {
      const options = channelOptionsFor(section)
      const current = datasetChannels[section.id]
      if (!current || current.length === 0) return "All channels"
      return `${current.length} of ${options.length} channels`
    }
    return null
  }

  function sectionState(section: SyncSection): "all" | "some" | "none" {
    const allKeys = getAllSectionMetrics(section).map((m) => keyFor(section.id, m.id))
    const count = allKeys.filter((k) => selectedKeys.has(k)).length
    if (count === 0) return "none"
    if (count === allKeys.length) return "all"
    return "some"
  }

  function sectionCounts(section: SyncSection) {
    const total = getAllSectionMetrics(section).length
    const selected = getAllSectionMetrics(section).filter((m) =>
      selectedKeys.has(keyFor(section.id, m.id)),
    ).length
    return { total, selected }
  }

  function groupState(sectionId: string, group: SyncMetricGroup): "all" | "some" | "none" {
    const allKeys = group.metrics.map((m) => keyFor(sectionId, m.id))
    const count = allKeys.filter((k) => selectedKeys.has(k)).length
    if (count === 0) return "none"
    if (count === allKeys.length) return "all"
    return "some"
  }

  function applyDefaults() {
    setSelectedKeys(new Set(DEFAULT_SELECTION))
  }

  function selectEverything() {
    const all = new Set<string>()
    SYNC_SECTIONS.forEach((s) =>
      getAllSectionMetrics(s).forEach((m) => all.add(keyFor(s.id, m.id))),
    )
    setSelectedKeys(all)
  }

  function clearAll() {
    setSelectedKeys(new Set())
  }

  const totalSelected = selectedKeys.size
  // A "tab" is a sheet in the destination spreadsheet. Most sections
  // produce a single tab, but per-channel sections fan out into one
  // tab per selected channel — Channel Performance breaks out by ad
  // platform, Product Performance and Inventory break out by
  // storefront. "All channels" mode (empty datasetChannels[id]) means
  // every channel in the section's option list will be exported.
  const tabsSelected = SYNC_SECTIONS.reduce((sum, s) => {
    const hasAny = getAllSectionMetrics(s).some((m) => selectedKeys.has(keyFor(s.id, m.id)))
    if (!hasAny) return sum
    if (s.channelScope === "per-channel") {
      const custom = datasetChannels[s.id]?.length
      return sum + (custom && custom > 0 ? custom : channelOptionsFor(s).length)
    }
    return sum + 1
  }, 0)

  const destinationValid =
    destinationMode === "new" ? newSheetName.trim().length > 0 : sheetUrl.trim().length > 0

  function handleContinue() {
    if (step === "destination" && destinationValid) setStep("data")
    else if (step === "data" && totalSelected > 0) setStep("schedule")
    else if (step === "schedule") {
      setStep("connecting")
      setTimeout(() => setStep("success"), 1800)
    }
  }

  function handleBack() {
    if (step === "schedule") setStep("data")
    else if (step === "data") setStep("destination")
  }

  function handleClose() {
    onOpenChange(false)
    // Reset on close, after the close animation finishes so the user
    // doesn't watch the dialog snap back as it's fading out.
    setTimeout(() => {
      setStep("destination")
      setSheetUrl("")
      setNewSheetName("Optilytics Live Sync")
      setDestinationMode("existing")
      setSelectedKeys(new Set(DEFAULT_SELECTION))
      setExpanded(new Set(["core-kpis"]))
      setSearch("")
      setFrequency("daily")
      setDailyTime("06:00")
      setWeeklyDay("monday")
      setDatasetChannels({})
    }, 300)
  }

  const stepKicker = (s: Step) => {
    if (s === "destination") return "Step 1 of 3"
    if (s === "data") return "Step 2 of 3"
    if (s === "schedule") return "Step 3 of 3"
    return ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        {/* DESTINATION */}
        {step === "destination" && (
          <>
            <DialogHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                {stepKicker(step)}
              </p>
              <DialogTitle>Sync to Google Sheets</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Pipe live dashboard data into a spreadsheet your team already uses.
              </p>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDestinationMode("existing")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    destinationMode === "existing"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/50",
                  )}
                >
                  <p className="text-sm font-medium">Use existing sheet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paste a Google Sheets URL we&apos;ll write into.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationMode("new")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    destinationMode === "new"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/50",
                  )}
                >
                  <p className="text-sm font-medium">Create new sheet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We&apos;ll create one in your Google Drive and link it back.
                  </p>
                </button>
              </div>

              {destinationMode === "existing" ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Sheet URL
                  </label>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Make sure the connected Google account has edit access to this spreadsheet.
                  </p>
                  <Input
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Sheet name
                  </label>
                  <p className="mb-3 text-sm text-muted-foreground">
                    A new spreadsheet will be created in the connected Google Drive.
                  </p>
                  <Input
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                  />
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  Each selected dashboard section becomes its own tab in the spreadsheet, with
                  column headers and values formatted to match the dashboard.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!destinationValid}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* DATA */}
        {step === "data" && (
          <>
            <DialogHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                {stepKicker(step)}
              </p>
              <DialogTitle>Select data to sync</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Pick exactly the metrics you want pushed to Sheets — section by section, like
                customizing dashboard columns.
              </p>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-3 overflow-hidden py-2">
              {/* Search + total */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search metrics..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                  {totalSelected}/{totalAvailable}
                </span>
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Quick select:</span>
                <Button variant="ghost" size="sm" onClick={applyDefaults} className="h-6 text-xs">
                  Defaults
                </Button>
                <Button variant="ghost" size="sm" onClick={selectEverything} className="h-6 text-xs">
                  Everything
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs">
                  Clear
                </Button>
              </div>

              <div className="-mx-1 flex-1 overflow-y-auto px-1">
                <div className="space-y-2">
                  {visibleSections.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No metrics match &quot;{search}&quot;.
                    </p>
                  )}
                  {visibleSections.map((section) => {
                    const isExpanded = effectiveExpanded.has(section.id)
                    const state = sectionState(section)
                    const { total, selected } = sectionCounts(section)
                    const Icon = section.icon
                    // Sections with a single unlabeled group ("all") render
                    // as a flat list — there's no useful subhead to show.
                    // Sections with multiple groups (the registry-driven
                    // ones) render group subheads so the operator sees the
                    // same "Sales & Revenue", "Profitability", etc.
                    // structure as on the dashboard's column picker.
                    const showSubgroups =
                      section.groups.length > 1 || section.groups[0]?.id !== "all"
                    return (
                      <div
                        key={section.id}
                        className={cn(
                          "rounded-lg border transition-colors",
                          state !== "none"
                            ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                            : "border-border",
                        )}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <Checkbox
                            checked={
                              state === "all"
                                ? true
                                : state === "some"
                                  ? "indeterminate"
                                  : false
                            }
                            onCheckedChange={() => toggleSection(section)}
                          />
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <button
                            type="button"
                            onClick={() => toggleExpanded(section.id)}
                            className="flex flex-1 items-center justify-between gap-2 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{section.label}</span>
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                                  {selected}/{total}
                                </span>
                                {/*
                                  Surface channel scope inline with the
                                  count badge so an operator scanning
                                  the collapsed list sees at a glance
                                  whether the section is blended or
                                  has been filtered to a channel subset
                                  — without having to expand each row.
                                */}
                                {channelScopeSummary(section) && (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                      section.channelScope === "blended"
                                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                        : datasetChannels[section.id]?.length
                                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                          : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <Layers className="h-2.5 w-2.5" />
                                    {channelScopeSummary(section)}
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {section.description}
                              </p>
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="space-y-3 border-t border-border bg-muted/30 px-3 py-3">
                            {/*
                              Channel scope panel. Renders only for
                              sections where channel is a meaningful
                              dimension. Blended sections show a
                              static informational pill; per-channel
                              sections show a chip picker that filters
                              which channels participate in the export.
                            */}
                            {section.channelScope === "blended" && (
                              <div className="flex items-start gap-2 rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-2 text-xs">
                                <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-blue-900 dark:text-blue-200">
                                    Blended across all channels
                                  </p>
                                  <p className="mt-0.5 text-blue-700/80 dark:text-blue-300/70">
                                    Core KPIs roll up paid and organic channels into a single
                                    house-level number. To break out by channel, sync the
                                    Channel Performance section.
                                  </p>
                                </div>
                              </div>
                            )}
                            {section.channelScope === "per-channel" && (() => {
                              // Each section advertises its own channel
                              // list — Channel Performance sees every
                              // channel, Product Performance sees only
                              // storefronts (Shopify, Amazon).
                              const sectionChannels = channelOptionsFor(section)
                              const customCount = datasetChannels[section.id]?.length ?? 0
                              return (
                                <div className="rounded-md border border-border bg-background/60 px-2.5 py-2">
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      Channels
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {customCount
                                        ? `${customCount} of ${sectionChannels.length} included`
                                        : "All channels included"}
                                    </span>
                                    {customCount ? (
                                      <button
                                        type="button"
                                        onClick={() => resetSectionChannels(section.id)}
                                        className="ml-auto text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                                      >
                                        Reset to all
                                      </button>
                                    ) : null}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {sectionChannels.map((ch) => {
                                      const included = isChannelIncluded(section.id, ch.id)
                                      return (
                                        <button
                                          key={ch.id}
                                          type="button"
                                          onClick={() =>
                                            toggleSectionChannel(section.id, ch.id, sectionChannels)
                                          }
                                          className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                                            included
                                              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                                              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                                          )}
                                          aria-pressed={included}
                                        >
                                          <span
                                            className={cn(
                                              "h-1.5 w-1.5 shrink-0 rounded-full",
                                              ch.dot,
                                              !included && "opacity-40",
                                            )}
                                          />
                                          {ch.label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    {section.id === "channel-performance"
                                      ? "Each selected channel exports as its own tab in the destination spreadsheet."
                                      : section.id === "inventory"
                                        ? "Each selected storefront exports as its own tab. Stock ledgers stay separate per channel."
                                        : "Each selected storefront exports as its own tab. Per-product numbers stay separate per channel; only total rows are blended."}
                                  </p>
                                </div>
                              )
                            })()}
                            {section.groups.map((group) => {
                              const gState = groupState(section.id, group)
                              return (
                                <div key={group.id} className="space-y-1">
                                  {showSubgroups && (
                                    <div className="flex items-center gap-2 px-1">
                                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group.label}
                                      </p>
                                      <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                                        {
                                          group.metrics.filter((m) =>
                                            selectedKeys.has(keyFor(section.id, m.id)),
                                          ).length
                                        }
                                        /{group.metrics.length}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleGroup(section.id, group)}
                                        className="ml-auto text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                                      >
                                        {gState === "all" ? "Clear" : "Select all"}
                                      </button>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    {group.metrics.map((metric) => {
                                      const k = keyFor(section.id, metric.id)
                                      const checked = selectedKeys.has(k)
                                      return (
                                        <label
                                          key={metric.id}
                                          className={cn(
                                            "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-background",
                                          )}
                                        >
                                          <Checkbox
                                            checked={checked}
                                            onCheckedChange={() =>
                                              toggleMetric(section.id, metric.id)
                                            }
                                            className="mt-0.5"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <span
                                              className={cn(
                                                "block truncate font-medium leading-tight",
                                                !checked && "text-muted-foreground",
                                              )}
                                            >
                                              {metric.label}
                                            </span>
                                            {metric.description && (
                                              <span className="block truncate text-[11px] text-muted-foreground">
                                                {metric.description}
                                              </span>
                                            )}
                                          </div>
                                        </label>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {totalSelected === 0
                  ? "Select at least one metric to continue"
                  : `${tabsSelected} tab${tabsSelected === 1 ? "" : "s"} will be created`}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={totalSelected === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {/* SCHEDULE */}
        {step === "schedule" && (
          <>
            <DialogHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                {stepKicker(step)}
              </p>
              <DialogTitle>Set sync schedule</DialogTitle>
              <p className="text-sm text-muted-foreground">
                How often should we refresh the destination spreadsheet?
              </p>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                {FREQUENCY_OPTIONS.map((o) => {
                  const Icon = o.icon
                  const active = frequency === o.id
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setFrequency(o.id)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors",
                        active
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "border-border hover:border-emerald-500/50",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-emerald-600" : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm font-medium">{o.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{o.description}</p>
                    </button>
                  )
                })}
              </div>

              {(frequency === "daily" || frequency === "weekly") && (
                <div className="grid grid-cols-2 gap-3">
                  {frequency === "weekly" && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Day
                      </label>
                      <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d} className="capitalize">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Time (UTC)
                    </label>
                    <Input
                      type="time"
                      value={dailyTime}
                      onChange={(e) => setDailyTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  You can change the schedule, the metrics, or pause the sync any time from the
                  Manage menu on the Integrations page.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleContinue} className="bg-emerald-600 hover:bg-emerald-700">
                Start sync
              </Button>
            </div>
          </>
        )}

        {/* CONNECTING */}
        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <div className="text-center">
              <p className="font-semibold">Configuring sync...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Setting up the destination spreadsheet and pushing your first batch
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Sync configured</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <div className="text-center">
                  <p className="font-semibold">Your data is on its way to Google Sheets</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {totalSelected} metric{totalSelected === 1 ? "" : "s"} across {tabsSelected}{" "}
                    tab{tabsSelected === 1 ? "" : "s"}, refreshing{" "}
                    {frequency === "real-time" ? "in real-time" : `every ${frequency}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">What happens next:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Initial backfill of the last 30 days starts now</li>
                  <li>Each section becomes its own tab with formatted headers</li>
                  <li>Pause or edit the sync any time from the Manage menu</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
