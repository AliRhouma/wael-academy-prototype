import { useEffect, useMemo, useState } from "react"
import { History, TrendingUp } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { todayISO, useMoney } from "@/features/shared/payments/paymentLib"
import { rateOn, teacherRatesOf, teacherSessions } from "@/features/shared/teacherPay"
import { useData } from "@/stores/useData"
import type { Teacher, TeacherRate } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

export interface RateFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher
  /** The rate being edited, or null to start a new one. */
  editing: TeacherRate | null
  onSaved: (message: string) => void
}

/**
 * AUTO mode — set the price of one séance, from a chosen day onwards.
 *
 * The start date is deliberately unconstrained: a price agreed today may run
 * from a day already past, which RE-PRICES séances already given. Because that
 * quietly rewrites totals the prof has seen, the sheet says out loud how many
 * past séances the change reaches and what the total moves from and to — the
 * admin should never have to discover that after saving.
 */
export function RateFormSheet({ open, onOpenChange, teacher, editing, onSaved }: RateFormSheetProps) {
  const sessions = useData((s) => s.sessions)
  const rates = useData((s) => s.teacherRates)
  const addTeacherRate = useData((s) => s.addTeacherRate)
  const updateTeacherRate = useData((s) => s.updateTeacherRate)
  const { dt, day } = useMoney()

  const [amount, setAmount] = useState("")
  const [from, setFrom] = useState("")

  useEffect(() => {
    if (!open) return
    setAmount(editing ? editing.amount.toString() : "")
    setFrom(editing ? editing.effectiveFrom : todayISO())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const amountNum = Number(amount)
  const canSubmit = amountNum > 0 && from !== ""

  /**
   * What this change actually does to the books: which séances it reaches, how
   * many of them are already past, and the before/after total.
   */
  const impact = useMemo(() => {
    const mine = teacherSessions(sessions, teacher.id)
    const mineRates = teacherRatesOf(rates, teacher.id)
    const today = todayISO()

    // The rate list as it would be once saved.
    const next: TeacherRate[] = editing
      ? mineRates.map((r) =>
          r.id === editing.id ? { ...r, amount: amountNum, effectiveFrom: from } : r,
        )
      : [
          ...mineRates,
          {
            id: "draft",
            teacherId: teacher.id,
            amount: amountNum,
            effectiveFrom: from,
            createdAt: new Date(0).toISOString(),
          },
        ]

    let before = 0
    let after = 0
    let touched = 0
    let touchedPast = 0
    for (const s of mine) {
      const b = rateOn(mineRates, s.date)?.amount ?? 0
      const a = rateOn(next, s.date)?.amount ?? 0
      before += b
      after += a
      if (a !== b) {
        touched++
        if (s.date < today) touchedPast++
      }
    }
    return { before, after, touched, touchedPast }
  }, [sessions, rates, teacher.id, editing, amountNum, from])

  const backdated = from !== "" && from < todayISO()

  function submit() {
    if (!canSubmit) return
    if (editing) {
      updateTeacherRate(editing.id, { amount: amountNum, effectiveFrom: from })
      onSaved("Tarif modifié")
    } else {
      addTeacherRate({ teacherId: teacher.id, amount: amountNum, effectiveFrom: from })
      onSaved("Nouveau tarif enregistré")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier le tarif" : "Nouveau tarif par séance"}
      description={`Tarif d'une séance pour ${teacher.name}.`}
      submitLabel="Enregistrer"
      onSubmit={submit}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Tarif par séance (DT)
          </span>
          <input
            className={INPUT + " tabular-nums"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex. 60"
            inputMode="decimal"
            dir="ltr"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Applicable à partir du</span>
          <input
            type="date"
            className={INPUT}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            dir="ltr"
          />
        </label>
      </div>

      <p className="text-[calc(12px*var(--ts))] text-ink-muted">
        Le tarif peut démarrer à une date passée — les séances déjà données sont alors recalculées.
      </p>

      {amountNum > 0 && from !== "" && (
        <div className="flex flex-col gap-2.5 rounded-md border border-border bg-surface-muted/50 p-3">
          <div className="flex items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
              <TrendingUp className="size-4" />
            </span>
            <p className="text-[calc(12.5px*var(--ts))] text-ink-subtle">
              Ce changement touche{" "}
              <span className="font-display font-bold text-ink">
                <span className="num">{impact.touched}</span> séance(s)
              </span>
              . Le total passe de <span className="num">{dt(impact.before)}</span> à{" "}
              <span className="font-display font-bold text-ink">
                <span className="num">{dt(impact.after)}</span>
              </span>
              .
            </p>
          </div>

          {backdated && impact.touchedPast > 0 && (
            <div className="flex items-start gap-2.5 border-t border-border pt-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-warning-50 text-warning-700">
                <History className="size-4" />
              </span>
              <p className="text-[calc(12.5px*var(--ts))] text-warning-700">
                dont <span className="num">{impact.touchedPast}</span> déjà donnée(s) (avant le{" "}
                <span className="num">{day(todayISO())}</span>) — l'enseignant verra ses anciennes
                périodes changer.
              </p>
            </div>
          )}
        </div>
      )}
    </FormSheet>
  )
}
