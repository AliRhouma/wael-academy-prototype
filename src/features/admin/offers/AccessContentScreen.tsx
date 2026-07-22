import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, ListTree, SlidersHorizontal, Video } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import { formatSessionDay } from "@/lib/utils"
import type { AccessResourceType } from "@/data/types"
import { AccessFormSheet } from "./AccessFormSheet"

/** Singular label of one tree leaf, by its resource kind. */
const LEAF_LABEL: Record<string, string> = {
  cours: "Cours",
  exercice: "Exercice",
  serie: "Série",
  resume: "Résumé",
  quiz: "Quiz",
  quizExam: "Examen de quiz",
  path: "Parcours",
}

interface Leaf {
  id: string
  title: string
  kind: string
}

/** One included/excluded row of the tree — tap anywhere to toggle. */
function LeafRow({
  leaf,
  excluded,
  onToggle,
}: {
  leaf: Leaf
  excluded: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-11 w-full items-center gap-3 px-3 py-1.5 text-start transition hover:bg-surface-muted"
      >
        <span
          className={
            "grid size-5 shrink-0 place-items-center rounded border transition " +
            (excluded
              ? "border-border-strong bg-surface text-transparent"
              : "border-transparent bg-grad text-ink-inverted")
          }
        >
          <Check className="size-3.5" />
        </span>
        <span
          dir="auto"
          className={
            "min-w-0 flex-1 truncate text-sm " +
            (excluded ? "text-ink-muted line-through" : "text-ink")
          }
        >
          {leaf.title}
        </span>
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {LEAF_LABEL[leaf.kind] ?? leaf.kind}
        </span>
      </button>
    </li>
  )
}

/**
 * Admin — the content tree of ONE access: everything its filters expose,
 * structured Niveau → Matière → Chapitre (+ parcours and recorded séances),
 * where each single resource can be unchecked to hide it from the offer.
 * Toggles write `excludedIds` straight to the store.
 */
export default function AdminAccessContentScreen() {
  const { accessId } = useParams()
  const accesses = useData((s) => s.accesses)
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const quizzes = useData((s) => s.quizzes)
  const quizExams = useData((s) => s.quizExams)
  const paths = useData((s) => s.paths)
  const sessions = useData((s) => s.sessions)
  const groups = useData((s) => s.groups)
  const updateAccess = useData((s) => s.updateAccess)
  const { show, toast } = useToast()

  const [filtersOpen, setFiltersOpen] = useState(false)

  const access = accesses.find((a) => a.id === accessId) ?? null

  const groupTitle = useMemo(() => new Map(groups.map((g) => [g.id, g.title])), [groups])

  /** The tree the access filters expose — before exclusions. */
  const tree = useMemo(() => {
    if (!access) return { yearBlocks: [], sessionLeaves: [] as typeof sessions }
    const types = new Set<AccessResourceType>(access.types)
    const wantLesson = (k: string) => types.has(k as AccessResourceType)

    const pickedYears = new Set(access.yearIds)
    const pickedSubjects = new Set(access.subjectIds)
    const pickedChapters = new Set(access.chapterIds)

    const yearBlocks = [...years]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((y) => (pickedYears.size === 0 ? true : pickedYears.has(y.id)))
      .map((year) => {
        const subjectBlocks = subjects
          .filter((s) => s.yearId === year.id)
          .filter((s) => (pickedSubjects.size === 0 ? true : pickedSubjects.has(s.id)))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((subject) => {
            const chapterBlocks = chapters
              .filter((c) => c.subjectIds.includes(subject.id) && c.yearIds.includes(year.id))
              .filter((c) => (pickedChapters.size === 0 ? true : pickedChapters.has(c.id)))
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((chapter) => {
                const leaves: Leaf[] = [
                  ...lessons
                    .filter((l) => l.chapterId === chapter.id && wantLesson(l.kind))
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((l) => ({ id: l.id, title: l.title, kind: l.kind })),
                  ...(types.has("quiz")
                    ? quizzes
                        .filter((q) => q.chapterId === chapter.id)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((q) => ({ id: q.id, title: q.title, kind: "quiz" }))
                    : []),
                  ...(types.has("quizExam")
                    ? quizExams
                        .filter((e) => e.chapterId === chapter.id)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((e) => ({ id: e.id, title: e.title, kind: "quizExam" }))
                    : []),
                ]
                return { chapter, leaves }
              })
              .filter((cb) => cb.leaves.length > 0)

            const pathLeaves: Leaf[] = types.has("path")
              ? paths
                  .filter((p) => p.subjectId === subject.id && p.yearId === year.id)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((p) => ({ id: p.id, title: p.title, kind: "path" }))
              : []

            return { subject, chapterBlocks, pathLeaves }
          })
          .filter((sb) => sb.chapterBlocks.length > 0 || sb.pathLeaves.length > 0)

        return { year, subjectBlocks }
      })
      .filter((yb) => yb.subjectBlocks.length > 0)

    const sessionLeaves = types.has("recordedSession")
      ? sessions
          .filter((s) =>
            access.academicYears.length === 0 ? true : access.academicYears.includes(s.academicYear),
          )
          .filter((s) =>
            access.groupIds.length === 0
              ? true
              : s.groupIds.some((gid) => access.groupIds.includes(gid)),
          )
          .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime))
      : []

    return { yearBlocks, sessionLeaves }
  }, [access, years, subjects, chapters, lessons, quizzes, quizExams, paths, sessions])

  if (!access) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={KeyRound}
          title="Accès introuvable"
          description="Cette règle d’accès n’existe plus."
          action={
            <Link
              to="/admin/offers/access"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" /> Retour aux accès
            </Link>
          }
        />
      </div>
    )
  }

  const excluded = new Set(access.excludedIds)
  const contentLeafIds = tree.yearBlocks.flatMap((yb) =>
    yb.subjectBlocks.flatMap((sb) => [
      ...sb.chapterBlocks.flatMap((cb) => cb.leaves.map((l) => l.id)),
      ...sb.pathLeaves.map((l) => l.id),
    ]),
  )
  const allIds = [...contentLeafIds, ...tree.sessionLeaves.map((s) => s.id)]
  const hiddenCount = allIds.filter((id) => excluded.has(id)).length
  const isEmpty = allIds.length === 0

  function toggle(id: string) {
    if (!access) return
    const next = excluded.has(id)
      ? access.excludedIds.filter((x) => x !== id)
      : [...access.excludedIds, id]
    updateAccess(access.id, { excludedIds: next })
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/admin/offers/access"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-subtle transition hover:text-brand-600"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> Accès
      </Link>

      <PageHeader
        title={access.name}
        subtitle={
          isEmpty
            ? "Aucune ressource ne correspond aux filtres de cet accès."
            : `${allIds.length} ressource${allIds.length > 1 ? "s" : ""} dans le périmètre · ${
                hiddenCount > 0 ? `${hiddenCount} masquée${hiddenCount > 1 ? "s" : ""}` : "aucune masquée"
              } — décochez pour masquer.`
        }
        action={
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-10"
          >
            <SlidersHorizontal className="size-4" /> Modifier les filtres
          </button>
        }
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={ListTree}
            title="Périmètre vide"
            description="Élargissez les filtres (types, niveaux, matières…) pour voir des ressources ici."
          />
        </div>
      ) : (
        <>
          {/* -------- Syllabus content: Niveau → Matière → Chapitre -------- */}
          {tree.yearBlocks.map(({ year, subjectBlocks }) => (
            <section key={year.id}>
              <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                {year.name}
              </h2>
              <div className="grid gap-3">
                {subjectBlocks.map(({ subject, chapterBlocks, pathLeaves }) => (
                  <div
                    key={subject.id}
                    className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
                  >
                    <p
                      dir="auto"
                      className="border-b border-border bg-surface-muted px-4 py-2.5 font-display text-[14px] font-bold text-ink"
                    >
                      {subject.name}
                    </p>
                    <div className="divide-y divide-border">
                      {chapterBlocks.map(({ chapter, leaves }) => {
                        const shown = leaves.filter((l) => !excluded.has(l.id)).length
                        return (
                          <div key={chapter.id} className="py-1.5">
                            <p className="flex items-center justify-between px-3 py-1.5">
                              <span dir="auto" className="text-[13px] font-medium text-ink-subtle">
                                {chapter.name}
                              </span>
                              <span className="text-[11px] tabular-nums text-ink-muted">
                                {shown}/{leaves.length}
                              </span>
                            </p>
                            <ul>
                              {leaves.map((leaf) => (
                                <LeafRow
                                  key={leaf.id}
                                  leaf={leaf}
                                  excluded={excluded.has(leaf.id)}
                                  onToggle={() => toggle(leaf.id)}
                                />
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                      {pathLeaves.length > 0 && (
                        <div className="py-1.5">
                          <p className="px-3 py-1.5 text-[13px] font-medium text-ink-subtle">
                            Parcours
                          </p>
                          <ul>
                            {pathLeaves.map((leaf) => (
                              <LeafRow
                                key={leaf.id}
                                leaf={leaf}
                                excluded={excluded.has(leaf.id)}
                                onToggle={() => toggle(leaf.id)}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* -------- Recorded séances -------- */}
          {tree.sessionLeaves.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                <Video className="size-3.5" /> Séances enregistrées
              </h2>
              <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                <ul className="divide-y divide-border">
                  {tree.sessionLeaves.map((s) => {
                    const isOut = excluded.has(s.id)
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => toggle(s.id)}
                          className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-start transition hover:bg-surface-muted"
                        >
                          <span
                            className={
                              "grid size-5 shrink-0 place-items-center rounded border transition " +
                              (isOut
                                ? "border-border-strong bg-surface text-transparent"
                                : "border-transparent bg-grad text-ink-inverted")
                            }
                          >
                            <Check className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              dir="auto"
                              className={
                                "block truncate text-sm " +
                                (isOut ? "text-ink-muted line-through" : "text-ink")
                              }
                            >
                              {s.title}
                            </span>
                            <span className="block truncate text-[12px] text-ink-muted">
                              <span className="capitalize">{formatSessionDay(s.date)}</span> ·{" "}
                              <span className="tabular-nums">{s.startTime}</span> ·{" "}
                              <span className="tabular-nums">{s.academicYear}</span>
                              {s.groupIds.length > 0 && (
                                <> · {s.groupIds.map((g) => groupTitle.get(g) ?? "—").join(", ")}</>
                              )}
                            </span>
                          </span>
                          {isOut ? (
                            <EyeOff className="size-4 shrink-0 text-ink-muted" />
                          ) : (
                            <Eye className="size-4 shrink-0 text-ink-muted" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      <AccessFormSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        editing={access}
        onSaved={(_, message) => show(message)}
      />

      {toast}
    </div>
  )
}
