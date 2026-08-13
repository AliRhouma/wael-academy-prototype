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
import { ACADEMIC_YEARS, DEFAULT_ACADEMIC_YEAR } from "@/data/academicYears"
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
  const [scolarFilter, setScolarFilter] = useState<string>("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [title, setTitle] = useState("")
  const [academicYear, setAcademicYear] = useState<string>(DEFAULT_ACADEMIC_YEAR)
  const [yearId, setYearId] = useState("")
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)

  const yearName = useMemo(() => new Map(years.map((y) => [y.id, y.name])), [years])
  const studentName = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  // Années scolaires present in the data — newest first, for the filter chips.
  const scolarYears = useMemo(
    () => [...new Set(groups.map((g) => g.academicYear))].sort().reverse(),
    [groups],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groups
      .filter((g) => (scolarFilter === "all" ? true : g.academicYear === scolarFilter))
      .filter((g) =>
        q === ""
          ? true
          : g.title.toLowerCase().includes(q) ||
            g.academicYear.includes(q) ||
            (g.yearId ? (yearName.get(g.yearId)?.toLowerCase().includes(q) ?? false) : false),
      )
      .sort((a, b) => a.title.localeCompare(b.title, "ar"))
  }, [groups, query, yearName, scolarFilter])

  function openAdd() {
    setEditing(null)
    setTitle("")
    setAcademicYear(DEFAULT_ACADEMIC_YEAR)
    setYearId("")
    setStudentIds([])
    setFormOpen(true)
  }

  function openEdit(group: Group) {
    setEditing(group)
    setTitle(group.title)
    setAcademicYear(group.academicYear)
    setYearId(group.yearId ?? "")
    setStudentIds(group.studentIds)
    setFormOpen(true)
  }

  const canSubmit = title.trim() !== ""

  function submit() {
    if (!canSubmit) return
    const patch = {
      title: title.trim(),
      academicYear,
      yearId: yearId || undefined,
      studentIds,
    }
    if (editing) {
      updateGroup(editing.id, patch)
      show("الفوج تبدّل")
    } else {
      addGroup(patch)
      show("الفوج تعمل")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeGroup(deleteTarget.id)
    show("الفوج تمسح")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> اعمل فوج
    </button>
  )

  const isEmpty = groups.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الأفواج"
        subtitle={`${groups.length} فوج تلامذة — أقسام مسمّاة باش تنظّم الحصص.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={UsersRound}
            title="ما فماش أفواج"
            description="اعمل فوج تلامذة (مثال: «المتفوّقين — ثانية علوم») باش تبرمج حصصو."
            action={addButton}
          />
        </div>
      ) : (
        <>
          {/* Année scolaire chips + search — the chips only appear when the data
              spans more than one année scolaire. */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {scolarYears.length > 1 ? (
              <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
                {["all", ...scolarYears].map((y) => {
                  const active = scolarFilter === y
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setScolarFilter(y)}
                      className={
                        "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium tabular-nums transition " +
                        (active
                          ? "border-transparent bg-brand-600 text-ink-inverted"
                          : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                      }
                    >
                      {y === "all" ? "السنوات الدراسية الكل" : y}
                    </button>
                  )
                })}
              </div>
            ) : (
              <span />
            )}
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="لوّج على فوج ولا عام…"
                className={INPUT + " ps-9"}
              />
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface">
              <EmptyState
                icon={Search}
                title="ما فماش نتائج"
                description="ما فماش فوج يوافق البحث هذا."
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
                      <p dir="auto" className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">
                        {g.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone="warning" className="tabular-nums">{g.academicYear}</Badge>
                        {g.yearId && <Badge tone="brand" dot>{yearName.get(g.yearId) ?? "—"}</Badge>}
                        <span className="text-[calc(12px*var(--ts))] text-ink-muted">
                          {members.length > 0
                            ? `${members.length} تلميذ`
                            : "ما فماش تلامذة"}
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
                            <span className="ms-2 text-[calc(12px*var(--ts))] font-medium text-ink-muted">
                              +{members.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <OverflowMenu
                      actions={[
                        { label: "بدّل", icon: Pencil, onClick: () => openEdit(g) },
                        {
                          label: "امسح",
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
        title={editing ? "بدّل الفوج" : "فوج جديد"}
        description={
          editing ? undefined : "اسم وقائمة التلامذة اللي فيه."
        }
        submitLabel={editing ? "سجّل" : "اعمل"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">اسم الفوج</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: المتفوّقين — ثانية علوم"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">السنة الدراسية</span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10 tabular-nums"}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              dir="ltr"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            المستوى <span className="font-normal text-ink-muted">(اختياري)</span>
          </span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
            >
              <option value="">— حتّى وحدة —</option>
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
        title="تحبّ تمسح الفوج هذا؟"
        description={
          deleteTarget
            ? `«${deleteTarget.title}» باش يتمسح ويتنحّى من حصصو.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
