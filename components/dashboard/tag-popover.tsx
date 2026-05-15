"use client"

import * as React from "react"
import { useState } from "react"
import { Tag, Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTags, TAG_COLORS } from "@/context/tag-context"

interface TagPopoverProps {
  itemId: string
  itemName: string
  trigger?: React.ReactNode
}

export function TagPopover({ itemId, itemName, trigger }: TagPopoverProps) {
  const { tags, addTag, assignTag, unassignTag, getTagsForItem } = useTags()
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[6].value)

  const assignedTags = getTagsForItem(itemId)
  const assignedTagIds = assignedTags.map((t) => t.id)

  const handleToggleTag = (tagId: string) => {
    if (assignedTagIds.includes(tagId)) {
      unassignTag(itemId, tagId)
    } else {
      assignTag(itemId, tagId)
    }
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) return
    const newTag = addTag(newTagName.trim(), selectedColor)
    assignTag(itemId, newTag.id)
    setNewTagName("")
    setSelectedColor(TAG_COLORS[6].value)
    setIsCreating(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span className="text-xs">Tag</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0" 
        align="end"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="border-b border-border p-3">
          <h4 className="text-sm font-medium text-foreground">Manage Tags</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {itemName}
          </p>
        </div>

        {/* Assigned tags */}
        {assignedTags.length > 0 && (
          <div className="border-b border-border p-3">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Assigned
            </Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {assignedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => unassignTag(itemId, tag.id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available tags */}
        <div className="p-3">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Available Tags
          </Label>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {tags.map((tag) => {
              const isAssigned = assignedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isAssigned && "bg-muted/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-xs">{tag.name}</span>
                  </span>
                  {isAssigned && (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Create new tag */}
        <div className="border-t border-border p-3">
          {isCreating ? (
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tag Name
                </Label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name..."
                  className="mt-1 h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Color
                </Label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        "h-5 w-5 rounded-full transition-transform hover:scale-110",
                        selectedColor === color.value && "ring-2 ring-offset-2 ring-offset-background"
                      )}
                      style={{ 
                        backgroundColor: color.value,
                        ringColor: color.value,
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => {
                    setIsCreating(false)
                    setNewTagName("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 gap-1.5 text-xs"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Tag
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
