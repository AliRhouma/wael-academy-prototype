import { useState } from "react"
import { Download, Files, NotebookPen } from "lucide-react"
import { PdfModal } from "@/components/kit/PdfModal"
import { pdfFileName, pdfSrc } from "@/data/media"
import { profName } from "@/features/student/homework"
import { formatSessionDay } from "@/lib/utils"
import type { Homework, Subject, Teacher } from "@/data/types"
import { useData } from "@/stores/useData"

export interface SessionHomeworkProps {
  /** The خدمة hanging on this séance — empty renders nothing. */
  homeworks: Homework[]
  /** The séance's own day: work due that day is handed in AT the séance. */
  sessionDate: string
}

/**
 * What the red dot on a séance card means, spelled out: the خدمة to do before
 * (or for) this séance, with the document ready to take.
 *
 * It sits under « Au programme » on purpose — the élève opens the sheet to know
 * what the séance IS, then what it asks of them. The deadline is said relative
 * to the séance ("تتسلّم في الحصّة هاذي") whenever they fall on the same day,
 * because that is how a prof says it out loud; a bare date would make the élève
 * do the arithmetic the card already did.
 *
 * Referenced for spacing & density: HomeworkCard (prof + matière labels, the
 * download / « وثايق » split), SessionDetailSheet's own Row (icon chip + meta),
 * PdfModal (documents sheet).
 */
export function SessionHomework({ homeworks, sessionDate }: SessionHomeworkProps) {
  const teachers = useData((s) => s.teachers)
  const subjects = useData((s) => s.subjects)

  if (homeworks.length === 0) return null

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-danger-600">
        {/* The same dot the calendar card wears — the sheet is where it speaks. */}
        <span aria-hidden="true" className="size-1.5 rounded-full bg-danger-500" />
        خدمة تتعمل
      </p>
      <ul className="space-y-2">
        {homeworks.map((h) => (
          <HomeworkRow
            key={h.id}
            homework={h}
            sessionDate={sessionDate}
            teacher={teachers.find((t) => t.id === h.teacherId)}
            subject={subjects.find((s) => s.id === h.subjectId)}
          />
        ))}
      </ul>
    </div>
  )
}

function HomeworkRow({
  homework,
  sessionDate,
  teacher,
  subject,
}: {
  homework: Homework
  sessionDate: string
  teacher?: Teacher
  subject?: Subject
}) {
  const [docsOpen, setDocsOpen] = useState(false)
  const many = homework.pdfs.length > 1
  const first = homework.pdfs[0]

  const due =
    homework.dueDate === undefined
      ? null
      : homework.dueDate === sessionDate
        ? "تتسلّم في الحصّة هاذي"
        : `آجال: ${formatSessionDay(homework.dueDate)}`

  const action =
    "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-[calc(12.5px*var(--ts))] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"

  return (
    <li className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
        <NotebookPen className="size-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className="line-clamp-2 font-display text-[calc(14px*var(--ts))] font-bold leading-snug text-ink"
        >
          {homework.title}
        </p>
        <p dir="auto" className="mt-0.5 truncate text-[calc(11.5px*var(--ts))] text-ink-muted">
          {[profName(teacher), subject?.name].filter(Boolean).join(" · ")}
        </p>
        {due && (
          <p className="mt-1 text-[calc(11.5px*var(--ts))] font-medium text-danger-600">{due}</p>
        )}
        {homework.note && (
          <p
            dir="auto"
            className="mt-1.5 line-clamp-3 text-[calc(12px*var(--ts))] leading-relaxed text-ink-subtle"
          >
            {homework.note}
          </p>
        )}

        {/* The document, kept on its own line: at ~390px a button beside this
            column would squeeze the title to two words. */}
        <div className="mt-2.5">
          {many ? (
            <button type="button" onClick={() => setDocsOpen(true)} className={action}>
              <Files className="size-4" />
              {homework.pdfs.length} وثايق
            </button>
          ) : (
            <a href={pdfSrc(first)} download={pdfFileName(first.name)} className={action}>
              <Download className="size-4" />
              حمّل الوثيقة
            </a>
          )}
        </div>
      </div>

      {many && (
        <PdfModal
          open={docsOpen}
          onOpenChange={setDocsOpen}
          title={homework.title}
          kindLabel="خدمة"
          tone="danger"
          context={subject?.name}
          pdfs={homework.pdfs}
        />
      )}
    </li>
  )
}
