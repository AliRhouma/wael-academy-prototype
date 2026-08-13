import { useMemo } from "react"
import { ArrowLeft, Route, Sparkles } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { LESSON_KINDS, QUIZ_ICON } from "@/features/admin/curriculum/content"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import type { Path } from "@/data/types"

/** One resolved step of a parcours — enough to draw its chip. */
interface Step {
  key: string
  label: string
  icon: typeof Route
  /** Tint of the step chip — brand for a leçon, gold for a quiz. */
  quiz: boolean
}

/**
 * Élève — the "مسارات" tab of a matière: the guided routes through the
 * programme, opened by default because a first-time visitor should be told
 * where to start rather than handed a chapter list.
 *
 * The cards are descriptive only for now — tapping one confirms and stops
 * there; the parcours player is a later step.
 */
export function ParcoursTab({
  subjectId,
  onOpen,
}: {
  subjectId: string
  onOpen: (path: Path) => void
}) {
  const paths = useData((s) => s.paths)
  const lessons = useData((s) => s.lessons)
  const quizzes = useData((s) => s.quizzes)

  const mine = useMemo(() => {
    return paths
      .filter((p) => p.subjectId === subjectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((path) => {
        const steps: Step[] = path.items.map((item, i) => {
          if (item.refType === "quiz") {
            const quiz = quizzes.find((q) => q.id === item.refId)
            return {
              key: item.id,
              label: quiz?.title ?? "كويز",
              icon: QUIZ_ICON,
              quiz: true,
            }
          }
          const lesson = lessons.find((l) => l.id === item.refId)
          return {
            key: item.id,
            label: lesson?.title ?? `المرحلة ${i + 1}`,
            icon: lesson ? LESSON_KINDS[lesson.kind].icon : Route,
            quiz: false,
          }
        })
        return {
          path,
          steps,
          lessonCount: steps.filter((s) => !s.quiz).length,
          quizCount: steps.filter((s) => s.quiz).length,
        }
      })
  }, [paths, lessons, quizzes, subjectId])

  if (mine.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Route}
          title="ما فماش مسارات توّا"
          description="المسارات الموجّهة متاع المادّة هذي جايّة قريب. في الانتظار، تاب الفصول فيه المحتويات الكل."
        />
      </div>
    )
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {mine.map(({ path, steps, lessonCount, quizCount }) => (
        <li key={path.id}>
          <button
            type="button"
            onClick={() => onOpen(path)}
            className="group flex h-full w-full flex-col rounded-lg border border-border bg-surface p-4 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 md:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-grad text-ink-inverted shadow-brand">
                <Route className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
                  مسار موجّه
                </p>
                <h3 dir="auto" className="font-display text-[calc(16px*var(--ts))] font-bold leading-snug text-ink">
                  {path.title}
                </h3>
              </div>
              <ArrowLeft className="mt-2 size-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </div>

            {path.description && (
              <p dir="auto" className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                {path.description}
              </p>
            )}

            {/* The route itself — numbered steps in order, scrollable. */}
            {steps.length > 0 && (
              <div className="relative mt-4">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-[15px] h-px bg-gradient-to-l from-brand-200 via-brand-100 to-transparent"
                />
                <ol className="relative -mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
                  {steps.map((step, i) => {
                    const Icon = step.icon
                    return (
                      <li key={step.key} className="flex w-[124px] shrink-0 flex-col items-center gap-1.5">
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-full border-2 border-surface ring-1 transition",
                            step.quiz
                              ? "bg-accent2-50 text-accent2-600 ring-accent2-100"
                              : "bg-brand-50 text-brand-600 ring-brand-100",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="text-[calc(10px*var(--ts))] font-semibold tabular-nums text-ink-muted">
                          {i + 1}
                        </span>
                        <span
                          dir="auto"
                          className="line-clamp-2 text-center text-[calc(11px*var(--ts))] leading-snug text-ink-subtle"
                        >
                          {step.label}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-[calc(12px*var(--ts))] text-ink-muted">
              <span className="inline-flex items-center gap-1.5 font-medium text-ink-subtle">
                <Sparkles className="size-3.5 text-accent2-500" />
                {steps.length} مرحلة
              </span>
              <span>·</span>
              <span>
                {lessonCount} محتوى
              </span>
              <span>·</span>
              <span>
                {quizCount} quiz
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
