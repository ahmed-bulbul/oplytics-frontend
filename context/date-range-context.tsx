"use client"

import { createContext, useContext, useState } from "react"

// ── helpers ───────────────────────────────────────────────────────────────────

const SHORT_MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function last30Days(): { from: Date; to: Date } {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setDate(to.getDate() - 29)     // 30 days total: from ... to (inclusive)
  return { from, to }
}

function buildLabel(from: Date, to: Date): string {
  const s = `${SHORT_MONTH[from.getMonth()]} ${from.getDate()}`
  const e = `${SHORT_MONTH[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`
  return `${s} - ${e}`
}

// ── types ─────────────────────────────────────────────────────────────────────

interface DateRangeState {
  /** Human-readable label shown in the DateRangePicker button */
  label: string
  /** Whether the compare overlay is active */
  compareEnabled: boolean
  /** Human-readable compare period label (e.g. "previous period", "previous year") */
  compareLabel: string | null
  /** Start of the primary date range */
  from: Date
  /** End of the primary date range (inclusive) */
  to: Date
  /** Start of the compare range (null when compareEnabled is false or not yet set) */
  compareFrom: Date | null
  /** End of the compare range (null when compareEnabled is false or not yet set) */
  compareTo: Date | null
}

interface DateRangeContextValue extends DateRangeState {
  update: (state: Partial<DateRangeState>) => void
}

// ── defaults ──────────────────────────────────────────────────────────────────

function makeDefault(): DateRangeState {
  const { from, to } = last30Days()
  // Previous-period compare: the 30 days before `from`
  const compareFrom = new Date(from)
  compareFrom.setDate(from.getDate() - 30)
  const compareTo = new Date(from)
  compareTo.setDate(from.getDate() - 1)

  return {
    label: buildLabel(from, to),
    // Comparison is on by default so the previous-period overlay is
    // visible on the main dashboard chart out of the box.
    compareEnabled: true,
    compareLabel: "previous period",
    from,
    to,
    compareFrom,
    compareTo,
  }
}

const defaultState = makeDefault()

const DateRangeContext = createContext<DateRangeContextValue>({
  ...defaultState,
  update: () => {},
})

// ── provider ──────────────────────────────────────────────────────────────────

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DateRangeState>(makeDefault)

  function update(partial: Partial<DateRangeState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  return (
    <DateRangeContext.Provider value={{ ...state, update }}>
      {children}
    </DateRangeContext.Provider>
  )
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useDateRange() {
  return useContext(DateRangeContext)
}
