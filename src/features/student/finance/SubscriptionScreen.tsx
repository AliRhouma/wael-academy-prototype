import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  Info,
  Receipt,
  TriangleAlert,
  Wallet,
} from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { useData } from "@/stores/useData"
import {
  dueInLabel,
  formatDT,
  formatDay,
  installmentStatus,
} from "@/features/shared/payments/paymentLib"
import { SUB_STATUS, savings, subFinance } from "./finance"
import { Echeancier, OfferLogo, ProgressBar, TransactionItem } from "./parts"

/** One line of the price breakdown — label start, amount end. */
function MoneyRow({
  label,
  value,
  tone = "default",
  strong,
}: {
  label: string
  value: string
  tone?: "default" | "muted" | "positive"
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className={"text-[calc(13px*var(--ts))] " + (strong ? "font-medium text-ink" : "text-ink-muted")}>
        {label}
      </span>
      <span
        className={
          "tabular-nums " +
          (strong
            ? "font-display text-[calc(17px*var(--ts))] font-bold text-ink"
            : tone === "positive"
              ? "text-[calc(14px*var(--ts))] font-medium text-success-700"
              : tone === "muted"
                ? "text-[calc(14px*var(--ts))] text-ink-muted line-through"
                : "text-[calc(14px*var(--ts))] text-ink-subtle")
        }
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Élève — un abonnement en détail : l'offre achetée et son prix, l'échéancier
 * complet des tranches, et chaque paiement validé avec son reçu.
 */
export default function StudentSubscriptionScreen() {
  const { subscriptionId } = useParams()
  const subscriptions = useData((s) => s.subscriptions)
  const transactions = useData((s) => s.transactions)
  const offers = useData((s) => s.offers)

  const sub = subscriptions.find((s) => s.id === subscriptionId) ?? null
  const fin = useMemo(
    () => (sub ? subFinance(sub, offers, transactions) : null),
    [sub, offers, transactions],
  )

  if (!sub || !fin) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Wallet}
          title="الاشتراك ما تلقاش"
          description="الاشتراك هذا ما عادش متوفّر."
          action={
            <Link
              to="/student/porte-monnaie"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
            >
              <ArrowRight className="size-4" /> ارجع للمحفظة
            </Link>
          }
        />
      </div>
    )
  }

  const { offer, paid, left, pct, status, nextInstallment, transactions: txs } = fin
  const saved = savings(sub, offer)
  const instNumber = new Map(sub.installments.map((i, idx) => [i.id, idx + 1]))
  const paidCount = sub.installments.filter(
    (i) => installmentStatus(i, transactions) === "paid",
  ).length

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/student/porte-monnaie"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-subtle transition hover:text-brand-600"
      >
        <ArrowRight className="size-4" /> المحفظة
      </Link>

      {/* ---- L'offre achetée ---- */}
      <div className="flex items-start gap-3.5">
        <OfferLogo offer={offer} size={12} />
        <div className="min-w-0 flex-1">
          <h1 dir="auto" className="font-display text-[calc(22px*var(--ts))] font-bold leading-tight text-ink">
            {offer?.name ?? "العرض تمسح"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[calc(13px*var(--ts))] text-ink-muted">
            {offer?.period && <span>{offer.period}</span>}
            {sub.tag && (
              <>
                {offer?.period && <span aria-hidden>·</span>}
                <span>{sub.tag}</span>
              </>
            )}
            {sub.deadline && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3.5" /> الدخول لين {formatDay(sub.deadline)}
                </span>
              </>
            )}
          </p>
          <div className="mt-2">
            <Badge tone={SUB_STATUS[status].tone} dot>
              {SUB_STATUS[status].label}
            </Badge>
          </div>
        </div>
      </div>

      {offer?.description && (
        <p dir="auto" className="-mt-2 text-sm leading-relaxed text-ink-subtle">
          {offer.description}
        </p>
      )}

      {status === "suspendu" && (
        <div className="flex items-start gap-3 rounded-lg border border-danger-500/25 bg-danger-50 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <p className="text-[calc(13px*var(--ts))] text-ink-subtle">
            <span className="font-medium text-danger-700">الدخول موقّف.</span> فما قسط
            متأخّر — اتّصل بالإدارة عبر{" "}
            <Link to="/student/assistance" className="font-medium text-brand-600 hover:underline">
              المساعدة
            </Link>{" "}
            باش تسوّي وضعيتك.
          </p>
        </div>
      )}

      {/* ---- Le prix ---- */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-md">
        <h2 className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
          قدّاش تسوى العرض هذا
        </h2>

        <div className="mt-2 divide-y divide-border">
          {offer && saved > 0 && (
            <>
              <MoneyRow label="السومة المعروضة" value={formatDT(offer.price)} tone="muted" />
              <MoneyRow
                label={`تخفيض ممنوح${offer.discountPct ? ` (-${offer.discountPct}%)` : ""}`}
                value={`− ${formatDT(saved)}`}
                tone="positive"
              />
            </>
          )}
          <MoneyRow label="المبلغ المتّفق عليه" value={formatDT(sub.price)} strong />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <ProgressBar pct={pct} />
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[calc(13px*var(--ts))] tabular-nums text-ink-subtle">
              <span className="font-medium text-brand-600">{formatDT(paid)} تخلّصو</span> · {pct}%
            </p>
            <p className="text-[calc(13px*var(--ts))] tabular-nums text-ink-subtle">
              {left > 0 ? (
                <>
                  الباقي{" "}
                  <span className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                    {formatDT(left)}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-success-700">
                  <CircleCheck className="size-4" /> تخلّص بالكامل
                </span>
              )}
            </p>
          </div>
        </div>

        {nextInstallment && (
          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 rounded-md bg-brand-50 px-3.5 py-2.5 text-[calc(13px*var(--ts))] text-brand-700">
            <CalendarClock className="size-4 shrink-0" />
            <span className="font-medium tabular-nums">
              القسط الجاي: {formatDT(nextInstallment.amount)}
            </span>
            <span className="text-ink-subtle">
              قبل {formatDay(nextInstallment.dueDate)} — {dueInLabel(nextInstallment.dueDate)}
            </span>
          </p>
        )}
      </section>

      {sub.description && (
        <p
          dir="auto"
          className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-[calc(13px*var(--ts))] text-ink-subtle"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          {sub.description}
        </p>
      )}

      {/* ---- Échéancier ---- */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">روزنامة الأقساط</h2>
          {sub.installments.length > 0 && (
            <span className="text-[calc(12px*var(--ts))] tabular-nums text-ink-muted">
              <span className="num">{paidCount}/{sub.installments.length}</span> تخلّصو
            </span>
          )}
        </div>
        {sub.installments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-muted">
            ما فماش أقساط مبرمجة — خلاص حرّ عند الأكاديمية.
          </p>
        ) : (
          <Echeancier sub={sub} transactions={transactions} />
        )}
      </section>

      {/* ---- Transactions ---- */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">خلاصاتي</h2>
          <span className="text-[calc(12px*var(--ts))] tabular-nums text-ink-muted">
            {txs.length} متحقّق · {formatDT(paid)}
          </span>
        </div>
        {txs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface">
            <EmptyState
              icon={Receipt}
              title="ما فماش خلاص توّا"
              description="أوّل خلاص متاعك والوصل متاعو يظهرو هوني."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {txs.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  trancheNo={tx.installmentId ? instNumber.get(tx.installmentId) : undefined}
                />
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
