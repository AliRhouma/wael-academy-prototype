import { useId, useMemo, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { LibraryBig, Search, SearchX, TvMinimalPlay, X, type LucideIcon } from "lucide-react"
import { studentV2Nav } from "@/app/nav/studentV2"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import { BASE, dayLabel, frenchName, useLookups } from "../lib"
import { sfx } from "../sound"

interface Hit {
  id: string
  group: "صفحات" | "مواد" | "حصص"
  label: string
  hint?: string
  to: string
  icon: LucideIcon
}

/** Lowercase, no French accents, no Arabic short vowels/shadda/tatweel. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
}

const MAX_PER_GROUP = 4

/**
 * « ابحث الآن » — one box over the three things an élève looks for: a page,
 * a matière (by its Arabic OR French name) and a séance (by its title). Results
 * open under the pill; arrows move, Enter opens, Escape closes. Nothing is
 * fetched — it filters the store as you type.
 */
export function SearchBox({ className }: { className?: string }) {
  const navigate = useNavigate()
  const listId = useId()
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const sessions = useMySessions()
  const { subjectOf } = useLookups()

  const hits = useMemo<Hit[]>(() => {
    const needle = norm(q.trim())
    if (!needle) return []
    const years = new Set(user?.yearIds ?? [])

    const pages: Hit[] = studentV2Nav
      .filter((n) => norm(n.label).includes(needle))
      .map((n) => ({ id: `p-${n.path}`, group: "صفحات", label: n.label, to: n.path, icon: n.icon }))

    const mats: Hit[] = subjects
      .filter((s) => years.has(s.yearId))
      .filter((s) => norm(s.name).includes(needle) || norm(frenchName(s.name)).includes(needle))
      .map((s) => ({
        id: `s-${s.id}`,
        group: "مواد",
        label: s.name,
        hint: frenchName(s.name),
        to: `${BASE}/matieres`,
        icon: LibraryBig,
      }))

    const seances: Hit[] = sessions
      .filter((s) => norm(s.title).includes(needle) || norm(subjectOf(s)?.name ?? "").includes(needle))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => ({
        id: `x-${s.id}`,
        group: "حصص",
        label: s.title,
        hint: `${subjectOf(s)?.name ?? ""} · ${dayLabel(s.date)}`,
        to: `${BASE}/seance/${s.id}`,
        icon: TvMinimalPlay,
      }))

    return [...pages.slice(0, MAX_PER_GROUP), ...mats.slice(0, MAX_PER_GROUP), ...seances.slice(0, MAX_PER_GROUP)]
  }, [q, user, subjects, sessions, subjectOf])

  const go = (hit: Hit | undefined) => {
    if (!hit) return
    setOpen(false)
    setQ("")
    navigate(hit.to)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, hits.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      // Enter isn't a click, so the binding can't hear it — say it here.
      sfx(hits[active] ? "select" : "error")
      go(hits[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const showList = open && q.trim().length > 0

  return (
    <div className={cn("relative", className)}>
      <label
        className={cn(
          "flex h-12 items-center gap-3 rounded-full border bg-v2-surface pe-3 ps-5 transition md:h-14 2xl:h-16 2xl:ps-7",
          showList ? "border-v2-brand/50 shadow-lg shadow-v2-ink/5" : "border-transparent hover:border-v2-ink/15",
        )}
      >
        <input
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          value={q}
          placeholder="ابحث الآن"
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-[calc(10px*var(--ts))] text-v2-ink outline-none placeholder:text-v2-ink/45 [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            aria-label="امسح"
            onMouseDown={(e) => e.preventDefault()}
            data-uisfx="delete"
            onClick={() => setQ("")}
            className="grid size-9 place-items-center rounded-full text-v2-ink/50 transition hover:bg-v2-ink/5 hover:text-v2-ink"
          >
            <X className="size-4" />
          </button>
        ) : (
          <Search className="me-1.5 size-5 shrink-0 text-v2-ink" strokeWidth={1.75} />
        )}
      </label>

      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto rounded-3xl border border-v2-ink/15 bg-v2-surface p-2 shadow-xl shadow-v2-ink/10"
        >
          {hits.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <SearchX className="size-8 stroke-v2-grad" strokeWidth={1.5} />
              <p className="text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">ما لقينا شي لـ « {q.trim()} »</p>
              <p className="text-[calc(8px*var(--ts))] text-v2-ink/55">جرّب إسم مادّة، ولّا عنوان حصّة بالفرنسي.</p>
            </div>
          ) : (
            hits.map((hit, i) => {
              const Icon = hit.icon
              const first = i === 0 || hits[i - 1].group !== hit.group
              return (
                <div key={hit.id}>
                  {first && (
                    <p className="px-3 pb-1 pt-2 text-[calc(7.5px*var(--ts))] font-semibold text-v2-ink/45">{hit.group}</p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    data-uisfx="select"
                    onClick={() => go(hit)}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-start transition",
                      i === active ? "bg-v2-brand/10" : "hover:bg-v2-ink/[0.04]",
                    )}
                  >
                    <Icon className="size-5 shrink-0 stroke-v2-grad" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">{hit.label}</span>
                      {hit.hint && (
                        <span className="block truncate text-[calc(7.5px*var(--ts))] text-v2-ink/55">{hit.hint}</span>
                      )}
                    </span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
