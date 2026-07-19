import { useMemo, useState } from "react"
import { ChevronDown, Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Group } from "@/data/types"
import { MemberPicker } from "./MemberPicker"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Admin — student groups (e.g. « Excellents — 2ème Sciences »): title + roster. */
export default function AdminGroupsScreen() {
  const groups = useData((s) => s.groups)
  const years = useData((s) => s.years)
  const users = useData((s) => s.users)
  const addGroup = useData((s) => s.addGroup)
  const updateGroup = useData((s) => s.updateGroup)
  const removeGroup = useData((s) => s.removeGroup)
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [title, setTitle] = useState("")
  const [yearId, setYearId] = useState("")
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)

  const yearName = useMemo(() => new Map(years.map((y) => [y.id, y.name])), [years])
  const studentName = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groups
      .filter((g) =>
        q === ""
          ? true
          : g.title.toLowerCase().includes(q) ||
            (g.yearId ? (yearName.get(g.yearId)?.toLowerCase().includes(q) ?? false) : false),
      )
      .sort((a, b) => a.title.localeCompare(b.title, "fr"))
  }, [groups, query, yearName])

  function openAdd() {
    setEditing(null)
    setTitle("")
    setYearId("")
    setStudentIds([])
    setFormOpen(true)
  }

  function openEdit(group: Group) {
    setEditing(group)
    setTitle(group.title)
    setYearId(group.yearId ?? "")
    setStudentIds(group.studentIds)
    setFormOpen(true)
  }

  const canSubmit = title.trim() !== ""

  function submit() {
    if (!canSubmit) return
    const patch = {
      title: title.trim(),
      yearId: yearId || undefined,
      studentIds,
    }
    if (editing) {
      updateGroup(editing.id, patch)
      show("Groupe modifié")
    } else {
      addGroup(patch)
      show("Groupe créé")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeGroup(deleteTarget.id)
    show("Groupe supprimé")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Créer un groupe
    </button>
  )

  const isEmpty = groups.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Groupes"
        subtitle={`${groups.length} groupe${groups.length > 1 ? "s" : ""} d’élèves — des classes nommées pour organiser les séances.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={UsersRound}
            title="Aucun groupe"
            description="Créez un groupe d’élèves (ex. « Excellents — 2ème Sciences ») pour planifier ses séances."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un groupe, une année…"
              className={INPUT + " ps-9"}
            />
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface">
              <EmptyState
                icon={Search}
                title="Aucun résultat"
                description="Aucun groupe ne correspond à cette recherche."
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((g) => {
                const members = g.studentIds
                return (
                  <div
                    key={g.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
                  >
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                      <UsersRound className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p dir="auto" className="font-display text-[15px] font-bold text-ink">
                        {g.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {g.yearId && <Badge tone="brand" dot>{yearName.get(g.yearId) ?? "—"}</Badge>}
                        <span className="text-[12px] text-ink-muted">
                          {members.length > 0
                            ? `${members.length} élève${members.length > 1 ? "s" : ""}`
                            : "Aucun élève"}
                        </span>
                      </div>

                      {members.length > 0 && (
                        <div className="mt-3 flex items-center">
                          <div className="flex -space-x-2">
                            {members.slice(0, 5).map((id) => (
                              <Avatar
                                key={id}
                                name={studentName.get(id) ?? "?"}
                                size="sm"
                                className="ring-2 ring-surface"
                              />
                            ))}
                          </div>
                          {members.length > 5 && (
                            <span className="ms-2 text-[12px] font-medium text-ink-muted">
                              +{members.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <OverflowMenu
                      actions={[
                        { label: "Modifier", icon: Pencil, onClick: () => openEdit(g) },
                        {
                          label: "Supprimer",
                          icon: Trash2,
                          tone: "danger",
                          onClick: () => setDeleteTarget(g),
                        },
                      ]}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier le groupe" : "Nouveau groupe"}
        description={
          editing ? undefined : "Un nom et la liste des élèves qui en font partie."
        }
        submitLabel={editing ? "Enregistrer" : "Créer"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom du groupe</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Excellents — 2ème Sciences"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Année <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
            >
              <option value="">— Aucune —</option>
              {sortedYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>

        <MemberPicker
          studentIds={studentIds}
          onChange={setStudentIds}
          defaultYearId={yearId || undefined}
        />
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer ce groupe ?"
        description={
          deleteTarget
            ? `« ${deleteTarget.title} » sera supprimé et retiré de ses séances.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
