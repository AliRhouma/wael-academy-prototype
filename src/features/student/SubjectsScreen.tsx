import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BookMarked, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, hasSubjectArt } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"

/**
 * Élève — "Vos matières": the matières of the student's own filière, grouped
 * into the three weight buckets (principales / secondaires / optionnelles) that
 * the chips filter by.
 *
 * Referenced for spacing & density: AdminSubjectsScreen (card + grid idiom),
 * PageHeader (title block), EmptyState (both empty cases).
 *
 * Progress is DERIVED in render, never stored: share of the matière's chapters
 * that already carry at least one contenu. That is an honest "X/Y" summary — no
 * completion tracking exists in the store, so inventing a per-élève percentage
 * would have meant inventing an engine.
 */

/** Stable empty array so the memo below doesn't see a new dep every render. */
const NO_YEARS: string[] = []

export default function StudentSubjectsScreen() {
  const user = useAuth((s) => s.currentUser)
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)

  const myYearIds = user?.yearIds ?? NO_YEARS
  const myYear = years.find((y) => myYearIds.includes(y.id))

  /** My matières + their derived "contenu prêt" ratio. */
  const mine = useMemo(() => {
    const withContent = new Set(lessons.map((l) => l.chapterId))
    return subjects
      .filter((s) => myYearIds.includes(s.yearId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => {
        const mySubjectChapters = chapters.filter((c) => c.subjectIds.includes(s.id))
        const ready = mySubjectChapters.filter((c) => withContent.has(c.id)).length
        const total = mySubjectChapters.length
        return {
          subject: s,
          category: s.category ?? "secondaire",
          ready,
          total,
          pct: total === 0 ? 0 : Math.round((ready / total) * 100),
        }
      })
  }, [subjects, chapters, lessons, myYearIds])

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-[13px] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          Accueil
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">Matières</span>
      </nav>

      <div>
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">Vos matières</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Découvre ici toutes les matières à ton programme{myYear ? ` — ${myYear.name}` : ""}. Avance à ton rythme,
          explore les contenus, et reviens autant de fois que tu veux.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
        {mine.length === 0 ? (
          <EmptyState
            className="py-10"
            icon={BookMarked}
            title="Aucune matière pour le moment"
            description="Ton programme n’est pas encore rattaché à une année. Contacte l’assistance et on s’en occupe."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {mine.map(({ subject, category, ready, total, pct }) => {
              const c = subjectTheme(category)
              return (
                <li key={subject.id}>
                  <Link
                    to={`/student/matieres/${subject.id}`}
                    className="group flex h-full flex-col rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                  >
                    {/* Glyph in its tinted halo */}
                    <div
                      className={cn(
                        "relative grid h-24 place-items-center overflow-hidden rounded-md md:h-28",
                        c.panel,
                      )}
                    >
                      <span
                        className={cn(
                          "absolute size-20 rounded-full blur-2xl transition-transform motion-safe:group-hover:scale-110",
                          c.halo,
                        )}
                      />
                      {/* Supplied art carries its own gradients; only the stroke
                          fallbacks take the category tint. */}
                      <SubjectIcon
                        name={subject.name}
                        className={cn("relative size-12 md:size-14", !hasSubjectArt(subject.name) && c.icon)}
                      />
                    </div>

                    <p
                      className={cn(
                        "mt-2.5 line-clamp-2 text-center font-display text-[13px] font-bold leading-snug md:text-sm",
                        c.name,
                      )}
                    >
                      {subject.name}
                    </p>

                    <div className="mt-auto pt-2.5">
                      {total === 0 ? (
                        <p className="text-center text-[11px] text-ink-muted">Programme à venir</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                              <div
                                className={cn("h-full rounded-full transition-all duration-500", c.bar)}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold tabular-nums text-ink-subtle">{pct}%</span>
                          </div>
                          <p className="mt-1 text-[11px] text-ink-muted">
                            {ready}/{total} chapitres
                          </p>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
