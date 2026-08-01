import { useEffect, useState } from "react"
import { CalendarCheck2, CalendarOff, ChevronRight, Radio } from "lucide-react"
import {
  dateKey,
  formatAway,
  formatCountdown,
  useSessionVisual,
  type UpNext,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDay } from "@/lib/utils"
import type { Session } from "@/data/types"

/** Below this, the wait is worth watching tick by tick. */
const TICKING_WINDOW_MS = 12 * 60 * 60 * 1000

/** One-second heartbeat — only mounted while a countdown is actually on screen. */
function useSecond(enabled: boolean): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [enabled])
  return tick
}

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
          <p className="font-display text-[15px] font-bold text-ink">Aucune séance à venir</p>
          <p className="text-[12px] text-ink-muted">
            Rien de programmé pour l’instant — profites-en pour réviser un chapitre.
          </p>
        </div>
      </div>
    )
  }

  const { session, live } = upNext
  // Recomputed on every heartbeat — `now` only refreshes each minute.
  const remaining = (live ? upNext.endsIn : upNext.startsIn) - (Date.now() - now.getTime())
  const { subjectName } = visual(session)
  const isToday = session.date === dateKey(now)

  // What it covers, or failing that where it sits — never an empty second line.
  const subtitle =
    session.description ?? [subjectName, session.room].filter(Boolean).join(" · ")

  const when = isToday
    ? `aujourd’hui à ${session.startTime}`
    : `${formatSessionDay(session.date)} à ${session.startTime}`

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
          "grid size-11 shrink-0 place-items-center rounded-md",
          live ? "bg-danger-50 text-danger-600" : "bg-grad text-ink-inverted shadow-brand",
        )}
      >
        {live ? <Radio className="size-5" /> : <CalendarCheck2 className="size-5" />}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.12em]",
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
            {live ? "Séance en cours" : "Prochaine séance"}
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
          className="mt-0.5 block truncate font-display text-[15px] font-bold text-ink sm:text-base"
        >
          {session.title}
        </span>

        <span dir="auto" className="mt-0.5 block truncate text-[12px] text-ink-muted">
          {subtitle || "Séance à venir"}
        </span>
      </span>

      <span className="shrink-0 text-end">
        <span
          className={cn(
            "block font-display font-bold tabular-nums leading-none",
            ticking ? "text-[20px] sm:text-[24px]" : "text-[15px] sm:text-[17px]",
            live ? "text-danger-600" : "text-brand-600",
          )}
        >
          {ticking ? formatCountdown(remaining) : formatAway(remaining).replace(/^dans /, "")}
        </span>
        <span className="mt-1 block text-[10.5px] font-medium uppercase tracking-[.1em] text-ink-muted">
          {live ? "avant la fin" : "avant le début"}
        </span>
      </span>

      <ChevronRight className="hidden size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600 sm:block" />
    </button>
  )
}
