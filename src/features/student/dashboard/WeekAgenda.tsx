import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarOff, ChevronLeft } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { HomeworkDocsButton } from "@/features/student/HomeworkDocsButton"
import { PanelEmpty } from "@/features/student/dashboard/PanelEmpty"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import {
  STATE_LABEL,
  addDays,
  dateKey,
  minutesOf,
  sessionState,
  useHomeworkBySession,
} from "@/features/student/calendar/schedule"
import { formatTimeRange } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useData } from "@/stores/useData"

/**
 * Section 2 — the day's séances, with the week as a way to step off it.
 *
 * The week is a row of CIRCLES, not the block chips it used to be. The panel
 * gave up most of its width to the live section beside it, and seven boxes tall
 * enough to stack a weekday over a number over a dot do not survive that — but
 * seven date circles do, because a circle is the smallest shape that can hold a
 * two-digit date and still read as a target. The weekday moved above the circle
 * where it costs no width, and the "this day has séances" dot moved below it.
 *
 * Today is selected on arrival because that is the question the dashboard is
 * answering; the other six are there so "and tomorrow?" doesn't cost a page
 * load. The title follows the selection — « حصص اليوم » while today is open,
 * the day's name once the élève steps off it — because a panel headed "today"
 * listing Thursday's séances is a panel that lies.
 *
 * Referenced for spacing & density: SessionCard (time → title → teacher order),
 * CalendarScreen (day selection, week start on الإثنين), LiveNowPanel (title
 * row).
 */
/** The day's own name, for the title once the élève steps off today. */
const WEEKDAYS_FULL = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]

/** Monday of the week `now` falls in — the app's week start everywhere else. */
function weekStart(now: Date): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  // getDay(): 0 = Sunday. Monday-first means Sunday is 6 days into the week.
  return addDays(d, -((d.getDay() + 6) % 7))
}

function SessionRow({ session, now }: { session: Session; now: Date }) {
  const subjects = useData((s) => s.subjects)
  const teachers = useData((s) => s.teachers)
  const homeworkOf = useHomeworkBySession()
  const subject = subjects.find((s) => session.subjectIds.includes(s.id))
  const teacher = teachers.find((t) => t.id === session.teacherId)
  const state = sessionState(session, now)
  const off = state === "reportee"

  return (
    // A card, not a ruled row. The list is short and every line is a place the
    // élève has to be, so each one gets its own box rather than sharing a rule
    // with its neighbour — and the box is what carries the state: a séance
    // running right now paints its border `--danger-500`, the same way the live
    // panel lets its frame say so, a séance REPORTÉE paints it gold (the élève
    // has to not turn up), and a finished one steps back a shade.
    <li
      className="flex items-start gap-2 rounded-[14px] border-2 px-2.5 py-2 transition"
      style={{
        borderColor: off
          ? "var(--accent-500)"
          : state === "en-cours"
            ? "var(--danger-500)"
            : cream.edge,
        background: "var(--surface)",
        opacity: state === "terminee" ? 0.7 : 1,
      }}
    >
      {/* The dot leads now that the column is narrow: the hour wraps to its own
          line under the title rather than holding a fixed rail beside it. */}
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          state === "en-cours" && "motion-safe:animate-pulse",
        )}
        style={
          // Hollow when the séance isn't going to run — the same ring the
          // calendar draws, so the mark means one thing across the app.
          off
            ? { boxShadow: "inset 0 0 0 2px var(--accent-500)" }
            : {
                background:
                  state === "en-cours"
                    ? "var(--danger-500)"
                    : state === "terminee"
                      ? cream.inkMuted
                      : "var(--brand-500)",
              }
        }
      />
      <span className="min-w-0 flex-1">
        {/* Title and exercises share the line: the button is the only thing on
            this row the élève can act on, and parking it under the meta line
            grew every row by 44px to say what an icon says in 32. */}
        <span className="flex items-start gap-1.5">
          <span
            dir="auto"
            title={session.title}
            className="min-w-0 flex-1 truncate font-display text-[calc(12.5px*var(--ts))] font-bold leading-tight"
            style={{ color: state === "terminee" ? cream.inkMuted : cream.ink }}
          >
            {session.title}
          </span>
          <HomeworkDocsButton
            compact
            homeworks={homeworkOf(session)}
            past={state === "terminee"}
            className="-mt-1"
          />
        </span>
        <span
          className="mt-0.5 flex items-center gap-1.5 text-[calc(10.5px*var(--ts))]"
          style={{ color: cream.inkMuted }}
        >
          <span
            className={cn("shrink-0 font-semibold tabular-nums", off && "line-through decoration-1")}
          >
            {formatTimeRange(session.startTime, session.endTime)}
          </span>
          {off && (
            <span
              className="shrink-0 rounded-full px-1.5 py-px text-[calc(9.5px*var(--ts))] font-bold"
              style={{
                background: "color-mix(in srgb, var(--accent-500) 16%, transparent)",
                color: "var(--accent-700)",
              }}
            >
              {STATE_LABEL.reportee}
            </span>
          )}
          {(subject?.name || teacher?.name) && (
            <span dir="auto" className="truncate">
              · {[subject?.name, teacher?.name].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
      </span>
    </li>
  )
}

export function WeekAgenda({ now, notch }: { now: Date; notch?: [number, number] }) {
  const mySessions = useMySessions()
  const today = dateKey(now)
  const [selected, setSelected] = useState(today)

  const days = useMemo(() => {
    const start = weekStart(now)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [now])

  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>()
    for (const s of mySessions) {
      const list = m.get(s.date)
      if (list) list.push(s)
      else m.set(s.date, [s])
    }
    for (const list of m.values()) list.sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime))
    return m
  }, [mySessions])

  const daySessions = byDay.get(selected) ?? []
  const selectedDay = days.find((d) => dateKey(d) === selected)
  const title =
    selected === today ? "حصص اليوم" : `حصص ${WEEKDAYS_FULL[((selectedDay ?? now).getDay() + 6) % 7]}`

  return (
    <CreamPanel notch={notch} className="min-h-[13rem]" bodyClassName="gap-3 p-4 md:p-5">
      {/* The notch is bitten out of this corner, so the title row starts after
          it — otherwise the heading wraps around a hole with a character in it. */}
      <div
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
        style={{ paddingInlineStart: notch ? notch[0] - 8 : 0 }}
      >
        <h2
          className="font-display text-[calc(17px*var(--ts))] font-bold leading-tight"
          style={{ color: cream.ink }}
        >
          {title}
        </h2>
        <Link
          to="/student/calendrier"
          aria-label="الروزنامة الكل"
          className="inline-flex shrink-0 items-center gap-1 text-[calc(11.5px*var(--ts))] font-medium transition hover:opacity-70"
          style={{ color: cream.inkMuted }}
        >
          الروزنامة <ChevronLeft className="size-3.5" />
        </Link>
      </div>

      {/* The week — seven circles, dates only. The two-letter weekday over each
          one was reading as noise: the row is always إث→أح in order, so the
          letters said nothing the position didn't, and dropping them lets the
          date — the part that actually identifies the day — come up a size. The
          full name still rides the button's `aria-label`, and the panel's own
          title says which day is open. `grid-cols-7` rather than a flex row so
          every day keeps its column and the strip shrinks with the panel. */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const key = dateKey(day)
          const isToday = key === today
          const isSelected = key === selected
          const count = byDay.get(key)?.length ?? 0
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={isSelected}
              aria-label={`${WEEKDAYS_FULL[(day.getDay() + 6) % 7]} ${day.getDate()}`}
              // min-h-11 on the BUTTON, not the circle: the touch target has to
              // clear 44px while the circle itself stays small enough that seven
              // of them fit a ~250px column.
              className="group flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] py-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 font-display text-[calc(13px*var(--ts))] font-bold leading-none tabular-nums transition md:size-9",
                  !isSelected && "motion-safe:group-hover:-translate-y-px",
                )}
                style={{
                  borderColor: isSelected ? "transparent" : isToday ? "var(--brand-500)" : cream.edge,
                  background: isSelected ? "var(--brand-500)" : "transparent",
                  color: isSelected ? "#fff" : isToday ? "var(--brand-600)" : cream.ink,
                }}
              >
                {day.getDate()}
              </span>
              {/* Presence, not a count: the list below says how many. */}
              <span
                className="size-1 rounded-full transition"
                style={{
                  background:
                    count === 0 ? "transparent" : isSelected ? "var(--brand-500)" : cream.inkMuted,
                }}
              />
            </button>
          )
        })}
      </div>

      {daySessions.length === 0 ? (
        <PanelEmpty
          icon={CalendarOff}
          title={selected === today ? "نهار بلا حصص" : "ما فماش حصص"}
          description="ارتاح ولّا أرجع لتسجيلاتك."
          action={
            <Link
              to="/student/seances"
              className="mt-1 inline-flex min-h-11 items-center gap-1 text-[calc(12.5px*var(--ts))] font-medium transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ color: "var(--brand-600)" }}
            >
              شوف التسجيلات <ChevronLeft className="size-4" />
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-1 flex-col gap-2">
          {daySessions.map((session) => (
            <SessionRow key={session.id} session={session} now={now} />
          ))}
        </ul>
      )}
    </CreamPanel>
  )
}
