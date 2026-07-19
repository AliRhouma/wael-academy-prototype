import type { ReactNode } from "react"
import { UsersRound } from "lucide-react"
import { Badge } from "@/components/kit/Badge"
import { formatSessionDay, formatTimeRange, nowStamp, sessionStamp } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useSessionLabels } from "./sessionLabels"

/**
 * One séance as a card — a date tile, title + time range + teacher, then the
 * groups (brand badges), the matières (muted) and an optional description.
 * Presentational: pass `actions` (e.g. an OverflowMenu) for the manager view;
 * omit it for read-only agendas. Past sessions read a touch quieter.
 */
export function SessionCard({ session, actions }: { session: Session; actions?: ReactNode }) {
  const { teacherName, subjectNames, groupNames } = useSessionLabels()
  const teacher = teacherName(session.teacherId)
  const groups = groupNames(session.groupIds)
  const subjects = subjectNames(session.subjectIds)
  const isPast = sessionStamp(session) < nowStamp()

  // Date tile parts (e.g. "lun." / "20").
  const day = new Date(`${session.date}T00:00:00`)
  const weekday = day.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")
  const dayNum = day.getDate()

  return (
    <div className="flex items-start gap-3.5 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div
        className={
          "grid size-12 shrink-0 place-items-center rounded-md text-center leading-none " +
          (isPast ? "bg-neutral-100 text-ink-muted" : "bg-brand-50 text-brand-700")
        }
      >
        <span className="text-[10px] font-medium uppercase tracking-wide">{weekday}</span>
        <span className="font-display text-[18px] font-bold">{dayNum}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p dir="auto" className="min-w-0 font-display text-[15px] font-bold text-ink">
            {session.title}
          </p>
          {actions}
        </div>

        <p className="mt-0.5 text-[12px] text-ink-muted">
          <span className="tabular-nums text-ink-subtle">
            {formatTimeRange(session.startTime, session.endTime)}
          </span>
          {teacher ? <> · {teacher}</> : null}
          {isPast ? <> · <span className="text-ink-muted">passée</span></> : null}
        </p>

        {groups.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {groups.map((g) => (
              <Badge key={g} tone="brand" dot>
                <UsersRound className="size-3" />
                <span dir="auto">{g}</span>
              </Badge>
            ))}
          </div>
        )}

        {subjects.length > 0 && (
          <p dir="auto" className="mt-1.5 text-[12px] text-ink-muted">
            {subjects.join(" · ")}
          </p>
        )}

        {session.description ? (
          <p dir="auto" className="mt-1.5 line-clamp-2 text-[12px] text-ink-subtle">
            {session.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Group a list of sessions by their day, sorted; returns [dateISO, sessions][]. */
export function groupByDay(sessions: Session[]): [string, Session[]][] {
  const m = new Map<string, Session[]>()
  for (const s of [...sessions].sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))) {
    if (!m.has(s.date)) m.set(s.date, [])
    m.get(s.date)!.push(s)
  }
  return [...m.entries()]
}

export { formatSessionDay }
