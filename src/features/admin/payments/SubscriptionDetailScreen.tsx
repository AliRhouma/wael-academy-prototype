import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Paperclip,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Transaction } from "@/data/types"
import { SubscriptionFormSheet } from "./SubscriptionFormSheet"
import { TransactionFormSheet } from "./TransactionFormSheet"
import {
  formatDT,
  formatDay,
  installmentStatus,
  paidForInstallment,
  paidTotal,
  subscriptionStatus,
  type InstallmentStatus,
  type SubscriptionStatus,
} from "./paymentLib"

const SUB_STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  actif: { label: "Actif", tone: "success" },
  bloqué: { label: "Bloqué", tone: "danger" },
}

const INST_STATUS: Record<InstallmentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Payée", tone: "success" },
  partial: { label: "Partielle", tone: "warning" },
  overdue: { label: "En retard", tone: "danger" },
  upcoming: { label: "À venir", tone: "neutral" },
}

/** A quiet stat tile — label above, big display number below. */
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p
        className={
          "mt-1 font-display text-[22px] font-bold tabular-nums " +
          (accent ? "text-brand-600" : "text-ink")
        }
      >
        {value}
      </p>
    </div>
  )
}

/**
 * Admin — ONE subscription in full: the contract (montant, mode, deadline),
 * the échéancier with each tranche's coverage, and the recorded transactions
 * with their proof documents. Payments are added from here or from the table.
 */
export default function AdminSubscriptionDetailScreen() {
  const { subscriptionId } = useParams()
  const subscriptions = useData((s) => s.subscriptions)
  const transactions = useData((s) => s.transactions)
  const users = useData((s) => s.users)
  const offers = useData((s) => s.offers)
  const removeTransaction = useData((s) => s.removeTransaction)
  const { show, toast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [txFormOpen, setTxFormOpen] = useState(false)
  const [txEditing, setTxEditing] = useState<Transaction | null>(null)
  const [txDelete, setTxDelete] = useState<Transaction | null>(null)

  const sub = subscriptions.find((s) => s.id === subscriptionId) ?? null
  const user = sub ? users.find((u) => u.id === sub.userId) : null
  const offer = sub ? offers.find((o) => o.id === sub.offerId) : null

  const subTxs = useMemo(
    () =>
      transactions
        .filter((t) => t.subscriptionId === sub?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, sub],
  )

  if (!sub) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={CreditCard}
          title="Abonnement introuvable"
          description="Cet abonnement n’existe plus."
          action={
            <Link
              to="/admin/payments"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" /> Retour aux paiements
            </Link>
          }
        />
      </div>
    )
  }

  const paid = paidTotal(sub, transactions)
  const left = Math.max(0, sub.price - paid)
  const status = subscriptionStatus(sub, transactions)
  const instNumber = new Map(sub.installments.map((i, idx) => [i.id, idx + 1]))

  function confirmTxDelete() {
    if (!txDelete) return
    removeTransaction(txDelete.id)
    show("Transaction supprimée")
    setTxDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/admin/payments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-subtle transition hover:text-brand-600"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> Paiements
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar name={user?.name ?? "?"} size="lg" />
          <div>
            <h1 dir="auto" className="font-display text-[22px] font-bold text-ink">
              {user?.name ?? "Élève supprimé"}
            </h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              {offer?.name ?? "Offre supprimée"}
              {sub.tag && <> · {sub.tag}</>}
              {sub.deadline && (
                <>
                  {" "}
                  · <CalendarClock className="inline size-3.5 -translate-y-px" /> jusqu’au{" "}
                  {formatDay(sub.deadline)}
                </>
              )}
            </p>
            <div className="mt-1.5">
              <Badge tone={SUB_STATUS[status].tone} dot>
                {SUB_STATUS[status].label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-10"
          >
            <Pencil className="size-4" /> Modifier
          </button>
          <button
            type="button"
            onClick={() => {
              setTxEditing(null)
              setTxFormOpen(true)
            }}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
          >
            <Plus className="size-4" /> Nouvelle transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="À payer" value={formatDT(sub.price)} />
        <Stat label="Payé" value={formatDT(paid)} accent />
        <Stat label="Reste" value={formatDT(left)} />
      </div>

      {sub.description && (
        <p
          dir="auto"
          className="rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-sm text-ink-subtle"
        >
          {sub.description}
        </p>
      )}

      {/* -------- Échéancier -------- */}
      <section>
        <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
          Échéancier
        </h2>
        {sub.installments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-4 text-sm text-ink-muted">
            Aucune tranche planifiée — paiement libre.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {sub.installments.map((inst, i) => {
                const st = installmentStatus(inst, transactions)
                const instPaid = paidForInstallment(inst, transactions)
                return (
                  <li key={inst.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-[14px] font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium tabular-nums text-ink">
                        {formatDT(inst.amount)}
                        {instPaid > 0 && instPaid < inst.amount && (
                          <span className="font-normal text-ink-muted">
                            {" "}
                            — payé {formatDT(instPaid)}
                          </span>
                        )}
                      </p>
                      <p className="text-[12px] text-ink-muted">
                        avant le {formatDay(inst.dueDate)}
                      </p>
                    </div>
                    <Badge tone={INST_STATUS[st].tone} dot>
                      {INST_STATUS[st].label}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* -------- Transactions -------- */}
      <section>
        <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
          Transactions
        </h2>
        {subTxs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface">
            <EmptyState
              icon={Receipt}
              title="Aucune transaction"
              description="Encaissez le premier paiement de cet abonnement."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setTxEditing(null)
                    setTxFormOpen(true)
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
                >
                  <Plus className="size-4" /> Nouvelle transaction
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {subTxs.map((t) => (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-success-50 text-success-700">
                    <Receipt className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 text-sm">
                      <span className="font-display text-[15px] font-bold tabular-nums text-ink">
                        {formatDT(t.amount)}
                      </span>
                      <span className="text-ink-muted">{formatDay(t.date)}</span>
                      {t.installmentId && instNumber.has(t.installmentId) && (
                        <Badge tone="brand">Tranche {instNumber.get(t.installmentId)}</Badge>
                      )}
                    </p>
                    {t.remarks && (
                      <p dir="auto" className="mt-0.5 text-[12px] text-ink-subtle">
                        {t.remarks}
                      </p>
                    )}
                    {t.resources.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.resources.map((r, j) =>
                          r.url ? (
                            <a
                              key={j}
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              title={r.notes}
                              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-700"
                            >
                              <Paperclip className="size-3" /> {r.name}
                            </a>
                          ) : (
                            <span
                              key={j}
                              title={r.notes}
                              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-ink-subtle"
                            >
                              <Paperclip className="size-3" /> {r.name}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <OverflowMenu
                    actions={[
                      {
                        label: "Modifier",
                        icon: Pencil,
                        onClick: () => {
                          setTxEditing(t)
                          setTxFormOpen(true)
                        },
                      },
                      {
                        label: "Supprimer",
                        icon: Trash2,
                        tone: "danger",
                        onClick: () => setTxDelete(t),
                      },
                    ]}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <SubscriptionFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={sub}
        onSaved={show}
      />

      <TransactionFormSheet
        open={txFormOpen}
        onOpenChange={setTxFormOpen}
        subscription={sub}
        editing={txEditing}
        onSaved={show}
      />

      <ConfirmDialog
        open={txDelete !== null}
        onOpenChange={(o) => !o && setTxDelete(null)}
        title="Supprimer cette transaction ?"
        description={
          txDelete ? `Le paiement de ${formatDT(txDelete.amount)} sera supprimé.` : undefined
        }
        onConfirm={confirmTxDelete}
      />

      {toast}
    </div>
  )
}
