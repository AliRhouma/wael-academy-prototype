import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, Layers3, ListChecks } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { useData } from "@/stores/useData"
import { LessonsPanel } from "./LessonsPanel"
import { QuizzesPanel } from "./QuizzesPanel"

type Tab = "lessons" | "quizzes"

/** Admin — one chapter, with its Contenus and Quiz as two tabs. Content lives on
 * (and is created from) this page; scope comes from the chapter's year/subject links. */
export default function AdminChapterDetailScreen() {
  const { yearId, subjectId, chapterId } = useParams()
  const navigate = useNavigate()
  const year = useData((s) => s.years.find((y) => y.id === yearId))
  const subject = useData((s) => s.subjects.find((sub) => sub.id === subjectId))
  const chapter = useData((s) => s.chapters.find((c) => c.id === chapterId))
  const years = useData((s) => s.years)
  const lessonCount = useData(
    (s) => s.lessons.filter((l) => l.chapterId === chapterId).length,
  )
  const quizCount = useData((s) => s.quizzes.filter((q) => q.chapterId === chapterId).length)

  const [tab, setTab] = useState<Tab>("lessons")

  const otherYearNames = useMemo(() => {
    if (!chapter || !year) return []
    return chapter.yearIds
      .filter((yid) => yid !== year.id)
      .map((yid) => years.find((y) => y.id === yid)?.name ?? "—")
  }, [chapter, year, years])

  if (!year || !subject || !chapter) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Layers3}
          title="Chapitre introuvable"
          description="Ce chapitre n’existe pas ou a été supprimé."
          action={
            <Link
              to={subjectId && yearId ? `/admin/curriculum/${yearId}/${subjectId}` : "/admin/curriculum"}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              <ArrowLeft className="size-4" /> Retour
            </Link>
          }
        />
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count: number; icon: typeof BookOpen }[] = [
    { key: "lessons", label: "Contenus", count: lessonCount, icon: BookOpen },
    { key: "quizzes", label: "Quiz", count: quizCount, icon: ListChecks },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/admin/curriculum/${year.id}/${subject.id}`)}
          className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-md text-sm font-medium text-ink-subtle transition hover:text-brand-600"
        >
          <ArrowLeft className="size-4" /> <span dir="auto">{subject.name}</span>
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">Chapitre</p>
        <h1 dir="auto" className="font-display text-[26px] font-bold leading-tight text-ink">
          {chapter.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="brand" dot>
            {year.name}
          </Badge>
          {otherYearNames.map((name, i) => (
            <Badge key={i} tone="neutral">
              {name}
            </Badge>
          ))}
          {chapter.subjectIds.length > 1 && (
            <span className="text-[12px] text-ink-muted">· {chapter.subjectIds.length} matières</span>
          )}
        </div>
      </div>

      {/* Segmented control: Contenus / Quiz */}
      <div className="inline-flex self-start rounded-lg border border-border bg-surface-muted p-1">
        {tabs.map((t) => {
          const active = tab === t.key
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                "inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition " +
                (active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle")
              }
            >
              <Icon className="size-4" />
              {t.label}
              <span
                className={
                  "rounded-full px-1.5 text-xs tabular-nums " +
                  (active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted")
                }
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {tab === "lessons" ? <LessonsPanel chapter={chapter} /> : <QuizzesPanel chapter={chapter} />}
    </div>
  )
}
