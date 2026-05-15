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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AmazonConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "account" | "permissions" | "connecting" | "success"

/**
 * Connect dialog for Amazon (storefront/marketplace, Selling Partner
 * API). Mirrors the Meta Ads dialog shape so the integrations page
 * feels consistent — account → permissions → connecting → success —
 * but uses Amazon-specific concepts (Seller ID, marketplace region,
 * SP-API permission roles).
 */
export function AmazonConnectDialog({
  open,
  onOpenChange,
}: AmazonConnectDialogProps) {
  const [step, setStep] = useState<Step>("account")
  const [sellerId, setSellerId] = useState("")
  const [marketplace, setMarketplace] = useState("US")
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    orders: true,
    catalog: true,
    inventory: true,
    reports: true,
    settlements: true,
    fees: false,
  })

  const marketplaces = [
    { id: "US", label: "United States (amazon.com)" },
    { id: "CA", label: "Canada (amazon.ca)" },
    { id: "MX", label: "Mexico (amazon.com.mx)" },
    { id: "UK", label: "United Kingdom (amazon.co.uk)" },
    { id: "DE", label: "Germany (amazon.de)" },
    { id: "FR", label: "France (amazon.fr)" },
    { id: "IT", label: "Italy (amazon.it)" },
    { id: "ES", label: "Spain (amazon.es)" },
    { id: "JP", label: "Japan (amazon.co.jp)" },
    { id: "AU", label: "Australia (amazon.com.au)" },
  ]

  const permissionsList = [
    {
      id: "orders",
      label: "Orders",
      description: "Read order, item, and buyer-info data for revenue and refunds",
      required: true,
    },
    {
      id: "catalog",
      label: "Product Catalog",
      description: "ASINs, SKUs, titles, and parent/variant relationships",
      required: true,
    },
    {
      id: "inventory",
      label: "Inventory",
      description: "FBA and merchant-fulfilled stock levels for stockout alerts",
      required: true,
    },
    {
      id: "reports",
      label: "Reports",
      description: "Settlement, fees, and tax reports for contribution-margin math",
      required: true,
    },
    {
      id: "settlements",
      label: "Settlements",
      description: "Payouts and disbursements reconciled to net revenue",
      required: true,
    },
    {
      id: "fees",
      label: "FBA Fees Estimator",
      description: "Per-SKU fee preview for unlisted products (optional)",
      required: false,
    },
  ]

  function handleContinue() {
    if (step === "account" && sellerId.trim()) {
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
      setSellerId("")
      setMarketplace("US")
      setPermissions({
        orders: true,
        catalog: true,
        inventory: true,
        reports: true,
        settlements: true,
        fees: false,
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === "account" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Amazon Seller Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Seller ID
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Enter your Amazon Seller Central account ID to begin setup
                </p>
                <Input
                  placeholder="A1B2C3D4E5F6G7"
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  className="font-mono"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Find this in Seller Central under Settings → Account Info
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Marketplace Region
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  We&apos;ll authorize against this marketplace&apos;s SP-API endpoint
                </p>
                <Select value={marketplace} onValueChange={setMarketplace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaces.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  You&apos;ll be redirected to Amazon Seller Central to authorize this connection
                  via Login with Amazon (LWA).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!sellerId.trim()}
                className="bg-[#232F3E] text-[#FF9900] hover:bg-[#232F3E]/90"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "permissions" && (
          <>
            <DialogHeader>
              <DialogTitle>Authorize SP-API Roles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Amazon will ask you to grant the following Selling Partner API roles:
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
                  You&apos;ll need to be a verified seller on this marketplace and approve all
                  required roles to complete setup.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStep("account")}>
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#232F3E] text-[#FF9900] hover:bg-[#232F3E]/90"
              >
                Authorize with Amazon
              </Button>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            <div className="text-center">
              <p className="font-semibold">Connecting your seller account...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re redirecting you to Amazon Seller Central to authorize access
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
                  <p className="font-semibold">Your Amazon seller account is connected</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Seller ID: {sellerId} · Marketplace: {marketplace}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">Next steps:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Order data will sync every 4 hours</li>
                  <li>FBA inventory levels refresh hourly</li>
                  <li>Historical orders from the last 60 days are being imported</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  Tip: connect Amazon Ads next to see ACoS and TACoS alongside marketplace revenue.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                className="bg-[#232F3E] text-[#FF9900] hover:bg-[#232F3E]/90"
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
