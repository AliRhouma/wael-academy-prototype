import { useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  History,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users as UsersIcon,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Role, User, UserFieldChange } from "@/data/types"
import { UserHistorySheet } from "./UserHistorySheet"

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

/** "12 sept. 2025" — compact date for the audit columns. */
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" })
const day = (iso: string) => DAY.format(new Date(iso))

/**
 * The table's columns, as toggleable defs. `locked` columns (the identity cell)
 * can't be hidden; `defaultOn: false` ones start hidden behind the "Colonnes"
 * menu so the default view stays scannable.
 */
const COLUMN_DEFS: { key: string; label: string; locked?: boolean; defaultOn: boolean }[] = [
  { key: "name", label: "Utilisateur", locked: true, defaultOn: true },
  { key: "role", label: "Rôle", defaultOn: true },
  { key: "phone", label: "Numéro", defaultOn: true },
  { key: "email", label: "Email", defaultOn: true },
  { key: "years", label: "Année(s)", defaultOn: true },
  { key: "city", label: "Ville", defaultOn: false },
  { key: "town", label: "Localité", defaultOn: false },
  { key: "school", label: "École", defaultOn: false },
  { key: "moyenne", label: "Moyenne générale", defaultOn: false },
  { key: "createdAt", label: "Créé le", defaultOn: false },
  { key: "updatedAt", label: "Modifié le", defaultOn: true },
]

/** Field → French label, used to write the history summary of an edit. */
const FIELD_LABEL: Record<string, string> = {
  name: "Nom",
  phone: "Téléphone",
  email: "Email",
  role: "Rôle",
  yearIds: "Années",
  city: "Ville",
  town: "Localité",
  school: "École",
  moyenneGenerale: "Moyenne générale",
}

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
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(COLUMN_DEFS.filter((c) => c.defaultOn).map((c) => c.key)),
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [city, setCity] = useState("")
  const [town, setTown] = useState("")
  const [school, setSchool] = useState("")
  const [moyenne, setMoyenne] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [historyTarget, setHistoryTarget] = useState<User | null>(null)

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
            (u.email?.toLowerCase().includes(q) ?? false) ||
            (u.city?.toLowerCase().includes(q) ?? false) ||
            (u.school?.toLowerCase().includes(q) ?? false),
      )
      .sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
          a.name.localeCompare(b.name, "fr"),
      )
  }, [users, roleFilter, query])

  function resetForm() {
    setName("")
    setPhone("")
    setPhoneError("")
    setEmail("")
    setRole("student")
    setYearIds([])
    setCity("")
    setTown("")
    setSchool("")
    setMoyenne("")
  }

  function openAdd() {
    setEditing(null)
    resetForm()
    setFormOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setName(user.name)
    setPhone(user.phone)
    setPhoneError("")
    setEmail(user.email ?? "")
    setRole(user.role)
    setYearIds(user.yearIds ?? [])
    setCity(user.city ?? "")
    setTown(user.town ?? "")
    setSchool(user.school ?? "")
    setMoyenne(user.moyenneGenerale != null ? String(user.moyenneGenerale) : "")
    setFormOpen(true)
  }

  function toggleYear(id: string) {
    setYearIds((ids) => (ids.includes(id) ? ids.filter((y) => y !== id) : [...ids, id]))
  }

  function submit() {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone) return

    // Phone is the unique identifier — refuse a duplicate with an inline error.
    const taken = users.some((u) => u.phone.trim() === trimmedPhone && u.id !== editing?.id)
    if (taken) {
      setPhoneError("Ce numéro est déjà utilisé par un autre utilisateur.")
      return
    }

    const parsedMoyenne = moyenne.trim() === "" ? undefined : Number(moyenne.replace(",", "."))
    const isStudent = role === "student"
    const patch = {
      name: trimmedName,
      phone: trimmedPhone,
      email: email.trim() || undefined,
      role,
      // Cardinality by role: student ≤ 1, teacher/parent 0..*, admin none.
      yearIds:
        role === "admin" ? undefined : isStudent ? yearIds.slice(0, 1) : yearIds,
      city: city.trim() || undefined,
      town: town.trim() || undefined,
      school: isStudent ? school.trim() || undefined : undefined,
      moyenneGenerale:
        isStudent && parsedMoyenne != null && !Number.isNaN(parsedMoyenne)
          ? parsedMoyenne
          : undefined,
    }

    if (editing) {
      // Diff the save field by field so the history can show before → after.
      // Values are stored pre-formatted (role label, year names, "x / 20").
      const fmt = (k: keyof typeof patch, v: unknown): string | undefined => {
        if (v == null || v === "") return undefined
        if (k === "role") return ROLE[v as Role].label
        if (k === "yearIds") {
          const ids = v as string[]
          return ids.length > 0 ? ids.map((id) => yearName.get(id) ?? "—").join(" · ") : undefined
        }
        if (k === "moyenneGenerale") return `${(v as number).toFixed(2).replace(".", ",")} / 20`
        return String(v)
      }
      const changes: UserFieldChange[] = (Object.keys(patch) as (keyof typeof patch)[])
        .filter((k) =>
          k === "yearIds"
            ? [...(patch.yearIds ?? [])].sort().join() !==
              [...(editing.yearIds ?? [])].sort().join()
            : patch[k] !== editing[k],
        )
        .map((k) => ({
          field: FIELD_LABEL[k],
          before: fmt(k, editing[k]),
          after: fmt(k, patch[k]),
        }))
        // A no-op pair (both empty, e.g. "" vs undefined) isn't a real change.
        .filter((c) => c.before !== c.after)
      updateUser(editing.id, patch, changes)
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

  const allColumns: Column<User>[] = [
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
      key: "years",
      header: "Année(s)",
      render: (u) =>
        u.yearIds && u.yearIds.length > 0 ? (
          <span className="text-ink-subtle">
            {u.yearIds.map((id) => yearName.get(id) ?? "—").join(" · ")}
          </span>
        ) : (
          dash
        ),
    },
    {
      key: "city",
      header: "Ville",
      render: (u) => (u.city ? <span className="text-ink-subtle">{u.city}</span> : dash),
    },
    {
      key: "town",
      header: "Localité",
      render: (u) => (u.town ? <span className="text-ink-subtle">{u.town}</span> : dash),
    },
    {
      key: "school",
      header: "École",
      render: (u) => (u.school ? <span className="text-ink-subtle">{u.school}</span> : dash),
    },
    {
      key: "moyenne",
      header: "Moyenne",
      render: (u) =>
        u.moyenneGenerale != null ? (
          <span className="tabular-nums text-ink-subtle">
            {u.moyenneGenerale.toFixed(2).replace(".", ",")}
            <span className="text-ink-muted"> / 20</span>
          </span>
        ) : (
          dash
        ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (u) => <span className="whitespace-nowrap text-ink-subtle">{day(u.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      header: "Modifié le",
      render: (u) => (
        <span className="whitespace-nowrap text-ink-subtle">
          {day(u.updatedAt)}
          {u.history.length > 0 && (
            <span className="ms-1.5 rounded-full bg-neutral-100 px-1.5 text-xs tabular-nums text-ink-muted">
              {u.history.length}
            </span>
          )}
        </span>
      ),
    },
  ]

  const columns = allColumns.filter((c) => visibleCols.has(c.key))

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
  const isStudent = role === "student"
  const showYears = role !== "admin"

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
          {/* Filters: role segmented chips + search + column visibility. */}
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

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un nom, numéro…"
                  className={INPUT + " ps-9"}
                />
              </div>

              {/* Column picker — checkable menu; identity column stays locked. */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Choisir les colonnes"
                    title="Colonnes affichées"
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
                  >
                    <Settings2 className="size-4" />
                    <span className="hidden sm:inline">Colonnes</span>
                    <span className="rounded-full bg-neutral-100 px-1.5 text-xs tabular-nums text-ink-muted">
                      {visibleCols.size}
                    </span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-[14rem] rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
                  >
                    <DropdownMenu.Label className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                      Colonnes affichées
                    </DropdownMenu.Label>
                    {COLUMN_DEFS.map((def) => {
                      const on = visibleCols.has(def.key)
                      return (
                        <DropdownMenu.CheckboxItem
                          key={def.key}
                          checked={on}
                          disabled={def.locked}
                          // Keep the menu open so several columns toggle in one visit.
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(next) =>
                            setVisibleCols((prev) => {
                              const s = new Set(prev)
                              if (next) s.add(def.key)
                              else s.delete(def.key)
                              return s
                            })
                          }
                          className={
                            "flex min-h-[40px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none transition data-[highlighted]:bg-surface-muted " +
                            (def.locked ? "cursor-default opacity-50" : "text-ink")
                          }
                        >
                          <span
                            className={
                              "grid size-4.5 shrink-0 place-items-center rounded border transition " +
                              (on
                                ? "border-transparent bg-grad text-ink-inverted"
                                : "border-border-strong bg-surface text-transparent")
                            }
                          >
                            <Check className="size-3" />
                          </span>
                          {def.label}
                        </DropdownMenu.CheckboxItem>
                      )
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(u) => u.id}
            rowActions={(u) => [
              { label: "Historique", icon: History, onClick: () => setHistoryTarget(u) },
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
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Numéro <span className="font-normal text-ink-muted">(unique)</span>
          </span>
          <input
            className={
              INPUT +
              (phoneError ? " border-danger-600 focus:border-danger-600 focus:ring-danger-600/20" : "")
            }
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (phoneError) setPhoneError("")
            }}
            placeholder="Ex. +216 29 340 118"
            type="tel"
            dir="ltr"
          />
          {phoneError && <span className="mt-1.5 block text-sm text-danger-600">{phoneError}</span>}
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

        {/* Year(s) — student picks at most ONE; teacher/parent pick any number. */}
        {showYears && isStudent && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Année <span className="font-normal text-ink-muted">(optionnel)</span>
            </span>
            <div className="relative">
              <select
                className={INPUT + " appearance-none pe-10"}
                value={yearIds[0] ?? ""}
                onChange={(e) => setYearIds(e.target.value ? [e.target.value] : [])}
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

        {showYears && !isStudent && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Années{" "}
              <span className="font-normal text-ink-muted">
                ({role === "teacher" ? "niveaux enseignés" : "niveaux des enfants"} — optionnel)
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sortedYears.map((y) => {
                const on = yearIds.includes(y.id)
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => toggleYear(y.id)}
                    className={
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition " +
                      (on
                        ? "border-transparent bg-brand-600 text-ink-inverted"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    {on && <Check className="size-3.5" />}
                    {y.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Ville <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              className={INPUT}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex. Tunis"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Localité <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              className={INPUT}
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="Ex. El Menzah 6"
            />
          </label>
        </div>

        {isStudent && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
                École <span className="font-normal text-ink-muted">(opt.)</span>
              </span>
              <input
                className={INPUT}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ex. Lycée Bourguiba"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
                Moyenne <span className="font-normal text-ink-muted">/ 20 (opt.)</span>
              </span>
              <input
                className={INPUT}
                value={moyenne}
                onChange={(e) => setMoyenne(e.target.value)}
                placeholder="Ex. 14,50"
                type="number"
                min={0}
                max={20}
                step={0.01}
                dir="ltr"
              />
            </label>
          </div>
        )}
      </FormSheet>

      <UserHistorySheet user={historyTarget} onOpenChange={(o) => !o && setHistoryTarget(null)} />

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
