import { CalendarX2, ChevronLeft, CirclePlay, Paperclip } from "lucide-react"
import type { Session } from "@/data/types"
import {
  addDays,
  dateKey,
  minutesNow,
  minutesOf,
  useHomeworkBySession,
  type SessionState,
} from "@/features/student/calendar/schedule"
import { cn, formatTimeRange } from "@/lib/utils"
import { WEEKDAYS, dayLabel, pad2, useLookups } from "../lib"
import { ctaClass } from "../ui"

/** Vertical scale: an hour is 68px — a 60-minute séance still fits its time and a two-line name. */
const HOUR_PX = 68
/** The window always drawn, stretched to whatever the week needs. */
const DEFAULT_FROM = 8
const DEFAULT_TO = 17

/**
 * The week as a time grid — hours down the start edge, one column per day,
 * each séance drawn at its real time for its real length. Read in the Figma's
 * palette (the frame's teal plate for a séance, red for on air) with the
 * layout of the reference week view: today's column tinted, the selected day
 * underlined, a red « now » line across today.
 *
 * Monday → Saturday, the school week. Sunday only gets a column when something
 * is actually on it, so it never costs the other six their width for nothing.
 *
 * Picking: a click anywhere in a column selects that day; a click on a séance
 * selects its day AND points at it in the list under the grid.
 */
export function WeekGrid({
  monday,
  byDay,
  today,
  selected,
  now,
  stateFor,
  onSelect,
  onOpen,
  nextAfter,
}: {
  monday: Date
  byDay: Map<string, Session[]>
  today: string
  selected: string
  now: Date
  stateFor: (s: Session) => SessionState
  onSelect: (key: string) => void
  onOpen: (s: Session) => void
  /** The first séance after this week — the empty week's way out. */
  nextAfter: Session | null
}) {
  const sunday = dateKey(addDays(monday, 6))
  const days = Array.from({ length: byDay.get(sunday)?.length ? 7 : 6 }, (_, i) => addDays(monday, i))
  const week = days.flatMap((d) => byDay.get(dateKey(d)) ?? [])

  const nowMin = minutesNow(now)
  const todayInWeek = days.some((d) => dateKey(d) === today)
  let from = DEFAULT_FROM
  let to = DEFAULT_TO
  for (const s of week) {
    from = Math.min(from, Math.floor(minutesOf(s.startTime) / 60))
    to = Math.max(to, Math.ceil(minutesOf(s.endTime) / 60))
  }
  if (todayInWeek && nowMin >= from * 60 - 60 && nowMin <= to * 60 + 60) {
    from = Math.min(from, Math.floor(nowMin / 60))
    to = Math.max(to, Math.ceil(nowMin / 60))
  }
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const y = (min: number) => ((min - from * 60) / 60) * HOUR_PX
  const cols = `3.5rem repeat(${days.length}, minmax(0, 1fr))`
  // The hour lines, painted as the columns' own background — one gradient
  // instead of a DOM node per line per day.
  const lines = {
    backgroundImage: `repeating-linear-gradient(to bottom, color-mix(in srgb, var(--v2-ink) 9%, transparent) 0 1px, transparent 1px ${HOUR_PX}px)`,
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="min-w-[40rem]">
        {/* Day heads */}
        <div className="grid" style={{ gridTemplateColumns: cols }}>
          <span />
          {days.map((d) => {
            const key = dateKey(d)
            const isToday = key === today
            const isSel = key === selected
            const n = byDay.get(key)?.length ?? 0
            return (
              <button
                key={key}
                type="button"
                data-uisfx="select" onClick={() => onSelect(key)}
                aria-pressed={isSel}
                aria-label={`${dayLabel(key)}${n ? ` — ${n} حصص` : ""}`}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-t-xl pb-2 pt-1 transition hover:bg-v2-ink/[0.03]",
                  key < today && !isSel && "opacity-55",
                )}
              >
                <span className={cn("text-[calc(7.5px*var(--ts))]", isSel ? "font-bold text-v2-ink" : "text-v2-ink/55")}>
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-[calc(9.5px*var(--ts))] font-bold tabular-nums",
                    isToday ? "bg-v2-grad text-white shadow-md shadow-v2-brand/30" : "text-v2-ink",
                  )}
                >
                  {pad2(d.getDate())}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-v2-grad transition-opacity",
                    isSel ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div
          className="relative grid border-t border-v2-ink/10"
          style={{ gridTemplateColumns: cols, height: (to - from) * HOUR_PX }}
        >
          {/* Hour labels, on the start edge. */}
          <div className="relative">
            {hours.map((h, i) => (
              <span
                key={h}
                className={cn(
                  "absolute end-2 text-[calc(7px*var(--ts))] tabular-nums text-v2-ink/45",
                  i === 0 ? "top-1" : "-translate-y-1/2",
                )}
                style={i === 0 ? undefined : { top: i * HOUR_PX }}
              >
                {pad2(h)}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const key = dateKey(d)
            const isToday = key === today
            const list = byDay.get(key) ?? []
            return (
              <div
                key={key}
                className={cn("relative border-s border-v2-ink/10", isToday && "bg-v2-brand/[0.06]")}
                style={lines}
              >
                {/* The column itself picks the day; séances sit above it. */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  data-uisfx="select" onClick={() => onSelect(key)}
                  className="absolute inset-0 cursor-pointer"
                />
                {list.map((s) => (
                  <Block
                    key={s.id}
                    session={s}
                    state={stateFor(s)}
                    top={y(minutesOf(s.startTime))}
                    height={Math.max(y(minutesOf(s.endTime)) - y(minutesOf(s.startTime)), 52)}
                    onOpen={() => onOpen(s)}
                  />
                ))}
                {isToday && nowMin >= from * 60 && nowMin <= to * 60 && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 z-20" style={{ top: y(nowMin) }}>
                    <div className="h-0.5 bg-v2-live" />
                    <span className="absolute -start-1.5 -top-[5px] size-3 rounded-full bg-v2-live ring-2 ring-v2-surface" />
                  </div>
                )}
              </div>
            )
          })}

          {week.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
              <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-3xl border border-v2-ink/10 bg-v2-surface/95 px-8 py-7 text-center shadow-lg shadow-v2-ink/5">
                <span className="grid size-14 place-items-center rounded-full bg-v2-brand/[0.08]">
                  <CalendarX2 className="size-7 stroke-v2-grad" strokeWidth={1.5} />
                </span>
                <p className="mt-1 text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">ما عندك حتّى حصّة الجمعة هذي</p>
                <p className="text-[calc(8.5px*var(--ts))] text-v2-ink/55">أسبوع فاضي — وقت باش تراجع ولّا تشوف تسجيلات.</p>
                {nextAfter && (
                  <button type="button" data-uisfx="forward" onClick={() => onSelect(nextAfter.date)} className={cn(ctaClass, "mt-2")}>
                    أقرب حصّة: {dayLabel(nextAfter.date)}
                    <ChevronLeft className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** One séance on the grid, dressed for its state. */
function Block({
  session,
  state,
  top,
  height,
  onOpen,
}: {
  session: Session
  state: SessionState
  top: number
  height: number
  onOpen: () => void
}) {
  const { subjectOf, teacherName } = useLookups()
  const homeworkOf = useHomeworkBySession()
  const hw = homeworkOf(session).length > 0
  const live = state === "en-cours"
  const roomy = height >= 88

  return (
    <button
      type="button"
      data-uisfx="focus" onClick={onOpen}
      aria-label={`حصّة ${subjectOf(session)?.name ?? ""} — ${dayLabel(session.date)} ${session.startTime}`}
      className={cn(
        "group absolute inset-x-1 z-10 flex flex-col overflow-hidden rounded-xl border-s-[3px] px-2 py-1.5 text-start transition hover:z-30 hover:shadow-lg hover:shadow-v2-ink/10 focus-visible:outline-2 focus-visible:outline-v2-brand",
        live && "border-v2-live bg-v2-live-card",
        state === "prevue" && "border-v2-brand bg-v2-live-card hover:brightness-[1.03]",
        state === "terminee" && "border-v2-ink/25 bg-v2-ink/[0.045]",
        state === "reportee" && "border-v2-done bg-v2-done/[0.08] outline-1 outline-dashed outline-v2-done-line -outline-offset-1",
      )}
      style={{ top: top + 2, height: height - 4 }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[calc(7px*var(--ts))] tabular-nums",
            state === "terminee" || state === "reportee" ? "text-v2-ink/50" : "font-semibold text-v2-ink/80",
            state === "reportee" && "line-through",
          )}
        >
          {formatTimeRange(session.startTime, session.endTime)}
        </span>
        <span className="ms-auto flex items-center gap-1">
          {hw && state !== "terminee" && <Paperclip className="size-3.5 text-v2-chip-docs" strokeWidth={2} />}
          {live && <span className="v2-onair relative block size-2.5 rounded-full bg-v2-live" />}
          {state === "terminee" && session.recordingUrl && <CirclePlay className="size-3.5 text-v2-live" strokeWidth={2} />}
        </span>
      </span>
      <span
        className={cn(
          "mt-0.5 line-clamp-2 text-[calc(8.5px*var(--ts))] font-bold leading-tight",
          state === "terminee" ? "text-v2-ink/55" : "text-v2-ink",
          state === "reportee" && "text-v2-ink/50 line-through decoration-v2-ink/30",
        )}
      >
        حصّة {subjectOf(session)?.name}
      </span>
      {live && (
        <span className="mt-auto w-fit rounded-full bg-v2-live px-2 text-[calc(6.5px*var(--ts))] font-bold leading-4 text-white">
          مباشر الآن
        </span>
      )}
      {state === "reportee" && (
        <span className="mt-auto w-fit rounded-full bg-v2-done/15 px-2 text-[calc(6.5px*var(--ts))] font-bold leading-4 text-v2-done">
          تأجلت
        </span>
      )}
      {roomy && state === "prevue" && (
        <span className="mt-auto truncate text-[calc(6.5px*var(--ts))] text-v2-ink/60">{teacherName(session.teacherId)}</span>
      )}
    </button>
  )
}
