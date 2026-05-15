"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CuratorAI() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <span className="text-sm font-medium text-foreground">Curator AI</span>
      </div>
      
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Meta Ads ROAS has dipped 12% below benchmark. Optimization recommended
        for &quot;Winter Launch&quot; campaign.
      </p>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Oct 17, 2023</span>
          <span className="font-medium text-foreground">$18,402.12</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">+14% vs Target</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Projected Gain</div>
            <div className="text-sm font-medium text-emerald-500">+$4,200 /week</div>
          </div>
        </div>

        <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600" size="sm">
          Apply Optimization
        </Button>
      </div>
    </div>
  )
}
