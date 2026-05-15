import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  /** Number of placeholder rows. Defaults to 4. */
  rows?: number
  /** Optional title rendered above the skeleton block. */
  title?: string
  className?: string
}

/**
 * Reusable loading skeleton for in-app content blocks. Pairs well with
 * Suspense boundaries and the global `app/loading.tsx` route loader.
 */
export function LoadingState({
  rows = 4,
  title,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      {title ? (
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      ) : null}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
