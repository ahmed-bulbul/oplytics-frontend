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

interface RedditAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_ACCOUNTS = [
  { id: "t2_abc123", name: "BrandName Official", type: "Business" },
  { id: "t2_def456", name: "Product Launch Campaign", type: "Standard" },
]

const PERMISSIONS = [
  { id: "ads_read", label: "Read Ads Data", description: "View campaign performance and metrics", required: true },
  { id: "ads_manage", label: "Manage Campaigns", description: "Create and edit ad campaigns", required: true },
  { id: "billing", label: "Billing Information", description: "View spend and budget data", required: true },
  { id: "targeting", label: "Targeting & Audiences", description: "Access subreddit and interest targeting", required: false },
  { id: "conversions", label: "Conversion Tracking", description: "View Reddit Pixel conversion data", required: false },
]

type Step = "signin" | "accounts" | "permissions" | "connecting" | "success"

export function RedditAdsConnectDialog({ open, onOpenChange }: RedditAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("signin")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>(
    PERMISSIONS.filter((p) => p.required).map((p) => p.id)
  )

  function reset() {
    setStep("signin")
    setSelectedAccount(null)
    setPermissions(PERMISSIONS.filter((p) => p.required).map((p) => p.id))
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleRedditSignIn() {
    setStep("connecting")
    setTimeout(() => setStep("accounts"), 1500)
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF4500]/10">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#FF4500]">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </div>
            <div>
              <DialogTitle>Connect Reddit Ads</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === "signin" && "Sign in with your Reddit account"}
                {step === "accounts" && "Select an advertiser account"}
                {step === "permissions" && "Review data access permissions"}
                {step === "connecting" && "Connecting to Reddit Ads..."}
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
                Connect your Reddit Ads account to track promoted post performance,
                subreddit targeting effectiveness, and community engagement metrics.
              </p>
            </div>

            <Button
              onClick={handleRedditSignIn}
              className="w-full gap-3 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
              </svg>
              Continue with Reddit
            </Button>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Account */}
        {step === "accounts" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the advertiser account you want to connect:
            </p>

            <div className="space-y-2">
              {MOCK_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-colors",
                    selectedAccount === account.id
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.type} Account · {account.id}
                      </p>
                    </div>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selectedAccount === account.id
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-muted-foreground"
                    )}>
                      {selectedAccount === account.id && (
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
                disabled={!selectedAccount}
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
              <Button variant="ghost" onClick={() => setStep("accounts")}>
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
            <p className="mt-4 text-sm text-muted-foreground">Connecting to Reddit Ads...</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold">Reddit Ads Connected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your account is now syncing
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
