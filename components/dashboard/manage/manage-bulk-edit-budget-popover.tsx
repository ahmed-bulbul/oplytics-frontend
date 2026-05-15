"use client"

import { useState } from "react"
import { Edit3, X, DollarSign, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type EditMode = "set" | "increase" | "decrease"

interface ManageBulkEditBudgetPopoverProps {
  selectedCount: number
  currentBudgetRange?: { min: number; max: number }
  onSave: (mode: EditMode, value: number) => void
}

export function ManageBulkEditBudgetPopover({
  selectedCount,
  currentBudgetRange = { min: 50, max: 500 },
  onSave,
}: ManageBulkEditBudgetPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<EditMode>("set")
  const [value, setValue] = useState("")
  const [isPercent, setIsPercent] = useState(false)

  const handleSave = () => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) return
    onSave(mode, isPercent ? numValue : numValue)
    setOpen(false)
    setValue("")
    setMode("set")
    setIsPercent(false)
  }

  const handleCancel = () => {
    setOpen(false)
    setValue("")
    setMode("set")
    setIsPercent(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
        >
          <Edit3 className="h-3 w-3 mr-1.5" />
          Edit Budget
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="end"
        sideOffset={8}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Edit Budget</h4>
            <p className="text-xs text-muted-foreground">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Budget Range */}
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Current daily budgets</p>
            <p className="text-sm font-medium text-foreground">
              ${currentBudgetRange.min.toLocaleString()} - ${currentBudgetRange.max.toLocaleString()}/day
            </p>
          </div>

          {/* Edit Mode */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Action</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as EditMode)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set budget to</SelectItem>
                <SelectItem value="increase">Increase budget by</SelectItem>
                <SelectItem value="decrease">Decrease budget by</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {mode === "set" ? "New daily budget" : "Amount"}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isPercent ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={isPercent ? "10" : "100.00"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              {mode !== "set" && (
                <div className="flex rounded-md border border-input overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsPercent(false)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium transition-colors",
                      !isPercent ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                    )}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPercent(true)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium transition-colors",
                      isPercent ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                    )}
                  >
                    %
                  </button>
                </div>
              )}
            </div>
            {mode !== "set" && value && (
              <p className="text-[11px] text-muted-foreground">
                {mode === "increase" ? "+" : "-"}
                {isPercent ? `${value}%` : `$${parseFloat(value || "0").toFixed(2)}`} per item
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleSave}
            disabled={!value || parseFloat(value) < 0}
          >
            Apply to {selectedCount} item{selectedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
