import { useMemo, useState, type ReactNode } from "react"
import { CalendarCheck2, Check, CheckCircle2, Clock, Crown, Info, Mail, MessageSquareText, Phone, Send, Wallet } from "lucide-react"
import type { Offer } from "@/data/types"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/components/kit/Toast"
import { useIsMobile } from "@/lib/hooks"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import { useDemoStates } from "../demoStates"
import { ctaClass } from "../ui"
import { sfx } from "../sound"

const PHONE = "+216 50 40 43"
const EMAIL = "contact@waelacademy.com"

/** "25-08-2027" — the frame writes the end date day first. */
function dmy(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}-${m}-${y}`
}

/**
 * العروض — the élève's offers: the one they hold, and the ones they can add.
 *
 * From the frames, with the one change asked: the three offers sit on ONE
 * line — « عروضك » over the first column, « عروض أخرى » over the other two —
 * instead of the current offer stacked above the rest. Same card for all
 * three so they compare row by row: the mark, the name, the price box (the
 * red amount off, the struck base price, « سنوي »), the actions, then the
 * checklist with its one-line details and the credit at the foot. Columns
 * stretch to one height, so the credits line up however long each list runs.
 *
 * The catalogue is the store's (`offers.json`) — the landing's pricing reads
 * the same rows, so a price can never disagree between the two. The current
 * offer is the élève's ACTIVE subscription.
 */
export default function V2OffersScreen() {
  const offers = useData((s) => s.offers)
  const subscriptions = useData((s) => s.subscriptions)
  const user = useAuth((s) => s.currentUser)
  const { offers: demo } = useDemoStates()
  const { toast, show } = useToast()

  const sub = useMemo(
    () => (demo === "none" ? undefined : subscriptions.find((s) => s.userId === user?.id && s.state === "active")),
    [subscriptions, user, demo],
  )
  const current = sub ? offers.find((o) => o.id === sub.offerId) : undefined
  // The flagship first among the rest — the store lists them cheapest first.
  const others = offers.filter((o) => o.id !== current?.id).sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price))

  const [asked, setAsked] = useState<Set<string>>(() => new Set())
  const [dialog, setDialog] = useState<{ kind: "contact" } | { kind: "plan" | "subscribe"; offer: Offer } | null>(null)
  const close = () => {
    sfx("close")
    setDialog(null)
  }

  const label = "text-[calc(10px*var(--ts))] font-bold text-v2-ink md:text-[calc(11px*var(--ts))]"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">العروض</h1>
          <p className="mt-1 text-[calc(9px*var(--ts))] text-v2-ink/60">عروضك الحالية، والعروض اللي تنجّم تزيدها.</p>
        </div>
        <button
          type="button"
          data-uisfx="open" onClick={() => setDialog({ kind: "contact" })}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-v2-ink/20 bg-v2-surface px-5 text-[calc(9px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand hover:text-v2-brand"
        >
          <MessageSquareText className="size-5" strokeWidth={1.75} />
          اكتب للأكاديمية
        </button>
      </div>

      {/* One line of three. Labels ride above their columns at lg; below it the
          DOM order reads « عروضك », your card, « عروض أخرى », the rest. */}
      <div className="grid gap-x-5 gap-y-3 lg:grid-cols-3 2xl:gap-x-6">
        <p className={cn(label, "lg:col-start-1 lg:row-start-1")}>عروضك</p>
        <div className="rise mb-4 min-w-0 lg:col-start-1 lg:row-start-2 lg:mb-0" style={{ ["--i" as string]: 0 }}>
          {current && sub ? (
            <OfferColumn offer={current} current={{ until: sub.deadline }} />
          ) : (
            <NoOffer />
          )}
        </div>
        <p className={cn(label, "lg:col-span-2 lg:col-start-2 lg:row-start-1")}>عروض أخرى</p>
        {others.slice(0, current ? 2 : 3).map((o, i) => (
          <div
            key={o.id}
            className={cn("rise min-w-0 lg:row-start-2", current ? (i === 0 ? "lg:col-start-2" : "lg:col-start-3") : "")}
            style={{ ["--i" as string]: i + 1 }}
          >
            <OfferColumn
              offer={o}
              asked={asked.has(o.id)}
              onSubscribe={() => setDialog({ kind: "subscribe", offer: o })}
              onPlan={() => setDialog({ kind: "plan", offer: o })}
            />
          </div>
        ))}
      </div>

      <p className="flex items-start gap-3 rounded-2xl border border-v2-brand/25 bg-v2-brand/[0.06] p-4 text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/80">
        <Info className="mt-0.5 size-5 shrink-0 text-v2-brand" strokeWidth={1.75} />
        <span>
          العرض يتفعّل من عند الأكاديمية:{" "}
          <button type="button" data-uisfx="open" onClick={() => setDialog({ kind: "contact" })} className="font-bold text-v2-brand underline-offset-4 hover:underline">
            اكتبلها من هنا
          </button>{" "}
          ولّا{" "}
          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="font-bold text-v2-brand underline-offset-4 hover:underline">
            اتصل بيها
          </a>
          ، وكي يتفعّل تلقى المحتوى محلول في موادّك وحصصك.
        </span>
      </p>

      {dialog?.kind === "contact" && (
        <Modal title="اكتب للأكاديمية" description="نجاوبوك في نفس النهار، من الإثنين للسبت." onClose={close}>
          <ContactForm
            onSent={() => {
              close()
              show("بعثنا رسالتك للأكاديمية")
            }}
          />
        </Modal>
      )}
      {dialog?.kind === "plan" && (
        <Modal title="تفاصيل الدفع بالتقسيط" description={dialog.offer.name} onClose={close}>
          <Plan offer={dialog.offer} />
        </Modal>
      )}
      {dialog?.kind === "subscribe" && (
        <Modal title={`اشترك في ${dialog.offer.name}`} description="العرض يتفعّل من عند الأكاديمية، بعد ما تتصل بيك." onClose={close}>
          <Subscribe
            offer={dialog.offer}
            onPlan={() => setDialog({ kind: "plan", offer: dialog.offer })}
            onSend={() => {
              setAsked((prev) => new Set(prev).add(dialog.offer.id))
              close()
              show("طلبك وصل — الأكاديمية تتصل بيك قريب")
            }}
          />
        </Modal>
      )}
      {toast}
    </div>
  )
}

/* ------------------------------------------------------------------ */

/**
 * The offer's mark, type-set as a sticker — the delivered logos are images we
 * don't have yet (a « خطوة بخطوة 2027 » badge, a crowned « الأوائل »). Navy
 * letters on a lime slab, tilted, the crown for the top-students offer.
 * Dropping a real `logoUrl` in the store replaces it.
 */
function OfferMark({ offer }: { offer: Offer }) {
  if (offer.logoUrl) return <img src={offer.logoUrl} alt="" className="h-14 w-auto" />
  const crowned = offer.tier === "turbo"
  return (
    <span aria-hidden className="relative inline-flex -rotate-6 flex-col items-center rounded-xl bg-v2-cta px-3 py-1 leading-none shadow-[3px_3px_0_var(--v2-ink)]">
      {crowned && <Crown className="absolute -top-4 size-5 fill-[#F4B400] text-v2-ink" strokeWidth={1.5} />}
      {/* #F4B400: the crown's gold — the one non-palette ink, as on the landing's star. */}
      <span className="text-[calc(11px*var(--ts))] font-black text-v2-ink">{offer.logoText ?? offer.name}</span>
      {offer.logoSub && <span className="text-[calc(9px*var(--ts))] font-black text-v2-brand">{offer.logoSub}</span>}
    </span>
  )
}

function OfferColumn({
  offer,
  current,
  asked,
  onSubscribe,
  onPlan,
}: {
  offer: Offer
  current?: { until?: string }
  asked?: boolean
  onSubscribe?: () => void
  onPlan?: () => void
}) {
  const now = offer.promoPrice ?? offer.price
  const off = offer.promoPrice ? offer.price - offer.promoPrice : 0
  const period = offer.pricePeriod ?? offer.period ?? (offer.billing === "annual" ? "سنوي" : "شهري")
  const contents = offer.contents ?? (offer.features ?? []).map((title) => ({ title, text: "" }))

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-3xl p-3 md:p-4",
        current ? "border-2 border-v2-brand/70 bg-v2-brand/[0.07]" : "border border-v2-ink/10 bg-v2-ink/[0.03]",
      )}
    >
      <header className="flex flex-col items-center gap-3 px-2 pt-4 text-center">
        <OfferMark offer={offer} />
        <h2 className="text-[calc(12px*var(--ts))] font-bold text-v2-ink md:text-[calc(13px*var(--ts))]">{offer.name}</h2>
      </header>

      {/* Price */}
      <div className="relative rounded-2xl bg-v2-surface p-4 pt-5">
        {off > 0 && (
          <span className="absolute end-0 top-0 rounded-es-xl rounded-se-2xl bg-v2-live px-3 py-1 text-[calc(8px*var(--ts))] font-bold text-white">
            {/* Isolated LTR, or the minus drifts to the far end of the number. */}
            <bdi dir="ltr">-{off}</bdi> د
          </span>
        )}
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[calc(20px*var(--ts))] font-black leading-none tabular-nums text-v2-ink">{now}</span>
          <span className="text-[calc(9px*var(--ts))] font-bold text-v2-ink">د</span>
          {off > 0 && (
            <span className="text-[calc(9.5px*var(--ts))] tabular-nums text-v2-live line-through decoration-2">{offer.price}</span>
          )}
          <span className="text-[calc(9px*var(--ts))] text-v2-ink/60">{period}</span>
        </p>
        <p className="mt-1 text-[calc(7.5px*var(--ts))] text-v2-ink/50">السعر</p>
        {offer.installable && (
          <p className="mt-3 flex items-center gap-2 border-t border-dashed border-v2-ink/15 pt-3 text-[calc(8px*var(--ts))] text-v2-ink/80">
            <Wallet className="size-4 shrink-0 text-v2-brand" strokeWidth={1.75} />
            عرض قابل للدفع بالتقسيط
          </p>
        )}
      </div>

      {/* Actions */}
      {current ? (
        <p className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-v2-brand/12 px-4 text-[calc(8.5px*var(--ts))] font-bold text-v2-brand">
          <CheckCircle2 className="size-5" strokeWidth={1.75} />
          عرضك الحالي
          {current.until && <span className="font-normal text-v2-ink/60">· إلى {dmy(current.until)}</span>}
        </p>
      ) : asked ? (
        <p className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-dashed border-v2-done-line bg-v2-done/[0.08] px-4 text-[calc(8.5px*var(--ts))] font-bold text-v2-done">
          <Clock className="size-5" strokeWidth={1.75} />
          طلبك وصل — الأكاديمية تتصل بيك
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" data-uisfx="open" onClick={onSubscribe} className={cn(ctaClass, "px-3")}>
            اشترك الآن
          </button>
          <button
            type="button"
            data-uisfx="open" onClick={onPlan}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-v2-ink/20 bg-v2-surface px-3 text-[calc(8px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand hover:text-v2-brand"
          >
            تفاصيل الدفع بالتقسيط
          </button>
        </div>
      )}

      {/* Contents */}
      <div className="flex flex-1 flex-col rounded-2xl bg-v2-surface p-4">
        <h3 className="text-center text-[calc(9.5px*var(--ts))] font-bold text-v2-ink md:text-[calc(10.5px*var(--ts))]">
          يحتوي عرض {offer.shortName ?? offer.name} على
        </h3>
        <ul className="mt-3 divide-y divide-v2-ink/[0.07]">
          {contents.map((c) => (
            <li key={c.title} className="flex items-start gap-2.5 py-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-v2-brand text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className="block text-[calc(8.5px*var(--ts))] font-bold text-v2-ink" dir="auto">
                  {c.title}
                </span>
                {c.text && <span className="mt-0.5 block text-[calc(7.5px*var(--ts))] leading-relaxed text-v2-ink/60">{c.text}</span>}
              </span>
            </li>
          ))}
        </ul>
        {offer.credit && (
          <p className="mt-auto border-t border-v2-ink/[0.07] pt-3 text-center text-[calc(8px*var(--ts))] font-bold text-v2-ink">{offer.credit}</p>
        )}
      </div>
    </article>
  )
}

function NoOffer() {
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-v2-brand/40 bg-v2-brand/[0.05] p-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-v2-surface">
        <CalendarCheck2 className="size-8 stroke-v2-grad" strokeWidth={1.5} />
      </span>
      <p className="text-[calc(11px*var(--ts))] font-bold text-v2-ink">ما عندكش عرض توّا</p>
      <p className="max-w-xs text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/60">
        اختار عرض من العروض اللي على جنب — وكي تفعّلو الأكاديمية، يتحلّ المحتوى الكل في موادّك وحصصك.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/** Bottom sheet on a phone, centred dialog on desktop — same content. */
function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  const mobile = useIsMobile()
  if (mobile) {
    return (
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="max-h-[88dvh] gap-3 overflow-y-auto rounded-t-3xl bg-v2-surface px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-v2-ink">
          <span aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-v2-ink/15" />
          <SheetTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</SheetTitle>
          {description && <SheetDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink/55">{description}</SheetDescription>}
          {children}
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-3 rounded-3xl border-v2-ink/15 bg-v2-surface p-6 text-v2-ink sm:max-w-lg">
        <DialogTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</DialogTitle>
        {description && <DialogDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink/55">{description}</DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

function ContactForm({ onSent }: { onSent: () => void }) {
  const [body, setBody] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (body.trim()) onSent()
      }}
      className="flex flex-col gap-3"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        autoFocus
        placeholder="مثلاً: نحبّ نبدّل للعرض السنوي، كيفاش نعمل؟"
        className="w-full resize-none rounded-2xl border border-v2-ink/15 bg-v2-surface p-4 text-[calc(9px*var(--ts))] text-v2-ink outline-none transition placeholder:text-v2-ink/40 focus:border-v2-brand/60"
      />
      <button type="submit" data-uisfx="send" disabled={!body.trim()} className={ctaClass}>
        <Send className="size-4 -scale-x-100" />
        ابعث
      </button>
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-v2-ink/15 text-[calc(8px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand" dir="ltr">
          <Phone className="size-4" /> {PHONE}
        </a>
        <a href={`mailto:${EMAIL}`} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-v2-ink/15 text-[calc(8px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand">
          <Mail className="size-4" /> إيميل
        </a>
      </div>
    </form>
  )
}

/**
 * A display of the three-instalment arrangement the academy offers — 40 % at
 * subscription, then two equal parts in December and March. Arithmetic on the
 * offer's price, nothing more; the real contract is set by the admin.
 */
function Plan({ offer }: { offer: Offer }) {
  const total = offer.promoPrice ?? offer.price
  const first = Math.round((total * 0.4) / 10) * 10
  const rest = total - first
  const second = Math.round(rest / 2)
  const rows = [
    { when: "عند الاشتراك", amount: first },
    { when: "في ديسمبر", amount: second },
    { when: "في مارس", amount: rest - second },
  ]
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={r.when} className="flex items-center gap-3 rounded-2xl border border-v2-ink/10 p-3">
            <span dir="ltr" className="grid size-9 shrink-0 place-items-center rounded-full bg-v2-grad text-[calc(8px*var(--ts))] font-bold text-white">
              {i + 1}
            </span>
            <span className="flex-1 text-[calc(9px*var(--ts))] font-semibold text-v2-ink">{r.when}</span>
            <span className="text-[calc(11px*var(--ts))] font-black tabular-nums text-v2-ink">
              {r.amount} <span className="text-[calc(8px*var(--ts))] font-bold">د</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-between rounded-2xl bg-v2-brand/[0.07] px-4 py-3 text-[calc(9px*var(--ts))] text-v2-ink">
        المجموع
        <span className="font-black tabular-nums">
          {total} <span className="text-[calc(8px*var(--ts))]">د</span>
        </span>
      </p>
      <p className="text-[calc(7.5px*var(--ts))] leading-relaxed text-v2-ink/55">
        بلا فوائد. التواريخ والمبالغ النهائية تتثبّت مع الأكاديمية وقت التفعيل.
      </p>
    </div>
  )
}

function Subscribe({ offer, onSend, onPlan }: { offer: Offer; onSend: () => void; onPlan: () => void }) {
  const now = offer.promoPrice ?? offer.price
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-2xl bg-v2-brand/[0.07] p-4">
        <OfferMark offer={offer} />
        <div className="min-w-0 flex-1">
          <p className="text-[calc(10px*var(--ts))] font-bold text-v2-ink">{offer.name}</p>
          <p className="text-[calc(8px*var(--ts))] text-v2-ink/60">{offer.audience}</p>
        </div>
        <p className="text-[calc(15px*var(--ts))] font-black tabular-nums text-v2-ink">
          {now} <span className="text-[calc(8px*var(--ts))]">د</span>
        </p>
      </div>
      <ol className="flex flex-col gap-2 text-[calc(8.5px*var(--ts))] text-v2-ink/80">
        {["تبعث الطلب من هوني", "الأكاديمية تتصل بيك وتتفاهمو على طريقة الخلاص", "العرض يتفعّل — والمحتوى يتحلّ في موادّك وحصصك"].map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span dir="ltr" className="grid size-7 shrink-0 place-items-center rounded-full bg-v2-brand/15 text-[calc(7.5px*var(--ts))] font-bold text-v2-ink">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <button type="button" data-uisfx="purchase" onClick={onSend} className={ctaClass}>
        <Send className="size-4 -scale-x-100" />
        ابعث طلب الاشتراك
      </button>
      {offer.installable && (
        <button type="button" data-uisfx="open" onClick={onPlan} className="min-h-11 rounded-full text-[calc(8.5px*var(--ts))] font-semibold text-v2-brand transition hover:bg-v2-brand/10">
          تفاصيل الدفع بالتقسيط
        </button>
      )}
    </div>
  )
}
