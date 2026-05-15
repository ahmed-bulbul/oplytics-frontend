"use client"

import { ReactNode } from "react"

interface IntelligencePageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function IntelligencePageHeader({
  title,
  subtitle,
  actions,
}: IntelligencePageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground md:mt-1 md:text-sm text-pretty max-w-2xl">
            {subtitle}
          </p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
