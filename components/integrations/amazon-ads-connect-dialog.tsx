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

interface AmazonAdsConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "account" | "permissions" | "connecting" | "success"

/**
 * Connect dialog for Amazon Ads (Advertising API). Distinct from the
 * storefront SP-API: operators authorize with their advertiser Profile
 * ID and choose which ad-product surfaces to ingest (Sponsored
 * Products, Sponsored Brands, Sponsored Display, optional DSP).
 */
export function AmazonAdsConnectDialog({
  open,
  onOpenChange,
}: AmazonAdsConnectDialogProps) {
  const [step, setStep] = useState<Step>("account")
  const [profileId, setProfileId] = useState("")
  const [region, setRegion] = useState("NA")
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    sponsoredProducts: true,
    sponsoredBrands: true,
    sponsoredDisplay: true,
    reports: true,
    dsp: false,
    amc: false,
  })

  const regions = [
    { id: "NA", label: "North America (US, CA, MX, BR)" },
    { id: "EU", label: "Europe (UK, DE, FR, IT, ES, NL)" },
    { id: "FE", label: "Far East (JP, AU)" },
  ]

  const permissionsList = [
    {
      id: "sponsoredProducts",
      label: "Sponsored Products",
      description: "Keyword and ASIN-targeted ads in search and product detail pages",
      required: true,
    },
    {
      id: "sponsoredBrands",
      label: "Sponsored Brands",
      description: "Headline and video search ads with brand placement",
      required: true,
    },
    {
      id: "sponsoredDisplay",
      label: "Sponsored Display",
      description: "Audience and product targeting on and off Amazon",
      required: true,
    },
    {
      id: "reports",
      label: "Reporting API",
      description: "Daily spend, impressions, clicks, ACoS, and ROAS reports",
      required: true,
    },
    {
      id: "dsp",
      label: "Amazon DSP",
      description: "Programmatic display and video buying (optional, advertiser-only)",
      required: false,
    },
    {
      id: "amc",
      label: "Amazon Marketing Cloud",
      description: "Cross-product attribution and audience signals (optional)",
      required: false,
    },
  ]

  function handleContinue() {
    if (step === "account" && profileId.trim()) {
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
      setProfileId("")
      setRegion("NA")
      setPermissions({
        sponsoredProducts: true,
        sponsoredBrands: true,
        sponsoredDisplay: true,
        reports: true,
        dsp: false,
        amc: false,
      })
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === "account" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Amazon Ads Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Profile ID
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Enter your Amazon Ads advertiser Profile ID
                </p>
                <Input
                  placeholder="1234567890123456"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="font-mono"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Find this in Amazon Ads console under Account → Profile information
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Region
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Profile must match the regional Advertising API endpoint
                </p>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  You&apos;ll be redirected to Amazon Ads to authorize this connection via Login
                  with Amazon (LWA).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!profileId.trim()}
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
              <DialogTitle>Authorize Ad Products</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Amazon will ask you to grant access to the following ad products:
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
                  Your Profile must have advertising access to the products selected above. DSP and
                  AMC require separate advertiser eligibility.
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
              <p className="font-semibold">Connecting your ads account...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re redirecting you to Amazon Ads to authorize access
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
                  <p className="font-semibold">Your Amazon Ads account is connected</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Profile ID: {profileId} · Region: {region}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium">Next steps:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Spend, impressions, and conversions sync every 6 hours</li>
                  <li>ACoS and TACoS will appear on the Channel Performance dashboard</li>
                  <li>Last 60 days of campaign history is being imported</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  Tip: pair this with the Amazon storefront connection to see TACoS computed
                  against total marketplace revenue.
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
