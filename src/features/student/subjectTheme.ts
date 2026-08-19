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
  /**
   * `bar` as a CSS colour VALUE — for the places that paint inline because a
   * matière with measured art overrides them with its own hue (see
   * `subjectTint.dot`). Same token, just not as a class.
   */
  barVar: string
  /** Fill + border of the Wael face chip riding the progress bar. */
  chip: string
  /** Soft ring used on the active card of the matière switcher. */
  ring: string
  /**
   * The same panel / halo as CSS colour VALUES rather than classes, for the
   * places that set them inline because an art-backed matière overrides them
   * with its own measured hue (see `subjectTint`). Still the tokens — the
   * fallback path never hardcodes a colour.
   */
  panelVar: string
  haloVar: string
}

export const SUBJECT_THEME: Record<SubjectCategory, SubjectTheme> = {
  principale: {
    panel: "bg-brand-50",
    halo: "bg-brand-500/35",
    icon: "text-brand-500",
    name: "text-brand-700",
    bar: "bg-brand-500",
    barVar: "var(--brand-500)",
    chip: "bg-brand-100 border-brand-400",
    ring: "border-brand-300 ring-brand-200",
    panelVar: "var(--brand-50)",
    haloVar: "color-mix(in srgb, var(--brand-500) 35%, transparent)",
  },
  secondaire: {
    panel: "bg-accent2-50",
    halo: "bg-accent2-500/35",
    icon: "text-accent2-500",
    name: "text-accent2-700",
    bar: "bg-accent2-500",
    barVar: "var(--accent-500)",
    chip: "bg-accent2-100 border-accent2-500",
    ring: "border-accent2-500/45 ring-accent2-100",
    panelVar: "var(--accent-50)",
    haloVar: "color-mix(in srgb, var(--accent-500) 35%, transparent)",
  },
  optionnelle: {
    panel: "bg-emerald-50",
    halo: "bg-emerald-500/35",
    icon: "text-emerald-500",
    name: "text-emerald-700",
    bar: "bg-emerald-500",
    barVar: "var(--emerald-500)",
    chip: "bg-emerald-50 border-emerald-500",
    ring: "border-emerald-500/45 ring-emerald-50",
    panelVar: "var(--emerald-50)",
    haloVar: "color-mix(in srgb, var(--emerald-500) 35%, transparent)",
  },
}

/** The bucket of a matière, defaulting the way the seed does. */
export function subjectTheme(category?: SubjectCategory): SubjectTheme {
  return SUBJECT_THEME[category ?? "secondaire"]
}
