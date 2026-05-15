"use client"

import { cn } from "@/lib/utils"

export interface ChannelMixEntry {
  channel: string
  share: number // 0-100
}

/**
 * Brand-styled monogram badge for an acquisition channel. We render a small
 * circular badge with an abbreviation rather than shipping logo image assets,
 * which keeps the bundle small and avoids brand-asset licensing issues.
 */
const channelStyle: Record<
  string,
  { bg: string; text: string; abbr: string }
> = {
  "Meta Ads": { bg: "bg-[#1877F2]", text: "text-white", abbr: "M" },
  Meta: { bg: "bg-[#1877F2]", text: "text-white", abbr: "M" },
  "Google Search": { bg: "bg-[#4285F4]", text: "text-white", abbr: "G" },
  "Google PMax": { bg: "bg-[#0F9D58]", text: "text-white", abbr: "Gp" },
  Google: { bg: "bg-[#4285F4]", text: "text-white", abbr: "G" },
  "TikTok Ads": { bg: "bg-[#010101]", text: "text-white", abbr: "T" },
  TikTok: { bg: "bg-[#010101]", text: "text-white", abbr: "T" },
  "Klaviyo Email": { bg: "bg-[#1F2937]", text: "text-white", abbr: "K" },
  Klaviyo: { bg: "bg-[#1F2937]", text: "text-white", abbr: "K" },
  Email: { bg: "bg-amber-500", text: "text-white", abbr: "E" },
  Direct: { bg: "bg-slate-500", text: "text-white", abbr: "D" },
  Organic: { bg: "bg-emerald-600", text: "text-white", abbr: "O" },
}

function styleFor(channel: string) {
  return (
    channelStyle[channel] ?? {
      bg: "bg-slate-400",
      text: "text-white",
      abbr: channel.charAt(0).toUpperCase(),
    }
  )
}

export function ChannelLogo({
  channel,
  size = 18,
  className,
}: {
  channel: string
  size?: number
  className?: string
}) {
  const cfg = styleFor(channel)
  return (
    <span
      title={channel}
      aria-label={channel}
      className={cn(
        "inline-flex items-center justify-center rounded-full ring-2 ring-card font-semibold leading-none",
        cfg.bg,
        cfg.text,
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.5)),
      }}
    >
      {cfg.abbr}
    </span>
  )
}

interface ChannelLogoGroupProps {
  mix: ChannelMixEntry[]
  size?: number
  /** Maximum logos to display before collapsing the rest into a +N badge */
  max?: number
  /** When true, also renders the dominant channel's share next to the logos */
  showDominantShare?: boolean
}

export function ChannelLogoGroup({
  mix,
  size = 18,
  max = 4,
  showDominantShare = true,
}: ChannelLogoGroupProps) {
  if (!mix || mix.length === 0) {
    return <span className="text-[11px] text-muted-foreground">—</span>
  }

  const sorted = [...mix].sort((a, b) => b.share - a.share)
  const visible = sorted.slice(0, max)
  const overflow = sorted.length - visible.length
  const tooltip = sorted
    .map((m) => `${m.channel}: ${Math.round(m.share)}%`)
    .join("  ·  ")

  return (
    <div className="flex items-center gap-2" title={tooltip}>
      <div className="flex items-center -space-x-1.5">
        {visible.map((m) => (
          <ChannelLogo key={m.channel} channel={m.channel} size={size} />
        ))}
        {overflow > 0 && (
          <span
            className="inline-flex items-center justify-center rounded-full bg-muted ring-2 ring-card font-semibold text-muted-foreground"
            style={{
              width: size,
              height: size,
              fontSize: Math.max(8, Math.round(size * 0.45)),
            }}
            aria-label={`${overflow} more channels`}
          >
            +{overflow}
          </span>
        )}
      </div>
      {showDominantShare && (
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {sorted[0].channel.replace(/ Ads| Email| Search/, "")}{" "}
          <span className="text-muted-foreground/70">
            {Math.round(sorted[0].share)}%
          </span>
        </span>
      )}
    </div>
  )
}
