import { cn } from "@/lib/utils"
import type { EvidenceItem } from "./types"

interface AiEvidenceListProps {
  evidence: EvidenceItem[]
}

export function AiEvidenceList({ evidence }: AiEvidenceListProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md bg-muted/50 px-2.5 py-2">
      {evidence.map((item, index) => (
        <div key={index} className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            {item.label}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-[11px] font-semibold",
              item.trend === "positive" && "text-emerald-600",
              item.trend === "negative" && "text-red-600",
              item.trend === "neutral" && "text-foreground",
              !item.trend && "text-foreground"
            )}>
              {item.value}
            </span>
            <span className="text-[9px] text-muted-foreground">
              {item.comparison}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
