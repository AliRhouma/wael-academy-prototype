import { useEffect, useRef } from "react"
import { CalendarOff } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon } from "@/components/icons/subjects"
import { HomeworkDot, homeworkAria } from "@/features/student/calendar/HomeworkDot"
import {
  PX_PER_MIN,
  STATE_LABEL,
  cardTiming,
  layoutDay,
  minutesNow,
  minutesOf,
  sessionState,
  useHomeworkBySession,
  useSessionVisual,
  type SessionState,
} from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import type { Session } from "@/data/types"

export interface DayTimelineProps {
  /** "YYYY-MM-DD" of the day drawn — also the reset key for the auto-scroll. */
  day: string
  sessions: Session[]
  now: Date
  isToday: boolean
  /** Id of the séance the élève is heading towards, if it falls on this day. */
  nextId?: string
  onOpen: (session: Session) => void
}

/** Card skin per state — quiet when done, alive when running, clean when ahead. */
const CARD_SKIN: Record<SessionState, string> = {
  terminee: "border-border bg-surface-muted hover:border-border-strong",
  "en-cours":
    "border-danger-500/45 bg-surface ring-2 ring-danger-500/15 hover:ring-danger-500/25",
  prevue: "border-border bg-surface hover:border-brand-200",
}

/**
 * Élève — one day on a real time axis: an hour gutter, a card per séance placed
 * at its actual time and sized by its actual duration, and a red « maintenant »
 * line that creeps down the grid.
 *
 * The grid owns the ONLY scrollport on the page, and parks itself on the séance
 * the élève is heading towards — the next one to start, or "maintenant" once the
 * day is behind them. A calendar that opens at 07:00 when it's 15:00 is a
 * calendar you have to fight. A card says the matière and the heure and stops
 * there — the title, the salle, the durée and the description are one tap away
 * in the fiche, and on the grid they buried the only question the élève is
 * actually asking: « quoi, et à quelle heure ? ».
 */
export function DayTimeline({ day, sessions, now, isToday, nextId, onOpen }: DayTimelineProps) {
  const visual = useSessionVisual()
  const homeworkOf = useHomeworkBySession()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const firstPaint = useRef(true)

  const nowMinutes = isToday ? minutesNow(now) : null
  const layout = layoutDay(sessions, nowMinutes)

  /**
   * Where to park: on the next séance of this day if there is one (that's what
   * the élève came for), else on "maintenant", else on the day's first séance.
   * The 30-minute lead keeps a slice of the hour above it visible for context.
   */
  const nowMin = nowMinutes ?? -Infinity
  const upcoming = sessions
    .filter((s) => minutesOf(s.endTime) > nowMin)
    .sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime))[0]
  const anchorMin = upcoming
    ? minutesOf(upcoming.startTime) - 30
    : nowMinutes !== null
      ? nowMinutes - 45
      : null

  useEffect(() => {
    const el = scrollRef.current
    if (!el || anchorMin === null) return
    const top = Math.max(0, (anchorMin - layout.fromHour * 60) * PX_PER_MIN)
    el.scrollTo({ top, behavior: firstPaint.current ? "auto" : "smooth" })
    firstPaint.current = false
    // Re-parking on every minute tick would fight the élève's own scrolling —
    // only a change of day (or of its content) re-anchors the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, sessions.length])

  if (sessions.length === 0) {
    return (
      <div className="grid h-full min-h-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface">
        <EmptyState
          icon={CalendarOff}
          title="نهار فاضي"
          description={
            isToday
              ? "ما فماش حصص اليوم. استغلّ الوقت وعاود فصل ولا اعمل كويز."
              : "ما فماش حصص نهارها. اختار نهار آخر في الجمعة."
          }
        />
      </div>
    )
  }

  const nowTop = nowMinutes !== null ? layout.yOf(nowMinutes) : null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto scroll-touch">
        <div className="relative" style={{ height: layout.heightPx + 24 }}>
          {/* Hour rules + gutter labels */}
          {layout.hours.map((h) => {
            const y = layout.yOf(h * 60)
            // The « maintenant » pill owns the gutter at its own height — drop
            // the hour label it would sit on rather than stack the two.
            const eclipsed = nowMinutes !== null && Math.abs(nowMinutes - h * 60) < 24
            return (
              <div key={h} className="pointer-events-none absolute inset-x-0" style={{ top: y }}>
                <div className="ms-[62px] border-t border-border/70" />
                {!eclipsed && (
                  <span className="absolute start-0 top-0 w-[54px] pt-1 text-end text-[calc(11px*var(--ts))] font-medium tabular-nums text-ink-muted">
                    {String(h).padStart(2, "0")}:00
                  </span>
                )}
              </div>
            )
          })}

          {/* Séances — the track starts after the hour gutter, so a card's lane
              percentage is measured against the cards' own width, not the grid's. */}
          <div className="absolute inset-0 ms-[62px] me-3">
          {layout.placed.map(({ session, top, height, lane, lanes }) => {
            const state = sessionState(session, now)
            const { subjectName, theme, tint } = visual(session)
            const done = state === "terminee"
            const isNext = session.id === nextId && state !== "en-cours"
            const homeworks = homeworkOf(session)

            return (
              <div
                key={session.id}
                className={cn("absolute", lanes > 1 && "pe-2")}
                style={{
                  top,
                  height,
                  insetInlineStart: `${(lane / lanes) * 100}%`,
                  width: `${100 / lanes}%`,
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(session)}
                  aria-label={[
                    `${session.title} — ${STATE_LABEL[state]}، من ${session.startTime} لـ ${session.endTime}، ${cardTiming(session, now)}`,
                    homeworkAria(homeworks.length),
                  ]
                    .filter(Boolean)
                    .join("، ")}
                  className={cn(
                    "group relative flex size-full items-center gap-3 overflow-hidden rounded-lg border p-3 ps-4 text-start shadow-sm transition",
                    "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    "motion-safe:hover:-translate-y-0.5",
                    CARD_SKIN[state],
                    // The one the countdown is pointing at — say so on the grid too.
                    isNext && "border-brand-300 ring-2 ring-brand-200",
                  )}
                >
                  {/* Matière colour rail */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 start-0 w-1.5",
                      theme.bar,
                      done && "opacity-40",
                    )}
                  />

                  {/* fما خدمة. The meta row below reserves the corner for it. */}
                  <HomeworkDot
                    count={homeworks.length}
                    className={cn("absolute end-2.5 top-2.5", done && "opacity-50")}
                  />

                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-md",
                      done && "opacity-70",
                    )}
                    style={{ backgroundColor: tint.panel }}
                  >
                    <span
                      className="absolute size-9 rounded-full blur-xl"
                      style={{ backgroundColor: tint.halo }}
                    />
                    <SubjectIcon name={subjectName ?? ""} className="relative size-9" />
                  </span>

                  {/* Matière and heure — nothing else. Le titre, la salle, la
                      durée et la description vivent dans la fiche qu'un tap
                      ouvre; sur la grille ils noyaient la seule question que
                      l'élève pose ici : « quoi, et à quelle heure ? ». */}
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 flex-col justify-center gap-0.5",
                      homeworks.length > 0 && "pe-5",
                    )}
                  >
                    <span
                      dir="auto"
                      className={cn(
                        "truncate font-display text-[calc(15px*var(--ts))] font-bold leading-snug",
                        done ? "text-ink-subtle" : "text-ink",
                      )}
                    >
                      {subjectName}
                    </span>

                    <span
                      className={cn(
                        "text-[calc(12px*var(--ts))] font-semibold tabular-nums",
                        state === "en-cours" ? "text-danger-600" : "text-ink-muted",
                      )}
                    >
                      <span className="num">{session.startTime} – {session.endTime}</span>
                    </span>
                  </span>
                </button>
              </div>
            )
          })}
          </div>

          {/* « Maintenant » — red is the today/now colour in this system. */}
          {nowTop !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 z-10"
              style={{ top: nowTop }}
            >
              <div className="ms-[62px] border-t-2 border-danger-500" />
              <span className="absolute start-[56px] top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger-500 ring-2 ring-surface" />
              <span className="absolute start-0 top-0 w-[50px] -translate-y-1/2 rounded-full bg-danger-500 py-0.5 text-center text-[calc(10px*var(--ts))] font-semibold tabular-nums text-danger-foreground">
                {String(now.getHours()).padStart(2, "0")}:
                {String(now.getMinutes()).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
