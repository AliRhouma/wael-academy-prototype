import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BookMarked, ChevronLeft, Clock, Flame } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, badgeFor, sceneFor } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
import { subjectActivity, type SubjectActivity } from "@/features/student/subjectStreak"
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
 * a matière now carries more than its drawing — a name, a chapter ratio and a
 * streak — and three stacked lines of loose text need a container to read as ONE
 * object instead of three. The card is deliberately quiet: white surface, hair
 * border, the softest shadow, and the art still floats free inside it (no plate,
 * no fill behind the medallion). The WHOLE card is the link; it lifts and warms
 * its border on hover so the tap target is the thing that reacts.
 *
 * The "X/Y فصول" line is DERIVED in render, never stored: the matière's chapters
 * that already carry at least one contenu, over its total. The streak below it
 * is the one MOCK value on this page — see `subjectStreak`, which fakes it
 * deterministically from the id because the store logs no activity at all.
 */

/** Stable empty array so the memo below doesn't see a new dep every render. */
const NO_YEARS: string[] = []

export default function StudentSubjectsScreen() {
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)

  const myYearIds = user?.yearIds ?? NO_YEARS

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
        return { subject: s, category: s.category ?? "secondaire", ready, total }
      })
  }, [subjects, chapters, lessons, myYearIds])

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          الرئيسية
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
          {mine.map(({ subject, category, ready, total }) => {
            const c = subjectTheme(category)
            const activity = subjectActivity(subject.id)
            const badge = badgeFor(subject.name)
            // A badge supersedes the older scene where a matière has both.
            const scene = !badge && sceneFor(subject.name)
            // Only the cut-out figures still need something under them: with no
            // card, a portrait would be a floating body on bare canvas. A badge
            // brings its own disc and a scene its own background.
            const needsHalo = !badge && !scene
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
                  <div className={cn("relative aspect-[21/20] w-full", scene && "overflow-hidden rounded-xl")}>
                    {scene ? (
                      <img
                        src={scene}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                      />
                    ) : (
                      <>
                        {tint && (
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-transform duration-500 motion-safe:group-hover:scale-125"
                            style={{ backgroundColor: tint.halo }}
                          />
                        )}
                        {/* POSITIONED, not a centred grid item: `object-contain`
                            only contains against a DEFINITE box. The insets are
                            the swell's headroom. Where the matière has a happy
                            variant (Anglais), SubjectIcon cross-fades the two in
                            the same frame, so it reads as Wael smiling. */}
                        <SubjectIcon
                          name={subject.name}
                          className="absolute inset-1 drop-shadow-sm transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105"
                        />
                      </>
                    )}
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
                  <p className="mt-0.5 text-center text-[calc(11px*var(--ts))] font-medium text-ink-subtle">
                    {total === 0 ? (
                      "البرنامج جاي"
                    ) : (
                      <>
                        <span className="num">{ready}/{total}</span> فصول
                      </>
                    )}
                  </p>

                  {/* THE STREAK — a chip rather than a line so it reads as a
                      little earned badge. `mt-auto` pins it to the bottom edge
                      so the chips line up across a row even when a name above
                      wraps to two lines. All three activity states keep that
                      same slot, so the grid never loses a line. */}
                  <StreakChip activity={activity} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Tunisian day counting: 1 نهار, 2 نهارين, 3-10 أيّام, 11+ يوم. */
function days(n: number, suffix: string) {
  if (n === 1) return `نهار ${suffix}`
  if (n === 2) return `نهارين ${suffix}`
  return { n, unit: n <= 10 ? "أيّام" : "يوم", suffix }
}

/** Renders what `days()` returned, with the count in the tabular `num` face. */
function DayCount({ value }: { value: ReturnType<typeof days> }) {
  if (typeof value === "string") return <>{value}</>
  return (
    <>
      <span className="num">{value.n}</span> {value.unit} {value.suffix}
    </>
  )
}

const CHIP = "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 pt-1 text-[calc(10px*var(--ts))]"

/**
 * The per-matière activity badge. THREE states in one footprint, so the card
 * grid keeps its rhythm whatever the élève has been doing:
 *
 *  - streak running -> a lit GOLD chip (gold is this system's reward colour),
 *    the flame swelling when the card is hovered;
 *  - gone cold -> a RED chip counting the days untouched. Red is this system's
 *    alert colour and this is exactly that: the matière is slipping. The flame
 *    is replaced by a clock — a red flame would still read as "on fire";
 *  - never opened -> a quiet NEUTRAL invitation. Nothing has been lost yet, so
 *    nothing should shout.
 */
function StreakChip({ activity }: { activity: SubjectActivity }) {
  const { streak, idleDays } = activity

  if (streak > 0) {
    return (
      <span className="mt-auto flex pt-2">
        <span
          className={cn(CHIP, "border-accent2-500/25 bg-accent2-50 font-semibold text-accent2-700")}
          title={`قريت هالمادّة ${streak} ${streak <= 10 ? "أيّام" : "يوم"} متتالية — كمّل!`}
        >
          <Flame
            className="size-3 shrink-0 fill-accent2-500/25 transition-transform duration-300 motion-safe:group-hover:scale-110"
            aria-hidden="true"
          />
          <DayCount value={days(streak, "متتالية")} />
        </span>
      </span>
    )
  }

  if (idleDays > 0) {
    return (
      <span className="mt-auto flex pt-2">
        <span
          className={cn(CHIP, "border-danger-500/25 bg-danger-50 font-semibold text-danger-700")}
          title={`ما قريتش هالمادّة من ${idleDays} ${idleDays <= 10 ? "أيّام" : "يوم"} — سلسلتك تقطعت.`}
        >
          <Clock className="size-3 shrink-0" aria-hidden="true" />
          <DayCount value={days(idleDays, "بلا قراية")} />
        </span>
      </span>
    )
  }

  return (
    <span className="mt-auto flex pt-2">
      <span className={cn(CHIP, "border-border bg-neutral-100 font-medium text-ink-muted")}>
        <Flame className="size-3 shrink-0" aria-hidden="true" />
        ابدا سلسلتك
      </span>
    </span>
  )
}
