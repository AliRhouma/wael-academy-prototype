import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, ClipboardList, GraduationCap, Layers3, ListChecks, Route } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { useData } from "@/stores/useData"
import { ChaptersPanel } from "./ChaptersPanel"
import { ExamsPanel } from "./ExamsPanel"
import { LessonsPanel } from "./LessonsPanel"
import { QuizzesPanel } from "./QuizzesPanel"
import { PathsPanel } from "./PathsPanel"

type Tab = "chapters" | "lessons" | "quizzes" | "paths" | "exams"

/** Admin — one subject, with its Chapitres and Examens as two tabs. */
export default function AdminSubjectDetailScreen() {
  const { yearId, subjectId } = useParams()
  const navigate = useNavigate()
  const year = useData((s) => s.years.find((y) => y.id === yearId))
  const subject = useData((s) => s.subjects.find((s) => s.id === subjectId))
  const chapterCount = useData(
    (s) => s.chapters.filter((c) => subjectId && c.subjectIds.includes(subjectId)).length,
  )
  const lessonCount = useData(
    (s) => s.lessons.filter((l) => subjectId && l.subjectIds.includes(subjectId)).length,
  )
  const quizCount = useData(
    (s) => s.quizzes.filter((q) => subjectId && q.subjectIds.includes(subjectId)).length,
  )
  const pathCount = useData((s) => s.paths.filter((p) => p.subjectId === subjectId).length)
  const examCount = useData(
    (s) => s.exams.filter((e) => subjectId && e.subjectIds.includes(subjectId)).length,
  )

  const [tab, setTab] = useState<Tab>("chapters")

  if (!year || !subject) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={GraduationCap}
          title="Matière introuvable"
          description="Cette matière n’existe pas ou a été supprimée."
          action={
            <Link
              to="/admin/curriculum"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              <ArrowLeft className="size-4" /> Retour au programme
            </Link>
          }
        />
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count: number; icon: typeof Layers3 }[] = [
    { key: "chapters", label: "Chapitres", count: chapterCount, icon: Layers3 },
    { key: "lessons", label: "Contenus", count: lessonCount, icon: BookOpen },
    { key: "quizzes", label: "Quiz", count: quizCount, icon: ListChecks },
    { key: "paths", label: "Parcours", count: pathCount, icon: Route },
    { key: "exams", label: "Examens", count: examCount, icon: ClipboardList },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/admin/curriculum/${year.id}`)}
          className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-md text-sm font-medium text-ink-subtle transition hover:text-brand-600"
        >
          <ArrowLeft className="size-4" /> <span dir="auto">{year.name}</span>
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">Matière</p>
        <h1 dir="auto" className="font-display text-[26px] font-bold leading-tight text-ink">
          {subject.name}
        </h1>
      </div>

      {/* Segmented control: Chapitres / Contenus / Quiz / Parcours / Examens */}
      <div className="-mx-1 overflow-x-auto scroll-touch px-1 pb-1">
        <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1">
          {tabs.map((t) => {
            const active = tab === t.key
            const Icon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition " +
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
      </div>

      {tab === "chapters" && <ChaptersPanel year={year} subject={subject} />}
      {tab === "lessons" && <LessonsPanel year={year} subject={subject} />}
      {tab === "quizzes" && <QuizzesPanel year={year} subject={subject} />}
      {tab === "paths" && <PathsPanel year={year} subject={subject} />}
      {tab === "exams" && <ExamsPanel year={year} subject={subject} />}
    </div>
  )
}
