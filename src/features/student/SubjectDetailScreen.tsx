import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { BookMarked, ChevronLeft, FileCheck2, Layers3, Route } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { ShellHeaderPortal } from "@/components/AppShell"
import { useToast } from "@/components/kit/Toast"
import { PdfModal } from "@/components/kit/PdfModal"
import { SubjectIcon } from "@/components/icons/subjects"
import { SubjectsIcon } from "@/components/icons/SubjectsIcon"
import { subjectTint } from "@/features/student/subjectTint"
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
  { key: "parcours", label: "مسارات", icon: Route },
  { key: "chapitres", label: "الدروس", icon: Layers3 },
  { key: "examens", label: "امتحانات", icon: FileCheck2 },
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
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const paths = useData((s) => s.paths)
  const exams = useData((s) => s.exams)

  const subject = subjects.find((s) => s.id === subjectId)
  const tint = subjectTint(subject?.name ?? "", subject?.category)

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
          title="المادّة ما تلقاتش"
          description="المادّة هذي ما موجودةش ولا ما عادتش في برنامجك."
          action={
            <Link
              to="/student/matieres"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              ارجع للموادّ
            </Link>
          }
        />
      </div>
    )
  }

  return (
    /* ONE FRAME, NO GROUND. The panel used to be painted — first a per-matière
       duotone, then the brand gradient veiled down (`.bg-grad-wash`) so eight
       matières stopped meaning eight page colours. Both were a plate under the
       content, and a plate is a second surface for the white cards to sit on;
       the page ended up in three layers deep before any content was read.
       What the plate was really doing was drawing an edge round the matière's
       chapter list, and an edge is enough on its own — so only the edge is
       left, in the dashboard panels' idiom: the 3px `--brand-200` rule at their
       28px radius (see CreamPanel). The notebook ruling of the shell now runs
       straight through it, which is exactly what dark mode already did once its
       fill was dropped — the two themes stopped being two treatments.
       The matière's own colour has not left the screen: the halo under its
       drawing still comes from the artwork. */
    <div className="flex flex-col gap-5 rounded-[28px] border-[3px] border-brand-200 p-4 md:p-5">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-subtle">
        <Link to="/student" className="transition hover:text-brand-600">
          الصفحة الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <Link to="/student/matieres" className="transition hover:text-brand-600">
          الموادّ
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span dir="auto" className="truncate font-medium text-brand-600">
          {subject.name}
        </span>
      </nav>

      {/* Identity — THE DRAWING AND THE NAME, and nothing else.
          The année kicker and the "X فصل · Y محتوى" line both went: the
          breadcrumb above already says which matière this is, and the tab row
          below carries the same counts on the tabs that open them, which is
          where a number is worth reading because it is attached to the thing it
          counts. What is left is one line of text, so the artwork can take the
          height the three lines used to need — it is the only thing on this
          page that identifies the matière at a glance.
          The drawing carries its own colour and nothing else does: no tinted
          plate behind it (that was a third colour between the art and the
          frame), just the halo bleeding out of the artwork. */}
      <div className="flex items-center gap-4">
        <span className="relative grid size-20 shrink-0 place-items-center md:size-24">
          <span
            className="absolute size-16 rounded-full blur-2xl md:size-20"
            style={{ backgroundColor: tint.halo }}
          />
          <SubjectIcon name={subject.name} className="relative size-20 md:size-24" />
        </span>
        <div className="min-w-0">
          <h1
            dir="auto"
            className="truncate font-display text-[calc(24px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]"
          >
            {subject.name}
          </h1>
        </div>
      </div>

      {/* NO MATIÈRE RAIL HERE. The page opens on its own subject instead of on
          a list of the other seven; crossing to another one is the breadcrumb
          («الموادّ», always in reach at the top) or the SubjectPicker in the
          condensed header row, which takes over once this page is scrolled.
          `siblings` stays — the picker is what eats it now. (The rail itself
          still serves /student/seances, where it is the only way across.) */}

      {/* Marks the moment the tab bar below leaves the viewport. */}
      <div ref={sentinelRef} aria-hidden="true" className="-mt-px h-px" />

      {/* Section tabs — the in-flow segmented control, scrolls away normally. */}
      <div
        role="tablist"
        aria-label="شعب المادّة"
        /* A solid track, the standard control ground. It was a white veil while
           this panel was painted — the point was to let the matière's colour
           through it — but on the bare page a 60% white sits a hair off the
           active pill's solid white, and the selected tab stopped reading. */
        className="flex w-full gap-1 rounded-lg border border-border bg-surface-muted p-1 md:w-auto md:self-start dark:bg-surface"
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
                "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[calc(13px*var(--ts))] font-medium transition md:h-10 md:flex-none md:px-4 md:text-sm",
                active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-brand-600")} />
              <span className="truncate">{t.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-[calc(11px*var(--ts))] tabular-nums",
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
            {/* Section mark: the condensed row loses the page's identity block,
                so the book says "you're still inside a matière" before the
                picker says which one. Hidden on the narrowest screens, where
                every pixel of the row belongs to the picker and the tabs. */}
            <SubjectsIcon className="hidden size-6 shrink-0 sm:block" />
            <SubjectPicker subjects={siblings} active={subject} />
            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
            <div
              role="tablist"
              aria-label="شعب المادّة"
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
                      "inline-flex h-10 flex-1 items-center justify-center rounded-md px-2 text-[calc(13px*var(--ts))] font-medium transition md:flex-none md:px-3.5",
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
            onOpen={(path) => show(`«${path.title}» — قريب`)}
          />
        )}
        {tab === "chapitres" && (
          <ChapitresTab
            // Remount on matière change so the open chapter resets with it.
            key={subject.id}
            chapters={myChapters}
            subjectId={subject.id}
            onRead={setPdf}
            onQuiz={(quiz) => show(`«${quiz.title}» — قريب`)}
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
