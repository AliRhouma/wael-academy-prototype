import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowRight, BookMarked, ChevronLeft, Copy, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectsIcon } from "@/components/icons/SubjectsIcon"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Subject } from "@/data/types"
import { cycleDef } from "@/data/curriculum"
import { copyName, duplicateSubject } from "./duplicate"
import {
  DuplicateSheet,
  EMPTY_DESTINATION,
  useDestinationName,
  type Destination,
} from "./DuplicateSheet"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Admin — the matières of one year, with add / edit / delete. */
export default function AdminSubjectsScreen() {
  const { yearId } = useParams()
  const navigate = useNavigate()
  const years = useData((s) => s.years)
  const allSubjects = useData((s) => s.subjects)
  const allChapters = useData((s) => s.chapters)
  const allLessons = useData((s) => s.lessons)
  const allQuizzes = useData((s) => s.quizzes)
  const allPaths = useData((s) => s.paths)
  const allExams = useData((s) => s.exams)
  const addSubject = useData((s) => s.addSubject)
  const updateSubject = useData((s) => s.updateSubject)
  const removeSubject = useData((s) => s.removeSubject)
  const { show, toast } = useToast()

  const year = years.find((y) => y.id === yearId)

  const subjects = useMemo(
    () =>
      allSubjects
        .filter((s) => s.yearId === yearId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allSubjects, yearId],
  )

  const chapterCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of allChapters)
      for (const sid of c.subjectIds) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allChapters])

  const examCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of allExams)
      for (const sid of e.subjectIds) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allExams])

  // Content is chapter-owned; a lesson/quiz counts toward every subject its
  // chapter belongs to.
  const chapterSubjects = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const c of allChapters) m.set(c.id, c.subjectIds)
    return m
  }, [allChapters])

  const lessonCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of allLessons)
      for (const sid of chapterSubjects.get(l.chapterId) ?? []) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allLessons, chapterSubjects])

  const quizCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const q of allQuizzes)
      for (const sid of chapterSubjects.get(q.chapterId) ?? []) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allQuizzes, chapterSubjects])

  const pathCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of allPaths) m.set(p.subjectId, (m.get(p.subjectId) ?? 0) + 1)
    return m
  }, [allPaths])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [name, setName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)

  const [dupTarget, setDupTarget] = useState<Subject | null>(null)
  const [dupName, setDupName] = useState("")
  const [dupDest, setDupDest] = useState<Destination>(EMPTY_DESTINATION)
  const dupInto = useDestinationName(dupDest, "year")

  if (!year) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={GraduationCap}
          title="القسم ما تلقاش"
          description="القسم هذا ما موجودش ولا تمسح."
          action={
            <Link
              to="/admin/curriculum"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              <ArrowRight className="size-4" /> ارجع للبرنامج
            </Link>
          }
        />
      </div>
    )
  }

  function openAdd() {
    setEditing(null)
    setName("")
    setFormOpen(true)
  }

  function openEdit(subject: Subject) {
    setEditing(subject)
    setName(subject.name)
    setFormOpen(true)
  }

  function submit() {
    const trimmed = name.trim()
    if (!trimmed || !year) return
    if (editing) {
      updateSubject(editing.id, { name: trimmed })
      show("المادّة تبدّلت")
    } else {
      addSubject({ yearId: year.id, name: trimmed, order: subjects.length })
      show("المادّة تزادت")
    }
    setFormOpen(false)
  }

  function openDuplicate(subject: Subject) {
    setDupTarget(subject)
    setDupName(copyName(subject.name))
    setDupDest({ yearId: year!.id, subjectId: "", chapterId: "" })
  }

  function submitDuplicate() {
    if (!dupTarget) return
    duplicateSubject(dupTarget, { name: dupName.trim(), yearId: dupDest.yearId })
    show(`المادّة تنسخت في «${dupInto}»`)
    setDupTarget(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeSubject(deleteTarget.id)
    show("المادّة تمسحت")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> زيد مادّة
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/curriculum")}
          className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-md text-sm font-medium text-ink-subtle transition hover:text-brand-600"
        >
          <ArrowRight className="size-4" /> البرنامج
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
              {cycleDef(year.cycle).label} · {year.level}
            </p>
            <h1 dir="auto" className="font-display text-[calc(26px*var(--ts))] font-bold leading-tight text-ink">
              {year.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {subjects.length > 0
                ? `${subjects.length} مادّة في القسم هذا`
                : "ما فماش موادّ توّا"}
            </p>
          </div>
          {subjects.length > 0 && <div className="flex shrink-0 items-center gap-2">{addButton}</div>}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={BookMarked}
            title="ما فماش موادّ"
            description="زيد الموادّ اللي تتدرّس في القسم هذا (رياضيات، فرنسية، فيزياء…)."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {subjects.map((subject) => {
            const cCount = chapterCount.get(subject.id) ?? 0
            const lCount = lessonCount.get(subject.id) ?? 0
            const qCount = quizCount.get(subject.id) ?? 0
            const pCount = pathCount.get(subject.id) ?? 0
            const eCount = examCount.get(subject.id) ?? 0
            const parts = [
              cCount > 0 && `${cCount} فصل`,
              lCount > 0 && `${lCount} محتوى`,
              qCount > 0 && `${qCount} كويز`,
              pCount > 0 && `${pCount} parcours`,
              eCount > 0 && `${eCount} امتحان`,
            ].filter(Boolean) as string[]
            return (
              <li key={subject.id}>
                <div
                  onClick={() => navigate(subject.id)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                >
                  {/* The subjects book, same mark as the élève rail and the
                      élève page title — a matière row looks like a matière
                      wherever it is listed. */}
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50">
                    <SubjectsIcon className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="truncate font-display text-[calc(15px*var(--ts))] font-bold text-ink">
                      {subject.name}
                    </p>
                    <p className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">
                      {parts.length > 0 ? parts.join(" · ") : "ما فماش محتوى"}
                    </p>
                  </div>
                  <ChevronLeft className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600 ltr:rotate-180" />
                  <div onClick={(e) => e.stopPropagation()}>
                    <OverflowMenu
                      actions={[
                        { label: "بدّل", icon: Pencil, onClick: () => openEdit(subject) },
                        { label: "اعمل نسخة", icon: Copy, onClick: () => openDuplicate(subject) },
                        {
                          label: "امسح",
                          icon: Trash2,
                          tone: "danger",
                          onClick: () => setDeleteTarget(subject),
                        },
                      ]}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "بدّل المادّة" : "مادّة جديدة"}
        description={editing ? undefined : `زيد مادّة لـ«${year.name}».`}
        submitLabel={editing ? "سجّل" : "زيد"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">اسم المادّة</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: رياضيات"
            autoFocus
          />
        </label>
      </FormSheet>

      <DuplicateSheet
        open={dupTarget !== null}
        onOpenChange={(o) => !o && setDupTarget(null)}
        title="اعمل نسخة من المادّة"
        nameLabel="اسم النسخة"
        name={dupName}
        onNameChange={setDupName}
        depth="year"
        destination={dupDest}
        onDestinationChange={setDupDest}
        note="الفصول والمحتويات والكويزات والمسارات والامتحانات ينتسخو مع المادّة."
        onSubmit={submitDuplicate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="تحبّ تمسح المادّة هذي؟"
        description={
          deleteTarget ? `«${deleteTarget.name}» باش تتمسح نهائيا.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
