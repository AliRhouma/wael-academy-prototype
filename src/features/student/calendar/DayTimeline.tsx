import { useEffect, useRef } from "react"
import { CalendarOff, CheckCircle2, Hourglass, PlayCircle, Video } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, hasSubjectArt } from "@/components/icons/subjects"
import {
  PX_PER_MIN,
  STATE_LABEL,
  cardTiming,
  formatDuration,
  layoutDay,
  minutesNow,
  minutesOf,
  sessionState,
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

const PILL: Record<SessionState, string> = {
  terminee: "bg-neutral-100 text-neutral-600",
  "en-cours": "bg-danger-50 text-danger-700",
  prevue: "bg-brand-50 text-brand-700",
}

/**
 * Élève — one day on a real time axis: an hour gutter, a card per séance placed
 * at its actual time and sized by its actual duration, and a red « maintenant »
 * line that creeps down the grid.
 *
 * The grid owns the ONLY scrollport on the page, and parks itself on the séance
 * the élève is heading towards — the next one to start, or "maintenant" once the
 * day is behind them. A calendar that opens at 07:00 when it's 15:00 is a
 * calendar you have to fight. Cards are generous on purpose: this is one élève's
 * day, not the academy's whole board, so there is room to read the matière, the
 * enseignant and the salle without opening anything.
 */
export function DayTimeline({ day, sessions, now, isToday, nextId, onOpen }: DayTimelineProps) {
  const visual = useSessionVisual()
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
          title="Journée libre"
          description={
            isToday
              ? "Aucune séance aujourd’hui. Profites-en pour revoir un chapitre ou refaire un quiz."
              : "Aucune séance ce jour-là. Choisis un autre jour dans la semaine."
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
                  <span className="absolute start-0 top-0 w-[54px] pt-1 text-end text-[11px] font-medium tabular-nums text-ink-muted">
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
            const { subjectName, theme } = visual(session)
            const done = state === "terminee"
            const hasReplay = Boolean(session.recordingUrl)
            const isNext = session.id === nextId && state !== "en-cours"

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
                  aria-label={`${session.title} — ${STATE_LABEL[state]}, de ${session.startTime} à ${session.endTime}, ${cardTiming(session, now)}`}
                  className={cn(
                    "group relative flex size-full items-start gap-3 overflow-hidden rounded-lg border p-3 ps-4 text-start shadow-sm transition",
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

                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-md",
                      theme.panel,
                      done && "opacity-70",
                    )}
                  >
                    <span className={cn("absolute size-9 rounded-full blur-xl", theme.halo)} />
                    <SubjectIcon
                      name={subjectName ?? ""}
                      className={cn(
                        "relative size-6",
                        !hasSubjectArt(subjectName ?? "") && theme.icon,
                      )}
                    />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col self-stretch">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[12px] font-semibold tabular-nums text-ink-subtle">
                        {session.startTime} – {session.endTime}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                          PILL[state],
                        )}
                      >
                        {state === "en-cours" && (
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full rounded-full bg-danger-500 motion-safe:animate-ping" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-danger-500" />
                          </span>
                        )}
                        {done && <CheckCircle2 className="size-2.5" />}
                        {STATE_LABEL[state]}
                      </span>

                      {/* How far away it is, in words — the countdown at card
                          level, so the grid answers "when?" without a tap. */}
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          state === "en-cours"
                            ? "text-danger-600"
                            : isNext
                              ? "text-brand-600"
                              : "text-ink-muted",
                        )}
                      >
                        {cardTiming(session, now)}
                      </span>
                    </span>

                    <span
                      dir="auto"
                      className={cn(
                        "mt-1 line-clamp-2 font-display text-[15px] font-bold leading-snug",
                        done ? "text-ink-subtle" : "text-ink",
                      )}
                    >
                      {session.title}
                    </span>

                    <span dir="auto" className="mt-0.5 truncate text-[12px] text-ink-muted">
                      {[subjectName, session.room].filter(Boolean).join(" · ")}
                      {subjectName || session.room ? " · " : ""}
                      {formatDuration(session.startTime, session.endTime)}
                    </span>

                    {/* A long séance gets a tall card — let it earn the height
                        instead of leaving a hole under the title. Desktop only:
                        at ~390px the card is narrow enough that the title already
                        eats the budget, and a clipped half-line reads as a bug. */}
                    {height >= 150 && session.description && (
                      <span className="hidden min-h-0 sm:block">
                        <span
                          dir="auto"
                          className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-subtle"
                        >
                          {session.description}
                        </span>
                      </span>
                    )}

                    {/* The promise the modal keeps. */}
                    <span
                      className={cn(
                        "mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium",
                        done && !hasReplay
                          ? "text-ink-muted"
                          : "text-brand-600 group-hover:text-brand-700",
                      )}
                    >
                      {done ? (
                        hasReplay ? (
                          <>
                            <PlayCircle className="size-3.5" /> Voir l’enregistrement
                          </>
                        ) : (
                          <>
                            <Hourglass className="size-3.5" /> Enregistrement en préparation
                          </>
                        )
                      ) : (
                        <>
                          <Video className="size-3.5" />
                          {state === "en-cours" ? "Rejoindre maintenant" : "Participer"}
                        </>
                      )}
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
              <span className="absolute start-0 top-0 w-[50px] -translate-y-1/2 rounded-full bg-danger-500 py-0.5 text-center text-[10px] font-semibold tabular-nums text-danger-foreground">
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
