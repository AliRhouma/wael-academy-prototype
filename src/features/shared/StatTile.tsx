import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** A small stat card (icon chip + Cause number + label); optionally a link. */
export function StatTile({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: LucideIcon
  label: string
  value: number | string
  to?: string
}) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition",
        to && "group-hover:border-brand-200 group-hover:shadow-md",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-1 truncate text-[12px] text-ink-muted">{label}</p>
      </div>
    </div>
  )
  return to ? (
    <Link to={to} className="group block">
      {inner}
    </Link>
  ) : (
    inner
  )
}
