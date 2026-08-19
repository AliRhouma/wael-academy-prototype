import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/kit/Toast"
import { DayList } from "@/features/student/calendar/DayList"
import { MonthGrid } from "@/features/student/calendar/MonthGrid"
import { seanceVideoPath } from "@/features/student/player/links"
import {
  dateKey,
  minutesOf,
  nextUp,
  useNow,
  useSessionVisual,
} from "@/features/student/calendar/schedule"
import { useDemoToggle } from "@/lib/demoToggle"
import { useIsMobile } from "@/lib/hooks"
import type { Session } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/**
 * Élève — « روزنامتي ».
 *
 * TWO SECTIONS, and that is the whole page: the month on two thirds of the
 * width, the day picked out of it on the last third. Both wear the frame the
 * dashboard's panels wear (`CreamPanel`), so the calendar reads as the same
 * product as the home screen rather than as a tool bolted next to it.
 *
 * The split is the point. The grid shows nothing but MATIÈRE BADGES — the
 * fastest thing on the screen to recognise — so a month is scanned, not read;
 * clicking a day fills the panel beside it with the séances in full. Neither
 * half tries to do both jobs any more.
 *
 * What this replaced: a « Jour / Mois » toggle over an hour-axis timeline and a
 * month of miniature séance cards. Two views of the same day, each half-legible
 * at its size, and a switch between them the élève had to work. Side by side,
 * there is nothing to switch.
 *
 * There is no fiche behind the cards any more: a card carries its own actions
 * (rejoindre, les exercices, le replay), so the modal that used to open on a tap
 * had nothing left to add. See `DayList`.
 *
 * The page SCROLLS normally now (the old one was a fixed column with its own
 * inner scrollports). Six rows of badges fit without one, and the day panel
 * sticks to the top of the viewport on desktop, so scrolling the month never
 * costs the élève the day they were reading.
 *
 * Referenced for spacing & density: StudentDashboard (panel grid, header),
 * WeekAgenda (rows, cream inks).
 */
export default function StudentCalendarScreen() {
  const now = useNow()
  const today = dateKey(now)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { show, toast } = useToast()

  /**
   * HOW THE MONTH IS DRAWN, and each form factor opens on the one it can
   * actually carry.
   *
   * Desktop lands on CARDS: a cell is ~90px there, which is enough for an hour
   * and a matière, and a month you can read in full is worth the height it
   * costs. A phone lands on DOTS: a seventh of 390px is ~43px, and a card in
   * that is two truncated words — the dots say the same thing at a size that
   * fits, and the day panel one tap below says the rest.
   *
   * The « 1 » key flips whichever one you got — a prototype switch, so it has no
   * on-screen affordance (see `useDemoToggle`, which lists every key in use).
   * Initial only: a resize never yanks the élève out of the view they are in.
   */
  const monthCards = useDemoToggle(["Digit1", "Numpad1"], !isMobile)

  const user = useAuth((s) => s.currentUser)
  const sessions = useData((s) => s.sessions)
  const groups = useData((s) => s.groups)
  const visual = useSessionVisual()

  /** My séances: those of a group I'm in, or scheduled for my année. */
  const mySessions = useMemo(() => {
    const myGroupIds = new Set(
      groups.filter((g) => user && g.studentIds.includes(user.id)).map((g) => g.id),
    )
    return sessions.filter(
      (s) =>
        s.groupIds.some((id) => myGroupIds.has(id)) ||
        (user?.yearIds?.some((id) => s.yearIds.includes(id)) ?? false),
    )
  }, [sessions, groups, user])

  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>()
    for (const s of mySessions) {
      if (!m.has(s.date)) m.set(s.date, [])
      m.get(s.date)!.push(s)
    }
    for (const list of m.values())
      list.sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime))
    return m
  }, [mySessions])

  /**
   * Open on today — unless today is empty, in which case the next day that
   * isn't. Landing on a blank panel teaches the élève nothing.
   */
  const [selected, setSelected] = useState(() => {
    if (byDay.has(today)) return today
    const next = [...byDay.keys()].filter((d) => d >= today).sort()[0]
    return next ?? today
  })
  /** The month drawn — the one the opening selection falls in, not today's. */
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date(`${selected}T00:00:00`)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const dayPanel = useRef<HTMLDivElement | null>(null)

  const daySessions = byDay.get(selected) ?? []

  /** The séance the élève is heading towards — marked in the day panel. */
  const up = useMemo(() => nextUp(mySessions, now), [mySessions, now])

  /**
   * Pick a day. The month follows the selection (picking the greyed-out tail of
   * the previous month walks the grid back to it, rather than selecting a day
   * that is no longer drawn), and on a phone — where the panel sits BELOW the
   * grid instead of beside it — the panel is brought into view, because
   * otherwise a tap looks like it did nothing.
   */
  function pickDay(day: string) {
    setSelected(day)
    const d = new Date(`${day}T00:00:00`)
    setMonthCursor((c) =>
      c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
        ? c
        : new Date(d.getFullYear(), d.getMonth(), 1),
    )
    if (isMobile) {
      requestAnimationFrame(() =>
        dayPanel.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      )
    }
  }

  /** The replay lives on its own page, with its notes and the avis of the groupe. */
  function openReplay(session: Session) {
    navigate(seanceVideoPath(session.id, { subjectId: session.subjectIds[0] }))
  }

  function join(session: Session) {
    show(`تو تدخل لـ « ${session.title} »`)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h1 className="font-display text-[calc(22px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]">
            روزنامتي
          </h1>
          <p className="hidden text-sm text-ink-muted md:block">
            اختار نهار من الروزنامة وشوف حصصو.
          </p>
        </div>

        <button
          type="button"
          onClick={() => pickDay(today)}
          className="inline-flex h-11 shrink-0 items-center rounded-full border-2 border-brand-200 bg-surface px-4 text-[calc(13px*var(--ts))] font-semibold text-ink-subtle transition hover:border-brand-500 hover:text-brand-600 md:h-10"
        >
          اليوم
        </button>
      </div>

      {/* Two thirds / one third — the grid is the page, the day is the read.
          `items-start` so the panel keeps its own height and can stick. */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <MonthGrid
          className="lg:col-span-2"
          cursor={monthCursor}
          onCursorChange={setMonthCursor}
          byDay={byDay}
          today={today}
          selected={selected}
          now={now}
          visual={visual}
          onPickDay={pickDay}
          variant={monthCards ? "cards" : "dots"}
        />

        <div ref={dayPanel} className="scroll-mt-4 lg:sticky lg:top-5">
          <DayList
            day={selected}
            sessions={daySessions}
            now={now}
            isToday={selected === today}
            nextId={up?.session.id}
            onPickDay={pickDay}
            onJoin={join}
            onWatchRecording={openReplay}
          />
        </div>
      </div>

      {toast}
    </div>
  )
}
