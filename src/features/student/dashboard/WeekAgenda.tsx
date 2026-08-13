import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, ChevronLeft, Clock3 } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import { addDays, dateKey, minutesOf, sessionState } from "@/features/student/calendar/schedule"
import { formatTimeRange } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useData } from "@/stores/useData"

/**
 * Section 2 — the week, and what is on the day you pick.
 *
 * A STRIP, not a grid: seven chips is the whole week at a glance on a phone and
 * on a desktop alike, and the dashboard's job is "what's today" — the month view
 * already exists a click away in الروزنامة for everything else. Today is
 * selected on arrival because that is the question being asked; the other six
 * chips are there so "and tomorrow?" doesn't cost a page load.
 *
 * A dot under a chip means that day has séances — so the élève can see where the
 * week is heavy without tapping through it.
 *
 * Referenced for spacing & density: SessionCard (time → title → teacher order),
 * CalendarScreen (day selection, week start on الإثنين).
 */
/**
 * Without the article, so a 70px chip can hold the whole word. Slicing the full
 * names instead gave «الأ» for both الأربعاء and الأحد — two different days
 * under one label is worse than no label.
 */
const WEEKDAYS = ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"]
/** Seven of these have to share 390px, where the full word does not fit. */
const WEEKDAYS_SHORT = ["إث", "ثلا", "أرب", "خم", "جم", "سب", "أح"]

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
  const subject = subjects.find((s) => session.subjectIds.includes(s.id))
  const teacher = teachers.find((t) => t.id === session.teacherId)
  const state = sessionState(session, now)

  return (
    <li className="flex items-center gap-3 py-2">
      <span
        className="w-[4.6rem] shrink-0 text-center text-[calc(11.5px*var(--ts))] font-semibold tabular-nums"
        style={{ color: state === "terminee" ? cream.inkMuted : cream.ink }}
      >
        {formatTimeRange(session.startTime, session.endTime)}
      </span>
      {/* A running séance gets the live dot; the rest get a quiet tick. */}
      <span
        className={cn("size-2 shrink-0 rounded-full", state === "en-cours" && "animate-pulse")}
        style={{
          background:
            state === "en-cours" ? "var(--danger-500)" : state === "terminee" ? cream.inkMuted : "var(--brand-500)",
        }}
      />
      <span className="min-w-0 flex-1">
        <span
          dir="auto"
          className="block truncate font-display text-[calc(13.5px*var(--ts))] font-bold leading-tight"
          style={{ color: state === "terminee" ? cream.inkMuted : cream.ink }}
        >
          {session.title}
        </span>
        <span className="block truncate text-[calc(11.5px*var(--ts))]" style={{ color: cream.inkMuted }}>
          {[subject?.name, teacher?.name].filter(Boolean).join(" · ")}
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

  return (
    <CreamPanel notch={notch} className="min-h-[13rem]" bodyClassName="gap-3 p-4 md:p-5">
      {/* The notch is bitten out of this corner, so the title row starts after
          it — otherwise the heading wraps around a hole with a character in it. */}
      {/* Wraps rather than squeezes: between the notch and the link there are
          widths where the title had to break mid-phrase. Here the link drops to
          its own line instead. */}
      <div
        className="flex flex-wrap items-center justify-between gap-x-3"
        style={{ paddingInlineStart: notch ? notch[0] - 8 : 0 }}
      >
        <h2
          className="flex items-center gap-2 font-display text-[calc(17px*var(--ts))] font-bold"
          style={{ color: cream.ink }}
        >
          <CalendarDays className="size-[18px]" style={{ color: cream.inkMuted }} />
          الحصص الجايّة
        </h2>
        <Link
          to="/student/calendrier"
          className="inline-flex shrink-0 items-center gap-1 text-[calc(12.5px*var(--ts))] font-medium transition hover:opacity-70"
          style={{ color: cream.inkMuted }}
        >
          الروزنامة الكل <ChevronLeft className="size-4" />
        </Link>
      </div>

      {/* The week. Chips rather than a table: seven of them fit a phone, and the
          only state that matters is which one is open. */}
      <div className="flex gap-1.5 md:gap-2">
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
              className={cn(
                "flex min-h-[3.9rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] border-2 px-1 py-1.5 transition",
                !isSelected && "hover:-translate-y-px",
              )}
              style={{
                borderColor: isSelected ? "transparent" : cream.edge,
                background: isSelected ? "var(--brand-500)" : "transparent",
                color: isSelected ? "#fff" : isToday ? "var(--brand-600)" : cream.ink,
              }}
            >
              <span className="max-w-full truncate text-[calc(10.5px*var(--ts))] font-medium leading-none opacity-80">
                <span className="md:hidden">{WEEKDAYS_SHORT[(day.getDay() + 6) % 7]}</span>
                <span className="hidden md:inline">{WEEKDAYS[(day.getDay() + 6) % 7]}</span>
              </span>
              <span className="font-display text-[calc(16px*var(--ts))] font-bold leading-none tabular-nums">
                {day.getDate()}
              </span>
              {/* Presence, not a count: the list below says how many. */}
              <span
                className="size-1.5 rounded-full transition"
                style={{
                  background: count === 0 ? "transparent" : isSelected ? "rgb(255 255 255 / .8)" : cream.edge,
                }}
              />
            </button>
          )
        })}
      </div>

      {daySessions.length === 0 ? (
        <p
          className="flex flex-1 items-center justify-center rounded-[14px] border-2 border-dashed py-6 text-center text-[calc(12.5px*var(--ts))]"
          style={{ borderColor: cream.edge, color: cream.inkMuted }}
        >
          ما فمّة حتّى حصّة في هذا النهار — ارتاح ولّا أرجع لتسجيلاتك.
        </p>
      ) : (
        <ul className="flex-1 divide-y" style={{ borderColor: cream.edge }}>
          {daySessions.map((session) => (
            <SessionRow key={session.id} session={session} now={now} />
          ))}
        </ul>
      )}

      {daySessions.length > 0 && (
        <p
          className="flex items-center gap-1.5 text-[calc(11.5px*var(--ts))]"
          style={{ color: cream.inkMuted }}
        >
          <Clock3 className="size-3.5" />
          {`${daySessions.length} حصص في هذا النهار`}
        </p>
      )}
    </CreamPanel>
  )
}
