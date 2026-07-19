import { useMemo, useState } from "react"
import { ChevronDown, Pencil, Plus, Search, Trash2, Users as UsersIcon } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Role, User } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Role → French label + badge tone (each tone means one thing — foundations §2). */
const ROLE: Record<Role, { label: string; tone: BadgeTone }> = {
  admin: { label: "Admin", tone: "info" },
  teacher: { label: "Enseignant", tone: "brand" },
  parent: { label: "Parent", tone: "warning" },
  student: { label: "Élève", tone: "neutral" },
}

const ROLE_ORDER: Role[] = ["admin", "teacher", "parent", "student"]

/** A quiet muted placeholder for an empty optional cell. */
const dash = <span className="text-ink-muted">—</span>

/** Admin — the people of the academy: one table over every role, filterable. */
export default function AdminUsersScreen() {
  const users = useData((s) => s.users)
  const years = useData((s) => s.years)
  const addUser = useData((s) => s.addUser)
  const updateUser = useData((s) => s.updateUser)
  const removeUser = useData((s) => s.removeUser)
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [yearId, setYearId] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const countByRole = useMemo(() => {
    const m = new Map<Role, number>()
    for (const u of users) m.set(u.role, (m.get(u.role) ?? 0) + 1)
    return m
  }, [users])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter((u) =>
        q === ""
          ? true
          : u.name.toLowerCase().includes(q) ||
            u.phone.toLowerCase().includes(q) ||
            (u.email?.toLowerCase().includes(q) ?? false),
      )
      .sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
          a.name.localeCompare(b.name, "fr"),
      )
  }, [users, roleFilter, query])

  function openAdd() {
    setEditing(null)
    setName("")
    setPhone("")
    setEmail("")
    setRole("student")
    setYearId("")
    setFormOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setName(user.name)
    setPhone(user.phone)
    setEmail(user.email ?? "")
    setRole(user.role)
    setYearId(user.yearId ?? "")
    setFormOpen(true)
  }

  function submit() {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone) return
    const patch = {
      name: trimmedName,
      phone: trimmedPhone,
      email: email.trim() || undefined,
      role,
      // Year only belongs to students; clear it for any other role.
      yearId: role === "student" ? yearId || undefined : undefined,
    }
    if (editing) {
      updateUser(editing.id, patch)
      show("Utilisateur modifié")
    } else {
      addUser(patch)
      show("Utilisateur ajouté")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeUser(deleteTarget.id)
    show("Utilisateur supprimé")
    setDeleteTarget(null)
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Utilisateur",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} />
          <span dir="auto" className="min-w-0 truncate font-display text-[15px] font-bold text-ink">
            {u.name}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (u) => <Badge tone={ROLE[u.role].tone}>{ROLE[u.role].label}</Badge>,
    },
    {
      key: "phone",
      header: "Numéro",
      render: (u) => (
        <span dir="ltr" className="tabular-nums text-ink-subtle">
          {u.phone}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => (u.email ? <span className="text-ink-subtle">{u.email}</span> : dash),
    },
    {
      key: "year",
      header: "Année",
      render: (u) =>
        u.role === "student" && u.yearId ? (
          <span className="text-ink-subtle">{yearName.get(u.yearId) ?? "—"}</span>
        ) : (
          dash
        ),
    },
  ]

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter un utilisateur
    </button>
  )

  const filters: { key: Role | "all"; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: users.length },
    ...ROLE_ORDER.map((r) => ({
      key: r,
      label: `${ROLE[r].label}s`,
      count: countByRole.get(r) ?? 0,
    })),
  ]

  const isEmpty = users.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Utilisateurs"
        subtitle={`${users.length} personne${users.length > 1 ? "s" : ""} — élèves, enseignants, parents et administration.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur"
            description="Ajoutez les élèves, enseignants et parents de l’académie."
            action={addButton}
          />
        </div>
      ) : (
        <>
          {/* Filters: role segmented chips + search — derived display only. */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
              {filters.map((f) => {
                const active = roleFilter === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setRoleFilter(f.key)}
                    className={
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition " +
                      (active
                        ? "border-transparent bg-brand-600 text-ink-inverted"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    {f.label}
                    <span
                      className={
                        "rounded-full px-1.5 text-xs tabular-nums " +
                        (active ? "bg-white/20" : "bg-neutral-100 text-ink-muted")
                      }
                    >
                      {f.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="relative md:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un nom, numéro…"
                className={INPUT + " ps-9"}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(u) => u.id}
            rowActions={(u) => [
              { label: "Modifier", icon: Pencil, onClick: () => openEdit(u) },
              { label: "Supprimer", icon: Trash2, tone: "danger", onClick: () => setDeleteTarget(u) },
            ]}
            empty={
              <div className="rounded-lg border border-dashed border-border bg-surface">
                <EmptyState
                  icon={Search}
                  title="Aucun résultat"
                  description="Aucun utilisateur ne correspond à ce filtre ou à cette recherche."
                />
              </div>
            }
          />
        </>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier l’utilisateur" : "Nouvel utilisateur"}
        description={editing ? undefined : "Ajoutez une personne à l’académie."}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom complet</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Mohamed Ben Salah · محمد بن صالح"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Numéro</span>
          <input
            className={INPUT}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex. +216 29 340 118"
            type="tel"
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Email <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <input
            className={INPUT}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex. mohamed@exemple.tn"
            type="email"
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Rôle</span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {ROLE[r].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>

        {role === "student" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Année</span>
            <div className="relative">
              <select
                className={INPUT + " appearance-none pe-10"}
                value={yearId}
                onChange={(e) => setYearId(e.target.value)}
              >
                <option value="">— Choisir une année —</option>
                {sortedYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            </div>
          </label>
        )}
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cet utilisateur ?"
        description={
          deleteTarget ? `« ${deleteTarget.name} » sera définitivement supprimé.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
