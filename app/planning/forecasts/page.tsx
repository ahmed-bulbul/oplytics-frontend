"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangeProvider } from "@/context/date-range-context"
import { TagProvider } from "@/context/tag-context"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { MeasurementSourceSelector } from "@/components/dashboard/measurement-source-selector"
import { IntelligencePageHeader } from "@/components/intelligence/intelligence-page-header"
import { CurrentPaceForecast } from "@/components/planning/forecasts/current-pace-forecast"
import { ScenarioPlanner } from "@/components/planning/forecasts/scenario-planner"
import { BreakEvenCalculator } from "@/components/planning/forecasts/break-even-calculator"
import { ForecastAssumptionsSheet } from "@/components/planning/forecasts/forecast-assumptions-sheet"

function ForecastsPageInner() {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <IntelligencePageHeader
        title="Forecasts"
        subtitle="Model revenue, contribution margin, CAC, and payback based on your current growth assumptions."
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setAssumptionsOpen(true)}
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Review assumptions
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <div className="ml-auto">
          <MeasurementSourceSelector />
        </div>
      </div>

      <CurrentPaceForecast />

      <ScenarioPlanner />

      <BreakEvenCalculator />

      <ForecastAssumptionsSheet open={assumptionsOpen} onOpenChange={setAssumptionsOpen} />
    </div>
  )
}

export default function ForecastsPage() {
  return (
    <DateRangeProvider>
      <TagProvider>
        <ForecastsPageInner />
      </TagProvider>
    </DateRangeProvider>
  )
}
