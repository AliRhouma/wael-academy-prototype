import type { Installment, Subscription, Transaction } from "@/data/types"
import { tagOf, useLocale, type Locale } from "@/i18n/locale"

/**
 * Money and dates are written differently on each side of the app: the élève
 * reads "360 د.ت" in Arabic, the back-office reads "360 DT" in French. The
 * plain functions default to Arabic so the many existing élève call sites are
 * untouched; French screens and the shared ones use `useMoney()`, which binds
 * the formatters to whichever space is on screen.
 */

/** Format a dinar amount: "360 د.ت" in Arabic, "360 DT" in French. */
export function formatDT(n: number, locale: Locale = "ar"): string {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, "")
  return locale === "ar" ? `${s} د.ت` : `${s} DT`
}

const DAY_FMT: Record<Locale, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat(tagOf("ar"), { day: "numeric", month: "short", year: "numeric" }),
  fr: new Intl.DateTimeFormat(tagOf("fr"), { day: "numeric", month: "short", year: "numeric" }),
}

/** "15 juin 2026" / "15 جوان 2026" — dates on the payment screens. */
export const formatDay = (iso: string, locale: Locale = "ar") =>
  DAY_FMT[locale].format(new Date(`${iso}T00:00:00`))

/** Money + date formatters bound to the space currently on screen. */
export function useMoney() {
  const locale = useLocale()
  return {
    locale,
    dt: (n: number) => formatDT(n, locale),
    day: (iso: string) => formatDay(iso, locale),
  }
}

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

/** "3 شهر و12 يوم" / "18 يام" — a day count in words (months of 30 days).
 */
function spanLabel(days: number): string {
  if (days < 30) return `${days} يام`
  const months = Math.floor(days / 30)
  const rest = days % 30
  return rest > 0 ? `${months} شهر و${rest} يوم` : `${months} شهر`
}

/** Countdown to a due date: "بعد 18 يام", "اليوم", "متأخّر بـ شهر و7 يام". */
export function dueInLabel(iso: string, today = todayISO()): string {
  const d = daysUntil(iso, today)
  if (d < 0) return `متأخّر بـ ${spanLabel(-d)}`
  if (d === 0) return "اليوم"
  return `بعد ${spanLabel(d)}`
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

export type SubscriptionStatus = "actif" | "bloque"

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
  if (sub.state === "blocked") return "bloque"
  const settled = paidTotal(sub, transactions) >= sub.price
  if (
    !settled &&
    sub.installments.some((i) => installmentStatus(i, transactions, today) === "overdue")
  )
    return "bloque"
  return "actif"
}
