import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { KeyRound, ListTree, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Access } from "@/data/types"
import { AccessFormSheet } from "./AccessFormSheet"
import { OffersTabs } from "./OffersTabs"
import { TYPE_LABEL, scopeSummary } from "./accessMeta"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/**
 * Admin — the reusable access rules offers are built from. Each card shows the
 * rule's types + scope and how many offers use it; « Contenu » opens the
 * resource tree where single items can be hidden.
 */
export default function AdminAccessesScreen() {
  const accesses = useData((s) => s.accesses)
  const offers = useData((s) => s.offers)
  const removeAccess = useData((s) => s.removeAccess)
  const { show, toast } = useToast()
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Access | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Access | null>(null)

  /** access id → number of offers using it. */
  const usedBy = useMemo(() => {
    const m = new Map<string, number>()
    for (const o of offers)
      for (const aid of o.accessIds) m.set(aid, (m.get(aid) ?? 0) + 1)
    return m
  }, [offers])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return accesses
      .filter((a) =>
        q === ""
          ? true
          : a.name.toLowerCase().includes(q) || (a.description?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [accesses, query])

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(access: Access) {
    setEditing(access)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeAccess(deleteTarget.id)
    show("الصلاحية تمسحت")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> اعمل صلاحية
    </button>
  )

  const isEmpty = accesses.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الصلاحيات"
        subtitle={`${accesses.length} قاعدة صلاحية — شنوّة يوري كل عرض للتلامذة.`}
        action={!isEmpty ? addButton : undefined}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <OffersTabs />
        {!isEmpty && (
          <div className="relative md:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="لوّج على صلاحية…"
              className={INPUT + " ps-9"}
            />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={KeyRound}
            title="ما فماش صلاحيات"
            description="اعمل قاعدة صلاحية (أنواع الموارد + المجال) وبعد اربطها بعرض."
            action={addButton}
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Search}
            title="ما فماش نتائج"
            description="ما فماش صلاحية توافق البحث هذا."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((a) => {
            const count = usedBy.get(a.id) ?? 0
            const hidden = a.excludedIds.length
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <KeyRound className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p dir="auto" className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">
                    {a.name}
                  </p>
                  {a.description && (
                    <p dir="auto" className="mt-0.5 line-clamp-2 text-[calc(12px*var(--ts))] text-ink-muted">
                      {a.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {a.types.map((t) => (
                      <Badge key={t} tone="brand">
                        {TYPE_LABEL[t]}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">{scopeSummary(a)}</p>
                  <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">
                    {count > 0
                      ? `مستعمل في ${count} عرض`
                      : "ما مستعملش في حتّى عرض"}
                    {hidden > 0 && (
                      <> · <span className="text-accent2-700">{hidden} عنصر مخفي</span></>
                    )}
                  </p>
                </div>
                <OverflowMenu
                  actions={[
                    {
                      label: "المحتوى",
                      icon: ListTree,
                      onClick: () => navigate(`/admin/offers/access/${a.id}`),
                    },
                    { label: "بدّل", icon: Pencil, onClick: () => openEdit(a) },
                    {
                      label: "امسح",
                      icon: Trash2,
                      tone: "danger",
                      onClick: () => setDeleteTarget(a),
                    },
                  ]}
                />
              </div>
            )
          })}
        </div>
      )}

      <AccessFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={(access, message) => {
          show(message)
          // A fresh access goes straight to its content tree for fine-tuning.
          if (!editing) navigate(`/admin/offers/access/${access.id}`)
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="تحبّ تمسح الصلاحية هذي؟"
        description={
          deleteTarget
            ? `«${deleteTarget.name}» باش يتمسح ويتنحّى من العروض اللي تستعملو.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
