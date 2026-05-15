"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type MultiSelectOption = {
  /** Stable id used in the value array. */
  id: string
  /** What the operator sees both in the dropdown and the trigger summary. */
  label: string
  /** Optional secondary copy shown beneath the label inside the dropdown. */
  description?: string
}

export interface MultiSelectComboboxProps {
  /** Curated list of options shown inside the dropdown. */
  options: MultiSelectOption[]
  /** Currently selected option ids. */
  value: string[]
  /** Called whenever the selected ids change. */
  onChange: (next: string[]) => void
  /** Trigger placeholder shown when nothing is selected. */
  placeholder?: string
  /** Search input placeholder shown inside the dropdown. */
  searchPlaceholder?: string
  /** Empty-state copy shown when the search has no matches. */
  emptyText?: string
  /** Width of the popover panel; defaults to matching the trigger. */
  panelClassName?: string
  /** Forward classes onto the trigger button. */
  triggerClassName?: string
  /** Optional disabled state. */
  disabled?: boolean
}

/**
 * MultiSelectCombobox — a clickable field that opens a searchable list
 * for picking multiple options. Same shape used for Campaigns, Source,
 * and Medium inside the Filter popover, but also generic enough to drop
 * elsewhere in the app.
 *
 * Behavior:
 *  - When nothing is selected, the trigger shows a muted placeholder.
 *  - When one is selected, the trigger shows that label truncated.
 *  - When more than one is selected, the trigger shows the first label
 *    plus a compact "+N more" badge so it never overflows on the
 *    narrow popover width.
 *  - A small X button appears at the right edge of the trigger when
 *    anything is selected, clearing the value without opening the
 *    dropdown — operators can scrub a filter without re-finding it.
 *
 * Implementation notes:
 *  - Uses shadcn's Command primitive, which already handles fuzzy
 *    search and keyboard navigation, so we don't reimplement that.
 *  - Renders inside another Popover (the Filter panel) without issue
 *    because Radix popovers correctly portal and stack.
 */
export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches.",
  panelClassName,
  triggerClassName,
  disabled,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value],
  )

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const clear = (e: React.MouseEvent) => {
    // Stop the click from bubbling up to the PopoverTrigger so that
    // hitting X scrubs the value without also popping open the panel.
    e.preventDefault()
    e.stopPropagation()
    onChange([])
  }

  const summary =
    selected.length === 0
      ? null
      : selected.length === 1
      ? selected[0].label
      : `${selected[0].label}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            // Match the visual weight of the sibling Input fields in
            // the Filter panel: same height, same rounded corners,
            // same border. Justify-start so the summary reads as a
            // value, not a button label.
            "h-8 w-full justify-start gap-2 px-2.5 font-normal",
            !summary && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {summary ? (
              <>
                <span className="truncate text-xs text-foreground">
                  {summary}
                </span>
                {selected.length > 1 && (
                  <span className="shrink-0 rounded-sm bg-emerald-500/15 px-1 py-0.5 text-[10px] font-semibold leading-none text-emerald-700 dark:text-emerald-400">
                    +{selected.length - 1}
                  </span>
                )}
              </>
            ) : (
              <span className="truncate text-xs">{placeholder}</span>
            )}
          </span>
          {selected.length > 0 ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={clear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange([])
                }
              }}
              className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[260px] p-0", panelClassName)}
        align="start"
        // Slightly higher than the parent Filter popover so it always
        // paints on top of it, matching the way Select dropdowns
        // behave inside Dialog/Sheet.
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="text-xs" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.id)
                return (
                  <CommandItem
                    key={option.id}
                    // Use label as the value so Command's built-in
                    // fuzzy filter matches against the human-readable
                    // text, not the id.
                    value={option.label}
                    onSelect={() => toggle(option.id)}
                    className="flex items-start gap-2 py-1.5"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-input bg-transparent",
                      )}
                      aria-hidden
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs text-foreground">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
