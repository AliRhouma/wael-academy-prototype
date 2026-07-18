import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Right-aligned action slot (usually the one primary action for the page). */
  action?: ReactNode
  className?: string
}

/**
 * Standard page header — display title, optional subtitle, primary action pinned
 * right on the same row (design system → patterns.md "Page header convention").
 */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
