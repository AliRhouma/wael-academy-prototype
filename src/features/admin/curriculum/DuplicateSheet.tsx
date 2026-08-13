import { useMemo, type ReactNode } from "react"
import { AlertTriangle, Copy } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import { groupYearsByCycle } from "@/data/curriculum"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

const SELECT = INPUT + " appearance-none"

/** How far down the programme a destination is picked: classe → matière → chapitre. */
export type DestinationDepth = "year" | "subject" | "chapter"

/** Where a copy goes. Fields below the chosen depth are ignored. */
export interface Destination {
  yearId: string
  subjectId: string
  chapterId: string
}

export const EMPTY_DESTINATION: Destination = { yearId: "", subjectId: "", chapterId: "" }

/** True once every level the depth requires has been chosen. */
export function isDestinationReady(d: Destination, depth: DestinationDepth): boolean {
  if (!d.yearId) return false
  if (depth === "year") return true
  if (!d.subjectId) return false
  return depth === "subject" || !!d.chapterId
}

/** The name of the deepest thing a destination points at — for the toast. */
export function useDestinationName(dest: Destination, depth: DestinationDepth): string {
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  if (depth === "chapter") return chapters.find((c) => c.id === dest.chapterId)?.name ?? "—"
  if (depth === "subject") return subjects.find((s) => s.id === dest.subjectId)?.name ?? "—"
  return years.find((y) => y.id === dest.yearId)?.name ?? "—"
}

/**
 * The cascading "où ?" picker of the duplicate modal: classe (grouped by cycle)
 * → matière → chapitre, cut at `depth`. Picking a level auto-selects the first
 * option of the level below so the form stays submittable; a level with nothing
 * in it says so instead of showing an empty select.
 */
export function DestinationPicker({
  depth,
  value,
  onChange,
}: {
  depth: DestinationDepth
  value: Destination
  onChange: (next: Destination) => void
}) {
  const years = useData((s) => s.years)
  const allSubjects = useData((s) => s.subjects)
  const allChapters = useData((s) => s.chapters)

  const cycleGroups = useMemo(() => groupYearsByCycle(years), [years])

  const subjects = useMemo(
    () =>
      allSubjects
        .filter((s) => s.yearId === value.yearId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allSubjects, value.yearId],
  )

  const chapters = useMemo(
    () =>
      allChapters
        .filter((c) => c.subjectIds.includes(value.subjectId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allChapters, value.subjectId],
  )

  /** First chapter of a matière — what a freshly picked matière falls back to. */
  function firstChapterOf(subjectId: string) {
    return (
      allChapters
        .filter((c) => c.subjectIds.includes(subjectId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.id ?? ""
    )
  }

  function pickYear(yearId: string) {
    if (depth === "year") return onChange({ ...EMPTY_DESTINATION, yearId })
    const subjectId =
      allSubjects
        .filter((s) => s.yearId === yearId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.id ?? ""
    onChange({ yearId, subjectId, chapterId: subjectId ? firstChapterOf(subjectId) : "" })
  }

  function pickSubject(subjectId: string) {
    onChange({ ...value, subjectId, chapterId: depth === "chapter" ? firstChapterOf(subjectId) : "" })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-3.5">
      <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
        Destination
      </p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">القسم</span>
        <select className={SELECT} value={value.yearId} onChange={(e) => pickYear(e.target.value)}>
          <option value="">— اختار قسم —</option>
          {cycleGroups
            .filter((g) => g.years.length > 0)
            .map((g) => (
              <optgroup key={g.cycle.key} label={g.cycle.label}>
                {g.years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
      </label>

      {depth !== "year" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">المادّة</span>
          {!value.yearId ? (
            <p className="rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-ink-muted">
              اختار قسم في البداية.
            </p>
          ) : subjects.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-ink-muted">
              القسم هذا ما عندوش موادّ — اعمل وحدة في البداية.
            </p>
          ) : (
            <select
              className={SELECT}
              value={value.subjectId}
              onChange={(e) => pickSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </label>
      )}

      {depth === "chapter" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">الفصل</span>
          {!value.subjectId ? (
            <p className="rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-ink-muted">
              اختار مادّة في البداية.
            </p>
          ) : chapters.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-ink-muted">
              المادّة هذي ما عندهاش فصول — اعمل واحد في البداية.
            </p>
          ) : (
            <select
              className={SELECT}
              value={value.chapterId}
              onChange={(e) => onChange({ ...value, chapterId: e.target.value })}
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </label>
      )}
    </div>
  )
}

export interface DuplicateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "اعمل نسخة من الفصل" */
  title: string
  /** "اسم الفصل" / "Titre du contenu" */
  nameLabel: string
  name: string
  onNameChange: (value: string) => void
  /** Omit to show no destination picker (the caller supplies its own). */
  depth?: DestinationDepth
  destination?: Destination
  onDestinationChange?: (next: Destination) => void
  /** What travels with the copy — shown as a quiet line under the fields. */
  note?: string
  /** A caution the current choice deserves (e.g. steps that won't follow). */
  warning?: string
  /** A caller-side reason the copy can't be made yet — blocks the submit. */
  blocker?: string
  /** Extra fields, rendered between the name and the destination. */
  children?: ReactNode
  onSubmit: () => void
}

/**
 * The shared "اعمل نسخة" modal: name the copy, then say where it goes. Bottom
 * sheet on mobile / dialog on desktop via `FormSheet`. Submitting is a no-op
 * until the name and every required destination level are filled.
 */
export function DuplicateSheet({
  open,
  onOpenChange,
  title,
  nameLabel,
  name,
  onNameChange,
  depth,
  destination,
  onDestinationChange,
  note,
  warning,
  blocker,
  children,
  onSubmit,
}: DuplicateSheetProps) {
  /** What still stands in the way — doubles as the message and the guard. */
  const missing =
    name.trim() === ""
      ? "أعطي اسم للنسخة."
      : blocker
        ? blocker
        : depth && destination && !isDestinationReady(destination, depth)
          ? !destination.yearId
            ? "اختار القسم اللي باش تنسخ ليه."
            : depth !== "year" && !destination.subjectId
              ? "اختار المادّة اللي باش تنسخ ليها."
              : "اختار الفصل اللي باش تنسخ ليه."
          : undefined

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="نسخة مستقلّة — سمّيها واختار وين تمشي."
      submitLabel="اعمل نسخة"
      onSubmit={() => !missing && onSubmit()}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">{nameLabel}</span>
        <input
          className={INPUT + " text-start"}
          dir="auto"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />
      </label>

      {children}

      {depth && destination && onDestinationChange && (
        <DestinationPicker depth={depth} value={destination} onChange={onDestinationChange} />
      )}

      {(missing ?? warning) && (
        <p className="flex items-start gap-2 rounded-md border border-border bg-accent2-50 px-3 py-2.5 text-[calc(13px*var(--ts))] text-ink-subtle">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent2-700" />
          <span>{missing ?? warning}</span>
        </p>
      )}

      {note && (
        <p className="flex items-start gap-2 text-[calc(13px*var(--ts))] text-ink-muted">
          <Copy className="mt-0.5 size-4 shrink-0" />
          <span>{note}</span>
        </p>
      )}
    </FormSheet>
  )
}
