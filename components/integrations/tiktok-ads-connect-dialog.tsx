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
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TikTokAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_ADVERTISERS = [
  { id: "7012345678901234567", name: "Brand TikTok Ads", businessCenter: "Acme Inc Business Center" },
  { id: "7012345678901234568", name: "Product Launch 2024", businessCenter: "Acme Inc Business Center" },
]

const PERMISSIONS = [
  { id: "campaign", label: "Campaign Management", description: "View and manage ad campaigns, ad groups, and ads", required: true },
  { id: "reporting", label: "Reporting & Analytics", description: "Access performance metrics and reports", required: true },
  { id: "audience", label: "Audience Management", description: "Access custom audiences and lookalikes", required: false },
  { id: "creative", label: "Creative Assets", description: "View videos, images, and spark ads", required: false },
  { id: "pixel", label: "TikTok Pixel", description: "Access pixel events and conversions", required: false },
]

type Step = "signin" | "advertisers" | "permissions" | "connecting" | "success"

export function TikTokAdsConnectDialog({ open, onOpenChange }: TikTokAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("signin")
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>(
    PERMISSIONS.filter((p) => p.required).map((p) => p.id)
  )

  function reset() {
    setStep("signin")
    setSelectedAdvertiser(null)
    setPermissions(PERMISSIONS.filter((p) => p.required).map((p) => p.id))
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleTikTokSignIn() {
    setStep("connecting")
    setTimeout(() => setStep("advertisers"), 1500)
  }

  function togglePermission(id: string) {
    const perm = PERMISSIONS.find((p) => p.id === id)
    if (perm?.required) return
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function handleConnect() {
    setStep("connecting")
    setTimeout(() => setStep("success"), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div>
              <DialogTitle>Connect TikTok Ads</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === "signin" && "Sign in with TikTok for Business"}
                {step === "advertisers" && "Select an advertiser account"}
                {step === "permissions" && "Review data access permissions"}
                {step === "connecting" && "Connecting to TikTok..."}
                {step === "success" && "Successfully connected!"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Sign in */}
        {step === "signin" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Connect your TikTok Ads Manager to track short-form video ad performance,
                audience engagement, and conversion metrics across your campaigns.
              </p>
            </div>

            <Button
              onClick={handleTikTokSignIn}
              className="w-full gap-3 bg-black hover:bg-black/90 text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              Continue with TikTok
            </Button>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Advertiser */}
        {step === "advertisers" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the advertiser account you want to connect:
            </p>

            <div className="space-y-2">
              {MOCK_ADVERTISERS.map((adv) => (
                <button
                  key={adv.id}
                  onClick={() => setSelectedAdvertiser(adv.id)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-colors",
                    selectedAdvertiser === adv.id
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{adv.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {adv.businessCenter}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        ID: {adv.id}
                      </p>
                    </div>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selectedAdvertiser === adv.id
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-muted-foreground"
                    )}>
                      {selectedAdvertiser === adv.id && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="ghost" onClick={() => setStep("signin")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("permissions")}
                disabled={!selectedAdvertiser}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Permissions */}
        {step === "permissions" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {PERMISSIONS.map((perm) => (
                <div
                  key={perm.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    perm.required ? "border-border bg-muted/30" : "border-border"
                  )}
                >
                  <Checkbox
                    id={perm.id}
                    checked={permissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                    disabled={perm.required}
                  />
                  <div className="flex-1">
                    <label htmlFor={perm.id} className="text-sm font-medium cursor-pointer">
                      {perm.label}
                      {perm.required && (
                        <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Button variant="ghost" onClick={() => setStep("advertisers")}>
                Back
              </Button>
              <Button onClick={handleConnect} className="bg-emerald-600 hover:bg-emerald-700">
                Connect Account
              </Button>
            </div>
          </div>
        )}

        {/* Connecting */}
        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-muted-foreground">Connecting to TikTok Ads...</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold">TikTok Ads Connected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your advertiser account is now syncing
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sync frequency</span>
                <span className="font-medium">Every 30 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data range</span>
                <span className="font-medium">Last 60 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metrics included</span>
                <span className="font-medium">Views, CTR, CPA, ROAS</span>
              </div>
            </div>

            <Button onClick={() => handleClose(false)} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
