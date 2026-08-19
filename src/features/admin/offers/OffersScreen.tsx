import { useMemo, useState } from "react"
import { Check, KeyRound, ListChecks, Pencil, Plus, Search, Sparkles, Tag, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Access, Offer, OfferTier } from "@/data/types"
import { OfferMark } from "@/features/shared/offers/OfferMark"
import { AccessFormSheet } from "./AccessFormSheet"
import { OffersTabs } from "./OffersTabs"
import { scopeSummary } from "./accessMeta"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Format a dinar amount the Tunisian way: "360 د.ت", no cents unless needed. */
function formatPrice(n: number): string {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "")
  return `${s} د.ت`
}

/** Shown discount: the stored % when set, else derived from the promo price. */
function discountPct(o: Offer): number | null {
  if (o.discountPct != null && o.discountPct > 0) return o.discountPct
  if (o.promoPrice == null || o.promoPrice >= o.price) return null
  return Math.round((1 - o.promoPrice / o.price) * 100)
}

/** "1 sept. 2026" — compact date for the validity column. */
const DAY = new Intl.DateTimeFormat("ar-TN-u-nu-latn", { day: "numeric", month: "short", year: "numeric" })
const day = (iso: string) => DAY.format(new Date(`${iso}T00:00:00`))

/**
 * The commercial ladder — three rungs, and each one IS a product with its own
 * type-set wordmark. Picking a rung prefills that wordmark, so a new offer
 * lands on the catalogue already wearing its mark.
 */
const TIERS: { key: OfferTier; label: string; mark: string; sub?: string }[] = [
  { key: "khotwa", label: "خطوة بخطوة", mark: "خطوة", sub: "بخطوة" },
  { key: "turbo", label: "Turbo", mark: "TURBO" },
  { key: "turbo-max", label: "Turbo Pro Max", mark: "TURBO", sub: "PRO MAX" },
]

/** "a\nb\n" ⇄ ["a","b"] — the textarea editors for features / price notes. */
const linesToList = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean)
const listToLines = (l?: string[]) => (l ?? []).join("\n")

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
  const [logoText, setLogoText] = useState("")
  const [logoSub, setLogoSub] = useState("")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [price, setPrice] = useState("")
  const [promoPrice, setPromoPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [period, setPeriod] = useState("")
  const [tier, setTier] = useState<OfferTier | "">("")
  const [billing, setBilling] = useState<"" | "monthly" | "annual">("")
  const [popular, setPopular] = useState(false)
  const [tagline, setTagline] = useState("")
  const [audience, setAudience] = useState("")
  const [priceLabel, setPriceLabel] = useState("")
  const [pricePeriod, setPricePeriod] = useState("")
  const [featuresText, setFeaturesText] = useState("")
  const [priceNotesText, setPriceNotesText] = useState("")
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
    () => [...accesses].sort((a, b) => a.name.localeCompare(b.name, "ar")),
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
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [offers, priceFilter, query, yearName])

  function openAdd() {
    setEditing(null)
    setName("")
    setDescription("")
    setLogoUrl("")
    setLogoText("")
    setLogoSub("")
    setYearIds([])
    setPrice("")
    setPromoPrice("")
    setDiscount("")
    setStartDate("")
    setEndDate("")
    setPeriod("")
    setTier("")
    setBilling("")
    setPopular(false)
    setTagline("")
    setAudience("")
    setPriceLabel("")
    setPricePeriod("")
    setFeaturesText("")
    setPriceNotesText("")
    setAccessIds([])
    setFormOpen(true)
  }

  function openEdit(offer: Offer) {
    setEditing(offer)
    setName(offer.name)
    setDescription(offer.description ?? "")
    setLogoUrl(offer.logoUrl ?? "")
    setLogoText(offer.logoText ?? "")
    setLogoSub(offer.logoSub ?? "")
    setYearIds(offer.yearIds)
    setPrice(offer.price.toString())
    setPromoPrice(offer.promoPrice?.toString() ?? "")
    setDiscount(offer.discountPct?.toString() ?? "")
    setStartDate(offer.startDate ?? "")
    setEndDate(offer.endDate ?? "")
    setPeriod(offer.period ?? "")
    setTier(offer.tier ?? "")
    setBilling(offer.billing ?? "")
    setPopular(offer.popular === true)
    setTagline(offer.tagline ?? "")
    setAudience(offer.audience ?? "")
    setPriceLabel(offer.priceLabel ?? "")
    setPricePeriod(offer.pricePeriod ?? "")
    setFeaturesText(listToLines(offer.features))
    setPriceNotesText(listToLines(offer.priceNotes))
    setAccessIds(offer.accessIds)
    setFormOpen(true)
  }

  /** Picking a rung swaps in its wordmark — unless one was typed by hand. */
  function pickTier(next: OfferTier) {
    const chosen = tier === next ? "" : next
    setTier(chosen)
    const typed = TIERS.some((t) => t.mark === logoText.trim() && (t.sub ?? "") === logoSub.trim())
    if (logoText.trim() === "" || typed) {
      const rung = chosen === "" ? undefined : TIERS.find((t) => t.key === chosen)
      setLogoText(rung?.mark ?? "")
      setLogoSub(rung?.sub ?? "")
    }
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
      logoText: logoText.trim() || undefined,
      logoSub: logoSub.trim() || undefined,
      yearIds,
      price: priceNum,
      promoPrice: promoPrice.trim() !== "" ? promoNum : undefined,
      discountPct: discount.trim() !== "" ? discountNum : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      period: period.trim() || undefined,
      tier: tier || undefined,
      billing: billing || undefined,
      popular: popular || undefined,
      tagline: tagline.trim() || undefined,
      audience: audience.trim() || undefined,
      priceLabel: priceLabel.trim() || undefined,
      pricePeriod: pricePeriod.trim() || undefined,
      features: linesToList(featuresText).length > 0 ? linesToList(featuresText) : undefined,
      priceNotes: linesToList(priceNotesText).length > 0 ? linesToList(priceNotesText) : undefined,
      accessIds,
    }
    if (editing) {
      updateOffer(editing.id, patch)
      show("العرض تبدّل")
    } else {
      addOffer(patch)
      show("العرض تزاد")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeOffer(deleteTarget.id)
    show("العرض تمسح")
    setDeleteTarget(null)
  }

  const columns: Column<Offer>[] = [
    {
      key: "name",
      header: "عرض",
      render: (o) => (
        <div className="flex items-center gap-3">
          <OfferMark offer={o} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span dir="auto" className="truncate font-display text-[calc(15px*var(--ts))] font-bold text-ink">
                {o.name}
              </span>
              {o.popular && (
                <Badge tone="brand" className="shrink-0">
                  <Sparkles className="size-3" /> رواج
                </Badge>
              )}
            </p>
            {o.audience || o.description ? (
              <p dir="auto" className="mt-0.5 line-clamp-1 text-[calc(12px*var(--ts))] text-ink-muted">
                {o.audience ?? o.description}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "years",
      header: "السنوات",
      render: (o) => {
        if (o.yearIds.length === 0) return <span className="text-ink-muted">—</span>
        // A catalogue offer can target a dozen years — list two, count the rest,
        // and keep the whole list in the tooltip so the row stays one line.
        const names = o.yearIds.map((yid) => yearName.get(yid) ?? "—")
        const rest = names.length - 2
        return (
          <span dir="auto" className="text-ink-subtle" title={names.join(" · ")}>
            {names.slice(0, 2).join(" · ")}
            {rest > 0 && <span className="text-ink-muted"> +{rest}</span>}
          </span>
        )
      },
    },
    {
      key: "price",
      header: "التعريفة",
      render: (o) => {
        const pct = discountPct(o)
        const suffix = o.pricePeriod ?? (o.billing === "monthly" ? "/ شهر" : o.billing === "annual" ? "سنويّا" : "")
        return (
          <div>
            {o.priceLabel && (
              <span className="block text-[calc(11px*var(--ts))] text-ink-muted">{o.priceLabel}</span>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="whitespace-nowrap font-display text-[calc(15px*var(--ts))] font-bold text-ink tabular-nums">
                {formatPrice(o.promoPrice ?? o.price)}
              </span>
              {pct != null && o.promoPrice != null && (
                <span className="whitespace-nowrap text-[calc(12px*var(--ts))] text-ink-muted line-through tabular-nums">
                  {formatPrice(o.price)}
                </span>
              )}
              {pct != null && <Badge tone="warning">-{pct}%</Badge>}
            </div>
            {suffix && (
              <span className="mt-0.5 block whitespace-nowrap text-[calc(11.5px*var(--ts))] text-ink-muted">
                {suffix}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "validity",
      header: "الصلوحية",
      render: (o) =>
        o.period || o.startDate || o.endDate ? (
          <div className="text-[calc(13px*var(--ts))]">
            {o.period && <p className="font-medium text-ink-subtle">{o.period}</p>}
            {(o.startDate || o.endDate) && (
              <p className="mt-0.5 whitespace-nowrap text-[calc(12px*var(--ts))] text-ink-muted">
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
      header: "المحتوى",
      render: (o) => {
        const feats = o.features?.length ?? 0
        if (feats === 0 && o.accessIds.length === 0) return <span className="text-ink-muted">—</span>
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {feats > 0 && (
              <Badge tone="success" title="مميزات الكارت">
                <ListChecks className="size-3" /> {feats}
              </Badge>
            )}
            {o.accessIds.length > 0 && (
              <Badge tone="info" title="الصلاحيات">
                <KeyRound className="size-3" /> {o.accessIds.length}
              </Badge>
            )}
          </div>
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
      <Plus className="size-4" /> زيد عرض
    </button>
  )

  const filters: { key: PriceFilter; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: offers.length },
    { key: "promo", label: "في تخفيض", count: promoCount },
    { key: "full", label: "التعريفة الكاملة", count: offers.length - promoCount },
  ]

  const isEmpty = offers.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="العروض"
        subtitle={`${offers.length} عرض — اشتراكات وباكات تقترحهم الأكاديمية.`}
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
              placeholder="لوّج على عرض ولا عام…"
              className={INPUT + " ps-9"}
            />
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Tag}
            title="ما فماش عروض"
            description="اعمل الاشتراكات والباكات اللي تلامذتك ينجّمو ياخذوهم."
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
              { label: "بدّل", icon: Pencil, onClick: () => openEdit(o) },
              { label: "امسح", icon: Trash2, tone: "danger", onClick: () => setDeleteTarget(o) },
            ]}
            empty={
              <div className="rounded-lg border border-dashed border-border bg-surface">
                <EmptyState
                  icon={Search}
                  title="ما فماش نتائج"
                  description="ما فماش عرض يوافق الفلتر ولا البحث هذا."
                />
              </div>
            }
          />
        </>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "بدّل العرض" : "عرض جديد"}
        description={
          editing ? undefined : "الاسم والتعريفة والصلوحية — وبعد الصلاحيات اللي تحدّد المحتوى."
        }
        submitLabel={editing ? "سجّل" : "زيد"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">اسم العرض</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: Gold + — باك رياضيات"
            autoFocus
          />
        </label>

        {/* The rung on the ladder — it picks the card's medallion and accent. */}
        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">
            الباقة <span className="font-normal text-ink-muted">(اختياري)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {TIERS.map((t) => {
              const on = tier === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => pickTier(t.key)}
                  className={
                    "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition " +
                    (on
                      ? "border-brand-300 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15"
                      : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                  }
                >
                  <span
                    className={
                      "font-display text-[calc(10px*var(--ts))] font-bold leading-none " +
                      (on ? "text-brand-700" : "text-ink-muted")
                    }
                    dir="auto"
                  >
                    {t.mark}
                    {t.sub ? ` ${t.sub}` : ""}
                  </span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={popular}
          onClick={() => setPopular((p) => !p)}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-muted px-3.5 py-2 text-start transition hover:border-brand-200"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink-subtle">وريه كـ «الأكثر رواجا»</span>
            <span className="block text-[calc(12px*var(--ts))] text-ink-muted">
              الكارت يوليّ محاط ومسلّط عليه الضوء في صفحة العروض متاع التلميذ.
            </span>
          </span>
          <span
            className={
              "relative h-6 w-11 shrink-0 rounded-full transition " +
              (popular ? "bg-brand-500" : "bg-neutral-300")
            }
          >
            <span
              className={
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " +
                (popular ? "start-[22px]" : "start-0.5")
              }
            />
          </span>
        </button>

        {/* The mark. No icon logos yet — the wordmark IS the logo, and a real
            image URL simply takes its place on every screen once it lands. */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            الشعار <span className="font-normal text-ink-muted">(كتابي)</span>
          </span>
          <div className="flex items-center gap-3">
            <OfferMark
              offer={{
                id: "preview",
                name,
                yearIds: [],
                price: 0,
                accessIds: [],
                logoUrl: logoUrl.trim() || undefined,
                logoText: logoText.trim() || undefined,
                logoSub: logoSub.trim() || undefined,
              }}
              size="lg"
            />
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input
                className={INPUT}
                dir="auto"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="TURBO"
                aria-label="السطر الأوّل"
              />
              <input
                className={INPUT}
                dir="auto"
                value={logoSub}
                onChange={(e) => setLogoSub(e.target.value)}
                placeholder="PRO MAX"
                aria-label="السطر الثاني (اختياري)"
              />
            </div>
          </div>
          <label className="mt-2 block">
            <span className="mb-1.5 block text-[calc(12px*var(--ts))] text-ink-muted">
              ولا رابط صورة — يغلب الشعار الكتابي
            </span>
            <input
              className={INPUT}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…/logo.svg"
              type="url"
              dir="ltr"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Description <span className="font-normal text-ink-muted">(اختياري)</span>
          </span>
          <textarea
            className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
            dir="auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="شنوّة ياخذ التلميذ مع العرض هذا…"
            rows={2}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              الجملة الترويجية <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT + " text-start"}
              dir="auto"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="مثال: العام الكامل بسومة أرخص من الشهري."
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              موجّه لـ <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT + " text-start"}
              dir="auto"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="مثال: لأقسام الثانوي"
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">
            السنوات <span className="font-normal text-ink-muted">({yearIds.length}) · optionnel</span>
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
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">السومة (د.ت)</span>
            <input
              className={INPUT + " tabular-nums"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثال: 480"
              inputMode="decimal"
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              سومة التخفيض <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={
                INPUT +
                " tabular-nums " +
                (promoInvalid ? "border-danger-400 focus:border-danger-400 focus:ring-danger-200/40" : "")
              }
              value={promoPrice}
              onChange={(e) => setPromoPrice(e.target.value)}
              placeholder="مثال: 360"
              inputMode="decimal"
              dir="ltr"
            />
          </label>
        </div>
        {promoInvalid && (
          <p className="text-[calc(12px*var(--ts))] font-medium text-danger-600">
            سومة التخفيض لازمها تكون أقلّ من السومة.
          </p>
        )}

        {/* How the price READS on the card: "ابتداءً من  850 د.ت  سنويّا". */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              قبل السومة <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT + " text-start"}
              dir="auto"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              placeholder="ابتداءً من"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              بعد السومة <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT + " text-start"}
              dir="auto"
              value={pricePeriod}
              onChange={(e) => setPricePeriod(e.target.value)}
              placeholder="عند الخلاص بالحاضر"
            />
          </label>
          <label className="col-span-2 block md:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              نسق الخلاص <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <select
              className={INPUT + " text-start"}
              value={billing}
              onChange={(e) => setBilling(e.target.value as typeof billing)}
            >
              <option value="">— بلا نسق —</option>
              <option value="monthly">شهري</option>
              <option value="annual">سنوي</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              التخفيض (%) <span className="font-normal text-ink-muted">(اخت.)</span>
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
              placeholder="مثال: 25"
              inputMode="numeric"
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              المدّة <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="مثال: 3 شهور"
            />
          </label>
        </div>
        {discountInvalid && (
          <p className="text-[calc(12px*var(--ts))] font-medium text-danger-600">
            التخفيض لازمو يكون نسبة بين 1 و 99.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              البداية <span className="font-normal text-ink-muted">(اخت.)</span>
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
              النهاية <span className="font-normal text-ink-muted">(اخت.)</span>
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
          <p className="text-[calc(12px*var(--ts))] font-medium text-danger-600">
            تاريخ النهاية لازمو يكون بعد تاريخ البداية.
          </p>
        )}

        {/* The card's checklist — one feature per line, in the order shown. */}
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-subtle">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="size-4 text-ink-muted" />
              المميزات <span className="font-normal text-ink-muted">(سطر لكل ميزة)</span>
            </span>
            <span className="text-[calc(12px*var(--ts))] font-normal tabular-nums text-ink-muted">
              {linesToList(featuresText).length}
            </span>
          </span>
          <textarea
            className={INPUT.replace("h-11", "min-h-[104px]") + " resize-y py-2.5 text-start leading-relaxed"}
            dir="auto"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"فيديوهات تفسير الدروس\nتمارين مرفقة بالإصلاح وكويزات تفاعلية\nمجلات تلاخيص الدروس"}
            rows={4}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            ملاحظات تحت السومة <span className="font-normal text-ink-muted">(سطر لكل ملاحظة، اخت.)</span>
          </span>
          <textarea
            className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start leading-relaxed"}
            dir="auto"
            value={priceNotesText}
            onChange={(e) => setPriceNotesText(e.target.value)}
            placeholder={"• السومة بالحاضر.\n• مع إمكانية الخلاص بالتقسيط — كلّمنا."}
            rows={2}
          />
        </label>

        {/* The offer's accesses: reuse existing rules or create one on the fly. */}
        <div>
          <span className="mb-2 flex items-center justify-between text-sm font-medium text-ink-subtle">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="size-4 text-ink-muted" />
              الصلاحيات <span className="font-normal text-ink-muted">({accessIds.length}) · optionnel</span>
            </span>
            <button
              type="button"
              onClick={() => setAccessFormOpen(true)}
              className="text-[calc(12px*var(--ts))] font-medium text-brand-600 hover:underline"
            >
              + اعمل صلاحية
            </button>
          </span>
          {sortedAccesses.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
              ما فماش صلاحيات توّا — اعمل وحدة باش تحدّد شنوّة يوري العرض.
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
                          <span className="block truncate text-[calc(12px*var(--ts))] text-ink-muted">
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
        title="تحبّ تمسح العرض هذا؟"
        description={
          deleteTarget ? `«${deleteTarget.name}» باش تتمسح نهائيا.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
