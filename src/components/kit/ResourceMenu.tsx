import { ChevronDown, Download, FileText } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { pdfFileName, pdfSrc } from "@/data/media"
import { cn } from "@/lib/utils"
import type { ResourceLink } from "@/data/types"

/**
 * A video's documents, folded into one control that sits on the title's row.
 *
 * A row IS the download — one tap on the control, one tap on the document, and
 * it's on the élève's phone. Rows are 44px+ and the trigger carries the count,
 * so the élève knows there is something to take before opening the menu.
 */
export function ResourceMenu({
  pdfs,
  className,
}: {
  pdfs: ResourceLink[]
  className?: string
}) {
  if (pdfs.length === 0) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Documents de la vidéo — ${pdfs.length}`}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 text-[13px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3",
            className,
          )}
        >
          <FileText className="size-4 shrink-0 text-danger-500" />
          <span className="hidden sm:inline">Documents</span>
          <span className="rounded-full bg-neutral-100 px-1.5 text-[11px] tabular-nums text-ink-muted">
            {pdfs.length}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-[60] max-h-[50dvh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto scroll-touch rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
        >
          <p className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
            Télécharger
          </p>
          {pdfs.map((pdf, i) => (
            <DropdownMenu.Item key={i} asChild className="cursor-pointer">
              <a
                href={pdfSrc(pdf)}
                download={pdfFileName(pdf.name)}
                className="flex min-h-[44px] items-center gap-2.5 rounded-md px-2 outline-none transition hover:bg-surface-muted data-[highlighted]:bg-surface-muted"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-danger-50 text-danger-600">
                  <FileText className="size-4" />
                </span>
                <span dir="auto" className="min-w-0 flex-1 truncate text-sm text-ink-subtle">
                  {pdf.name}
                </span>
                <Download className="size-4 shrink-0 text-ink-muted" />
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
