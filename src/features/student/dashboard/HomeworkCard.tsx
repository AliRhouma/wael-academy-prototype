import { useState } from "react"
import { Download, Files } from "lucide-react"
import { PdfModal } from "@/components/kit/PdfModal"
import { profName } from "@/features/student/homework"
import { subjectTheme } from "@/features/student/subjectTheme"
import { pdfFileName, pdfSrc } from "@/data/media"
import { cn } from "@/lib/utils"
import type { Homework, Subject, Teacher } from "@/data/types"

export interface HomeworkCardProps {
  homework: Homework
  teacher?: Teacher
  subject?: Subject
}

/**
 * One خدمة, said in three things: WHO sent it, for WHICH matière, and the
 * document. Nothing else — the élève recognises the work from the prof and the
 * matière, and the only move the card offers is taking the file.
 *
 * No drawing on it: with the prof's name as the headline the card is a message,
 * not a matière, and a badge here would have competed with the same badges the
 * matières page owns. The matière keeps its colour anyway — it is carried by
 * its category token on the label, the way the séances rail does it.
 *
 * Referenced for spacing & density: RecentSeances (rail card shell + footer),
 * SeanceCard (label → title order), PdfModal (documents sheet).
 */
export function HomeworkCard({ homework, teacher, subject }: HomeworkCardProps) {
  const [docsOpen, setDocsOpen] = useState(false)
  const theme = subjectTheme(subject?.category)
  const many = homework.pdfs.length > 1
  const first = homework.pdfs[0]

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-3.5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <p
        dir="auto"
        className="truncate font-display text-[calc(14.5px*var(--ts))] font-bold leading-snug text-ink"
      >
        {profName(teacher)}
      </p>
      <p
        dir="auto"
        className={cn(
          "mt-1 truncate text-[calc(11.5px*var(--ts))] font-medium uppercase tracking-[.08em]",
          theme.name,
        )}
      >
        {subject?.name ?? "—"}
      </p>

      {/* Pinned to the bottom, so every card in the rail ends on its button. */}
      <div className="mt-auto pt-3.5">
        {many ? (
          <button
            type="button"
            onClick={() => setDocsOpen(true)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-grad px-3 text-[calc(13px*var(--ts))] font-medium text-ink-inverted btn-bump transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            <Files className="size-4" />
            {homework.pdfs.length} وثائق
          </button>
        ) : (
          <a
            href={pdfSrc(first)}
            download={pdfFileName(first.name)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-grad px-3 text-[calc(13px*var(--ts))] font-medium text-ink-inverted btn-bump transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            <Download className="size-4" />
            حمّل
          </a>
        )}
      </div>

      {many && (
        <PdfModal
          open={docsOpen}
          onOpenChange={setDocsOpen}
          title={homework.title}
          kindLabel="خدمة"
          context={subject?.name}
          pdfs={homework.pdfs}
        />
      )}
    </article>
  )
}
