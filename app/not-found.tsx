import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Head back to the
          dashboard and pick up from there.
        </p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
