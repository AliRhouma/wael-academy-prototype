import { useMemo, useState } from "react"
import { ChevronDown, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Offer } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Format a dinar amount the Tunisian way: "360 DT", no cents unless needed. */
function formatPrice(n: number): string {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "")
  return `${s} DT`
}

/** Percent off when a promo price applies — a derived display value, never stored. */
function discountPct(o: Offer): number | null {
  if (o.promoPrice == null || o.promoPrice >= o.price) return null
  return Math.round((1 - o.promoPrice / o.price) * 100)
}

type PriceFilter = "all" | "promo" | "full"

/** Admin — the academy's commercial offers: one price list, filterable, editable. */
export default function AdminOffersScreen() {
  const offers = useData((s) => s.offers)
  const years = useData((s) => s.years)
  const addOffer = useData((s) => s.addOffer)
  const updateOffer = useData((s) => s.updateOffer)
  const removeOffer = useData((s) => s.removeOffer)
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [yearId, setYearId] = useState("")
  const [price, setPrice] = useState("")
  const [promoPrice, setPromoPrice] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null)

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const promoCount = useMemo(() => offers.filter((o) => discountPct(o) != null).length, [offers])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return offers
      .filter((o) => {
        if (priceFilter === "promo") return discountPct(o) != null
        if (priceFilter === "full") return discountPct(o) == null
        return true
      })
      .filter((o) =>
        q === ""
          ? true
          : o.name.toLowerCase().includes(q) ||
            (o.description?.toLowerCase().includes(q) ?? false) ||
            (yearName.get(o.yearId)?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  }, [offers, priceFilter, query, yearName])

  function openAdd() {
    setEditing(null)
    setName("")
    setDescription("")
    setYearId("")
    setPrice("")
    setPromoPrice("")
    setFormOpen(true)
  }

  function openEdit(offer: Offer) {
    setEditing(offer)
    setName(offer.name)
    setDescription(offer.description ?? "")
    setYearId(offer.yearId)
    setPrice(offer.price.toString())
    setPromoPrice(offer.promoPrice?.toString() ?? "")
    setFormOpen(true)
  }

  const priceNum = Number(price)
  const promoNum = Number(promoPrice)
  const promoInvalid =
    promoPrice.trim() !== "" && (!(promoNum > 0) || (priceNum > 0 && promoNum >= priceNum))
  const canSubmit =
    name.trim() !== "" && yearId !== "" && priceNum > 0 && !promoInvalid

  function submit() {
    if (!canSubmit) return
    const patch = {
      name: name.trim(),
      description: description.trim() || undefined,
      yearId,
      price: priceNum,
      promoPrice: promoPrice.trim() !== "" ? promoNum : undefined,
    }
    if (editing) {
      updateOffer(editing.id, patch)
      show("Offre modifiée")
    } else {
      addOffer(patch)
      show("Offre ajoutée")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeOffer(deleteTarget.id)
    show("Offre supprimée")
    setDeleteTarget(null)
  }

  const columns: Column<Offer>[] = [
    {
      key: "name",
      header: "Offre",
      render: (o) => (
        <div className="min-w-0">
          <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
            {o.name}
          </p>
          {o.description ? (
            <p dir="auto" className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">
              {o.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "year",
      header: "Année",
      render: (o) => (
        <Badge tone="brand">{yearName.get(o.yearId) ?? "—"}</Badge>
      ),
    },
    {
      key: "price",
      header: "Tarif",
      render: (o) => {
        const pct = discountPct(o)
        return pct != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[15px] font-bold text-ink tabular-nums">
              {formatPrice(o.promoPrice!)}
            </span>
            <span className="text-[12px] text-ink-muted line-through tabular-nums">
              {formatPrice(o.price)}
            </span>
            <Badge tone="warning">-{pct}%</Badge>
          </div>
        ) : (
          <span className="font-display text-[15px] font-bold text-ink tabular-nums">
            {formatPrice(o.price)}
          </span>
        )
      },
    },
  ]

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter une offre
    </button>
  )

  const filters: { key: PriceFilter; label: string; count: number }[] = [
    { key: "all", label: "Toutes", count: offers.length },
    { key: "promo", label: "En promo", count: promoCount },
    { key: "full", label: "Plein tarif", count: offers.length - promoCount },
  ]

  const isEmpty = offers.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Offres"
        subtitle={`${offers.length} offre${offers.length > 1 ? "s" : ""} — abonnements et packs proposés par l’académie.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Tag}
            title="Aucune offre"
            description="Créez les abonnements et packs que vos élèves pourront souscrire."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
              {filters.map((f) => {
                const active = priceFilter === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setPriceFilter(f.key)}
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
                placeholder="Rechercher une offre, une année…"
                className={INPUT + " ps-9"}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(o) => o.id}
            rowActions={(o) => [
              { label: "Modifier", icon: Pencil, onClick: () => openEdit(o) },
              { label: "Supprimer", icon: Trash2, tone: "danger", onClick: () => setDeleteTarget(o) },
            ]}
            empty={
              <div className="rounded-lg border border-dashed border-border bg-surface">
                <EmptyState
                  icon={Search}
                  title="Aucun résultat"
                  description="Aucune offre ne correspond à ce filtre ou à cette recherche."
                />
              </div>
            }
          />
        </>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier l’offre" : "Nouvelle offre"}
        description={editing ? undefined : "Créez un abonnement ou un pack à proposer."}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de l’offre</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Abonnement annuel — Bac Maths"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Description <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <textarea
            className={INPUT.replace("h-11", "min-h-[84px]") + " resize-y py-2.5 text-start"}
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce que l’élève obtient avec cette offre…"
            rows={3}
          />
        </label>

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

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Prix (DT)</span>
            <input
              className={INPUT + " tabular-nums"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex. 480"
              inputMode="decimal"
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Prix promo <span className="font-normal text-ink-muted">(optionnel)</span>
            </span>
            <input
              className={
                INPUT +
                " tabular-nums " +
                (promoInvalid ? "border-danger-400 focus:border-danger-400 focus:ring-danger-200/40" : "")
              }
              value={promoPrice}
              onChange={(e) => setPromoPrice(e.target.value)}
              placeholder="Ex. 360"
              inputMode="decimal"
              dir="ltr"
            />
          </label>
        </div>

        {promoInvalid ? (
          <p className="text-[12px] font-medium text-danger-600">
            Le prix promo doit être un montant inférieur au prix.
          </p>
        ) : (
          <p className="text-[12px] text-ink-muted">
            Laissez le prix promo vide s’il n’y a pas de réduction.
          </p>
        )}
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cette offre ?"
        description={
          deleteTarget ? `« ${deleteTarget.name} » sera définitivement supprimée.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
