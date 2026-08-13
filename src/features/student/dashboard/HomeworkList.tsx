import { useState } from "react"
import { Download, Files, NotebookPen } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { PdfModal } from "@/components/kit/PdfModal"
import { profName } from "@/features/student/homework"
import { useMyHomeworks } from "@/features/student/dashboard/dashboard"
import { dateKey } from "@/features/student/calendar/schedule"
import { pdfFileName, pdfSrc } from "@/data/media"
import { formatSessionDay } from "@/lib/utils"
import type { Homework } from "@/data/types"
import { useData } from "@/stores/useData"

/**
 * Section 4 — الخدمة: everything the profs sent, most urgent first.
 *
 * A LIST, where the old dashboard used a rail of cards. A rail is for browsing;
 * homework is a queue you work down, and a queue wants to be countable at a
 * glance and ordered top to bottom. It also puts the deadline on every row —
 * the one fact the rail card left out, and the only one that decides what the
 * élève opens first.
 *
 * Late work says so in red and sorts to the top (`useMyHomeworks` already
 * orders by deadline). The row's only action is taking the document, same as
 * the card it replaces.
 *
 * Referenced for spacing & density: HomeworkCard (what a خدمة says: prof,
 * matière, document), RecentSeances (row rhythm), PdfModal (documents sheet).
 */
function dueLabel(homework: Homework, today: string): { text: string; late: boolean } | null {
  if (!homework.dueDate) return null
  if (homework.dueDate < today) return { text: "فات وقتها", late: true }
  if (homework.dueDate === today) return { text: "لليوم", late: true }
  return { text: `لـ ${formatSessionDay(homework.dueDate)}`, late: false }
}

function HomeworkRow({ homework, today }: { homework: Homework; today: string }) {
  const [docsOpen, setDocsOpen] = useState(false)
  const teachers = useData((s) => s.teachers)
  const subjects = useData((s) => s.subjects)
  const teacher = teachers.find((t) => t.id === homework.teacherId)
  const subject = subjects.find((s) => s.id === homework.subjectId)
  const due = dueLabel(homework, today)
  const many = homework.pdfs.length > 1
  const first = homework.pdfs[0]

  return (
    <li className="flex items-center gap-2.5 py-2.5">
      <span className="min-w-0 flex-1">
        {/* Two lines, not one: this is the narrow column of the row, and a
            truncated title is a خدمة the élève can't identify. */}
        <span
          dir="auto"
          title={`${homework.title} — ${profName(teacher)}`}
          // No `block` here: line-clamp sets its own display, and `block` won,
          // so the titles ran to six lines instead of two.
          className="font-display text-[calc(12.5px*var(--ts))] font-bold leading-tight line-clamp-2"
          style={{ color: cream.ink }}
        >
          {homework.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[calc(10.5px*var(--ts))]">
          {/* The prof's name goes to the tooltip: at this width it was pushing
              the matière and the deadline off the row, and the deadline is the
              one thing that decides what gets opened first. */}
          <span className="truncate" style={{ color: cream.inkMuted }}>
            {subject?.name}
          </span>
          {due && (
            <span
              className="shrink-0 font-semibold"
              style={{ color: due.late ? "var(--danger-600)" : cream.inkMuted }}
            >
              · {due.text}
            </span>
          )}
        </span>
      </span>

      {/* One move per row: take the file. */}
      {many ? (
        <button
          type="button"
          onClick={() => setDocsOpen(true)}
          aria-label={`${homework.pdfs.length} وثائق`}
          className="grid size-8 shrink-0 place-items-center rounded-[10px] border-2 transition hover:[background:var(--brand-500)] hover:text-white"
          style={{ borderColor: cream.edge, color: "var(--brand-600)" }}
        >
          <Files className="size-4" />
        </button>
      ) : (
        <a
          href={pdfSrc(first)}
          download={pdfFileName(first.name)}
          aria-label="حمّل"
          className="grid size-8 shrink-0 place-items-center rounded-[10px] border-2 transition hover:[background:var(--brand-500)] hover:text-white"
          style={{ borderColor: cream.edge, color: "var(--brand-600)" }}
        >
          <Download className="size-4" />
        </a>
      )}

      {many && <PdfModal open={docsOpen} onOpenChange={setDocsOpen} pdfs={homework.pdfs} title={homework.title} />}
    </li>
  )
}

export function HomeworkList({ now }: { now: Date }) {
  const homeworks = useMyHomeworks()
  const today = dateKey(now)
  // Three rows. The queue drives the height of the whole row — the agenda beside
  // it stretches to match — and at four the pair towered over the row above it.
  // The counter says what's hidden; the rest live on the matière pages.
  const shown = homeworks.slice(0, 3)

  return (
    <CreamPanel className="min-h-[13rem]" bodyClassName="gap-2 p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          className="flex items-center gap-2 font-display text-[calc(17px*var(--ts))] font-bold"
          style={{ color: cream.ink }}
        >
          <NotebookPen className="size-[18px]" style={{ color: cream.inkMuted }} />
          الخدمة
        </h2>
        {homeworks.length > shown.length && (
          <span className="shrink-0 text-[calc(11.5px*var(--ts))]" style={{ color: cream.inkMuted }}>
            {`+${homeworks.length - shown.length}`}
          </span>
        )}
      </div>

      {shown.length === 0 ? (
        <p
          className="flex flex-1 items-center justify-center rounded-[14px] border-2 border-dashed px-3 py-6 text-center text-[calc(12.5px*var(--ts))]"
          style={{ borderColor: cream.edge, color: cream.inkMuted }}
        >
          ما فمّة حتّى خدمة. مبروك عليك.
        </p>
      ) : (
        <ul className="flex-1 divide-y" style={{ borderColor: cream.edge }}>
          {shown.map((homework) => (
            <HomeworkRow key={homework.id} homework={homework} today={today} />
          ))}
        </ul>
      )}
    </CreamPanel>
  )
}
