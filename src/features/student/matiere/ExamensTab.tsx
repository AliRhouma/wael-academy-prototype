import { useMemo } from "react"
import { Link } from "react-router-dom"
import { FileCheck2, FileText, PlayCircle } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { examVideoPath } from "@/features/student/player/links"
import { useData } from "@/stores/useData"
import type { PdfRequest } from "./types"

/**
 * Élève — the "Examens" tab: the devoirs, bacs blancs and corrections of the
 * matière. Each card leads with its documents (that's what an élève comes for)
 * and offers the correction filmée as a second, clearly separate action so a
 * tap never opens the wrong thing.
 */
export function ExamensTab({
  subjectId,
  subjectName,
  onRead,
}: {
  subjectId: string
  subjectName: string
  onRead: (request: PdfRequest) => void
}) {
  const exams = useData((s) => s.exams)

  const mine = useMemo(
    () =>
      exams
        .filter((e) => e.subjectIds.includes(subjectId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [exams, subjectId],
  )

  if (mine.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={FileCheck2}
          title="Aucun examen publié"
          description="Les devoirs, bacs blancs et corrections de cette matière apparaîtront ici dès qu’ils seront prêts."
        />
      </div>
    )
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {mine.map((exam) => (
        <li
          key={exam.id}
          className="flex flex-col rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-info-50 text-info-600">
              <FileCheck2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Badge tone="info">Examen</Badge>
              <h3 dir="auto" className="mt-1.5 font-display text-[15px] font-bold leading-snug text-ink">
                {exam.title}
              </h3>
            </div>
          </div>

          {exam.pdfs.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1.5">
              {exam.pdfs.map((pdf, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() =>
                      onRead({
                        title: exam.title,
                        kindLabel: "Examen",
                        tone: "info",
                        context: subjectName,
                        pdfs: exam.pdfs,
                      })
                    }
                    className="flex w-full items-center gap-2.5 rounded-md border border-border bg-surface-muted px-2.5 py-2 text-start transition hover:border-brand-200 hover:bg-surface"
                  >
                    <FileText className="size-4 shrink-0 text-danger-600" />
                    <span dir="auto" className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-subtle">
                      {pdf.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                      PDF
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-ink-muted">Documents à venir</p>
          )}

          {exam.videoUrl && (
            <Link
              to={examVideoPath(exam.id, subjectId)}
              className="mt-3 inline-flex h-11 items-center justify-center gap-2 self-start rounded-md border border-border-strong bg-surface px-3.5 text-[13px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-10"
            >
              <PlayCircle className="size-4" /> Voir la correction filmée
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
