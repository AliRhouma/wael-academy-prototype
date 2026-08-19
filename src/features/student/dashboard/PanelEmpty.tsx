import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cream } from "@/components/kit/CreamPanel"

/**
 * The empty state of a cream panel — icon plate, a line in display type, a line
 * of explanation, and room for a way out.
 *
 * It exists because the dashboard had three different empties: the live panel
 * drew this shape, while the agenda and the documents queue each ran a dashed
 * box with a sentence in it. A demo shows the empty half of a screen as often
 * as the full one — three treatments of the same idea read as three different
 * products — so the shape the live panel already had wins and the dashed boxes
 * are gone.
 *
 * It centres in whatever height the row settles at, on purpose: the panel then
 * looks like it HAS no content, rather than like it lost it.
 */
export function PanelEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  /** A link out — the agenda offers the calendar, the live panel the same. */
  action?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
      <span
        className="grid size-12 place-items-center rounded-full"
        style={{
          background: "color-mix(in srgb, var(--ink-muted) 12%, transparent)",
        }}
      >
        <Icon className="size-6" style={{ color: cream.inkMuted }} />
      </span>
      <p
        className="font-display text-[calc(15px*var(--ts))] font-bold leading-tight"
        style={{ color: cream.ink }}
      >
        {title}
      </p>
      {description && (
        <p
          className="max-w-[28ch] text-[calc(12px*var(--ts))] leading-relaxed"
          style={{ color: cream.inkMuted }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
