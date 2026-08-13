import type { Installment, Offer, Subscription, Transaction } from "@/data/types"
import type { BadgeTone } from "@/components/kit/Badge"
import {
  installmentStatus,
  paidTotal,
  subscriptionStatus,
} from "@/features/shared/payments/paymentLib"

/**
 * What the ÉLÈVE sees on an abonnement. The admin status is binary (actif /
 * bloqué); a student cares about one more thing — whether it's fully settled.
 * So: soldé > suspendu > en retard > en cours. Derived, never stored.
 */
export type StudentSubStatus = "solde" | "suspendu" | "retard" | "cours"

export const SUB_STATUS: Record<StudentSubStatus, { label: string; tone: BadgeTone }> = {
  solde: { label: "تسدّد", tone: "success" },
  suspendu: { label: "الدخول موقّف", tone: "danger" },
  retard: { label: "قسط متأخّر", tone: "danger" },
  cours: { label: "قاعدة", tone: "brand" },
}

export function studentSubStatus(sub: Subscription, transactions: Transaction[]): StudentSubStatus {
  if (paidTotal(sub, transactions) >= sub.price) return "solde"
  if (subscriptionStatus(sub, transactions) === "bloque") return "suspendu"
  if (sub.installments.some((i) => installmentStatus(i, transactions) === "overdue")) return "retard"
  return "cours"
}

/** Everything one subscription card / detail page needs, computed in one pass. */
export interface SubFinance {
  sub: Subscription
  offer: Offer | undefined
  paid: number
  left: number
  /** 0–100, capped — drives the progress bars. */
  pct: number
  status: StudentSubStatus
  /** The first tranche not fully covered — what the élève owes next. */
  nextInstallment: Installment | null
  /** Payments recorded against this subscription, newest first. */
  transactions: Transaction[]
}

export function subFinance(
  sub: Subscription,
  offers: Offer[],
  transactions: Transaction[],
): SubFinance {
  const paid = paidTotal(sub, transactions)
  return {
    sub,
    offer: offers.find((o) => o.id === sub.offerId),
    paid,
    left: Math.max(0, sub.price - paid),
    pct: sub.price > 0 ? Math.min(100, Math.round((paid / sub.price) * 100)) : 100,
    status: studentSubStatus(sub, transactions),
    nextInstallment:
      sub.installments.find((i) => installmentStatus(i, transactions) !== "paid") ?? null,
    transactions: transactions
      .filter((t) => t.subscriptionId === sub.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
  }
}

/** The soonest unpaid tranche across every subscription — the wallet's headline. */
export function nextDue(items: SubFinance[]): { fin: SubFinance; inst: Installment } | null {
  const candidates = items
    .filter((f) => f.nextInstallment)
    .map((f) => ({ fin: f, inst: f.nextInstallment! }))
    .sort((a, b) => a.inst.dueDate.localeCompare(b.inst.dueDate))
  return candidates[0] ?? null
}

/** The discount the élève actually got: offer list price vs. negotiated price. */
export function savings(sub: Subscription, offer: Offer | undefined): number {
  if (!offer || offer.price <= sub.price) return 0
  return offer.price - sub.price
}
