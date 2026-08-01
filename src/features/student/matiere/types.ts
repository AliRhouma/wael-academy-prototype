import type { BadgeTone } from "@/components/kit/Badge"
import type { ResourceLink } from "@/data/types"

/** What a tab hands up when the élève asks to read a document. */
export interface PdfRequest {
  title: string
  kindLabel?: string
  tone?: BadgeTone
  /** Where it sits — the chapter or the matière name. */
  context?: string
  pdfs: ResourceLink[]
}
