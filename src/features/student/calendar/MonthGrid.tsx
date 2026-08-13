import { useEffect, useRef } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { HomeworkDot, homeworkAria } from "@/features/student/calendar/HomeworkDot"
import {
  dateKey,
  sessionState,
  useHomeworkBySession,
  type SessionVisual,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDayLong } from "@/lib/utils"
import type { Session } from "@/data/types"

const WEEKDAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]

export interface MonthGridProps {
  /** Any date inside the month drawn. */
  cursor: Date
  onCursorChange: (d: Date) => void
  byDay: Map<string, Session[]>
  today: string
  selected: string
  now: Date
  visual: (s: Session) => SessionVisual
  /** Picking a DAY drops back into the day view on that date. */
  onPickDay: (day: string) => void
  /** Picking a SÉANCE opens it right here — no detour through the day view. */
  onOpenSession: (session: Session) => void
}

/**
 * Élève — the whole month, read as séance cards rather than as a density map.
 * Each day carries a real card per séance (heure, titre, matière, salle) with
 * the matière's colour rail and the same quiet-when-done treatment as the day
 * timeline, so a month is browsable without opening anything.
 *
 * Rows are tall by default and STRETCH when a day holds more, which makes the
 * month taller than the space it sits in — so the grid is its own scrollport and
 * opens on the selected week. The page around it still never scrolls.
 *
 * TWO targets per cell, because they mean two different things: the day header
 * jumps to that day's timeline, while a séance card opens that séance straight
 * away. Reading one séance shouldn't cost a detour through the day view.
 *
 * At ~390px a seventh of the viewport can't hold a card, so mobile keeps compact
 * rows with coloured dots; the whole cell is then the day target, and the élève
 * reads the séance on the timeline, which is where it belongs on a phone.
 *
 * Referenced for spacing & density: AdminCalendarScreen (month arithmetic,
 * "today" in red), DayTimeline (matière colours, card states).
 */
export function MonthGrid({
  cursor,
  onCursorChange,
  byDay,
  today,
  selected,
  now,
  visual,
  onPickDay,
  onOpenSession,
}: MonthGridProps) {
  const y = cursor.getFullYear()
  const mo = cursor.getMonth()
  const startWeekday = (new Date(y, mo, 1).getDay() + 6) % 7 // Monday = 0
  const cells = Array.from({ length: 42 }, (_, i) => new Date(y, mo, 1 - startWeekday + i))
  const monthLabel = cursor.toLocaleDateString("ar-TN-u-nu-latn", { month: "long", year: "numeric" })

  const homeworkOf = useHomeworkBySession()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const selectedRef = useRef<HTMLDivElement | null>(null)

  // Six tall rows don't fit at once — open on the selected week, not on the 1st.
  useEffect(() => {
    if (!selectedRef.current) {
      scrollRef.current?.scrollTo({ top: 0 })
      return
    }
    selectedRef.current.scrollIntoView({ block: "nearest" })
  }, [cursor, selected])

  const navBtn =
    "grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
      <div className="mb-2 flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onCursorChange(new Date(y, mo - 1, 1))}
          aria-label="الشهر اللي قبل"
          className={navBtn}
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onCursorChange(new Date(y, mo + 1, 1))}
          aria-label="الشهر اللي بعد"
          className={navBtn}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="ms-1 font-display text-[calc(15px*var(--ts))] font-bold text-ink first-letter:uppercase sm:text-base">
          {monthLabel}
        </h2>
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[calc(10.5px*var(--ts))] font-medium uppercase tracking-wide text-ink-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/*
        The grid is the scrollport now. Rows are tall enough for real séance
        cards (heure, titre, matière, salle) and GROW past that when a day holds
        more — nothing is ever hidden behind a "+2". The month simply gets taller
        than the card and scrolls inside it, so the page itself still doesn't.
        At ~390px a seventh of the screen can't hold a card, so mobile keeps the
        coloured dots and a compact row; a tap goes to the day timeline.
      */}
      <div
        ref={scrollRef}
        // `auto-rows-max`, not `auto-rows-auto`: the grid has a definite height
        // (it's the scrollport), and `auto` tracks then stop at the cells' floor
        // instead of growing to the busiest day — measured, not guessed.
        className="grid min-h-0 flex-1 auto-rows-max grid-cols-7 content-start gap-1 overflow-y-auto scroll-touch"
      >
        {cells.map((d) => {
          const key = dateKey(d)
          const items = byDay.get(key) ?? []
          const inMonth = d.getMonth() === mo
          const isToday = key === today
          const isSelected = key === selected

          const countLabel =
            items.length === 0
              ? "ما فماش حصص"
              : `${items.length} حصّة`

          /** How much خدمة the whole day carries — the mobile cell's dot. */
          const dayHomework = items.reduce((n, s) => n + homeworkOf(s).length, 0)

          return (
            // A DIV, not a button: the séance cards inside are buttons of their
            // own, and interactive elements can't nest.
            <div
              key={key}
              ref={isSelected ? selectedRef : undefined}
              className={cn(
                // The min-height sets the floor; the row then grows to whichever
                // day of that week holds the most séances (auto rows + stretch),
                // so a busy day is never clipped and never spills.
                "flex min-h-[4.5rem] min-w-0 flex-col rounded-md border p-1 transition sm:min-h-[9.5rem] sm:p-1.5",
                isSelected
                  ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200"
                  : "border-transparent hover:border-border hover:bg-surface-muted",
                !inMonth && "opacity-40",
              )}
            >
              {/*
                The day target. It stretches over the whole cell while there is
                nothing else to hit — and on mobile always, since the cards are
                hidden there and the élève reads the day on the timeline.
              */}
              <button
                type="button"
                onClick={() => onPickDay(key)}
                aria-current={isToday ? "date" : undefined}
                aria-label={[formatSessionDayLong(key), countLabel, homeworkAria(dayHomework)]
                  .filter(Boolean)
                  .join(" — ")}
                className={cn(
                  "flex w-full flex-1 flex-col items-start gap-1 rounded-md text-start",
                  items.length > 0 && "sm:flex-none",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[calc(12px*var(--ts))] font-semibold tabular-nums",
                    isToday
                      ? "bg-danger-500 text-danger-foreground"
                      : isSelected
                        ? "text-brand-700"
                        : "text-ink-subtle",
                  )}
                >
                  {d.getDate()}
                </span>

                {/* Mobile: just the load, tucked under the number so the day
                    reads as one unit instead of floating over the next row. */}
                {items.length > 0 && (
                  <span className="flex flex-wrap items-center gap-0.5 sm:hidden">
                    {items.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          visual(s).theme.bar,
                          sessionState(s, now) === "terminee" && "opacity-40",
                        )}
                      />
                    ))}
                    {items.length > 3 && (
                      <span className="text-[calc(9px*var(--ts))] font-semibold leading-none text-ink-muted">+</span>
                    )}
                    {/* fما خدمة somewhere in the day — bigger than the matière
                        dots and in the alert colour, so it never reads as a
                        seventh matière. */}
                    <HomeworkDot count={dayHomework} className="ms-0.5 size-2" />
                  </span>
                )}
              </button>

              {items.length > 0 && (
                /* Desktop: every séance of the day, as a card that opens it. */
                <span className="mt-1 hidden min-w-0 flex-col gap-1 sm:flex">
                    {items.map((s) => {
                      const { subjectName, theme } = visual(s)
                      const state = sessionState(s, now)
                      const done = state === "terminee"
                      const homeworks = homeworkOf(s)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onOpenSession(s)}
                          aria-label={[
                            `${s.title} — من ${s.startTime} لـ ${s.endTime}`,
                            homeworkAria(homeworks.length),
                          ]
                            .filter(Boolean)
                            .join("، ")}
                          className={cn(
                            "relative flex min-w-0 flex-col overflow-hidden rounded-md border py-1 pe-1.5 ps-2 text-start shadow-xs transition",
                            "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                            done
                              ? "border-border bg-surface-muted hover:border-border-strong"
                              : state === "en-cours"
                                ? "border-danger-500/40 bg-surface hover:border-danger-500/60"
                                : "border-border bg-surface hover:border-brand-200",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute inset-y-0 start-0 w-1",
                              theme.bar,
                              done && "opacity-40",
                            )}
                          />
                          <HomeworkDot
                            count={homeworks.length}
                            className={cn("absolute end-1 top-1 size-2", done && "opacity-50")}
                          />
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              homeworks.length > 0 && "pe-3.5",
                            )}
                          >
                            <span
                              className={cn(
                                "text-[calc(10px*var(--ts))] font-semibold tabular-nums",
                                done ? "text-ink-muted" : "text-ink-subtle",
                              )}
                            >
                              <span className="num">{s.startTime} – {s.endTime}</span>
                            </span>
                            {state === "en-cours" && (
                              <span className="relative flex size-1.5 shrink-0">
                                <span className="absolute inline-flex size-full rounded-full bg-danger-500 motion-safe:animate-ping" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-danger-500" />
                              </span>
                            )}
                          </span>
                          <span
                            dir="auto"
                            className={cn(
                              "truncate text-[calc(11px*var(--ts))] font-medium leading-snug",
                              done ? "text-ink-subtle" : "text-ink",
                            )}
                          >
                            {s.title}
                          </span>
                          <span dir="auto" className="truncate text-[calc(10px*var(--ts))] text-ink-muted">
                            {[subjectName, s.room].filter(Boolean).join(" · ")}
                          </span>
                        </button>
                      )
                    })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
