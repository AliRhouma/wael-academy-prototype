import { useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Session } from "@/data/types"
import { formatSessionDayLong } from "@/lib/utils"
import { SessionCard } from "@/features/shared/session/SessionCard"
import { SessionFormSheet } from "@/features/admin/sessions/SessionFormSheet"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

const WEEKDAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]

const pad = (n: number) => String(n).padStart(2, "0")
/** Local "YYYY-MM-DD" key for a Date (no timezone drift). */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Admin — a month calendar of the academy's séances, filterable by teacher and by
 * group. Each day cell previews its sessions; picking a day opens that day's full
 * agenda below (the same SessionCard used across the app). Mobile shows count
 * dots instead of chips so the grid stays legible at ~390px.
 */
export default function AdminCalendarScreen() {
  const sessions = useData((s) => s.sessions)
  const teachers = useData((s) => s.teachers)
  const groups = useData((s) => s.groups)
  const removeSession = useData((s) => s.removeSession)
  const { show, toast } = useToast()

  const today = useMemo(() => new Date(), [])
  const todayKey = dateKey(today)

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(todayKey)
  const [teacherFilter, setTeacherFilter] = useState("all")
  const [groupFilter, setGroupFilter] = useState("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)

  function openAddForSelected() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(session: Session) {
    setEditing(session)
    setFormOpen(true)
  }
  function confirmDelete() {
    if (!deleteTarget) return
    removeSession(deleteTarget.id)
    show("Séance supprimée")
    setDeleteTarget(null)
  }

  const sortedTeachers = useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [teachers],
  )
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [groups],
  )

  // Sessions after both filters — drives the grid AND the day agenda.
  const filtered = useMemo(
    () =>
      sessions.filter(
        (s) =>
          (teacherFilter === "all" || s.teacherId === teacherFilter) &&
          (groupFilter === "all" || s.groupIds.includes(groupFilter)),
      ),
    [sessions, teacherFilter, groupFilter],
  )

  // Day → its sessions (sorted by start), keyed by "YYYY-MM-DD".
  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>()
    for (const s of filtered) {
      if (!m.has(s.date)) m.set(s.date, [])
      m.get(s.date)!.push(s)
    }
    for (const list of m.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return m
  }, [filtered])

  // 6-week grid (42 cells) starting on the Monday on/before the 1st.
  const y = cursor.getFullYear()
  const mo = cursor.getMonth()
  const startWeekday = (new Date(y, mo, 1).getDay() + 6) % 7 // Mon = 0
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => new Date(y, mo, 1 - startWeekday + i)),
    [y, mo, startWeekday],
  )

  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  const daySessions = byDay.get(selected) ?? []

  function goMonth(delta: number) {
    setCursor(new Date(y, mo + delta, 1))
  }
  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(todayKey)
  }

  const resetBtn =
    "inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendrier"
        subtitle="L’emploi du temps des séances — filtrez par enseignant et par groupe."
        action={
          <button
            type="button"
            onClick={openAddForSelected}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
          >
            <Plus className="size-4" /> Planifier une séance
          </button>
        }
      />

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
            <UserRound className="size-4 text-ink-muted" /> Enseignant
          </span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
            >
              <option value="all">Tous les enseignants</option>
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

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
            <UsersRound className="size-4 text-ink-muted" /> Groupe
          </span>
          <div className="relative">
            <select
              className={INPUT + " appearance-none pe-10"}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Tous les groupes</option>
              {sortedGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </label>
      </div>

      {/* Calendar card */}
      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        {/* Month toolbar */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Mois précédent"
              className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Mois suivant"
              className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <ChevronRight className="size-5" />
            </button>
            <h2 className="ms-1 font-display text-lg font-bold capitalize text-ink">{monthLabel}</h2>
          </div>
          <button type="button" onClick={goToday} className={resetBtn}>
            Aujourd’hui
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-ink-muted"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const key = dateKey(d)
            const items = byDay.get(key) ?? []
            const inMonth = d.getMonth() === mo
            const isToday = key === todayKey
            const isSelected = key === selected
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={
                  "flex min-h-[52px] flex-col rounded-md border p-1 text-start transition sm:min-h-[104px] sm:p-1.5 " +
                  (isSelected
                    ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200"
                    : "border-transparent hover:border-border hover:bg-surface-muted") +
                  (inMonth ? "" : " opacity-40")
                }
              >
                <span
                  className={
                    "grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-medium tabular-nums " +
                    (isToday
                      ? "bg-danger-500 text-danger-foreground"
                      : isSelected
                        ? "text-brand-700"
                        : "text-ink-subtle")
                  }
                >
                  {d.getDate()}
                </span>

                {items.length > 0 && (
                  <>
                    {/* Desktop: session chips */}
                    <span className="mt-1 hidden min-w-0 flex-col gap-1 sm:flex">
                      {items.slice(0, 2).map((s) => (
                        <span
                          key={s.id}
                          className="truncate rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-brand-700"
                        >
                          <span className="tabular-nums">{s.startTime}</span> {s.title}
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span className="px-1 text-[10px] font-medium text-ink-muted">
                          +{items.length - 2} autre{items.length - 2 > 1 ? "s" : ""}
                        </span>
                      )}
                    </span>

                    {/* Mobile: count dots */}
                    <span className="mt-auto flex items-center gap-0.5 pt-1 sm:hidden">
                      {items.slice(0, 3).map((s) => (
                        <span key={s.id} className="size-1.5 rounded-full bg-brand-500" />
                      ))}
                      {items.length > 3 && (
                        <span className="text-[9px] font-medium text-ink-muted">+</span>
                      )}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day agenda */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold capitalize text-ink">
            {formatSessionDayLong(selected)}
          </h2>
          <button
            type="button"
            onClick={openAddForSelected}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        </div>
        {daySessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface">
            <EmptyState
              icon={CalendarDays}
              title="Aucune séance ce jour"
              description={
                teacherFilter !== "all" || groupFilter !== "all"
                  ? "Aucune séance ne correspond aux filtres pour cette date."
                  : "Cliquez « Ajouter » pour planifier une séance ce jour."
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {daySessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                actions={
                  <OverflowMenu
                    actions={[
                      { label: "Modifier", icon: Pencil, onClick: () => openEdit(s) },
                      {
                        label: "Supprimer",
                        icon: Trash2,
                        tone: "danger",
                        onClick: () => setDeleteTarget(s),
                      },
                    ]}
                  />
                }
              />
            ))}
          </div>
        )}
      </section>

      <SessionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        defaultDate={selected}
        onSaved={show}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cette séance ?"
        description={
          deleteTarget ? `« ${deleteTarget.title} » sera définitivement supprimée.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
