import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, ChevronDown, Dices, Plus, Tag, Trash2, UserRound } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useMoney } from "@/features/shared/payments/paymentLib"
import { breakdown } from "@/features/shared/promo/promoLib"
import { useData } from "@/stores/useData"
import type { PromoCase, PromoCode, PromoValue } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** One (bénéficiaire, provider) arrangement being edited. */
interface CaseDraft {
  key: string
  label: string
  payKind: PromoValue["kind"]
  payValue: string
  getKind: PromoValue["kind"]
  getValue: string
}

/** One per-offer rule being edited — % and DT are exclusive (one must be set). */
interface RuleDraft {
  offerId: string
  pct: string
  amount: string
  cases: CaseDraft[]
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administration",
  teacher: "Enseignants",
  parent: "Parents",
  student: "Élèves",
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

const newCase = (): CaseDraft => ({
  key: crypto.randomUUID(),
  label: "",
  payKind: "pct",
  payValue: "",
  getKind: "pct",
  getValue: "",
})

export interface PromoCodeFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The promo code being edited, or null to create a new one. */
  editing: PromoCode | null
  onSaved: (message: string) => void
}

/**
 * Create/edit a promo code: the code itself, WHO earns on it, the max number of
 * users, and per targeted offer both a plain discount and the (bénéficiaire,
 * provider) CASES.
 *
 * A case is two independent figures — what the bénéficiaire pays and what the
 * provider takes — each writable in % or in dinars, so hybrids are legal.
 * `beneficiaryPays` is the share STILL DUE, so "20%" is a very deep discount;
 * every case therefore prints its own arithmetic against the offer's real price
 * as you type. The academy's remainder can go negative, and when it does the
 * form says so in red instead of clamping — giving away more than you take in
 * is a decision the admin should make on purpose, not discover later.
 */
export function PromoCodeFormSheet({ open, onOpenChange, editing, onSaved }: PromoCodeFormSheetProps) {
  const offers = useData((s) => s.offers)
  const users = useData((s) => s.users)
  const promoCodes = useData((s) => s.promoCodes)
  const addPromoCode = useData((s) => s.addPromoCode)
  const updatePromoCode = useData((s) => s.updatePromoCode)

  const { dt } = useMoney()
  const [code, setCode] = useState("")
  const [providerId, setProviderId] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [rules, setRules] = useState<RuleDraft[]>([])

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setCode(editing.code)
      setProviderId(editing.providerUserId ?? "")
      setMaxUses(editing.maxUses?.toString() ?? "")
      setRules(
        editing.offers.map((r) => ({
          offerId: r.offerId,
          pct: r.discountPct?.toString() ?? "",
          amount: r.discountAmount?.toString() ?? "",
          cases: (r.cases ?? []).map((c) => ({
            key: c.id,
            label: c.label ?? "",
            payKind: c.beneficiaryPays.kind,
            payValue: c.beneficiaryPays.value.toString(),
            getKind: c.providerGets.kind,
            getValue: c.providerGets.value.toString(),
          })),
        })),
      )
    } else {
      setCode(generateCode())
      setProviderId("")
      setMaxUses("")
      setRules([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [offers],
  )
  const offerById = useMemo(() => new Map(offers.map((o) => [o.id, o])), [offers])

  /** Providers, grouped by role — anyone can own a code. */
  const providerGroups = useMemo(() => {
    const order = ["teacher", "student", "parent", "admin"] as const
    return order
      .map((role) => ({
        role,
        label: ROLE_LABEL[role],
        users: users.filter((u) => u.role === role).sort((a, b) => a.name.localeCompare(b.name, "ar")),
      }))
      .filter((g) => g.users.length > 0)
  }, [users])

  function toggleOffer(offerId: string) {
    setRules((rs) =>
      rs.some((r) => r.offerId === offerId)
        ? rs.filter((r) => r.offerId !== offerId)
        : [...rs, { offerId, pct: "", amount: "", cases: [] }],
    )
  }

  function patchRule(offerId: string, patch: Partial<RuleDraft>) {
    setRules((rs) => rs.map((r) => (r.offerId === offerId ? { ...r, ...patch } : r)))
  }

  function patchCase(offerId: string, key: string, patch: Partial<CaseDraft>) {
    setRules((rs) =>
      rs.map((r) =>
        r.offerId === offerId
          ? { ...r, cases: r.cases.map((c) => (c.key === key ? { ...c, ...patch } : c)) }
          : r,
      ),
    )
  }

  /** Exactly ONE of %/DT, in range — the rule-level validity check. */
  function ruleError(r: RuleDraft): string | null {
    const hasPct = r.pct.trim() !== ""
    const hasAmount = r.amount.trim() !== ""
    if (hasPct && hasAmount) return "Choisissez le pourcentage OU le montant, pas les deux."
    if (!hasPct && !hasAmount) return "Définissez la remise (pourcentage ou montant)."
    if (hasPct && !(Number(r.pct) > 0 && Number(r.pct) < 100)) return "Le pourcentage doit être entre 1 et 99."
    if (hasAmount && !(Number(r.amount) > 0)) return "Le montant doit être positif."
    return null
  }

  /** A case is valid once both sides carry a sane number. */
  function caseError(c: CaseDraft): string | null {
    for (const [kind, raw] of [
      [c.payKind, c.payValue],
      [c.getKind, c.getValue],
    ] as const) {
      const n = Number(raw)
      if (raw.trim() === "") return "Remplissez les deux champs."
      if (!(n >= 0)) return "Les nombres doivent être positifs."
      if (kind === "pct" && n > 100) return "Le pourcentage ne dépasse pas 100."
    }
    return null
  }

  const trimmedCode = code.trim().toUpperCase()
  const codeTaken = promoCodes.some(
    (p) => p.code.toUpperCase() === trimmedCode && p.id !== editing?.id,
  )
  const maxUsesNum = maxUses.trim() === "" ? undefined : Math.floor(Number(maxUses))
  const maxUsesInvalid = maxUses.trim() !== "" && !(maxUsesNum! >= 1)
  const rulesValid =
    rules.length > 0 &&
    rules.every((r) => ruleError(r) === null && r.cases.every((c) => caseError(c) === null))
  const canSubmit = trimmedCode !== "" && !codeTaken && !maxUsesInvalid && rulesValid

  function submit() {
    if (!canSubmit) return
    const patch = {
      code: trimmedCode,
      providerUserId: providerId || undefined,
      maxUses: maxUsesNum,
      offers: rules.map((r) => ({
        offerId: r.offerId,
        discountPct: r.pct.trim() !== "" ? Number(r.pct) : undefined,
        discountAmount: r.amount.trim() !== "" ? Number(r.amount) : undefined,
        cases: r.cases.length
          ? r.cases.map(
              (c): PromoCase => ({
                id: c.key,
                label: c.label.trim() || undefined,
                beneficiaryPays: { kind: c.payKind, value: Number(c.payValue) },
                providerGets: { kind: c.getKind, value: Number(c.getValue) },
              }),
            )
          : undefined,
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

  /** The % / د.ت switch on one side of a case. */
  function KindSwitch({
    value,
    onChange,
  }: {
    value: PromoValue["kind"]
    onChange: (k: PromoValue["kind"]) => void
  }) {
    return (
      <div className="flex shrink-0 overflow-hidden rounded-md border border-border-strong">
        {(["pct", "amount"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            aria-pressed={value === k}
            className={
              "h-11 w-11 text-sm font-medium transition " +
              (value === k
                ? "bg-brand-600 text-ink-inverted"
                : "bg-surface text-ink-muted hover:text-brand-600")
            }
          >
            {k === "pct" ? "%" : "DT"}
          </button>
        ))}
      </div>
    )
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier le code promo" : "Nouveau code promo"}
      description={
        editing ? undefined : "Générez un code, choisissez le fournisseur, les offres et les formules."
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
              " flex-1 font-display text-[calc(15px*var(--ts))] font-bold tracking-[.08em] uppercase" +
              (codeTaken ? " border-danger-600 focus:border-danger-600 focus:ring-danger-600/20" : "")
            }
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ex. RENTREE26"
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

      {/* Who earns on it — any role, or nobody (a house campaign). */}
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
          <UserRound className="size-4 text-ink-muted" />
          Fournisseur <span className="font-normal text-ink-muted">(celui qui touche la part)</span>
        </span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          >
            <option value="">— Sans fournisseur · code de l'académie —</option>
            {providerGroups.map((g) => (
              <optgroup key={g.role} label={g.label}>
                {g.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
        {!providerId && (
          <span className="mt-1.5 block text-[calc(12px*var(--ts))] text-ink-muted">
            Sans fournisseur, les formules n'ont pas de sens — le code devient une simple remise.
          </span>
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
          placeholder="ex. 50"
          inputMode="numeric"
          dir="ltr"
        />
        {maxUsesInvalid && (
          <span className="mt-1.5 block text-sm text-danger-600">
            Le maximum doit être un entier positif.
          </span>
        )}
      </label>

      {/* Offer selection — every selected offer gets its own discount + cases. */}
      <div>
        <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
          <Tag className="size-4 text-ink-muted" />
          Offres concernées <span className="font-normal text-ink-muted">({rules.length})</span>
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
          <p className="mt-1.5 text-[calc(12px*var(--ts))] text-ink-muted">
            Choisissez au moins une offre à remiser.
          </p>
        )}
      </div>

      {rules.length > 0 && (
        <div className="space-y-3">
          {rules.map((r) => {
            const err = ruleError(r)
            const offer = offerById.get(r.offerId)
            const price = offer?.price ?? 0
            return (
              <div key={r.offerId} className="rounded-md border border-border bg-surface-muted/40 p-3">
                <p dir="auto" className="mb-2 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
                  <span className="min-w-0 truncate">{offer?.name ?? "Offre supprimée"}</span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    <span className="num">{dt(price)}</span>
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[calc(12px*var(--ts))] font-medium text-ink-subtle">
                      Remise en %
                    </span>
                    <input
                      className={INPUT + " tabular-nums"}
                      value={r.pct}
                      onChange={(e) => patchRule(r.offerId, { pct: e.target.value })}
                      placeholder="ex. 20"
                      inputMode="numeric"
                      dir="ltr"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[calc(12px*var(--ts))] font-medium text-ink-subtle">
                      ou montant (DT)
                    </span>
                    <input
                      className={INPUT + " tabular-nums"}
                      value={r.amount}
                      onChange={(e) => patchRule(r.offerId, { amount: e.target.value })}
                      placeholder="ex. 30"
                      inputMode="decimal"
                      dir="ltr"
                    />
                  </label>
                </div>
                {err && <p className="mt-1.5 text-[calc(12px*var(--ts))] font-medium text-danger-600">{err}</p>}

                {/* The cases — what the provider can get on this offer. */}
                <div className="mt-3 border-t border-border pt-3">
                  <span className="mb-2 flex items-center justify-between text-[calc(12px*var(--ts))] font-medium text-ink-subtle">
                    <span>
                      Formules <span className="font-normal text-ink-muted">({r.cases.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => patchRule(r.offerId, { cases: [...r.cases, newCase()] })}
                      className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"
                    >
                      <Plus className="size-3.5" /> Ajouter une formule
                    </button>
                  </span>

                  {r.cases.length === 0 ? (
                    <p className="text-[calc(11.5px*var(--ts))] text-ink-muted">
                      Sans formule, le code ne fait que remiser et le fournisseur ne touche rien.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {r.cases.map((c) => {
                        const cErr = caseError(c)
                        const b = cErr
                          ? null
                          : breakdown(
                              {
                                id: c.key,
                                beneficiaryPays: { kind: c.payKind, value: Number(c.payValue) },
                                providerGets: { kind: c.getKind, value: Number(c.getValue) },
                              },
                              price,
                            )
                        return (
                          <div key={c.key} className="rounded-md border border-border bg-surface p-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                className={INPUT + " h-9 flex-1 text-[calc(13px*var(--ts))]"}
                                value={c.label}
                                onChange={(e) => patchCase(r.offerId, c.key, { label: e.target.value })}
                                placeholder="Nom de la formule (optionnel) — ex. Offre ami"
                                dir="auto"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  patchRule(r.offerId, {
                                    cases: r.cases.filter((x) => x.key !== c.key),
                                  })
                                }
                                aria-label="Supprimer la formule"
                                className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <div>
                                <span className="mb-1 block text-[calc(11.5px*var(--ts))] font-medium text-ink-subtle">
                                  Il paie
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    className={INPUT + " tabular-nums"}
                                    value={c.payValue}
                                    onChange={(e) =>
                                      patchCase(r.offerId, c.key, { payValue: e.target.value })
                                    }
                                    placeholder="20"
                                    inputMode="decimal"
                                    dir="ltr"
                                  />
                                  <KindSwitch
                                    value={c.payKind}
                                    onChange={(k) => patchCase(r.offerId, c.key, { payKind: k })}
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="mb-1 block text-[calc(11.5px*var(--ts))] font-medium text-ink-subtle">
                                  Le fournisseur touche
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    className={INPUT + " tabular-nums"}
                                    value={c.getValue}
                                    onChange={(e) =>
                                      patchCase(r.offerId, c.key, { getValue: e.target.value })
                                    }
                                    placeholder="10"
                                    inputMode="decimal"
                                    dir="ltr"
                                  />
                                  <KindSwitch
                                    value={c.getKind}
                                    onChange={(k) => patchCase(r.offerId, c.key, { getKind: k })}
                                  />
                                </div>
                              </div>
                            </div>

                            {cErr ? (
                              <p className="mt-2 text-[calc(11.5px*var(--ts))] font-medium text-danger-600">
                                {cErr}
                              </p>
                            ) : (
                              b && (
                                /* The arithmetic, live — "20%" of a 180 د.ت offer
                                   is a very different thing from "20 د.ت". */
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-surface-muted/60 px-2.5 py-2 text-[calc(11.5px*var(--ts))] tabular-nums">
                                  <span className="text-ink-subtle">
                                    Il paie{" "}
                                    <span className="num font-display font-bold text-ink">
                                      {dt(b.paid)}
                                    </span>
                                  </span>
                                  <span className="text-ink-muted">
                                    (économise <span className="num">{dt(b.saved)}</span>)
                                  </span>
                                  <span className="text-success-700">
                                    Fournisseur{" "}
                                    <span className="num font-display font-bold">
                                      +{dt(b.providerGets)}
                                    </span>
                                  </span>
                                  <span
                                    className={
                                      b.academyKeeps < 0
                                        ? "font-medium text-danger-600"
                                        : "text-ink-muted"
                                    }
                                  >
                                    {b.academyKeeps < 0 && (
                                      <AlertTriangle className="me-1 inline size-3" />
                                    )}
                                    Académie <span className="num">{dt(b.academyKeeps)}</span>
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </FormSheet>
  )
}
