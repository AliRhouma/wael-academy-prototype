import { useMemo, useState } from "react"
import { Layers3, Pencil, Plus, Trash2 } from "lucide-react"
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

/** The "Chapitres" tab of a subject — the shared syllabus chapters. */
export function ChaptersPanel({ year, subject }: { year: Year; subject: Subject }) {
  const years = useData((s) => s.years)
  const allChapters = useData((s) => s.chapters)
  const addChapter = useData((s) => s.addChapter)
  const updateChapter = useData((s) => s.updateChapter)
  const removeChapter = useData((s) => s.removeChapter)
  const { show, toast } = useToast()

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

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
            description="Ajoutez les chapitres du programme (ex. Nombres complexes, Limites et continuité…)."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {chapters.map((chapter) => {
            const otherYears = chapter.yearIds.filter((yid) => yid !== year.id)
            return (
              <li
                key={chapter.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
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
                    {chapter.subjectIds.length > 1 && (
                      <span className="text-[12px] text-ink-muted">
                        · {chapter.subjectIds.length} matières
                      </span>
                    )}
                  </div>
                </div>
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
          deleteTarget ? `« ${deleteTarget.name} » sera définitivement supprimé.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
