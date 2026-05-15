"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, Sparkles, X, Menu, LayoutDashboard, FolderKanban, Settings, Plug, HelpCircle, LogOut, Target, LineChart, FileText, BellRing, Building2, Compass } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AiAssistantPanel } from "@/components/dashboard/ai-assistant"
import { NotificationsPopover } from "@/components/dashboard/notifications-popover"
import { DataHealthPopover } from "@/components/dashboard/data-health-popover"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DemoGuideModal } from "@/components/onboarding/demo-guide-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "What was my best performing channel last week?",
  "Show me revenue trend for the past 30 days",
  "Which products have the highest return rate?",
  "Compare Meta Ads vs Google Ads ROAS",
  "What is my customer acquisition cost trend?",
]

const QUICK_RESULTS = [
  { label: "Revenue last 7 days", value: "$128,430", change: "+12.4%" },
  { label: "Top channel", value: "Meta Ads", change: "3.8x ROAS" },
  { label: "Best product", value: "Classic Tee", change: "$24,100" },
]

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoGuideOpen, setDemoGuideOpen] = useState(false)

  const userEmail = user?.email ?? ""
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || userEmail || "Account"
  const initialsSource = displayName || userEmail
  const initials = initialsSource
    ? initialsSource
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "U"

  const showDropdown = focused && !answered
  const showAnswer = focused && answered

  function handleSelect(suggestion: string) {
    setQuery(suggestion)
    setAnswered(true)
  }

  function handleClear() {
    setQuery("")
    setAnswered(false)
    setFocused(false)
  }

  // Header sits above the dashboard's sticky filter toolbar (which is
  // z-30), otherwise the expanded search dropdown — anchored to the
  // search input inside this header — gets painted under that sticky
  // bar when it extends below the header.
  return (
    <header className="relative z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 md:gap-4 md:px-4">
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main navigation menu for Optilytics</SheetDescription>
          </VisuallyHidden>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-foreground">OPTILYTICS</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Analytics</p>
              </div>
            </div>
            
            {/* Nav */}
            <nav className="flex-1 space-y-1 p-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/action-center"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/action-center" || pathname === "/manage"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <FolderKanban className="h-4 w-4" />
                Action Center
              </button>
              <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Planning
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/planning/goals"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/planning/goals"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Target className="h-4 w-4" />
                Goals &amp; Targets
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/planning/forecasts"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/planning/forecasts"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <LineChart className="h-4 w-4" />
                Forecasts
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/planning/reports"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/planning/reports"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <FileText className="h-4 w-4" />
                Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/planning/alerts"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/planning/alerts"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <BellRing className="h-4 w-4" />
                Alerts
              </button>
              <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/agency"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/agency")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Building2 className="h-4 w-4" />
                Agency
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/settings"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => router.push("/integrations"), 150)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/integrations" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Plug className="h-4 w-4" />
                Integrations
              </button>
            </nav>

            {/* AI Assistant */}
            <AiAssistantPanel className="mx-3" />
            
            {/* Footer */}
            <div className="border-t border-border p-3">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                <HelpCircle className="h-4 w-4" />
                Help
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* AI Search — centered */}
      <div className="hidden flex-1 justify-center sm:flex">
        <div className="relative w-full max-w-lg">
          <div className={cn(
            "flex items-center gap-2 rounded-full border bg-background px-4 py-2 transition-all",
            focused ? "border-primary shadow-md" : "border-border"
          )}>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAnswered(false) }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Ask about revenue, CAC, ROAS, cohorts, or profit..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              {/* Quick stats */}
              <div className="border-b border-border px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Insights</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_RESULTS.map((r) => (
                    <div key={r.label} className="rounded-lg bg-muted/60 px-2 py-2">
                      <p className="text-[10px] text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-semibold text-foreground">{r.value}</p>
                      <p className="text-[10px] text-emerald-600">{r.change}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Suggested questions */}
              <div className="px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Questions</p>
                <ul className="space-y-0.5">
                  {SUGGESTIONS.filter(s =>
                    !query || s.toLowerCase().includes(query.toLowerCase())
                  ).map((s) => (
                    <li key={s}>
                      <button
                        onMouseDown={() => handleSelect(s)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* AI Answer panel */}
          {showAnswer && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="border-b border-border bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Curator AI</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{query}</p>
              </div>
              <div className="px-4 py-4 space-y-3">
                <p className="text-sm text-foreground leading-relaxed">
                  Based on your last 7 days of data, <strong>Meta Ads</strong> was your top performing channel with a ROAS of <strong>3.8x</strong>, generating <strong>$48,200</strong> in attributed revenue on <strong>$12,700</strong> ad spend. Google Ads followed at 2.9x ROAS.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Meta Ads ROAS", value: "3.8x", color: "text-emerald-600" },
                    { label: "Google Ads ROAS", value: "2.9x", color: "text-emerald-600" },
                    { label: "TikTok Ads ROAS", value: "1.4x", color: "text-amber-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className={cn("text-base font-bold", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="text-xs" onClick={handleClear}>
                  Ask another question
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right — demo guide + bell + user */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setDemoGuideOpen(true)}
                aria-label="Open Demo Guide"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <Compass className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Demo Guide
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DataHealthPopover />
        <NotificationsPopover />

        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 md:px-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {initials}
            </div>
          )}
          <div className="hidden lg:block">
            <p className="max-w-[140px] truncate text-xs font-medium leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{user?.role ?? "Admin"}</p>
          </div>
        </div>
      </div>

      <DemoGuideModal open={demoGuideOpen} onOpenChange={setDemoGuideOpen} />
    </header>
  )
}
