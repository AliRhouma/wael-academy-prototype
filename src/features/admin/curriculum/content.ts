import { BookOpen, FileText, ListChecks, PencilRuler, ScrollText, type LucideIcon } from "lucide-react"
import type { BadgeTone } from "@/components/kit/Badge"
import type { LessonKind } from "@/data/types"

/** Per-kind display metadata for content items (cours / exercice / série / résumé). */
export const LESSON_KINDS: Record<
  LessonKind,
  { label: string; icon: LucideIcon; tone: BadgeTone; hasVideo: boolean }
> = {
  cours: { label: "Cours", icon: BookOpen, tone: "brand", hasVideo: true },
  exercice: { label: "Exercice", icon: PencilRuler, tone: "info", hasVideo: true },
  serie: { label: "Série", icon: FileText, tone: "warning", hasVideo: false },
  resume: { label: "Résumé", icon: ScrollText, tone: "success", hasVideo: false },
}

/** Ordered list of kinds for filters / selects. */
export const LESSON_KIND_ORDER: LessonKind[] = ["cours", "exercice", "serie", "resume"]

export const QUIZ_ICON: LucideIcon = ListChecks
