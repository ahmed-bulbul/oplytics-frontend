"use client"

import { MoreHorizontal, Pause, Play, Edit3, Tag, Eye, Trash2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ManageSetTargetPopover } from "./manage-set-target-popover"
import { TagPopover } from "@/components/dashboard/tag-popover"

interface ManageActionCellProps {
  isActive?: boolean
  itemId?: string
  itemName?: string
  onView?: () => void
  onAction?: (action: string) => void
}

export function ManageActionCell({
  isActive = true,
  itemId = "",
  itemName = "",
  onView,
  onAction,
}: ManageActionCellProps) {
  return (
    <div className="flex items-center justify-end">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView?.()}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isActive ? (
            <DropdownMenuItem onClick={() => onAction?.("pause")}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onAction?.("enable")}>
              <Play className="h-4 w-4 mr-2" />
              Enable
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onAction?.("edit-budget")}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Budget
          </DropdownMenuItem>
          <TagPopover
            itemId={itemId}
            itemName={itemName}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Tag className="h-4 w-4 mr-2" />
                Manage Tags
              </DropdownMenuItem>
            }
          />
          <ManageSetTargetPopover
            itemId={itemId}
            itemName={itemName}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Target className="h-4 w-4 mr-2" />
                Set Target
              </DropdownMenuItem>
            }
            onSave={(data) => onAction?.(`set-target:${data.metricId}:${data.targetValue}:${data.period}`)}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onAction?.("delete")}
            className="text-rose-600 focus:text-rose-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
