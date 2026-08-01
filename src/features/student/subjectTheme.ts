import type { SubjectCategory } from "@/data/types"

/**
 * Per-bucket styling for a matière (principale / secondaire / optionnelle).
 * Written out per category — Tailwind can't build class names at runtime. Uses
 * /opacity variants so every bucket gets the same ramp even though accent2 and
 * emerald expose fewer shades than brand. Shared by the Matières grid and the
 * matière page so a matière keeps its colour wherever it shows up.
 */
export interface SubjectTheme {
  panel: string
  halo: string
  icon: string
  name: string
  bar: string
  /** Soft ring used on the active card of the matière switcher. */
  ring: string
}

export const SUBJECT_THEME: Record<SubjectCategory, SubjectTheme> = {
  principale: {
    panel: "bg-brand-50",
    halo: "bg-brand-500/35",
    icon: "text-brand-500",
    name: "text-brand-700",
    bar: "bg-brand-500",
    ring: "border-brand-300 ring-brand-200",
  },
  secondaire: {
    panel: "bg-accent2-50",
    halo: "bg-accent2-500/35",
    icon: "text-accent2-500",
    name: "text-accent2-700",
    bar: "bg-accent2-500",
    ring: "border-accent2-500/45 ring-accent2-100",
  },
  optionnelle: {
    panel: "bg-emerald-50",
    halo: "bg-emerald-500/35",
    icon: "text-emerald-500",
    name: "text-emerald-700",
    bar: "bg-emerald-500",
    ring: "border-emerald-500/45 ring-emerald-50",
  },
}

/** The bucket of a matière, defaulting the way the seed does. */
export function subjectTheme(category?: SubjectCategory): SubjectTheme {
  return SUBJECT_THEME[category ?? "secondaire"]
}
