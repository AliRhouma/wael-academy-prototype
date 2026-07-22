import { useMemo, useRef, useState } from "react"
import { Check, FileText, Paperclip, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { useData } from "@/stores/useData"
import type { Resource } from "@/data/types"
import { resourceLabel } from "./LiveSessionPickers"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** The inline create / edit form for one resource (name optional + a PDF file). */
function ResourceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Resource | null
  onSave: (name: string | undefined, fileName: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [fileName, setFileName] = useState(initial?.pdf.name ?? "")
  const fileRef = useRef<HTMLInputElement>(null)

  const canSave = fileName.trim() !== ""

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFileName(f.name)
    // Allow re-picking the same file name later.
    e.target.value = ""
  }

  return (
    <div className="space-y-3 rounded-md border border-brand-200 bg-brand-50/40 p-3">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-subtle">
          Nom <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <input
          className={INPUT + " text-start"}
          dir="auto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Fiche de révision — Intégrales"
          autoFocus
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-ink-subtle">Fichier PDF</span>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={pickFile}
        />
        {fileName ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <FileText className="size-4 shrink-0 text-danger-500" />
            <span dir="auto" className="min-w-0 flex-1 truncate text-sm text-ink">
              {fileName}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 text-[12px] font-medium text-brand-600 hover:underline"
            >
              Remplacer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-surface px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-300 hover:text-brand-600"
          >
            <Upload className="size-4" /> Choisir un PDF
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-md border border-border-strong bg-surface px-3.5 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave(name.trim() || undefined, fileName.trim())}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-grad px-3.5 text-sm font-medium text-ink-inverted shadow-brand transition hover:brightness-105 disabled:opacity-50"
        >
          <Check className="size-4" /> {initial ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </div>
  )
}

/**
 * The "ressources" section of the live-session form: a small library manager
 * embedded in the sheet. Admin can SELECT which resources attach to the session,
 * and CREATE / EDIT / DELETE resources in place (they live in the shared store,
 * so a resource can be reused across sessions). Delete confirms inline — no nested
 * dialog. Editing / deleting here ripples everywhere the resource is used.
 */
export function ResourcePicker({
  resourceIds,
  onChange,
}: {
  resourceIds: string[]
  onChange: (ids: string[]) => void
}) {
  const resources = useData((s) => s.resources)
  const addResource = useData((s) => s.addResource)
  const updateResource = useData((s) => s.updateResource)
  const removeResource = useData((s) => s.removeResource)

  // Which inline form is open: "new", a resource id (editing), or null (closed).
  const [editing, setEditing] = useState<"new" | string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const picked = useMemo(() => new Set(resourceIds), [resourceIds])
  const sorted = useMemo(
    () => [...resources].sort((a, b) => resourceLabel(a).localeCompare(resourceLabel(b), "fr")),
    [resources],
  )

  function toggle(id: string) {
    onChange(picked.has(id) ? resourceIds.filter((r) => r !== id) : [...resourceIds, id])
  }

  function saveNew(name: string | undefined, fileName: string) {
    const created = addResource({ name, pdf: { name: fileName } })
    // A freshly-created resource is attached to the session straight away.
    onChange([...resourceIds, created.id])
    setEditing(null)
  }

  function saveEdit(id: string, name: string | undefined, fileName: string) {
    updateResource(id, { name, pdf: { name: fileName } })
    setEditing(null)
  }

  function doDelete(id: string) {
    removeResource(id)
    setConfirmDelete(null)
    if (editing === id) setEditing(null)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
          <Paperclip className="size-4 text-ink-muted" />
          Ressources{" "}
          <span className="font-normal text-ink-muted">({resourceIds.length})</span>
        </span>
        {editing !== "new" && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-[13px] font-medium text-brand-600 transition hover:border-brand-200"
          >
            <Plus className="size-4" /> Nouvelle
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-3">
          <ResourceForm initial={null} onSave={saveNew} onCancel={() => setEditing(null)} />
        </div>
      )}

      {sorted.length === 0 && editing !== "new" ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Aucune ressource. Ajoutez un document PDF avec « Nouvelle ».
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((r) => {
            const active = picked.has(r.id)
            if (editing === r.id) {
              return (
                <li key={r.id}>
                  <ResourceForm
                    initial={r}
                    onSave={(name, fileName) => saveEdit(r.id, name, fileName)}
                    onCancel={() => setEditing(null)}
                  />
                </li>
              )
            }
            if (confirmDelete === r.id) {
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 text-sm text-danger-700">
                    Supprimer « <span dir="auto" className="font-medium">{resourceLabel(r)}</span> » ?
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="shrink-0 rounded-md px-2.5 py-1 text-[13px] font-medium text-ink-subtle hover:bg-surface"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => doDelete(r.id)}
                    className="shrink-0 rounded-md bg-danger-600 px-2.5 py-1 text-[13px] font-medium text-ink-inverted hover:brightness-105"
                  >
                    Supprimer
                  </button>
                </li>
              )
            }
            return (
              <li
                key={r.id}
                className={
                  "flex items-center gap-3 rounded-md border px-3 py-2.5 transition " +
                  (active
                    ? "border-brand-300 bg-brand-50/60"
                    : "border-border bg-surface hover:border-brand-200")
                }
              >
                <button
                  type="button"
                  onClick={() => toggle(r.id)}
                  aria-pressed={active}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                >
                  <span
                    className={
                      "grid size-5 shrink-0 place-items-center rounded-[6px] border transition " +
                      (active
                        ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                        : "border-border-strong bg-surface text-transparent")
                    }
                  >
                    <Check className="size-3.5" />
                  </span>
                  <FileText className="size-4 shrink-0 text-danger-500" />
                  <span className="min-w-0">
                    <span dir="auto" className="block truncate text-sm font-medium text-ink">
                      {resourceLabel(r)}
                    </span>
                    {r.name && (
                      <span dir="auto" className="block truncate text-[12px] text-ink-muted">
                        {r.pdf.name}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label="Modifier la ressource"
                    onClick={() => setEditing(r.id)}
                    className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Supprimer la ressource"
                    onClick={() => setConfirmDelete(r.id)}
                    className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
