import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  Minus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import type { Offer, OfferTier } from "@/data/types"
import { formatDay, formatDT } from "@/features/shared/payments/paymentLib"

/** Shown discount: the stored % when set, else derived from the promo price. */
function discountPct(o: Offer): number | null {
  if (o.discountPct != null && o.discountPct > 0) return o.discountPct
  if (o.promoPrice == null || o.promoPrice >= o.price) return null
  return Math.round((1 - o.promoPrice / o.price) * 100)
}

/** What the élève actually pays. */
const netPrice = (o: Offer) => o.promoPrice ?? o.price

/** Dinars saved by the promo — the persuasive number, next to the percentage. */
const saved = (o: Offer) => (o.promoPrice != null && o.promoPrice < o.price ? o.price - o.promoPrice : 0)

/**
 * The price suffix. An explicit `pricePeriod` wins ("عند الخلاص بالحاضر");
 * otherwise the billing rhythm speaks for itself.
 */
function priceSuffix(o: Offer): string {
  if (o.pricePeriod) return o.pricePeriod
  if (o.billing === "monthly") return "/ شهر"
  if (o.billing === "annual") return "سنويّا"
  return ""
}

/**
 * The commercial ladder, cheapest rung first. The catalogue is now READ as this
 * ladder: one section per rung, so the élève climbs instead of scanning a flat
 * grid of ten look-alike cards.
 */
const TIER_ORDER: OfferTier[] = ["silver", "gold", "early", "integral"]
const TIER_RANK: Record<OfferTier, number> = { silver: 0, gold: 1, early: 2, integral: 3 }
const rank = (o: Offer) => (o.tier ? TIER_RANK[o.tier] : 9)

type TierMeta = {
  label: string
  blurb: string
  logo?: string
  /** Tinted price band at the head of every card in this rung. */
  band: string
  price: string
  chip: string
  hover: string
  icon: string
}

const TIER_META: Record<OfferTier, TierMeta> = {
  silver: {
    label: "Silver",
    blurb: "الأساسي — فيديوهات، تمارين وتلاخيص، شهر بشهر بلا التزام.",
    logo: "/offers/silver.svg",
    band: "bg-neutral-100",
    price: "text-ink",
    chip: "bg-surface text-neutral-600",
    hover: "hover:border-neutral-300",
    icon: "bg-neutral-100 text-neutral-600",
  },
  gold: {
    label: "Gold",
    blurb: "العام الكامل — زيد الحصص المباشرة والمنتدى، بسومة أرخص.",
    logo: "/offers/gold.svg",
    band: "bg-accent2-50",
    price: "text-accent2-700",
    chip: "bg-surface text-accent2-700",
    hover: "hover:border-accent2-300",
    icon: "bg-accent2-50 text-accent2-600",
  },
  early: {
    label: "بدري",
    blurb: "عروض العودة المدرسية — سومة الانطلاق، لوقت محدود.",
    logo: "/offers/early.svg",
    band: "bg-success-50",
    price: "text-success-700",
    chip: "bg-surface text-success-700",
    hover: "hover:border-success-300",
    icon: "bg-success-50 text-success-600",
  },
  integral: {
    label: "وائل للخر",
    blurb: "أكمل عرض في المنصّة — كل شيء، من أوّل العام حتى للامتحان.",
    logo: "/offers/integral.svg",
    band: "bg-brand-50",
    price: "text-brand-700",
    chip: "bg-surface text-brand-700",
    hover: "hover:border-brand-300",
    icon: "bg-brand-50 text-brand-600",
  },
}

const OTHER_META: TierMeta = {
  label: "عروض أخرى",
  blurb: "عروض خاصة برّا الرتب.",
  band: "bg-surface-muted",
  price: "text-ink",
  chip: "bg-surface text-ink-subtle",
  hover: "hover:border-border-strong",
  icon: "bg-neutral-100 text-ink-subtle",
}

const metaOf = (t?: OfferTier) => (t ? TIER_META[t] : OTHER_META)

type Scope = "mine" | "all"
type Billing = "all" | "monthly" | "annual"

/** Features beyond this fold behind a "و N زيادة" toggle — cards stay same height. */
const FEATURES_SHOWN = 4

/* ------------------------------------------------------------------ */
/* The card — a tinted price band, then a white body                   */
/* ------------------------------------------------------------------ */

function OfferCard({
  offer,
  featured,
  subscribed,
  subscriptionId,
  onSubscribe,
}: {
  offer: Offer
  /** The single recommended card of the current view — see `featuredId`. */
  featured: boolean
  subscribed: boolean
  subscriptionId?: string
  onSubscribe: () => void
}) {
  const [open, setOpen] = useState(false)
  const meta = metaOf(offer.tier)
  const pct = discountPct(offer)
  const gain = saved(offer)
  const features = offer.features ?? []
  const collapsible = features.length > FEATURES_SHOWN + 1
  const visible = collapsible && !open ? features.slice(0, FEATURES_SHOWN) : features

  return (
    <article
      className={
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-surface transition motion-safe:hover:-translate-y-1 " +
        (featured
          ? "border-brand-200 shadow-lg ring-4 ring-brand-500/10"
          : `border-border shadow-sm hover:shadow-md ${meta.hover}`)
      }
    >
      {/* ---- Price band — the identity + what it costs, in one tinted block */}
      <div className={"relative p-5 " + (featured ? "bg-grad text-ink-inverted" : meta.band)}>
        {(featured || subscribed) && (
          <span
            className={
              "absolute top-4 end-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[calc(10px*var(--ts))] font-bold shadow-xs " +
              (subscribed ? "bg-success-600 text-white" : "bg-surface-cream text-accent2-700")
            }
          >
            {subscribed ? <Check className="size-3" /> : <Sparkles className="size-3" />}
            {subscribed ? "مشترك فيه" : "الأكثر رواجا"}
          </span>
        )}

        <div className="flex items-center gap-3 pe-24">
          {offer.logoUrl ? (
            <img src={offer.logoUrl} alt="" className="size-12 shrink-0" />
          ) : (
            <span className={"grid size-12 shrink-0 place-items-center rounded-md " + meta.icon}>
              <Tag className="size-5" />
            </span>
          )}
          <b
            dir="auto"
            className={
              "min-w-0 font-display text-[calc(15px*var(--ts))] font-bold leading-snug " +
              (featured ? "text-ink-inverted" : "text-ink")
            }
          >
            {offer.name}
          </b>
        </div>

        {offer.priceLabel && (
          <span
            className={
              "mt-4 block text-[calc(11px*var(--ts))] " + (featured ? "text-white/75" : "text-ink-muted")
            }
          >
            {offer.priceLabel}
          </span>
        )}
        <p className={"flex flex-wrap items-baseline gap-x-2 " + (offer.priceLabel ? "mt-0.5" : "mt-4")}>
          <span
            className={
              "font-display text-[calc(28px*var(--ts))] font-bold leading-none tabular-nums " +
              (featured ? "text-ink-inverted" : meta.price)
            }
          >
            {formatDT(netPrice(offer))}
          </span>
          {priceSuffix(offer) && (
            <span
              className={
                "text-[calc(12px*var(--ts))] " + (featured ? "text-white/75" : "text-ink-muted")
              }
            >
              {priceSuffix(offer)}
            </span>
          )}
        </p>

        {pct != null && (
          <p className="mt-2 flex flex-wrap items-center gap-2">
            {offer.promoPrice != null && (
              <span
                className={
                  "text-[calc(12px*var(--ts))] line-through tabular-nums " +
                  (featured ? "text-white/70" : "text-ink-muted")
                }
              >
                {formatDT(offer.price)}
              </span>
            )}
            <span
              className={
                "inline-flex rounded-full px-2 py-0.5 text-[calc(11px*var(--ts))] font-bold tabular-nums " +
                (featured ? "bg-surface-cream text-accent2-700" : "bg-danger-50 text-danger-600")
              }
            >
              -{pct}%
            </span>
            {gain > 0 && (
              <span
                className={
                  "text-[calc(11.5px*var(--ts))] font-medium tabular-nums " +
                  (featured ? "text-white/85" : "text-success-700")
                }
              >
                توفّر {formatDT(gain)}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ---- The body — rhythm, then what's inside, then the action */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {offer.audience && (
            <span
              dir="auto"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[calc(11px*var(--ts))] font-medium text-ink-subtle"
            >
              <GraduationCap className="size-3.5 text-ink-muted" />
              {offer.audience}
            </span>
          )}
          {offer.period && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[calc(11px*var(--ts))] font-medium text-ink-subtle">
              <CalendarDays className="size-3.5 text-ink-muted" />
              {offer.period}
            </span>
          )}
          {offer.billing === "monthly" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[calc(11px*var(--ts))] font-medium text-ink-subtle">
              <RefreshCw className="size-3.5 text-ink-muted" />
              تنجّم توقّف وقت ما تحبّ
            </span>
          )}
        </div>

        {offer.tagline && (
          <p dir="auto" className="mt-3 text-[calc(12.5px*var(--ts))] leading-relaxed text-ink-subtle">
            {offer.tagline}
          </p>
        )}

        {/* The deadline is the one urgent thing on the card — red, and only here. */}
        {offer.endDate && (
          <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-sm bg-danger-50 px-2.5 py-1 text-[calc(11.5px*var(--ts))] font-medium text-danger-600">
            <Clock3 className="size-3.5" />
            العرض يوفى في {formatDay(offer.endDate)}
          </p>
        )}

        {features.length > 0 && (
          <>
            <ul className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
              {visible.map((f) => (
                <li
                  key={f}
                  dir="auto"
                  className="flex items-start gap-2.5 text-[calc(12.5px*var(--ts))] leading-snug text-ink-subtle"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" />
                  {f}
                </li>
              ))}
            </ul>
            {collapsible && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-1 self-start text-[calc(12px*var(--ts))] font-medium text-brand-600 transition hover:text-brand-700"
              >
                {open ? "نقّص" : `و ${features.length - FEATURES_SHOWN} خدمات زايدة`}
                <ChevronDown
                  className={"size-3.5 transition-transform " + (open ? "rotate-180" : "")}
                />
              </button>
            )}
          </>
        )}

        {offer.priceNotes && offer.priceNotes.length > 0 && (
          <div className="mt-4 space-y-0.5">
            {offer.priceNotes.map((n) => (
              <p key={n} dir="auto" className="text-[calc(11.5px*var(--ts))] text-ink-muted">
                {n}
              </p>
            ))}
          </div>
        )}

        {/* The action — owned offers point at the wallet instead of re-selling. */}
        {subscribed && subscriptionId ? (
          <Link
            to={`/student/porte-monnaie/${subscriptionId}`}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-success-600/40 bg-success-50 font-medium text-success-700 transition hover:bg-success-50/70"
          >
            <Wallet className="size-4" /> شوف الخلاص
          </Link>
        ) : (
          <button
            type="button"
            onClick={onSubscribe}
            className={
              "mt-5 inline-flex h-11 items-center justify-center rounded-md font-medium transition " +
              (featured
                ? "bg-grad text-ink-inverted shadow-brand hover:brightness-105"
                : "border border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-600")
            }
          >
            اشترك الآن
          </button>
        )}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* The comparison matrix — what actually separates the rungs           */
/* ------------------------------------------------------------------ */

function CompareTable({ offers }: { offers: Offer[] }) {
  /** Columns = the rungs on screen; rows = every service, commonest first. */
  const tiers = useMemo(
    () => TIER_ORDER.filter((t) => offers.some((o) => o.tier === t)),
    [offers],
  )

  const rows = useMemo(() => {
    const count = new Map<string, number>()
    for (const o of offers) for (const f of o.features ?? []) count.set(f, (count.get(f) ?? 0) + 1)
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f)
  }, [offers])

  const has = (tier: OfferTier, feature: string) =>
    offers.some((o) => o.tier === tier && (o.features ?? []).includes(feature))

  if (tiers.length < 2 || rows.length === 0) return null

  return (
    <section className="hidden md:block">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
          <Check className="size-4" />
        </span>
        <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
          قارن بين الرتب
        </h2>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="bg-surface-muted">
              <th className="px-5 py-3 text-start text-[calc(12px*var(--ts))] font-medium text-ink-muted">
                الخدمة
              </th>
              {tiers.map((t) => (
                <th key={t} className="px-4 py-3 text-center">
                  <span className="inline-flex flex-col items-center gap-1">
                    {TIER_META[t].logo && (
                      <img src={TIER_META[t].logo} alt="" className="size-8" />
                    )}
                    <span className="font-display text-[calc(12.5px*var(--ts))] font-bold text-ink">
                      {TIER_META[t].label}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f, i) => (
              <tr key={f} className={i % 2 ? "bg-surface-muted/50" : undefined}>
                <td
                  dir="auto"
                  className="border-t border-border px-5 py-3 text-[calc(12.5px*var(--ts))] text-ink-subtle"
                >
                  {f}
                </td>
                {tiers.map((t) => (
                  <td key={t} className="border-t border-border px-4 py-3 text-center">
                    {has(t, f) ? (
                      <Check className="mx-auto size-4 text-success-600" />
                    ) : (
                      <Minus className="mx-auto size-4 text-neutral-300" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* The screen                                                          */
/* ------------------------------------------------------------------ */

/** Élève — the offer catalogue, read as a ladder: hero, rungs, comparison. */
export default function StudentOffersScreen() {
  const user = useAuth((s) => s.currentUser)
  const offers = useData((s) => s.offers)
  const years = useData((s) => s.years)
  const subscriptions = useData((s) => s.subscriptions)
  const { show, toast } = useToast()

  const [scope, setScope] = useState<Scope>("mine")
  const [billing, setBilling] = useState<Billing>("all")
  const [asking, setAsking] = useState<Offer | null>(null)

  const myYearIds = user?.yearIds ?? []
  const myYearName = useMemo(
    () => years.filter((y) => myYearIds.includes(y.id)).map((y) => y.name).join(" · "),
    [years, myYearIds],
  )

  /** The subscriptions this élève already holds, indexed by the offer they buy. */
  const mySubByOffer = useMemo(() => {
    const m = new Map<string, string>()
    for (const s of subscriptions) if (s.userId === user?.id) m.set(s.offerId, s.id)
    return m
  }, [subscriptions, user?.id])

  const forMyYear = useMemo(
    () => (o: Offer) => myYearIds.length === 0 || o.yearIds.some((y) => myYearIds.includes(y)),
    [myYearIds],
  )

  const mineCount = useMemo(() => offers.filter(forMyYear).length, [offers, forMyYear])

  const shown = useMemo(() => {
    return offers
      .filter((o) => (scope === "mine" ? forMyYear(o) : true))
      .filter((o) => (billing === "all" ? true : o.billing === billing))
      .sort((a, b) => rank(a) - rank(b) || netPrice(a) - netPrice(b))
  }, [offers, scope, billing, forMyYear])

  /** One section per rung of the ladder, in ladder order. */
  const groups = useMemo(() => {
    const byTier = new Map<OfferTier | "other", Offer[]>()
    for (const o of shown) {
      const k = o.tier ?? "other"
      const list = byTier.get(k)
      if (list) list.push(o)
      else byTier.set(k, [o])
    }
    const keys: (OfferTier | "other")[] = [...TIER_ORDER, "other"]
    return keys
      .filter((k) => byTier.has(k))
      .map((k) => ({
        key: k,
        meta: k === "other" ? OTHER_META : TIER_META[k],
        offers: byTier.get(k)!,
      }))
  }, [shown])

  /** Offers already owned — pinned above the catalogue whatever the filters say. */
  const owned = useMemo(() => offers.filter((o) => mySubByOffer.has(o.id)), [offers, mySubByOffer])

  /**
   * Several offers may be flagged `popular`, but only ONE card wears the ring:
   * two identical "الأكثر رواجا" frames side by side cancel each other out.
   * The winner is the top rung of the ladder among the popular ones shown.
   */
  const featuredId = useMemo(
    () => shown.filter((o) => o.popular && !mySubByOffer.has(o.id)).at(-1)?.id,
    [shown, mySubByOffer],
  )

  /** The loudest promo in the catalogue — the hero's headline number. */
  const bestPct = useMemo(
    () => offers.reduce((max, o) => Math.max(max, discountPct(o) ?? 0), 0),
    [offers],
  )

  const scopeTabs: { key: Scope; label: string; count: number }[] = [
    { key: "mine", label: "لقسمي", count: mineCount },
    { key: "all", label: "الكل", count: offers.length },
  ]
  const billingChips: { key: Billing; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "monthly", label: "شهري" },
    { key: "annual", label: "سنوي" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Hero — the promise, the reassurance, and the best deal in one band */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -end-16 size-64 rounded-full bg-accent2-100/70 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -start-20 size-64 rounded-full bg-brand-100/60 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 font-display text-[calc(10.5px*var(--ts))] font-bold uppercase tracking-[.18em] text-accent2-600">
              <Sparkles className="size-3.5" /> العروض
            </span>
            <h1 className="mt-2 font-display text-[calc(26px*var(--ts))] font-bold leading-tight text-ink">
              اختار العرض اللي يوصّلك
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              {myYearName
                ? `العروض المتاحة لـ «${myYearName}» — من الأساسي حتى للعرض الكامل.`
                : "من الأساسي حتى للعرض الكامل — اختار اللي يناسب قسمك وطموحك."}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "بلا التزام في العروض الشهرية" },
                { icon: Wallet, label: "خلاص بالتقسيط" },
                { icon: GraduationCap, label: "محتوى مطابق للبرنامج الرسمي" },
              ].map((p) => (
                <li
                  key={p.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[calc(11.5px*var(--ts))] font-medium text-ink-subtle shadow-xs"
                >
                  <p.icon className="size-3.5 text-brand-500" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>

          {bestPct > 0 && (
            <div className="shrink-0 rounded-lg border border-accent2-500/25 bg-surface-cream px-5 py-4 text-center">
              <p className="text-[calc(11px*var(--ts))] font-medium text-accent2-700">أقصى تخفيض</p>
              <p className="font-display text-[calc(30px*var(--ts))] font-bold leading-none tabular-nums text-accent2-600">
                -{bestPct}%
              </p>
              <p className="mt-1 text-[calc(11px*var(--ts))] text-ink-muted">على عروض مختارة</p>
            </div>
          )}
        </div>
      </section>

      {/* ---- What the élève already holds — the first thing they look for */}
      {owned.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-display text-[calc(11.5px*var(--ts))] font-bold uppercase tracking-[.12em] text-success-700">
            اشتراكك الحالي
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {owned.map((o) => (
              <Link
                key={o.id}
                to={`/student/porte-monnaie/${mySubByOffer.get(o.id)}`}
                className="flex items-center gap-3 rounded-lg border border-success-600/25 bg-success-50/40 p-3 transition hover:border-success-600/50 hover:shadow-sm"
              >
                {o.logoUrl ? (
                  <img src={o.logoUrl} alt="" className="size-10 shrink-0" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-success-50 text-success-700">
                    <Check className="size-5" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <b
                    dir="auto"
                    className="line-clamp-2 block font-display text-[calc(13.5px*var(--ts))] font-bold leading-snug text-ink"
                  >
                    {o.name}
                  </b>
                  <span className="text-[calc(11.5px*var(--ts))] text-ink-muted">
                    {o.period ?? "اشتراك جاري"}
                  </span>
                </span>
                <span className="shrink-0 text-[calc(11.5px*var(--ts))] font-medium text-brand-600">
                  المحفظة ←
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---- Filters — scope on one side, billing rhythm on the other */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-md border border-border bg-surface-muted p-1">
          {scopeTabs.map((t) => {
            const active = scope === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setScope(t.key)}
                className={
                  "inline-flex h-9 items-center gap-1.5 rounded-[7px] px-3.5 text-sm font-medium transition " +
                  (active ? "bg-grad text-ink-inverted shadow-brand" : "text-ink-subtle hover:text-brand-600")
                }
              >
                {t.label}
                <span
                  className={
                    "rounded-full px-1.5 text-xs tabular-nums " +
                    (active ? "bg-white/20" : "bg-neutral-100 text-ink-muted")
                  }
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
          {billingChips.map((c) => {
            const active = billing === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setBilling(c.key)}
                className={
                  "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition " +
                  (active
                    ? "border-transparent bg-brand-600 text-ink-inverted"
                    : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                }
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Search}
            title="ما فماش عرض هوني"
            description="ما فماش عرض يوافق الفلتر هذا. جرّب «الكل» ولا بدّل نسق الخلاص."
            action={
              <button
                type="button"
                onClick={() => {
                  setScope("all")
                  setBilling("all")
                }}
                className="inline-flex h-11 items-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
              >
                وري العروض الكل
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* ---- One section per rung — the catalogue reads as a ladder */}
          {groups.map((g) => (
            <section key={g.key}>
              <header className="flex items-center gap-3">
                {g.meta.logo ? (
                  <img src={g.meta.logo} alt="" className="size-11 shrink-0" />
                ) : (
                  <span
                    className={"grid size-11 shrink-0 place-items-center rounded-md " + g.meta.icon}
                  >
                    <Tag className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="font-display text-[calc(17px*var(--ts))] font-bold leading-tight text-ink">
                    {g.meta.label}
                  </h2>
                  <p dir="auto" className="text-[calc(12px*var(--ts))] leading-snug text-ink-muted">
                    {g.meta.blurb}
                  </p>
                </div>
                <span className="ms-auto hidden shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[calc(11px*var(--ts))] font-medium tabular-nums text-ink-muted md:inline">
                  {g.offers.length} عروض
                </span>
              </header>

              <div className="mt-4 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {g.offers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    featured={o.id === featuredId}
                    subscribed={mySubByOffer.has(o.id)}
                    subscriptionId={mySubByOffer.get(o.id)}
                    onSubscribe={() => setAsking(o)}
                  />
                ))}
              </div>
            </section>
          ))}

          <CompareTable offers={shown} />
        </>
      )}

      {/* Prototype: subscribing raises a request — l'admin creates the real one. */}
      <ConfirmDialog
        open={asking !== null}
        onOpenChange={(o) => !o && setAsking(null)}
        tone="brand"
        title="تحبّ تطلب العرض هذا؟"
        description={
          asking
            ? `«${asking.name}» بـ ${formatDT(netPrice(asking))}. الأكاديمية بش تكلّمك باش تكمّلو الخلاص.`
            : undefined
        }
        confirmLabel="ابعث الطلب"
        cancelLabel="سكّر"
        onConfirm={() => {
          show("طلبك توصّل — الأكاديمية بش تكلّمك")
          setAsking(null)
        }}
      />

      {toast}
    </div>
  )
}
