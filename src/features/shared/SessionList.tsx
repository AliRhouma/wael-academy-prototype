import { CalendarDays } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { formatSessionDay, formatTimeRange, sessionStamp } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useSessionLabels } from "@/features/shared/session/sessionLabels"

/**
 * A compact list of séances with their day + time and matière / groupe context.
 * Shared by the role dashboards (teacher / student / parent); each passes its own
 * already-scoped, pre-filtered list.
 */
export function SessionList({ sessions, empty }: { sessions: Session[]; empty?: string }) {
  const { subjectNames, groupNames } = useSessionLabels()

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState icon={CalendarDays} title={empty ?? "Aucune séance à venir"} />
      </div>
    )
  }

  const ordered = [...sessions].sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))

  return (
    <ul className="flex flex-col gap-2">
      {ordered.map((s) => {
        const subject = subjectNames(s.subjectIds)[0]
        const group = groupNames(s.groupIds)[0]
        const context = [subject, group].filter(Boolean).join(" · ")
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
              <CalendarDays className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p dir="auto" className="truncate font-display text-[13px] font-bold text-ink">
                {s.title}
              </p>
              <p dir="auto" className="truncate text-[12px] text-ink-muted">
                {context || "—"}
              </p>
            </div>
            <span className="shrink-0 text-end text-[11px] text-ink-muted">
              {formatSessionDay(s.date)}
              <br />
              <span className="tabular-nums">{formatTimeRange(s.startTime, s.endTime)}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
