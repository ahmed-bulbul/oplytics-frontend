"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Plug,
  Target,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user reaches the final step and clicks Finish, or skips. */
  onComplete?: () => void
}

type StepId = "welcome" | "connect" | "goals" | "settings"

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "connect", label: "Connect data", icon: Plug },
  { id: "goals", label: "Set goals", icon: Target },
  { id: "settings", label: "Confirm settings", icon: ShieldCheck },
]

const DATA_SOURCES = [
  { id: "shopify", name: "Shopify", category: "Storefront" },
  { id: "meta", name: "Meta Ads", category: "Ad Platform" },
  { id: "google", name: "Google Ads", category: "Ad Platform" },
  { id: "klaviyo", name: "Klaviyo", category: "Email & SMS" },
  { id: "tiktok", name: "TikTok Ads", category: "Ad Platform" },
  { id: "cogs", name: "Cost of Goods (CSV)", category: "Profitability" },
]

/**
 * The first-run onboarding modal. 4 steps:
 *  1. Welcome / framing
 *  2. Connect data (visual mock)
 *  3. Set goals (revenue, margin, ROAS)
 *  4. Confirm calculation settings
 *
 * Designed to layer over the dashboard so the user can see what they're
 * unlocking. Closing or finishing the modal calls `onComplete`.
 */
export function WelcomeModal({ open, onOpenChange, onComplete }: WelcomeModalProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [connected, setConnected] = useState<Record<string, boolean>>({
    shopify: true,
    meta: true,
    google: true,
    klaviyo: false,
    tiktok: false,
    cogs: true,
  })
  const [goals, setGoals] = useState({
    revenue: "480000",
    cmPercent: "35",
    roas: "2.4",
  })
  const [settings, setSettings] = useState({
    deductRefunds: true,
    deductFees: true,
    attributionWindow: true,
  })

  // Reset to first step whenever the modal is reopened.
  useEffect(() => {
    if (open) setStepIndex(0)
  }, [open])

  const currentStep = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const connectedCount = useMemo(
    () => Object.values(connected).filter(Boolean).length,
    [connected],
  )

  const handleNext = () => {
    if (isLast) {
      onComplete?.()
      onOpenChange(false)
      return
    }
    setStepIndex((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const handleBack = () => {
    setStepIndex((s) => Math.max(0, s - 1))
  }

  const handleSkip = () => {
    onComplete?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <DialogTitle className="text-base">Welcome to Optilytics</DialogTitle>
                <DialogDescription className="text-xs">
                  A quick tour through how the product is set up. You can skip and revisit any time.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[10px] uppercase tracking-wider text-amber-700">
              Demo Mode
            </Badge>
          </div>

          {/* Stepper */}
          <ol className="mt-4 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon
              const isActive = i === stepIndex
              const isDone = i < stepIndex
              return (
                <li key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </DialogHeader>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {currentStep.id === "welcome" ? <WelcomeStep /> : null}

          {currentStep.id === "connect" ? (
            <ConnectStep
              connected={connected}
              onToggle={(id) =>
                setConnected((prev) => ({ ...prev, [id]: !prev[id] }))
              }
            />
          ) : null}

          {currentStep.id === "goals" ? (
            <GoalsStep goals={goals} onChange={setGoals} />
          ) : null}

          {currentStep.id === "settings" ? (
            <SettingsStep settings={settings} onChange={setSettings} />
          ) : null}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border bg-card px-6 py-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            {!isFirst ? (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Button>
            ) : null}
            <Button size="sm" onClick={handleNext}>
              {isLast ? (
                <>Finish setup <Check className="ml-1 h-3.5 w-3.5" /></>
              ) : (
                <>
                  {currentStep.id === "connect" ? `Continue · ${connectedCount} connected` : "Continue"}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WelcomeStep() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          The profit-aware alternative to ROAS-only dashboards.
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Optilytics ties advertising performance to contribution margin, refunds, inventory, and
          subscriptions — the variables that actually move the bottom line.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { title: "AI Assistant", body: "Reviews your data and surfaces what to look at next." },
          { title: "Action Center", body: "Prioritized recommendations to improve profit." },
          { title: "Intelligence", body: "Channels, cohorts, attribution, products, creatives." },
          { title: "Planning", body: "Goals, forecasts, alerts, and scheduled reports." },
        ].map((c) => (
          <li
            key={c.title}
            className="rounded-lg border border-border bg-muted/20 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {c.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-muted-foreground">
        You&apos;re currently in <span className="font-semibold text-foreground">Demo Mode</span>.
        Numbers below are illustrative — flip to Live Mode any time from the top bar.
      </p>
    </div>
  )
}

function ConnectStep({
  connected,
  onToggle,
}: {
  connected: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Connect your data sources</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          We pre-connected the most common ones for the demo. Tap a row to toggle. Real OAuth wiring
          lives on the Integrations page.
        </p>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {DATA_SOURCES.map((src) => {
          const isOn = connected[src.id]
          return (
            <li
              key={src.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{src.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {src.category}
                </p>
              </div>
              <Button
                size="sm"
                variant={isOn ? "secondary" : "outline"}
                onClick={() => onToggle(src.id)}
                className={cn("h-7 text-xs", isOn && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20")}
              >
                {isOn ? <><Check className="mr-1 h-3 w-3" /> Connected</> : "Connect"}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function GoalsStep({
  goals,
  onChange,
}: {
  goals: { revenue: string; cmPercent: string; roas: string }
  onChange: (g: { revenue: string; cmPercent: string; roas: string }) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Set your starting goals</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          These power pacing and forecasts in Planning. The demo defaults below are sensible
          starting points — adjust if you&apos;d like.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field
          id="revenue"
          label="Monthly revenue ($)"
          value={goals.revenue}
          onChange={(v) => onChange({ ...goals, revenue: v })}
        />
        <Field
          id="cmPercent"
          label="Contribution margin %"
          value={goals.cmPercent}
          onChange={(v) => onChange({ ...goals, cmPercent: v })}
        />
        <Field
          id="roas"
          label="Blended ROAS"
          value={goals.roas}
          onChange={(v) => onChange({ ...goals, roas: v })}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        These are demo defaults and aren&apos;t yet wired to your live store.
      </p>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="h-9 text-sm"
      />
    </div>
  )
}

function SettingsStep({
  settings,
  onChange,
}: {
  settings: { deductRefunds: boolean; deductFees: boolean; attributionWindow: boolean }
  onChange: (s: { deductRefunds: boolean; deductFees: boolean; attributionWindow: boolean }) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Confirm calculation settings</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          These shape how we compute contribution margin, blended ROAS, and attribution. Defaults
          match what most stores want — you can change them later in Settings.
        </p>
      </div>
      <ul className="space-y-2">
        {[
          {
            key: "deductRefunds" as const,
            title: "Deduct refunds from revenue",
            body: "Recommended. Treats refunded revenue as never having happened so margins don't get inflated.",
          },
          {
            key: "deductFees" as const,
            title: "Deduct payment + shipping fees",
            body: "Recommended. Subtracts processor and shipping fees from contribution margin.",
          },
          {
            key: "attributionWindow" as const,
            title: "Use a 7-day click attribution window",
            body: "Standard for most ecommerce. Affects channel attribution in Intelligence.",
          },
        ].map((row) => (
          <li
            key={row.key}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{row.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{row.body}</p>
            </div>
            <Switch
              checked={settings[row.key]}
              onCheckedChange={(checked) =>
                onChange({ ...settings, [row.key]: checked })
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
