import { useMemo, useState } from "react"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  Radio,
  Search,
  Tag,
  Trash2,
  UsersRound,
} from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { LiveSession } from "@/data/types"
import { formatSessionDay, sessionStamp } from "@/lib/utils"
import { resourceLabel } from "./LiveSessionPickers"
import { LiveSessionFormSheet } from "./LiveSessionFormSheet"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** A muted pill used for a group or a course reference on the card. */
const REF_CHIP =
  "inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[12px] font-medium text-ink-subtle"

/** Admin — sessions en direct: named join links tied to matières, groups & docs. */
export default function AdminLiveSessionsScreen() {
  const liveSessions = useData((s) => s.liveSessions)
  const subjects = useData((s) => s.subjects)
  const years = useData((s) => s.years)
  const groups = useData((s) => s.groups)
  const offers = useData((s) => s.offers)
  const resources = useData((s) => s.resources)
  const removeLiveSession = useData((s) => s.removeLiveSession)
  const { show, toast } = useToast()

  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LiveSession | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LiveSession | null>(null)

  const yearName = useMemo(() => new Map(years.map((y) => [y.id, y.name])), [years])
  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects])
  const groupTitle = useMemo(() => new Map(groups.map((g) => [g.id, g.title])), [groups])
  const offerName = useMemo(() => new Map(offers.map((o) => [o.id, o.name])), [offers])
  const resourceById = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return liveSessions
      .filter((ls) =>
        q === ""
          ? true
          : ls.name.toLowerCase().includes(q) ||
            ls.academicYear.toLowerCase().includes(q) ||
            ls.subjectIds.some((id) => subjectById.get(id)?.name.toLowerCase().includes(q)) ||
            ls.groupIds.some((id) => groupTitle.get(id)?.toLowerCase().includes(q)),
      )
      // Soonest scheduled first.
      .sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))
  }, [liveSessions, query, subjectById, groupTitle])

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(ls: LiveSession) {
    setEditing(ls)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeLiveSession(deleteTarget.id)
    show("Session supprimée")
    setDeleteTarget(null)
  }

  function openResource(id: string) {
    const r = resourceById.get(id)
    if (r?.pdf.url) window.open(r.pdf.url, "_blank", "noopener,noreferrer")
    else show("Aperçu du document — bientôt")
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Nouvelle session
    </button>
  )

  const isEmpty = liveSessions.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sessions en direct"
        subtitle={`${liveSessions.length} session${liveSessions.length > 1 ? "s" : ""} — des liens de visioconférence pour vos élèves.`}
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Radio}
            title="Aucune session en direct"
            description="Créez une session : un nom, un lien de visioconférence et sa ou ses matières."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une session, une matière…"
              className={INPUT + " ps-9"}
            />
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface">
              <EmptyState
                icon={Search}
                title="Aucun résultat"
                description="Aucune session ne correspond à cette recherche."
              />
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {rows.map((ls) => {
                const sessionResources = ls.resourceIds
                  .map((id) => resourceById.get(id))
                  .filter((r): r is NonNullable<typeof r> => r != null)
                return (
                  <div
                    key={ls.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="relative mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-grad text-ink-inverted shadow-brand">
                        <Radio className="size-5" />
                        <span className="absolute -end-0.5 -top-0.5 flex size-2.5">
                          <span className="absolute inline-flex size-full rounded-full bg-danger-500 opacity-75 motion-safe:animate-ping" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-danger-500 ring-2 ring-surface" />
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p dir="auto" className="font-display text-[15px] font-bold text-ink">
                          {ls.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {ls.subjectIds.map((id) => {
                            const sub = subjectById.get(id)
                            if (!sub) return null
                            return (
                              <Badge key={id} tone="brand" title={yearName.get(sub.yearId) ?? undefined}>
                                <span dir="auto">{sub.name}</span>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      <OverflowMenu
                        actions={[
                          { label: "Modifier", icon: Pencil, onClick: () => openEdit(ls) },
                          {
                            label: "Supprimer",
                            icon: Trash2,
                            tone: "danger",
                            onClick: () => setDeleteTarget(ls),
                          },
                        ]}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y border-border/70 py-2 text-[13px] text-ink-subtle">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-ink-muted" />
                        <span className="capitalize">{formatSessionDay(ls.date)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Clock className="size-4 text-ink-muted" />
                        {ls.startTime}
                      </span>
                      <Badge tone="warning" className="ms-auto tabular-nums">
                        {ls.academicYear}
                      </Badge>
                    </div>

                    {ls.offerId && (
                      <div>
                        <Badge tone="info">
                          <Tag className="size-3.5" />
                          <span dir="auto">{offerName.get(ls.offerId) ?? "Offre"}</span>
                        </Badge>
                      </div>
                    )}

                    {(ls.groupIds.length > 0 || ls.yearIds.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {ls.groupIds.map((id) => (
                          <span key={id} className={REF_CHIP}>
                            <UsersRound className="size-3.5 text-ink-muted" />
                            <span dir="auto">{groupTitle.get(id) ?? "—"}</span>
                          </span>
                        ))}
                        {ls.yearIds.map((id) => (
                          <span key={id} className={REF_CHIP}>
                            <GraduationCap className="size-3.5 text-ink-muted" />
                            <span dir="auto">{yearName.get(id) ?? "—"}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {sessionResources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sessionResources.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => openResource(r.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[12px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
                          >
                            <FileText className="size-3.5 text-danger-500" />
                            <span dir="auto" className="max-w-[12rem] truncate">
                              {resourceLabel(r)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <a
                      href={ls.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
                    >
                      <ExternalLink className="size-4" /> Ouvrir le lien
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <LiveSessionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={show}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer cette session ?"
        description={
          deleteTarget ? `« ${deleteTarget.name} » sera définitivement supprimée.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
