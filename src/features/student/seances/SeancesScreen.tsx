import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CalendarRange, ChevronLeft, MonitorPlay, Play } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, badgeFor } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
import {
  academicYearsOf,
  useMyPastSessions,
  yearFromSlug,
  yearSlug,
} from "@/features/student/seances/replays"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/** Stable empty array so the memos below don't see a new dep every render. */
const NO_YEARS: string[] = []

/**
 * Élève — « Séances enregistrées », the replay library.
 *
 * The année scolaire comes FIRST because it is what makes an archive an
 * archive: the élève either wants this year's séance again, or last year's
 * revision. It opens on the most recent année, lives in the URL
 * (`?annee=2025-2026`) so a link survives a refresh, and everything below it
 * — the matière grid — is that année's slice. The page carries no standfirst
 * and no totals line: the title names it, and each année card already says
 * which year it is and how much it holds, so the prose was repeating them.
 *
 * The grid deliberately repeats the Matières page card: same glyph, same halo,
 * same rhythm. An élève should recognise "my matières" instantly and only then
 * notice that the number underneath counts enregistrements, not chapitres.
 *
 * Referenced for spacing & density: StudentSubjectsScreen (card + halo + grid),
 * StudentCalendarScreen (horizontally scrolling row of date choices).
 */
export default function StudentSeancesScreen() {
  const [params, setParams] = useSearchParams()
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)

  const pool = useMyPastSessions()
  const academicYears = useMemo(() => academicYearsOf(pool), [pool])

  const asked = params.get("annee")
  const activeYear =
    (asked && academicYears.find((y) => y === yearFromSlug(asked))) ?? academicYears[0] ?? ""

  function setYear(next: string) {
    const p = new URLSearchParams(params)
    p.set("annee", yearSlug(next))
    setParams(p, { replace: true })
  }

  const myYearIds = user?.yearIds ?? NO_YEARS

  /** Séance counts per année scolaire — the badge on each tab. */
  const perYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of pool) {
      if (!s.recordingUrl) continue
      m.set(s.academicYear, (m.get(s.academicYear) ?? 0) + 1)
    }
    return m
  }, [pool])

  /** My matières + how many recordings the active année holds for each. */
  const cards = useMemo(() => {
    const inYear = pool.filter((s) => s.academicYear === activeYear)
    return subjects
      .filter((s) => myYearIds.includes(s.yearId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((subject) => ({
        subject,
        recorded: inYear.filter((s) => s.subjectIds.includes(subject.id) && s.recordingUrl).length,
      }))
  }, [pool, subjects, myYearIds, activeYear])

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          الصفحة الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">الحصص المسجّلة</span>
      </nav>

      <h1 className="font-display text-[calc(26px*var(--ts))] font-bold leading-tight text-ink">
        الحصص المسجّلة
      </h1>

      {academicYears.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface">
          <EmptyState
            icon={MonitorPlay}
            title="ما فماش حصص مسجّلة"
            description="كي تسير حصّة في عامك، التسجيل متاعها يظهر هوني."
          />
        </div>
      ) : (
        <>
          {/* ---- Année scolaire : the archive's first choice ---- */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
              <CalendarRange className="size-3.5" />
              السنة الدراسية
            </div>

            {/* A ROW OF NAMED CARDS, not a segmented control of bare years.
                The control this replaces asked the élève to read « 2025-2026 »
                and work out for themselves which one that is, and hung a naked
                « 26 » beside it that could have been counting anything. Each
                choice now says what the year IS to them (« العام هذا », « العام
                الفارط », otherwise archive), then the range, then what it holds,
                spelled out. The chosen one takes the brand gradient: the
                selection IS the page's state — everything below is that year's
                slice — so it is worth the one loud surface a view is allowed. */}
            <div
              role="tablist"
              aria-label="السنة الدراسية"
              className="flex gap-2 overflow-x-auto scroll-touch pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {academicYears.map((year, i) => {
                const active = year === activeYear
                const count = perYear.get(year) ?? 0
                // `academicYears` comes back newest-first, so the index IS the
                // distance from today. Past the year before, an élève counts in
                // « archive », not in « the year before the year before ».
                const kicker = i === 0 ? "العام هذا" : i === 1 ? "العام الفارط" : "أرشيف"
                return (
                  <button
                    key={year}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setYear(year)}
                    className={cn(
                      // Same edge on both states — the fill is what says which
                      // one is chosen, and a border that appears and disappears
                      // resizes the card under the cursor.
                      "flex min-w-[8.5rem] shrink-0 flex-col items-start gap-0.5 rounded-lg border-2 px-3.5 py-2.5 text-start transition",
                      active
                        ? "border-brand-600 bg-grad text-ink-inverted shadow-brand"
                        : "border-brand-200 bg-surface text-ink-subtle shadow-sm hover:border-brand-600 hover:text-brand-600",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[calc(10.5px*var(--ts))] font-medium uppercase tracking-[.12em]",
                        active ? "text-ink-inverted/85" : "text-accent2-600",
                      )}
                    >
                      {kicker}
                    </span>
                    <span className="font-display text-[calc(15px*var(--ts))] font-bold leading-tight tabular-nums">
                      {year}
                    </span>
                    <span
                      className={cn(
                        "text-[calc(11.5px*var(--ts))]",
                        active ? "text-ink-inverted/85" : "text-ink-muted",
                      )}
                    >
                      {count === 0 ? "ما فماش تسجيلات" : `${count} تسجيل`}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ---- Matières of that année ---- */}
          {/* No panel around the grid any more. The cards are the Matières cards
              now — white, hair-bordered — and a white card inside a white panel
              has no edge to show; on the canvas they read the way they do on
              موادّك. The year row above is divider enough. */}
          <section>
            {cards.length === 0 ? (
              <EmptyState
                className="py-10"
                icon={MonitorPlay}
                title="ما فماش موادّ في برنامجك"
                description="برنامجك مازال ما تربطش بعام. اتّصل بالمساعدة ونتكفّلو بيها."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-5">
                {cards.map(({ subject, recorded }) => {
                  const c = subjectTheme(subject.category)
                  // Same rule as موادّك: only the cut-out portraits need a halo
                  // under them. A real badge brings its own disc.
                  const tint = badgeFor(subject.name)
                    ? null
                    : subjectTint(subject.name, subject.category)
                  return (
                    <li key={subject.id}>
                      <Link
                        to={`/student/seances/${subject.id}?annee=${yearSlug(activeYear)}`}
                        className={cn(
                          "group flex h-full flex-col items-center rounded-lg border border-border bg-surface p-2.5 pb-3 shadow-sm outline-none transition duration-200 hover:border-brand-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-400 motion-safe:hover:-translate-y-0.5 md:p-3 md:pb-3.5",
                          recorded === 0 && "opacity-70 hover:opacity-100",
                        )}
                      >
                        {/* The badges' native canvas (2119x2014 = 21:20), so the
                            art comes out as big as the column allows. */}
                        <div className="relative aspect-[21/20] w-full">
                          {tint && (
                            <span
                              aria-hidden="true"
                              className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-transform duration-500 motion-safe:group-hover:scale-125"
                              style={{ backgroundColor: tint.halo }}
                            />
                          )}
                          <SubjectIcon
                            name={subject.name}
                            className="absolute inset-1 drop-shadow-sm transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105"
                          />
                          {/* THE TOUCH, part one: a play disc surfacing over the
                              art on hover. It is the difference between "my
                              matière" and "the tape of my matière". Decoration
                              only — the chip below carries the same fact
                              permanently, because a phone has no hover. */}
                          {recorded > 0 && (
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 motion-safe:group-hover:opacity-100"
                            >
                              <span className="grid size-9 place-items-center rounded-full bg-brand-600/90 text-white shadow-md">
                                <Play className="size-4 fill-current ps-0.5" />
                              </span>
                            </span>
                          )}
                        </div>

                        <p
                          className={cn(
                            "mt-1 line-clamp-2 text-center font-display text-[calc(13px*var(--ts))] font-bold leading-snug transition-colors group-hover:text-brand-600 md:text-sm",
                            c.name,
                          )}
                        >
                          {subject.name}
                        </p>

                        {/* THE TOUCH, part two: موادّك spends this slot on a
                            streak, the archive spends it on what it holds. Brand
                            rather than the streak's gold — this is a count, not
                            something earned. `mt-auto` pins it so the chips line
                            up across a row even when a name wraps to two lines. */}
                        <RecordingsChip count={recorded} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

const CHIP =
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 pt-1 text-[calc(10px*var(--ts))]"

/**
 * What this matière holds in the chosen année — the archive's answer to موادّك's
 * streak chip, in the same footprint so the two grids keep one rhythm.
 *
 * Tunisian counting: 1 تسجيل, 2 تسجيلين, 3-10 تسجيلات, 11+ تسجيل. Both states
 * keep the slot, so a row of cards never loses a line.
 */
function RecordingsChip({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="mt-auto flex pt-2">
        <span className={cn(CHIP, "border-border bg-neutral-100 font-medium text-ink-muted")}>
          <MonitorPlay className="size-3 shrink-0" aria-hidden="true" />
          ما فماش تسجيلات
        </span>
      </span>
    )
  }

  return (
    <span className="mt-auto flex pt-2">
      <span
        className={cn(CHIP, "border-brand-500/25 bg-brand-50 font-semibold text-brand-700")}
        title={`${count} تسجيل محفوظ في هالمادّة`}
      >
        <MonitorPlay
          className="size-3 shrink-0 transition-transform duration-300 motion-safe:group-hover:scale-110"
          aria-hidden="true"
        />
        {count === 1 ? (
          "تسجيل واحد"
        ) : count === 2 ? (
          "زوز تسجيلات"
        ) : (
          <>
            <span className="num">{count}</span> {count <= 10 ? "تسجيلات" : "تسجيل"}
          </>
        )}
      </span>
    </span>
  )
}
