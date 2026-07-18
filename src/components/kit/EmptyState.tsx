import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional call-to-action (e.g. an "Ajouter" button). */
  action?: ReactNode
  className?: string
}

/**
 * Centered empty state — neutral icon chip + muted copy (design system §13).
 * Shown when a list has no data (including after the user deletes everything).
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-neutral-100 text-ink-muted">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
