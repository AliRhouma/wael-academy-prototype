import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Layers3, Pencil, Plus, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Chapter, Subject, Year } from "@/data/types"
import { ScopePicker } from "./ScopePicker"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** The "Chapitres" tab of a subject — shared syllabus chapters; each opens its
 * own page where contenus & quiz are created. */
export function ChaptersPanel({ year, subject }: { year: Year; subject: Subject }) {
  const navigate = useNavigate()
  const years = useData((s) => s.years)
  const allChapters = useData((s) => s.chapters)
  const allLessons = useData((s) => s.lessons)
  const allQuizzes = useData((s) => s.quizzes)
  const addChapter = useData((s) => s.addChapter)
  const updateChapter = useData((s) => s.updateChapter)
  const removeChapter = useData((s) => s.removeChapter)
  const { show, toast } = useToast()

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

  const lessonCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of allLessons) m.set(l.chapterId, (m.get(l.chapterId) ?? 0) + 1)
    return m
  }, [allLessons])

  const quizCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const q of allQuizzes) m.set(q.chapterId, (m.get(q.chapterId) ?? 0) + 1)
    return m
  }, [allQuizzes])

  const chapters = useMemo(
    () =>
      allChapters
        .filter((c) => c.subjectIds.includes(subject.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allChapters, subject.id],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Chapter | null>(null)
  const [name, setName] = useState("")
  const [pickedYears, setPickedYears] = useState<string[]>([])
  const [pickedSubjects, setPickedSubjects] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)

  function openAdd() {
    setEditing(null)
    setName("")
    setPickedYears([year.id])
    setPickedSubjects([subject.id])
    setFormOpen(true)
  }

  function openEdit(chapter: Chapter) {
    setEditing(chapter)
    setName(chapter.name)
    setPickedYears(chapter.yearIds)
    setPickedSubjects(chapter.subjectIds)
    setFormOpen(true)
  }

  function submit() {
    const trimmed = name.trim()
    if (!trimmed || pickedSubjects.length === 0 || pickedYears.length === 0) return
    if (editing) {
      updateChapter(editing.id, { name: trimmed, subjectIds: pickedSubjects, yearIds: pickedYears })
      show("Chapitre modifié")
    } else {
      addChapter({
        name: trimmed,
        subjectIds: pickedSubjects,
        yearIds: pickedYears,
        order: chapters.length,
      })
      show("Chapitre ajouté")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeChapter(deleteTarget.id)
    show("Chapitre supprimé")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter un chapitre
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {chapters.length > 0
            ? `${chapters.length} chapitre${chapters.length > 1 ? "s" : ""}`
            : "Aucun chapitre pour le moment"}
        </p>
        {chapters.length > 0 && addButton}
      </div>

      {chapters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Layers3}
            title="Aucun chapitre"
            description="Ajoutez les chapitres du programme, puis ouvrez-les pour y créer contenus et quiz."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {chapters.map((chapter) => {
            const otherYears = chapter.yearIds.filter((yid) => yid !== year.id)
            const lc = lessonCount.get(chapter.id) ?? 0
            const qc = quizCount.get(chapter.id) ?? 0
            const parts = [
              lc > 0 && `${lc} contenu${lc > 1 ? "s" : ""}`,
              qc > 0 && `${qc} quiz`,
            ].filter(Boolean) as string[]
            return (
              <li key={chapter.id}>
                <div
                  onClick={() => navigate(chapter.id)}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                >
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                    <Layers3 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="font-display text-[15px] font-bold text-ink">
                      {chapter.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone="brand" dot>
                        {year.name}
                      </Badge>
                      {otherYears.map((yid) => (
                        <Badge key={yid} tone="neutral">
                          {yearName.get(yid) ?? "—"}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[12px] text-ink-muted">
                      {parts.length > 0 ? parts.join(" · ") : "Aucun contenu — ouvrez pour en ajouter"}
                    </p>
                  </div>
                  <ChevronRight className="mt-2 size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
                  <div onClick={(e) => e.stopPropagation()}>
                    <OverflowMenu
                      actions={[
                        { label: "Modifier", icon: Pencil, onClick: () => openEdit(chapter) },
                        {
                          label: "Supprimer",
                          icon: Trash2,
                          tone: "danger",
                          onClick: () => setDeleteTarget(chapter),
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
        title={editing ? "Modifier le chapitre" : "Nouveau chapitre"}
        description={
          editing
            ? undefined
            : "Un chapitre peut être partagé entre plusieurs matières et plusieurs années."
        }
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom du chapitre</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Limites et continuité · النص الحجاجي"
            autoFocus
          />
        </label>

        <ScopePicker
          yearIds={pickedYears}
          subjectIds={pickedSubjects}
          onYearsChange={setPickedYears}
          onSubjectsChange={setPickedSubjects}
        />
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer ce chapitre ?"
        description={
          deleteTarget
            ? `« ${deleteTarget.name} » et tout son contenu (contenus & quiz) seront définitivement supprimés.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
