import { useMemo, useState } from "react"
import { Check, Copy, Gift, Ticket, TrendingUp, Users } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Avatar } from "@/components/kit/Avatar"
import { useToast } from "@/components/kit/Toast"
import { StatTile } from "@/features/shared/StatTile"
import { useMoney } from "@/features/shared/payments/paymentLib"
import { useT } from "@/i18n/strings"
import {
  allRows,
  codesOf,
  formatValue,
  providerSummary,
  rowsForBeneficiary,
  rowsForProvider,
  type RedemptionRow,
} from "@/features/shared/promo/promoLib"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"

/**
 * « كوداتي » — ONE screen for the élève, the prof and the parent.
 *
 * The three roles do exactly the same thing here: read the codes they own, see
 * who used them and what that earned, and read the codes they used themselves.
 * Nothing about the information architecture differs between them, so per the
 * roles rule this is one shared component behind three routes rather than three
 * near-identical files. Only the copy at the top adapts, via `audience`.
 *
 * The admin does NOT use this: they need every code and the power to edit them,
 * which is a different screen (admin/offers/PromoCodesScreen).
 *
 * Referenced for spacing & density: teacher/money/MoneyScreen (source cards +
 * stat row + period table), admin/payments (table).
 */
export function MyPromoScreen({ audience }: { audience: "student" | "teacher" | "parent" }) {
  const { show, toast } = useToast()
  const user = useAuth((s) => s.currentUser)
  const codes = useData((s) => s.promoCodes)
  const redemptions = useData((s) => s.promoRedemptions)
  const offers = useData((s) => s.offers)
  const users = useData((s) => s.users)

  const t = useT()
  const { dt, day } = useMoney()
  const [copied, setCopied] = useState<string | null>(null)

  const rows = useMemo(
    () => allRows(redemptions, codes, offers, users),
    [redemptions, codes, offers, users],
  )
  const mine = useMemo(() => (user ? codesOf(codes, user.id) : []), [codes, user])
  const earnedRows = useMemo(
    () => (user ? rowsForProvider(rows, user.id) : []),
    [rows, user],
  )
  const usedRows = useMemo(
    () => (user ? rowsForBeneficiary(rows, user.id) : []),
    [rows, user],
  )
  const summary = useMemo(() => providerSummary(earnedRows), [earnedRows])

  const firstName = user?.name.split(" ")[0] ?? ""
  const subtitle =
    audience === "teacher"
      ? t.myCodesSubtitleTeacher(firstName)
      : audience === "parent"
        ? t.myCodesSubtitleParent(firstName)
        : t.myCodesSubtitleStudent(firstName)

  function copy(code: string) {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    show(t.copied)
    window.setTimeout(() => setCopied((c) => (c === code ? null : c)), 1800)
  }

  /** Uses of MY codes — who, on what, and what I got. */
  const earnedColumns: Column<RedemptionRow>[] = [
    {
      key: "user",
      header: t.who,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={r.user?.name ?? "؟"} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.user?.name ?? t.removedUser}</p>
            <p className="truncate text-[calc(12px*var(--ts))] text-ink-muted">
              <span className="num">{day(r.redemption.date)}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "offer",
      header: t.offer,
      render: (r) => (
        <div className="min-w-0">
          <p dir="auto" className="truncate text-ink">
            {r.offer?.name ?? t.removedOffer}
          </p>
          {r.case && (
            <p className="truncate text-[calc(12px*var(--ts))] text-ink-muted">
              {r.case.label ?? t.arrangement}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "providerGets",
      header: t.yourCut,
      align: "right",
      render: (r) => (
        <span
          className={cn(
            "font-display font-bold tabular-nums",
            r.providerGets > 0 ? "text-success-700" : "text-ink-muted",
          )}
        >
          <span className="num">{r.providerGets > 0 ? `+${dt(r.providerGets)}` : "—"}</span>
        </span>
      ),
    },
  ]

  /** Codes I used myself — what I saved. */
  const usedColumns: Column<RedemptionRow>[] = [
    {
      key: "code",
      header: t.theCode,
      render: (r) => (
        <div className="min-w-0">
          <p className="font-display font-bold tracking-wide text-ink">{r.code.code}</p>
          <p className="truncate text-[calc(12px*var(--ts))] text-ink-muted">
            {users.find((u) => u.id === r.code.providerUserId)?.name ?? t.theAcademy}
          </p>
        </div>
      ),
    },
    {
      key: "offer",
      header: t.offer,
      render: (r) => (
        <span dir="auto" className="truncate text-ink">
          {r.offer?.name ?? t.removedOffer}
        </span>
      ),
    },
    {
      key: "saved",
      header: t.youSaved,
      align: "right",
      render: (r) => (
        <span className="font-display font-bold tabular-nums text-success-700">
          <span className="num">−{dt(r.saved)}</span>
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.myCodes} subtitle={subtitle} />

      {mine.length === 0 && usedRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Ticket}
            title={t.noCodesTitle}
            description={t.noCodesBody}
          />
        </div>
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile icon={TrendingUp} label={t.earned} value={dt(summary.earned)} />
                <StatTile icon={Users} label={t.usedBy} value={summary.uses} />
                <StatTile icon={Ticket} label={t.myCodesCount} value={mine.length} />
                <StatTile
                  icon={Gift}
                  label={t.savedForOthers}
                  value={dt(summary.savedForOthers)}
                />
              </div>

              {/* The codes themselves — the thing you came to copy and share. */}
              <section className="flex flex-col gap-3">
                <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                  {t.theCodes}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {mine.map((code) => {
                    const uses = earnedRows.filter((r) => r.code.id === code.id)
                    const earned = uses.reduce((sum, r) => sum + r.providerGets, 0)
                    const left = code.maxUses ? code.maxUses - code.usedByUserIds.length : null
                    return (
                      <div
                        key={code.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                            <Ticket className="size-5" />
                          </span>
                          <p className="min-w-0 flex-1 truncate font-display text-[calc(19px*var(--ts))] font-bold tracking-wider text-ink">
                            {code.code}
                          </p>
                          <button
                            type="button"
                            onClick={() => copy(code.code)}
                            aria-label={`${t.copy} ${code.code}`}
                            className="grid size-11 shrink-0 place-items-center rounded-md border border-border text-ink-muted transition hover:border-brand-200 hover:text-brand-600"
                          >
                            {copied === code.code ? (
                              <Check className="size-4 text-success-600" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[calc(12.5px*var(--ts))] text-ink-muted">
                          <span>
                            <span className="num">{uses.length}</span> {t.uses}
                          </span>
                          <span className="font-medium text-success-700">
                            <span className="num">+{dt(earned)}</span>
                          </span>
                          {left !== null && (
                            <span className={cn(left <= 1 && "font-medium text-warning-700")}>
                              {t.left} <span className="num">{Math.max(left, 0)}</span>
                            </span>
                          )}
                        </div>

                        {/* What the code does, per offer — the friend's price
                            first, since that's what gets shared in a message. */}
                        <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
                          {code.offers.flatMap((rule) => {
                            const offer = offers.find((o) => o.id === rule.offerId)
                            if (!offer) return []
                            return (rule.cases ?? []).map((c) => (
                              /* Two lines, not one: the offer name and the two
                                 figures each need the full width at ~390px, and
                                 side by side they truncated each other. */
                              <li key={c.id} className="text-[calc(12.5px*var(--ts))]">
                                <p dir="auto" className="truncate text-ink-subtle">
                                  {offer.name}
                                  {c.label ? ` · ${c.label}` : ""}
                                </p>
                                <p className="tabular-nums text-ink-muted">
                                  <span className="num">
                                    {t.friendPays}{" "}
                                    <span className="font-medium text-ink">
                                      {formatValue(c.beneficiaryPays)}
                                    </span>{" "}
                                    · {t.youTake}{" "}
                                    <span className="font-medium text-success-700">
                                      {formatValue(c.providerGets)}
                                    </span>
                                  </span>
                                </p>
                              </li>
                            ))
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                  {t.whoUsedThem}
                </h2>
                <DataTable
                  columns={earnedColumns}
                  rows={earnedRows}
                  rowKey={(r) => r.redemption.id}
                  empty={
                    <EmptyState
                      icon={Users}
                      title={t.noUsesTitle}
                      description={t.noUsesBody}
                    />
                  }
                />
              </section>
            </>
          )}

          {usedRows.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                {t.codesIUsed}
              </h2>
              <DataTable
                columns={usedColumns}
                rows={usedRows}
                rowKey={(r) => r.redemption.id}
              />
            </section>
          )}
        </>
      )}
      {toast}
    </div>
  )
}
