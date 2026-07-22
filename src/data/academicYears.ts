/**
 * Années scolaires (school years, e.g. "2025/2026") — the shared list every
 * scoped entity picks from: student groups, séances and live sessions all
 * carry one. One flat constant keeps the options identical across forms.
 */
export const ACADEMIC_YEARS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
] as const

/** The current année scolaire — the default for anything newly created. */
export const DEFAULT_ACADEMIC_YEAR = "2026/2027"
