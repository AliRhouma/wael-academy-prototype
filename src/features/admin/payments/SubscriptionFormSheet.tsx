import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Plus, Trash2, Wand2 } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import type { Subscription, SubscriptionState } from "@/data/types"
import { formatDT } from "./paymentLib"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** One editable planned line while the form is open. */
interface InstallmentDraft {
  id: string
  amount: string
  dueDate: string
}

/** "2026-09-15" + n months → "YYYY-MM-DD" (JS rolls day overflow forward). */
function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setMonth(d.getMonth() + months)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export interface SubscriptionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The subscription being edited, or null to create a new one. */
  editing: Subscription | null
  onSaved: (message: string) => void
}

/**
 * Create/edit form for a student subscription: the student + offer pair, the
 * negotiated price (manual — NOT the offer's price), the payment mode tag and
 * contract description, the planned tranches (répartition), the deadline
 * (prefilled from the offer's end date) and the admin state.
 */
export function SubscriptionFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: SubscriptionFormSheetProps) {
  const users = useData((s) => s.users)
  const offers = useData((s) => s.offers)
  const addSubscription = useData((s) => s.addSubscription)
  const updateSubscription = useData((s) => s.updateSubscription)

  const [userId, setUserId] = useState("")
  const [offerId, setOfferId] = useState("")
  const [price, setPrice] = useState("")
  const [tag, setTag] = useState("")
  const [description, setDescription] = useState("")
  const [installments, setInstallments] = useState<InstallmentDraft[]>([])
  const [deadline, setDeadline] = useState("")
  const [state, setState] = useState<SubscriptionState>("active")

  // Quick-generate panel ("3 tranches de 150 DT, tous les mois à partir du…").
  const [genOpen, setGenOpen] = useState(false)
  const [genStart, setGenStart] = useState("")
  const [genCount, setGenCount] = useState("3")
  const [genEvery, setGenEvery] = useState("1")
  const [genAmount, setGenAmount] = useState("")

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setUserId(editing.userId)
      setOfferId(editing.offerId)
      setPrice(editing.price.toString())
      setTag(editing.tag ?? "")
      setDescription(editing.description ?? "")
      setInstallments(
        editing.installments.map((i) => ({
          id: i.id,
          amount: i.amount.toString(),
          dueDate: i.dueDate,
        })),
      )
      setDeadline(editing.deadline ?? "")
      setState(editing.state)
    } else {
      setUserId("")
      setOfferId("")
      setPrice("")
      setTag("")
      setDescription("")
      setInstallments([])
      setDeadline("")
      setState("active")
    }
    setGenOpen(false)
    setGenStart("")
    setGenCount("3")
    setGenEvery("1")
    setGenAmount("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const students = useMemo(
    () =>
      users
        .filter((u) => u.role === "student")
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [users],
  )
  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [offers],
  )

  /** Picking an offer prefills the deadline with its end date (still editable). */
  function pickOffer(id: string) {
    setOfferId(id)
    const offer = offers.find((o) => o.id === id)
    if (offer?.endDate) setDeadline(offer.endDate)
  }

  function addRow() {
    setInstallments((rows) => [...rows, { id: crypto.randomUUID(), amount: "", dueDate: "" }])
  }

  function patchRow(id: string, patch: Partial<InstallmentDraft>) {
    setInstallments((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeRow(id: string) {
    setInstallments((rows) => rows.filter((r) => r.id !== id))
  }

  const priceNum = Number(price)
  const rowsInvalid = installments.some((r) => !(Number(r.amount) > 0) || r.dueDate === "")
  const planTotal = installments.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const planMismatch = installments.length > 0 && !rowsInvalid && priceNum > 0 && planTotal !== priceNum
  const canSubmit = userId !== "" && offerId !== "" && priceNum > 0 && !rowsInvalid

  // ----- Quick generation -----
  const genCountNum = Math.floor(Number(genCount))
  const genEveryNum = Math.floor(Number(genEvery))
  const genAmountNum = Number(genAmount)
  const genValid =
    genStart !== "" && genCountNum >= 1 && genCountNum <= 36 && genEveryNum >= 1 && genAmountNum > 0

  /** Fill the per-tranche amount with an equal split of the montant à payer. */
  function splitPrice() {
    if (!(priceNum > 0) || !(genCountNum >= 1)) return
    setGenAmount((Math.round((priceNum / genCountNum) * 1000) / 1000).toString())
  }

  /** Build the whole échéancier from the config — replaces the current lines. */
  function generatePlan() {
    if (!genValid) return
    setInstallments(
      Array.from({ length: genCountNum }, (_, i) => ({
        id: crypto.randomUUID(),
        amount: genAmount,
        dueDate: addMonths(genStart, i * genEveryNum),
      })),
    )
    setGenOpen(false)
  }

  function submit() {
    if (!canSubmit) return
    const patch = {
      userId,
      offerId,
      price: priceNum,
      tag: tag.trim() || undefined,
      description: description.trim() || undefined,
      installments: installments.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        dueDate: r.dueDate,
      })),
      deadline: deadline || undefined,
      state,
    }
    if (editing) {
      updateSubscription(editing.id, patch)
      onSaved("Abonnement modifié")
    } else {
      addSubscription(patch)
      onSaved("Abonnement créé")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier l’abonnement" : "Nouvel abonnement"}
      description={
        editing
          ? undefined
          : "Inscrivez un élève à une offre : montant convenu, mode de paiement et échéancier."
      }
      submitLabel={editing ? "Enregistrer" : "Créer"}
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Élève</span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">— Choisir un élève —</option>
            {students.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Offre</span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={offerId}
            onChange={(e) => pickOffer(e.target.value)}
          >
            <option value="">— Choisir une offre —</option>
            {sortedOffers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Montant à payer (DT)
          </span>
          <input
            className={INPUT + " tabular-nums"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex. 360"
            inputMode="decimal"
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Mode <span className="font-normal text-ink-muted">(opt.)</span>
          </span>
          <input
            className={INPUT}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Ex. Par tranches, Cash…"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Description du contrat <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <textarea
          className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
          dir="auto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex. 3 tranches sur l’année, première à l’inscription…"
          rows={2}
        />
      </label>

      {/* The planned tranches (répartition). */}
      <div>
        <span className="mb-2 flex items-center justify-between gap-2 text-sm font-medium text-ink-subtle">
          <span>
            Échéancier{" "}
            <span className="font-normal text-ink-muted">({installments.length} tranche{installments.length > 1 ? "s" : ""})</span>
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGenOpen((o) => !o)}
              className={
                "inline-flex items-center gap-1 text-[12px] font-medium hover:underline " +
                (genOpen ? "text-accent2-700" : "text-brand-600")
              }
            >
              <Wand2 className="size-3.5" /> Génération rapide
            </button>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:underline"
            >
              <Plus className="size-3.5" /> Ajouter une tranche
            </button>
          </span>
        </span>

        {/* Quick-generate: "N tranches de X DT, tous les M mois à partir du…" */}
        {genOpen && (
          <div className="mb-3 rounded-md border border-brand-200 bg-brand-50/40 p-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">
                  Première échéance
                </span>
                <input
                  type="date"
                  className={INPUT}
                  value={genStart}
                  onChange={(e) => setGenStart(e.target.value)}
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">Répéter</span>
                <div className="relative">
                  <select
                    className={INPUT + " appearance-none pe-10"}
                    value={genEvery}
                    onChange={(e) => setGenEvery(e.target.value)}
                  >
                    <option value="1">Tous les mois</option>
                    <option value="2">Tous les 2 mois</option>
                    <option value="3">Tous les 3 mois</option>
                    <option value="6">Tous les 6 mois</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">
                  Nombre de tranches
                </span>
                <input
                  className={INPUT + " tabular-nums"}
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  placeholder="Ex. 3"
                  inputMode="numeric"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">
                  Montant par tranche (DT)
                </span>
                <input
                  className={INPUT + " tabular-nums"}
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value)}
                  placeholder="Ex. 150"
                  inputMode="decimal"
                  dir="ltr"
                />
              </label>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {priceNum > 0 && genCountNum >= 1 ? (
                <button
                  type="button"
                  onClick={splitPrice}
                  className="text-[12px] font-medium text-brand-600 hover:underline"
                >
                  Répartir {formatDT(priceNum)} sur {genCountNum} tranche{genCountNum > 1 ? "s" : ""}
                </button>
              ) : (
                <span />
              )}
              {genValid && (
                <span className="text-[12px] tabular-nums text-ink-muted">
                  {genCountNum} × {formatDT(genAmountNum)} = {formatDT(genCountNum * genAmountNum)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={generatePlan}
              disabled={!genValid}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-grad px-4 text-sm font-medium text-ink-inverted shadow-brand transition hover:brightness-105 disabled:opacity-50"
            >
              <Wand2 className="size-4" />
              Générer {genCountNum >= 1 ? `${genCountNum} tranche${genCountNum > 1 ? "s" : ""}` : "les tranches"}
            </button>
            {installments.length > 0 && (
              <p className="mt-1.5 text-center text-[12px] text-ink-muted">
                Remplacera les {installments.length} tranche{installments.length > 1 ? "s" : ""} actuelle{installments.length > 1 ? "s" : ""}.
              </p>
            )}
          </div>
        )}

        {installments.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
            Aucune tranche — paiement libre (ex. cash en une fois).
          </p>
        ) : (
          <div className="space-y-2">
            {installments.map((row, i) => (
              <div key={row.id} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-center text-[12px] font-medium tabular-nums text-ink-muted">
                  {i + 1}
                </span>
                <input
                  className={INPUT + " flex-1 tabular-nums"}
                  value={row.amount}
                  onChange={(e) => patchRow(row.id, { amount: e.target.value })}
                  placeholder="Montant (DT)"
                  inputMode="decimal"
                  dir="ltr"
                />
                <input
                  type="date"
                  className={INPUT + " flex-1"}
                  value={row.dueDate}
                  onChange={(e) => patchRow(row.id, { dueDate: e.target.value })}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Retirer la tranche"
                  className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {rowsInvalid && (
          <p className="mt-1.5 text-[12px] font-medium text-danger-600">
            Chaque tranche doit avoir un montant et une date.
          </p>
        )}
        {planMismatch && (
          <p className="mt-1.5 text-[12px] font-medium text-accent2-700">
            La somme des tranches ({formatDT(planTotal)}) diffère du montant à payer (
            {formatDT(priceNum)}).
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Échéance d’accès <span className="font-normal text-ink-muted">(opt.)</span>
          </span>
          <input
            type="date"
            className={INPUT}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">État</span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={state}
              onChange={(e) => setState(e.target.value as SubscriptionState)}
            >
              <option value="active">Actif</option>
              <option value="blocked">Bloqué</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>
      </div>
    </FormSheet>
  )
}
