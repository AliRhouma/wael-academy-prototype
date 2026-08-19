import { Check, Paperclip, Receipt, TriangleAlert } from "lucide-react"
import type { Offer, Subscription, Transaction } from "@/data/types"
import { OfferMark } from "@/features/shared/offers/OfferMark"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import {
  dueInLabel,
  formatDT,
  formatDay,
  installmentStatus,
  paidForInstallment,
  type InstallmentStatus,
} from "@/features/shared/payments/paymentLib"

const INST_STATUS: Record<InstallmentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "تخلّصت", tone: "success" },
  partial: { label: "جزئية", tone: "warning" },
  overdue: { label: "متأخّر", tone: "danger" },
  upcoming: { label: "الجايّة", tone: "neutral" },
}

/** The offer's mark — the same tile the catalogue wears (see `OfferMark`). */
export function OfferLogo({ offer, size = 10 }: { offer?: Offer; size?: 10 | 12 }) {
  return <OfferMark offer={offer} size={size === 12 ? "md" : "sm"} />
}

/** A thin token-driven progress bar — the gradient is the paid share. */
export function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 ${className}`}>
      <div
        className="h-full rounded-full bg-grad transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * The échéancier as a vertical timeline: one node per planned tranche, its
 * coverage, its due date and the countdown. The next tranche to pay is ringed
 * so the eye lands on it first; settled ones fade back to a check.
 */
export function Echeancier({
  sub,
  transactions,
}: {
  sub: Subscription
  transactions: Transaction[]
}) {
  const nextIdx = sub.installments.findIndex((i) => installmentStatus(i, transactions) !== "paid")

  return (
    <ol className="flex flex-col">
      {sub.installments.map((inst, i) => {
        const st = installmentStatus(inst, transactions)
        const covered = paidForInstallment(inst, transactions)
        const isNext = i === nextIdx
        const isLast = i === sub.installments.length - 1
        const node =
          st === "paid"
            ? "bg-success-50 text-success-700"
            : st === "overdue"
              ? "bg-danger-50 text-danger-600"
              : isNext
                ? "bg-grad text-ink-inverted shadow-brand"
                : "bg-neutral-100 text-ink-muted"

        return (
          <li key={inst.id} className={"relative flex gap-3 " + (isLast ? "" : "pb-3")}>
            {!isLast && (
              <span
                aria-hidden
                className="absolute start-4 top-9 bottom-0 w-px -translate-x-1/2 bg-border rtl:translate-x-1/2"
              />
            )}
            <span
              className={
                "z-[1] grid size-8 shrink-0 place-items-center rounded-full font-display text-[calc(13px*var(--ts))] font-bold " +
                node
              }
            >
              {st === "paid" ? (
                <Check className="size-4" />
              ) : st === "overdue" ? (
                <TriangleAlert className="size-4" />
              ) : (
                i + 1
              )}
            </span>

            <div
              className={
                "min-w-0 flex-1 rounded-lg border bg-surface p-3 shadow-sm transition " +
                (isNext && st !== "paid" ? "border-brand-200 ring-1 ring-brand-100" : "border-border")
              }
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-display text-[calc(16px*var(--ts))] font-bold tabular-nums text-ink">
                  {formatDT(inst.amount)}
                </p>
                <Badge tone={INST_STATUS[st].tone} dot>
                  {INST_STATUS[st].label}
                </Badge>
                {isNext && st !== "overdue" && (
                  <span className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.1em] text-accent2-600">
                    الجاي
                  </span>
                )}
              </div>

              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[calc(12px*var(--ts))] text-ink-muted">
                <span>القسط {i + 1} — قبل {formatDay(inst.dueDate)}</span>
                {st !== "paid" && (
                  <span
                    className={
                      "tabular-nums " +
                      (st === "overdue" ? "font-medium text-danger-600" : "text-ink-subtle")
                    }
                  >
                    · {dueInLabel(inst.dueDate)}
                  </span>
                )}
              </p>

              {covered > 0 && covered < inst.amount && (
                <div className="mt-2">
                  <ProgressBar pct={Math.round((covered / inst.amount) * 100)} />
                  <p className="mt-1 text-[calc(12px*var(--ts))] tabular-nums text-ink-subtle">
                    {formatDT(covered)} تخلّصو · الباقي {formatDT(inst.amount - covered)}
                  </p>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * One recorded payment. Every transaction in the store is money the academy
 * confirmed cashing in, so the élève sees it as validated — with its receipt.
 */
export function TransactionItem({
  tx,
  trancheNo,
  context,
}: {
  tx: Transaction
  /** 1-based tranche number this payment settles, when it's linked to one. */
  trancheNo?: number
  /** Extra line (the offer name) — used on the wallet's "derniers paiements". */
  context?: string
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-success-50 text-success-700">
        <Receipt className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-[calc(16px*var(--ts))] font-bold tabular-nums text-ink">
            {formatDT(tx.amount)}
          </span>
          <span className="text-[calc(13px*var(--ts))] text-ink-muted">{formatDay(tx.date)}</span>
          {trancheNo && <Badge tone="brand">القسط {trancheNo}</Badge>}
        </p>
        {context && (
          <p dir="auto" className="mt-0.5 truncate text-[calc(12px*var(--ts))] font-medium text-ink-subtle">
            {context}
          </p>
        )}
        {tx.remarks && (
          <p dir="auto" className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">
            {tx.remarks}
          </p>
        )}
        {tx.resources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tx.resources.map((r, j) =>
              r.url ? (
                <a
                  key={j}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  title={r.notes}
                  className="inline-flex min-h-[28px] items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-700"
                >
                  <Paperclip className="size-3" /> {r.name}
                </a>
              ) : (
                <span
                  key={j}
                  title={r.notes}
                  className="inline-flex min-h-[28px] items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-ink-subtle"
                >
                  <Paperclip className="size-3" /> {r.name}
                </span>
              ),
            )}
          </div>
        )}
      </div>
      {/* The count lives in the section header on phones — keep the row breathable. */}
      <Badge tone="success" className="mt-1 hidden shrink-0 sm:inline-flex">
        متحقّق
      </Badge>
    </li>
  )
}
