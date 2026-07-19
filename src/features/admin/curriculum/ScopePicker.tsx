import { useMemo, type ReactNode } from "react"
import { useData } from "@/stores/useData"

/** A toggle chip used for picking years / subjects. */
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

export interface ScopePickerProps {
  yearIds: string[]
  subjectIds: string[]
  onYearsChange: (ids: string[]) => void
  onSubjectsChange: (ids: string[]) => void
}

/**
 * The shared "où est-ce enseigné ?" picker used by chapters AND exams: an
 * Années chip multi-select, then a Matières picker scoped to the picked years
 * (grouped by year so the same-named subject across years stays distinct).
 * Deselecting a year drops its subjects so the links never go inconsistent.
 */
export function ScopePicker({ yearIds, subjectIds, onYearsChange, onSubjectsChange }: ScopePickerProps) {
  const years = useData((s) => s.years)
  const allSubjects = useData((s) => s.subjects)

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const subjectsByYear = useMemo(() => {
    const m = new Map<string, typeof allSubjects>()
    for (const s of [...allSubjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
      if (!m.has(s.yearId)) m.set(s.yearId, [])
      m.get(s.yearId)!.push(s)
    }
    return m
  }, [allSubjects])

  function toggleYear(id: string) {
    if (yearIds.includes(id)) {
      const drop = new Set((subjectsByYear.get(id) ?? []).map((s) => s.id))
      onSubjectsChange(subjectIds.filter((sid) => !drop.has(sid)))
      onYearsChange(yearIds.filter((y) => y !== id))
    } else {
      onYearsChange([...yearIds, id])
    }
  }

  function toggleSubject(id: string) {
    onSubjectsChange(
      subjectIds.includes(id) ? subjectIds.filter((s) => s !== id) : [...subjectIds, id],
    )
  }

  return (
    <>
      <div>
        <span className="mb-2 block text-sm font-medium text-ink-subtle">
          Années <span className="font-normal text-ink-muted">({yearIds.length})</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {sortedYears.map((y) => (
            <Toggle key={y.id} active={yearIds.includes(y.id)} onClick={() => toggleYear(y.id)}>
              <span dir="auto">{y.name}</span>
            </Toggle>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-ink-subtle">
          Matières <span className="font-normal text-ink-muted">({subjectIds.length})</span>
        </span>
        {yearIds.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
            Choisissez d’abord une ou plusieurs années.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedYears
              .filter((y) => yearIds.includes(y.id))
              .map((y) => (
                <div key={y.id}>
                  <p
                    dir="auto"
                    className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted"
                  >
                    {y.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(subjectsByYear.get(y.id) ?? []).map((s) => (
                      <Toggle
                        key={s.id}
                        active={subjectIds.includes(s.id)}
                        onClick={() => toggleSubject(s.id)}
                      >
                        <span dir="auto">{s.name}</span>
                      </Toggle>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}
