import { useState } from "react"
import { ChevronDown, Download, ExternalLink, FileText } from "lucide-react"
import { pdfFileName, pdfSrc } from "@/data/media"
import { cn } from "@/lib/utils"
import type { PlayerVideo } from "./types"

/** How many show before the list folds — two rows of the widest grid. */
const PREVIEW = 6

/**
 * The block under the video — the YouTube slot, filled with the one thing an
 * élève actually leaves the page with: THE DOCUMENTS.
 *
 * It used to open on a line naming the kind and the درس (« Exercice · La
 * reproduction humaine »), which was the vidéo's title, the breadcrumb and the
 * contenus column all saying the same thing a fourth time, two of them in
 * French. Gone: the section is « الوثائق », and then the documents.
 *
 * A section, not a tab — documents shouldn't be behind a click. They are laid
 * out as CARDS in a grid, two or three to a line, because a document is picked
 * by its name and a name reads better on two short lines than on one long one,
 * and a stack of full-width rows pushed the commentaires off the screen. The
 * whole card downloads (the title's `::after` covers it); the end icon opens
 * the document in a tab for whoever just wants to read it.
 *
 * Past two rows' worth, the grid folds behind « شوف الكل ».
 */
export function DescriptionCard({ video }: { video: PlayerVideo }) {
  const pdfs = video.pdfs ?? []
  const [expanded, setExpanded] = useState(false)

  const foldable = pdfs.length > PREVIEW
  const shown = foldable && !expanded ? pdfs.slice(0, PREVIEW) : pdfs

  return (
    <section className="rounded-xl border border-border bg-surface-muted/60 p-4">
      {/* The whole heading. No count beside it: the documents are right there
          to be counted, and the number was a second, smaller thing to read
          before the first one. */}
      <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
        الوثائق
      </p>

      {pdfs.length === 0 ? (
        <p className="mt-2 text-[calc(13px*var(--ts))] text-ink-muted">
          ما فماش وثائق مربوطة بالفيديو هذا توّا.
        </p>
      ) : (
        // Two to a line from `sm`, three once the column is wide enough to give
        // each card ~200px — below that a card cannot hold a file name and its
        // control without truncating the name to nothing.
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((pdf, i) => (
            <li
              key={i}
              // `group` for the hover, `relative` as the positioning context of
              // the stretched link below.
              className="group relative flex items-center gap-2.5 rounded-lg border border-border bg-surface p-2 transition duration-200 hover:border-brand-200 hover:shadow-sm motion-safe:hover:-translate-y-px"
            >
              {/* The plate says what the card IS at rest and what it DOES under
                  the cursor — the sheet turns into the download it is about to
                  perform, which is the whole affordance of the card. */}
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <FileText className="size-[18px] group-hover:hidden" />
                <Download className="hidden size-[18px] group-hover:block" />
              </span>
              <a
                href={pdfSrc(pdf)}
                download={pdfFileName(pdf.name)}
                dir="auto"
                // The stretched link: `::after` covers the card, so the whole
                // card downloads while the markup keeps ONE anchor carrying the
                // file's name as its accessible name. The tab-opener beside it
                // lifts itself back above with `z-10`.
                className="line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug text-ink transition after:absolute after:inset-0 after:rounded-lg group-hover:text-brand-700 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--ring)]"
              >
                {pdf.name}
              </a>
              <a
                href={pdfSrc(pdf)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`حلّ ${pdf.name} في تاب جديد`}
                className="relative z-10 grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                <ExternalLink className="size-4" />
              </a>
            </li>
          ))}

          {foldable && (
            <li className="sm:col-span-2 xl:col-span-3">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-[calc(13px*var(--ts))] font-semibold text-brand-600 transition hover:bg-surface hover:text-brand-700"
              >
                {expanded ? "شوف أقلّ" : "شوف الكل"}
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")}
                />
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
