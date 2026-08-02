import type { Installment, Subscription, Transaction } from "@/data/types"

/** Format a dinar amount the Tunisian way: "360 DT", no cents unless needed. */
export function formatDT(n: number): string {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "")
  return `${s} DT`
}

/** "15 juin 2026" — dates on the payment screens. */
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" })
export const formatDay = (iso: string) => DAY.format(new Date(`${iso}T00:00:00`))

/** Today as "YYYY-MM-DD" (local). */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Total paid on a subscription — every transaction counts, linked or not. */
export function paidTotal(sub: Subscription, transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.subscriptionId === sub.id)
    .reduce((sum, t) => sum + t.amount, 0)
}

/** Amount paid AGAINST one planned installment (linked transactions only). */
export function paidForInstallment(inst: Installment, transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.installmentId === inst.id)
    .reduce((sum, t) => sum + t.amount, 0)
}

/** Whole days from today to `iso` — negative when the date is past. */
export function daysUntil(iso: string, today = todayISO()): number {
  const a = new Date(`${today}T00:00:00`)
  const b = new Date(`${iso}T00:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

/** "3 mois et 12 j" / "18 jours" — a day count in words (months of 30 days). */
function spanLabel(days: number): string {
  if (days < 30) return `${days} jour${days > 1 ? "s" : ""}`
  const months = Math.floor(days / 30)
  const rest = days % 30
  return rest > 0 ? `${months} mois et ${rest} j` : `${months} mois`
}

/** Countdown to a due date: "dans 18 jours", "aujourd'hui", "en retard de 1 mois et 7 j". */
export function dueInLabel(iso: string, today = todayISO()): string {
  const d = daysUntil(iso, today)
  if (d < 0) return `en retard de ${spanLabel(-d)}`
  if (d === 0) return "aujourd'hui"
  return `dans ${spanLabel(d)}`
}

export type InstallmentStatus = "paid" | "partial" | "overdue" | "upcoming"

/** Status of one planned line, from its linked payments and its due date. */
export function installmentStatus(
  inst: Installment,
  transactions: Transaction[],
  today = todayISO(),
): InstallmentStatus {
  const paid = paidForInstallment(inst, transactions)
  if (paid >= inst.amount) return "paid"
  if (inst.dueDate < today) return "overdue"
  return paid > 0 ? "partial" : "upcoming"
}

export type SubscriptionStatus = "actif" | "bloqué"

/**
 * Display status of a subscription — BINARY: actif or bloqué. Blocked when the
 * admin blocked it, OR automatically when a planned tranche is overdue and the
 * total isn't settled (an unpaid retard cuts the access). Derived, never stored.
 */
export function subscriptionStatus(
  sub: Subscription,
  transactions: Transaction[],
  today = todayISO(),
): SubscriptionStatus {
  if (sub.state === "blocked") return "bloqué"
  const settled = paidTotal(sub, transactions) >= sub.price
  if (
    !settled &&
    sub.installments.some((i) => installmentStatus(i, transactions, today) === "overdue")
  )
    return "bloqué"
  return "actif"
}
