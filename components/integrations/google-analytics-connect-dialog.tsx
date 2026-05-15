"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoogleAnalyticsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "account" | "permissions" | "connecting" | "success"

/**
 * Connect dialog for Google Analytics 4. Operators authorize via
 * Google OAuth and select the GA4 Property they want to ingest. The
 * permissions list maps directly to the dashboard areas GA powers:
 * Source/Medium attribution, Landing Page performance, on-site
 * conversion rate, and audience overlap.
 */
export function GoogleAnalyticsConnectDialog({
  open,
  onOpenChange,
}: GoogleAnalyticsConnectDialogProps) {
  const [step, setStep] = useState<Step>("account")
  const [propertyId, setPropertyId] = useState("")
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    sessions: true,
    events: true,
    sourceMedium: true,
    landing: true,
    audiences: false,
  })

  const permissionsList = [
    {
      id: "sessions",
      label: "Sessions & Users",
      description: "Daily sessions, users, and engagement data for on-site conversion rate",
      required: true,
    },
    {
      id: "events",
      label: "Conversions & Events",
      description: "Purchase events and custom conversions used in attribution math",
      required: true,
    },
    {
      id: "sourceMedium",
      label: "Source / Medium / Campaign",
      description: "UTM dimensions powering the Source and Medium filters across the dashboard",
      required: true,
    },
    {
      id: "landing",
      label: "Landing Page Reports",
      description: "Per-page revenue, sessions, and bounce rate for the Landing Optimization view",
      required: true,
    },
    {
      id: "audiences",
      label: "Audiences",
      description: "Custom audience definitions and overlap reporting (optional)",
      required: false,
    },
  ]

  function handleContinue() {
    if (step === "account" && propertyId.trim()) {
      setStep("permissions")
    } else if (step === "permissions") {
      setStep("connecting")
      setTimeout(() => setStep("success"), 2000)
    }
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => {
      setStep("account")
      setPropertyId("")
      setPermissions({
        sessions: true,
        events: true,
        sourceMedium: true,
        landing: true,
        audiences: false,
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === "account" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Google Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  GA4 Property ID
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Enter the numeric Property ID of the GA4 property you want to connect
                </p>
                <Input
                  placeholder="123456789"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="font-mono"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Find this in Google Analytics under Admin → Property settings
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  You&apos;ll be redirected to Google to authorize this connection. Universal
                  Analytics (UA) properties are not supported — only GA4.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!propertyId.trim()}
                className="bg-[#F9AB00] text-[#202124] hover:bg-[#F9AB00]/90"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "permissions" && (
          <>
            <DialogHeader>
              <DialogTitle>Authorize Data Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Google will ask you to grant read-only access to the following GA4 dimensions and
                metrics:
              </p>

              <div className="space-y-3">
                {permissionsList.map((perm) => (
                  <div
                    key={perm.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      perm.required
                        ? "cursor-not-allowed border-border bg-muted/40"
                        : "cursor-pointer border-border hover:bg-muted/50",
                    )}
                  >
                    <Checkbox
                      checked={permissions[perm.id]}
                      onCheckedChange={(checked) =>
                        !perm.required &&
                        setPermissions((prev) => ({
                          ...prev,
                          [perm.id]: checked === true,
                        }))
                      }
                      disabled={perm.required}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{perm.label}</span>
                        {perm.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  You&apos;ll need to be at least a Viewer on the GA4 property to complete the
                  authorization.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStep("account")}>
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#F9AB00] text-[#202124] hover:bg-[#F9AB00]/90"
              >
                Authorize with Google
              </Button>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#F9AB00]" />
            <div className="text-center">
              <p className="font-semibold">Connecting your GA4 property...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re redirecting you to Google to authorize access
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Connection Successful</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <div className="text-center">
                  <p className="font-semibold">Your GA4 property is connected</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Property ID: {propertyId}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">Next steps:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Sessions and events sync every 4 hours</li>
                  <li>Source / Medium filters become populated within 30 minutes</li>
                  <li>Last 90 days of historical data is being imported</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  Tip: visit Landing Optimization to see GA-driven on-site conversion rate
                  alongside ad spend.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                className="bg-[#F9AB00] text-[#202124] hover:bg-[#F9AB00]/90"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
