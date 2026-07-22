import { useEffect, useState } from "react"
import { ChevronDown, Paperclip, Plus, Trash2 } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import type { Subscription, Transaction } from "@/data/types"
import { formatDT, formatDay, installmentStatus, todayISO } from "./paymentLib"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** One editable attached document while the form is open. */
interface ResourceDraft {
  key: string
  name: string
  url: string
  notes: string
}

export interface TransactionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The subscription this payment belongs to — null keeps the sheet closed. */
  subscription: Subscription | null
  /** The transaction being edited, or null to record a new one. */
  editing: Transaction | null
  onSaved: (message: string) => void
}

/**
 * Record/edit one payment against a subscription: amount, date (defaults to
 * today), the planned tranche it settles, free remarks and attached proof
 * documents (reçu, virement…).
 */
export function TransactionFormSheet({
  open,
  onOpenChange,
  subscription,
  editing,
  onSaved,
}: TransactionFormSheetProps) {
  const transactions = useData((s) => s.transactions)
  const addTransaction = useData((s) => s.addTransaction)
  const updateTransaction = useData((s) => s.updateTransaction)

  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [installmentId, setInstallmentId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [resources, setResources] = useState<ResourceDraft[]>([])

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setAmount(editing.amount.toString())
      setDate(editing.date)
      setInstallmentId(editing.installmentId ?? "")
      setRemarks(editing.remarks ?? "")
      setResources(
        editing.resources.map((r) => ({
          key: crypto.randomUUID(),
          name: r.name,
          url: r.url ?? "",
          notes: r.notes ?? "",
        })),
      )
    } else {
      setAmount("")
      setDate(todayISO())
      setInstallmentId("")
      setRemarks("")
      setResources([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function addResource() {
    setResources((rows) => [...rows, { key: crypto.randomUUID(), name: "", url: "", notes: "" }])
  }

  function patchResource(key: string, patch: Partial<ResourceDraft>) {
    setResources((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeResource(key: string) {
    setResources((rows) => rows.filter((r) => r.key !== key))
  }

  const amountNum = Number(amount)
  const resourcesInvalid = resources.some((r) => r.name.trim() === "")
  const canSubmit = subscription !== null && amountNum > 0 && date !== "" && !resourcesInvalid

  function submit() {
    if (!canSubmit || !subscription) return
    const patch = {
      subscriptionId: subscription.id,
      date,
      amount: amountNum,
      remarks: remarks.trim() || undefined,
      installmentId: installmentId || undefined,
      resources: resources.map((r) => ({
        name: r.name.trim(),
        url: r.url.trim() || undefined,
        notes: r.notes.trim() || undefined,
      })),
    }
    if (editing) {
      updateTransaction(editing.id, patch)
      onSaved("Transaction modifiée")
    } else {
      addTransaction(patch)
      onSaved("Transaction enregistrée")
    }
    onOpenChange(false)
  }

  /** Label of one planned line in the select — with its current status. */
  function installmentLabel(index: number): string {
    if (!subscription) return ""
    const inst = subscription.installments[index]
    const status = installmentStatus(inst, transactions)
    const suffix =
      status === "paid" ? " · payée" : status === "partial" ? " · partielle" : status === "overdue" ? " · en retard" : ""
    return `Tranche ${index + 1} — ${formatDT(inst.amount)} · avant le ${formatDay(inst.dueDate)}${suffix}`
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier la transaction" : "Nouvelle transaction"}
      description={
        subscription
          ? `Paiement sur l’abonnement — ${formatDT(subscription.price)} à payer au total.`
          : undefined
      }
      submitLabel={editing ? "Enregistrer" : "Encaisser"}
      onSubmit={submit}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Montant (DT)</span>
          <input
            className={INPUT + " tabular-nums"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex. 150"
            inputMode="decimal"
            dir="ltr"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Date</span>
          <input
            type="date"
            className={INPUT}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            dir="ltr"
          />
        </label>
      </div>

      {subscription && subscription.installments.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Tranche concernée <span className="font-normal text-ink-muted">(optionnel)</span>
          </span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={installmentId}
              onChange={(e) => setInstallmentId(e.target.value)}
            >
              <option value="">— Paiement libre —</option>
              {subscription.installments.map((inst, i) => (
                <option key={inst.id} value={inst.id}>
                  {installmentLabel(i)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Remarques <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <textarea
          className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
          dir="auto"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Ex. payé à l’accueil, virement reçu…"
          rows={2}
        />
      </label>

      {/* Attached proof documents. */}
      <div>
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Paperclip className="size-4 text-ink-muted" />
            Justificatifs <span className="font-normal text-ink-muted">({resources.length}) · optionnel</span>
          </span>
          <button
            type="button"
            onClick={addResource}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:underline"
          >
            <Plus className="size-3.5" /> Ajouter
          </button>
        </span>

        {resources.length > 0 && (
          <div className="space-y-3">
            {resources.map((r) => (
              <div key={r.key} className="rounded-md border border-border bg-surface-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <input
                    className={INPUT + " flex-1"}
                    value={r.name}
                    onChange={(e) => patchResource(r.key, { name: e.target.value })}
                    placeholder="Nom — ex. Reçu N°2031"
                    dir="auto"
                  />
                  <button
                    type="button"
                    onClick={() => removeResource(r.key)}
                    aria-label="Retirer le justificatif"
                    className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <input
                  className={INPUT + " mt-2"}
                  value={r.url}
                  onChange={(e) => patchResource(r.key, { url: e.target.value })}
                  placeholder="Lien (optionnel) — https://…"
                  type="url"
                  dir="ltr"
                />
                <input
                  className={INPUT + " mt-2"}
                  value={r.notes}
                  onChange={(e) => patchResource(r.key, { notes: e.target.value })}
                  placeholder="Notes (optionnel)"
                  dir="auto"
                />
              </div>
            ))}
          </div>
        )}
        {resourcesInvalid && (
          <p className="mt-1.5 text-[12px] font-medium text-danger-600">
            Chaque justificatif doit avoir un nom.
          </p>
        )}
      </div>
    </FormSheet>
  )
}
