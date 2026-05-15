"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/app/error-state"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Route error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-8">
      <ErrorState
        title="This view didn't load"
        description="We hit a snag rendering this page. Refreshing usually fixes it. If it keeps happening, this one's on us."
        onRetry={reset}
      />
    </div>
  )
}
