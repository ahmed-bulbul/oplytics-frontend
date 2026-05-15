import { LoadingState } from "@/components/app/loading-state"

export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <LoadingState rows={6} title="Loading" />
    </div>
  )
}
