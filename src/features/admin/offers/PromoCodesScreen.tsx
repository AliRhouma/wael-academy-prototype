import { useMemo, useState } from "react"
import { Copy, Pencil, Plus, Search, TicketPercent, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { PromoCode, PromoOfferRule } from "@/data/types"
import { PromoCodeFormSheet } from "./PromoCodeFormSheet"
import { OffersTabs } from "./OffersTabs"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** "-20 %" / "-30 DT" — the discount of one per-offer rule. */
function ruleLabel(r: PromoOfferRule): string {
  if (r.discountPct != null) return `-${r.discountPct} %`
  if (r.discountAmount != null) return `-${r.discountAmount} DT`
  return "—"
}

/**
 * Admin — the promo codes: each card shows the code (one tap to copy), the
 * per-offer discounts, and the usage against its cap. Exhausted codes are
 * flagged; usage lists the students who applied the code.
 */
export default function AdminPromoCodesScreen() {
  const promoCodes = useData((s) => s.promoCodes)
  const offers = useData((s) => s.offers)
  const users = useData((s) => s.users)
  const removePromoCode = useData((s) => s.removePromoCode)
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PromoCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null)

  const offerName = useMemo(() => new Map(offers.map((o) => [o.id, o.name])), [offers])
  const userName = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return promoCodes
      .filter((p) =>
        q === ""
          ? true
          : p.code.toLowerCase().includes(q) ||
            p.offers.some((r) => offerName.get(r.offerId)?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.code.localeCompare(b.code, "fr"))
  }, [promoCodes, query, offerName])

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(p: PromoCode) {
    setEditing(p)
    setFormOpen(true)
  }

  async function copyCode(p: PromoCode) {
    try {
      await navigator.clipboard.writeText(p.code)
      show(`Code « ${p.code} » copié`)
    } catch {
      show("Impossible de copier le code")
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removePromoCode(deleteTarget.id)
    show("Code promo supprimé")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Nouveau code promo
    </button>
  )

  const isEmpty = promoCodes.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Codes promo"
        subtitle={`${promoCodes.length} code${promoCodes.length > 1 ? "s" : ""} — des remises par offre, plafonnées en nombre d’utilisations.`}
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
              placeholder="Rechercher un code, une offre…"
              className={INPUT + " ps-9"}
            />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={TicketPercent}
            title="Aucun code promo"
            description="Générez un code, choisissez les offres visées et la remise de chacune."
            action={addButton}
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun code ne correspond à cette recherche."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((p) => {
            const used = p.usedByUserIds.length
            const exhausted = p.maxUses != null && used >= p.maxUses
            const pct = p.maxUses != null ? Math.min(100, Math.round((used / p.maxUses) * 100)) : 0
            return (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-700">
                  <TicketPercent className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyCode(p)}
                      title="Copier le code"
                      className="group inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface-muted px-2.5 py-1 font-display text-[15px] font-bold tracking-[.08em] text-ink transition hover:border-brand-300 hover:text-brand-700"
                    >
                      {p.code}
                      <Copy className="size-3.5 text-ink-muted transition group-hover:text-brand-600" />
                    </button>
                    <Badge tone={exhausted ? "danger" : "success"} dot>
                      {exhausted ? "Épuisé" : "Actif"}
                    </Badge>
                  </div>

                  {/* Per-offer discounts. */}
                  <ul className="mt-2 space-y-1">
                    {p.offers.map((r) => (
                      <li
                        key={r.offerId}
                        className="flex items-baseline justify-between gap-3 text-[13px]"
                      >
                        <span dir="auto" className="min-w-0 truncate text-ink-subtle">
                          {offerName.get(r.offerId) ?? "Offre supprimée"}
                        </span>
                        <span className="shrink-0 font-medium tabular-nums text-accent2-700">
                          {ruleLabel(r)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Usage against the cap. */}
                  <div className="mt-2.5">
                    <p className="text-[12px] tabular-nums text-ink-muted">
                      {p.maxUses != null
                        ? `${used}/${p.maxUses} utilisation${p.maxUses > 1 ? "s" : ""}`
                        : `${used} utilisation${used > 1 ? "s" : ""} · illimité`}
                    </p>
                    {p.maxUses != null && (
                      <div className="mt-1.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={
                            "h-full rounded-full " + (exhausted ? "bg-danger-400" : "bg-grad")
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    {used > 0 && (
                      <div className="mt-2 flex items-center">
                        <div className="flex -space-x-2">
                          {p.usedByUserIds.slice(0, 5).map((uid) => (
                            <Avatar
                              key={uid}
                              name={userName.get(uid) ?? "?"}
                              size="sm"
                              className="ring-2 ring-surface"
                            />
                          ))}
                        </div>
                        {used > 5 && (
                          <span className="ms-2 text-[12px] font-medium text-ink-muted">
                            +{used - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <OverflowMenu
                  actions={[
                    { label: "Copier le code", icon: Copy, onClick: () => copyCode(p) },
                    { label: "Modifier", icon: Pencil, onClick: () => openEdit(p) },
                    {
                      label: "Supprimer",
                      icon: Trash2,
                      tone: "danger",
                      onClick: () => setDeleteTarget(p),
                    },
                  ]}
                />
              </div>
            )
          })}
        </div>
      )}

      <PromoCodeFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={show}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer ce code promo ?"
        description={
          deleteTarget ? `« ${deleteTarget.code} » ne pourra plus être utilisé.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
