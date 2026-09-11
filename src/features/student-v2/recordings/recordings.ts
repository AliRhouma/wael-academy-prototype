import { useMemo } from "react"
import type { Session, Subject } from "@/data/types"
import { RECENT_DAYS } from "@/features/student/dashboard/dashboard"
import { useMyPastSessions } from "@/features/student/seances/replays"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/**
 * The library the تسجيلات page reads — the SAME pool as the old « الحصص
 * المسجّلة » (`useMyPastSessions`: every séance already given for the élève's
 * années), counted per matière. Derived, never stored.
 */
export interface SubjectShelf {
  subject: Subject
  /** Published replays. */
  recorded: Session[]
  /** A replay went online in the last `RECENT_DAYS` days. */
  fresh: boolean
}

export function useShelves(now: Date): SubjectShelf[] {
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const pool = useMyPastSessions()
  const day = new Date(now).setHours(0, 0, 0, 0)

  return useMemo(() => {
    const years = new Set(user?.yearIds ?? [])
    const floor = day - (RECENT_DAYS - 1) * 86_400_000
    return subjects
      .filter((s) => years.has(s.yearId))
      .map((subject) => {
        const recorded = pool.filter((s) => s.subjectIds.includes(subject.id) && s.recordingUrl)
        const fresh = recorded.some((s) => s.publishedAt && new Date(s.publishedAt).getTime() >= floor)
        return { subject, recorded, fresh }
      })
      // Matières with something to watch first, then the programme's order.
      .sort(
        (a, b) =>
          Number(b.recorded.length > 0) - Number(a.recorded.length > 0) ||
          (a.subject.order ?? 0) - (b.subject.order ?? 0),
      )
  }, [user, subjects, pool, day])
}

/** "34 تسجيل" · "5 تسجيلات" · "زوز تسجيلات" · "تسجيل واحد" — Derja counting. */
export function recordingCount(n: number): string {
  if (n === 0) return "مازال ما فمّاش"
  if (n === 1) return "تسجيل واحد"
  if (n === 2) return "زوز تسجيلات"
  if (n <= 10) return `${n} تسجيلات`
  return `${n} تسجيل`
}
