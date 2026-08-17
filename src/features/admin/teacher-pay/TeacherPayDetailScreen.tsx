import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  AlertTriangle,
  ChevronRight,
  Coins,
  Eye,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Wallet,
} from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { Avatar } from "@/components/kit/Avatar"
import { useToast } from "@/components/kit/Toast"
import { StatTile } from "@/features/shared/StatTile"
import { todayISO, useMoney } from "@/features/shared/payments/paymentLib"
import {
  payPeriods,
  paySummary,
  teacherPayoutsOf,
  teacherRatesOf,
  teacherSessions,
  type PayPeriod,
} from "@/features/shared/teacherPay"
import { PayoutFormSheet } from "@/features/admin/teacher-pay/PayoutFormSheet"
import { RateFormSheet } from "@/features/admin/teacher-pay/RateFormSheet"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import type { TeacherPayMode, TeacherPayout, TeacherRate } from "@/data/types"

const MODES: { key: TeacherPayMode; title: string; blurb: string }[] = [
  {
    key: "manual",
    title: "Manuel",
    blurb: "Vous saisissez le montant à chaque période. Les séances sont comptées seules.",
  },
  {
    key: "auto",
    title: "Automatique",
    blurb: "Vous fixez le tarif d'une séance, le système calcule le total.",
  },
]

/**
 * Admin — one prof's pay. THE screen where the mode is chosen, and the only
 * place either mode's history can be edited.
 *
 * The two modes are not two screens: the mode picker sits on top, and the panel
 * under it swaps between the payout list (manual) and the rate history (auto).
 * Both keep their rows when the mode flips, so switching back and forth costs
 * nothing — which is what makes the choice safe to change.
 *
 * The last section shows the prof's OWN view, unchanged, so the admin can see
 * exactly what the numbers look like from the other side before leaving.
 *
 * Referenced for spacing & density: admin/payments/SubscriptionDetailScreen
 * (back link + header + panels), admin/offers/AccessContentScreen (mode cards).
 */
export default function AdminTeacherPayDetailScreen() {
  const { teacherId = "" } = useParams()
  const { show, toast } = useToast()

  const teachers = useData((s) => s.teachers)
  const sessions = useData((s) => s.sessions)
  const rates = useData((s) => s.teacherRates)
  const payouts = useData((s) => s.teacherPayouts)
  const setTeacherPayMode = useData((s) => s.setTeacherPayMode)
  const removeTeacherRate = useData((s) => s.removeTeacherRate)
  const removeTeacherPayout = useData((s) => s.removeTeacherPayout)
  const { dt, day } = useMoney()

  const teacher = teachers.find((t) => t.id === teacherId)

  const [payoutOpen, setPayoutOpen] = useState(false)
  const [editingPayout, setEditingPayout] = useState<TeacherPayout | null>(null)
  const [rateOpen, setRateOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<TeacherRate | null>(null)
  const [deleting, setDeleting] = useState<{ kind: "rate" | "payout"; id: string } | null>(null)

  const myRates = useMemo(
    () => (teacher ? teacherRatesOf(rates, teacher.id) : []),
    [rates, teacher],
  )
  const myPayouts = useMemo(
    () => (teacher ? teacherPayoutsOf(payouts, teacher.id) : []),
    [payouts, teacher],
  )
  const periods = useMemo(
    () => (teacher ? payPeriods(teacher, sessions, rates, payouts, "fr") : []),
    [teacher, sessions, rates, payouts],
  )
  const summary = useMemo(() => paySummary(periods), [periods])
  const sessionCount = useMemo(
    () => (teacher ? teacherSessions(sessions, teacher.id).length : 0),
    [sessions, teacher],
  )

  if (!teacher) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={AlertTriangle}
          title="Enseignant introuvable"
          description="Il a peut-être été supprimé. Revenez à la liste."
        />
      </div>
    )
  }

  function confirmDelete() {
    if (!deleting) return
    if (deleting.kind === "rate") {
      removeTeacherRate(deleting.id)
      show("Tarif supprimé")
    } else {
      removeTeacherPayout(deleting.id)
      show("Montant supprimé")
    }
    setDeleting(null)
  }

  /* ---------------- manual: the payouts ---------------- */
  const payoutColumns: Column<TeacherPayout>[] = [
    {
      key: "period",
      header: "Période",
      render: (p) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">
            <span className="num">
              {day(p.periodStart)} → {day(p.periodEnd)}
            </span>
          </p>
          {p.note && <p className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">{p.note}</p>}
        </div>
      ),
    },
    {
      key: "sessions",
      header: "Séances",
      render: (p) => {
        const n = teacherSessions(sessions, teacher.id).filter(
          (s) => s.date >= p.periodStart && s.date <= p.periodEnd,
        ).length
        return (
          <span className="tabular-nums text-ink-subtle">
            <span className="num">{n}</span>
          </span>
        )
      },
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

  /* ---------------- auto: the rate history ---------------- */
  const rateColumns: Column<TeacherRate>[] = [
    {
      key: "amount",
      header: "Tarif / séance",
      render: (r) => (
        <span className="font-display font-bold tabular-nums text-ink">
          <span className="num">{dt(r.amount)}</span>
        </span>
      ),
    },
    {
      key: "from",
      header: "À partir du",
      render: (r) => (
        <span className="tabular-nums text-ink-subtle">
          <span className="num">{day(r.effectiveFrom)}</span>
          {r.effectiveFrom > todayISO() && (
            <span className="ms-1.5 rounded-full bg-accent2-50 px-2 py-0.5 text-[calc(10.5px*var(--ts))] font-medium text-accent2-700">
              À venir
            </span>
          )}
        </span>
      ),
    },
    {
      key: "sessions",
      header: "Séances concernées",
      align: "right",
      render: (r) => {
        // Séances this rate actually prices: from its start until the next one.
        const nextStart = myRates
          .filter((o) => o.effectiveFrom > r.effectiveFrom)
          .map((o) => o.effectiveFrom)
          .sort()[0]
        const n = teacherSessions(sessions, teacher.id).filter(
          (s) => s.date >= r.effectiveFrom && (!nextStart || s.date < nextStart),
        ).length
        return (
          <span className="tabular-nums text-ink-muted">
            <span className="num">{n}</span>
          </span>
        )
      },
    },
  ]

  /* ---------------- what the prof sees ---------------- */
  const previewColumns: Column<PayPeriod>[] = [
    { key: "label", header: "Période", render: (p) => <span className="text-ink">{p.label}</span> },
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

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/admin/teacher-pay"
        className="inline-flex items-center gap-1 self-start text-[calc(13px*var(--ts))] font-medium text-ink-muted transition hover:text-brand-600"
      >
        <ChevronRight className="size-4 ltr:rotate-180" />
        Paie des enseignants
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={teacher.name} size="lg" />
        <PageHeader
          title={teacher.name}
          subtitle={teacher.subject ? `${teacher.subject} · ${sessionCount} séances` : undefined}
          className="flex-1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile icon={Wallet} label="Total" value={dt(summary.total)} />
        <StatTile
          icon={Coins}
          label={summary.currentLabel ? `Période ${summary.currentLabel}` : "Période en cours"}
          value={dt(summary.currentAmount)}
        />
        <StatTile icon={SlidersHorizontal} label="Séances" value={sessionCount} />
      </div>

      {/* ---- the choice ---- */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
            Mode de calcul
          </h2>
          <p className="mt-0.5 text-[calc(12.5px*var(--ts))] text-ink-muted">
            L'enseignant ne voit pas ce réglage — seulement les montants.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => {
            const active = teacher.payMode === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setTeacherPayMode(teacher.id, m.key)
                  show(`Mode réglé sur ${m.title}`)
                }}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border p-4 text-start transition",
                  active
                    ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200"
                    : "border-border bg-surface hover:border-brand-200 hover:shadow-sm",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border-2",
                      active ? "border-brand-600" : "border-border-strong",
                    )}
                  >
                    {active && <span className="size-2 rounded-full bg-brand-600" />}
                  </span>
                  <p className="font-display font-bold text-ink">{m.title}</p>
                </div>
                <p className="mt-1.5 text-[calc(12.5px*var(--ts))] text-ink-muted">{m.blurb}</p>
              </button>
            )
          })}
        </div>

        {!teacher.payMode && (
          <div className="flex items-start gap-2.5 rounded-lg border border-warning-500/30 bg-warning-50 p-3 text-[calc(12.5px*var(--ts))] text-warning-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Aucun mode défini — la page de paie de l'enseignant reste vide tant que vous n'en choisissez pas un.
            </p>
          </div>
        )}
      </section>

      {/* ---- the panel that follows the choice ---- */}
      {teacher.payMode === "manual" && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                Montants enregistrés
              </h2>
              <p className="mt-0.5 text-[calc(12.5px*var(--ts))] text-ink-muted">
                Le nombre de séances de chaque période est compté depuis le calendrier.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingPayout(null)
                setPayoutOpen(true)
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-sm font-medium text-ink-inverted transition hover:bg-brand-700"
            >
              <Plus className="size-4" /> Ajouter un montant
            </button>
          </div>

          <DataTable
            columns={payoutColumns}
            rows={myPayouts}
            rowKey={(p) => p.id}
            empty={
              <EmptyState
                icon={Wallet}
                title="Aucun montant"
                description="Ajoutez un premier montant pour que l'enseignant voie sa paie."
              />
            }
            rowActions={(p) => [
              {
                label: "Modifier",
                icon: Pencil,
                onClick: () => {
                  setEditingPayout(p)
                  setPayoutOpen(true)
                },
              },
              {
                label: "Supprimer",
                icon: Trash2,
                tone: "danger",
                onClick: () => setDeleting({ kind: "payout", id: p.id }),
              },
            ]}
          />
        </section>
      )}

      {teacher.payMode === "auto" && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
                Tarif par séance
              </h2>
              <p className="mt-0.5 text-[calc(12.5px*var(--ts))] text-ink-muted">
                Chaque tarif s'applique à partir de sa date — même une date passée.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRate(null)
                setRateOpen(true)
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-sm font-medium text-ink-inverted transition hover:bg-brand-700"
            >
              <Plus className="size-4" /> Nouveau tarif
            </button>
          </div>

          <DataTable
            columns={rateColumns}
            rows={myRates}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                icon={Coins}
                title="Aucun tarif"
                description="Fixez le tarif d'une séance pour lancer le calcul."
              />
            }
            rowActions={(r) => [
              {
                label: "Modifier",
                icon: Pencil,
                onClick: () => {
                  setEditingRate(r)
                  setRateOpen(true)
                },
              },
              {
                label: "Supprimer",
                icon: Trash2,
                tone: "danger",
                onClick: () => setDeleting({ kind: "rate", id: r.id }),
              },
            ]}
          />

          {summary.unpriced > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-warning-500/30 bg-warning-50 p-3 text-[calc(12.5px*var(--ts))] text-warning-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                <span className="num">{summary.unpriced}</span> séance(s) antérieure(s) au premier tarif — non comptées. Ajoutez un tarif
                démarrant plus tôt si vous voulez les inclure.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ---- the other side ---- */}
      {teacher.payMode && periods.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-ink-muted" />
            <h2 className="font-display text-[calc(17px*var(--ts))] font-bold text-ink">
              Ce que voit l'enseignant
            </h2>
          </div>
          <DataTable columns={previewColumns} rows={periods} rowKey={(p) => p.id} />
        </section>
      )}

      <PayoutFormSheet
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        teacher={teacher}
        editing={editingPayout}
        onSaved={show}
      />
      <RateFormSheet
        open={rateOpen}
        onOpenChange={setRateOpen}
        teacher={teacher}
        editing={editingRate}
        onSaved={show}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={deleting?.kind === "rate" ? "Supprimer ce tarif ?" : "Supprimer ce montant ?"}
        description={
          deleting?.kind === "rate"
            ? "Les séances qu'il tarifait repasseront au tarif précédent."
            : "Ce montant sera retiré de la paie de l'enseignant."
        }
        confirmLabel="Supprimer"
        tone="danger"
        onConfirm={confirmDelete}
      />
      {toast}
    </div>
  )
}
