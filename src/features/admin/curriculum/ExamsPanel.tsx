import { useMemo, useState } from "react"
import { ClipboardList, Copy, FileText, Pencil, Plus, Trash2, Video, X } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { Badge } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Exam, ResourceLink, Subject, Year } from "@/data/types"
import { ScopePicker } from "./ScopePicker"
import { copyName, duplicateExam } from "./duplicate"
import {
  DuplicateSheet,
  EMPTY_DESTINATION,
  useDestinationName,
  type Destination,
} from "./DuplicateSheet"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

const CHIP =
  "inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted px-2 py-1 text-[calc(12px*var(--ts))] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"

/** The "امتحانات" tab of a subject — assessments with PDF documents + a video. */
export function ExamsPanel({ year, subject }: { year: Year; subject: Subject }) {
  const years = useData((s) => s.years)
  const allExams = useData((s) => s.exams)
  const addExam = useData((s) => s.addExam)
  const updateExam = useData((s) => s.updateExam)
  const removeExam = useData((s) => s.removeExam)
  const { show, toast } = useToast()

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

  const exams = useMemo(
    () =>
      allExams
        .filter((e) => e.subjectIds.includes(subject.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allExams, subject.id],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [title, setTitle] = useState("")
  const [pdfs, setPdfs] = useState<ResourceLink[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [pickedYears, setPickedYears] = useState<string[]>([])
  const [pickedSubjects, setPickedSubjects] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)

  const [dupTarget, setDupTarget] = useState<Exam | null>(null)
  const [dupName, setDupName] = useState("")
  const [dupDest, setDupDest] = useState<Destination>(EMPTY_DESTINATION)
  const dupInto = useDestinationName(dupDest, "subject")

  function openDoc(pdf: ResourceLink) {
    if (pdf.url) window.open(pdf.url, "_blank", "noopener,noreferrer")
    else show("معاينة الوثيقة — قريب")
  }

  function openAdd() {
    setEditing(null)
    setTitle("")
    setPdfs([{ name: "" }])
    setVideoUrl("")
    setPickedYears([year.id])
    setPickedSubjects([subject.id])
    setFormOpen(true)
  }

  function openEdit(exam: Exam) {
    setEditing(exam)
    setTitle(exam.title)
    setPdfs(exam.pdfs.length > 0 ? exam.pdfs.map((p) => ({ ...p })) : [{ name: "" }])
    setVideoUrl(exam.videoUrl ?? "")
    setPickedYears(exam.yearIds)
    setPickedSubjects(exam.subjectIds)
    setFormOpen(true)
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed || pickedSubjects.length === 0 || pickedYears.length === 0) return
    const cleanPdfs = pdfs
      .map((p) => ({ name: p.name.trim(), url: p.url?.trim() || undefined }))
      .filter((p) => p.name !== "")
    const patch = {
      title: trimmed,
      pdfs: cleanPdfs,
      videoUrl: videoUrl.trim() || undefined,
      subjectIds: pickedSubjects,
      yearIds: pickedYears,
    }
    if (editing) {
      updateExam(editing.id, patch)
      show("الامتحان تبدّل")
    } else {
      addExam({ ...patch, order: exams.length })
      show("الامتحان تزاد")
    }
    setFormOpen(false)
  }

  function openDuplicate(exam: Exam) {
    setDupTarget(exam)
    setDupName(copyName(exam.title))
    setDupDest({ yearId: year.id, subjectId: subject.id, chapterId: "" })
  }

  function submitDuplicate() {
    if (!dupTarget) return
    duplicateExam(dupTarget, {
      title: dupName.trim(),
      subjectIds: [dupDest.subjectId],
      yearIds: [dupDest.yearId],
    })
    show(`الامتحان تنسخ في «${dupInto}»`)
    setDupTarget(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeExam(deleteTarget.id)
    show("الامتحان تمسح")
    setDeleteTarget(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openAdd}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> زيد امتحان
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {exams.length > 0
            ? `${exams.length} امتحان`
            : "ما فماش امتحانات توّا"}
        </p>
        {exams.length > 0 && addButton}
      </div>

      {exams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={ClipboardList}
            title="ما فماش امتحانات"
            description="زيد فروض وامتحانات (نصّ، إصلاح، فيديو) — مثال: فرض تأليفي عدد 1."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {exams.map((exam) => {
            const otherYears = exam.yearIds.filter((yid) => yid !== year.id)
            return (
              <li
                key={exam.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-700">
                  <ClipboardList className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p dir="auto" className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">
                    {exam.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand" dot>
                      {year.name}
                    </Badge>
                    {otherYears.map((yid) => (
                      <Badge key={yid} tone="neutral">
                        {yearName.get(yid) ?? "—"}
                      </Badge>
                    ))}
                    {exam.subjectIds.length > 1 && (
                      <span className="text-[calc(12px*var(--ts))] text-ink-muted">
                        · {exam.subjectIds.length} مادّة
                      </span>
                    )}
                  </div>
                  {(exam.pdfs.length > 0 || exam.videoUrl) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exam.pdfs.map((pdf, i) => (
                        <button key={i} type="button" onClick={() => openDoc(pdf)} className={CHIP}>
                          <FileText className="size-3.5" />
                          <span dir="auto">{pdf.name}</span>
                        </button>
                      ))}
                      {exam.videoUrl && (
                        <a
                          href={exam.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={CHIP}
                        >
                          <Video className="size-3.5" /> فيديو
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <OverflowMenu
                  actions={[
                    { label: "بدّل", icon: Pencil, onClick: () => openEdit(exam) },
                    { label: "اعمل نسخة", icon: Copy, onClick: () => openDuplicate(exam) },
                    {
                      label: "امسح",
                      icon: Trash2,
                      tone: "danger",
                      onClick: () => setDeleteTarget(exam),
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
        title={editing ? "بدّل الامتحان" : "امتحان جديد"}
        description={
          editing
            ? undefined
            : `وثائق PDF وفيديو — تزاد لـ«${subject.name}» — ${year.name}.`
        }
        submitLabel={editing ? "سجّل" : "زيد"}
        onSubmit={submit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">العنوان</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: فرض تأليفي عدد 1"
            autoFocus
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            وثائق (PDF){" "}
            <span className="font-normal text-ink-muted">(نصّ، إصلاح، سلّم تنقيط…)</span>
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
                  placeholder="اسم الوثيقة (مثال: النصّ)"
                />
                <button
                  type="button"
                  aria-label="نحّي الوثيقة"
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
              <Plus className="size-4" /> زيد وثيقة
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            فيديو <span className="font-normal text-ink-muted">(رابط واحد، اختياري)</span>
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

        {/* Scope is implicit on creation (the page you're on); only an edit can
            widen an exam to other matières / classes. */}
        {editing && (
          <ScopePicker
            yearIds={pickedYears}
            subjectIds={pickedSubjects}
            onYearsChange={setPickedYears}
            onSubjectsChange={setPickedSubjects}
          />
        )}
      </FormSheet>

      <DuplicateSheet
        open={dupTarget !== null}
        onOpenChange={(o) => !o && setDupTarget(null)}
        title="اعمل نسخة من الامتحان"
        nameLabel="عنوان النسخة"
        name={dupName}
        onNameChange={setDupName}
        depth="subject"
        destination={dupDest}
        onDestinationChange={setDupDest}
        note="وثائق PDF والفيديو يتبعو النسخة."
        onSubmit={submitDuplicate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="تحبّ تمسح الامتحان هذا؟"
        description={
          deleteTarget ? `«${deleteTarget.title}» باش يتمسح نهائيا.` : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
