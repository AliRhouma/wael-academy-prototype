import { Download, ExternalLink, FileText, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { pdfFileName, pdfSrc } from "@/data/media"
import type { ResourceLink } from "@/data/types"

export interface PdfModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Type label — "Résumé", "Série d'exercices", "Devoir de synthèse"… */
  kindLabel?: string
  tone?: BadgeTone
  /** Where it sits — e.g. the chapter name. */
  context?: string
  /** The documents of this item. */
  pdfs: ResourceLink[]
}

/**
 * Document sheet — what a résumé, une série or un examen carries.
 *
 * It does NOT preview the PDF: an embedded reader is a poor one on every
 * platform (unscrollable on mobile, a toolbar-less frame on desktop) and it
 * buried the only action that matters behind a wall of grey. So the sheet
 * states what the document IS and hands it over — télécharger, or ouvrir dans
 * un onglet for whoever prefers their browser's own reader.
 *
 * Sized to its content: one document is a small card, five are a short list.
 *
 * Referenced for spacing & density: ResourceMenu (document rows),
 * DescriptionCard (row idiom), FormSheet (header/footer rhythm).
 */
export function PdfModal({
  open,
  onOpenChange,
  title,
  kindLabel,
  tone = "brand",
  context,
  pdfs,
}: PdfModalProps) {
  if (pdfs.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex max-h-[85dvh] w-[calc(100%-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-xl border bg-surface p-0 sm:w-[calc(100%-2rem)] sm:max-w-lg"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 border-b border-border p-4 sm:p-5">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            {kindLabel && (
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone={tone}>{kindLabel}</Badge>
                {context && (
                  <span dir="auto" className="text-[12px] text-ink-muted">
                    {context}
                  </span>
                )}
              </div>
            )}
            <DialogTitle
              dir="auto"
              className="font-display text-[17px] font-bold leading-snug text-ink"
            >
              {title}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* The documents */}
        <div className="min-h-0 flex-1 overflow-y-auto scroll-touch p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
              {pdfs.length > 1 ? "Documents" : "Document"}
            </p>
            <span className="rounded-full bg-neutral-100 px-1.5 text-[11px] tabular-nums text-ink-muted">
              {pdfs.length}
            </span>
          </div>

          <ul className="mt-2.5 flex flex-col gap-2.5">
            {pdfs.map((pdf, i) => {
              const src = pdfSrc(pdf)
              return (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-muted/60 p-3"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
                    <FileText className="size-[22px]" />
                  </span>
                  {/* A minimum width, so on a phone the actions wrap to their
                      own line instead of squeezing the file name to "Indica…". */}
                  <div className="min-w-[9rem] flex-1">
                    <p dir="auto" className="truncate text-sm font-semibold text-ink">
                      {pdf.name}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                      PDF · <span dir="auto">{pdfFileName(pdf.name)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 max-sm:w-full">
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ouvrir ${pdf.name} dans un onglet`}
                      title="Ouvrir dans un onglet"
                      className="grid size-11 place-items-center rounded-md border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <a
                      href={src}
                      download={pdfFileName(pdf.name)}
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 text-sm font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
                    >
                      <Download className="size-4" /> Télécharger
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
