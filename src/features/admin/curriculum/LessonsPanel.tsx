import { useMemo, useState } from "react"
import { BookOpen, FileText, Pencil, Plus, Trash2, Video, X } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Chapter, Lesson, LessonKind, ResourceLink } from "@/data/types"
import { LESSON_KINDS, LESSON_KIND_ORDER } from "./content"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

const CHIP =
  "inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted px-2 py-1 text-[12px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"

type KindFilter = LessonKind | "all"

/** The "Contenus" tab of a chapter — its cours, exercices, séries & résumés. */
export function LessonsPanel({ chapter }: { chapter: Chapter }) {
  const allLessons = useData((s) => s.lessons)
  const addLesson = useData((s) => s.addLesson)
  const updateLesson = useData((s) => s.updateLesson)
  const removeLesson = useData((s) => s.removeLesson)
  const { show, toast } = useToast()

  const lessons = useMemo(
    () =>
      allLessons
        .filter((l) => l.chapterId === chapter.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allLessons, chapter.id],
  )

  const [filter, setFilter] = useState<KindFilter>("all")
  const shown = filter === "all" ? lessons : lessons.filter((l) => l.kind === filter)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [title, setTitle] = useState("")
  const [kind, setKind] = useState<LessonKind>("cours")
  const [videoUrl, setVideoUrl] = useState("")
  const [pdfs, setPdfs] = useState<ResourceLink[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null)

  const kindHasVideo = LESSON_KINDS[kind].hasVideo

  function openDoc(pdf: ResourceLink) {
    if (pdf.url) window.open(pdf.url, "_blank", "noopener,noreferrer")
    else show("Aperçu du document — bientôt")
  }

  function openAdd() {
    setEditing(null)
    setTitle("")
    setKind(filter === "all" ? "cours" : filter)
    setVideoUrl("")
    setPdfs([{ name: "" }])
    setFormOpen(true)
  }

  function openEdit(lesson: Lesson) {
    setEditing(lesson)
    setTitle(lesson.title)
    setKind(lesson.kind)
    setVideoUrl(lesson.videoUrl ?? "")
    setPdfs(lesson.pdfs.length > 0 ? lesson.pdfs.map((p) => ({ ...p })) : [{ name: "" }])
    setFormOpen(true)
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const cleanPdfs = pdfs
      .map((p) => ({ name: p.name.trim(), url: p.url?.trim() || undefined }))
      .filter((p) => p.name !== "")
    const patch = {
      title: trimmed,
      kind,
      videoUrl: kindHasVideo ? videoUrl.trim() || undefined : undefined,
      pdfs: cleanPdfs,
      chapterId: chapter.id,
    }
    if (editing) {
      updateLesson(editing.id, patch)
      show("Contenu modifié")
    } else {
      addLesson({ ...patch, order: lessons.length })
      show("Contenu ajouté")
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeLesson(deleteTarget.id)
    show("Contenu supprimé")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter un contenu
    </button>
  )

  const filters: { key: KindFilter; label: string; count: number }[] = [
    { key: "all", label: "Tout", count: lessons.length },
    ...LESSON_KIND_ORDER.map((k) => ({
      key: k as KindFilter,
      label: LESSON_KINDS[k].label,
      count: lessons.filter((l) => l.kind === k).length,
    })),
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {lessons.length > 0
            ? `${lessons.length} contenu${lessons.length > 1 ? "s" : ""}`
            : "Aucun contenu pour le moment"}
        </p>
        {lessons.length > 0 && addButton}
      </div>

      {/* Kind filter chips */}
      {lessons.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 pb-1">
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition " +
                  (active
                    ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                    : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                }
              >
                {f.label}
                <span
                  className={
                    "rounded-full px-1.5 text-xs tabular-nums " +
                    (active ? "bg-white/20 text-ink-inverted" : "bg-neutral-100 text-ink-muted")
                  }
                >
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={BookOpen}
            title="Aucun contenu"
            description="Ajoutez des cours, exercices, séries et résumés — avec vidéo et documents PDF."
            action={addButton}
          />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={BookOpen}
            title="Rien dans ce filtre"
            description="Aucun contenu de ce type dans ce chapitre."
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {shown.map((lesson) => {
            const meta = LESSON_KINDS[lesson.kind]
            const Icon = meta.icon
            return (
              <li
                key={lesson.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <p dir="auto" className="mt-1 font-display text-[15px] font-bold text-ink">
                    {lesson.title}
                  </p>
                  {(lesson.videoUrl || lesson.pdfs.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lesson.videoUrl && (
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={CHIP}
                        >
                          <Video className="size-3.5" /> Vidéo
                        </a>
                      )}
                      {lesson.pdfs.map((pdf, i) => (
                        <button key={i} type="button" onClick={() => openDoc(pdf)} className={CHIP}>
                          <FileText className="size-3.5" />
                          <span dir="auto">{pdf.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <OverflowMenu
                  actions={[
                    { label: "Modifier", icon: Pencil, onClick: () => openEdit(lesson) },
                    {
                      label: "Supprimer",
                      icon: Trash2,
                      tone: "danger",
                      onClick: () => setDeleteTarget(lesson),
                    },
                  ]}
                />
              </li>
            )
          })}
        </ul>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Modifier le contenu" : "Nouveau contenu"}
        description={
          editing
            ? undefined
            : "Cours & exercice portent une vidéo ; série & résumé sont sans vidéo (PDF uniquement)."
        }
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submit}
      >
        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">Type de contenu</span>
          <div className="grid grid-cols-2 gap-2">
            {LESSON_KIND_ORDER.map((k) => {
              const meta = LESSON_KINDS[k]
              const Icon = meta.icon
              const active = kind === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={
                    "inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium transition " +
                    (active
                      ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                      : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                  }
                >
                  <Icon className="size-4" /> {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Cours — Limites et continuité · درس النص الحجاجي"
            autoFocus
          />
        </label>

        {kindHasVideo && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              Vidéo <span className="font-normal text-ink-muted">(un seul lien, optionnel)</span>
            </span>
            <input
              className={INPUT}
              dir="ltr"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/…"
            />
          </label>
        )}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Documents (PDF) <span className="font-normal text-ink-muted">(cours, énoncé, corrigé…)</span>
          </span>
          <div className="flex flex-col gap-2">
            {pdfs.map((pdf, i) => (
              <div key={i} className="flex items-center gap-2">
                <FileText className="size-4 shrink-0 text-ink-muted" />
                <input
                  className={INPUT + " text-start"}
                  dir="auto"
                  value={pdf.name}
                  onChange={(e) =>
                    setPdfs((prev) => prev.map((p, j) => (j === i ? { ...p, name: e.target.value } : p)))
                  }
                  placeholder="Nom du document (ex. Énoncé)"
                />
                <button
                  type="button"
                  aria-label="Retirer le document"
                  onClick={() => setPdfs((prev) => prev.filter((_, j) => j !== i))}
                  className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPdfs((prev) => [...prev, { name: "" }])}
              className="inline-flex h-10 items-center gap-1.5 self-start rounded-md border border-dashed border-border-strong px-3 text-sm font-medium text-ink-subtle transition hover:border-brand-300 hover:text-brand-600"
            >
              <Plus className="size-4" /> Ajouter un document
            </button>
          </div>
        </div>
      </FormSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer ce contenu ?"
        description={
          deleteTarget
            ? `« ${deleteTarget.title} » sera définitivement supprimé et retiré des parcours qui l'utilisent.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
