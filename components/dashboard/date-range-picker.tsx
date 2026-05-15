"use client"

import { useState, useRef } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useDateRange } from "@/context/date-range-context"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

const SHORT_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const PRESETS = [
  { label: "Custom", days: null },
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last week (Sun - Sat)", days: -10 },
  { label: "Last 14 days", days: 14 },
  { label: "This month", days: -1 },
  { label: "Last 30 days", days: 30 },
  { label: "Last month", days: -2 },
  { label: "All time", days: -3 },
]

const COMPARE_MODES = ["Previous period", "Previous year", "Custom"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatDisplay(d: Date) {
  return `${SHORT_MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function formatInput(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

function parseInput(s: string): Date | null {
  const parts = s.split("/")
  if (parts.length < 3) return null
  const m = parseInt(parts[0]) - 1
  const d = parseInt(parts[1])
  const y = parseInt(parts[2])
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null
  const date = new Date(y, m, d)
  return isNaN(date.getTime()) ? null : date
}

function applyPreset(days: number | null): { start: Date; end: Date } | null {
  if (days === null) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (days === 0) return { start: new Date(today), end: new Date(today) }
  if (days === 1) { const y = new Date(today); y.setDate(today.getDate() - 1); return { start: y, end: y } }
  if (days === -1) return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today) }
  if (days === -2) {
    return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) }
  }
  if (days === -3) return { start: new Date(2010, 0, 1), end: new Date(today) }  // 2010 covers all Shopify stores
  if (days === -10) {
    const dow = today.getDay()
    const lastSun = new Date(today); lastSun.setDate(today.getDate() - dow - 7)
    const lastSat = new Date(lastSun); lastSat.setDate(lastSun.getDate() + 6)
    return { start: lastSun, end: lastSat }
  }
  const start = new Date(today); start.setDate(today.getDate() - days + 1)
  return { start, end: new Date(today) }
}

function getCompareRange(start: Date, end: Date, mode: string): { start: Date; end: Date } {
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (mode === "Previous period") {
    const cs = new Date(start); cs.setDate(cs.getDate() - duration - 1)
    const ce = new Date(start); ce.setDate(ce.getDate() - 1)
    return { start: cs, end: ce }
  }
  if (mode === "Previous year") {
    const cs = new Date(start); cs.setFullYear(cs.getFullYear() - 1)
    const ce = new Date(end); ce.setFullYear(ce.getFullYear() - 1)
    return { start: cs, end: ce }
  }
  // Custom — same as previous period by default
  const cs = new Date(start); cs.setDate(cs.getDate() - duration - 1)
  const ce = new Date(start); ce.setDate(ce.getDate() - 1)
  return { start: cs, end: ce }
}

interface MonthCalendarProps {
  year: number
  month: number
  tempStart: Date | null
  tempEnd: Date | null
  hoverDate: Date | null
  selecting: boolean
  onDayClick: (date: Date) => void
  onDayHover: (date: Date | null) => void
  compareStart?: Date | null
  compareEnd?: Date | null
  compareEnabled?: boolean
}

function MonthCalendar({
  year, month, tempStart, tempEnd, hoverDate, selecting,
  onDayClick, onDayHover, compareStart, compareEnd, compareEnabled,
}: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const effectiveEnd = selecting && hoverDate ? hoverDate : tempEnd

  function classify(day: number) {
    const d = new Date(year, month, day)
    const isMainStart = tempStart ? sameDay(d, tempStart) : false
    const isMainEnd = effectiveEnd ? sameDay(d, effectiveEnd) : false
    const inMain = tempStart && effectiveEnd
      ? d > (tempStart < effectiveEnd ? tempStart : effectiveEnd) && d < (tempStart < effectiveEnd ? effectiveEnd : tempStart)
      : false
    const isCompStart = compareEnabled && compareStart ? sameDay(d, compareStart) : false
    const isCompEnd = compareEnabled && compareEnd ? sameDay(d, compareEnd) : false
    const inComp = compareEnabled && compareStart && compareEnd
      ? d > compareStart && d < compareEnd
      : false
    return { isMainStart, isMainEnd, inMain, isCompStart, isCompEnd, inComp }
  }

  return (
    <div className="min-w-[280px]">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider">
        {SHORT_MONTH[month].toUpperCase()} {year}
      </p>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="h-9 w-full" />
          const { isMainStart, isMainEnd, inMain, isCompStart, isCompEnd, inComp } = classify(day)
          const isMainEndpoint = isMainStart || isMainEnd
          const isCompEndpoint = isCompStart || isCompEnd
          const isOnlyMain = isMainStart && isMainEnd
          const isOnlyComp = isCompStart && isCompEnd

          return (
            <button
              key={day}
              onClick={() => onDayClick(new Date(year, month, day))}
              onMouseEnter={() => onDayHover(new Date(year, month, day))}
              onMouseLeave={() => onDayHover(null)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center text-sm transition-colors",
                // Compare range bg (amber)
                inComp && !isMainEndpoint && "bg-amber-100 dark:bg-amber-900/30",
                // Main range bg (emerald)
                inMain && !isCompEndpoint && "bg-emerald-500/10",
                // Both ranges overlap in range
                inMain && inComp && "bg-emerald-500/10",
                // No endpoint, no range — plain hover
                !isMainEndpoint && !isCompEndpoint && !inMain && !inComp && "rounded hover:bg-muted",
                // Main endpoints
                isMainStart && !isOnlyMain && "rounded-l-full bg-emerald-600 text-white hover:bg-emerald-700",
                isMainEnd && !isOnlyMain && "rounded-r-full bg-emerald-600 text-white hover:bg-emerald-700",
                isOnlyMain && "rounded-full bg-emerald-600 text-white hover:bg-emerald-700",
                // Compare endpoints (amber/gold)
                isCompStart && !isMainEndpoint && !isOnlyComp && "rounded-l-full bg-amber-400 text-white hover:bg-amber-500",
                isCompEnd && !isMainEndpoint && !isOnlyComp && "rounded-r-full bg-amber-400 text-white hover:bg-amber-500",
                isOnlyComp && !isMainEndpoint && "rounded-full bg-amber-400 text-white hover:bg-amber-500",
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker() {
  const { update: updateContext } = useDateRange()
  const [open, setOpen] = useState(false)

  // ── Bootstrap default to "Last 30 days" to match the context ────────────
  const defaultRange = applyPreset(30)!   // always non-null for days=30

  const [label, setLabel] = useState(() => {
    const s = `${SHORT_MONTH[defaultRange.start.getMonth()]} ${defaultRange.start.getDate()}`
    const e = `${SHORT_MONTH[defaultRange.end.getMonth()]} ${defaultRange.end.getDate()}, ${defaultRange.end.getFullYear()}`
    return `${s} - ${e}`
  })
  const [activePreset, setActivePreset] = useState("Last 30 days")
  // Match the date range context default so the picker UI reflects
  // that comparison is on out of the box.
  const [compareEnabled, setCompareEnabled] = useState(true)
  const [compareMode, setCompareMode] = useState("Previous period")
  const [daysToToday, setDaysToToday] = useState(30)
  const [daysToYesterday, setDaysToYesterday] = useState(30)

  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start)
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end)

  const [tempStart, setTempStart] = useState<Date | null>(defaultRange.start)
  const [tempEnd, setTempEnd] = useState<Date | null>(defaultRange.end)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selecting, setSelecting] = useState(false)

  const [startInput, setStartInput] = useState(formatInput(defaultRange.start))
  const [endInput, setEndInput] = useState(formatInput(defaultRange.end))

  const today = new Date()
  const [scrollYear, setScrollYear] = useState(today.getFullYear())
  const [scrollMonth, setScrollMonth] = useState(today.getMonth())

  const scrollRef = useRef<HTMLDivElement>(null)

  const months = Array.from({ length: 3 }, (_, i) => {
    const totalMonth = scrollMonth + i
    return { year: scrollYear + Math.floor(totalMonth / 12), month: totalMonth % 12 }
  })

  // Derived compare range
  const compareRange = compareEnabled && tempStart && tempEnd && compareMode !== "Custom"
    ? getCompareRange(tempStart, tempEnd, compareMode)
    : null

  const [customCompareStart, setCustomCompareStart] = useState<Date | null>(null)
  const [customCompareEnd, setCustomCompareEnd] = useState<Date | null>(null)
  const [customCompStartInput, setCustomCompStartInput] = useState("")
  const [customCompEndInput, setCustomCompEndInput] = useState("")

  const effectiveCompare = compareEnabled
    ? compareMode === "Custom"
      ? { start: customCompareStart, end: customCompareEnd }
      : compareRange
        ? { start: compareRange.start, end: compareRange.end }
        : null
    : null

  function handlePresetClick(preset: typeof PRESETS[0]) {
    setActivePreset(preset.label)
    if (preset.days === null) return
    const result = applyPreset(preset.days)
    if (!result) return
    setTempStart(result.start)
    setTempEnd(result.end)
    setStartInput(formatInput(result.start))
    setEndInput(formatInput(result.end))
    setSelecting(false)
    setScrollYear(result.start.getFullYear())
    setScrollMonth(Math.max(0, result.start.getMonth()))
  }

  function handleDayClick(date: Date) {
    if (!selecting || !tempStart) {
      setTempStart(date); setTempEnd(null)
      setStartInput(formatInput(date)); setEndInput("")
      setSelecting(true)
    } else {
      const [s, e] = date < tempStart ? [date, tempStart] : [tempStart, date]
      setTempStart(s); setTempEnd(e)
      setStartInput(formatInput(s)); setEndInput(formatInput(e))
      setSelecting(false); setActivePreset("Custom")
    }
  }

  function handleApply() {
    if (tempStart && tempEnd) {
      setStartDate(tempStart); setEndDate(tempEnd)
      const s = `${SHORT_MONTH[tempStart.getMonth()]} ${tempStart.getDate()}`
      const e = `${SHORT_MONTH[tempEnd.getMonth()]} ${tempEnd.getDate()}, ${tempEnd.getFullYear()}`
      const newLabel = `${s} - ${e}`
      setLabel(newLabel)

      // Build compare label and Date objects for context
      let compareLabel: string | null = null
      let compareFrom: Date | null = null
      let compareTo: Date | null = null

      if (compareEnabled) {
        if (compareMode === "Previous period") {
          compareLabel = "previous period"
          const range = getCompareRange(tempStart, tempEnd, compareMode)
          compareFrom = range.start
          compareTo = range.end
        } else if (compareMode === "Previous year") {
          compareLabel = "previous year"
          const range = getCompareRange(tempStart, tempEnd, compareMode)
          compareFrom = range.start
          compareTo = range.end
        } else if (compareMode === "Custom" && customCompareStart && customCompareEnd) {
          const cs = `${SHORT_MONTH[customCompareStart.getMonth()]} ${customCompareStart.getDate()}`
          const ce = `${SHORT_MONTH[customCompareEnd.getMonth()]} ${customCompareEnd.getDate()}`
          compareLabel = `${cs} - ${ce}`
          compareFrom = customCompareStart
          compareTo = customCompareEnd
        }
      }

      updateContext({
        label: newLabel,
        compareEnabled,
        compareLabel,
        from: tempStart,
        to: tempEnd,
        compareFrom,
        compareTo,
      })
    }
    setOpen(false)
  }

  function handleCancel() {
    setTempStart(startDate); setTempEnd(endDate)
    setSelecting(false); setOpen(false)
  }

  function prevMonth() {
    if (scrollMonth === 0) { setScrollMonth(11); setScrollYear(y => y - 1) }
    else setScrollMonth(m => m - 1)
  }

  function nextMonth() {
    if (scrollMonth === 11) { setScrollMonth(0); setScrollYear(y => y + 1) }
    else setScrollMonth(m => m + 1)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          title="Sample store data shown for demonstration purposes."
        >
          <CalendarDays className="h-4 w-4" />
          <span>{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0" sideOffset={8}>
        <div className="flex">
          {/* Left panel */}
          <div className="flex w-52 flex-col border-r border-border">
            <div className="flex-1 py-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePresetClick(p)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors",
                    activePreset === p.label
                      ? "bg-muted font-semibold text-emerald-600"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{p.label}</span>
                  {p.label === "Last week (Sun - Sat)" && <ChevronRight className="h-3 w-3 opacity-40" />}
                </button>
              ))}
            </div>

            {/* N-days inputs */}
            <div className="space-y-2 border-t border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={daysToToday}
                  onChange={(e) => setDaysToToday(Number(e.target.value))}
                  className="w-14 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                />
                <span className="text-sm text-muted-foreground">days up to today</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={daysToYesterday}
                  onChange={(e) => setDaysToYesterday(Number(e.target.value))}
                  className="w-14 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                />
                <span className="text-sm text-muted-foreground">days up to yesterday</span>
              </div>
            </div>

            {/* Compare toggle */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compare</span>
                <Switch checked={compareEnabled} onCheckedChange={setCompareEnabled} />
              </div>

              {/* Compare mode options */}
              {compareEnabled && (
                <div className="mt-2 space-y-0.5">
                  {COMPARE_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCompareMode(mode)}
                      className={cn(
                        "w-full rounded px-2 py-1.5 text-left text-sm transition-colors",
                        compareMode === mode
                          ? "bg-muted font-semibold text-emerald-600"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col">
            {/* Main date inputs */}
            <div className="flex items-end gap-3 border-b border-border px-4 py-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Start date*</label>
                <input
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  onBlur={() => { const d = parseInput(startInput); if (d) { setTempStart(d); setActivePreset("Custom") } }}
                  placeholder="M/D/YYYY"
                  className="w-28 rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <span className="pb-2 text-muted-foreground">—</span>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">End date*</label>
                <input
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  onBlur={() => { const d = parseInput(endInput); if (d) { setTempEnd(d); setActivePreset("Custom") } }}
                  placeholder="M/D/YYYY"
                  className="w-28 rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="ml-auto flex gap-1">
                <button onClick={prevMonth} className="rounded p-1 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={nextMonth} className="rounded p-1 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Compare date inputs (shown when compare enabled) */}
            {compareEnabled && (
              <div className="flex items-end gap-3 border-b border-border bg-muted/30 px-4 py-3">
                <span className="pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compare</span>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Start date*</label>
                  <input
                    value={compareMode === "Custom" ? customCompStartInput : (effectiveCompare?.start ? formatInput(effectiveCompare.start) : "")}
                    onChange={(e) => { setCustomCompStartInput(e.target.value) }}
                    onBlur={() => { if (compareMode === "Custom") { const d = parseInput(customCompStartInput); if (d) setCustomCompareStart(d) } }}
                    readOnly={compareMode !== "Custom"}
                    placeholder="M/D/YYYY"
                    className={cn(
                      "w-28 rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400",
                      compareMode !== "Custom" && "text-muted-foreground"
                    )}
                  />
                </div>
                <span className="pb-2 text-muted-foreground">—</span>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">End date*</label>
                  <input
                    value={compareMode === "Custom" ? customCompEndInput : (effectiveCompare?.end ? formatInput(effectiveCompare.end) : "")}
                    onChange={(e) => { setCustomCompEndInput(e.target.value) }}
                    onBlur={() => { if (compareMode === "Custom") { const d = parseInput(customCompEndInput); if (d) setCustomCompareEnd(d) } }}
                    readOnly={compareMode !== "Custom"}
                    placeholder="M/D/YYYY"
                    className={cn(
                      "w-28 rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400",
                      compareMode !== "Custom" && "text-muted-foreground"
                    )}
                  />
                </div>
              </div>
            )}

            {/* Scrollable calendar */}
            <div ref={scrollRef} className="space-y-6 overflow-y-auto px-4 py-3" style={{ maxHeight: 340, minWidth: 300 }}>
              {months.map(({ year, month }) => (
                <MonthCalendar
                  key={`${year}-${month}`}
                  year={year}
                  month={month}
                  tempStart={tempStart}
                  tempEnd={tempEnd}
                  hoverDate={hoverDate}
                  selecting={selecting}
                  onDayClick={handleDayClick}
                  onDayHover={(d) => selecting && setHoverDate(d)}
                  compareStart={effectiveCompare?.start}
                  compareEnd={effectiveCompare?.end}
                  compareEnabled={compareEnabled}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleApply}
                disabled={!tempStart || !tempEnd}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
