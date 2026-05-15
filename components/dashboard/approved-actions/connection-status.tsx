"use client"

import { CheckCircle2, Eye, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  PLATFORM_LABEL,
  WRITE_ACCESS_LABEL,
  type AdPlatform,
  type WriteAccessState,
} from "./types"
import { useApprovedActions } from "./approved-actions-context"

/**
 * Compact pills showing each paid-platform connection's write-access
 * state. Lives in the Action Center header so operators can confirm at
 * a glance whether an approved action will actually execute, or whether
 * they need to grant additional permissions first.
 *
 * Each pill is interactive — clicking opens a popover that explains the
 * state and, where relevant, offers a (mock) "Request access" affordance.
 * In production that would deep-link into the platform's OAuth scope
 * grant flow.
 */
const STATE_STYLES: Record<
  WriteAccessState,
  { className: string; icon: typeof CheckCircle2 }
> = {
  write_access_connected: {
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  read_only_connected: {
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Eye,
  },
  permission_required: {
    className:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    icon: Lock,
  },
}

function PlatformConnectionPill({ platform }: { platform: AdPlatform }) {
  const { writeAccess, setWriteAccess } = useApprovedActions()
  const state = writeAccess[platform]
  const style = STATE_STYLES[state]
  const Icon = style.icon

  // Mock "request access" handler — in production this would kick off
  // the OAuth scope upgrade flow for the platform. For the beta we just
  // flip the local state so the operator can see the UI react.
  const handleRequestAccess = () => {
    setWriteAccess(platform, "write_access_connected")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-90",
            style.className,
          )}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
          <span>{PLATFORM_LABEL[platform]}</span>
          <span className="text-[10px] opacity-70">
            · {WRITE_ACCESS_LABEL[state]}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", style.className.split(" ").find((c) => c.startsWith("text-")))} />
            <p className="text-xs font-semibold">
              {PLATFORM_LABEL[platform]} · {WRITE_ACCESS_LABEL[state]}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {state === "write_access_connected" &&
              "Approved actions can be executed against this platform. All changes are logged and human-approved."}
            {state === "read_only_connected" &&
              "We can read performance data but not execute changes. Grant the additional write scope to enable approved actions."}
            {state === "permission_required" &&
              "Connection is authenticated but missing the scope needed to execute approved actions."}
          </p>
          {state !== "write_access_connected" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-full text-[11px]"
              onClick={handleRequestAccess}
            >
              Request write access
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ConnectionStatus({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground",
        className,
      )}
      aria-label="Approved actions connection status"
    >
      <span className="font-medium uppercase tracking-wider">Connections</span>
      <PlatformConnectionPill platform="meta" />
      <PlatformConnectionPill platform="google" />
    </div>
  )
}
