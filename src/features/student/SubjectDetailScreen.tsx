import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { BookMarked, ChevronRight, FileCheck2, Layers3, Route } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { ShellHeaderPortal } from "@/components/AppShell"
import { useToast } from "@/components/kit/Toast"
import { PdfModal } from "@/components/kit/PdfModal"
import { SubjectIcon, hasSubjectArt } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { SubjectSwitcher } from "@/features/student/matiere/SubjectSwitcher"
import { SubjectPicker } from "@/features/student/matiere/SubjectPicker"
import { ParcoursTab } from "@/features/student/matiere/ParcoursTab"
import { ChapitresTab } from "@/features/student/matiere/ChapitresTab"
import { ExamensTab } from "@/features/student/matiere/ExamensTab"
import type { PdfRequest } from "@/features/student/matiere/types"
import { useStuck } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"

type Tab = "parcours" | "chapitres" | "examens"

const TABS: { key: Tab; label: string; icon: typeof Route }[] = [
  { key: "parcours", label: "Parcours", icon: Route },
  { key: "chapitres", label: "Chapitres", icon: Layers3 },
  { key: "examens", label: "Examens", icon: FileCheck2 },
]

/**
 * Élève — one matière: its parcours, its chapitres and its examens, plus a
 * switcher to every other matière of the same année.
 *
 * Parcours opens first on purpose — an élève arriving on a matière wants to be
 * told where to start, not handed a chapter index. The tab lives in the URL
 * (`?tab=chapitres`) so a shared link, a refresh and the back button all land
 * back where the élève was. Videos open on their own page (`/student/video/…`);
 * the document viewer is mounted ONCE here and driven by the tabs.
 *
 * Referenced for spacing & density: StudentSubjectsScreen (card + halo idiom,
 * breadcrumb), AdminChapterDetailScreen (segmented tabs), LessonsPanel (chips).
 */
export default function StudentSubjectDetailScreen() {
  const { subjectId } = useParams()
  const [params, setParams] = useSearchParams()
  const { show, toast } = useToast()

  const subjects = useData((s) => s.subjects)
  const years = useData((s) => s.years)
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const paths = useData((s) => s.paths)
  const exams = useData((s) => s.exams)

  const subject = subjects.find((s) => s.id === subjectId)
  const year = years.find((y) => y.id === subject?.yearId)
  const theme = subjectTheme(subject?.category)

  /** Sibling matières — the switcher's rail. */
  const siblings = useMemo(
    () =>
      subject
        ? subjects
            .filter((s) => s.yearId === subject.yearId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [],
    [subjects, subject],
  )

  const myChapters = useMemo(
    () =>
      subject
        ? chapters
            .filter((c) => c.subjectIds.includes(subject.id))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [],
    [chapters, subject],
  )

  const counts = useMemo(() => {
    const chapterIds = new Set(myChapters.map((c) => c.id))
    return {
      parcours: subject ? paths.filter((p) => p.subjectId === subject.id).length : 0,
      chapitres: myChapters.length,
      examens: subject ? exams.filter((e) => e.subjectIds.includes(subject.id)).length : 0,
      contenus: lessons.filter((l) => chapterIds.has(l.chapterId)).length,
    }
  }, [myChapters, paths, exams, lessons, subject])

  const raw = params.get("tab")
  const tab: Tab = TABS.some((t) => t.key === raw) ? (raw as Tab) : "parcours"

  function setTab(next: Tab) {
    const p = new URLSearchParams(params)
    if (next === "parcours") p.delete("tab")
    else p.set("tab", next)
    setParams(p, { replace: true })
  }

  const [sentinelRef, stuck] = useStuck()
  const [pdf, setPdf] = useState<PdfRequest | null>(null)

  if (!subject) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={BookMarked}
          title="Matière introuvable"
          description="Cette matière n’existe pas ou n’est plus à ton programme."
          action={
            <Link
              to="/student/matieres"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              Revenir aux matières
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-[13px] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          Accueil
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/student/matieres" className="transition hover:text-brand-600">
          Matières
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span dir="auto" className="truncate font-medium text-brand-600">
          {subject.name}
        </span>
      </nav>

      {/* Identity */}
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg md:size-[72px]",
            theme.panel,
          )}
        >
          <span className={cn("absolute size-14 rounded-full blur-2xl", theme.halo)} />
          <SubjectIcon
            name={subject.name}
            className={cn("relative size-9 md:size-10", !hasSubjectArt(subject.name) && theme.icon)}
          />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
            {year?.name ?? "Matière"}
          </p>
          <h1
            dir="auto"
            className="truncate font-display text-[24px] font-bold leading-tight text-ink md:text-[26px]"
          >
            {subject.name}
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            {counts.chapitres === 0
              ? "Programme à venir"
              : `${counts.chapitres} chapitre${counts.chapitres > 1 ? "s" : ""} · ${counts.contenus} contenu${counts.contenus > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Switch to another matière — the full rail, which scrolls away */}
      <SubjectSwitcher subjects={siblings} activeId={subject.id} />

      {/* Marks the moment the tab bar below leaves the viewport. */}
      <div ref={sentinelRef} aria-hidden="true" className="-mt-px h-px" />

      {/* Section tabs — the in-flow segmented control, scrolls away normally. */}
      <div
        role="tablist"
        aria-label="Sections de la matière"
        className="flex w-full gap-1 rounded-lg border border-border bg-surface-muted p-1 md:w-auto md:self-start"
      >
        {TABS.map((t) => {
          const active = tab === t.key
          const Icon = t.icon
          const count = counts[t.key]
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition md:h-10 md:flex-none md:px-4 md:text-sm",
                active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-brand-600")} />
              <span className="truncate">{t.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/*
        Once the in-flow tab bar scrolls away, its condensed twin appears as a
        SECOND ROW OF THE SHELL HEADER (via portal) — same card, same
        background, divided by the card's own border. Nothing floats over the
        content, and both navigations stay one tap away at any scroll depth.
      */}
      {stuck && (
        <ShellHeaderPortal>
          <div className="flex items-center gap-2 px-4 py-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 md:px-8">
            <SubjectPicker subjects={siblings} active={subject} />
            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
            <div
              role="tablist"
              aria-label="Sections de la matière"
              className="flex min-w-0 flex-1 gap-1 md:flex-none"
            >
              {TABS.map((t) => {
                const active = tab === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "inline-flex h-10 flex-1 items-center justify-center rounded-md px-2 text-[13px] font-medium transition md:flex-none md:px-3.5",
                      active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:text-ink-subtle",
                    )}
                  >
                    <span className="truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </ShellHeaderPortal>
      )}

      {/* Panel */}
      <div>
        {tab === "parcours" && (
          <ParcoursTab
            subjectId={subject.id}
            onOpen={(path) => show(`« ${path.title} » — bientôt disponible`)}
          />
        )}
        {tab === "chapitres" && (
          <ChapitresTab
            // Remount on matière change so the open chapter resets with it.
            key={subject.id}
            chapters={myChapters}
            subjectId={subject.id}
            onRead={setPdf}
            onQuiz={(quiz) => show(`« ${quiz.title} » — bientôt disponible`)}
          />
        )}
        {tab === "examens" && (
          <ExamensTab subjectId={subject.id} subjectName={subject.name} onRead={setPdf} />
        )}
      </div>

      {pdf && (
        <PdfModal
          open
          onOpenChange={(open) => !open && setPdf(null)}
          title={pdf.title}
          kindLabel={pdf.kindLabel}
          tone={pdf.tone}
          context={pdf.context}
          pdfs={pdf.pdfs}
        />
      )}

      {toast}
    </div>
  )
}
