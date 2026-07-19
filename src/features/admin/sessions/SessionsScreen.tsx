import { useMemo, useState } from "react"
import { CalendarDays, ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Session } from "@/data/types"
import { nowStamp, sessionStamp, formatSessionDayLong } from "@/lib/utils"
import { SessionCard, groupByDay } from "@/features/shared/session/SessionCard"
import { useSessionLabels } from "@/features/shared/session/sessionLabels"
import { ScopePicker } from "@/features/admin/curriculum/ScopePicker"
import { GroupPicker } from "./GroupPicker"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

type TimeFilter = "upcoming" | "past" | "all"

/** Admin — the academy's séances: plan them for groups, subjects and a teacher. */
export default function AdminSessionsScreen() {
  const sessions = useData((s) => s.sessions)
  const teachers = useData((s) => s.teachers)
  const addSession = useData((s) => s.addSession)
  const updateSession = useData((s) => s.updateSession)
  const removeSession = useData((s) => s.removeSession)
  const { teacherName } = useSessionLabels()
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)

  const sortedTeachers = useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [teachers],
  )

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
    setTitle("")
    setDescription("")
    setDate("")
    setStartTime("")
    setEndTime("")
    setTeacherId("")
    setYearIds([])
    setSubjectIds([])
    setGroupIds([])
    setFormOpen(true)
  }

  function openEdit(session: Session) {
    setEditing(session)
    setTitle(session.title)
    setDescription(session.description ?? "")
    setDate(session.date)
    setStartTime(session.startTime)
    setEndTime(session.endTime)
    setTeacherId(session.teacherId ?? "")
    setYearIds(session.yearIds)
    setSubjectIds(session.subjectIds)
    setGroupIds(session.groupIds)
    setFormOpen(true)
  }

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
      show("Séance modifiée")
    } else {
      addSession(patch)
      show("Séance planifiée")
    }
    setFormOpen(false)
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

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier la séance" : "Nouvelle séance"}
        description={
          editing ? undefined : "Un créneau pour un ou plusieurs groupes, avec sa matière et son enseignant."
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
          onYearsChange={(ids) => {
            setYearIds(ids)
            // A group whose year is no longer selected drops off the session too.
          }}
          onSubjectsChange={setSubjectIds}
        />

        <GroupPicker yearIds={yearIds} groupIds={groupIds} onChange={setGroupIds} />
      </FormSheet>

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
