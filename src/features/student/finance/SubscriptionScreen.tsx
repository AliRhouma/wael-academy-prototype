import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
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
      <span className={"text-[13px] " + (strong ? "font-medium text-ink" : "text-ink-muted")}>
        {label}
      </span>
      <span
        className={
          "tabular-nums " +
          (strong
            ? "font-display text-[17px] font-bold text-ink"
            : tone === "positive"
              ? "text-[14px] font-medium text-success-700"
              : tone === "muted"
                ? "text-[14px] text-ink-muted line-through"
                : "text-[14px] text-ink-subtle")
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
          title="Abonnement introuvable"
          description="Cet abonnement n’est plus disponible."
          action={
            <Link
              to="/student/porte-monnaie"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" /> Retour au porte-monnaie
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
        <ArrowLeft className="size-4 rtl:rotate-180" /> Porte-monnaie
      </Link>

      {/* ---- L'offre achetée ---- */}
      <div className="flex items-start gap-3.5">
        <OfferLogo offer={offer} size={12} />
        <div className="min-w-0 flex-1">
          <h1 dir="auto" className="font-display text-[22px] font-bold leading-tight text-ink">
            {offer?.name ?? "Offre supprimée"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
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
                  <CalendarClock className="size-3.5" /> accès jusqu’au {formatDay(sub.deadline)}
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
          <p className="text-[13px] text-ink-subtle">
            <span className="font-medium text-danger-700">Accès suspendu.</span> Une tranche est en
            retard — contactez l’administration via{" "}
            <Link to="/student/assistance" className="font-medium text-brand-600 hover:underline">
              l’assistance
            </Link>{" "}
            pour régulariser.
          </p>
        </div>
      )}

      {/* ---- Le prix ---- */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-md">
        <h2 className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
          Ce que coûte cette offre
        </h2>

        <div className="mt-2 divide-y divide-border">
          {offer && saved > 0 && (
            <>
              <MoneyRow label="Prix affiché" value={formatDT(offer.price)} tone="muted" />
              <MoneyRow
                label={`Remise accordée${offer.discountPct ? ` (-${offer.discountPct}%)` : ""}`}
                value={`− ${formatDT(saved)}`}
                tone="positive"
              />
            </>
          )}
          <MoneyRow label="Montant convenu" value={formatDT(sub.price)} strong />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <ProgressBar pct={pct} />
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[13px] tabular-nums text-ink-subtle">
              <span className="font-medium text-brand-600">{formatDT(paid)} payés</span> · {pct}%
            </p>
            <p className="text-[13px] tabular-nums text-ink-subtle">
              {left > 0 ? (
                <>
                  Reste{" "}
                  <span className="font-display text-[17px] font-bold text-ink">
                    {formatDT(left)}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-success-700">
                  <CircleCheck className="size-4" /> Intégralement réglé
                </span>
              )}
            </p>
          </div>
        </div>

        {nextInstallment && (
          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 rounded-md bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
            <CalendarClock className="size-4 shrink-0" />
            <span className="font-medium tabular-nums">
              Prochaine tranche : {formatDT(nextInstallment.amount)}
            </span>
            <span className="text-ink-subtle">
              avant le {formatDay(nextInstallment.dueDate)} — {dueInLabel(nextInstallment.dueDate)}
            </span>
          </p>
        )}
      </section>

      {sub.description && (
        <p
          dir="auto"
          className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-[13px] text-ink-subtle"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          {sub.description}
        </p>
      )}

      {/* ---- Échéancier ---- */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">Planning des tranches</h2>
          {sub.installments.length > 0 && (
            <span className="text-[12px] tabular-nums text-ink-muted">
              {paidCount}/{sub.installments.length} payée
              {sub.installments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {sub.installments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-muted">
            Aucune tranche planifiée — paiement libre auprès de l’académie.
          </p>
        ) : (
          <Echeancier sub={sub} transactions={transactions} />
        )}
      </section>

      {/* ---- Transactions ---- */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">Mes paiements</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {txs.length} validé{txs.length > 1 ? "s" : ""} · {formatDT(paid)}
          </span>
        </div>
        {txs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface">
            <EmptyState
              icon={Receipt}
              title="Aucun paiement pour l’instant"
              description="Votre premier versement et son reçu s’afficheront ici."
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
