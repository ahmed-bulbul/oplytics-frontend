import { cn } from "@/lib/utils"
import type { ConfidenceLevel } from "./types"

interface AiCardFooterProps {
  confidence: ConfidenceLevel
  timeWindow: string
  impactSummary: string
}

export function AiCardFooter({ confidence, timeWindow, impactSummary }: AiCardFooterProps) {
  const confidenceColor = {
    High: "text-emerald-600 bg-emerald-500/10",
    Medium: "text-amber-600 bg-amber-500/10",
    Low: "text-slate-500 bg-slate-500/10",
  }

  return (
    <div className="space-y-1.5 border-t border-border pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Confidence</span>
          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", confidenceColor[confidence])}>
            {confidence}
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground">{timeWindow}</span>
      </div>
      <p className="text-[9px] italic text-muted-foreground">{impactSummary}</p>
    </div>
  )
}
