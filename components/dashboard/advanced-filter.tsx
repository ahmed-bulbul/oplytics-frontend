"use client"

import * as React from "react"
import { SlidersHorizontal, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  MultiSelectCombobox,
  type MultiSelectOption,
} from "@/components/dashboard/multi-select-combobox"

// Default tags (mirrored from tag context for display)
const availableTags = [
  { id: "high-performer", name: "High Performer", color: "#10b981" },
  { id: "needs-attention", name: "Needs Attention", color: "#f59e0b" },
  { id: "testing", name: "Testing", color: "#3b82f6" },
  { id: "seasonal", name: "Seasonal", color: "#8b5cf6" },
  { id: "evergreen", name: "Evergreen", color: "#22c55e" },
]

/**
 * Channel list (formerly the standalone ChannelFilter). The two
 * convenience presets at the top still carry a one-line description
 * because their behavior isn't obvious from the label alone; the
 * individual platforms drop the description to keep each row a single
 * tight line — operators recognize "Meta Ads" without help text, and
 * the panel needs the vertical room.
 */
const CHANNELS = [
  { id: "all", label: "All Channels", description: "Show data across every connected source", dot: "bg-foreground", isPreset: true },
  { id: "all-paid", label: "All Paid Channels", description: "Meta + Google + TikTok + Reddit + LinkedIn + Amazon Ads", dot: "bg-emerald-500", isPreset: true },
  // E-commerce sources
  { id: "shopify", label: "Shopify", dot: "bg-[#96BF48]", isPreset: false },
  { id: "amazon", label: "Amazon", dot: "bg-[#FF9900]", isPreset: false },
  // Paid platforms
  { id: "meta-ads", label: "Meta Ads", dot: "bg-[#0668E1]", isPreset: false },
  { id: "google-ads", label: "Google Ads", dot: "bg-[#4285F4]", isPreset: false },
  { id: "tiktok-ads", label: "TikTok Ads", dot: "bg-foreground", isPreset: false },
  { id: "amazon-ads", label: "Amazon Ads", dot: "bg-[#232F3E]", isPreset: false },
  { id: "reddit-ads", label: "Reddit Ads", dot: "bg-[#FF4500]", isPreset: false },
  { id: "linkedin-ads", label: "LinkedIn Ads", dot: "bg-[#0A66C2]", isPreset: false },
] as const

type ChannelId = (typeof CHANNELS)[number]["id"]

// All paid platform ids — used to expand "All Paid Channels". Amazon Ads
// is included alongside Meta/Google/TikTok/Reddit/LinkedIn since it's a
// paid acquisition channel; Amazon (the e-commerce storefront) is not.
const PAID_CHANNEL_IDS: ChannelId[] = [
  "meta-ads",
  "google-ads",
  "tiktok-ads",
  "amazon-ads",
  "reddit-ads",
  "linkedin-ads",
]

/**
 * Curated demo data for the three combobox-driven fields. In
 * production these come from the loaded campaign/UTM dataset for the
 * active date range; for now the lists are large enough that the
 * search affordance feels real.
 */
const CAMPAIGN_OPTIONS: MultiSelectOption[] = [
  { id: "summer-2024", label: "Summer_Sale_2024_Global" },
  { id: "summer-2024-eu", label: "Summer_Sale_2024_EU" },
  { id: "influencer-t1", label: "Influencer_T1_Launch" },
  { id: "influencer-t2", label: "Influencer_T2_Reactivation" },
  { id: "retargeting-cart", label: "Retargeting_Abandoned_Cart" },
  { id: "retargeting-pdp", label: "Retargeting_PDP_Visitors" },
  { id: "back-to-school", label: "Back_to_School_2024" },
  { id: "evergreen-prospecting", label: "Evergreen_Prospecting_Broad" },
  { id: "evergreen-lookalike", label: "Evergreen_Prospecting_LAL_3pct" },
  { id: "vip-loyalty", label: "VIP_Loyalty_Q3" },
  { id: "newsletter-launch", label: "Newsletter_Launch_Series" },
  { id: "podcast-test", label: "Podcast_Sponsorship_Test" },
]

const SOURCE_OPTIONS: MultiSelectOption[] = [
  { id: "google", label: "google", description: "Paid + organic Google" },
  { id: "facebook", label: "facebook", description: "Meta-attributed traffic" },
  { id: "instagram", label: "instagram" },
  { id: "tiktok", label: "tiktok" },
  { id: "reddit", label: "reddit" },
  { id: "linkedin", label: "linkedin" },
  { id: "newsletter", label: "newsletter", description: "Email campaigns" },
  { id: "klaviyo", label: "klaviyo" },
  { id: "direct", label: "direct", description: "No referrer" },
  { id: "referral", label: "referral" },
  { id: "podcast", label: "podcast" },
  { id: "youtube", label: "youtube" },
]

const MEDIUM_OPTIONS: MultiSelectOption[] = [
  { id: "cpc", label: "cpc", description: "Paid search / social" },
  { id: "paid-social", label: "paid-social" },
  { id: "email", label: "email" },
  { id: "organic", label: "organic" },
  { id: "social", label: "social" },
  { id: "banner", label: "banner" },
  { id: "display", label: "display" },
  { id: "affiliate", label: "affiliate" },
  { id: "referral", label: "referral" },
  { id: "sms", label: "sms" },
  { id: "push", label: "push" },
]

export function AdvancedFilter() {
  const [open, setOpen] = React.useState(false)
  const [selectedChannels, setSelectedChannels] = React.useState<ChannelId[]>(["all"])
  const [selectedSources, setSelectedSources] = React.useState<string[]>([])
  const [selectedMediums, setSelectedMediums] = React.useState<string[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  /**
   * Channel selection rules.
   * - "All Channels" is mutually exclusive with everything else.
   * - "All Paid Channels" expands to the five paid platform ids and
   *   is mutually exclusive with "All Channels". If every paid id is
   *   already selected, picking "All Paid Channels" again clears them.
   * - Picking any individual channel clears the special presets.
   * - Deselecting the last individual channel falls back to "all".
   */
  const handleChannelToggle = (channelId: ChannelId) => {
    if (channelId === "all") {
      setSelectedChannels(["all"])
      return
    }
    if (channelId === "all-paid") {
      const allPaidActive = PAID_CHANNEL_IDS.every((id) => selectedChannels.includes(id))
      setSelectedChannels(allPaidActive ? ["all"] : [...PAID_CHANNEL_IDS])
      return
    }
    const without = selectedChannels.filter((c) => c !== "all" && c !== "all-paid")
    if (without.includes(channelId)) {
      const next = without.filter((c) => c !== channelId)
      setSelectedChannels(next.length === 0 ? ["all"] : next)
    } else {
      setSelectedChannels([...without, channelId])
    }
  }

  // "All Paid Channels" should appear checked when every paid id is selected,
  // even if the operator picked them individually.
  const isAllPaidActive = PAID_CHANNEL_IDS.every((id) => selectedChannels.includes(id))

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleReset = () => {
    setSelectedChannels(["all"])
    setSelectedSources([])
    setSelectedMediums([])
    setSelectedCampaigns([])
    setSelectedTags([])
  }

  /**
   * Trigger-button badge count. We surface this so operators don't lose
   * the affordance the standalone Channel button used to provide — at a
   * glance they can still see whether any channel filtering is active.
   * "All Channels" doesn't count; "All Paid Channels" counts as 1.
   */
  const channelBadgeCount = selectedChannels.includes("all")
    ? 0
    : isAllPaidActive
    ? 1
    : selectedChannels.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", channelBadgeCount > 0 && "border-emerald-500 text-emerald-600")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
          {channelBadgeCount > 0 && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
              aria-label={`${channelBadgeCount} channel filter${channelBadgeCount > 1 ? "s" : ""} active`}
            >
              {channelBadgeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      {/*
        Layout: popover is a flex column, capped at viewport height
        minus the top bar so it can never grow past the bottom edge.
        The body scrolls internally; the footer stays pinned. This way
        we can keep adding sections without ever requiring an outer
        page scroll, and on shorter laptops the operator still sees
        Apply / Reset.
      */}
      <PopoverContent
        className="flex w-80 max-h-[calc(100vh-5rem)] flex-col p-0"
        align="end"
      >
        <div className="overflow-y-auto p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Filter</h3>

          {/*
            Channels — replaces both the old "Channel Quick Filter" and
            the standalone ChannelFilter button. Two convenience
            presets sit at the top with descriptions; the connected
            data sources below are single-line rows so the section
            stays compact. Date Range was intentionally removed
            because the toolbar already has a primary date range
            picker — we don't want operators picking dates in two
            places.
          */}
          <div className="mb-4">
            <Label className="mb-2 block text-xs text-muted-foreground">
              Channels
            </Label>
            <div className="space-y-0.5">
              {CHANNELS.map((channel) => {
                const isChecked =
                  channel.id === "all-paid"
                    ? isAllPaidActive && !selectedChannels.includes("all")
                    : selectedChannels.includes(channel.id)
                return (
                  <label
                    key={channel.id}
                    htmlFor={`ch-${channel.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2 transition-colors hover:bg-muted",
                      channel.isPreset ? "py-1.5" : "py-1",
                      isChecked && "bg-muted/60"
                    )}
                  >
                    <Checkbox
                      id={`ch-${channel.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                      className={cn(isChecked && "border-emerald-500 bg-emerald-500 text-white")}
                    />
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", channel.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-none text-foreground">
                        {channel.label}
                      </p>
                      {"description" in channel && channel.description && (
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {channel.description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/*
            Source — was a free-text input. Now a curated multi-select
            combobox so operators don't have to remember exact UTM
            spellings; the dropdown's search input still handles fuzzy
            matching for power users.
          */}
          <div className="mb-4">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Source
            </Label>
            <MultiSelectCombobox
              options={SOURCE_OPTIONS}
              value={selectedSources}
              onChange={setSelectedSources}
              placeholder="Any source"
              searchPlaceholder="Search sources…"
              emptyText="No sources match."
            />
          </div>

          {/* Medium — same pattern as Source. */}
          <div className="mb-4">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Medium
            </Label>
            <MultiSelectCombobox
              options={MEDIUM_OPTIONS}
              value={selectedMediums}
              onChange={setSelectedMediums}
              placeholder="Any medium"
              searchPlaceholder="Search mediums…"
              emptyText="No mediums match."
            />
          </div>

          {/*
            Campaigns — clicking the field opens a searchable dropdown
            of every loaded campaign, with multi-select via checkmarks.
            The trigger summarizes the selection ("Summer_Sale_2024_Global
            +2") so the panel stays compact even when several are
            picked, and the inline X clears the whole selection without
            re-opening the dropdown.
          */}
          <div className="mb-4">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Campaigns
            </Label>
            <MultiSelectCombobox
              options={CAMPAIGN_OPTIONS}
              value={selectedCampaigns}
              onChange={setSelectedCampaigns}
              placeholder="Any campaign"
              searchPlaceholder="Search campaigns…"
              emptyText="No campaigns match."
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Custom Tags
            </Label>
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="cursor-pointer text-xs text-foreground"
                  >
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                {selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions — stays pinned outside the scroll area so Reset
            and Apply are always visible no matter how tall the body grows. */}
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            Reset Filters
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
