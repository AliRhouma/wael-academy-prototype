import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CalendarDays } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { todayISO, useMoney } from "@/features/shared/payments/paymentLib"
import { teacherSessions } from "@/features/shared/teacherPay"
import { useData } from "@/stores/useData"
import type { Teacher, TeacherPayout } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** First and last day of the month containing `iso`. */
function monthBounds(iso: string): [string, string] {
  const [y, m] = iso.split("-").map(Number)
  const last = new Date(y, m, 0).getDate()
  return [`${iso.slice(0, 7)}-01`, `${iso.slice(0, 7)}-${String(last).padStart(2, "0")}`]
}

export interface PayoutFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher
  /** The payout being edited, or null to record a new one. */
  editing: TeacherPayout | null
  onSaved: (message: string) => void
}

/**
 * MANUAL mode — record one amount for one period.
 *
 * The admin types the amount and the dates; the number of séances the period
 * covers is COUNTED, never typed, and updates live as the dates move. That is
 * the whole reason the count isn't a field: it can't drift from the séances.
 */
export function PayoutFormSheet({
  open,
  onOpenChange,
  teacher,
  editing,
  onSaved,
}: PayoutFormSheetProps) {
  const sessions = useData((s) => s.sessions)
  const payouts = useData((s) => s.teacherPayouts)
  const addTeacherPayout = useData((s) => s.addTeacherPayout)
  const updateTeacherPayout = useData((s) => s.updateTeacherPayout)
  const { dt } = useMoney()

  const [amount, setAmount] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) return
    if (editing) {
      setAmount(editing.amount.toString())
      setFrom(editing.periodStart)
      setTo(editing.periodEnd)
      setNote(editing.note ?? "")
    } else {
      const [start, end] = monthBounds(todayISO())
      setAmount("")
      setFrom(start)
      setTo(end)
      setNote("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* Counted from the séances, live — this is the "session number of this
     period" the admin never has to work out. */
  const covered = useMemo(() => {
    if (!from || !to || from > to) return 0
    return teacherSessions(sessions, teacher.id).filter((s) => s.date >= from && s.date <= to).length
  }, [sessions, teacher.id, from, to])

  /* Overlapping periods are ALLOWED — a salary and a prime can share a month —
     but they are also how a prof gets paid twice by accident, so say it. */
  const clashes = useMemo(() => {
    if (!from || !to || from > to) return []
    return payouts.filter(
      (p) =>
        p.teacherId === teacher.id &&
        p.id !== editing?.id &&
        p.periodStart <= to &&
        from <= p.periodEnd,
    )
  }, [payouts, teacher.id, editing, from, to])

  const amountNum = Number(amount)
  const rangeValid = from !== "" && to !== "" && from <= to
  const canSubmit = amountNum > 0 && rangeValid

  function submit() {
    if (!canSubmit) return
    const patch = {
      teacherId: teacher.id,
      amount: amountNum,
      periodStart: from,
      periodEnd: to,
      note: note.trim() || undefined,
    }
    if (editing) {
      updateTeacherPayout(editing.id, patch)
      onSaved("Montant modifié")
    } else {
      addTeacherPayout(patch)
      onSaved("Montant enregistré")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier le montant" : "Nouveau montant"}
      description={`Paiement de ${teacher.name} sur une période donnée.`}
      submitLabel="Enregistrer"
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Montant (DT)</span>
        <input
          className={INPUT + " tabular-nums"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ex. 520"
          inputMode="decimal"
          dir="ltr"
          autoFocus
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Du</span>
          <input
            type="date"
            className={INPUT}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Au</span>
          <input
            type="date"
            className={INPUT}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            dir="ltr"
          />
        </label>
      </div>

      {!rangeValid && from !== "" && to !== "" && (
        <p className="text-[calc(12px*var(--ts))] font-medium text-danger-600">
          La date de début doit précéder la date de fin.
        </p>
      )}

      {/* The count, live. */}
      <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface-muted/50 p-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
          <CalendarDays className="size-4" />
        </span>
        <p className="text-[calc(12.5px*var(--ts))] text-ink-subtle">
          <span className="font-display font-bold text-ink">
            <span className="num">{covered}</span> séance(s)
          </span>{" "}
          sur cette période
          {covered > 0 && amountNum > 0 && (
            <>
              {" — "}
              <span className="num">{dt(Math.round(amountNum / covered))}</span> par séance
            </>
          )}
          .
          <span className="mt-0.5 block text-[calc(11.5px*var(--ts))] text-ink-muted">
            Comptées automatiquement depuis les séances — jamais saisies.
          </span>
        </p>
      </div>

      {clashes.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-warning-500/30 bg-warning-50 p-3 text-[calc(12.5px*var(--ts))] text-warning-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="num">{clashes.length}</span> montant(s) déjà enregistré(s) chevauchent cette période (
            <span className="num">
              {clashes.map((c) => dt(c.amount)).join(", ")}
            </span>
            ). Les deux s'additionneront — si c'est voulu, continuez.
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Note <span className="font-normal text-ink-muted">(optionnel — visible par l'enseignant)</span>
        </span>
        <textarea
          className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
          dir="auto"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ex. Juillet — séances de révision"
          rows={2}
        />
      </label>
    </FormSheet>
  )
}
