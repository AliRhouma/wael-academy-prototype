import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/kit/Toast"
import { DayTimeline } from "@/features/student/calendar/DayTimeline"
import { MonthGrid } from "@/features/student/calendar/MonthGrid"
import { NextUpBanner } from "@/features/student/calendar/NextUpBanner"
import { SessionDetailSheet } from "@/features/student/calendar/SessionDetailSheet"
import { seanceVideoPath } from "@/features/student/player/links"
import {
  addDays,
  dateKey,
  minutesOf,
  nextUp,
  useNow,
  useSessionVisual,
} from "@/features/student/calendar/schedule"
import { useIsMobile } from "@/lib/hooks"
import { cn, formatSessionDayLong } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

type View = "jour" | "mois"

const VIEWS: { key: View; label: string; icon: typeof CalendarDays }[] = [
  { key: "jour", label: "Jour", icon: CalendarDays },
  { key: "mois", label: "Mois", icon: CalendarRange },
]

/**
 * Élève — « Mon calendrier ».
 *
 * THE PAGE ITSELF NEVER SCROLLS. It's a fixed column that fills the shell:
 * header, countdown banner and day picker are pinned, and the only scrollport on
 * screen is the calendar section at the bottom (`flex-1 min-h-0`). Everything
 * that tells the élève *when* stays visible while they move through the day.
 *
 * Three layers, in the order the élève reads them:
 *   1. the countdown — what's next and in how long;
 *   2. one line of navigation — arrows + the date in « Jour », the month toolbar
 *      in « Mois ». « Jour » deliberately has NO week strip: it cost ~130px of
 *      the only thing that matters here, and « Mois » is the better way to jump
 *      around anyway;
 *   3. the calendar itself — the timeline parked on the next séance, or the
 *      month of séance cards.
 *
 * The two views open where each form factor needs them: « Jour » on a phone,
 * « Mois » on desktop, where a month of cards is genuinely readable.
 *
 * Referenced for spacing & density: AdminCalendarScreen (month arithmetic,
 * "today" in red), StudentSubjectDetailScreen (segmented control),
 * StudentSubjectsScreen (matière panel + halo).
 */
export default function StudentCalendarScreen() {
  const now = useNow()
  const today = dateKey(now)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { show, toast } = useToast()

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
   * isn't. Landing on a blank grid teaches the élève nothing.
   */
  const [selected, setSelected] = useState(() => {
    if (byDay.has(today)) return today
    const next = [...byDay.keys()].filter((d) => d >= today).sort()[0]
    return next ?? today
  })
  /**
   * Where each form factor is most useful on arrival: the phone gets « Jour »
   * (a month of cards can't be read a seventh of 390px at a time), the desktop
   * gets « Mois », which there shows every séance in full. Initial only — a
   * resize never yanks the élève out of the view they chose.
   */
  const [view, setView] = useState<View>(() => (isMobile ? "jour" : "mois"))
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  )

  const [detail, setDetail] = useState<Session | null>(null)

  const selectedDate = new Date(`${selected}T00:00:00`)
  const daySessions = byDay.get(selected) ?? []

  /** What the countdown points at — the séance running now, or the next one. */
  const up = useMemo(() => nextUp(mySessions, now), [mySessions, now])

  function goDay(delta: number) {
    setSelected(dateKey(addDays(selectedDate, delta)))
  }

  /** Jump to a day and show it on the timeline — from the month grid or "today". */
  function goToDay(day: string) {
    setSelected(day)
    setMonthCursor(new Date(`${day}T00:00:00`))
    setView("jour")
  }

  /** The replay lives on its own page, with its notes and the avis of the groupe. */
  function openReplay(session: Session) {
    setDetail(null)
    navigate(seanceVideoPath(session.id, { subjectId: session.subjectIds[0] }))
  }

  function join(session: Session) {
    setDetail(null)
    show(`Tu rejoins « ${session.title} »`)
  }

  const navBtn =
    "grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"

  return (
    // h-full + min-h-0 all the way down: the shell's <main> gets an exact-height
    // child, so nothing outside the calendar section can ever scroll.
    <div className="flex h-full min-h-0 flex-col gap-3 md:gap-4">
      {/* Header — compact on purpose; vertical space here is spent on the grid. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-bold leading-tight text-ink md:text-[26px]">
            Mon calendrier
          </h1>
          <p className="hidden text-sm text-ink-muted md:block">
            Tes séances, jour par jour — rejoins celles à venir, revois celles qui sont passées.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            role="tablist"
            aria-label="Vue du calendrier"
            className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-1"
          >
            {VIEWS.map((v) => {
              const active = view === v.key
              const Icon = v.icon
              return (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition",
                    active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
                  )}
                >
                  <Icon className={cn("size-4", active && "text-brand-600")} />
                  {v.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => goToDay(today)}
            className="inline-flex h-11 items-center rounded-md border border-border-strong bg-surface px-3.5 text-[13px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-10"
          >
            Aujourd’hui
          </button>
        </div>
      </div>

      <div className="shrink-0">
        <NextUpBanner upNext={up} now={now} onOpen={setDetail} />
      </div>

      {view === "jour" ? (
        <>
          {/*
            One line for the whole day navigation — arrows, the date, the count.
            The week strip that used to sit here cost ~130px of the only thing
            that matters on this screen, the day itself; « Mois » is the wider
            view when the élève wants to jump around.
          */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => goDay(-1)}
              aria-label="Jour précédent"
              className={navBtn}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => goDay(1)} aria-label="Jour suivant" className={navBtn}>
              <ChevronRight className="size-5" />
            </button>

            {/* `first-letter:uppercase`, not `capitalize` — French writes
                "samedi 1 août", so only the very first letter may change. */}
            <h2 className="ms-1 min-w-0 truncate font-display text-[15px] font-bold text-ink first-letter:uppercase sm:text-base">
              {selected === today ? "Aujourd’hui" : formatSessionDayLong(selected)}
            </h2>
            {selected === today && (
              <span className="hidden shrink-0 truncate text-[12px] text-ink-muted sm:inline">
                {formatSessionDayLong(selected)}
              </span>
            )}

            <span
              className={cn(
                "ms-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                daySessions.length === 0
                  ? "bg-neutral-100 text-ink-muted"
                  : "bg-brand-50 text-brand-700",
              )}
            >
              {daySessions.length === 0
                ? "aucune séance"
                : `${daySessions.length} séance${daySessions.length > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* The ONE scrollport on this page. */}
          <div className="min-h-0 flex-1">
            <DayTimeline
              day={selected}
              sessions={daySessions}
              now={now}
              isToday={selected === today}
              nextId={up?.session.id}
              onOpen={setDetail}
            />
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1">
          <MonthGrid
            cursor={monthCursor}
            onCursorChange={setMonthCursor}
            byDay={byDay}
            today={today}
            selected={selected}
            now={now}
            visual={visual}
            onPickDay={goToDay}
            onOpenSession={setDetail}
          />
        </div>
      )}

      <SessionDetailSheet
        session={detail}
        onOpenChange={(open) => !open && setDetail(null)}
        now={now}
        onWatchRecording={openReplay}
        onJoin={join}
      />

      {toast}
    </div>
  )
}
