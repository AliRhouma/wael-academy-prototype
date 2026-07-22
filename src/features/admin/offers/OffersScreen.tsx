import { useMemo, useState } from "react"
import { Check, KeyRound, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Access, Offer } from "@/data/types"
import { AccessFormSheet } from "./AccessFormSheet"
import { OffersTabs } from "./OffersTabs"
import { scopeSummary } from "./accessMeta"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Format a dinar amount the Tunisian way: "360 DT", no cents unless needed. */
function formatPrice(n: number): string {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "")
  return `${s} DT`
}

/** Shown discount: the stored % when set, else derived from the promo price. */
function discountPct(o: Offer): number | null {
  if (o.discountPct != null && o.discountPct > 0) return o.discountPct
  if (o.promoPrice == null || o.promoPrice >= o.price) return null
  return Math.round((1 - o.promoPrice / o.price) * 100)
}

/** "1 sept. 2026" — compact date for the validity column. */
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" })
const day = (iso: string) => DAY.format(new Date(`${iso}T00:00:00`))

/** The offer's logo — its image when set, else a quiet brand tile. */
function OfferLogo({ offer }: { offer: Offer }) {
  if (offer.logoUrl) {
    return (
      <img
        src={offer.logoUrl}
        alt=""
        className="size-10 shrink-0 rounded-md border border-border bg-surface object-cover p-1"
      />
    )
  }
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
      <Tag className="size-5" />
    </span>
  )
}

type PriceFilter = "all" | "promo" | "full"

/** Admin — the academy's commercial offers: one price list, filterable, editable. */
export default function AdminOffersScreen() {
  const offers = useData((s) => s.offers)
  const years = useData((s) => s.years)
  const accesses = useData((s) => s.accesses)
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
  const [logoUrl, setLogoUrl] = useState("")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [price, setPrice] = useState("")
  const [promoPrice, setPromoPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [period, setPeriod] = useState("")
  const [accessIds, setAccessIds] = useState<string[]>([])
  const [accessFormOpen, setAccessFormOpen] = useState(false)
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

  const sortedAccesses = useMemo(
    () => [...accesses].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [accesses],
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
            o.yearIds.some((yid) => yearName.get(yid)?.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  }, [offers, priceFilter, query, yearName])

  function openAdd() {
    setEditing(null)
    setName("")
    setDescription("")
    setLogoUrl("")
    setYearIds([])
    setPrice("")
    setPromoPrice("")
    setDiscount("")
    setStartDate("")
    setEndDate("")
    setPeriod("")
    setAccessIds([])
    setFormOpen(true)
  }

  function openEdit(offer: Offer) {
    setEditing(offer)
    setName(offer.name)
    setDescription(offer.description ?? "")
    setLogoUrl(offer.logoUrl ?? "")
    setYearIds(offer.yearIds)
    setPrice(offer.price.toString())
    setPromoPrice(offer.promoPrice?.toString() ?? "")
    setDiscount(offer.discountPct?.toString() ?? "")
    setStartDate(offer.startDate ?? "")
    setEndDate(offer.endDate ?? "")
    setPeriod(offer.period ?? "")
    setAccessIds(offer.accessIds)
    setFormOpen(true)
  }

  function toggleYear(id: string) {
    setYearIds((ids) => (ids.includes(id) ? ids.filter((y) => y !== id) : [...ids, id]))
  }

  function toggleAccess(id: string) {
    setAccessIds((ids) => (ids.includes(id) ? ids.filter((a) => a !== id) : [...ids, id]))
  }

  const priceNum = Number(price)
  const promoNum = Number(promoPrice)
  const discountNum = Number(discount)
  const promoInvalid =
    promoPrice.trim() !== "" && (!(promoNum > 0) || (priceNum > 0 && promoNum >= priceNum))
  const discountInvalid =
    discount.trim() !== "" && (!(discountNum > 0) || discountNum >= 100)
  const datesInvalid = startDate !== "" && endDate !== "" && endDate < startDate
  const canSubmit =
    name.trim() !== "" && priceNum > 0 && !promoInvalid && !discountInvalid && !datesInvalid

  function submit() {
    if (!canSubmit) return
    const patch = {
      name: name.trim(),
      description: description.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      yearIds,
      price: priceNum,
      promoPrice: promoPrice.trim() !== "" ? promoNum : undefined,
      discountPct: discount.trim() !== "" ? discountNum : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      period: period.trim() || undefined,
      accessIds,
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
        <div className="flex items-center gap-3">
          <OfferLogo offer={o} />
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
        </div>
      ),
    },
    {
      key: "years",
      header: "Années",
      render: (o) =>
        o.yearIds.length > 0 ? (
          <span className="text-ink-subtle">
            {o.yearIds.map((yid) => yearName.get(yid) ?? "—").join(" · ")}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
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
              {formatPrice(o.promoPrice ?? o.price)}
            </span>
            {o.promoPrice != null && (
              <span className="text-[12px] text-ink-muted line-through tabular-nums">
                {formatPrice(o.price)}
              </span>
            )}
            <Badge tone="warning">-{pct}%</Badge>
          </div>
        ) : (
          <span className="font-display text-[15px] font-bold text-ink tabular-nums">
            {formatPrice(o.price)}
          </span>
        )
      },
    },
    {
      key: "validity",
      header: "Validité",
      render: (o) =>
        o.period || o.startDate || o.endDate ? (
          <div className="text-[13px]">
            {o.period && <p className="font-medium text-ink-subtle">{o.period}</p>}
            {(o.startDate || o.endDate) && (
              <p className="mt-0.5 whitespace-nowrap text-[12px] text-ink-muted">
                {o.startDate ? day(o.startDate) : "…"} → {o.endDate ? day(o.endDate) : "…"}
              </p>
            )}
          </div>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "access",
      header: "Accès",
      render: (o) =>
        o.accessIds.length > 0 ? (
          <Badge tone="info">
            <KeyRound className="size-3" /> {o.accessIds.length}
          </Badge>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <OffersTabs />
        {!isEmpty && (
          <div className="relative md:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une offre, une année…"
              className={INPUT + " ps-9"}
            />
          </div>
        )}
      </div>

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
        description={
          editing ? undefined : "Nom, tarif et validité — puis les accès qui définissent son contenu."
        }
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
            Logo <span className="font-normal text-ink-muted">(lien d’image, optionnel)</span>
          </span>
          <div className="flex items-center gap-3">
            <input
              className={INPUT + " flex-1"}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…/logo.png"
              type="url"
              dir="ltr"
            />
            {logoUrl.trim() !== "" && (
              <img
                src={logoUrl}
                alt="Aperçu du logo"
                className="size-11 shrink-0 rounded-md border border-border bg-surface object-cover p-1"
              />
            )}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Description <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <textarea
            className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce que l’élève obtient avec cette offre…"
            rows={2}
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">
            Années <span className="font-normal text-ink-muted">({yearIds.length}) · optionnel</span>
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
                    "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-sm font-medium transition " +
                    (on
                      ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                      : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                  }
                >
                  <span dir="auto">{y.name}</span>
                </button>
              )
            })}
          </div>
        </div>

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
              Prix promo <span className="font-normal text-ink-muted">(opt.)</span>
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
        {promoInvalid && (
          <p className="text-[12px] font-medium text-danger-600">
            Le prix promo doit être un montant inférieur au prix.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Remise (%) <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              className={
                INPUT +
                " tabular-nums " +
                (discountInvalid
                  ? "border-danger-400 focus:border-danger-400 focus:ring-danger-200/40"
                  : "")
              }
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Ex. 25"
              inputMode="numeric"
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Période <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              className={INPUT}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex. 3 mois"
            />
          </label>
        </div>
        {discountInvalid && (
          <p className="text-[12px] font-medium text-danger-600">
            La remise doit être un pourcentage entre 1 et 99.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Début <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              type="date"
              className={INPUT}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Fin <span className="font-normal text-ink-muted">(opt.)</span>
            </span>
            <input
              type="date"
              className={
                INPUT +
                (datesInvalid ? " border-danger-400 focus:border-danger-400 focus:ring-danger-200/40" : "")
              }
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              dir="ltr"
            />
          </label>
        </div>
        {datesInvalid && (
          <p className="text-[12px] font-medium text-danger-600">
            La date de fin doit être après la date de début.
          </p>
        )}

        {/* The offer's accesses: reuse existing rules or create one on the fly. */}
        <div>
          <span className="mb-2 flex items-center justify-between text-sm font-medium text-ink-subtle">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="size-4 text-ink-muted" />
              Accès <span className="font-normal text-ink-muted">({accessIds.length}) · optionnel</span>
            </span>
            <button
              type="button"
              onClick={() => setAccessFormOpen(true)}
              className="text-[12px] font-medium text-brand-600 hover:underline"
            >
              + Créer un accès
            </button>
          </span>
          {sortedAccesses.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
              Aucun accès pour le moment — créez-en un pour définir ce que l’offre montre.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto scroll-touch rounded-md border border-border">
              <ul className="divide-y divide-border">
                {sortedAccesses.map((a: Access) => {
                  const on = accessIds.includes(a.id)
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => toggleAccess(a.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface-muted"
                      >
                        <span
                          className={
                            "grid size-5 shrink-0 place-items-center rounded border transition " +
                            (on
                              ? "border-transparent bg-grad text-ink-inverted"
                              : "border-border-strong bg-surface text-transparent")
                          }
                        >
                          <Check className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span dir="auto" className="block truncate text-sm font-medium text-ink">
                            {a.name}
                          </span>
                          <span className="block truncate text-[12px] text-ink-muted">
                            {scopeSummary(a)}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

      </FormSheet>

      {/* Creating an access from inside the offer form auto-selects it. */}
      <AccessFormSheet
        open={accessFormOpen}
        onOpenChange={setAccessFormOpen}
        editing={null}
        onSaved={(access, message) => {
          setAccessIds((ids) => [...ids, access.id])
          show(message)
        }}
      />

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
