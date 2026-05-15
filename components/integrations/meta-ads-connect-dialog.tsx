"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetaAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "account" | "permissions" | "connecting" | "success"

export function MetaAdsConnectDialog({
  open,
  onOpenChange,
}: MetaAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("account")
  const [adAccountId, setAdAccountId] = useState("")
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    campaigns: true,
    adsets: true,
    ads: true,
    audiences: true,
    pixels: true,
    conversions: false,
  })

  const permissionsList = [
    {
      id: "campaigns",
      label: "Campaigns",
      description: "Access campaign performance and structure",
      required: true,
    },
    {
      id: "adsets",
      label: "Ad Sets",
      description: "View and analyze ad set metrics",
      required: true,
    },
    {
      id: "ads",
      label: "Ads",
      description: "Access individual ad performance data",
      required: true,
    },
    {
      id: "audiences",
      label: "Audiences",
      description: "View audience insights and sizes",
      required: true,
    },
    {
      id: "pixels",
      label: "Pixels",
      description: "Track conversion events and user actions",
      required: true,
    },
    {
      id: "conversions",
      label: "Conversions API",
      description: "Server-side conversion tracking (optional)",
      required: false,
    },
  ]

  function handleContinue() {
    if (step === "account" && adAccountId.trim()) {
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
      setAdAccountId("")
      setPermissions({
        campaigns: true,
        adsets: true,
        ads: true,
        audiences: true,
        pixels: true,
        conversions: false,
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === "account" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Meta Ads Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ad Account ID
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter your Meta Ads Manager account ID to begin setup
                </p>
                <Input
                  placeholder="act_1234567890"
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You can find this in Ads Manager under Settings
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  ℹ️ You&apos;ll be redirected to Meta to authorize this connection using OAuth
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!adAccountId.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "permissions" && (
          <>
            <DialogHeader>
              <DialogTitle>Authorize Permissions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Meta will ask you to authorize the following permissions:
              </p>

              <div className="space-y-3">
                {permissionsList.map((perm) => (
                  <div
                    key={perm.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      perm.required
                        ? "border-border bg-muted/40 cursor-not-allowed"
                        : "border-border hover:bg-muted/50 cursor-pointer"
                    )}
                  >
                    <Checkbox
                      checked={permissions[perm.id]}
                      onCheckedChange={(checked) =>
                        !perm.required &&
                        setPermissions((prev) => ({
                          ...prev,
                          [perm.id]: checked,
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  ⚠️ You&apos;ll need to log in with your Meta account and approve all required
                  permissions to complete the setup
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStep("account")}>
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Authorize with Meta
              </Button>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <div className="text-center">
              <p className="font-semibold">Connecting your account...</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re redirecting you to Meta to authorize access
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Connection Successful!</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <div className="text-center">
                  <p className="font-semibold">Your Meta Ads account is connected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Account ID: {adAccountId}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                <p className="font-medium text-sm">Next steps:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Campaign data will sync every 6 hours</li>
                  <li>✓ Real-time performance metrics are now available</li>
                  <li>✓ Historical data from the last 90 days is being imported</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  💡 Check your dashboard to see Meta Ads performance metrics alongside other
                  channels
                </p>
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
