"use client"

import { useMemo, useState } from "react"
import { Calculator } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BreakEvenInputs {
  aov: number
  grossMargin: number // percent
  refundRate: number // percent
}

const defaults: BreakEvenInputs = {
  aov: 91.6,
  grossMargin: 65.4,
  refundRate: 3.4,
}

function fmt2(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
}

function compute(s: BreakEvenInputs) {
  const breakEvenCpa = s.aov * (s.grossMargin / 100) * (1 - s.refundRate / 100)
  const breakEvenRoas = breakEvenCpa > 0 ? s.aov / breakEvenCpa : 0
  // Min MER: required revenue per dollar spent across full mix.
  // Assuming this is for a paid-only break-even read, MER = ROAS for paid only.
  const minMer = breakEvenRoas
  const cmSensitivityPerPoint = (s.aov * 0.01) // 1pt margin = AOV * 0.01 CM contribution
  return { breakEvenCpa, breakEvenRoas, minMer, cmSensitivityPerPoint }
}

export function BreakEvenCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>(defaults)
  const result = useMemo(() => compute(inputs), [inputs])

  const setNumber =
    (key: keyof BreakEvenInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = parseFloat(e.target.value)
      setInputs((prev) => ({ ...prev, [key]: Number.isFinite(next) ? next : 0 }))
    }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Calculator className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-foreground">Break-Even Calculator</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Inspect the maximum CPA and minimum ROAS you can sustain at current unit economics.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        <div className="space-y-3 border-b border-border p-4 md:border-b-0 md:border-r">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="be-aov" className="text-xs">
                AOV
              </Label>
              <Input
                id="be-aov"
                type="number"
                value={inputs.aov}
                onChange={setNumber("aov")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="be-margin" className="text-xs">
                Gross margin %
              </Label>
              <Input
                id="be-margin"
                type="number"
                value={inputs.grossMargin}
                onChange={setNumber("grossMargin")}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="be-refunds" className="text-xs">
                Refund rate %
              </Label>
              <Input
                id="be-refunds"
                type="number"
                value={inputs.refundRate}
                onChange={setNumber("refundRate")}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <p className="rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground">
            Based on a {fmt2(inputs.aov)} AOV and{" "}
            <span className="font-medium text-foreground">
              {inputs.grossMargin.toFixed(1)}%
            </span>{" "}
            contribution margin before ad spend, this store can afford a CPA up to{" "}
            <span className="font-medium text-foreground">{fmt2(result.breakEvenCpa)}</span>{" "}
            before contribution margin turns negative.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <ResultTile label="Break-even CPA" value={fmt2(result.breakEvenCpa)} />
          <ResultTile label="Break-even ROAS" value={`${result.breakEvenRoas.toFixed(2)}x`} />
          <ResultTile label="Minimum MER" value={`${result.minMer.toFixed(2)}x`} />
          <ResultTile
            label="Margin sensitivity"
            value={fmt2(result.cmSensitivityPerPoint)}
            caption="per 1pt change at current AOV"
          />
        </div>
      </div>
    </div>
  )
}

function ResultTile({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption?: string
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold tracking-tight text-foreground md:text-lg">
        {value}
      </p>
      {caption && <p className="mt-0.5 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  )
}
