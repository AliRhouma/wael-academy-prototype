import { useMemo } from "react"
import { nowStamp, sessionStamp } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/**
 * Shared reading of the « Séances enregistrées » library — the année scolaire /
 * matière / groupe / semestre slicing both replay screens do.
 *
 * Derived in render, never stored: a séance belongs to the library once it has
 * happened, and it is playable once its `recordingUrl` is published.
 */

export const SEMESTERS = [1, 2, 3] as const
export type Semester = (typeof SEMESTERS)[number]

/** "2026/2027" → "2026-2027" — the année carried in a URL query, slash-free. */
export function yearSlug(academicYear: string): string {
  return academicYear.replace("/", "-")
}

/** "2026-2027" → "2026/2027". */
export function yearFromSlug(slug: string): string {
  return slug.replace("-", "/")
}

/**
 * "Bac Sciences — Renforcement" → "Renforcement". Wherever the filière is
 * already stated by the page around it, repeating it costs the width the
 * groupe names need.
 */
export function shortGroupLabel(title: string): string {
  const [, tail] = title.split("—")
  return (tail ?? title).trim()
}

/** The semestre a séance sits in — a séance seeded without one opens the year. */
export function semesterOf(session: Session): Semester {
  return session.semester ?? 1
}

/** A séance is in the library once it's behind us; playable once published. */
export function isPast(session: Session): boolean {
  return sessionStamp(session) < nowStamp()
}

/**
 * "1:30" · "45 min" — how long the séance ran.
 *
 * Hours are written as a clock span, not as "1 h 30": the `h` is a French
 * abbreviation sitting inside an Arabic line, and it read as a stray letter
 * rather than as a unit. A colon needs no language. Under an hour there are no
 * hours to punctuate, so those stay spelled out in minutes.
 */
export function durationLabel(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const total = eh * 60 + em - (sh * 60 + sm)
  if (!Number.isFinite(total) || total <= 0) return ""
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  return `${h}:${String(m).padStart(2, "0")}`
}

/**
 * The élève's replay pool: every séance already given for one of their années,
 * newest first. Séances still to come stay out of the library — they live in
 * the calendrier until they've happened.
 */
export function useMyPastSessions(): Session[] {
  const user = useAuth((s) => s.currentUser)
  const sessions = useData((s) => s.sessions)

  return useMemo(() => {
    const myYearIds = new Set(user?.yearIds ?? [])
    if (myYearIds.size === 0) return []
    return sessions
      .filter((s) => s.yearIds.some((id) => myYearIds.has(id)) && isPast(s))
      .sort((a, b) => sessionStamp(b).localeCompare(sessionStamp(a)))
  }, [sessions, user])
}

/** The années scolaires present in a list, most recent first. */
export function academicYearsOf(sessions: Session[]): string[] {
  return [...new Set(sessions.map((s) => s.academicYear))].sort((a, b) => b.localeCompare(a))
}
