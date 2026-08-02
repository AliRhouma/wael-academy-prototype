import { useMemo } from "react"
import { Link } from "react-router-dom"
import { CalendarClock, ChevronRight, PartyPopper, Receipt, Wallet } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import {
  dueInLabel,
  formatDT,
  formatDay,
  installmentStatus,
} from "@/features/shared/payments/paymentLib"
import { SUB_STATUS, nextDue, subFinance, type SubFinance } from "./finance"
import { Echeancier, OfferLogo, ProgressBar, TransactionItem } from "./parts"

/** One purchased offer — what it cost, what's paid, what's next. */
function OfferCard({ fin }: { fin: SubFinance }) {
  const { sub, offer, paid, left, pct, status, nextInstallment } = fin
  return (
    <Link
      to={`/student/porte-monnaie/${sub.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <OfferLogo offer={offer} />
        <div className="min-w-0 flex-1">
          <p dir="auto" className="font-display text-[15px] font-bold leading-snug text-ink">
            {offer?.name ?? "Offre supprimée"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-muted">
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
                <span>jusqu’au {formatDay(sub.deadline)}</span>
              </>
            )}
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600 rtl:rotate-180" />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-[17px] font-bold tabular-nums text-ink">
            {formatDT(sub.price)}
          </p>
          <p className="text-[12px] tabular-nums text-ink-subtle">
            {formatDT(paid)} payés
            {left > 0 && <span className="text-ink-muted"> · reste {formatDT(left)}</span>}
          </p>
        </div>
        <ProgressBar pct={pct} className="mt-2" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone={SUB_STATUS[status].tone} dot>
          {SUB_STATUS[status].label}
        </Badge>
        {nextInstallment ? (
          <p className="text-[12px] tabular-nums text-ink-muted">
            Prochaine : {formatDT(nextInstallment.amount)} · {formatDay(nextInstallment.dueDate)}
          </p>
        ) : (
          <p className="text-[12px] text-ink-muted">Aucune tranche en attente</p>
        )}
      </div>
    </Link>
  )
}

/**
 * Élève — le porte-monnaie : ce qu'il a acheté, ce que ça coûte, quand tombent
 * les tranches et quels paiements sont validés. Read-only : l'académie encaisse,
 * l'élève suit.
 */
export default function StudentFinanceScreen() {
  const user = useAuth((s) => s.currentUser)
  const subscriptions = useData((s) => s.subscriptions)
  const transactions = useData((s) => s.transactions)
  const offers = useData((s) => s.offers)

  const items = useMemo(
    () =>
      subscriptions
        .filter((sub) => sub.userId === user?.id)
        .map((sub) => subFinance(sub, offers, transactions))
        .sort((a, b) => b.sub.createdAt.localeCompare(a.sub.createdAt)),
    [subscriptions, offers, transactions, user],
  )

  const engaged = items.reduce((s, f) => s + f.sub.price, 0)
  const paid = items.reduce((s, f) => s + f.paid, 0)
  const left = Math.max(0, engaged - paid)
  const pct = engaged > 0 ? Math.min(100, Math.round((paid / engaged) * 100)) : 0

  const hasInstallments = items.some((f) => f.sub.installments.length > 0)
  const validated = items.flatMap((f) => f.transactions).sort((a, b) => b.date.localeCompare(a.date))
  const recent = validated.slice(0, 4)
  const subOf = useMemo(() => new Map(items.map((f) => [f.sub.id, f])), [items])

  const next = nextDue(items)

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Porte-monnaie" subtitle="Vos offres, vos tranches et vos paiements." />
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Wallet}
            title="Aucun abonnement pour l’instant"
            description="Dès que vous souscrivez à une offre, vous retrouverez ici son montant, l’échéancier de vos tranches et tous vos paiements."
            action={
              <Link
                to="/student/offres"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
              >
                Découvrir les offres
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Porte-monnaie"
        subtitle={`${items.length} offre${items.length > 1 ? "s" : ""} — montants, échéancier des tranches et paiements validés.`}
      />

      {/* ---- Solde + prochaine échéance ---- */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-md md:flex md:items-stretch md:gap-8 md:p-6">
        <div className="min-w-0 md:flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
            Reste à payer
          </p>
          <p className="mt-1.5 font-display text-[34px] font-bold leading-none tabular-nums text-ink md:text-[40px]">
            {formatDT(left)}
          </p>
          <ProgressBar pct={pct} className="mt-4" />
          <p className="mt-2 text-[13px] tabular-nums text-ink-subtle">
            <span className="font-medium text-brand-600">{formatDT(paid)} payés</span> sur{" "}
            {formatDT(engaged)} engagés · {pct}%
          </p>
        </div>

        <div className="mt-5 border-t border-border pt-5 md:mt-0 md:w-[46%] md:shrink-0 md:border-s md:border-t-0 md:ps-8 md:pt-0">
          {next ? (
            <>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                <CalendarClock className="size-3.5" /> Prochaine échéance
              </p>
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[26px] font-bold leading-none tabular-nums text-ink">
                  {formatDT(next.inst.amount)}
                </span>
                <span
                  className={
                    "text-[13px] font-medium tabular-nums " +
                    (installmentStatus(next.inst, transactions) === "overdue"
                      ? "text-danger-600"
                      : "text-brand-600")
                  }
                >
                  {dueInLabel(next.inst.dueDate)}
                </span>
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                avant le {formatDay(next.inst.dueDate)}
              </p>
              <Link
                to={`/student/porte-monnaie/${next.fin.sub.id}`}
                dir="auto"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 transition hover:text-brand-700"
              >
                {next.fin.offer?.name ?? "Voir l’abonnement"}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Link>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <span className="grid size-10 place-items-center rounded-md bg-success-50 text-success-700">
                <PartyPopper className="size-5" />
              </span>
              <p className="mt-3 font-display text-[17px] font-bold text-ink">Tout est réglé</p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Aucune tranche en attente — profitez de vos cours.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---- Mes offres ---- */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          {items.length > 1 ? "Mes offres" : "Mon offre"}
        </h2>
        <div className={"grid gap-3 " + (items.length > 1 ? "md:grid-cols-2" : "")}>
          {items.map((fin) => (
            <OfferCard key={fin.sub.id} fin={fin} />
          ))}
        </div>
      </section>

      {/* ---- Échéancier global ---- */}
      {hasInstallments && (
        <section>
          <h2 className="mb-3 font-display text-base font-bold text-ink">Planning des tranches</h2>
          <div className="flex flex-col gap-4">
            {items
              .filter((f) => f.sub.installments.length > 0)
              .map((fin) => (
                <div key={fin.sub.id}>
                  {/* With a single offer the name is already right above — don't repeat it. */}
                  {items.length > 1 && (
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p
                        dir="auto"
                        className="min-w-0 truncate text-[13px] font-medium text-ink-subtle"
                      >
                        {fin.offer?.name ?? "Offre supprimée"}
                      </p>
                      <span className="shrink-0 text-[12px] tabular-nums text-ink-muted">
                        {fin.left > 0 ? `reste ${formatDT(fin.left)}` : "soldé"}
                      </span>
                    </div>
                  )}
                  <Echeancier sub={fin.sub} transactions={transactions} />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ---- Derniers paiements ---- */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-ink">Mes paiements</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {validated.length} validé{validated.length > 1 ? "s" : ""} · {formatDT(paid)}
          </span>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface">
            <EmptyState
              icon={Receipt}
              title="Aucun paiement enregistré"
              description="Vos reçus apparaîtront ici dès votre premier versement à l’académie."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {recent.map((tx) => {
                const fin = subOf.get(tx.subscriptionId)
                const idx = fin?.sub.installments.findIndex((i) => i.id === tx.installmentId) ?? -1
                return (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    trancheNo={idx >= 0 ? idx + 1 : undefined}
                    context={fin?.offer?.name}
                  />
                )
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
