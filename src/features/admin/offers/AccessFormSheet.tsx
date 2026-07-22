import { useEffect, useMemo, useState, type ReactNode } from "react"
import { GraduationCap, UsersRound } from "lucide-react"
import { FormSheet } from "@/components/kit/FormSheet"
import { useData } from "@/stores/useData"
import { ACADEMIC_YEARS } from "@/data/academicYears"
import type { Access, AccessResourceType } from "@/data/types"
import { TYPE_LABEL, TYPE_ORDER } from "./accessMeta"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/** A toggle chip — same recipe as the live-session pickers. */
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

/** Muted helper line under a picker — explains the "vide = tous" convention. */
function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[12px] text-ink-muted">{children}</p>
}

export interface AccessFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The access being edited, or null to create a new one. */
  editing: Access | null
  /** Called after a successful save with the stored access + toast message. */
  onSaved: (access: Access, message: string) => void
}

/**
 * Create/edit form for an access rule — the filters, in the flow's order:
 * name & description, resource types, then (for syllabus content) niveaux →
 * matières → chapitres, and (for recorded séances) années scolaires → groupes.
 * The scoped pickers appear only when a type that needs them is selected, and
 * an empty selection means "tout". Fine-grained exclusions live on the access
 * content page, not here.
 */
export function AccessFormSheet({ open, onOpenChange, editing, onSaved }: AccessFormSheetProps) {
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  const groups = useData((s) => s.groups)
  const addAccess = useData((s) => s.addAccess)
  const updateAccess = useData((s) => s.updateAccess)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [types, setTypes] = useState<AccessResourceType[]>([])
  const [yearIds, setYearIds] = useState<string[]>([])
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [chapterIds, setChapterIds] = useState<string[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])

  // Seed the fields each time the sheet opens.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setDescription(editing.description ?? "")
      setTypes(editing.types)
      setYearIds(editing.yearIds)
      setSubjectIds(editing.subjectIds)
      setChapterIds(editing.chapterIds)
      setAcademicYears(editing.academicYears)
      setGroupIds(editing.groupIds)
    } else {
      setName("")
      setDescription("")
      setTypes([])
      setYearIds([])
      setSubjectIds([])
      setChapterIds([])
      setAcademicYears([])
      setGroupIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [groups],
  )

  const wantsContent = types.some((t) => t !== "recordedSession")
  const wantsSessions = types.includes("recordedSession")

  /** Matières of the selected niveaux, grouped per year for display. */
  const subjectGroups = useMemo(() => {
    const picked = new Set(yearIds)
    return sortedYears
      .filter((y) => picked.has(y.id))
      .map((y) => ({
        year: y,
        subjects: subjects
          .filter((s) => s.yearId === y.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      }))
      .filter((g) => g.subjects.length > 0)
  }, [sortedYears, subjects, yearIds])

  /** Chapitres of the selected matières, grouped per subject for display. */
  const chapterGroups = useMemo(() => {
    const picked = new Set(subjectIds)
    return subjectGroups
      .flatMap((g) => g.subjects)
      .filter((s) => picked.has(s.id))
      .map((s) => ({
        subject: s,
        chapters: chapters
          .filter((c) => c.subjectIds.includes(s.id))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      }))
      .filter((g) => g.chapters.length > 0)
  }, [subjectGroups, subjectIds, chapters])

  function toggleIn(list: string[], set: (v: string[]) => void, id: string) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function toggleType(t: AccessResourceType) {
    setTypes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))
  }

  /** Deselecting a niveau also drops its matières (and their chapitres). */
  function toggleYear(id: string) {
    const next = yearIds.includes(id) ? yearIds.filter((y) => y !== id) : [...yearIds, id]
    setYearIds(next)
    if (!next.includes(id)) {
      const dead = new Set(subjects.filter((s) => s.yearId === id).map((s) => s.id))
      setSubjectIds((ids) => ids.filter((sid) => !dead.has(sid)))
      setChapterIds((ids) =>
        ids.filter((cid) => {
          const ch = chapters.find((c) => c.id === cid)
          return ch ? !ch.subjectIds.every((sid) => dead.has(sid)) : false
        }),
      )
    }
  }

  /** Deselecting a matière also drops the chapitres picked under it. */
  function toggleSubject(id: string) {
    const next = subjectIds.includes(id) ? subjectIds.filter((s) => s !== id) : [...subjectIds, id]
    setSubjectIds(next)
    if (!next.includes(id)) {
      setChapterIds((ids) =>
        ids.filter((cid) => {
          const ch = chapters.find((c) => c.id === cid)
          return ch ? ch.subjectIds.some((sid) => next.includes(sid)) : false
        }),
      )
    }
  }

  const canSubmit = name.trim() !== "" && types.length > 0

  function submit() {
    if (!canSubmit) return
    const patch = {
      name: name.trim(),
      description: description.trim() || undefined,
      types: TYPE_ORDER.filter((t) => types.includes(t)),
      // Scopes that no selected type consumes are cleared, not silently kept.
      yearIds: wantsContent ? yearIds : [],
      subjectIds: wantsContent ? subjectIds : [],
      chapterIds: wantsContent ? chapterIds : [],
      academicYears: wantsSessions ? academicYears : [],
      groupIds: wantsSessions ? groupIds : [],
    }
    if (editing) {
      updateAccess(editing.id, patch)
      onSaved({ ...editing, ...patch }, "Accès modifié")
    } else {
      const access = addAccess({ ...patch, excludedIds: [] })
      onSaved(access, "Accès créé")
    }
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Modifier l’accès" : "Nouvel accès"}
      description={
        editing
          ? undefined
          : "Ce que les élèves d’une offre peuvent voir : types de ressources, puis leur périmètre."
      }
      submitLabel={editing ? "Enregistrer" : "Créer l’accès"}
      onSubmit={submit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de l’accès</span>
        <input
          className={INPUT + " text-start"}
          dir="auto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Contenu complet — Bac Maths"
          autoFocus
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
          Description <span className="font-normal text-ink-muted">(optionnel)</span>
        </span>
        <textarea
          className={INPUT.replace("h-11", "min-h-[72px]") + " resize-y py-2.5 text-start"}
          dir="auto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ce que cet accès donne à voir…"
          rows={2}
        />
      </label>

      {/* 1 — the resource types. */}
      <div>
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-ink-subtle">
          <span>
            Types de ressources <span className="font-normal text-ink-muted">({types.length})</span>
          </span>
          <button
            type="button"
            onClick={() => setTypes(types.length === TYPE_ORDER.length ? [] : [...TYPE_ORDER])}
            className="text-[12px] font-medium text-brand-600 hover:underline"
          >
            {types.length === TYPE_ORDER.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </span>
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.map((t) => (
            <Toggle key={t} active={types.includes(t)} onClick={() => toggleType(t)}>
              {TYPE_LABEL[t]}
            </Toggle>
          ))}
        </div>
        {types.length === 0 && <Hint>Choisissez au moins un type de ressources.</Hint>}
      </div>

      {/* 2 — syllabus scope: niveaux → matières → chapitres. */}
      {wantsContent && (
        <>
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
              <GraduationCap className="size-4 text-ink-muted" />
              Niveaux <span className="font-normal text-ink-muted">({yearIds.length})</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sortedYears.map((y) => (
                <Toggle key={y.id} active={yearIds.includes(y.id)} onClick={() => toggleYear(y.id)}>
                  <span dir="auto">{y.name}</span>
                </Toggle>
              ))}
            </div>
            {yearIds.length === 0 && <Hint>Aucun niveau sélectionné = tous les niveaux.</Hint>}
          </div>

          {yearIds.length > 0 && (
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-subtle">
                Matières <span className="font-normal text-ink-muted">({subjectIds.length})</span>
              </span>
              <div className="max-h-64 space-y-3 overflow-y-auto scroll-touch rounded-md border border-border bg-surface-muted/40 p-3">
                {subjectGroups.map(({ year, subjects: subs }) => (
                  <div key={year.id}>
                    <p
                      dir="auto"
                      className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted"
                    >
                      {year.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subs.map((s) => (
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
              {subjectIds.length === 0 && (
                <Hint>Aucune matière sélectionnée = toutes les matières de ces niveaux.</Hint>
              )}
            </div>
          )}

          {subjectIds.length > 0 && (
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-subtle">
                Chapitres <span className="font-normal text-ink-muted">({chapterIds.length})</span>
              </span>
              <div className="max-h-64 space-y-3 overflow-y-auto scroll-touch rounded-md border border-border bg-surface-muted/40 p-3">
                {chapterGroups.map(({ subject, chapters: chs }) => (
                  <div key={subject.id}>
                    <p
                      dir="auto"
                      className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-ink-muted"
                    >
                      {subject.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chs.map((c) => (
                        <Toggle
                          key={c.id}
                          active={chapterIds.includes(c.id)}
                          onClick={() => toggleIn(chapterIds, setChapterIds, c.id)}
                        >
                          <span dir="auto">{c.name}</span>
                        </Toggle>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {chapterIds.length === 0 && (
                <Hint>Aucun chapitre sélectionné = tous les chapitres de ces matières.</Hint>
              )}
            </div>
          )}
        </>
      )}

      {/* 3 — recorded-séances scope: années scolaires → groupes. */}
      {wantsSessions && (
        <>
          <div>
            <span className="mb-2 block text-sm font-medium text-ink-subtle">
              Années scolaires{" "}
              <span className="font-normal text-ink-muted">({academicYears.length}) · séances enregistrées</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {ACADEMIC_YEARS.map((y) => (
                <Toggle
                  key={y}
                  active={academicYears.includes(y)}
                  onClick={() => toggleIn(academicYears, setAcademicYears, y)}
                >
                  <span className="tabular-nums">{y}</span>
                </Toggle>
              ))}
            </div>
            {academicYears.length === 0 && (
              <Hint>Aucune année scolaire sélectionnée = toutes.</Hint>
            )}
          </div>

          <div>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
              <UsersRound className="size-4 text-ink-muted" />
              Groupes <span className="font-normal text-ink-muted">({groupIds.length})</span>
            </span>
            {sortedGroups.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
                Aucun groupe pour le moment. Créez-en un depuis « Groupes ».
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedGroups.map((g) => (
                  <Toggle
                    key={g.id}
                    active={groupIds.includes(g.id)}
                    onClick={() => toggleIn(groupIds, setGroupIds, g.id)}
                  >
                    <span dir="auto">{g.title}</span>
                  </Toggle>
                ))}
              </div>
            )}
            {groupIds.length === 0 && sortedGroups.length > 0 && (
              <Hint>Aucun groupe sélectionné = tous les groupes.</Hint>
            )}
          </div>
        </>
      )}
    </FormSheet>
  )
}
