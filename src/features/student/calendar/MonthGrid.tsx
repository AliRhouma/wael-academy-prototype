import { ChevronRight, ChevronLeft } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { HomeworkMark, homeworkAria } from "@/features/student/calendar/HomeworkMark"
import {
  dateKey,
  sessionState,
  useHomeworkBySession,
  type SessionVisual,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDayLong } from "@/lib/utils"
import type { Session } from "@/data/types"

const WEEKDAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]

/** Beyond this a cell shows a « + » instead of stacking more dots in ~90px. */
const MAX_DOTS = 4

export interface MonthGridProps {
  /** Any date inside the month drawn. */
  cursor: Date
  onCursorChange: (d: Date) => void
  byDay: Map<string, Session[]>
  today: string
  selected: string
  now: Date
  visual: (s: Session) => SessionVisual
  onPickDay: (day: string) => void
  /**
   * How a day's séances are drawn in its cell.
   *  - "dots" (the default) — one coloured dot each; the month is SCANNED.
   *  - "cards" — a real card each, heure and matière; the month is READ.
   * See the docblock below for why both exist and how the élève swaps them.
   */
  variant?: "dots" | "cards"
  className?: string
}

/**
 * Élève — the month, read as COLOUR rather than as text.
 *
 * A cell is a date and one dot per séance, in that matière's own colour
 * (`subjectTint.dot` — the same hue its card and its badge carry). Nothing else.
 * The séance cards that used to live here (heure, matière, rail, état) turned a
 * seventh of the page into a paragraph the élève had to READ; the matière
 * medallions that replaced them said it in one glance but put forty pieces of
 * detailed art on one screen, and a month of drawings is a month you look AT
 * instead of scanning. A dot is the lightest mark that still carries the
 * matière, so a column reads in a blink and the page stops shouting.
 *
 * The cell has no card of its own either, for the same reason: no border, no
 * fill, nothing but the number and its dots until the day is selected.
 * Forty-two boxes drawn around forty-two numbers is a grid drawing ITSELF
 * instead of the month.
 *
 * Everything the dots leave out lives one click away, in the day panel beside
 * the grid, which is where a list belongs.
 *
 * THE OTHER VIEW (`variant="cards"`, bound to the « 1 » key on the calendar
 * screen). The same month, with a real card per séance in the cell — heure,
 * matière, and the matière's colour as a rail down its start edge. It is the
 * denser read of the two: a whole month of hours at once, at the price of a
 * grid three times as tall and a card ~90px wide. Both are honest views of the
 * same data and neither is right for every job, so the demo carries both and
 * the key picks: dots to find a day, cards to read a month.
 *
 * The cards are NOT buttons in either view. The cell stays one target and it
 * still picks the DAY — a card that opened its own séance would put a ~14px hit
 * area inside a day target, and the panel beside the grid is already showing
 * that séance in full the moment the day is picked.
 *
 * ONE target per cell, and it picks the DAY. That's the whole interaction: the
 * grid says WHEN, the panel beside it says WHAT. (The cell used to hold a button
 * per séance nested in a day button — two meanings on one square, and the
 * smaller of them a ~14px hit area.)
 *
 * Referenced for spacing & density: WeekAgenda (panel title row, date circles,
 * presence dots, cream inks), DayList (the panel it feeds).
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
  variant = "dots",
  className,
}: MonthGridProps) {
  const cards = variant === "cards"
  const y = cursor.getFullYear()
  const mo = cursor.getMonth()
  const startWeekday = (new Date(y, mo, 1).getDay() + 6) % 7 // Monday = 0
  const cells = Array.from({ length: 42 }, (_, i) => new Date(y, mo, 1 - startWeekday + i))
  const monthLabel = cursor.toLocaleDateString("ar-TN-u-nu-latn", { month: "long", year: "numeric" })

  const homeworkOf = useHomeworkBySession()

  const navBtn =
    "grid size-9 shrink-0 place-items-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"

  return (
    <CreamPanel className={className} bodyClassName="gap-3 p-3 sm:p-4 md:p-5">
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onCursorChange(new Date(y, mo - 1, 1))}
          aria-label="الشهر اللي قبل"
          className={navBtn}
          style={{ color: cream.inkMuted }}
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onCursorChange(new Date(y, mo + 1, 1))}
          aria-label="الشهر اللي بعد"
          className={navBtn}
          style={{ color: cream.inkMuted }}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2
          className="ms-1 font-display text-[calc(16px*var(--ts))] font-bold first-letter:uppercase md:text-[calc(18px*var(--ts))]"
          style={{ color: cream.ink }}
        >
          {monthLabel}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="truncate pb-0.5 text-center text-[calc(10px*var(--ts))] font-semibold sm:text-[calc(11px*var(--ts))]"
            style={{ color: cream.inkMuted }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* No scrollport: six rows of dots fit anywhere, so the month is drawn
          whole and the page carries whatever height that comes to. A calendar
          you scroll inside a card that you also scroll inside a page was two
          frames of scrolling for one month. */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((d) => {
          const key = dateKey(d)
          const items = byDay.get(key) ?? []
          const inMonth = d.getMonth() === mo
          const isToday = key === today
          const isSelected = key === selected
          const dayHomework = items.reduce((n, s) => n + homeworkOf(s).length, 0)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onPickDay(key)}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              aria-label={[
                formatSessionDayLong(key),
                items.length === 0 ? "ما فماش حصص" : `${items.length} حصّة`,
                homeworkAria(dayHomework),
              ]
                .filter(Boolean)
                .join(" — ")}
              className={cn(
                "group flex min-w-0 flex-col justify-start gap-1 rounded-[14px] border-2 p-1 transition",
                // A touch target first: 44px of height on a phone even when all
                // that is drawn in it is a number and two dots. The cards view
                // needs room for two of them side by side vertically, and it
                // GROWS past this floor when a day holds more.
                cards
                  ? "min-h-[5.5rem] items-stretch sm:min-h-[7rem] sm:gap-1"
                  : "min-h-11 items-center sm:min-h-[3.75rem] sm:gap-1.5",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
                /*
                 * THE DAY UNDER THE POINTER. Everything here is a CLASS, not an
                 * inline style, and that is the whole reason it works: an inline
                 * `background` beats any `hover:bg-*` the cascade can offer, so
                 * the cell used to be able to change nothing but its border.
                 *
                 * It lifts, it warms, and it takes a soft edge — the same three
                 * moves the matière cards and the séance rows make, because a
                 * day is a target like they are. The number joins in (see
                 * below): on a grid this quiet, one element reacting alone reads
                 * as a rendering glitch rather than as an answer.
                 */
                isSelected
                  ? "border-[var(--brand-500)] bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)]"
                  : cn(
                      "border-transparent",
                      "hover:border-[var(--brand-200)] hover:bg-[color-mix(in_srgb,var(--brand-500)_8%,transparent)]",
                      "hover:shadow-sm motion-safe:hover:-translate-y-0.5",
                    ),
                !inMonth && "opacity-45",
              )}
            >
              <span
                className={cn(
                  "flex w-full items-center gap-0.5",
                  cards ? "justify-start ps-0.5" : "justify-center",
                )}
              >
                {/* Today keeps its red disc through everything — it is the
                    one date that means something before the élève touches it.
                    Any other date warms to brand under the pointer, which is
                    what tells them the whole cell is the target and not just
                    the séances drawn in it. */}
                <span
                  className={cn(
                    "grid size-[22px] shrink-0 place-items-center rounded-full font-display text-[calc(12px*var(--ts))] font-bold leading-none tabular-nums transition sm:size-6 sm:text-[calc(13px*var(--ts))]",
                    isToday
                      ? "bg-[var(--danger-500)] text-[var(--danger-foreground)]"
                      : isSelected
                        ? "text-[var(--brand-600)]"
                        : "text-[var(--ink)] group-hover:text-[var(--brand-600)]",
                  )}
                >
                  {d.getDate()}
                </span>
                {/* Anything to hand in that day — the same drawing as everywhere
                    else, so it never reads as a seventh matière. DOTS ONLY: in
                    the cards view the séance that carries the work says so
                    itself, and a day-level mark beside the date then points at
                    a cell where one card in three is the answer. */}
                {!cards && (
                  <HomeworkMark count={dayHomework} className="size-3.5 shrink-0 sm:size-4" />
                )}
              </span>

              {/* CARDS — the whole séance in the cell: the matière's colour as
                  a rail, the hour, and the matière itself. Nothing else fits at
                  a seventh of the panel, and nothing else is the question the
                  élève asks of a month. A séance already given goes quiet, one
                  reportée is struck through — the same language the day panel
                  speaks, one size down. */}
              {cards && items.length > 0 && (
                <span className="flex min-w-0 flex-col gap-1">
                  {items.map((s) => {
                    const st = sessionState(s, now)
                    const { subjectName, tint } = visual(s)
                    const hw = homeworkOf(s).length
                    return (
                      <span
                        key={s.id}
                        className={cn(
                          "relative flex min-w-0 flex-col overflow-hidden rounded-[8px] border py-1 pe-1 ps-2 text-start",
                          st === "terminee" && "opacity-60",
                        )}
                        style={{
                          borderColor:
                            st === "en-cours"
                              ? "var(--danger-500)"
                              : st === "reportee"
                                ? "var(--accent-500)"
                                : cream.edge,
                          background: "var(--surface)",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 start-0 w-1"
                          style={
                            st === "reportee"
                              ? { background: `color-mix(in srgb, ${tint.dot} 35%, transparent)` }
                              : { background: tint.dot }
                          }
                        />
                        <span
                          className={cn(
                            "truncate text-[calc(9.5px*var(--ts))] font-bold tabular-nums leading-tight",
                            st === "reportee" && "line-through decoration-1",
                          )}
                          style={{
                            color:
                              st === "en-cours" ? "var(--danger-600)" : "var(--brand-600)",
                          }}
                        >
                          <span className="num">{s.startTime}</span>
                        </span>
                        <span
                          dir="auto"
                          className={cn(
                            "truncate text-[calc(10px*var(--ts))] font-medium leading-snug",
                            // Room for the badge, so a long matière never runs
                            // under it.
                            hw > 0 && "pe-3.5",
                          )}
                          style={{ color: cream.ink }}
                        >
                          {subjectName ?? s.title}
                        </span>

                        {/*
                          THE NOTIFICATION. A count in a red disc, parked in the
                          card's corner — the badge everyone already knows from
                          an app icon, which is exactly why it works here: it
                          says « il y a quelque chose pour toi là-dedans » and
                          it asks to be cleared. That is the pull the خدمة
                          drawing never had; the drawing named the thing (and
                          named it well, at 16px on a séance card) but a month
                          cell has no room to name anything, only to point.

                          It breathes ONLY while the séance is still ahead of
                          the élève: work due for a séance already given is a
                          fact, not an alarm, and a grid of pulsing discs over a
                          month of finished séances is noise nobody can act on.
                        */}
                        {hw > 0 && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute end-0.5 top-0.5 flex size-3.5"
                          >
                            <span
                              className={cn(
                                "inline-flex size-3.5 items-center justify-center rounded-full bg-danger-500 text-[calc(8px*var(--ts))] font-bold leading-none tabular-nums text-danger-foreground ring-2 ring-[var(--surface)]",
                                // A breath, not a ping: the card clips its own
                                // corners (that is what keeps the colour rail
                                // inside them), so a halo scaling past the edge
                                // would come out bitten. Opacity carries the
                                // urgency and stays inside the box.
                                st !== "terminee" && "motion-safe:animate-pulse",
                              )}
                            >
                              {hw}
                            </span>
                          </span>
                        )}
                      </span>
                    )
                  })}
                </span>
              )}

              {/* DOTS — the matières of the day, one each, in the order they
                  run. No heure, no titre: that is the panel's job. */}
              {!cards && items.length > 0 && (
                <span className="flex min-w-0 flex-wrap items-center justify-center gap-[3px] sm:gap-1">
                  {items.slice(0, MAX_DOTS).map((s) => {
                    const state = sessionState(s, now)
                    return (
                      <span
                        key={s.id}
                        className={cn(
                          "size-1.5 rounded-full sm:size-2",
                          // A séance already behind the élève steps back rather
                          // than disappearing — the day still happened.
                          state === "terminee" && "opacity-40",
                        )}
                        // HOLLOW when it is off. The matière keeps its colour —
                        // the élève still has to recognise which one fell — but
                        // an empty ring says « rien ne remplit cette heure »
                        // without a word, at 6px, in a cell that has no room
                        // for one.
                        style={
                          state === "reportee"
                            ? { boxShadow: `inset 0 0 0 1.5px ${visual(s).tint.dot}` }
                            : { background: visual(s).tint.dot }
                        }
                      />
                    )
                  })}
                  {items.length > MAX_DOTS && (
                    <span
                      className="text-[calc(9px*var(--ts))] font-bold leading-none tabular-nums"
                      style={{ color: cream.inkMuted }}
                    >
                      +{items.length - MAX_DOTS}
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </CreamPanel>
  )
}
