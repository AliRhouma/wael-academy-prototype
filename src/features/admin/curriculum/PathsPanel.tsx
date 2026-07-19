import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Pencil, Plus, Route, Trash2, X } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Lesson, Path, PathItem, Quiz, Subject, Year } from "@/data/types"
import { LESSON_KINDS, QUIZ_ICON } from "./content"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Resolve a path item to its icon + label from the current lesson/quiz maps. */
function useItemLookup(subjectLessons: Lesson[], subjectQuizzes: Quiz[]) {
  return useMemo(() => {
    const lessons = new Map(subjectLessons.map((l) => [l.id, l]))
    const quizzes = new Map(subjectQuizzes.map((q) => [q.id, q]))
    return (item: PathItem) => {
      if (item.refType === "lesson") {
        const l = lessons.get(item.refId)
        if (!l) return null
        const meta = LESSON_KINDS[l.kind]
        return { title: l.title, label: meta.label, icon: meta.icon, tone: "brand" as const }
      }
      const q = quizzes.get(item.refId)
      if (!q) return null
      return { title: q.title, label: "Quiz", icon: QUIZ_ICON, tone: "info" as const }
    }
  }, [subjectLessons, subjectQuizzes])
}

/** The "Parcours" tab — ordered learning paths built from the subject's content. */
export function PathsPanel({ year, subject }: { year: Year; subject: Subject }) {
  const allPaths = useData((s) => s.paths)
  const allLessons = useData((s) => s.lessons)
  const allQuizzes = useData((s) => s.quizzes)
  const addPath = useData((s) => s.addPath)
  const updatePath = useData((s) => s.updatePath)
  const removePath = useData((s) => s.removePath)
  const { show, toast } = useToast()

  const paths = useMemo(
    () => allPaths.filter((p) => p.subjectId === subject.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allPaths, subject.id],
  )

  const subjectLessons = useMemo(
    () =>
      allLessons
        .filter((l) => l.subjectIds.includes(subject.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allLessons, subject.id],
  )
  const subjectQuizzes = useMemo(
    () =>
      allQuizzes
        .filter((q) => q.subjectIds.includes(subject.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allQuizzes, subject.id],
  )

  const lookup = useItemLookup(subjectLessons, subjectQuizzes)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Path | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<PathItem[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Path | null>(null)

  function openAdd() {
    setEditing(null)
    setTitle("")
    setDescription("")
    setItems([])
    setFormOpen(true)
  }

  function openEdit(path: Path) {
    setEditing(path)
    setTitle(path.title)
    setDescription(path.description ?? "")
    setItems(path.items.map((it) => ({ ...it })))
    setFormOpen(true)
  }

  function addItem(refType: PathItem["refType"], refId: string) {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), refType, refId }])
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }
  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const patch = {
      title: trimmed,
      description: description.trim() || undefined,
      subjectId: subject.id,
      yearId: year.id,
      items,
    }
    if (editing) {
      updatePath(editing.id, patch)
      show("Parcours modifié")
    } else {
      addPath({ ...patch, order: paths.length })
      show("Parcours créé")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removePath(deleteTarget.id)
    show("Parcours supprimé")
    setDeleteTarget(null)
  }

  const usedIds = new Set(items.map((it) => it.refId))
  const availableLessons = subjectLessons.filter((l) => !usedIds.has(l.id))
  const availableQuizzes = subjectQuizzes.filter((q) => !usedIds.has(q.id))
  const nothingToAdd = subjectLessons.length === 0 && subjectQuizzes.length === 0

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Créer un parcours
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {paths.length > 0
            ? `${paths.length} parcours`
            : "Aucun parcours pour le moment"}
        </p>
        {paths.length > 0 && addButton}
      </div>

      {paths.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Route}
            title="Aucun parcours"
            description="Composez un chemin ordonné (cours → exercice → quiz…) que l'élève suit pas à pas."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {paths.map((path) => {
            const steps = path.items.map(lookup).filter(Boolean) as NonNullable<ReturnType<typeof lookup>>[]
            return (
              <li
                key={path.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-grad text-ink-inverted shadow-brand">
                    <Route className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="font-display text-[15px] font-bold text-ink">
                      {path.title}
                    </p>
                    {path.description && (
                      <p dir="auto" className="mt-0.5 text-[13px] text-ink-muted">
                        {path.description}
                      </p>
                    )}
                    <p className="mt-1 text-[12px] font-medium text-brand-600">
                      {steps.length} étape{steps.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <OverflowMenu
                    actions={[
                      { label: "Modifier", icon: Pencil, onClick: () => openEdit(path) },
                      {
                        label: "Supprimer",
                        icon: Trash2,
                        tone: "danger",
                        onClick: () => setDeleteTarget(path),
                      },
                    ]}
                  />
                </div>

                {steps.length > 0 && (
                  <ol className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
                    {steps.map((step, i) => {
                      const Icon = step.icon
                      return (
                        <li key={i} className="flex items-center gap-2.5">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-[11px] font-bold text-ink-subtle tabular-nums">
                            {i + 1}
                          </span>
                          <span
                            className={
                              "grid size-7 shrink-0 place-items-center rounded-md " +
                              (step.tone === "info" ? "bg-info-50 text-info-600" : "bg-brand-50 text-brand-600")
                            }
                          >
                            <Icon className="size-4" />
                          </span>
                          <span dir="auto" className="min-w-0 flex-1 truncate text-[13px] text-ink-subtle">
                            {step.title}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                            {step.label}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier le parcours" : "Nouveau parcours"}
        description={editing ? undefined : "Un chemin ordonné de contenus et de quiz de cette matière."}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Parcours — Démarrer en Analyse"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Description <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <textarea
            className="min-h-[72px] w-full rounded-md border border-input bg-input-bg px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20 text-start"
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce que l'élève va accomplir en suivant ce parcours…"
          />
        </label>

        {/* Ordered steps builder */}
        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">
            Étapes du parcours <span className="font-normal text-ink-muted">({items.length})</span>
          </span>
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
              Aucune étape — ajoutez des contenus et quiz ci-dessous, puis ordonnez-les.
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {items.map((it, i) => {
                const info = lookup(it)
                if (!info) return null
                const Icon = info.icon
                return (
                  <li
                    key={it.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-surface p-1.5 ps-2.5"
                  >
                    <span className="text-[12px] font-bold text-ink-subtle tabular-nums">{i + 1}</span>
                    <span
                      className={
                        "grid size-7 shrink-0 place-items-center rounded-md " +
                        (info.tone === "info" ? "bg-info-50 text-info-600" : "bg-brand-50 text-brand-600")
                      }
                    >
                      <Icon className="size-4" />
                    </span>
                    <span dir="auto" className="min-w-0 flex-1 truncate text-[13px] text-ink">
                      {info.title}
                    </span>
                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        className="grid size-8 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, 1)}
                        className="grid size-8 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Retirer l'étape"
                        onClick={() => removeItem(it.id)}
                        className="grid size-8 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Available content to add */}
        {nothingToAdd ? (
          <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
            Cette matière n'a pas encore de contenus ni de quiz à ajouter.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {availableLessons.length > 0 && (
              <AddGroup
                heading="Contenus"
                rows={availableLessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  label: LESSON_KINDS[l.kind].label,
                  Icon: LESSON_KINDS[l.kind].icon,
                  tone: "brand" as const,
                  onAdd: () => addItem("lesson", l.id),
                }))}
              />
            )}
            {availableQuizzes.length > 0 && (
              <AddGroup
                heading="Quiz"
                rows={availableQuizzes.map((q) => ({
                  id: q.id,
                  title: q.title,
                  label: "Quiz",
                  Icon: QUIZ_ICON,
                  tone: "info" as const,
                  onAdd: () => addItem("quiz", q.id),
                }))}
              />
            )}
            {availableLessons.length === 0 && availableQuizzes.length === 0 && (
              <p className="text-sm text-ink-muted">Tout le contenu de la matière est déjà dans le parcours.</p>
            )}
          </div>
        )}
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer ce parcours ?"
        description={deleteTarget ? `« ${deleteTarget.title} » sera définitivement supprimé.` : undefined}
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}

type AddRow = {
  id: string
  title: string
  label: string
  Icon: (typeof LESSON_KINDS)["cours"]["icon"]
  tone: "brand" | "info"
  onAdd: () => void
}

/** A titled group of "+ add" rows in the path builder. */
function AddGroup({ heading, rows }: { heading: string; rows: AddRow[] }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted">{heading}</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const Icon = row.Icon
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={row.onAdd}
                className="flex w-full items-center gap-2.5 rounded-md border border-border bg-surface p-2 text-start transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span
                  className={
                    "grid size-7 shrink-0 place-items-center rounded-md " +
                    (row.tone === "info" ? "bg-info-50 text-info-600" : "bg-brand-50 text-brand-600")
                  }
                >
                  <Icon className="size-4" />
                </span>
                <span dir="auto" className="min-w-0 flex-1 truncate text-[13px] text-ink-subtle">
                  {row.title}
                </span>
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {row.label}
                </span>
                <Plus className="size-4 shrink-0 text-brand-600" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
