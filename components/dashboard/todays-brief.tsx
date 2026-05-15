"use client"

import { useEffect, useState } from "react"
import { Newspaper, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BriefItem {
  id: string
  text: string
  type: "positive" | "warning" | "neutral" | "action"
}

const briefItems: BriefItem[] = [
  {
    id: "1",
    text: "Revenue is up 12.4%, driven by stronger Meta Ads and Email performance.",
    type: "positive",
  },
  {
    id: "2",
    text: "Contribution margin is up 1.8%, but CAC is also up 1.4%, which may pressure profit if it continues.",
    type: "warning",
  },
  {
    id: "3",
    text: "Google Search ROAS is down 9% while CPC is up 11%, so spend increases should be reviewed carefully.",
    type: "warning",
  },
  {
    id: "4",
    text: "Summer Sale may have room to scale, with ROAS at 3.2x versus a 2.5x target.",
    type: "positive",
  },
  {
    id: "5",
    text: "Recommended next step: Review the Summer Sale budget recommendation in the AI Assistant.",
    type: "action",
  },
]

const typeConfig: Record<BriefItem["type"], { bullet: string; textClass: string }> = {
  positive: {
    bullet: "bg-emerald-500",
    textClass: "text-foreground",
  },
  warning: {
    bullet: "bg-amber-500",
    textClass: "text-foreground",
  },
  neutral: {
    bullet: "bg-slate-400",
    textClass: "text-muted-foreground",
  },
  action: {
    bullet: "bg-primary",
    textClass: "text-foreground font-medium",
  },
}

const STORAGE_KEY = "optilytics:todays-brief:expanded"

interface TodaysBriefProps {
  onActionClick?: () => void
}

export function TodaysBrief({ onActionClick }: TodaysBriefProps) {
  /**
   * Expanded state is hydrated from localStorage in an effect (rather than
   * from a useState initializer) so the server-rendered HTML matches the
   * first client render and we never get a hydration mismatch warning.
   * The brief renders open by default and only collapses if the user has
   * previously chosen to minimize it.
   */
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw === "0") setExpanded(false)
    } catch {
      // ignore privacy-mode / quota errors
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0")
    } catch {
      // ignore
    }
  }, [expanded])

  const actionItem = briefItems.find((i) => i.type === "action")

  return (
    <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Today&apos;s Brief</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          AI Generated
        </span>
        <span className="ml-auto hidden text-[10px] text-muted-foreground sm:inline">
          Demo Data &middot; Last 7 days
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "Minimize Today's Brief" : "Expand Today's Brief"}
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:ml-2"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {expanded ? (
        <ul className="mt-3 space-y-2">
          {briefItems.map((item) => {
            const config = typeConfig[item.type]
            const isAction = item.type === "action"

            return (
              <li key={item.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    config.bullet,
                  )}
                />
                {isAction ? (
                  <button
                    onClick={onActionClick}
                    className={cn(
                      "flex items-center gap-1 text-left text-xs leading-relaxed transition-colors hover:text-primary",
                      config.textClass,
                    )}
                  >
                    {item.text}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className={cn("text-xs leading-relaxed", config.textClass)}>
                    {item.text}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        // Minimized state — show only the recommended next step (if any) so
        // the highest-leverage item is still one click away while the rest
        // of the dashboard reclaims vertical space.
        actionItem && (
          <button
            onClick={onActionClick}
            className="mt-2 flex w-full items-start gap-2 text-left text-xs leading-relaxed text-foreground transition-colors hover:text-primary"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="font-medium">{actionItem.text}</span>
            <ArrowRight className="ml-auto mt-0.5 h-3 w-3 shrink-0" />
          </button>
        )
      )}
    </div>
  )
}
