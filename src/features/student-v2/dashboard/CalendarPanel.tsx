import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { DropdownMenu } from "radix-ui"
import {
  CalendarX2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock,
  FileCheck2,
  Files,
  Paperclip,
} from "lucide-react"
import type { Session } from "@/data/types"
import {
  addDays,
  dateKey,
  sessionStart,
  useHomeworkBySession,
  type SessionState,
} from "@/features/student/calendar/schedule"
import { cn, formatTimeRange } from "@/lib/utils"
import {
  BASE,
  MONTHS,
  WEEKDAYS,
  WEEK_ORDER,
  dayLabel,
  pad2,
  parseDay,
  relativeDay,
  useLookups,
  v2VideoPath,
  weekStart,
} from "../lib"
import { LatinLine, Panel, ctaClass, iconBtnClass, liveOutlineClass } from "../ui"

/** One-letter weekday, the Arabic calendar convention — for a 390px strip. */
const WEEKDAY_LETTER = ["ح", "ن", "ث", "ر", "خ", "ج", "س"]

type View = "day" | "month"

/**
 * « حصص المباشرة » — the élève's séances, one day at a time (the frame) or the
 * whole month (the frame's « Calendar months » variant), switched by the pill
 * that reads « اليوم ». The week strip steps a week per arrow; past days fade,
 * today keeps a ring, the selected day takes the ramp, and a day with séances
 * carries a dot so the week can be read before it's clicked.
 *
 * Every card is one séance in one of four states, straight from the clock
 * (`useLiveState().stateFor`): on air (the teal plate, red dot, « مباشر الآن »), still to come
 * (time + prof), over (« انتهت », documents + replay) and put off (« تأجلت »).
 */
export function CalendarPanel({
  sessions,
  now,
  stateFor,
  onOpenDocs,
}: {
  sessions: Session[]
  now: Date
  stateFor: (s: Session) => SessionState
  onOpenDocs: (session: Session, started: boolean) => void
}) {
  const today = dateKey(now)
  // `?view=month` opens on the month, like the states dock's URL keys.
  const [view, setView] = useState<View>(() =>
    new URLSearchParams(window.location.search).get("view") === "month" ? "month" : "day",
  )
  const [selected, setSelected] = useState(today)
  const [collapsed, setCollapsed] = useState(false)
  /** First day of the month the month view shows. */
  const [month, setMonth] = useState(() => {
    const d = parseDay(today)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>()
    for (const s of sessions) {
      const list = map.get(s.date)
      if (list) list.push(s)
      else map.set(s.date, [s])
    }
    for (const list of map.values()) list.sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
    return map
  }, [sessions])

  const selDate = parseDay(selected)
  const monday = weekStart(selDate)
  const thisWeek = dateKey(weekStart(parseDay(today))) === dateKey(monday)

  const stepWeek = (dir: 1 | -1) => setSelected(dateKey(addDays(selDate, dir * 7)))
  const stepMonth = (dir: 1 | -1) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + dir, 1))
  const pickDay = (key: string) => {
    setSelected(key)
    setView("day")
  }
  const goToday = () => {
    setSelected(today)
    const d = parseDay(today)
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const labelDate = view === "day" ? selDate : month
  const showYear = labelDate.getFullYear() !== parseDay(today).getFullYear()
  const label = `${MONTHS[labelDate.getMonth()]}${showYear ? ` ${labelDate.getFullYear()}` : ""}`
  const offToday = view === "day" ? !thisWeek || selected !== today : month.getMonth() !== parseDay(today).getMonth()

  const back = view === "day" ? () => stepWeek(-1) : () => stepMonth(-1)
  const forward = view === "day" ? () => stepWeek(1) : () => stepMonth(1)

  return (
    <Panel
      title="حصص المباشرة"
      className="h-full"
      action={
        <button
          type="button"
          data-uisfx={collapsed ? "expand" : "collapse"} onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "افتح الروزنامة" : "سكّر الروزنامة"}
          className={iconBtnClass}
        >
          <ChevronDown className={cn("size-5 text-v2-ink/60 transition", collapsed && "rotate-180")} />
        </button>
      }
    >
      {!collapsed && (
        <div className="flex flex-1 flex-col gap-4">
          {/* Month + view switch. On a phone the step arrows live here too, so
              the strip below gets the full width for its seven days. */}
          <div className="flex items-center gap-2">
            <button type="button" data-uisfx="swipe" onClick={back} aria-label="اللّي قبل" className={cn(iconBtnClass, "size-10 sm:hidden", view === "month" && "sm:grid")}>
              <ChevronRight className="size-5" />
            </button>
            <p className="text-[calc(12px*var(--ts))] font-bold text-v2-ink md:text-[calc(13px*var(--ts))]">{label}</p>
            <button type="button" data-uisfx="swipe" onClick={forward} aria-label="اللّي بعد" className={cn(iconBtnClass, "size-10 sm:hidden", view === "month" && "sm:grid")}>
              <ChevronLeft className="size-5" />
            </button>
            {offToday && (
              <button
                type="button"
                data-uisfx="back" onClick={goToday}
                className="min-h-9 rounded-full bg-v2-brand/10 px-3 text-[calc(7.5px*var(--ts))] font-semibold text-v2-brand transition hover:bg-v2-brand/20"
              >
                رجوع لليوم
              </button>
            )}
            <ViewSwitch view={view} onChange={setView} className="ms-auto" />
          </div>

          {view === "day" ? (
            <>
              <WeekStrip
                monday={monday}
                selected={selected}
                today={today}
                byDay={byDay}
                stateFor={stateFor}
                onSelect={setSelected}
                onStep={stepWeek}
              />

              <DayList
                key={selected}
                day={selected}
                list={byDay.get(selected) ?? []}
                all={sessions}
                now={now}
                stateFor={stateFor}
                onPick={setSelected}
                onOpenDocs={onOpenDocs}
              />
            </>
          ) : (
            <MonthGrid month={month} byDay={byDay} today={today} selected={selected} stateFor={stateFor} onPick={pickDay} />
          )}
        </div>
      )}
    </Panel>
  )
}

/**
 * Seven days, Monday first, each a chip: past days fade, today keeps a ring,
 * the selected one takes the ramp, and a day with séances carries a dot (red
 * when one of them is on air). The step arrows flank it from `sm` up; on a
 * phone the caller puts them in its header so the days get the full width.
 */
export function WeekStrip({
  monday,
  selected,
  today,
  byDay,
  stateFor,
  onSelect,
  onStep,
}: {
  monday: Date
  selected: string
  today: string
  byDay: Map<string, Session[]>
  stateFor: (s: Session) => SessionState
  onSelect: (key: string) => void
  onStep: (dir: 1 | -1) => void
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button type="button" data-uisfx="swipe" onClick={() => onStep(-1)} aria-label="الجمعة اللّي فاتت" className={cn(iconBtnClass, "hidden size-9 sm:grid")}>
        <ChevronRight className="size-5 text-v2-ink/60" />
      </button>
      <div className="grid flex-1 grid-cols-7 gap-1.5 sm:gap-2">
        {WEEK_ORDER.map((_, i) => {
          const d = addDays(monday, i)
          const key = dateKey(d)
          const list = byDay.get(key) ?? []
          const hasLive = list.some((s) => stateFor(s) === "en-cours")
          const isSel = key === selected
          const isToday = key === today
          const past = key < today
          return (
            <button
              key={key}
              type="button"
              data-uisfx="select" onClick={() => onSelect(key)}
              aria-pressed={isSel}
              aria-label={`${dayLabel(key)}${list.length ? ` — ${list.length} حصص` : ""}`}
              className={cn(
                "relative flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-[10px] border text-[calc(7.5px*var(--ts))] transition md:min-h-[4.25rem]",
                isSel
                  ? "border-transparent bg-v2-grad font-semibold text-white shadow-md shadow-v2-brand/25"
                  : past
                    ? "border-v2-ink/15 text-v2-ink/40 hover:border-v2-ink/30"
                    : "border-v2-ink/45 text-v2-ink hover:border-v2-brand hover:bg-v2-brand/[0.05]",
                isToday && !isSel && "border-2 border-v2-brand font-bold",
              )}
            >
              <span className="hidden truncate sm:block">{WEEKDAYS[d.getDay()]}</span>
              <span className="sm:hidden">{WEEKDAY_LETTER[d.getDay()]}</span>
              <span className="text-[calc(8.5px*var(--ts))] tabular-nums">{pad2(d.getDate())}</span>
              {list.length > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-1.5 size-1.5 rounded-full",
                    isSel ? "bg-white" : hasLive ? "bg-v2-live" : "bg-v2-brand",
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
      <button type="button" data-uisfx="swipe" onClick={() => onStep(1)} aria-label="الجمعة الجاية" className={cn(iconBtnClass, "hidden size-9 sm:grid")}>
        <ChevronLeft className="size-5 text-v2-ink/60" />
      </button>
    </div>
  )
}

function ViewSwitch({ view, onChange, className }: { view: View; onChange: (v: View) => void; className?: string }) {
  const options: { value: View; label: string }[] = [
    { value: "day", label: "اليوم" },
    { value: "month", label: "الشهر" },
  ]
  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          data-uisfx="open"
          className={cn(
            "group flex min-h-10 min-w-[6.5rem] items-center justify-between gap-3 rounded-2xl border border-v2-ink/20 bg-v2-surface px-4 text-[calc(8.5px*var(--ts))] font-medium text-v2-ink transition hover:border-v2-brand/50 data-[state=open]:border-v2-brand/50",
            className,
          )}
        >
          {options.find((o) => o.value === view)?.label}
          <ChevronDown className="size-4 text-v2-ink/60 transition group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[9rem] rounded-2xl border border-v2-ink/15 bg-v2-surface p-1.5 text-v2-ink shadow-xl shadow-v2-ink/10"
        >
          {options.map((o) => (
            <DropdownMenu.Item
              key={o.value}
              data-uisfx="select" onSelect={() => onChange(o.value)}
              className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[calc(8.5px*var(--ts))] outline-none data-[highlighted]:bg-v2-ink/[0.05]"
            >
              {o.label}
              {o.value === view && <Check className="size-4 text-v2-brand" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/* ------------------------------------------------------------------ *
 * Day view — the séances of one day.
 * ------------------------------------------------------------------ */

export function DayList({
  day,
  list,
  all,
  now,
  stateFor,
  onPick,
  onOpenDocs,
  focusId,
}: {
  day: string
  list: Session[]
  all: Session[]
  now: Date
  stateFor: (s: Session) => SessionState
  onPick: (key: string) => void
  onOpenDocs: (session: Session, started: boolean) => void
  /** A séance picked elsewhere (a block in the week grid) — ringed here. */
  focusId?: string | null
}) {
  if (list.length === 0) {
    const next = all
      .filter((s) => s.date > day && !s.postponed)
      .sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())[0]
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-v2-ink/20 px-5 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-v2-brand/[0.08]">
          <CalendarX2 className="size-7 stroke-v2-grad" strokeWidth={1.5} />
        </span>
        <p className="mt-1 text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">
          ما عندك حتّى حصّة {relativeDay(day, now) === "اليوم" ? "اليوم" : `نهار ${relativeDay(day, now)}`}
        </p>
        <p className="text-[calc(8.5px*var(--ts))] text-v2-ink/55">نهار فاضي — فرصة باش تراجع ولّا تشوف تسجيل.</p>
        {next && (
          <button type="button" data-uisfx="forward" onClick={() => onPick(next.date)} className={cn(ctaClass, "mt-2")}>
            أقرب حصّة: {dayLabel(next.date)}
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3 md:gap-4">
      {list.map((s, i) => (
        <li key={s.id} id={`v2-ses-${s.id}`} className="rise scroll-mt-24" style={{ ["--i" as string]: i }}>
          <SessionCard session={s} state={stateFor(s)} now={now} onOpenDocs={onOpenDocs} focused={s.id === focusId} />
        </li>
      ))}
    </ul>
  )
}

export function SessionCard({
  session,
  state,
  now,
  onOpenDocs,
  focused = false,
}: {
  session: Session
  state: SessionState
  now: Date
  onOpenDocs: (session: Session, started: boolean) => void
  focused?: boolean
}) {
  const { subjectOf, teacherName } = useLookups()
  const homeworkOf = useHomeworkBySession()
  const subject = subjectOf(session)?.name ?? ""
  const teacher = teacherName(session.teacherId)
  const hw = homeworkOf(session)
  const live = state === "en-cours"

  return (
    <article
      className={cn(
        "relative rounded-2xl border p-4 transition md:p-5",
        focused && "ring-2 ring-v2-brand ring-offset-2 ring-offset-v2-surface",
        live && "border-transparent bg-v2-live-card",
        state === "prevue" && "border-v2-ink/15 hover:border-v2-brand/40",
        state === "terminee" && "border-v2-ink/15",
        state === "reportee" && "border-dashed border-v2-ink/20 bg-v2-ink/[0.02]",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="text-[calc(8.5px*var(--ts))] font-bold text-v2-ink">{dayLabel(session.date)}</p>
        <StateChip state={state} />
        <span className="ms-auto">
          {live ? (
            <span aria-hidden className="v2-onair relative block size-5 rounded-full bg-v2-live ring-4 ring-v2-surface/70" />
          ) : state === "prevue" ? (
            <Clock className="size-5 text-v2-ink/60" strokeWidth={1.75} />
          ) : null}
        </span>
      </header>

      <Link data-uisfx="open"
        to={`${BASE}/seance/${session.id}`}
        className={cn(
          "mt-3 block rounded-lg text-[calc(10.5px*var(--ts))] font-medium text-v2-ink hover:text-v2-brand",
          state === "reportee" && "text-v2-ink/50 line-through decoration-v2-ink/30",
        )}
      >
        حصّة {subject}
      </Link>
      <LatinLine className="mt-0.5 text-[calc(7.5px*var(--ts))] text-v2-ink/55">{session.title}</LatinLine>

      {state === "prevue" && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[calc(8px*var(--ts))] text-v2-ink/80">
            {relativeDay(session.date, now)} على ساعة {session.startTime}
            {teacher && ` | ${teacher}`}
          </p>
          {hw.length > 0 && (
            <button
              type="button"
              data-uisfx="open" onClick={() => onOpenDocs(session, false)}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-v2-chip-docs/15 px-3 text-[calc(7.5px*var(--ts))] font-semibold text-v2-chip-docs transition hover:bg-v2-chip-docs/25"
            >
              <Paperclip className="size-3.5" />
              {hw.length === 1 ? "عندك تمرين للحصّة هذي" : `${hw.length} تمارين للحصّة هذي`}
            </button>
          )}
        </div>
      )}

      {live && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button type="button" data-uisfx="open" onClick={() => onOpenDocs(session, true)} className={cn(ctaClass, "min-w-[14rem]")}>
            <Files className="size-5" strokeWidth={1.75} />
            الكور متع الحصّة
          </button>
        </div>
      )}

      {state === "terminee" && (
        <>
          <p className="mt-1 text-[calc(7.5px*var(--ts))] text-v2-ink/55">
            {formatTimeRange(session.startTime, session.endTime)}
            {teacher && ` | ${teacher}`}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              data-uisfx="open" onClick={() => onOpenDocs(session, true)}
              className={cn(ctaClass, "border border-v2-ink")}
            >
              <FileCheck2 className="size-5" strokeWidth={1.75} />
              وثائق الحصّة
            </button>
            {session.recordingUrl ? (
              // Straight to the player: the button promises the replay, so it
              // shouldn't stop at the séance page on the way.
              <Link data-uisfx="play" to={v2VideoPath(session.id, { subjectId: session.subjectIds[0] })} className={liveOutlineClass}>
                <CirclePlay className="size-5" strokeWidth={1.75} />
                شوف التسجيل
              </Link>
            ) : (
              <span
                aria-disabled
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dashed border-v2-ink/25 px-5 text-[calc(9px*var(--ts))] font-medium text-v2-ink/50"
              >
                <Clock className="size-4" />
                التسجيل يوصل قريب
              </span>
            )}
          </div>
        </>
      )}

      {state === "reportee" && (
        <p className="mt-2 text-[calc(8px*var(--ts))] text-v2-ink/60">
          الحصّة هذي تأجّلت — الموعد الجديد يوصلك في إشعار.
        </p>
      )}
    </article>
  )
}

export function StateChip({ state }: { state: SessionState }) {
  if (state === "en-cours") {
    return (
      <span className="rounded-full border border-v2-live p-[3px]">
        <span className="block rounded-full border border-dashed border-v2-live-strong bg-v2-live/20 px-2.5 text-[calc(7.5px*var(--ts))] font-bold leading-5 text-v2-live-strong">
          مباشر الآن
        </span>
      </span>
    )
  }
  if (state === "terminee") {
    return (
      <span className="rounded-full border border-v2-done-line px-3 text-[calc(7.5px*var(--ts))] font-semibold leading-6 text-v2-done">
        انتهت
      </span>
    )
  }
  if (state === "reportee") {
    return (
      <span className="rounded-full bg-v2-ink/[0.07] px-3 text-[calc(7.5px*var(--ts))] font-semibold leading-6 text-v2-ink/60">
        تأجلت
      </span>
    )
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Month view — the frame's « Calendar months ».
 * ------------------------------------------------------------------ */

function MonthGrid({
  month,
  byDay,
  today,
  selected,
  stateFor,
  onPick,
}: {
  month: Date
  byDay: Map<string, Session[]>
  today: string
  selected: string
  stateFor: (s: Session) => SessionState
  onPick: (key: string) => void
}) {
  const { subjectOf } = useLookups()
  const first = weekStart(month)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const weeks = Math.ceil((last.getTime() - first.getTime()) / (7 * 86_400_000) + 1 / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i))
  const count = [...byDay.keys()].filter((k) => k.startsWith(`${month.getFullYear()}-${pad2(month.getMonth() + 1)}`))
    .reduce((n, k) => n + (byDay.get(k)?.length ?? 0), 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {WEEK_ORDER.map((wd) => (
          <p key={wd} className="text-center text-[calc(7px*var(--ts))] font-medium text-v2-ink/55">
            <span className="hidden sm:inline">{WEEKDAYS[wd]}</span>
            <span className="sm:hidden">{WEEKDAY_LETTER[wd]}</span>
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {cells.map((d) => {
          const key = dateKey(d)
          const inMonth = d.getMonth() === month.getMonth()
          const list = byDay.get(key) ?? []
          const isToday = key === today
          const isSel = key === selected
          const liveHere = list.some((s) => stateFor(s) === "en-cours")
          return (
            <button
              key={key}
              type="button"
              data-uisfx="select" onClick={() => onPick(key)}
              aria-label={`${dayLabel(key)}${list.length ? ` — ${list.length} حصص` : ""}`}
              className={cn(
                "flex min-h-12 flex-col items-stretch gap-1 rounded-xl border p-1.5 text-start transition md:min-h-[4.75rem]",
                list.length > 0 ? "border-v2-brand/30 bg-v2-brand/[0.1] hover:bg-v2-brand/[0.16]" : "border-v2-ink/15 hover:border-v2-ink/35",
                !inMonth && "opacity-35",
                isToday && "border-2 border-v2-brand",
                isSel && "ring-2 ring-v2-brand/40 ring-offset-1 ring-offset-v2-surface",
              )}
            >
              <span
                className={cn(
                  "text-[calc(7.5px*var(--ts))] tabular-nums",
                  key < today ? "text-v2-ink/45" : "font-semibold text-v2-ink",
                )}
              >
                {pad2(d.getDate())}
              </span>
              {/* Phone: dots. Wider: the first séance's matière, then « +n ». */}
              {list.length > 0 && (
                <>
                  <span className="flex flex-wrap gap-0.5 md:hidden">
                    {list.slice(0, 3).map((s) => (
                      <span key={s.id} className={cn("size-1.5 rounded-full", liveHere ? "bg-v2-live" : "bg-v2-brand")} />
                    ))}
                  </span>
                  <span className="hidden flex-col gap-0.5 md:flex">
                    <span
                      className={cn(
                        "truncate rounded-md px-1.5 text-[calc(6.5px*var(--ts))] font-medium leading-5",
                        liveHere ? "bg-v2-live/20 text-v2-live-strong" : "bg-v2-surface/80 text-v2-ink",
                      )}
                    >
                      {liveHere ? "مباشر" : (subjectOf(list[0])?.name ?? "")}
                    </span>
                    {list.length > 1 && (
                      <span className="text-[calc(6.5px*var(--ts))] text-v2-ink/55">+{list.length - 1}</span>
                    )}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-[calc(7.5px*var(--ts))] text-v2-ink/55">
        {count === 0 ? "ما فمّا حتّى حصّة الشهر هذا." : `${count} حصص في ${MONTHS[month.getMonth()]} — إضغط على نهار باش تشوف حصصو.`}
      </p>
    </div>
  )
}
