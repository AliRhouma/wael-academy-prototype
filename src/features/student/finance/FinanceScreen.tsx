import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, Wallet } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import type { Installment, Subscription, Transaction } from "@/data/types"
import {
  formatDT,
  formatDay,
  paidTotal,
  todayISO,
} from "@/features/shared/payments/paymentLib"

/**
 * Côté élève une tranche n'a que trois états — payée, pas encore payée, ou pas
 * payée alors que la date est passée. Pas de "partielle" ici : une avance ne
 * solde pas la tranche, donc elle reste "مزال" tant qu'elle n'est pas couverte.
 */
type TrancheState = "paid" | "due" | "expired"

function trancheState(inst: Installment, transactions: Transaction[]): TrancheState {
  const covered = transactions
    .filter((t) => t.installmentId === inst.id)
    .reduce((s, t) => s + t.amount, 0)
  if (covered >= inst.amount) return "paid"
  return inst.dueDate < todayISO() ? "expired" : "due"
}

/** "2026-12-15" → "15/12/2026" — the offer's end date, en chiffres. */
function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

/** Access end date: the deadline set by l'admin, else the last planned tranche. */
function endDate(sub: Subscription): string | undefined {
  if (sub.deadline) return sub.deadline
  return sub.installments.length > 0
    ? sub.installments[sub.installments.length - 1].dueDate
    : undefined
}

/** One offer = one dropdown: name + price + end date, unfolding its échéancier. */
function OfferRow({
  sub,
  offerName,
  transactions,
  open,
  onToggle,
}: {
  sub: Subscription
  offerName: string
  transactions: Transaction[]
  open: boolean
  onToggle: () => void
}) {
  const end = endDate(sub)
  const panelId = `sub-${sub.id}`

  const paid = paidTotal(sub, transactions)
  const left = Math.max(0, sub.price - paid)
  /** A late tranche turns the "reste à payer" red — same signal as l'admin. */
  const late = sub.installments.some((i) => trancheState(i, transactions) === "expired")

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition hover:border-brand-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-surface-muted/60"
      >
        {/* Le prix appartient au titre, pas au bord de la carte : c'est ce que
            CETTE offre coûte, et rangé à l'autre bout de la ligne il se lisait
            comme une colonne — l'œil devait faire l'aller-retour pour appairer
            un montant à un nom. Collé au nom sur la même ligne de base, la
            paire se lit d'un coup. `flex-wrap` : sur un téléphone un nom long
            pousse le montant à la ligne au lieu de l'écraser. */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p
              dir="auto"
              className="font-display text-[calc(15px*var(--ts))] font-bold leading-snug text-ink"
            >
              {offerName}
            </p>
            <p className="font-display text-[calc(17px*var(--ts))] font-bold tabular-nums text-ink">
              {formatDT(sub.price)}
            </p>
          </div>
          {/* Deuxième ligne = les deux méta : jusqu'à quand, et ce qui reste. */}
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[calc(12px*var(--ts))] text-ink-muted">
            <span>
              تاريخ نهاية العرض :{" "}
              <span className="font-medium tabular-nums text-ink-subtle">
                {end ? shortDate(end) : "—"}
              </span>
            </span>
            <span
              className={
                "font-medium tabular-nums " +
                (left === 0 ? "text-success-700" : late ? "text-danger-600" : "text-ink-subtle")
              }
            >
              · {left === 0 ? "تخلّص الكل" : `مزال ${formatDT(left)}`}
            </span>
          </p>
        </div>

        <ChevronDown
          aria-hidden
          className={
            "size-5 shrink-0 text-ink-muted transition-transform duration-200 " +
            (open ? "rotate-180 text-brand-600" : "")
          }
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-border bg-surface-muted/40 px-4 py-3">
          {sub.installments.length === 0 ? (
            <p className="text-[calc(13px*var(--ts))] text-ink-muted">
              ما فماش أقساط مبرمجة — خلاص حرّ.
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {sub.installments.map((inst) => {
                const st = trancheState(inst, transactions)
                return (
                  <li
                    key={inst.id}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-2 text-[calc(13px*var(--ts))]"
                  >
                    <span
                      aria-hidden
                      className={
                        "size-1.5 shrink-0 self-center rounded-full " +
                        (st === "paid"
                          ? "bg-success-600"
                          : st === "expired"
                            ? "bg-danger-600"
                            : "bg-neutral-300")
                      }
                    />
                    <span
                      className={
                        "font-display text-[calc(15px*var(--ts))] font-bold tabular-nums " +
                        (st === "expired" ? "text-danger-600" : "text-ink")
                      }
                    >
                      {formatDT(inst.amount)}
                    </span>
                    <span
                      className={
                        "font-medium " +
                        (st === "paid"
                          ? "text-success-700"
                          : st === "expired"
                            ? "text-danger-600"
                            : "text-ink-subtle")
                      }
                    >
                      {st === "paid" ? "تخلّصت" : st === "expired" ? "موش خالص" : "مزال"}
                    </span>
                    {st === "expired" ? (
                      <span className="tabular-nums font-medium text-danger-600">
                        — تاريخ الخلاص فات ! (قبل {formatDay(inst.dueDate)})
                      </span>
                    ) : (
                      st === "due" && (
                        <span className="tabular-nums text-ink-muted">
                          — تاريخ الخلاص قبل {formatDay(inst.dueDate)}
                        </span>
                      )
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Élève — المحفظة : une liste dépliante, rien d'autre. Chaque ligne est une
 * offre achetée (titre + prix côte à côte, date de fin, reste à payer), dépliée
 * par défaut sur ses tranches payées / non payées avec leurs dates — même
 * lecture que /admin/payments. On replie ce qu'on ne veut plus voir.
 */
export default function StudentFinanceScreen() {
  const user = useAuth((s) => s.currentUser)
  const subscriptions = useData((s) => s.subscriptions)
  const transactions = useData((s) => s.transactions)
  const offers = useData((s) => s.offers)

  /**
   * L'échéancier est la raison d'être de la page, donc il est OUVERT à l'arrivée
   * — un élève qui vient ici veut voir ce qu'il doit et quand, pas cliquer pour
   * le demander. On mémorise donc ce qui est REPLIÉ, pas ce qui est ouvert :
   * l'ensemble vide = tout ouvert, et une offre ajoutée après coup arrive
   * ouverte elle aussi. Plusieurs peuvent l'être à la fois : replier l'une pour
   * en voir une autre serait un accordéon, et il n'y a que quelques lignes.
   */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

  const offerName = useMemo(() => new Map(offers.map((o) => [o.id, o.name])), [offers])

  const items = useMemo(
    () =>
      subscriptions
        .filter((sub) => sub.userId === user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [subscriptions, user],
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="المحفظة" subtitle="عروضك وأقساطك." />
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Wallet}
            title="ما فماش اشتراكات توّا"
            description="كي تشترك في عرض، تلقى هوني المبلغ متاعو وروزنامة أقساطك."
            action={
              <Link
                to="/student/offres"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
              >
                اكتشف العروض
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
        title="المحفظة"
        subtitle={`${items.length} عرض — أقساط كل عرض باينة، أُنقر على عرض باش تطويه.`}
      />

      <div className="flex flex-col gap-3">
        {items.map((sub) => (
          <OfferRow
            key={sub.id}
            sub={sub}
            offerName={offerName.get(sub.offerId) ?? "العرض تمسح"}
            transactions={transactions}
            open={!collapsed.has(sub.id)}
            onToggle={() =>
              setCollapsed((cur) => {
                const next = new Set(cur)
                if (!next.delete(sub.id)) next.add(sub.id)
                return next
              })
            }
          />
        ))}
      </div>
    </div>
  )
}
