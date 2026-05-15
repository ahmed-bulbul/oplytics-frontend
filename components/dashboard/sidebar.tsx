"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Plug,
  FolderKanban,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Brain,
  Sparkles,
  GitCompareArrows,
  Package,
  Users2,
  CalendarRange,
  Target,
  LineChart,
  FileText,
  BellRing,
  Building2,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AiAssistantPanel } from "@/components/dashboard/ai-assistant"
import { useAuth } from "@/contexts/AuthContext"

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
  const [settingsOpen, setSettingsOpen] = useState(
    pathname === "/settings" || pathname === "/integrations"
  )
  const [intelligenceOpen, setIntelligenceOpen] = useState(
    pathname.startsWith("/intelligence")
  )
  const [planningOpen, setPlanningOpen] = useState(
    pathname.startsWith("/planning")
  )

  return (
    <aside className="hidden h-screen w-60 flex-col border-r border-border bg-card md:flex">
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

      {/* Navigation */}
      <nav className="mt-2 space-y-0.5 px-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Action Center */}
        <Link
          href="/action-center"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/action-center" || pathname === "/manage"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <FolderKanban className="h-4 w-4" />
          Action Center
        </Link>

        {/* Intelligence (expandable) */}
        <button
          onClick={() => setIntelligenceOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/intelligence")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Brain className="h-4 w-4" />
          <span className="flex-1 text-left">Intelligence</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              intelligenceOpen && "rotate-180"
            )}
          />
        </button>

        {intelligenceOpen && (
          <div className="ml-4 space-y-0.5 border-l border-border pl-3">
            <Link
              href="/intelligence/creative"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/intelligence/creative"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Creative Performance
            </Link>
            <Link
              href="/intelligence/attribution"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/intelligence/attribution"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              Attribution
            </Link>
            <Link
              href="/intelligence/products"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/intelligence/products"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Product Profitability
            </Link>
            <Link
              href="/intelligence/cohorts"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/intelligence/cohorts"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Users2 className="h-3.5 w-3.5" />
              Cohorts &amp; LTV
            </Link>
          </div>
        )}

        {/* Planning (expandable) */}
        <button
          onClick={() => setPlanningOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/planning")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <CalendarRange className="h-4 w-4" />
          <span className="flex-1 text-left">Planning</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              planningOpen && "rotate-180"
            )}
          />
        </button>

        {planningOpen && (
          <div className="ml-4 space-y-0.5 border-l border-border pl-3">
            <Link
              href="/planning/goals"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/planning/goals"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              Goals &amp; Targets
            </Link>
            <Link
              href="/planning/forecasts"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/planning/forecasts"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LineChart className="h-3.5 w-3.5" />
              Forecasts
            </Link>
            <Link
              href="/planning/reports"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/planning/reports"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Reports
            </Link>
            <Link
              href="/planning/alerts"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/planning/alerts"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BellRing className="h-3.5 w-3.5" />
              Alerts
            </Link>
          </div>
        )}

        {/* Agency (single link, optional Phase 3B feature) */}
        <Link
          href="/agency"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/agency")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Building2 className="h-4 w-4" />
          Agency
        </Link>

        {/* Settings (expandable) */}
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings" || pathname === "/integrations"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="flex-1 text-left">Settings</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              settingsOpen && "rotate-180"
            )}
          />
        </button>

        {/* Settings sub-items */}
        {settingsOpen && (
          <div className="ml-4 space-y-0.5 border-l border-border pl-3">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              General
            </Link>
            <Link
              href="/integrations"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/integrations"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Plug className="h-3.5 w-3.5" />
              Integrations
            </Link>
            <Link
              href="/settings?tab=billing"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </Link>
          </div>
        )}
      </nav>

      {/* AI Assistant Panel */}
      <AiAssistantPanel className="mx-2 mt-4" />

      {/* Help & Logout */}
      <div className="mt-auto border-t border-border px-2 py-2">
        {user?.email && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName || user.email}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
                {((displayName || user.email).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("")) || "U"}
              </div>
            )}
            <div className="min-w-0">
              {displayName && (
                <div className="truncate text-xs font-medium text-foreground">{displayName}</div>
              )}
              <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        {/* Pro Plan — quiet footer note */}
        <Link
          href="/settings?tab=billing"
          className="mt-1 flex items-center justify-between rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span>Manage billing</span>
          <span>Stripe</span>
        </Link>
      </div>
    </aside>
  )
}
