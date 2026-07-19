import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookMarked, ChevronRight, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Subject } from "@/data/types"

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

  const lessonCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of allLessons)
      for (const sid of l.subjectIds) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allLessons])

  const quizCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const q of allQuizzes)
      for (const sid of q.subjectIds) m.set(sid, (m.get(sid) ?? 0) + 1)
    return m
  }, [allQuizzes])

  const pathCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of allPaths) m.set(p.subjectId, (m.get(p.subjectId) ?? 0) + 1)
    return m
  }, [allPaths])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [name, setName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)

  if (!year) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={GraduationCap}
          title="Année introuvable"
          description="Cette année n’existe pas ou a été supprimée."
          action={
            <Link
              to="/admin/curriculum"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              <ArrowLeft className="size-4" /> Retour aux années
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
      show("Matière modifiée")
    } else {
      addSubject({ yearId: year.id, name: trimmed, order: subjects.length })
      show("Matière ajoutée")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeSubject(deleteTarget.id)
    show("Matière supprimée")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter une matière
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
          <ArrowLeft className="size-4" /> Années & matières
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
              Programme
            </p>
            <h1 dir="auto" className="font-display text-[26px] font-bold leading-tight text-ink">
              {year.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {subjects.length > 0
                ? `${subjects.length} matière${subjects.length > 1 ? "s" : ""} dans cette année`
                : "Aucune matière pour le moment"}
            </p>
          </div>
          {subjects.length > 0 && <div className="flex shrink-0 items-center gap-2">{addButton}</div>}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={BookMarked}
            title="Aucune matière"
            description="Ajoutez les matières enseignées dans cette année (Maths, Français, Physique…)."
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
              cCount > 0 && `${cCount} chapitre${cCount > 1 ? "s" : ""}`,
              lCount > 0 && `${lCount} contenu${lCount > 1 ? "s" : ""}`,
              qCount > 0 && `${qCount} quiz`,
              pCount > 0 && `${pCount} parcours`,
              eCount > 0 && `${eCount} examen${eCount > 1 ? "s" : ""}`,
            ].filter(Boolean) as string[]
            return (
              <li key={subject.id}>
                <div
                  onClick={() => navigate(subject.id)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-700">
                    <BookMarked className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
                      {subject.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {parts.length > 0 ? parts.join(" · ") : "Aucun contenu"}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
                  <div onClick={(e) => e.stopPropagation()}>
                    <OverflowMenu
                      actions={[
                        { label: "Modifier", icon: Pencil, onClick: () => openEdit(subject) },
                        {
                          label: "Supprimer",
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
        title={editing ? "Modifier la matière" : "Nouvelle matière"}
        description={editing ? undefined : `Ajouter une matière à « ${year.name} ».`}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de la matière</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Mathématiques · الرياضيات"
            autoFocus
          />
        </label>
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cette matière ?"
        description={
          deleteTarget ? `« ${deleteTarget.name} » sera définitivement supprimée.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
