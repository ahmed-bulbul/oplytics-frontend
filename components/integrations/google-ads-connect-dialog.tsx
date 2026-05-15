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
import { Check, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoogleAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_ACCOUNTS = [
  { id: "123-456-7890", name: "Main Brand Account", spend: "$45,230/mo" },
  { id: "234-567-8901", name: "Product Launch 2024", spend: "$12,500/mo" },
  { id: "345-678-9012", name: "Retargeting Campaigns", spend: "$8,750/mo" },
]

const PERMISSIONS = [
  { id: "campaigns", label: "Campaigns & Ad Groups", description: "View and manage campaign structure", required: true },
  { id: "keywords", label: "Keywords & Targeting", description: "Access keyword performance and targeting settings", required: true },
  { id: "conversions", label: "Conversion Tracking", description: "View conversion data and goals", required: true },
  { id: "billing", label: "Billing & Budget", description: "View spend and budget information", required: true },
  { id: "audiences", label: "Audience Segments", description: "Access remarketing lists and audiences", required: false },
  { id: "extensions", label: "Ad Extensions", description: "View sitelinks, callouts, and other extensions", required: false },
]

type Step = "signin" | "accounts" | "permissions" | "connecting" | "success"

export function GoogleAdsConnectDialog({ open, onOpenChange }: GoogleAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("signin")
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [permissions, setPermissions] = useState<string[]>(
    PERMISSIONS.filter((p) => p.required).map((p) => p.id)
  )
  const [searchQuery, setSearchQuery] = useState("")

  function reset() {
    setStep("signin")
    setSelectedAccounts([])
    setPermissions(PERMISSIONS.filter((p) => p.required).map((p) => p.id))
    setSearchQuery("")
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleGoogleSignIn() {
    setStep("connecting")
    // Simulate OAuth redirect
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

  const filteredAccounts = MOCK_ACCOUNTS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.includes(searchQuery)
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4285F4]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12z" fill="#4285F4"/>
                <path d="M12 7.5v9l6.75-4.5L12 7.5z" fill="white"/>
              </svg>
            </div>
            <div>
              <DialogTitle>Connect Google Ads</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === "signin" && "Sign in with your Google account"}
                {step === "accounts" && "Select ad accounts to connect"}
                {step === "permissions" && "Review data access permissions"}
                {step === "connecting" && "Connecting to Google Ads..."}
                {step === "success" && "Successfully connected!"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Sign in with Google */}
        {step === "signin" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Connect your Google Ads account to import campaign performance data,
                conversion metrics, and optimize your advertising spend.
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className="w-full gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Accounts */}
        {step === "accounts" && (
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => toggleAccount(account.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    selectedAccounts.includes(account.id)
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{account.spend}</span>
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
            <div className="max-h-64 space-y-2 overflow-y-auto">
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

        {/* Connecting state */}
        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-muted-foreground">Connecting to Google Ads...</p>
          </div>
        )}

        {/* Success state */}
        {step === "success" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold">Google Ads Connected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedAccounts.length} account{selectedAccounts.length > 1 ? "s" : ""} syncing
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sync frequency</span>
                <span className="font-medium">Every 15 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data range</span>
                <span className="font-medium">Last 90 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">First sync</span>
                <span className="font-medium">Starting now...</span>
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
