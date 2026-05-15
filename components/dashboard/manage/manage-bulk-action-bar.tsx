"use client"

import { Pause, Flag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ManageBulkEditBudgetPopover } from "./manage-bulk-edit-budget-popover"

interface ManageBulkActionBarProps {
  selectedCount: number
  currentBudgetRange?: { min: number; max: number }
  onAction: (action: string) => void
  onClearSelection: () => void
}

export function ManageBulkActionBar({
  selectedCount,
  currentBudgetRange = { min: 50, max: 500 },
  onAction,
  onClearSelection,
}: ManageBulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={onClearSelection}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          onClick={() => onAction("pause")}
        >
          <Pause className="h-3 w-3 mr-1.5" />
          Pause
        </Button>
        <ManageBulkEditBudgetPopover
          selectedCount={selectedCount}
          currentBudgetRange={currentBudgetRange}
          onSave={(mode, value) => onAction(`edit-budget:${mode}:${value}`)}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          onClick={() => onAction("mark-review")}
        >
          <Flag className="h-3 w-3 mr-1.5" />
          Mark for Review
        </Button>
      </div>
    </div>
  )
}
