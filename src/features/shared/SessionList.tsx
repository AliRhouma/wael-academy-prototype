import { CalendarDays } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { formatDateTime } from "@/lib/utils"
import type { Course, Session } from "@/data/types"

/** A simple list of sessions with their course name + time. Shared by roles. */
export function SessionList({
  sessions,
  courses,
  empty,
}: {
  sessions: Session[]
  courses: Course[]
  empty?: string
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState icon={CalendarDays} title={empty ?? "Aucune séance à venir"} />
      </div>
    )
  }
  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "—"
  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
            <CalendarDays className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[13px] font-bold text-ink">{s.title}</p>
            <p className="truncate text-[12px] text-ink-muted">{courseName(s.courseId)}</p>
          </div>
          <span className="shrink-0 text-end text-[11px] text-ink-muted">{formatDateTime(s.startsAt)}</span>
        </li>
      ))}
    </ul>
  )
}
