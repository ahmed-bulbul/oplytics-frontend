"use client"

import { useMemo, useState } from "react"
import { Sparkles, ChevronUp, Minus, ArrowDownUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recommendation, RecommendationType } from "./types"
import { demoRecommendations } from "./demo-data"
import { AiRecommendationCard } from "./ai-recommendation-card"
import { EmptyState } from "@/components/app/empty-state"

interface AiAssistantPanelProps {
  onRecommendationSelect?: (recommendation: Recommendation) => void
  className?: string
}

type FilterValue = "all" | RecommendationType
type SortValue = "priority" | "confidence" | "newest"

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "opportunity", label: "Opportunity" },
  { value: "watch", label: "Watch" },
]

const SORTS: { value: SortValue; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "confidence", label: "Confidence" },
  { value: "newest", label: "Newest" },
]

const TYPE_WEIGHT: Record<RecommendationType, number> = {
  critical: 4,
  warning: 3,
  opportunity: 2,
  watch: 1,
}

const CONFIDENCE_WEIGHT: Record<Recommendation["confidence"], number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

const TOP_N = 5

export function AiAssistantPanel({
  onRecommendationSelect,
  className,
}: AiAssistantPanelProps) {
  const [minimized, setMinimized] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterValue>("all")
  const [sort, setSort] = useState<SortValue>("priority")
  const [showAll, setShowAll] = useState(false)

  const handleSelect = (recommendation: Recommendation) => {
    setSelectedId(recommendation.id)
    onRecommendationSelect?.(recommendation)
  }

  const handleAction = (recommendation: Recommendation, action: string) => {
    if (action === "apply_context") {
      onRecommendationSelect?.(recommendation)
    }
  }

  const sorted = useMemo(() => {
    const filtered = demoRecommendations.filter(
      (r) => filter === "all" || r.type === filter,
    )

    if (sort === "priority") {
      return [...filtered].sort((a, b) => {
        const t = TYPE_WEIGHT[b.type] - TYPE_WEIGHT[a.type]
        if (t !== 0) return t
        return CONFIDENCE_WEIGHT[b.confidence] - CONFIDENCE_WEIGHT[a.confidence]
      })
    }

    if (sort === "confidence") {
      return [...filtered].sort(
        (a, b) =>
          CONFIDENCE_WEIGHT[b.confidence] - CONFIDENCE_WEIGHT[a.confidence],
      )
    }

    // newest — preserve definition order (most recent first)
    return filtered
  }, [filter, sort])

  const visible = showAll ? sorted : sorted.slice(0, TOP_N)
  const hiddenCount = Math.max(0, sorted.length - visible.length)
  const totalCount = demoRecommendations.length

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-muted/50 transition-all duration-200",
        minimized ? "h-auto flex-none" : "min-h-0 flex-1",
        className,
      )}
    >
      {/* Header */}
      <button
        onClick={() => setMinimized((m) => !m)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10">
          <Sparkles className="h-3 w-3 text-emerald-600" />
        </div>
        <span className="text-xs font-semibold text-foreground">AI Assistant</span>
        <span
          className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600"
          title={`${totalCount} open recommendations across the workspace`}
        >
          {totalCount}
        </span>
        <div className="ml-auto flex h-5 w-5 items-center justify-center rounded hover:bg-muted">
          {minimized ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {!minimized && (
        <>
          {/* Filters + Sort */}
          <div className="border-t border-border px-2 py-2">
            <div className="flex flex-wrap items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setFilter(f.value)
                    setShowAll(false)
                  }}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                    filter === f.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1">
                <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                  className="cursor-pointer rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Sort recommendations"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 space-y-2 overflow-y-auto border-t border-border p-2">
            {visible.length === 0 ? (
              <div className="px-2 py-6">
                <EmptyState
                  title="No recommendations"
                  description={
                    filter === "all"
                      ? "You're all caught up. New recommendations will appear here."
                      : "Nothing in this category right now. Try a different filter."
                  }
                />
              </div>
            ) : (
              <>
                {visible.map((recommendation) => (
                  <AiRecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    isSelected={selectedId === recommendation.id}
                    onSelect={handleSelect}
                    onAction={handleAction}
                  />
                ))}

                {(hiddenCount > 0 || showAll) && (
                  <button
                    type="button"
                    onClick={() => setShowAll((s) => !s)}
                    className="w-full rounded-md border border-dashed border-border py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showAll
                      ? `Show top ${Math.min(TOP_N, sorted.length)}`
                      : `View all (${sorted.length})`}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
