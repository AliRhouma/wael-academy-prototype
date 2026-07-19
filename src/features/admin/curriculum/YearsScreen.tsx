import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, ChevronRight, Layers, Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Year } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

function YearCard({
  year,
  count,
  onOpen,
  onEdit,
  onDelete,
}: {
  year: Year
  count: number
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
        <BookOpen className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
          {year.name}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          {count > 0 ? `${count} matière${count > 1 ? "s" : ""}` : "Aucune matière"}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
      <div onClick={(e) => e.stopPropagation()}>
        <OverflowMenu
          actions={[
            { label: "Modifier", icon: Pencil, onClick: onEdit },
            { label: "Supprimer", icon: Trash2, tone: "danger", onClick: onDelete },
          ]}
        />
      </div>
    </div>
  )
}

/** Admin — the curriculum: study years (and streams, grouped) + subject counts. */
export default function AdminYearsScreen() {
  const navigate = useNavigate()
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const addYear = useData((s) => s.addYear)
  const updateYear = useData((s) => s.updateYear)
  const removeYear = useData((s) => s.removeYear)
  const { show, toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Year | null>(null)
  const [name, setName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Year | null>(null)

  const countByYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of subjects) m.set(s.yearId, (m.get(s.yearId) ?? 0) + 1)
    return m
  }, [subjects])

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const countFor = (y: Year) => countByYear.get(y.id) ?? 0

  function openAdd() {
    setEditing(null)
    setName("")
    setFormOpen(true)
  }

  function openEdit(year: Year) {
    setEditing(year)
    setName(year.name)
    setFormOpen(true)
  }

  function submit() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    if (editing) {
      updateYear(editing.id, { name: trimmedName })
      show("Année modifiée")
    } else {
      addYear({ name: trimmedName, order: years.length })
      show("Année ajoutée")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeYear(deleteTarget.id)
    show("Année supprimée")
    setDeleteTarget(null)
  }

  const isEmpty = years.length === 0
  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter une année
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Années & matières"
        subtitle="Le programme de l’académie — chaque année regroupe ses matières."
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Layers}
            title="Aucune année"
            description="Commencez par créer une année du programme (ex. 7ème année, Bac — Mathématiques)."
            action={addButton}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedYears.map((y) => (
            <YearCard
              key={y.id}
              year={y}
              count={countFor(y)}
              onOpen={() => navigate(y.id)}
              onEdit={() => openEdit(y)}
              onDelete={() => setDeleteTarget(y)}
            />
          ))}
        </div>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier l’année" : "Nouvelle année"}
        description={
          editing
            ? undefined
            : "Le nom porte le niveau et la filière (ex. « Bac — Mathématiques »)."
        }
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de l’année</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. 7ème année · Bac — Mathématiques"
            autoFocus
          />
        </label>
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cette année ?"
        description={
          deleteTarget
            ? `« ${deleteTarget.name} » et ses ${countFor(deleteTarget)} matière(s) seront supprimées. Cette action est définitive.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
