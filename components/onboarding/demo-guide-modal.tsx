"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  Users,
  LineChart,
  Building2,
  ArrowRight,
} from "lucide-react"
import { dispatchReplayOnboarding } from "./onboarding-controller"

interface DemoGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = [
  {
    n: "01",
    icon: LayoutDashboard,
    title: "Start at the Dashboard",
    body: "Anchor on revenue, contribution margin, and pacing for the current period. The KPIs at top are the same ones an owner asks about every Monday.",
    href: "/",
    cta: "Open Dashboard",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Open the AI Assistant",
    body: "Click the AI Assistant in the sidebar. Walk through one critical recommendation — show the evidence, not just the headline.",
    href: "/",
    cta: "Show me",
  },
  {
    n: "03",
    icon: FolderKanban,
    title: "Visit the Action Center",
    body: "Show how recommendations are prioritized. Pick a row, open the drawer, and click 'Review recommendation' to walk through the decision flow.",
    href: "/action-center",
    cta: "Open Action Center",
  },
  {
    n: "04",
    icon: Users,
    title: "Open Intelligence → Cohorts",
    body: "Demonstrate that retention and payback drive the pacing story. Open a cohort to show acquisition channel mix and retention curve.",
    href: "/intelligence/cohorts",
    cta: "Open Cohorts",
  },
  {
    n: "05",
    icon: LineChart,
    title: "Show Planning → Forecasts",
    body: "Pace the current month, run a what-if scenario, and tie it back to a goal. This is the moment where the math gets honest.",
    href: "/planning/forecasts",
    cta: "Open Forecasts",
  },
  {
    n: "06",
    icon: Building2,
    title: "Finish on the Agency rollup",
    body: "If they manage multiple stores, the Agency view is the magic moment — one health pill per brand, one place to triage.",
    href: "/agency",
    cta: "Open Agency",
  },
]

/**
 * A lightweight "how to demo Optilytics" guide. Reachable from a small
 * compass icon in the top bar. Manual click-through, no auto-advance —
 * presenters can move at their own pace.
 */
export function DemoGuideModal({ open, onOpenChange }: DemoGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base">Demo Guide</DialogTitle>
              <DialogDescription className="text-xs">
                A six-step path through Optilytics for sales calls and live demos. Click any step
                to jump to the relevant view.
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-[10px] uppercase tracking-wider text-amber-700"
            >
              Demo Mode
            </Badge>
          </div>
        </DialogHeader>

        <ol className="max-h-[60vh] divide-y divide-border overflow-y-auto">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li
                key={step.n}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Step {step.n}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  <Link href={step.href}>
                    {step.cta}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </li>
            )
          })}
        </ol>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border bg-card px-6 py-3">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              dispatchReplayOnboarding()
            }}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Replay first-run onboarding
          </button>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
