import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Link2 } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import type { LiveSession } from "@/data/types"
import {
  ACADEMIC_YEARS,
  DEFAULT_ACADEMIC_YEAR,
  GroupPicker,
  SubjectPicker,
  YearPicker,
} from "./LiveSessionPickers"
import { ResourcePicker } from "./ResourcePicker"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

export interface LiveSessionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The live session being edited, or null to create a new one. */
  editing: LiveSession | null
  /** Called after a successful add/edit with a ready-to-show toast message. */
  onSaved: (message: string) => void
}

/** Rough sanity check for the join link (prototype — not strict validation). */
function looksLikeUrl(v: string): boolean {
  const t = v.trim()
  return /^https?:\/\/.+/i.test(t)
}

/**
 * Create / edit form for a session en direct: a name + join link, at least one
 * matière, and optional groups, cours and ressources. Owns its field state,
 * seeded on open from `editing` (edit) or blank (create), and writes to the store.
 */
export function LiveSessionFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: LiveSessionFormSheetProps) {
  const addLiveSession = useData((s) => s.addLiveSession)
  const updateLiveSession = useData((s) => s.updateLiveSession)
  const offers = useData((s) => s.offers)

  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [academicYear, setAcademicYear] = useState<string>(DEFAULT_ACADEMIC_YEAR)
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [yearIds, setYearIds] = useState<string[]>([])
  const [offerId, setOfferId] = useState("")
  const [resourceIds, setResourceIds] = useState<string[]>([])

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [offers],
  )

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setUrl(editing.url)
      setDate(editing.date)
      setStartTime(editing.startTime)
      setAcademicYear(editing.academicYear)
      setSubjectIds(editing.subjectIds)
      setGroupIds(editing.groupIds)
      setYearIds(editing.yearIds)
      setOfferId(editing.offerId ?? "")
      setResourceIds(editing.resourceIds)
    } else {
      setName("")
      setUrl("")
      setDate("")
      setStartTime("")
      setAcademicYear(DEFAULT_ACADEMIC_YEAR)
      setSubjectIds([])
      setGroupIds([])
      setYearIds([])
      setOfferId("")
      setResourceIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const urlInvalid = url.trim() !== "" && !looksLikeUrl(url)
  const canSubmit =
    name.trim() !== "" &&
    url.trim() !== "" &&
    !urlInvalid &&
    date !== "" &&
    startTime !== "" &&
    academicYear !== "" &&
    subjectIds.length > 0

  function submit() {
    if (!canSubmit) return
    const patch = {
      name: name.trim(),
      url: url.trim(),
      date,
      startTime,
      academicYear,
      subjectIds,
      groupIds,
      yearIds,
      offerId: offerId || undefined,
      resourceIds,
    }
    if (editing) {
      updateLiveSession(editing.id, patch)
      onSaved("Session modifiée")
    } else {
      addLiveSession(patch)
      onSaved("Session créée")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier la session" : "Nouvelle session en direct"}
      description={
        editing
          ? undefined
          : "Un lien de visioconférence, ses matières, et — au besoin — des groupes, années et ressources."
      }
      submitLabel={editing ? "Enregistrer" : "Créer"}
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de la session</span>
        <input
          className={INPUT + " text-start"}
          dir="auto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Révision en direct — Intégrales"
          autoFocus
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Lien de la session</span>
        <div className="relative">
          <Link2 className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="url"
            className={
              INPUT +
              " ps-9 " +
              (urlInvalid
                ? "border-danger-400 focus:border-danger-400 focus:ring-danger-200/40"
                : "")
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://meet.google.com/…"
            dir="ltr"
          />
        </div>
        {urlInvalid && (
          <p className="mt-1.5 text-[12px] font-medium text-danger-600">
            Le lien doit commencer par http:// ou https://.
          </p>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Heure</span>
          <input
            type="time"
            className={INPUT + " tabular-nums"}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            dir="ltr"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Année scolaire</span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            dir="ltr"
          >
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </label>

      <SubjectPicker subjectIds={subjectIds} onChange={setSubjectIds} />

      <GroupPicker groupIds={groupIds} onChange={setGroupIds} />

      <YearPicker yearIds={yearIds} onChange={setYearIds} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Offre <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <div className="relative">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
          >
            <option value="">— Aucune —</option>
            {sortedOffers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </label>

      <ResourcePicker resourceIds={resourceIds} onChange={setResourceIds} />
    </FormSheet>
  )
}
