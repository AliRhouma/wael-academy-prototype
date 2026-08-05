import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BookMarked, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { WaelProgress } from "@/components/kit/WaelProgress"
import { SubjectIcon } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
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
              const tint = subjectTint(subject.name, category)
              // Theme-aware: full tint on light, mixed into the dark surface otherwise.
              const fill = `color-mix(in srgb, ${tint.fill} var(--tint-fill-strength), var(--surface))`
              return (
                <li key={subject.id}>
                  {/* The WHOLE card is tinted with the drawing's OWN dominant
                      colour — no inner panel — so the artwork and its card read
                      as one object and the drawing can run big. `--tint-strength`
                      keeps that honest in dark mode: full tint on light, a wash
                      mixed into the dark surface otherwise.
                      Title and progress bar stay on the category token — those
                      carry meaning, the backdrop carries the art. */}
                  <Link
                    to={`/student/matieres/${subject.id}`}
                    className="group relative isolate flex h-full flex-col overflow-hidden rounded-lg border border-border p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${tint.panel} var(--tint-strength), var(--surface))`,
                    }}
                  >
                    {/* HOVER, part 1: colour floods the card from the bottom up.
                        A deeper cut of the SAME measured tint, so it reads as the
                        card warming rather than a new colour arriving. Behind the
                        content (`isolate` + negative z) and clipped by the card's
                        own rounded corners. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -inset-y-10 -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-out motion-safe:group-hover:scale-y-100"
                      style={{
                        // Feathered leading edge — a hard line sweeping up reads
                        // as a wipe; this reads as colour flooding in. The layer
                        // overshoots the card so the solid part still covers it.
                        backgroundImage: `linear-gradient(to top, ${fill} 0%, ${fill} 82%, transparent 100%)`,
                      }}
                    />

                    {/* HOVER, part 2: the drawing swells. Where the matière has a
                        happy variant (Anglais), SubjectIcon cross-fades the two
                        in place at the same time — same frame, so it reads as Wael
                        smiling, not as one icon replacing another. */}
                    <div className="relative grid h-32 place-items-center md:h-36">
                      <span
                        className="absolute size-24 rounded-full blur-2xl transition-transform duration-500 motion-safe:group-hover:scale-125"
                        style={{ backgroundColor: tint.halo }}
                      />
                      <SubjectIcon
                        name={subject.name}
                        className="relative size-32 transition-transform duration-500 ease-out motion-safe:group-hover:scale-110 md:size-36"
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

                    {/* pt-4, not pt-2.5: the face chip straddles the bar and
                        rises ~8px above it — that padding is its headroom. */}
                    <div className="mt-auto pt-4">
                      {total === 0 ? (
                        <p className="text-center text-[11px] text-ink-muted">Programme à venir</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <WaelProgress
                              pct={pct}
                              barClassName={c.bar}
                              chipClassName={c.chip}
                              label={`Progression ${subject.name}`}
                              className="flex-1"
                            />
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
