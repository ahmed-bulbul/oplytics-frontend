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
import { Check, Loader2, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkedInAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_ACCOUNTS = [
  { id: "urn:li:sponsoredAccount:501234567", name: "Acme Corp Marketing", company: "Acme Corporation", status: "Active" },
  { id: "urn:li:sponsoredAccount:501234568", name: "Acme Recruiting", company: "Acme Corporation", status: "Active" },
]

const PERMISSIONS = [
  { id: "campaigns", label: "Campaign Management", description: "View and manage sponsored content campaigns", required: true },
  { id: "analytics", label: "Analytics & Reporting", description: "Access performance metrics and insights", required: true },
  { id: "leads", label: "Lead Gen Forms", description: "Access lead generation form submissions", required: false },
  { id: "audiences", label: "Matched Audiences", description: "Manage retargeting and account lists", required: false },
  { id: "conversions", label: "Conversion Tracking", description: "View LinkedIn Insight Tag conversions", required: false },
]

type Step = "signin" | "accounts" | "permissions" | "connecting" | "success"

export function LinkedInAdsConnectDialog({ open, onOpenChange }: LinkedInAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("signin")
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [permissions, setPermissions] = useState<string[]>(
    PERMISSIONS.filter((p) => p.required).map((p) => p.id)
  )

  function reset() {
    setStep("signin")
    setSelectedAccounts([])
    setPermissions(PERMISSIONS.filter((p) => p.required).map((p) => p.id))
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleLinkedInSignIn() {
    setStep("connecting")
    setTimeout(() => setStep("accounts"), 1500)
  }

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0A66C2]">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div>
              <DialogTitle>Connect LinkedIn Ads</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === "signin" && "Sign in with your LinkedIn account"}
                {step === "accounts" && "Select ad accounts to connect"}
                {step === "permissions" && "Review data access permissions"}
                {step === "connecting" && "Connecting to LinkedIn..."}
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
                Connect your LinkedIn Campaign Manager to track B2B advertising performance,
                lead generation metrics, and professional audience engagement.
              </p>
            </div>

            <Button
              onClick={handleLinkedInSignIn}
              className="w-full gap-3 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Sign in with LinkedIn
            </Button>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Accounts */}
        {step === "accounts" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the ad accounts you want to connect:
            </p>

            <div className="space-y-2">
              {MOCK_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => toggleAccount(account.id)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-colors",
                    selectedAccounts.includes(account.id)
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.company} · {account.status}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selectedAccounts.includes(account.id)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-muted-foreground"
                    )}>
                      {selectedAccounts.includes(account.id) && (
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
                disabled={selectedAccounts.length === 0}
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
                Connect {selectedAccounts.length} Account{selectedAccounts.length > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}

        {/* Connecting */}
        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-muted-foreground">Connecting to LinkedIn...</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold">LinkedIn Ads Connected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedAccounts.length} account{selectedAccounts.length > 1 ? "s" : ""} syncing
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sync frequency</span>
                <span className="font-medium">Every hour</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data range</span>
                <span className="font-medium">Last 90 days</span>
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
