import { useMemo } from "react"
import { Link } from "react-router-dom"
import { CheckCheck, ChevronLeft, Download } from "lucide-react"
import { HomeworkIcon } from "@/components/icons/HomeworkIcon"
import { EmptyState } from "@/components/kit/EmptyState"
import { dateKey, useNow } from "@/features/student/calendar/schedule"
import { useMyHomeworks } from "@/features/student/dashboard/dashboard"
import { profName } from "@/features/student/homework"
import { pdfFileName, pdfSrc } from "@/data/media"
import { formatSessionDay, formatSessionDayLong } from "@/lib/utils"
import type { Homework, Session } from "@/data/types"
import { useData } from "@/stores/useData"

/**
 * Élève — « تمارين لازم تخدمهم », the work that is still ahead, by day.
 *
 * The dashboard's panel of the same name is a PACKING LIST — the documents due
 * for today's remaining séances and nothing else. Its title opens this page,
 * which answers the question that panel leaves open: « et le reste ? »
 *
 * DELIBERATELY THIN. One line per خدمة: the séance it belongs to, when that
 * séance is, who sent it, and the button that hands the file over. No matière
 * artwork, no note, no counts, no state chips — this is a page an élève opens
 * to DOWNLOAD something, and every element that isn't the name, the day or the
 * button is one more thing between them and the file. The roznama is where a
 * séance is read about; here it is only being identified.
 *
 * ONLY WHAT IS COMING. Work whose day has passed is gone from this page, and so
 * is work with no day at all: a queue built out of deadlines can only rank
 * things that have one, and « en retard » is a scolding the prototype has no
 * business delivering. The day groups run from today forward, one under the
 * other, « اليوم » and « غدوة » named rather than dated because that is how the
 * two days that matter are spoken about.
 *
 * Referenced for spacing & density: StudentSeancesScreen (breadcrumb, title,
 * section rhythm), HomeworkList (the document row and its download plate).
 */

interface DayGroup {
  day: string
  label: string
  items: Homework[]
}

/** Local "YYYY-MM-DD" + n days, for the « غدوة » test. */
function dayAfter(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00`)
  d.setDate(d.getDate() + days)
  return dateKey(d)
}

export default function StudentHomeworksScreen() {
  const now = useNow()
  const today = dateKey(now)
  const homeworks = useMyHomeworks()
  const sessions = useData((s) => s.sessions)

  /**
   * The queue, cut into days. A خدمة belongs to the day it has to be ready —
   * its `dueDate`, or, for work that only says « pour le cours de jeudi », the
   * day of the séance it hangs on. Anything before today, or with no day at
   * all, doesn't belong on a page about what is coming.
   */
  const groups = useMemo(() => {
    const byId = new Map(sessions.map((s) => [s.id, s]))
    const days = new Map<string, Homework[]>()

    for (const h of homeworks) {
      const day = h.dueDate ?? (h.sessionId ? byId.get(h.sessionId)?.date : undefined)
      if (!day || day < today) continue
      const list = days.get(day)
      if (list) list.push(h)
      else days.set(day, [h])
    }

    return [...days.keys()].sort().map<DayGroup>((day) => ({
      day,
      label:
        day === today ? "اليوم" : day === dayAfter(today, 1) ? "غدوة" : formatSessionDayLong(day),
      items: days.get(day)!,
    }))
  }, [homeworks, sessions, today])

  return (
    <div className="flex flex-col gap-5">
      <nav
        aria-label="مسار التنقّل"
        className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted"
      >
        <Link to="/student" className="transition hover:text-brand-600">
          الصفحة الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">تمارين لازم تخدمهم</span>
      </nav>

      {/* The identity block. The glyph is the delivered notepad — drawn bare
          rather than on a plate, the way the matière book rides the header of a
          matière: these illustrations carry their own colour, and a tinted
          square behind one only mutes it. */}
      <div className="flex items-center gap-3">
        <HomeworkIcon className="h-12 w-auto shrink-0 md:h-14" />
        <div className="min-w-0">
          <h1 className="font-display text-[calc(22px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]">
            تمارين لازم تخدمهم
          </h1>
          <p className="mt-0.5 text-[calc(13px*var(--ts))] text-ink-muted">
            الخدمة الجايّة، مرتّبة على النهارات.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface">
          <EmptyState
            icon={CheckCheck}
            title="ما فماش خدمة تستنّاك"
            description="كي يبعثلك بروف تمارين، تلقاهم هوني مرتّبين على النهارات."
            action={
              <Link
                to="/student/calendrier"
                className="mt-1 inline-flex min-h-11 items-center gap-1 text-[calc(13px*var(--ts))] font-medium text-brand-600 transition hover:opacity-70"
              >
                شوف الروزنامة <ChevronLeft className="size-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section key={group.day} className="flex flex-col gap-2">
              {/* The heading is a rule across the page: the groups stack with
                  nothing between them, and the line running out of the day's
                  name is what tells the eye where one day stops. */}
              <div className="flex items-center gap-3">
                <h2 className="shrink-0 font-display text-[calc(15px*var(--ts))] font-bold leading-tight text-ink first-letter:uppercase md:text-[calc(17px*var(--ts))]">
                  {group.label}
                </h2>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>

              <ul className="flex flex-col gap-2">
                {group.items.map((homework) => (
                  <HomeworkRow key={homework.id} homework={homework} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * ONE خدمة — the séance, the day, the prof, the file.
 *
 * The séance NAMES the work: « تمارين على التكاملات » is what the prof called
 * the document, but « Exercices de synthèse — analyse » is the class the élève
 * is walking into with it, and that is the thing they are looking for on this
 * page. Work attached to no séance falls back to its own title rather than
 * showing an empty line.
 *
 * The file name only appears when there is more than one document — with a
 * single file the button is unambiguous, and « تحميل » is shorter than any
 * filename.
 */
function HomeworkRow({ homework }: { homework: Homework }) {
  const teachers = useData((s) => s.teachers)
  const sessions = useData((s) => s.sessions)

  const teacher = teachers.find((t) => t.id === homework.teacherId)
  const session: Session | undefined = homework.sessionId
    ? sessions.find((s) => s.id === homework.sessionId)
    : undefined
  const day = homework.dueDate ?? session?.date
  const many = homework.pdfs.length > 1

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition hover:border-brand-200 md:p-4">
      {/* The page's own mark, once per line. It is the SAME drawing on every
          card on purpose — every line here is the same kind of thing, so the
          icon is not sorting anything, it is giving the row a left edge to
          start from and tying the card to the page it lives on. Sized by
          HEIGHT: the notepad is portrait, and a square box would letterbox it
          into something smaller than the space it was given. */}
      <HomeworkIcon className="h-9 w-auto shrink-0 md:h-10" />

      <div className="min-w-[12rem] flex-1">
        <p
          dir="auto"
          className="font-display text-[calc(14px*var(--ts))] font-bold leading-snug text-ink md:text-[calc(15px*var(--ts))]"
        >
          {session?.title ?? homework.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[calc(12px*var(--ts))] text-ink-muted">
          {day && <span className="num">{formatSessionDay(day)}</span>}
          {session && (
            <>
              <span aria-hidden>·</span>
              <span className="num">{session.startTime}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span dir="auto">{profName(teacher)}</span>
        </p>
      </div>

      {/* The whole point of the row. Full width under the text on a phone,
          parked on the end once there is room for it. */}
      <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
        {homework.pdfs.map((pdf, i) => (
          <a
            key={`${homework.id}#${i}`}
            href={pdfSrc(pdf)}
            download={pdfFileName(pdf.name)}
            title={pdf.name}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-brand-200 px-3.5 text-[calc(12.5px*var(--ts))] font-bold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] sm:min-h-10 sm:flex-none"
          >
            <Download className="size-4 shrink-0" />
            <span dir="auto" className="truncate sm:max-w-[11rem]">
              {many ? pdf.name : "تحميل"}
            </span>
          </a>
        ))}
      </div>
    </li>
  )
}
