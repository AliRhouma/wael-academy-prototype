import { useMemo, useState } from "react"
import { CalendarDays, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Session } from "@/data/types"
import { nowStamp, sessionStamp, formatSessionDayLong } from "@/lib/utils"
import { SessionCard, groupByDay } from "@/features/shared/session/SessionCard"
import { useSessionLabels } from "@/features/shared/session/sessionLabels"
import { SessionFormSheet } from "./SessionFormSheet"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

type TimeFilter = "upcoming" | "past" | "all"

/** Admin — the academy's séances: plan them for groups, subjects and a teacher. */
export default function AdminSessionsScreen() {
  const sessions = useData((s) => s.sessions)
  const removeSession = useData((s) => s.removeSession)
  const { teacherName } = useSessionLabels()
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)

  const counts = useMemo(() => {
    const now = nowStamp()
    let upcoming = 0
    for (const s of sessions) if (sessionStamp(s) >= now) upcoming++
    return { all: sessions.length, upcoming, past: sessions.length - upcoming }
  }, [sessions])

  const rows = useMemo(() => {
    const now = nowStamp()
    const q = query.trim().toLowerCase()
    const filtered = sessions
      .filter((s) => {
        if (timeFilter === "upcoming") return sessionStamp(s) >= now
        if (timeFilter === "past") return sessionStamp(s) < now
        return true
      })
      .filter((s) =>
        q === ""
          ? true
          : s.title.toLowerCase().includes(q) ||
            (s.description?.toLowerCase().includes(q) ?? false) ||
            (teacherName(s.teacherId)?.toLowerCase().includes(q) ?? false),
      )
    // Upcoming reads soonest-first; past reads most-recent-first.
    const days = groupByDay(filtered)
    return timeFilter === "past" ? days.reverse() : days
  }, [sessions, timeFilter, query, teacherName])

  function openAdd() {
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

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Planifier une séance
    </button>
  )

  const filters: { key: TimeFilter; label: string; count: number }[] = [
    { key: "upcoming", label: "À venir", count: counts.upcoming },
    { key: "past", label: "Passées", count: counts.past },
    { key: "all", label: "Toutes", count: counts.all },
  ]

  const isEmpty = sessions.length === 0
  const nothingShown = rows.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Séances"
        subtitle={`${sessions.length} séance${sessions.length > 1 ? "s" : ""} — l’emploi du temps des groupes de l’académie.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={CalendarDays}
            title="Aucune séance"
            description="Planifiez une séance pour un ou plusieurs groupes d’élèves."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
              {filters.map((f) => {
                const active = timeFilter === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTimeFilter(f.key)}
                    className={
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition " +
                      (active
                        ? "border-transparent bg-brand-600 text-ink-inverted"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    {f.label}
                    <span
                      className={
                        "rounded-full px-1.5 text-xs tabular-nums " +
                        (active ? "bg-white/20" : "bg-neutral-100 text-ink-muted")
                      }
                    >
                      {f.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="relative md:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une séance, un enseignant…"
                className={INPUT + " ps-9"}
              />
            </div>
          </div>

          {nothingShown ? (
            <div className="rounded-lg border border-dashed border-border bg-surface">
              <EmptyState
                icon={Search}
                title="Aucune séance"
                description="Aucune séance ne correspond à ce filtre ou à cette recherche."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {rows.map(([day, daySessions]) => (
                <section key={day}>
                  <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                    {formatSessionDayLong(day)}
                  </h2>
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
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <SessionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
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
