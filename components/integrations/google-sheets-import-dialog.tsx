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
import { Label } from "@/components/ui/label"
import {
  Zap,
  Calendar,
  BarChart3,
  Receipt,
  Wallet,
  LineChart,
  Boxes,
  StickyNote,
} from "lucide-react"

interface GoogleSheetsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SyncFrequency = "real-time" | "hourly" | "daily"

interface ImportOption {
  id: string
  label: string
  helper: string
  icon: React.ReactNode
  checked: boolean
}

export function GoogleSheetsImportDialog({
  open,
  onOpenChange,
}: GoogleSheetsImportDialogProps) {
  const [frequency, setFrequency] = useState<SyncFrequency>("daily")
  const [sheetUrl, setSheetUrl] = useState("")
  const [importOptions, setImportOptions] = useState<ImportOption[]>([
    {
      id: "cogs",
      label: "COGS table",
      helper: "Per-SKU cost of goods sold for true margin",
      icon: <Receipt className="h-5 w-5" />,
      checked: true,
    },
    {
      id: "fixed-costs",
      label: "Fixed costs",
      helper: "Rent, payroll, software for contribution margin",
      icon: <Wallet className="h-5 w-5" />,
      checked: true,
    },
    {
      id: "custom-kpis",
      label: "Custom KPIs",
      helper: "Goals, targets, or any metric we don't pull natively",
      icon: <LineChart className="h-5 w-5" />,
      checked: false,
    },
    {
      id: "inventory-snapshot",
      label: "Inventory snapshot",
      helper: "Manual stock counts that override platform feeds",
      icon: <Boxes className="h-5 w-5" />,
      checked: false,
    },
    {
      id: "marketing-notes",
      label: "Marketing notes / promos",
      helper: "Annotations the AI Assistant uses for context",
      icon: <StickyNote className="h-5 w-5" />,
      checked: false,
    },
  ])

  const toggleImportOption = (id: string) => {
    setImportOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, checked: !opt.checked } : opt,
      ),
    )
  }

  const frequencyOptions = [
    { id: "real-time" as SyncFrequency, label: "Real-time", icon: <Zap className="h-5 w-5" /> },
    { id: "hourly" as SyncFrequency, label: "Hourly", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "daily" as SyncFrequency, label: "Daily", icon: <Calendar className="h-5 w-5" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-500"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-lg">Import from Google Sheets</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Pull cost, KPI, and custom data from your spreadsheets into Optilytics.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Sync Frequency */}
          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Refresh Frequency
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFrequency(option.id)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                    frequency === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span
                    className={
                      frequency === option.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    {option.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      frequency === option.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Data to Import
            </Label>
            <div className="space-y-2">
              {importOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{option.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {option.helper}
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={option.checked}
                    onCheckedChange={() => toggleImportOption(option.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Source
            </Label>
            <div className="space-y-2">
              <Label htmlFor="import-sheet-url" className="text-sm font-normal">
                Google Sheet URL
              </Label>
              <Input
                id="import-sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                The first row of each tab should be column headers.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              Start import
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
