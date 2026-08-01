import { useState } from "react"
import { ChevronDown, Download, ExternalLink, FileText } from "lucide-react"
import { pdfFileName, pdfSrc } from "@/data/media"
import { cn } from "@/lib/utils"
import type { PlayerVideo } from "./types"

/** How many documents show before the list folds — three fit without scrolling. */
const PREVIEW = 3

/**
 * The description block under the video — the YouTube slot, filled with what an
 * élève actually needs there: where the vidéo sits, and its documents.
 *
 * A section, not a tab: documents are the thing an élève leaves with, and they
 * shouldn't be hidden behind a click. Each row downloads; the end icon opens the
 * document in a tab for whoever just wants to read it.
 *
 * Past three documents the list folds behind « Voir tout » — a cours can ship
 * six files, and a column of them would push the commentaires off the screen
 * for the majority of vidéos that ship one or two.
 */
export function DescriptionCard({ video }: { video: PlayerVideo }) {
  const pdfs = video.pdfs ?? []
  const [expanded, setExpanded] = useState(false)

  const foldable = pdfs.length > PREVIEW
  const shown = foldable && !expanded ? pdfs.slice(0, PREVIEW) : pdfs
  const hidden = pdfs.length - shown.length

  return (
    <section className="rounded-xl border border-border bg-surface-muted/60 p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
        <span className="font-semibold text-ink">{video.kindLabel}</span>
        {video.context && (
          <>
            <span className="text-ink-muted">·</span>
            <span dir="auto" className="text-ink-subtle">
              {video.context}
            </span>
          </>
        )}
        {video.meta && (
          <>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">{video.meta}</span>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
          Documents
        </p>
        <span className="rounded-full bg-neutral-100 px-1.5 text-[11px] tabular-nums text-ink-muted">
          {pdfs.length}
        </span>
      </div>

      {pdfs.length === 0 ? (
        <p className="mt-2 text-[13px] text-ink-muted">
          Aucun document joint à cette vidéo pour le moment.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {shown.map((pdf, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-md border border-border bg-surface p-2 ps-2.5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
                <FileText className="size-[18px]" />
              </span>
              <a
                href={pdfSrc(pdf)}
                download={pdfFileName(pdf.name)}
                dir="auto"
                className="min-w-0 flex-1 truncate text-sm font-medium text-ink transition hover:text-brand-600"
              >
                {pdf.name}
              </a>
              <a
                href={pdfSrc(pdf)}
                download={pdfFileName(pdf.name)}
                aria-label={`Télécharger ${pdf.name}`}
                className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-brand-600"
              >
                <Download className="size-4" />
              </a>
              <a
                href={pdfSrc(pdf)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ouvrir ${pdf.name} dans un onglet`}
                className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-brand-600"
              >
                <ExternalLink className="size-4" />
              </a>
            </li>
          ))}

          {foldable && (
            <li>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-brand-600 transition hover:bg-surface hover:text-brand-700"
              >
                {expanded ? "Voir moins" : `Voir tout (${pdfs.length})`}
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
                />
              </button>
              {!expanded && (
                <span className="ms-1 text-[12px] text-ink-muted">
                  +{hidden} document{hidden > 1 ? "s" : ""}
                </span>
              )}
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
