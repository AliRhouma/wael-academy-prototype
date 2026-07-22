import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Ban,
  ChevronDown,
  CircleCheck,
  CreditCard,
  FilterX,
  ListTree,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Subscription } from "@/data/types"
import { SubscriptionFormSheet } from "./SubscriptionFormSheet"
import { TransactionFormSheet } from "./TransactionFormSheet"
import {
  daysUntil,
  dueInLabel,
  formatDT,
  formatDay,
  installmentStatus,
  paidForInstallment,
  paidTotal,
  subscriptionStatus,
  type InstallmentStatus,
  type SubscriptionStatus,
} from "./paymentLib"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Compact select used in the facet filter row. */
const FILTER_SELECT =
  "h-10 w-full appearance-none rounded-md border border-input bg-input-bg px-3 pe-9 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** Derived status → badge tone + label — binary: actif ou bloqué. */
const STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  actif: { label: "Actif", tone: "success" },
  bloqué: { label: "Bloqué", tone: "danger" },
}

type StatusFilter = "all" | SubscriptionStatus

/** Tranche status → badge, matching the detail page. */
const INST_STATUS: Record<InstallmentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Payée", tone: "success" },
  partial: { label: "Partielle", tone: "warning" },
  overdue: { label: "En retard", tone: "danger" },
  upcoming: { label: "À venir", tone: "neutral" },
}

/**
 * Admin — payments follow-up: every student subscription with its negotiated
 * amount, what's been paid, the deadline and a derived status. Rows open the
 * subscription detail (échéancier + transactions).
 */
export default function AdminPaymentsScreen() {
  const subscriptions = useData((s) => s.subscriptions)
  const transactions = useData((s) => s.transactions)
  const users = useData((s) => s.users)
  const offers = useData((s) => s.offers)
  const updateSubscription = useData((s) => s.updateSubscription)
  const removeSubscription = useData((s) => s.removeSubscription)
  const { show, toast } = useToast()
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [offerFilter, setOfferFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "30" | "90">("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [txTarget, setTxTarget] = useState<Subscription | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)

  const userName = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  const offerName = useMemo(() => new Map(offers.map((o) => [o.id, o.name])), [offers])

  const statusOf = useMemo(() => {
    const m = new Map<string, SubscriptionStatus>()
    for (const sub of subscriptions) m.set(sub.id, subscriptionStatus(sub, transactions))
    return m
  }, [subscriptions, transactions])

  const countByStatus = useMemo(() => {
    const m = new Map<SubscriptionStatus, number>()
    for (const sub of subscriptions) {
      const st = statusOf.get(sub.id)!
      m.set(st, (m.get(st) ?? 0) + 1)
    }
    return m
  }, [subscriptions, statusOf])

  /** Offers actually subscribed to — the options of the Offre filter. */
  const offerOptions = useMemo(() => {
    const ids = [...new Set(subscriptions.map((sub) => sub.offerId))]
    return ids
      .map((id) => ({ id, name: offerName.get(id) ?? "Offre supprimée" }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  }, [subscriptions, offerName])

  /** Distinct payment-mode tags — the options of the Mode filter. */
  const tagOptions = useMemo(
    () =>
      [...new Set(subscriptions.map((sub) => sub.tag).filter((t): t is string => Boolean(t)))].sort(
        (a, b) => a.localeCompare(b, "fr"),
      ),
    [subscriptions],
  )

  /** The next unpaid tranche's due date — what the Échéance filter looks at. */
  function nextDueDate(sub: Subscription): string | null {
    const next = sub.installments.find((i) => installmentStatus(i, transactions) !== "paid")
    return next?.dueDate ?? null
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return subscriptions
      .filter((sub) => (statusFilter === "all" ? true : statusOf.get(sub.id) === statusFilter))
      .filter((sub) => (offerFilter === "all" ? true : sub.offerId === offerFilter))
      .filter((sub) => (tagFilter === "all" ? true : sub.tag === tagFilter))
      .filter((sub) => {
        if (dueFilter === "all") return true
        const due = nextDueDate(sub)
        if (!due) return false
        const d = daysUntil(due)
        if (dueFilter === "overdue") return d < 0
        return d >= 0 && d <= Number(dueFilter)
      })
      .filter((sub) =>
        q === ""
          ? true
          : (userName.get(sub.userId)?.toLowerCase().includes(q) ?? false) ||
            (offerName.get(sub.offerId)?.toLowerCase().includes(q) ?? false) ||
            (sub.tag?.toLowerCase().includes(q) ?? false),
      )
      .sort(
        (a, b) =>
          (userName.get(a.userId) ?? "").localeCompare(userName.get(b.userId) ?? "", "fr") ||
          (offerName.get(a.offerId) ?? "").localeCompare(offerName.get(b.offerId) ?? "", "fr"),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions, transactions, statusFilter, offerFilter, tagFilter, dueFilter, query, statusOf, userName, offerName])

  const filtersActive =
    statusFilter !== "all" ||
    offerFilter !== "all" ||
    tagFilter !== "all" ||
    dueFilter !== "all" ||
    query.trim() !== ""

  function resetFilters() {
    setStatusFilter("all")
    setOfferFilter("all")
    setTagFilter("all")
    setDueFilter("all")
    setQuery("")
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(sub: Subscription) {
    setEditing(sub)
    setFormOpen(true)
  }

  function toggleBlock(sub: Subscription) {
    const next = sub.state === "blocked" ? "active" : "blocked"
    updateSubscription(sub.id, { state: next })
    show(next === "blocked" ? "Abonnement bloqué — accès suspendu" : "Abonnement réactivé")
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeSubscription(deleteTarget.id)
    show("Abonnement supprimé")
    setDeleteTarget(null)
  }

  /** Expandable échéancier under a row — every tranche with its countdown. */
  function renderEcheancier(sub: Subscription) {
    if (sub.installments.length === 0) {
      return (
        <p className="px-4 py-3 text-[13px] text-ink-muted md:ps-14">
          Aucune tranche planifiée — paiement libre.
        </p>
      )
    }
    const nextIdx = sub.installments.findIndex(
      (i) => installmentStatus(i, transactions) !== "paid",
    )
    return (
      <ul className="divide-y divide-border/70 px-2 py-1 md:ps-12">
        {sub.installments.map((inst, i) => {
          const st = installmentStatus(inst, transactions)
          const instPaid = paidForInstallment(inst, transactions)
          const isNext = i === nextIdx
          return (
            <li
              key={inst.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2 text-[13px]"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-[12px] font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="font-medium tabular-nums text-ink">
                {formatDT(inst.amount)}
                {instPaid > 0 && instPaid < inst.amount && (
                  <span className="font-normal text-ink-muted"> — payé {formatDT(instPaid)}</span>
                )}
              </span>
              <span className="text-ink-muted">avant le {formatDay(inst.dueDate)}</span>
              <Badge tone={INST_STATUS[st].tone} dot>
                {INST_STATUS[st].label}
              </Badge>
              {st !== "paid" && (
                <span
                  className={
                    "tabular-nums " +
                    (st === "overdue"
                      ? "font-medium text-danger-600"
                      : isNext
                        ? "font-medium text-brand-600"
                        : "text-ink-muted")
                  }
                >
                  {dueInLabel(inst.dueDate)}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const columns: Column<Subscription>[] = [
    {
      key: "student",
      header: "Élève",
      render: (sub) => (
        <div className="flex items-center gap-3">
          <Avatar name={userName.get(sub.userId) ?? "?"} />
          <div className="min-w-0">
            <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
              {userName.get(sub.userId) ?? "Élève supprimé"}
            </p>
            <p dir="auto" className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">
              {offerName.get(sub.offerId) ?? "Offre supprimée"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "tag",
      header: "Mode",
      render: (sub) =>
        sub.tag ? <Badge tone="neutral">{sub.tag}</Badge> : <span className="text-ink-muted">—</span>,
    },
    {
      key: "price",
      header: "Montant",
      render: (sub) => (
        <span className="font-display text-[15px] font-bold text-ink tabular-nums">
          {formatDT(sub.price)}
        </span>
      ),
    },
    {
      key: "paid",
      header: "Payé",
      render: (sub) => {
        const paid = paidTotal(sub, transactions)
        const pct = sub.price > 0 ? Math.min(100, Math.round((paid / sub.price) * 100)) : 0
        const left = Math.max(0, sub.price - paid)
        return (
          <div className="min-w-[120px]">
            <p className="text-[13px] tabular-nums text-ink-subtle">
              <span className="font-medium text-ink">{formatDT(paid)}</span>
              {left > 0 && <span className="text-ink-muted"> · reste {formatDT(left)}</span>}
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-grad" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      },
    },
    {
      key: "deadline",
      header: "Échéance",
      render: (sub) => {
        const nextInst = sub.installments.find(
          (i) => installmentStatus(i, transactions) !== "paid",
        )
        return (
          <div className="text-[13px]">
            {sub.deadline ? (
              <p className="whitespace-nowrap text-ink-subtle">{formatDay(sub.deadline)}</p>
            ) : (
              <p className="text-ink-muted">—</p>
            )}
            {nextInst && (
              <p className="mt-0.5 whitespace-nowrap text-[12px] text-ink-muted">
                Proch. tranche : {formatDT(nextInst.amount)} · {formatDay(nextInst.dueDate)}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (sub) => {
        const st = statusOf.get(sub.id)!
        return (
          <Badge tone={STATUS[st].tone} dot>
            {STATUS[st].label}
          </Badge>
        )
      },
    },
  ]

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Nouvel abonnement
    </button>
  )

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: subscriptions.length },
    ...(Object.keys(STATUS) as SubscriptionStatus[]).map((st) => ({
      key: st as StatusFilter,
      label: STATUS[st].label + "s",
      count: countByStatus.get(st) ?? 0,
    })),
  ]

  const isEmpty = subscriptions.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paiements"
        subtitle={`${subscriptions.length} abonnement${subscriptions.length > 1 ? "s" : ""} — montants convenus, tranches et transactions encaissées.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={CreditCard}
            title="Aucun abonnement"
            description="Inscrivez un élève à une offre, fixez le montant et l’échéancier de paiement."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
              {filters.map((f) => {
                const active = statusFilter === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition " +
                      (active
                        ? "border-transparent bg-brand-600 text-ink-inverted"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    {f.label}
                    <span
                      className={
                        "rounded-full px-1.5 text-xs tabular-nums " +
                        (active ? "bg-white/20" : "bg-neutral-100 text-ink-muted")
                      }
                    >
                      {f.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="relative md:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un élève, une offre…"
                className={INPUT + " ps-9"}
              />
            </div>
          </div>

          {/* Facet filters — offer, payment mode, next due date. */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <select
                className={FILTER_SELECT}
                value={offerFilter}
                onChange={(e) => setOfferFilter(e.target.value)}
              >
                <option value="all">Toutes les offres</option>
                {offerOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            </div>

            <div className="relative w-full sm:w-44">
              <select
                className={FILTER_SELECT}
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all">Tous les modes</option>
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            </div>

            <div className="relative w-full sm:w-56">
              <select
                className={FILTER_SELECT}
                value={dueFilter}
                onChange={(e) => setDueFilter(e.target.value as typeof dueFilter)}
              >
                <option value="all">Toute échéance</option>
                <option value="overdue">Tranche en retard</option>
                <option value="30">Tranche dans les 30 jours</option>
                <option value="90">Tranche dans les 90 jours</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-danger-600"
              >
                <FilterX className="size-4" /> Réinitialiser
              </button>
            )}

            <span className="ms-auto text-[12px] tabular-nums text-ink-muted">
              {rows.length} résultat{rows.length > 1 ? "s" : ""}
            </span>
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(sub) => sub.id}
            renderDetail={renderEcheancier}
            detailLabel="Échéancier"
            onRowClick={(sub) => navigate(`/admin/payments/${sub.id}`)}
            rowActions={(sub) => [
              {
                label: "Détail & transactions",
                icon: ListTree,
                onClick: () => navigate(`/admin/payments/${sub.id}`),
              },
              {
                label: "Ajouter une transaction",
                icon: Plus,
                onClick: () => setTxTarget(sub),
              },
              { label: "Modifier", icon: Pencil, onClick: () => openEdit(sub) },
              sub.state === "blocked"
                ? { label: "Réactiver", icon: CircleCheck, onClick: () => toggleBlock(sub) }
                : { label: "Bloquer l’accès", icon: Ban, onClick: () => toggleBlock(sub) },
              {
                label: "Supprimer",
                icon: Trash2,
                tone: "danger",
                onClick: () => setDeleteTarget(sub),
              },
            ]}
            empty={
              <div className="rounded-lg border border-dashed border-border bg-surface">
                <EmptyState
                  icon={Search}
                  title="Aucun résultat"
                  description="Aucun abonnement ne correspond à ce filtre ou à cette recherche."
                />
              </div>
            }
          />
        </>
      )}

      <SubscriptionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={show}
      />

      <TransactionFormSheet
        open={txTarget !== null}
        onOpenChange={(o) => !o && setTxTarget(null)}
        subscription={txTarget}
        editing={null}
        onSaved={show}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cet abonnement ?"
        description={
          deleteTarget
            ? `L’abonnement de « ${userName.get(deleteTarget.userId) ?? "?"} » et ses transactions seront supprimés.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
