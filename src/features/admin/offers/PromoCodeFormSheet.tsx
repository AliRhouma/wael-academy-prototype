import { useEffect, useMemo, useState } from "react"
import { Dices, Tag } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import type { PromoCode } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** One per-offer rule being edited — % and DT are exclusive (one must be set). */
interface RuleDraft {
  offerId: string
  pct: string
  amount: string
}

/** "WAEL-K7F2M" — unambiguous alphabet (no O/0, I/1/L). */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  let s = ""
  for (const b of bytes) s += alphabet[b % alphabet.length]
  return `WAEL-${s}`
}

export interface PromoCodeFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The promo code being edited, or null to create a new one. */
  editing: PromoCode | null
  onSaved: (message: string) => void
}

/**
 * Create/edit form for a promo code: the code (typed or generated), the max
 * number of users, and the targeted offers — each selected offer gets its OWN
 * discount config, a percentage OR a fixed amount off.
 */
export function PromoCodeFormSheet({ open, onOpenChange, editing, onSaved }: PromoCodeFormSheetProps) {
  const offers = useData((s) => s.offers)
  const promoCodes = useData((s) => s.promoCodes)
  const addPromoCode = useData((s) => s.addPromoCode)
  const updatePromoCode = useData((s) => s.updatePromoCode)

  const [code, setCode] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [rules, setRules] = useState<RuleDraft[]>([])

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setCode(editing.code)
      setMaxUses(editing.maxUses?.toString() ?? "")
      setRules(
        editing.offers.map((r) => ({
          offerId: r.offerId,
          pct: r.discountPct?.toString() ?? "",
          amount: r.discountAmount?.toString() ?? "",
        })),
      )
    } else {
      setCode(generateCode())
      setMaxUses("")
      setRules([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [offers],
  )
  const offerName = useMemo(() => new Map(offers.map((o) => [o.id, o.name])), [offers])

  function toggleOffer(offerId: string) {
    setRules((rs) =>
      rs.some((r) => r.offerId === offerId)
        ? rs.filter((r) => r.offerId !== offerId)
        : [...rs, { offerId, pct: "", amount: "" }],
    )
  }

  function patchRule(offerId: string, patch: Partial<RuleDraft>) {
    setRules((rs) => rs.map((r) => (r.offerId === offerId ? { ...r, ...patch } : r)))
  }

  /** Exactly ONE of %/DT, in range — the rule-level validity check. */
  function ruleError(r: RuleDraft): string | null {
    const hasPct = r.pct.trim() !== ""
    const hasAmount = r.amount.trim() !== ""
    if (hasPct && hasAmount) return "Choisissez % OU montant, pas les deux."
    if (!hasPct && !hasAmount) return "Indiquez une remise (% ou montant)."
    if (hasPct && !(Number(r.pct) > 0 && Number(r.pct) < 100)) return "Le % doit être entre 1 et 99."
    if (hasAmount && !(Number(r.amount) > 0)) return "Le montant doit être positif."
    return null
  }

  const trimmedCode = code.trim().toUpperCase()
  const codeTaken = promoCodes.some(
    (p) => p.code.toUpperCase() === trimmedCode && p.id !== editing?.id,
  )
  const maxUsesNum = maxUses.trim() === "" ? undefined : Math.floor(Number(maxUses))
  const maxUsesInvalid = maxUses.trim() !== "" && !(maxUsesNum! >= 1)
  const rulesValid = rules.length > 0 && rules.every((r) => ruleError(r) === null)
  const canSubmit = trimmedCode !== "" && !codeTaken && !maxUsesInvalid && rulesValid

  function submit() {
    if (!canSubmit) return
    const patch = {
      code: trimmedCode,
      maxUses: maxUsesNum,
      offers: rules.map((r) => ({
        offerId: r.offerId,
        discountPct: r.pct.trim() !== "" ? Number(r.pct) : undefined,
        discountAmount: r.amount.trim() !== "" ? Number(r.amount) : undefined,
      })),
    }
    if (editing) {
      updatePromoCode(editing.id, patch)
      onSaved("Code promo modifié")
    } else {
      addPromoCode({ ...patch, usedByUserIds: [] })
      onSaved("Code promo créé")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier le code promo" : "Nouveau code promo"}
      description={
        editing
          ? undefined
          : "Générez un code, choisissez les offres visées et la remise de chacune."
      }
      submitLabel={editing ? "Enregistrer" : "Créer le code"}
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Code</span>
        <div className="flex items-center gap-2">
          <input
            className={
              INPUT +
              " flex-1 font-display text-[15px] font-bold tracking-[.08em] uppercase" +
              (codeTaken ? " border-danger-600 focus:border-danger-600 focus:ring-danger-600/20" : "")
            }
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex. RENTREE26"
            dir="ltr"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setCode(generateCode())}
            title="Générer un code"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <Dices className="size-4" /> Générer
          </button>
        </div>
        {codeTaken && (
          <span className="mt-1.5 block text-sm text-danger-600">Ce code existe déjà.</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Nombre max d’utilisateurs{" "}
          <span className="font-normal text-ink-muted">(vide = illimité)</span>
        </span>
        <input
          className={
            INPUT +
            " tabular-nums" +
            (maxUsesInvalid ? " border-danger-600 focus:border-danger-600 focus:ring-danger-600/20" : "")
          }
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Ex. 50"
          inputMode="numeric"
          dir="ltr"
        />
        {maxUsesInvalid && (
          <span className="mt-1.5 block text-sm text-danger-600">
            Le maximum doit être un nombre entier positif.
          </span>
        )}
      </label>

      {/* Offer selection — every selected offer gets its own discount config. */}
      <div>
        <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
          <Tag className="size-4 text-ink-muted" />
          Offres visées <span className="font-normal text-ink-muted">({rules.length})</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {sortedOffers.map((o) => {
            const on = rules.some((r) => r.offerId === o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleOffer(o.id)}
                className={
                  "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-sm font-medium transition " +
                  (on
                    ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                    : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                }
              >
                <span dir="auto">{o.name}</span>
              </button>
            )
          })}
        </div>
        {rules.length === 0 && (
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Sélectionnez au moins une offre à remiser.
          </p>
        )}
      </div>

      {rules.length > 0 && (
        <div className="space-y-3">
          {rules.map((r) => {
            const err = ruleError(r)
            return (
              <div key={r.offerId} className="rounded-md border border-border bg-surface-muted/40 p-3">
                <p dir="auto" className="mb-2 text-sm font-medium text-ink">
                  {offerName.get(r.offerId) ?? "Offre supprimée"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">
                      Remise en %
                    </span>
                    <input
                      className={INPUT + " tabular-nums"}
                      value={r.pct}
                      onChange={(e) => patchRule(r.offerId, { pct: e.target.value })}
                      placeholder="Ex. 20"
                      inputMode="numeric"
                      dir="ltr"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium text-ink-subtle">
                      OU montant (DT)
                    </span>
                    <input
                      className={INPUT + " tabular-nums"}
                      value={r.amount}
                      onChange={(e) => patchRule(r.offerId, { amount: e.target.value })}
                      placeholder="Ex. 30"
                      inputMode="decimal"
                      dir="ltr"
                    />
                  </label>
                </div>
                {err && <p className="mt-1.5 text-[12px] font-medium text-danger-600">{err}</p>}
              </div>
            )
          })}
        </div>
      )}
    </FormSheet>
  )
}
