import { useMemo, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Avatar } from "@/components/kit/Avatar"
import { useData } from "@/stores/useData"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/**
 * Roster editor for a group: the academy's students (student-role users) as a
 * searchable, year-filterable checklist. Defaults the year filter to the group's
 * home year so the common case (pick from one level) is one glance. Selected
 * students bubble to the top so a full roster stays readable.
 */
export function MemberPicker({
  studentIds,
  onChange,
  defaultYearId,
}: {
  studentIds: string[]
  onChange: (ids: string[]) => void
  defaultYearId?: string
}) {
  const users = useData((s) => s.users)
  const years = useData((s) => s.years)

  const [query, setQuery] = useState("")
  const [yearFilter, setYearFilter] = useState<string>(defaultYearId ?? "all")

  const yearName = useMemo(() => new Map(years.map((y) => [y.id, y.name])), [years])
  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  const students = useMemo(
    () =>
      users
        .filter((u) => u.role === "student")
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [users],
  )

  const selected = useMemo(() => new Set(studentIds), [studentIds])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .filter((u) => (yearFilter === "all" ? true : u.yearId === yearFilter))
      .filter((u) => (q === "" ? true : u.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        // Selected first, then alphabetical (already name-sorted from `students`).
        const sa = selected.has(a.id) ? 0 : 1
        const sb = selected.has(b.id) ? 0 : 1
        return sa - sb
      })
  }, [students, yearFilter, query, selected])

  function toggle(id: string) {
    onChange(selected.has(id) ? studentIds.filter((s) => s !== id) : [...studentIds, id])
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-subtle">
        Élèves <span className="font-normal text-ink-muted">({studentIds.length})</span>
      </span>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un élève…"
            className={INPUT + " ps-9"}
          />
        </div>
        <div className="relative sm:w-48">
          <select
            className={INPUT + " appearance-none pe-10"}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">Toutes les années</option>
            {sortedYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      </div>

      <div className="mt-2 max-h-64 overflow-y-auto scroll-touch rounded-md border border-border">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-muted">Aucun élève trouvé.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((u) => {
              const on = selected.has(u.id)
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => toggle(u.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-surface-muted"
                  >
                    <Avatar name={u.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span dir="auto" className="block truncate text-sm font-medium text-ink">
                        {u.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-muted">
                        {u.yearId ? yearName.get(u.yearId) ?? "—" : "—"}
                      </span>
                    </span>
                    <span
                      className={
                        "grid size-5 shrink-0 place-items-center rounded-full border transition " +
                        (on
                          ? "border-transparent bg-grad text-ink-inverted"
                          : "border-border-strong bg-surface text-transparent")
                      }
                    >
                      <Check className="size-3.5" />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
