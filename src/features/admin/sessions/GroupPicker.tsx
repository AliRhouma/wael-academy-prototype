import { useMemo, type ReactNode } from "react"
import { useData } from "@/stores/useData"

/** A toggle chip (mirrors the curriculum ScopePicker chip). */
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
 * The "pour quels groupes ?" picker of a séance. Groups are scoped to the picked
 * years (a group's home year must be among them) so the choice stays relevant to
 * the session's level; already-picked groups always stay visible so editing a
 * session never silently drops a member group. Groups with no year always show.
 */
export function GroupPicker({
  yearIds,
  groupIds,
  onChange,
}: {
  yearIds: string[]
  groupIds: string[]
  onChange: (ids: string[]) => void
}) {
  const groups = useData((s) => s.groups)

  const years = useMemo(() => new Set(yearIds), [yearIds])
  const picked = useMemo(() => new Set(groupIds), [groupIds])

  const visible = useMemo(
    () =>
      [...groups]
        .filter((g) => !g.yearId || years.has(g.yearId) || picked.has(g.id))
        .sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [groups, years, picked],
  )

  function toggle(id: string) {
    onChange(picked.has(id) ? groupIds.filter((g) => g !== id) : [...groupIds, id])
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-subtle">
        Groupes <span className="font-normal text-ink-muted">({groupIds.length})</span>
      </span>
      {yearIds.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Choisissez d’abord une ou plusieurs années.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
          Aucun groupe pour ces années. Créez-en un depuis « Groupes ».
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((g) => (
            <Toggle key={g.id} active={picked.has(g.id)} onClick={() => toggle(g.id)}>
              <span dir="auto">{g.title}</span>
            </Toggle>
          ))}
        </div>
      )}
    </div>
  )
}
