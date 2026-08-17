import { useMemo } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, ChevronLeft, Coins, Hourglass, Layers, Ticket, Wallet } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { StatTile } from "@/features/shared/StatTile"
import { useMoney } from "@/features/shared/payments/paymentLib"
import { payPeriods, paySummary, teacherSessions, type PayPeriod } from "@/features/shared/teacherPay"
import { allRows, providerSummary, rowsForProvider } from "@/features/shared/promo/promoLib"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"

/**
 * Prof — « الفلوس ». What the academy owes them, source by source.
 *
 * The prof NEVER learns how their séance money is worked out. Whether the admin
 * types an amount every month or the system prices each séance, this page shows
 * the same three columns — period, séances, amount — because `payPeriods()`
 * hands both modes back in one shape. Nothing here branches on `payMode`, and
 * no per-séance price is ever printed: a per-séance figure would give the mode
 * away on its own.
 *
 * Three money sources are planned. Séances and promo codes are live; the third
 * keeps its place as a quiet dashed card rather than being hidden, so the page
 * reads as "three sources, two of them running" instead of looking half-built.
 * The promo card only totals — the breakdown lives on « كوداتي », one tap away,
 * and repeating it here would make this page a worse version of that one.
 *
 * Referenced for spacing & density: teacher/SessionsScreen (page header, filter
 * rhythm), student/finance/FinanceScreen (money cards), admin/payments (table).
 */
export default function TeacherMoneyScreen() {
  const user = useAuth((s) => s.currentUser)
  const teachers = useData((s) => s.teachers)
  const sessions = useData((s) => s.sessions)
  const rates = useData((s) => s.teacherRates)
  const payouts = useData((s) => s.teacherPayouts)
  const codes = useData((s) => s.promoCodes)
  const redemptions = useData((s) => s.promoRedemptions)
  const offers = useData((s) => s.offers)
  const users = useData((s) => s.users)

  const teacher = teachers.find((t) => t.id === user?.teacherId)

  const periods = useMemo(
    () => (teacher ? payPeriods(teacher, sessions, rates, payouts, "fr") : []),
    [teacher, sessions, rates, payouts],
  )
  const summary = useMemo(() => paySummary(periods), [periods])

  const mySessions = useMemo(
    () => (teacher ? teacherSessions(sessions, teacher.id) : []),
    [sessions, teacher],
  )

  /* Source 2 — what the prof's promo codes have earned. Keyed on the USER, not
     the teacher record: a code belongs to whoever shares it, in any role. */
  const promo = useMemo(() => {
    const rows = allRows(redemptions, codes, offers, users)
    return providerSummary(user ? rowsForProvider(rows, user.id) : [])
  }, [redemptions, codes, offers, users, user])

  const { dt, day } = useMoney()
  const firstName = user?.name.split(" ")[0] ?? ""

  const columns: Column<PayPeriod>[] = [
    {
      key: "label",
      header: "Période",
      render: (p) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{p.label}</p>
          {p.note && <p className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">{p.note}</p>}
        </div>
      ),
    },
    {
      key: "sessionCount",
      header: "Séances",
      render: (p) => (
        <span className="tabular-nums text-ink-subtle">
          <span className="num">{p.sessionCount}</span>
        </span>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      align: "right",
      render: (p) => (
        <span className="font-display font-bold tabular-nums text-ink">
          <span className="num">{dt(p.amount)}</span>
        </span>
      ),
    },
  ]

  /* The séances behind a period — dates and titles only. Putting a dinar figure
     next to a single séance would tell the prof their pay is computed per
     séance, which is exactly what the admin's mode is meant to hide. */
  const detail = (p: PayPeriod) => {
    const inside = mySessions.filter((s) => s.date >= p.from && s.date <= p.to)
    if (inside.length === 0)
      return (
        <p className="text-[calc(12px*var(--ts))] text-ink-muted">
          Aucune séance sur cette période.
        </p>
      )
    return (
      <ul className="flex flex-col gap-1.5">
        {inside.map((s) => (
          <li key={s.id} className="flex items-baseline justify-between gap-3">
            <span dir="auto" className="min-w-0 truncate text-[calc(13px*var(--ts))] text-ink">
              {s.title}
            </span>
            <span className="shrink-0 text-[calc(12px*var(--ts))] tabular-nums text-ink-muted">
              <span className="num">{day(s.date)}</span>
            </span>
          </li>
        ))}
      </ul>
    )
  }

  const hasMoney = periods.length > 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ma paie" subtitle={`Vos revenus, ${firstName} — source par source.`} />

      {/* The three sources. Only the first is live. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
              <CalendarDays className="size-4" />
            </span>
            <p className="font-medium text-ink">Séances</p>
          </div>
          <p className="mt-3 font-display text-[calc(26px*var(--ts))] font-bold leading-none text-ink">
            <span className="num">{dt(summary.total)}</span>
          </p>
          <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">
            {hasMoney ? (
              <span className="num">{summary.sessionCount} séances comptées</span>
            ) : (
              "Rien de calculé pour l'instant"
            )}
          </p>
        </div>

        {/* Second source — the prof's promo codes. Live, and it links to the
            page that breaks it down rather than repeating the detail here. */}
        <Link
          to="/teacher/codes"
          className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
              <Ticket className="size-4" />
            </span>
            <p className="font-medium text-ink">Codes promo</p>
            <ChevronLeft className="ms-auto size-4 text-ink-muted transition group-hover:text-brand-600 ltr:rotate-180" />
          </div>
          <p className="mt-3 font-display text-[calc(26px*var(--ts))] font-bold leading-none text-ink">
            <span className="num">{dt(promo.earned)}</span>
          </p>
          <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">
            {promo.uses > 0 ? (
              <span className="num">{promo.uses} utilisations · {promo.codes} code(s)</span>
            ) : (
              "Personne ne les a encore utilisés"
            )}
          </p>
        </Link>

        <div className="rounded-lg border border-dashed border-border bg-surface-muted/50 p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-neutral-100 text-ink-muted">
              <Layers className="size-4" />
            </span>
            <p className="font-medium text-ink-subtle">3ᵉ source</p>
            <span className="ms-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[calc(10.5px*var(--ts))] font-medium text-ink-muted">
              Bientôt
            </span>
          </div>
          <p className="mt-3 font-display text-[calc(26px*var(--ts))] font-bold leading-none text-ink-muted">
            —
          </p>
          <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">À définir prochainement.</p>
        </div>
      </div>

      {!hasMoney ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Wallet}
            title="Aucun montant pour l'instant"
            description="L'administration n'a encore enregistré aucun montant. Dès qu'elle le fait, vous le retrouvez ici, période par période."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={Wallet} label="Total" value={dt(summary.total)} />
            <StatTile
              icon={Coins}
              label={summary.currentLabel ? `Période ${summary.currentLabel}` : "Période en cours"}
              value={dt(summary.currentAmount)}
            />
            <StatTile icon={CalendarDays} label="Séances" value={summary.sessionCount} />
            <StatTile
              icon={Layers}
              label="Moyenne / séance"
              value={summary.perSession === null ? "—" : dt(Math.round(summary.perSession))}
            />
          </div>

          {/* Séances the academy hasn't valued yet. Worded as "not counted yet"
              on purpose — saying "unpriced" would reveal per-séance pricing. */}
          {summary.unpriced > 0 && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg border border-warning-500/30 bg-warning-50 p-3",
                "text-[calc(12.5px*var(--ts))] text-warning-700",
              )}
            >
              <Hourglass className="mt-0.5 size-4 shrink-0" />
              <p>
                <span className="num">{summary.unpriced}</span> séances ne sont pas encore comptées. L'administration s'en occupe —
                contactez-la si cela traîne.
              </p>
            </div>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
              Période par période
            </h2>
            <DataTable
              columns={columns}
              rows={periods}
              rowKey={(p) => p.id}
              renderDetail={detail}
              detailLabel="Séances"
            />
          </section>
        </>
      )}
    </div>
  )
}
