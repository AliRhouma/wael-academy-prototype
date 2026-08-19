import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  GraduationCap,
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
import { OfferMark } from "@/features/shared/offers/OfferMark"
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
 * The catalogue is THREE offers, read as one ladder left to right: pay as you
 * climb, the full year, the full year plus everything. Cheapest rung first —
 * no filters, no sections: three cards side by side and the eye does the rest.
 */
const TIER_RANK: Record<OfferTier, number> = { khotwa: 0, turbo: 1, "turbo-max": 2 }
const rank = (o: Offer) => (o.tier ? TIER_RANK[o.tier] : 9)

type TierMeta = {
  /** Tinted price band at the head of the card. */
  band: string
  price: string
  hover: string
  icon: string
}

/**
 * ONE band for the whole ladder.
 *
 * The three rungs used to wear a colour each — green, cream, brand — which read
 * as three unrelated products rather than three sizes of the same one. They sell
 * the SAME content at different paces, so the card carries the brand tint and
 * lets the price, the period chip and the feature list do the separating. The
 * accent that survives is the price, and only because a figure needs weight.
 */
const BAND = "bg-brand-50"

const TIER_META: Record<OfferTier, TierMeta> = {
  khotwa: {
    band: BAND,
    price: "text-brand-700",
    hover: "hover:border-brand-300",
    icon: "bg-brand-50 text-brand-600",
  },
  turbo: {
    band: BAND,
    price: "text-brand-700",
    hover: "hover:border-brand-300",
    icon: "bg-brand-50 text-brand-600",
  },
  "turbo-max": {
    band: BAND,
    price: "text-brand-700",
    hover: "hover:border-brand-300",
    icon: "bg-brand-50 text-brand-600",
  },
}

const OTHER_META: TierMeta = {
  band: BAND,
  price: "text-brand-700",
  hover: "hover:border-brand-300",
  icon: "bg-brand-50 text-brand-600",
}

const metaOf = (t?: OfferTier) => (t ? TIER_META[t] : OTHER_META)

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
  /** The single recommended card of the catalogue — see `featuredId`. */
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
      // The dashboard's panel frame, on a card: a 3px `--brand-200` edge at a
      // 28px radius, no shadow. `CreamPanel` paints that frame by stacking two
      // clipped layers because it has a notch to cut; nothing here is notched,
      // so a plain border reproduces the same edge at the same weight and the
      // catalogue reads as part of the same surface family as لوحة القيادة.
      className={
        "group relative flex h-full flex-col overflow-hidden rounded-[28px] border-[3px] border-brand-200 bg-surface transition motion-safe:hover:-translate-y-1 " +
        (featured ? "ring-4 ring-brand-500/10" : meta.hover)
      }
    >
      {/* ---- Price band — the mark, the name and what it costs, in one block */}
      <div className={"relative p-5 " + (featured ? "bg-grad text-ink-inverted" : meta.band)}>
        {/* In the flow, on its own line — it used to be pinned to the corner
            with the name row reserving `pe-24` (96px) for it. The badge measures
            112px plus its 16px inset, so the name ran under it and « Turbo Pro
            Max » lost its T. Reserving the true 128px instead would have left
            the name ~70px at 1280 and broken it over three lines; above the row
            it collides with nothing and the name gets the full width. */}
        {(featured || subscribed) && (
          <span
            className={
              "mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[calc(10px*var(--ts))] font-bold shadow-xs " +
              (subscribed ? "bg-success-600 text-white" : "bg-surface-cream text-accent2-700")
            }
          >
            {subscribed ? <Check className="size-3" /> : <Sparkles className="size-3" />}
            {subscribed ? "مشترك فيه" : "الأكثر رواجا"}
          </span>
        )}

        <div className="flex items-center gap-3">
          <OfferMark offer={offer} size="md" inverted={featured} />
          <b
            dir="auto"
            className={
              "min-w-0 font-display text-[calc(16px*var(--ts))] font-bold leading-snug " +
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
        </div>

        {/* ONE prose line, not two. The admin writes both a « الجملة الترويجية »
            and a « Description », and printing them together said the same thing
            twice in two registers — the card is a choice between three offers,
            not a page about one. The tagline is the hook and wins; the
            description stands in when there is no tagline, so an admin who
            filled only that box still sees something. The long version belongs
            wherever the offer is read at length, not in a column of three. */}
        {(offer.tagline || offer.description) && (
          <p
            dir="auto"
            className="mt-3 text-[calc(12.5px*var(--ts))] leading-relaxed text-ink-subtle"
          >
            {offer.tagline || offer.description}
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
/* The screen                                                          */
/* ------------------------------------------------------------------ */

/** Élève — the catalogue: three offers, one ladder, hero then cards then matrix. */
export default function StudentOffersScreen() {
  const user = useAuth((s) => s.currentUser)
  const offers = useData((s) => s.offers)
  const subscriptions = useData((s) => s.subscriptions)
  const { show, toast } = useToast()

  const [asking, setAsking] = useState<Offer | null>(null)

  /** The subscriptions this élève already holds, indexed by the offer they buy. */
  const mySubByOffer = useMemo(() => {
    const m = new Map<string, string>()
    for (const s of subscriptions) if (s.userId === user?.id) m.set(s.offerId, s.id)
    return m
  }, [subscriptions, user?.id])

  /** The ladder, cheapest rung first. */
  const shown = useMemo(
    () => [...offers].sort((a, b) => rank(a) - rank(b) || netPrice(a) - netPrice(b)),
    [offers],
  )

  /**
   * Several offers may be flagged `popular`, but only ONE card wears the ring:
   * two identical "الأكثر رواجا" frames side by side cancel each other out.
   * The winner is the top rung of the ladder among the popular ones shown.
   */
  const featuredId = useMemo(
    () => shown.filter((o) => o.popular && !mySubByOffer.has(o.id)).at(-1)?.id,
    [shown, mySubByOffer],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + title, the same header every other élève screen wears
          (SeancesScreen, SubjectsScreen) — the hero band that used to title this
          page is gone, and a catalogue that opens straight on three price cards
          never says what it is. */}
      <nav
        aria-label="مسار التنقّل"
        className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted"
      >
        <Link to="/student" className="transition hover:text-brand-600">
          الصفحة الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">العروض</span>
      </nav>

      <h1 className="font-display text-[calc(26px*var(--ts))] font-bold leading-tight text-ink">
        العروض
      </h1>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Tag}
            title="ما فماش عروض توّة"
            description="الأكاديمية ما زالت تحضّر عروض هذا العام. ارجع بعد شويّة."
          />
        </div>
      ) : (
        /* ---- The three cards, cheapest rung first */
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((o) => (
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
      )}

      {/* Prototype: subscribing raises a request — l'admin creates the real one. */}
      <ConfirmDialog
        open={asking !== null}
        onOpenChange={(o) => !o && setAsking(null)}
        tone="brand"
        title="تحبّ تطلب العرض هذا؟"
        description={
          asking ? (
            <>
              {`«${asking.name}» بـ ${formatDT(netPrice(asking))}. الأكاديمية بش تكلّمك باش تكمّلو الخلاص.`}
              {/* The price fine print — instalments, conditions — used to sit on
                  the catalogue card, where it was three lines of small type the
                  élève had to read past to compare offers. It belongs at the
                  moment of paying, which in this prototype is this dialog. */}
              {asking.priceNotes && asking.priceNotes.length > 0 && (
                <span className="mt-3 block space-y-0.5 border-t border-border pt-3">
                  {asking.priceNotes.map((n) => (
                    <span
                      key={n}
                      dir="auto"
                      className="block text-[calc(11.5px*var(--ts))] text-ink-muted"
                    >
                      {n}
                    </span>
                  ))}
                </span>
              )}
            </>
          ) : undefined
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
