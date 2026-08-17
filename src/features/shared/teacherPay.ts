import type { Session, Teacher, TeacherPayout, TeacherRate } from "@/data/types"
import { todayISO } from "@/features/shared/payments/paymentLib"
import { tagOf, type Locale } from "@/i18n/locale"

/**
 * Teacher pay — the ONE place the money is worked out, read by both sides.
 *
 * The admin picks how a prof is paid (`manual` / `auto`); the prof only ever
 * sees the RESULT. That is why everything here funnels into the same
 * `PayPeriod` shape: a period, how many séances it covers and what it is worth.
 * The prof's screen renders that list without knowing which branch produced it,
 * so the mode cannot leak through a different-looking table.
 *
 * Nothing here is stored. Séance counts and totals are counted from the séances
 * in the store every render, which is what makes a backdated rate change ripple
 * through periods already displayed.
 */

const MONTH: Record<Locale, Intl.DateTimeFormat> = {
  ar: new Intl.DateTimeFormat(tagOf("ar"), { month: "long", year: "numeric" }),
  fr: new Intl.DateTimeFormat(tagOf("fr"), { month: "long", year: "numeric" }),
}

/** "2026-08" → "أوت 2026" / "août 2026". */
export function formatMonth(ym: string, locale: Locale = "ar"): string {
  return MONTH[locale].format(new Date(`${ym}-01T00:00:00`))
}

/** Last day of the month a "YYYY-MM" names — "2026-08" → "2026-08-31". */
function endOfMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number)
  return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`
}

/** A prof's séances, oldest first. */
export function teacherSessions(sessions: Session[], teacherId: string): Session[] {
  return sessions
    .filter((s) => s.teacherId === teacherId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** A prof's rates, most recently effective FIRST. */
export function teacherRatesOf(rates: TeacherRate[], teacherId: string): TeacherRate[] {
  return rates
    .filter((r) => r.teacherId === teacherId)
    .sort(
      (a, b) =>
        b.effectiveFrom.localeCompare(a.effectiveFrom) || b.createdAt.localeCompare(a.createdAt),
    )
}

/** A prof's manual payouts, most recent period FIRST. */
export function teacherPayoutsOf(payouts: TeacherPayout[], teacherId: string): TeacherPayout[] {
  return payouts
    .filter((p) => p.teacherId === teacherId)
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
}

/**
 * What one séance on `date` is worth: the rate with the latest `effectiveFrom`
 * on or before that day. `null` means no rate reaches back that far — the séance
 * has no price rather than a price of zero, and the screens say so.
 */
export function rateOn(rates: TeacherRate[], date: string): TeacherRate | null {
  // Newest-effective first, so the first rate starting on or before the séance
  // is the one that applies. `rates` must already be one prof's.
  return (
    [...rates]
      .sort(
        (a, b) =>
          b.effectiveFrom.localeCompare(a.effectiveFrom) || b.createdAt.localeCompare(a.createdAt),
      )
      .find((r) => r.effectiveFrom <= date) ?? null
  )
}

/** Same, from a list that may hold several profs' rates. */
function rateFor(rates: TeacherRate[], teacherId: string, date: string): TeacherRate | null {
  return rateOn(teacherRatesOf(rates, teacherId), date)
}

export interface PricedSession {
  session: Session
  /** Dinars this séance earned — `null` when no rate covers its date. */
  amount: number | null
}

/** Every séance of a prof with the price that applied ON ITS OWN DATE. */
export function pricedSessions(
  sessions: Session[],
  rates: TeacherRate[],
  teacherId: string,
): PricedSession[] {
  return teacherSessions(sessions, teacherId).map((session) => ({
    session,
    amount: rateFor(rates, teacherId, session.date)?.amount ?? null,
  }))
}

/**
 * One line of the prof's money table. Identical shape in both modes — that is
 * the whole point.
 */
export interface PayPeriod {
  /** "2026-08" in auto mode, the payout id in manual mode. */
  id: string
  label: string
  /** Inclusive bounds — "YYYY-MM-DD". */
  from: string
  to: string
  /** Séances the prof gave inside those bounds. */
  sessionCount: number
  /** Their ids — so overlapping periods can be de-duplicated in the totals. */
  sessionIds: string[]
  amount: number
  /** AUTO only — séances in the period that no rate covers. */
  unpriced: number
  /** MANUAL only — the admin's note, shown to the prof as written. */
  note?: string
}

/**
 * The prof's money, period by period, newest first.
 *
 * - `auto`   — one period per month that HAS séances; amount = the séances
 *              priced at whatever rate applied on each one's date.
 * - `manual` — one period per amount the admin recorded; the séance count is
 *              counted from the séances falling inside the period, so a prime
 *              covering no séance honestly reads « 0 حصص ».
 *
 * An unconfigured prof gets an empty list, not a zero.
 */
export function payPeriods(
  teacher: Teacher,
  sessions: Session[],
  rates: TeacherRate[],
  payouts: TeacherPayout[],
  locale: Locale = "ar",
): PayPeriod[] {
  if (teacher.payMode === "manual") {
    const mine = teacherSessions(sessions, teacher.id)
    return teacherPayoutsOf(payouts, teacher.id).map((p) => {
      const inside = mine.filter((s) => s.date >= p.periodStart && s.date <= p.periodEnd)
      return {
        id: p.id,
        label: labelForRange(p.periodStart, p.periodEnd, locale),
        from: p.periodStart,
        to: p.periodEnd,
        sessionCount: inside.length,
        sessionIds: inside.map((s) => s.id),
        amount: p.amount,
        unpriced: 0,
        note: p.note,
      }
    })
  }

  if (teacher.payMode === "auto") {
    const byMonth = new Map<string, PricedSession[]>()
    for (const ps of pricedSessions(sessions, rates, teacher.id)) {
      const ym = ps.session.date.slice(0, 7)
      const list = byMonth.get(ym)
      if (list) list.push(ps)
      else byMonth.set(ym, [ps])
    }
    return [...byMonth.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([ym, list]) => ({
        id: ym,
        label: formatMonth(ym, locale),
        from: `${ym}-01`,
        to: endOfMonth(ym),
        sessionCount: list.length,
        sessionIds: list.map((p) => p.session.id),
        amount: list.reduce((sum, p) => sum + (p.amount ?? 0), 0),
        unpriced: list.filter((p) => p.amount === null).length,
      }))
  }

  return []
}

/** "أوت 2026" when the range is exactly one month, else "1 أوت → 15 سبتمبر". */
function labelForRange(from: string, to: string, locale: Locale = "ar"): string {
  const ym = from.slice(0, 7)
  if (from === `${ym}-01` && to === endOfMonth(ym)) return formatMonth(ym, locale)
  const DAY = new Intl.DateTimeFormat(tagOf(locale), { day: "numeric", month: "long" })
  return `${DAY.format(new Date(`${from}T00:00:00`))} → ${DAY.format(new Date(`${to}T00:00:00`))}`
}

export interface PaySummary {
  /** Everything the prof has earned across every period. */
  total: number
  /** The period covering today, if there is one. */
  currentAmount: number
  currentLabel: string | null
  /** Séances counted across all periods. */
  sessionCount: number
  /** Dinars per séance on average — `null` when no séance carries a price. */
  perSession: number | null
  /** AUTO only — séances no rate covers, summed over the periods. */
  unpriced: number
}

/** The four numbers at the top of the prof's page, derived from the periods. */
export function paySummary(periods: PayPeriod[], today = todayISO()): PaySummary {
  const total = periods.reduce((sum, p) => sum + p.amount, 0)
  // DISTINCT: two manual periods over the same dates cover the same séances,
  // and one séance given once must not be counted twice.
  const sessionCount = new Set(periods.flatMap((p) => p.sessionIds)).size
  const priced = sessionCount - periods.reduce((sum, p) => sum + p.unpriced, 0)

  // In manual mode nothing stops the admin recording two amounts over the same
  // dates (a salary and a prime, say), so "the current period" can be several
  // rows — SUM them. Taking only the first would quietly under-report the pay.
  // Auto mode has one period per month, so this is a no-op there.
  const current = periods.filter((p) => p.from <= today && today <= p.to)

  return {
    total,
    currentAmount: current.reduce((sum, p) => sum + p.amount, 0),
    currentLabel: current.length === 1 ? current[0].label : null,
    sessionCount,
    perSession: priced > 0 ? total / priced : null,
    unpriced: periods.reduce((sum, p) => sum + p.unpriced, 0),
  }
}
