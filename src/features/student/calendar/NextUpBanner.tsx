import { CalendarCheck2, CalendarOff, ChevronLeft, NotebookPen, Radio } from "lucide-react"
import { HomeworkDot } from "@/features/student/calendar/HomeworkDot"
import {
  TICKING_WINDOW_MS,
  dateKey,
  formatAway,
  formatCountdown,
  useHomeworkBySession,
  useSecond,
  useSessionVisual,
  type UpNext,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDay } from "@/lib/utils"
import type { Session } from "@/data/types"

export interface NextUpBannerProps {
  /** The séance the élève is heading towards — null when nothing is left. */
  upNext: UpNext | null
  now: Date
  onOpen: (session: Session) => void
}

/**
 * The one line the élève reads before anything else — and it is about ONE thing:
 * the next séance. Its title, what it covers, and how long until it starts, as a
 * real ticking countdown while it's close enough to matter. Nothing else earns a
 * place here; the day's totals live above the timeline, where the day itself is.
 *
 * A séance already running takes the banner over in red and counts DOWN to the
 * end instead of up to the start. The whole banner is the target, not a small
 * link inside it — the élève's next move is almost always "open that séance".
 *
 * Referenced for spacing & density: SessionCard (icon + title + meta order),
 * DayTimeline (state colours), StatTile (the figure on the end).
 */
export function NextUpBanner({ upNext, now, onOpen }: NextUpBannerProps) {
  const visual = useSessionVisual()
  const homeworkOf = useHomeworkBySession()
  const target = upNext ? (upNext.live ? upNext.endsIn : upNext.startsIn) : 0
  const ticking = Boolean(upNext) && target < TICKING_WINDOW_MS
  useSecond(ticking)

  /* Nothing left at all — the calendar is genuinely clear. */
  if (!upNext) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm sm:p-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-neutral-100 text-ink-muted">
          <CalendarOff className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">ما فماش حصص جايّة</p>
          <p className="text-[calc(12px*var(--ts))] text-ink-muted">
            ما فماش شيء مبرمج توّا — استغلّ الوقت وراجع فصل.
          </p>
        </div>
      </div>
    )
  }

  const { session, live } = upNext
  // Recomputed on every heartbeat — `now` only refreshes each minute.
  const remaining = (live ? upNext.endsIn : upNext.startsIn) - (Date.now() - now.getTime())
  const { subjectName } = visual(session)
  const homeworks = homeworkOf(session)
  const isToday = session.date === dateKey(now)

  // What it covers, or failing that where it sits — never an empty second line.
  const subtitle =
    session.description ?? [subjectName, session.room].filter(Boolean).join(" · ")

  const when = isToday
    ? `اليوم على ${session.startTime}`
    : `${formatSessionDay(session.date)} على ${session.startTime}`

  return (
    <button
      type="button"
      onClick={() => onOpen(session)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border p-3 text-start shadow-sm transition sm:gap-3.5 sm:p-3.5",
        "hover:shadow-md motion-safe:hover:-translate-y-0.5",
        live
          ? "border-danger-500/45 bg-surface ring-2 ring-danger-500/15"
          : "border-border bg-surface hover:border-brand-200",
      )}
    >
      <span
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-md",
          live ? "bg-danger-50 text-danger-600" : "bg-grad text-ink-inverted shadow-brand",
        )}
      >
        {live ? <Radio className="size-5" /> : <CalendarCheck2 className="size-5" />}
        {/* The banner is the loudest card on the page — its dot gets the ring
            that lifts it off the gradient. */}
        <HomeworkDot
          count={homeworks.length}
          className="absolute -end-1 -top-1 size-3 ring-2 ring-surface"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "flex items-center gap-1.5 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em]",
            live ? "text-danger-600" : "text-accent2-600",
          )}
        >
          {live && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-danger-500 motion-safe:animate-ping" />
              <span className="relative inline-flex size-1.5 rounded-full bg-danger-500" />
            </span>
          )}
          <span className="shrink-0 whitespace-nowrap">
            {live ? "حصّة قاعدة" : "الحصّة الجايّة"}
          </span>
          {/* At ~390px the kicker already fills its column. While the countdown
              is ticking it answers "when" on its own, so the date only comes
              back on mobile once the countdown falls back to words. */}
          <span
            className={cn(
              "truncate font-normal normal-case tracking-normal text-ink-muted",
              ticking && "hidden sm:inline",
            )}
          >
            · {when}
          </span>
        </span>

        <span
          dir="auto"
          className="mt-0.5 block truncate font-display text-[calc(15px*var(--ts))] font-bold text-ink sm:text-base"
        >
          {session.title}
        </span>

        {/* The one place the dot gets words: this is the séance the élève is
            about to walk into, so "there is work to hand in" is worth a chip. */}
        <span className="mt-0.5 flex items-center gap-1.5">
          <span dir="auto" className="min-w-0 truncate text-[calc(12px*var(--ts))] text-ink-muted">
            {subtitle || "حصّة جايّة"}
          </span>
          {homeworks.length > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-danger-50 px-1.5 py-0.5 text-[calc(10.5px*var(--ts))] font-medium text-danger-700">
              <NotebookPen className="size-3" />
              {homeworks.length === 1 ? "خدمة تتعمل" : `${homeworks.length} خدمات`}
            </span>
          )}
        </span>
      </span>

      <span className="shrink-0 text-end">
        <span
          className={cn(
            "block font-display font-bold tabular-nums leading-none",
            ticking ? "text-[calc(20px*var(--ts))] sm:text-[calc(24px*var(--ts))]" : "text-[calc(15px*var(--ts))] sm:text-[calc(17px*var(--ts))]",
            live ? "text-danger-600" : "text-brand-600",
          )}
        >
          {ticking ? formatCountdown(remaining) : formatAway(remaining).replace(/^بعد /, "")}
        </span>
        <span className="mt-1 block text-[calc(10.5px*var(--ts))] font-medium uppercase tracking-[.1em] text-ink-muted">
          {live ? "قبل النهاية" : "قبل البداية"}
        </span>
      </span>

      <ChevronLeft className="hidden size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600 sm:block" />
    </button>
  )
}
