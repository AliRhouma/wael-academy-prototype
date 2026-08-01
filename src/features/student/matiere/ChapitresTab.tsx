import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ChevronDown,
  Clock3,
  FileText,
  Layers3,
  Play,
  Timer,
} from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { LESSON_KINDS, QUIZ_ICON } from "@/features/admin/curriculum/content"
import { lessonVideoPath } from "@/features/student/player/links"
import { videoSrc, youtubeId } from "@/data/media"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"
import type { Chapter, Lesson, Quiz } from "@/data/types"
import type { PdfRequest } from "./types"

/** The five drawers of an open chapter, in the order the élève works through them. */
type Drawer = "cours" | "exercice" | "resume" | "serie" | "quiz"

const DRAWERS: { key: Drawer; label: string }[] = [
  { key: "cours", label: "Cours" },
  { key: "exercice", label: "Exercice" },
  { key: "resume", label: "Résumé" },
  { key: "serie", label: "Série d’exercices" },
  { key: "quiz", label: "Quiz" },
]

/**
 * Élève — the "Chapitres" tab: every chapitre of the matière, stacked, each
 * expanding in place into its five drawers.
 *
 * One chapter opens at a time: the drawers are dense, and two open cards make
 * the page impossible to scan. A cours/exercice opens the player, a
 * résumé/série opens the document viewer, both handed up to the screen so a
 * single modal instance serves the whole page.
 */
export function ChapitresTab({
  chapters,
  subjectId,
  onRead,
  onQuiz,
}: {
  chapters: Chapter[]
  /** The matière the élève is browsing — carried to the video page. */
  subjectId: string
  onRead: (request: PdfRequest) => void
  onQuiz: (quiz: Quiz) => void
}) {
  const lessons = useData((s) => s.lessons)
  const quizzes = useData((s) => s.quizzes)

  const [openId, setOpenId] = useState<string | null>(chapters[0]?.id ?? null)
  const [drawer, setDrawer] = useState<Drawer>("cours")

  /** Chapter → its contenus & quiz, bucketed once for both the header and the drawers. */
  const byChapter = useMemo(() => {
    const map = new Map<
      string,
      { lessons: Record<string, Lesson[]>; quizzes: Quiz[]; contentCount: number }
    >()
    for (const chapter of chapters) {
      const mine = lessons
        .filter((l) => l.chapterId === chapter.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      map.set(chapter.id, {
        lessons: {
          cours: mine.filter((l) => l.kind === "cours"),
          exercice: mine.filter((l) => l.kind === "exercice"),
          resume: mine.filter((l) => l.kind === "resume"),
          serie: mine.filter((l) => l.kind === "serie"),
        },
        quizzes: quizzes
          .filter((q) => q.chapterId === chapter.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        contentCount: mine.length,
      })
    }
    return map
  }, [chapters, lessons, quizzes])

  function toggle(chapterId: string) {
    setOpenId((current) => (current === chapterId ? null : chapterId))
    setDrawer("cours")
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Layers3}
          title="Programme à venir"
          description="Les chapitres de cette matière ne sont pas encore publiés. Reviens bientôt."
        />
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {chapters.map((chapter, i) => {
        const data = byChapter.get(chapter.id)
        const open = openId === chapter.id
        const contentCount = data?.contentCount ?? 0
        const quizCount = data?.quizzes.length ?? 0

        return (
          <li
            key={chapter.id}
            className={cn(
              "overflow-hidden rounded-lg border bg-surface shadow-sm transition",
              open ? "border-brand-200 shadow-md" : "border-border hover:border-brand-200",
            )}
          >
            {/* ---- Header ---- */}
            <h3>
              <button
                type="button"
                onClick={() => toggle(chapter.id)}
                aria-expanded={open}
                aria-controls={`chapitre-${chapter.id}`}
                className="flex w-full items-center gap-3 p-4 text-start"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md font-display text-[15px] font-bold tabular-nums transition",
                    open ? "bg-grad text-ink-inverted shadow-brand" : "bg-brand-50 text-brand-600",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    dir="auto"
                    className={cn(
                      "block truncate font-display text-[15px] font-bold leading-snug",
                      open ? "text-brand-700" : "text-ink",
                    )}
                  >
                    {chapter.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {contentCount === 0 && quizCount === 0
                      ? "Contenus à venir"
                      : `${contentCount} contenu${contentCount > 1 ? "s" : ""} · ${quizCount} quiz`}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-ink-muted transition-transform duration-200",
                    open && "rotate-180 text-brand-600",
                  )}
                />
              </button>
            </h3>

            {/* ---- Drawers ---- */}
            {open && (
              <div
                id={`chapitre-${chapter.id}`}
                className="border-t border-border bg-surface-muted/60 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-200"
              >
                <div className="flex gap-1.5 overflow-x-auto scroll-touch px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {DRAWERS.map((d) => {
                    const count =
                      d.key === "quiz" ? quizCount : (data?.lessons[d.key]?.length ?? 0)
                    const active = drawer === d.key
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDrawer(d.key)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition",
                          active
                            ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                            : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600",
                          !active && count === 0 && "opacity-55",
                        )}
                      >
                        {d.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[11px] tabular-nums",
                            active ? "bg-white/20 text-ink-inverted" : "bg-neutral-100 text-ink-muted",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="px-4 pb-4">
                  <DrawerContent
                    chapter={chapter}
                    drawer={drawer}
                    lessons={data?.lessons[drawer] ?? []}
                    quizzes={data?.quizzes ?? []}
                    subjectId={subjectId}
                    onRead={onRead}
                    onQuiz={onQuiz}
                  />
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------------- */

function DrawerContent({
  chapter,
  drawer,
  lessons,
  quizzes,
  subjectId,
  onRead,
  onQuiz,
}: {
  chapter: Chapter
  drawer: Drawer
  lessons: Lesson[]
  quizzes: Quiz[]
  subjectId: string
  onRead: (request: PdfRequest) => void
  onQuiz: (quiz: Quiz) => void
}) {
  if (drawer === "quiz") {
    if (quizzes.length === 0) return <DrawerEmpty label="quiz" />
    return (
      <ul className="grid gap-2.5 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <button
              type="button"
              onClick={() => onQuiz(quiz)}
              className="group flex h-full w-full items-start gap-3 rounded-lg border border-border bg-surface p-3 text-start shadow-sm transition hover:border-accent2-500/40 hover:shadow-md"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-600">
                <QUIZ_ICON className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span dir="auto" className="block text-[14px] font-semibold leading-snug text-ink">
                  {quiz.title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-muted">
                  <span className="tabular-nums">{quiz.questions.length} questions</span>
                  {quiz.durationMin && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Timer className="size-3.5" />
                        {quiz.durationMin} min
                      </span>
                    </>
                  )}
                </span>
                {quiz.tags.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {quiz.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  const meta = LESSON_KINDS[drawer]
  if (lessons.length === 0) return <DrawerEmpty label={meta.label.toLowerCase()} />

  /* --- Cours & exercice: video cards --- */
  if (meta.hasVideo) {
    return (
      <ul className="grid gap-2.5">
        {lessons.map((lesson) => {
          const thumbId = youtubeId(videoSrc(lesson.videoUrl))
          return (
            <li key={lesson.id}>
              {/* A vidéo is a PAGE — a real link, so it can be opened in a tab. */}
              <Link
                to={lessonVideoPath(lesson.id, subjectId)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-2.5 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md md:gap-4 md:p-3"
              >
                <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-neutral-200 md:w-36">
                  {thumbId && (
                    <img
                      src={`https://i.ytimg.com/vi/${thumbId}/mqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  )}
                  <span className="absolute inset-0 grid place-items-center bg-neutral-900/25 transition group-hover:bg-neutral-900/40">
                    <span className="grid size-9 place-items-center rounded-full bg-white/95 text-brand-600 shadow-md transition motion-safe:group-hover:scale-110">
                      <Play className="size-4 translate-x-px fill-current" />
                    </span>
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <span
                    dir="auto"
                    className="mt-1.5 block text-[14px] font-semibold leading-snug text-ink line-clamp-2"
                  >
                    {lesson.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" /> Vidéo
                    </span>
                    {lesson.pdfs.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="size-3.5" />
                          {lesson.pdfs.length} document{lesson.pdfs.length > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  /* --- Résumé & série: document cards --- */
  return (
    <ul className="grid gap-2.5 md:grid-cols-2">
      {lessons.map((lesson) => {
        const empty = lesson.pdfs.length === 0
        return (
          <li key={lesson.id}>
            <button
              type="button"
              disabled={empty}
              onClick={() =>
                onRead({
                  title: lesson.title,
                  kindLabel: meta.label,
                  tone: meta.tone,
                  context: chapter.name,
                  pdfs: lesson.pdfs,
                })
              }
              className="group flex h-full w-full items-start gap-3 rounded-lg border border-border bg-surface p-3 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:shadow-sm"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
                <meta.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <span
                  dir="auto"
                  className="mt-1.5 block text-[14px] font-semibold leading-snug text-ink line-clamp-2"
                >
                  {lesson.title}
                </span>
                <span className="mt-1 block text-[12px] text-ink-muted">
                  {empty
                    ? "Document à venir"
                    : `${lesson.pdfs.length} document${lesson.pdfs.length > 1 ? "s" : ""} · PDF`}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function DrawerEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-5 py-9 text-center">
      <p className="text-sm font-medium text-ink-subtle">Rien en {label} pour ce chapitre</p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Ce chapitre n’a pas encore de contenu de ce type — regarde les autres onglets.
      </p>
    </div>
  )
}
