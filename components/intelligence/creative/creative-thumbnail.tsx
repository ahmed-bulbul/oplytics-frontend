import Image from "next/image"
import { Play, Layers } from "lucide-react"
import type { CreativeFormat } from "./creative-data"
import { cn } from "@/lib/utils"

const VIDEO_FORMATS: CreativeFormat[] = [
  "Founder video",
  "UGC video",
  "Testimonial",
  "Product demo",
]

interface CreativeThumbnailProps {
  src: string
  alt: string
  format: CreativeFormat
  size?: "sm" | "lg"
  className?: string
}

/**
 * Square (1:1) creative thumbnail with format-aware overlays:
 * - Video formats get a centered play badge
 * - Carousels get a stacked-layers icon in the corner
 *
 * Used in the Creative Performance table (sm) and at the top of the
 * Creative detail drawer (lg).
 */
export function CreativeThumbnail({
  src,
  alt,
  format,
  size = "sm",
  className,
}: CreativeThumbnailProps) {
  const isVideo = VIDEO_FORMATS.includes(format)
  const isCarousel = format === "Carousel"

  const dimensions =
    size === "sm" ? "h-10 w-10" : "h-full w-full aspect-square max-w-[280px]"
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-6 w-6"
  const playBadgeSize = size === "sm" ? "h-5 w-5" : "h-12 w-12"

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border",
        dimensions,
        className,
      )}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes={size === "sm" ? "40px" : "280px"}
        className="object-cover"
      />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-black/70 text-white shadow-sm",
              playBadgeSize,
            )}
            aria-hidden="true"
          >
            <Play className={cn("fill-current", iconSize)} />
          </div>
        </div>
      )}
      {isCarousel && (
        <div
          className="absolute right-1 top-1 flex items-center justify-center rounded bg-black/70 p-0.5 text-white"
          aria-hidden="true"
        >
          <Layers className={iconSize} />
        </div>
      )}
    </div>
  )
}
