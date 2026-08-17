import type {
  Offer,
  PromoCase,
  PromoCode,
  PromoRedemption,
  PromoValue,
  User,
} from "@/data/types"

/**
 * Promo codes — the money side, worked out in one place.
 *
 * A code belongs to a PROVIDER (any role) and carries, per offer, a set of
 * CASES. A case is a pair: what the bénéficiaire pays and what the provider
 * earns. `beneficiaryPays` is the share STILL DUE — "20%" means they pay a
 * fifth of the price. The two sides are independent and each may be written in
 * percent or in dinars, so "pays 20%, provider takes 5 د.ت" is legal.
 *
 * No dinar figure is stored on a redemption. Everything below recomputes from
 * the offer's current price, which means correcting a case fixes the history
 * rather than leaving old rows lying about a number nobody can reproduce.
 */

/** Resolve "20%" / "5 د.ت" against a price. */
export function resolveValue(v: PromoValue, price: number): number {
  return v.kind === "pct" ? (price * v.value) / 100 : v.value
}

/** "20%" or "5 د.ت" — how a case's side reads in the UI. */
export function formatValue(v: PromoValue): string {
  return v.kind === "pct" ? `${v.value}%` : `${v.value} د.ت`
}

export interface CaseBreakdown {
  price: number
  /** What the bénéficiaire hands over. */
  paid: number
  /** What they saved against the list price. */
  saved: number
  /** What the provider earns. */
  providerGets: number
  /**
   * What the academy is left with — `paid − providerGets`. Can go NEGATIVE
   * when a case gives away more than it takes in; the admin form flags it
   * rather than silently clamping, because that is a real configuration
   * mistake and not something to hide.
   */
  academyKeeps: number
}

/** The full arithmetic of one case against one price. */
export function breakdown(c: PromoCase, price: number): CaseBreakdown {
  const paid = Math.min(resolveValue(c.beneficiaryPays, price), price)
  const providerGets = resolveValue(c.providerGets, price)
  return {
    price,
    paid,
    saved: price - paid,
    providerGets,
    academyKeeps: paid - providerGets,
  }
}

/** The rule a code holds for one offer, if any. */
export function ruleFor(code: PromoCode, offerId: string) {
  return code.offers.find((o) => o.offerId === offerId)
}

/** The case a redemption used, if it names one. */
export function caseOf(code: PromoCode, r: PromoRedemption): PromoCase | null {
  if (!r.caseId) return null
  return ruleFor(code, r.offerId)?.cases?.find((c) => c.id === r.caseId) ?? null
}

export interface RedemptionRow {
  redemption: PromoRedemption
  code: PromoCode
  offer: Offer | null
  /** The user who redeemed — null if they've since been removed. */
  user: User | null
  case: PromoCase | null
  /** Dinars the bénéficiaire paid. */
  paid: number
  /** Dinars the provider earned — 0 when the redemption used no case. */
  providerGets: number
  saved: number
}

/** Join a redemption to everything needed to display it, and price it. */
export function toRow(
  r: PromoRedemption,
  codes: PromoCode[],
  offers: Offer[],
  users: User[],
): RedemptionRow | null {
  const code = codes.find((c) => c.id === r.promoCodeId)
  if (!code) return null
  const offer = offers.find((o) => o.id === r.offerId) ?? null
  const kase = caseOf(code, r)
  const price = offer?.price ?? 0

  // No case on the redemption → the code's plain per-offer discount applied and
  // the provider earns nothing from it.
  const rule = ruleFor(code, r.offerId)
  const plainPaid = rule?.discountPct
    ? price * (1 - rule.discountPct / 100)
    : rule?.discountAmount
      ? Math.max(price - rule.discountAmount, 0)
      : price

  const b = kase ? breakdown(kase, price) : null
  return {
    redemption: r,
    code,
    offer,
    user: users.find((u) => u.id === r.userId) ?? null,
    case: kase,
    paid: b ? b.paid : plainPaid,
    providerGets: b ? b.providerGets : 0,
    saved: b ? b.saved : price - plainPaid,
  }
}

/** Every redemption, newest first, priced and joined. */
export function allRows(
  redemptions: PromoRedemption[],
  codes: PromoCode[],
  offers: Offer[],
  users: User[],
): RedemptionRow[] {
  return redemptions
    .map((r) => toRow(r, codes, offers, users))
    .filter((r): r is RedemptionRow => r !== null)
    .sort((a, b) => b.redemption.date.localeCompare(a.redemption.date))
}

/** The codes a given user owns. */
export function codesOf(codes: PromoCode[], userId: string): PromoCode[] {
  return codes.filter((c) => c.providerUserId === userId)
}

export interface ProviderSummary {
  /** Dinars earned across every redemption of every code they own. */
  earned: number
  /** How many times their codes were used. */
  uses: number
  /** How many codes they own. */
  codes: number
  /** Dinars their codes saved the people who used them. */
  savedForOthers: number
}

/** What one provider has earned — the numbers on their tracking page. */
export function providerSummary(rows: RedemptionRow[]): ProviderSummary {
  return {
    earned: rows.reduce((sum, r) => sum + r.providerGets, 0),
    uses: rows.length,
    codes: new Set(rows.map((r) => r.code.id)).size,
    savedForOthers: rows.reduce((sum, r) => sum + r.saved, 0),
  }
}

/** The redemptions that earned money FOR `userId` (they own the code used). */
export function rowsForProvider(rows: RedemptionRow[], userId: string): RedemptionRow[] {
  return rows.filter((r) => r.code.providerUserId === userId)
}

/** The redemptions `userId` made themselves — codes they BENEFITED from. */
export function rowsForBeneficiary(rows: RedemptionRow[], userId: string): RedemptionRow[] {
  return rows.filter((r) => r.redemption.userId === userId)
}
