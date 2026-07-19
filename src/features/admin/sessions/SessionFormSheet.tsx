import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import type { Session } from "@/data/types"
import { ScopePicker } from "@/features/admin/curriculum/ScopePicker"
import { GroupPicker } from "./GroupPicker"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

export interface SessionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The session being edited, or null to create a new one. */
  editing: Session | null
  /** Pre-fill the date when creating (e.g. the calendar day the user clicked). */
  defaultDate?: string
  /** Called after a successful add/edit with a ready-to-show toast message. */
  onSaved: (message: string) => void
}

/**
 * The full create/edit form for a séance — reused by the Séances manager and the
 * Calendrier page. Owns its own field state, seeded on open from `editing` (edit)
 * or blank + `defaultDate` (create), and writes straight to the store.
 */
export function SessionFormSheet({
  open,
  onOpenChange,
  editing,
  defaultDate,
  onSaved,
}: SessionFormSheetProps) {
  const teachers = useData((s) => s.teachers)
  const addSession = useData((s) => s.addSession)
  const updateSession = useData((s) => s.updateSession)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setTitle(editing.title)
      setDescription(editing.description ?? "")
      setDate(editing.date)
      setStartTime(editing.startTime)
      setEndTime(editing.endTime)
      setTeacherId(editing.teacherId ?? "")
      setYearIds(editing.yearIds)
      setSubjectIds(editing.subjectIds)
      setGroupIds(editing.groupIds)
    } else {
      setTitle("")
      setDescription("")
      setDate(defaultDate ?? "")
      setStartTime("")
      setEndTime("")
      setTeacherId("")
      setYearIds([])
      setSubjectIds([])
      setGroupIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name, "fr"))

  const timeInvalid = startTime !== "" && endTime !== "" && endTime <= startTime
  const canSubmit =
    title.trim() !== "" &&
    date !== "" &&
    startTime !== "" &&
    endTime !== "" &&
    !timeInvalid &&
    yearIds.length > 0 &&
    subjectIds.length > 0 &&
    groupIds.length > 0

  function submit() {
    if (!canSubmit) return
    const patch = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      teacherId: teacherId || undefined,
      yearIds,
      subjectIds,
      groupIds,
    }
    if (editing) {
      updateSession(editing.id, patch)
      onSaved("Séance modifiée")
    } else {
      addSession(patch)
      onSaved("Séance planifiée")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier la séance" : "Nouvelle séance"}
      description={
        editing
          ? undefined
          : "Un créneau pour un ou plusieurs groupes, avec sa matière et son enseignant."
      }
      submitLabel={editing ? "Enregistrer" : "Planifier"}
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre</span>
        <input
          className={INPUT + " text-start"}
          dir="auto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. Révision — Intégrales"
          autoFocus
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Description <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <textarea
          className={INPUT.replace("h-11", "min-h-[84px]") + " resize-y py-2.5 text-start"}
          dir="auto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Le programme de la séance…"
          rows={3}
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

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Début</span>
          <input
            type="time"
            className={INPUT + " tabular-nums"}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Fin</span>
          <input
            type="time"
            className={
              INPUT +
              " tabular-nums " +
              (timeInvalid ? "border-danger-400 focus:border-danger-400 focus:ring-danger-200/40" : "")
            }
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            dir="ltr"
          />
        </label>
      </div>
      {timeInvalid && (
        <p className="text-[12px] font-medium text-danger-600">
          L’heure de fin doit être après l’heure de début.
        </p>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Enseignant <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">— Aucun —</option>
            {sortedTeachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.subject ? ` · ${t.subject}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </label>

      <ScopePicker
        yearIds={yearIds}
        subjectIds={subjectIds}
        onYearsChange={setYearIds}
        onSubjectsChange={setSubjectIds}
      />

      <GroupPicker yearIds={yearIds} groupIds={groupIds} onChange={setGroupIds} />
    </FormSheet>
  )
}
