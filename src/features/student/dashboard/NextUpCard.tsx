import { Link } from "react-router-dom"
import { CalendarCheck2, CalendarOff, ChevronLeft, UserRound, Video } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { dateKey } from "@/features/student/calendar/schedule"
import { type UpNextItem } from "@/features/student/dashboard/dashboard"
import { subjectTint } from "@/features/student/subjectTint"
import { cn, formatSessionDay } from "@/lib/utils"
import { useData } from "@/stores/useData"

/**
 * The dashboard's first card: WHERE THE ÉLÈVE HAS TO BE NEXT.
 *
 * The day and the hour are said once, in the kicker, and that is the whole of
 * the timing — no countdown, no durée, no salle. The élève reads this card to
 * know WHAT is next and to get INTO it; the roznama is where the logistics
 * live. A séance en direct takes the card over in red with a join button — the
 * whole point of a live is that it is worthless five minutes late — while a
 * séance in the salle gets the calm brand treatment and points at the roznama.
 *
 * Referenced for spacing & density: DayList (kicker → title → meta order,
 * the live/prévue colour split), SeanceSubjectScreen (matière glyph on its own
 * measured tint), FinanceScreen (footer action row).
 */
export function NextUpCard({ item, now }: { item: UpNextItem | null; now: Date }) {
  const subjects = useData((s) => s.subjects)
  const teachers = useData((s) => s.teachers)

  /* Nothing ahead — a real state, and a calm one. */
  if (!item) {
    return (
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-neutral-100 text-ink-muted">
            <CalendarOff className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[calc(16px*var(--ts))] font-bold text-ink">
              ما فماش حصّة جايّة
            </p>
            <p className="mt-0.5 text-[calc(12.5px*var(--ts))] text-ink-muted">
              ما فماش شيء مبرمج توّا — استغلّ الوقت وشوف حصّة مسجّلة.
            </p>
          </div>
          <Link
            to="/student/calendrier"
            className="hidden shrink-0 items-center gap-1 text-[calc(13px*var(--ts))] font-medium text-brand-600 transition hover:text-brand-700 sm:inline-flex"
          >
            الروزنامة <ChevronLeft className="size-4" />
          </Link>
        </div>
      </section>
    )
  }

  const live = item.kind === "live"
  // Started but not finished — the card only needs the flag, not the delta.
  const running = item.start.getTime() <= now.getTime()

  const subjectId = item.kind === "live" ? item.live.subjectIds[0] : item.session.subjectIds[0]
  const subject = subjects.find((s) => s.id === subjectId)
  const tint = subjectTint(subject?.name ?? "", subject?.category)

  const title = item.kind === "live" ? item.live.name : item.session.title
  const date = item.kind === "live" ? item.live.date : item.session.date
  const startTime = item.kind === "live" ? item.live.startTime : item.session.startTime
  const teacher =
    item.kind === "seance"
      ? teachers.find((t) => t.id === item.session.teacherId)?.name
      : undefined
  const isToday = date === dateKey(now)
  const when = isToday
    ? `اليوم على ${startTime}`
    : `${formatSessionDay(date)} على ${startTime}`

  // A live already running is the loud case; anything else stays calm, even a
  // séance in progress — the élève is already in the room for that one.
  const hot = live && running

  return (
    <section
      className={cn(
        "rounded-xl border bg-surface p-4 shadow-sm transition md:p-5",
        hot ? "border-danger-500/45 ring-2 ring-danger-500/15" : "border-border",
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* The matière's own drawing, on its own measured tint. */}
        <span
          className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg md:size-[72px]"
          style={{ backgroundColor: tint.panel }}
        >
          <span
            className="absolute size-14 rounded-full blur-2xl"
            style={{ backgroundColor: tint.halo }}
          />
          {subject ? (
            <SubjectIcon name={subject.name} className="relative size-14 md:size-16" />
          ) : (
            <CalendarCheck2 className="relative size-6 text-ink-muted" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "flex items-center gap-1.5 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em]",
              hot ? "text-danger-600" : live ? "text-brand-600" : "text-accent2-600",
            )}
          >
            {hot && (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-danger-500 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-danger-500" />
              </span>
            )}
            <span className="shrink-0 whitespace-nowrap">
              {hot
                ? "قاعدة توّا — مباشر"
                : running
                  ? "قاعدة توّا"
                  : live
                    ? "حصّة مباشرة"
                    : "الحصّة الجايّة"}
            </span>
            <span className="truncate font-normal normal-case tracking-normal text-ink-muted">
              · {when}
            </span>
          </p>

          {/* LA MATIÈRE EN GRAND, le chapitre en dessous — même ordre de lecture
              que les cartes de la roznama et de l'agenda du tableau de bord. */}
          <h2
            dir="auto"
            title={title}
            className="mt-1 font-display text-[calc(17px*var(--ts))] font-bold leading-snug text-ink line-clamp-2 md:text-[calc(19px*var(--ts))]"
          >
            {subject?.name ?? title}
          </h2>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[calc(12px*var(--ts))] text-ink-muted">
            {subject && <span dir="auto">{title}</span>}
            {teacher && (
              <>
                <span>·</span>
                <span dir="auto" className="inline-flex items-center gap-1">
                  <UserRound className="size-3.5" />
                  {teacher}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Only a live has an action — you JOIN a live, you just show up to a
          séance. Full width on a phone so it stays the obvious move. */}
      {item.kind === "live" && (
        <div className="mt-4 flex border-t border-border pt-3.5 sm:justify-end">
          <a
            href={item.live.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-ink-inverted shadow-brand transition hover:brightness-105 sm:flex-none",
              hot ? "bg-danger-500 shadow-none hover:bg-danger-600" : "bg-grad",
            )}
          >
            <Video className="size-4" />
            {hot ? "أدخل توّا" : "أدخل للحصّة"}
          </a>
        </div>
      )}
    </section>
  )
}
