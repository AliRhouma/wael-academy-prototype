import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BookMarked, ChevronLeft } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, badgeFor } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"

/**
 * Élève — "موادّك": the matières of the student's own filière.
 *
 * Referenced for spacing & density: SubjectDetailScreen (card + tint idiom,
 * breadcrumb), ChapitresTab (bordered surface + chip row), EmptyState.
 *
 * CARDS. The badges are finished objects and could stand on the bare page, but
 * a matière carries more than its drawing — a name and a chapter ratio — and
 * stacked lines of loose text need a container to read as ONE object instead of
 * two. The card is deliberately quiet: white surface, hair border, the softest
 * shadow, and the art still floats free inside it (no plate, no fill behind the
 * medallion). The WHOLE card is the link; it lifts and warms its border on hover
 * so the tap target is the thing that reacts.
 *
 * The card makes NO claim about progress. It used to close on a "X/Y فصول"
 * ratio, and before that on a streak chip; both are gone for the same reason —
 * one was invented outright, the other measured how much of the syllabus the
 * academy had uploaded while reading like how much of it the élève had done. A
 * matière with no programme at all still says so, because that explains an
 * empty page before the élève taps into it.
 */

/** Stable empty array so the memo below doesn't see a new dep every render. */
const NO_YEARS: string[] = []

export default function StudentSubjectsScreen() {
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)

  const myYearIds = user?.yearIds ?? NO_YEARS

  /** My matières, each with the size of its programme — 0 means "pas encore". */
  const mine = useMemo(
    () =>
      subjects
        .filter((s) => myYearIds.includes(s.yearId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({
          subject: s,
          category: s.category ?? "secondaire",
          total: chapters.filter((c) => c.subjectIds.includes(s.id)).length,
        })),
    [subjects, chapters, myYearIds],
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          الصفحة الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">الموادّ</span>
      </nav>

      {/* TITLE ONLY. The plate-and-book lockup and the intro paragraph both went:
          the breadcrumb above already says where we are, and the drawings below
          say what this page is far better than a sentence could. */}
      <h1 className="font-display text-[calc(26px*var(--ts))] font-bold leading-tight text-ink">موادّك</h1>

      {mine.length === 0 ? (
        <EmptyState
          className="py-10"
          icon={BookMarked}
          title="ما فماش موادّ توّا"
          description="برنامجك مازال ما تربطش بعام. اتّصل بالمساعدة ونتكفّلو بيها."
        />
      ) : (
        /* The cards draw their own edges, so the gaps only have to keep them
           apart — even and tight, no extra air between rows. `items-stretch`
           (grid's default) plus `h-full` on the card keeps every card in a row
           the same height whether or not its matière has a streak. */
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-5">
          {mine.map(({ subject, category, total }) => {
            const c = subjectTheme(category)
            const badge = badgeFor(subject.name)
            // Only the cut-out portraits still need something under them: with
            // no card, one would be a floating body on bare canvas. A badge
            // brings its own disc.
            const needsHalo = !badge
            const tint = needsHalo ? subjectTint(subject.name, category) : null
            return (
              <li key={subject.id}>
                {/* THE CARD IS THE LINK — art, name, ratio and streak in one
                    44px-plus hit area, and the card itself is the affordance:
                    it rises, its border warms to brand and the medallion swells
                    inside it. Padding stays tight at the top so the drawing owns
                    the card and the text reads as its caption. */}
                <Link
                  to={`/student/matieres/${subject.id}`}
                  className="group flex h-full flex-col items-center rounded-lg border border-border bg-surface p-2.5 pb-3 shadow-sm outline-none transition duration-200 hover:border-brand-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-400 motion-safe:hover:-translate-y-0.5 md:p-3 md:pb-3.5"
                >
                  {/* The badges' native canvas (2119×2014 ≈ 21:20), so a
                      contained medallion wastes no width and no height and comes
                      out as big as the column allows. */}
                  <div className="relative aspect-[21/20] w-full">
                    {tint && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-transform duration-500 motion-safe:group-hover:scale-125"
                        style={{ backgroundColor: tint.halo }}
                      />
                    )}
                    {/* POSITIONED, not a centred grid item: `object-contain`
                        only contains against a DEFINITE box. The insets are the
                        swell's headroom. Where the matière has a happy variant
                        (Anglais), SubjectIcon cross-fades the two in the same
                        frame, so it reads as Wael smiling. */}
                    {/* `[&_img]:drop-shadow-sm`, NOT `drop-shadow-sm`. A CSS
                        filter re-renders its whole subtree whenever any part of
                        it changes, and this subtree contains the gaze overlay,
                        which changes sixty times a second — so a shadow on the
                        wrapper quietly re-filtered a ~150 KB drawing on every
                        frame of every card. On the `<img>` the shadow is
                        identical (the drawing is what casts it) and the moving
                        eyes sit outside the filter entirely.

                        `will-change` only while hovered: scaling an SVG image
                        re-rasterises the vector at each step unless the element
                        is composited, and only one card is ever hovered, so
                        this buys the smooth swell for exactly one layer. */}
                    <SubjectIcon
                      name={subject.name}
                      className="absolute inset-1 transition-transform duration-500 ease-out [&_img]:drop-shadow-sm motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105 motion-safe:group-hover:[will-change:transform]"
                    />
                  </div>

                  {/* The caption: name, then the derived chapter ratio. It stays
                      deliberately thin (two lines max); the drawing is what the
                      élève picks a matière by. */}
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-center font-display text-[calc(13px*var(--ts))] font-bold leading-snug transition-colors group-hover:text-brand-600 md:text-sm",
                      c.name,
                    )}
                  >
                    {subject.name}
                  </p>
                  {/* The card says the matière and nothing else. The "X/Y فصول"
                      ratio that closed it is gone: it was a progress bar that
                      measured the SYLLABUS, not the élève — 3/9 said "six
                      chapitres have no content yet", which is the academy's
                      business, and read like "you have done a third", which is
                      not true. The one case still worth a word is a matière
                      with no programme at all, because that explains an empty
                      page before the élève taps into it. */}
                  {total === 0 && (
                    <p className="mt-auto pt-0.5 text-center text-[calc(11px*var(--ts))] font-medium text-ink-subtle">
                      البرنامج جاي
                    </p>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
