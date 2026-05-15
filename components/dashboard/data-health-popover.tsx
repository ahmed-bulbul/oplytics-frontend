"use client"

import { useState } from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// ---------------------------------------------------------------------------
// Types & data — copied from the original DataHealth dashboard card so the
// top-bar popover renders the exact same content. Kept colocated with this
// component to keep the dashboard tree free of an unused export now that the
// card has moved to the top bar.
// ---------------------------------------------------------------------------

type HealthStatus =
  | "synced"
  | "healthy"
  | "needs_review"
  | "missing"
  | "delayed"
  | "connected"
  | "good"

type DrawerKind =
  | "review_source"
  | "review_cogs"
  | "view_logic"
  | "view_gaps"
  | "review_settings"

interface DataSource {
  name: string
  status: HealthStatus
  detail: string
  actionLabel: string
  drawerKind: DrawerKind
  sourceKey: string
}

const dataSources: DataSource[] = [
  {
    name: "Shopify Orders",
    status: "healthy",
    detail: "Last synced 8 min ago",
    actionLabel: "Review source",
    drawerKind: "review_source",
    sourceKey: "shopify",
  },
  {
    name: "Meta Ads",
    status: "healthy",
    detail: "Spend and campaign data current",
    actionLabel: "Review source",
    drawerKind: "review_source",
    sourceKey: "meta",
  },
  {
    name: "Google Ads",
    status: "healthy",
    detail: "Spend and campaign data current",
    actionLabel: "Review source",
    drawerKind: "review_source",
    sourceKey: "google",
  },
  {
    name: "COGS Rules",
    status: "needs_review",
    detail: "12 products missing COGS",
    actionLabel: "Review COGS",
    drawerKind: "review_cogs",
    sourceKey: "cogs",
  },
  {
    name: "Refunds / Returns",
    status: "healthy",
    detail: "Included in net revenue",
    actionLabel: "View logic",
    drawerKind: "view_logic",
    sourceKey: "refunds",
  },
  {
    name: "UTM Coverage",
    status: "good",
    detail: "84% coverage",
    actionLabel: "View gaps",
    drawerKind: "view_gaps",
    sourceKey: "utm",
  },
  {
    name: "Subscriptions",
    status: "connected",
    detail: "Retention data available",
    actionLabel: "Review source",
    drawerKind: "review_source",
    sourceKey: "subscriptions",
  },
]

const statusConfig: Record<
  HealthStatus,
  { label: string; icon: typeof CheckCircle2; iconClass: string; pillClass: string }
> = {
  synced: {
    label: "Healthy",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    pillClass: "bg-emerald-500/10 text-emerald-600",
  },
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    pillClass: "bg-emerald-500/10 text-emerald-600",
  },
  good: {
    label: "Good",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    pillClass: "bg-emerald-500/10 text-emerald-600",
  },
  connected: {
    label: "Connected",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    pillClass: "bg-emerald-500/10 text-emerald-600",
  },
  needs_review: {
    label: "Needs Review",
    icon: AlertCircle,
    iconClass: "text-amber-600",
    pillClass: "bg-amber-500/10 text-amber-600",
  },
  missing: {
    label: "Missing",
    icon: AlertCircle,
    iconClass: "text-red-600",
    pillClass: "bg-red-500/10 text-red-600",
  },
  delayed: {
    label: "Delayed",
    icon: Clock,
    iconClass: "text-amber-600",
    pillClass: "bg-amber-500/10 text-amber-600",
  },
}

function calculateHealthScore(sources: DataSource[]): number {
  const weights: Record<HealthStatus, number> = {
    synced: 100,
    healthy: 100,
    good: 95,
    connected: 100,
    needs_review: 70,
    delayed: 50,
    missing: 0,
  }
  const total = sources.reduce((sum, s) => sum + weights[s.status], 0)
  return Math.round(total / sources.length)
}

const sourceDrawerContent: Record<
  string,
  {
    title: string
    status: string
    statusTone: "good" | "warn"
    lastSynced?: string
    dataIncluded: string
    usedIn: string
    sourceOfTruth: string
  }
> = {
  shopify: {
    title: "Shopify Orders Source",
    status: "Healthy",
    statusTone: "good",
    lastSynced: "8 minutes ago",
    dataIncluded:
      "Orders, net revenue, refunds, discounts, products, customers",
    usedIn:
      "Revenue, Net Revenue, AOV, New Customers, Returning Customers, Contribution Margin",
    sourceOfTruth: "Shopify",
  },
  meta: {
    title: "Meta Ads Source",
    status: "Healthy",
    statusTone: "good",
    lastSynced: "12 minutes ago",
    dataIncluded:
      "Ad spend, impressions, clicks, conversions, campaign + ad set structure",
    usedIn: "Ad Spend, ROAS, CPA, MER, Channel Performance",
    sourceOfTruth: "Meta Marketing API",
  },
  google: {
    title: "Google Ads Source",
    status: "Healthy",
    statusTone: "good",
    lastSynced: "14 minutes ago",
    dataIncluded:
      "Ad spend, impressions, clicks, conversions, campaign structure",
    usedIn: "Ad Spend, ROAS, CPA, MER, Channel Performance",
    sourceOfTruth: "Google Ads API",
  },
  subscriptions: {
    title: "Subscriptions Source",
    status: "Connected",
    statusTone: "good",
    lastSynced: "22 minutes ago",
    dataIncluded: "Subscription orders, churn events, renewal cadence",
    usedIn: "Retention, LTV, Subscription Metrics",
    sourceOfTruth: "Shopify Subscriptions",
  },
}

interface DrawerState {
  open: boolean
  kind: DrawerKind | null
  sourceKey?: string
}

// ---------------------------------------------------------------------------
// Top-bar popover
// ---------------------------------------------------------------------------

/**
 * Compact top-bar entry point for Data Health. Replaces the full-width
 * dashboard card so the dashboard reclaims vertical space, while keeping
 * the same expanded source list and drawer flow one click away from any
 * page in the app.
 *
 * The trigger renders as a circular icon button matching the bell button
 * next to it, with a colored dot when one or more sources need attention
 * so operators can see system health at a glance without opening the
 * popover.
 */
export function DataHealthPopover() {
  const [open, setOpen] = useState(false)
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, kind: null })
  const healthScore = calculateHealthScore(dataSources)
  const needsAttention = dataSources.filter(
    (s) =>
      s.status === "needs_review" ||
      s.status === "missing" ||
      s.status === "delayed",
  ).length

  const healthLabel =
    healthScore >= 90 ? "Good" : healthScore >= 70 ? "Fair" : "Needs Attention"
  const healthColor =
    healthScore >= 90
      ? "text-emerald-600"
      : healthScore >= 70
        ? "text-amber-600"
        : "text-red-600"
  const dotColor =
    needsAttention === 0
      ? null
      : healthScore < 70
        ? "bg-red-500"
        : "bg-amber-500"

  function openDrawer(kind: DrawerKind, sourceKey?: string) {
    // Close the popover so the drawer has the user's full attention
    // and doesn't sit underneath an open popover.
    setOpen(false)
    setDrawer({ open: true, kind, sourceKey })
  }

  function closeDrawer() {
    setDrawer({ open: false, kind: null })
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label={`Data health: ${healthScore}% ${healthLabel}`}
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Activity className="h-4 w-4" />
            {dotColor && (
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
                  dotColor,
                )}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[420px] p-0"
        >
          {/* Header summary */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Data Health
                  </span>
                  <span className={cn("text-sm font-bold", healthColor)}>
                    {healthScore}% {healthLabel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {needsAttention > 0
                    ? `${needsAttention} source${needsAttention > 1 ? "s" : ""} need${
                        needsAttention === 1 ? "s" : ""
                      } attention`
                    : "All sources synced and healthy"}
                </p>
              </div>
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:inline">
              Last 8 min
            </span>
          </div>

          {/* Source list */}
          <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {dataSources.map((source) => {
              const config = statusConfig[source.status]
              const Icon = config.icon
              return (
                <div
                  key={source.name}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      config.iconClass,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="truncate text-xs font-medium text-foreground">
                        {source.name}
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          config.pillClass,
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {source.detail}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      openDrawer(source.drawerKind, source.sourceKey)
                    }
                    className="inline-flex shrink-0 items-center gap-1 self-center text-[11px] font-medium text-primary hover:underline"
                  >
                    {source.actionLabel}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Drawer — rendered at this level so it survives the popover closing */}
      <Sheet
        open={drawer.open}
        onOpenChange={(o) => !o && closeDrawer()}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <VisuallyHidden>
            <SheetTitle>Data source details</SheetTitle>
            <SheetDescription>
              Review source detail and where it is used.
            </SheetDescription>
          </VisuallyHidden>

          {drawer.kind === "review_source" && drawer.sourceKey && (
            <ReviewSourceDrawer
              sourceKey={drawer.sourceKey}
              onClose={closeDrawer}
            />
          )}
          {drawer.kind === "review_cogs" && (
            <ReviewCogsDrawer onClose={closeDrawer} />
          )}
          {drawer.kind === "view_logic" && (
            <ViewLogicDrawer onClose={closeDrawer} />
          )}
          {drawer.kind === "view_gaps" && (
            <ViewGapsDrawer onClose={closeDrawer} />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ---------------------------------------------------------------------------
// Drawer content components — same as the original DataHealth card.
// ---------------------------------------------------------------------------

function DrawerHeader({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div className="-mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-border bg-muted/30 px-6 py-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <button
        onClick={onClose}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Close drawer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ReviewSourceDrawer({
  sourceKey,
  onClose,
}: {
  sourceKey: string
  onClose: () => void
}) {
  const data = sourceDrawerContent[sourceKey]
  if (!data) return null

  return (
    <div>
      <DrawerHeader title={data.title} onClose={onClose} />

      <dl className="space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <dt className="w-32 shrink-0 text-muted-foreground">Status</dt>
          <dd>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                data.statusTone === "good"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600",
              )}
            >
              {data.status}
            </span>
          </dd>
        </div>
        {data.lastSynced && (
          <div className="flex items-start gap-3">
            <dt className="w-32 shrink-0 text-muted-foreground">Last synced</dt>
            <dd className="text-foreground">{data.lastSynced}</dd>
          </div>
        )}
        <div className="flex items-start gap-3">
          <dt className="w-32 shrink-0 text-muted-foreground">Data included</dt>
          <dd className="text-foreground">{data.dataIncluded}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="w-32 shrink-0 text-muted-foreground">Used in</dt>
          <dd className="text-foreground">{data.usedIn}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="w-32 shrink-0 text-muted-foreground">Source of truth</dt>
          <dd className="text-foreground">{data.sourceOfTruth}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="text-xs">
          <a href="/integrations">View Integration Settings</a>
        </Button>
        <Button size="sm" variant="ghost" className="text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function ReviewCogsDrawer({ onClose }: { onClose: () => void }) {
  const products = [
    { name: "Premium Cotton Tee — White", revenue: "$24,100", cogs: "Missing" },
    { name: "Everyday Hoodie", revenue: "$18,400", cogs: "Missing" },
    { name: "Running Sneaker", revenue: "$12,900", cogs: "Missing" },
  ]

  return (
    <div>
      <DrawerHeader title="COGS Rules Need Review" onClose={onClose} />

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        12 products are missing COGS. Contribution Margin may be overstated
        until these are filled in.
      </p>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-6">Product</div>
          <div className="col-span-3 text-right">Revenue</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        <div className="divide-y divide-border">
          {products.map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-12 gap-2 px-3 py-2 text-xs"
            >
              <div className="col-span-6 truncate text-foreground">{p.name}</div>
              <div className="col-span-3 text-right text-muted-foreground">
                {p.revenue}
              </div>
              <div className="col-span-3 text-right">
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                  Needs COGS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Showing 3 of 12 products needing review.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="text-xs">
          <a href="/settings?tab=calculations">Review Calculation Settings</a>
        </Button>
        <Button size="sm" variant="ghost" className="text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function ViewLogicDrawer({ onClose }: { onClose: () => void }) {
  const lines = [
    { label: "Gross Revenue", op: "" },
    { label: "Less discounts", op: "−" },
    { label: "Less refunds / returns", op: "−" },
    { label: "Equals Net Revenue", op: "=" },
  ]

  return (
    <div>
      <DrawerHeader title="Refunds / Returns Logic" onClose={onClose} />

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Refunds and returns are included in Net Revenue and Contribution Margin
        calculations.
      </p>

      <div className="rounded-md border border-border bg-muted/20 p-3">
        <ul className="space-y-1.5 font-mono text-xs">
          {lines.map((line) => (
            <li key={line.label} className="flex items-center gap-2">
              <span className="w-4 text-muted-foreground">{line.op}</span>
              <span className="text-foreground">{line.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Refund data source: Shopify
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="text-xs">
          <a href="/settings?tab=calculations">View Contribution Margin Formula</a>
        </Button>
        <Button size="sm" variant="ghost" className="text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function ViewGapsDrawer({ onClose }: { onClose: () => void }) {
  const channels = [
    { channel: "Meta Ads", coverage: "91%", issue: "Healthy", tone: "good" as const },
    { channel: "Google Ads", coverage: "88%", issue: "Healthy", tone: "good" as const },
    {
      channel: "TikTok Ads",
      coverage: "62%",
      issue: "Missing campaign parameters",
      tone: "warn" as const,
    },
    {
      channel: "Affiliate",
      coverage: "54%",
      issue: "Inconsistent source naming",
      tone: "warn" as const,
    },
  ]

  return (
    <div>
      <DrawerHeader title="UTM Coverage" onClose={onClose} />

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        84% of paid sessions have trackable UTMs. Attribution confidence is{" "}
        <span className="font-medium text-foreground">Medium</span>.
      </p>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Channel</div>
          <div className="col-span-3 text-right">Coverage</div>
          <div className="col-span-5">Issue</div>
        </div>
        <div className="divide-y divide-border">
          {channels.map((c) => (
            <div
              key={c.channel}
              className="grid grid-cols-12 gap-2 px-3 py-2 text-xs"
            >
              <div className="col-span-4 truncate text-foreground">
                {c.channel}
              </div>
              <div className="col-span-3 text-right tabular-nums text-muted-foreground">
                {c.coverage}
              </div>
              <div
                className={cn(
                  "col-span-5",
                  c.tone === "good"
                    ? "text-muted-foreground"
                    : "text-amber-600",
                )}
              >
                {c.issue}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="text-xs">
          <a href="/integrations">Open Integrations</a>
        </Button>
        <Button size="sm" variant="ghost" className="text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
