import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { nowStamp, sessionStamp, formatSessionDayLong } from "@/lib/utils"
import { SessionCard, groupByDay } from "@/features/shared/session/SessionCard"

type TimeFilter = "upcoming" | "past" | "all"

/** Teacher — « Mes séances »: the read-only agenda of sessions they run. */
export default function TeacherSessionsScreen() {
  const user = useAuth((s) => s.currentUser)
  const sessions = useData((s) => s.sessions)

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming")

  const mine = useMemo(
    () => sessions.filter((s) => s.teacherId && s.teacherId === user?.teacherId),
    [sessions, user],
  )

  const counts = useMemo(() => {
    const now = nowStamp()
    let upcoming = 0
    for (const s of mine) if (sessionStamp(s) >= now) upcoming++
    return { all: mine.length, upcoming, past: mine.length - upcoming }
  }, [mine])

  const rows = useMemo(() => {
    const now = nowStamp()
    const filtered = mine.filter((s) => {
      if (timeFilter === "upcoming") return sessionStamp(s) >= now
      if (timeFilter === "past") return sessionStamp(s) < now
      return true
    })
    const days = groupByDay(filtered)
    return timeFilter === "past" ? days.reverse() : days
  }, [mine, timeFilter])

  const firstName = user?.name.split(" ")[0] ?? ""
  const isEmpty = mine.length === 0
  const nothingShown = rows.length === 0

  const filters: { key: TimeFilter; label: string; count: number }[] = [
    { key: "upcoming", label: "À venir", count: counts.upcoming },
    { key: "past", label: "Passées", count: counts.past },
    { key: "all", label: "Toutes", count: counts.all },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mes séances" subtitle={`Votre emploi du temps, ${firstName}.`} />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={CalendarDays}
            title="Aucune séance"
            description="Aucune séance ne vous est encore assignée. L’administration les planifie."
          />
        </div>
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
            {filters.map((f) => {
              const active = timeFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setTimeFilter(f.key)}
                  className={
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition " +
                    (active
                      ? "border-transparent bg-brand-600 text-ink-inverted"
                      : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                  }
                >
                  {f.label}
                  <span
                    className={
                      "rounded-full px-1.5 text-xs tabular-nums " +
                      (active ? "bg-white/20" : "bg-neutral-100 text-ink-muted")
                    }
                  >
                    {f.count}
                  </span>
                </button>
              )
            })}
          </div>

          {nothingShown ? (
            <div className="rounded-lg border border-dashed border-border bg-surface">
              <EmptyState
                icon={CalendarDays}
                title={timeFilter === "upcoming" ? "Aucune séance à venir" : "Aucune séance"}
                description="Rien à afficher pour ce filtre."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {rows.map(([day, daySessions]) => (
                <section key={day}>
                  <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                    {formatSessionDayLong(day)}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {daySessions.map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
