import { useMemo, useState, type ReactNode } from "react"
import { GraduationCap, Search, UsersRound } from "lucide-react"
import { useData } from "@/stores/useData"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** A toggle chip — mirrors the curriculum / séances ScopePicker chip. */
function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-sm font-medium transition " +
        (active
          ? "border-transparent bg-grad text-ink-inverted shadow-brand"
          : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
      }
    >
      {children}
    </button>
  )
}

/**
 * The "quelles matières ?" picker of a live session — a searchable, year-grouped
 * multi-select over ALL subjects (a live session isn't scoped to a year, so every
 * matière is fair game). Grouping by year keeps same-named subjects distinct.
 * At least one subject is required (enforced by the form).
 */
export function SubjectPicker({
  subjectIds,
  onChange,
}: {
  subjectIds: string[]
  onChange: (ids: string[]) => void
}) {
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const [query, setQuery] = useState("")

  const picked = useMemo(() => new Set(subjectIds), [subjectIds])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sortedYears = [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const byYear = new Map<string, typeof subjects>()
    for (const sub of [...subjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
      // Keep a subject if it matches the search OR is already selected.
      if (q !== "" && !sub.name.toLowerCase().includes(q) && !picked.has(sub.id)) continue
      if (!byYear.has(sub.yearId)) byYear.set(sub.yearId, [])
      byYear.get(sub.yearId)!.push(sub)
    }
    return sortedYears
      .filter((y) => byYear.has(y.id))
      .map((y) => ({ year: y, subjects: byYear.get(y.id)! }))
  }, [years, subjects, query, picked])

  function toggle(id: string) {
    onChange(picked.has(id) ? subjectIds.filter((s) => s !== id) : [...subjectIds, id])
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-subtle">
        Matières <span className="font-normal text-ink-muted">({subjectIds.length})</span>
      </span>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une matière…"
          className={INPUT + " ps-9"}
          dir="auto"
        />
      </div>

      {groups.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Aucune matière ne correspond à cette recherche.
        </p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-y-auto scroll-touch rounded-md border border-border bg-surface-muted/40 p-3">
          {groups.map(({ year, subjects: subs }) => (
            <div key={year.id}>
              <p
                dir="auto"
                className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted"
              >
                {year.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {subs.map((sub) => (
                  <Toggle key={sub.id} active={picked.has(sub.id)} onClick={() => toggle(sub.id)}>
                    <span dir="auto">{sub.name}</span>
                  </Toggle>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The optional "quels groupes ?" picker — a flat multi-select over every student
 * group (a live session isn't year-scoped, so all groups are available). Zero or
 * more; leaving it empty is fine.
 */
export function GroupPicker({
  groupIds,
  onChange,
}: {
  groupIds: string[]
  onChange: (ids: string[]) => void
}) {
  const groups = useData((s) => s.groups)
  const picked = useMemo(() => new Set(groupIds), [groupIds])
  const sorted = useMemo(
    () => [...groups].sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [groups],
  )

  function toggle(id: string) {
    onChange(picked.has(id) ? groupIds.filter((g) => g !== id) : [...groupIds, id])
  }

  return (
    <div>
      <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
        <UsersRound className="size-4 text-ink-muted" />
        Groupes d’élèves{" "}
        <span className="font-normal text-ink-muted">({groupIds.length}) · optionnel</span>
      </span>
      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Aucun groupe pour le moment. Créez-en un depuis « Groupes ».
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map((g) => (
            <Toggle key={g.id} active={picked.has(g.id)} onClick={() => toggle(g.id)}>
              <span dir="auto">{g.title}</span>
            </Toggle>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The optional "quelles années ?" picker — a flat multi-select over the study
 * years (niveaux) of the programme, in curriculum order. Zero or more.
 */
export function YearPicker({
  yearIds,
  onChange,
}: {
  yearIds: string[]
  onChange: (ids: string[]) => void
}) {
  const years = useData((s) => s.years)
  const picked = useMemo(() => new Set(yearIds), [yearIds])
  const sorted = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  function toggle(id: string) {
    onChange(picked.has(id) ? yearIds.filter((y) => y !== id) : [...yearIds, id])
  }

  return (
    <div>
      <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
        <GraduationCap className="size-4 text-ink-muted" />
        Années{" "}
        <span className="font-normal text-ink-muted">({yearIds.length}) · optionnel</span>
      </span>
      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Aucune année dans le programme.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map((y) => (
            <Toggle key={y.id} active={picked.has(y.id)} onClick={() => toggle(y.id)}>
              <span dir="auto">{y.name}</span>
            </Toggle>
          ))}
        </div>
      )}
    </div>
  )
}

/** Display label for a resource — its friendly name, else the PDF file name. */
export function resourceLabel(r: { name?: string; pdf: { name: string } }): string {
  return r.name?.trim() || r.pdf.name || "Document"
}

// Années scolaires moved to the shared module — re-exported so existing
// imports keep working (groups & séances pick from the same list).
export { ACADEMIC_YEARS, DEFAULT_ACADEMIC_YEAR } from "@/data/academicYears"
