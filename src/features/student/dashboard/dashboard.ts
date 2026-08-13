import { useMemo } from "react"
import type { Homework, LiveSession, Session } from "@/data/types"
import { useMyPastSessions } from "@/features/student/seances/replays"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/**
 * What the élève's dashboard reads out of the shared store. Three questions, in
 * the order the élève asks them: where do I have to BE, what do I have to DO,
 * and what's NEW. Everything here is derived in render — nothing is stored.
 */

/** A live session carries no end time; a visio runs about an hour and a half. */
export const LIVE_DURATION_MIN = 90

/** How far back « آخر الحصص المضافة » looks. */
export const RECENT_DAYS = 3

/** Stable empty arrays, so the memos below don't see a new dep every render. */
const NO_IDS: string[] = []

/** Local Date from a "YYYY-MM-DD" day + a "HH:MM" time. */
function at(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number)
  const [h, mi] = time.split(":").map(Number)
  return new Date(y, mo - 1, d, h, mi)
}

/** The groupes the élève is rostered in. */
export function useMyGroupIds(): Set<string> {
  const user = useAuth((s) => s.currentUser)
  const groups = useData((s) => s.groups)
  return useMemo(
    () => new Set(groups.filter((g) => user && g.studentIds.includes(user.id)).map((g) => g.id)),
    [groups, user],
  )
}

/* ------------------------------------------------------------------ *
 * 1. What's next — a séance or a live, whichever comes first.
 * ------------------------------------------------------------------ */

/**
 * The next thing on the élève's agenda. A séance en direct and a séance in the
 * salle are two different objects in the store but ONE question for the élève
 * ("where do I have to be, and when"), so the dashboard merges them and shows
 * whichever comes first. The live one wins nothing by being live — it wins by
 * being sooner.
 */
export type UpNextItem =
  | { kind: "live"; live: LiveSession; start: Date; end: Date }
  | { kind: "seance"; session: Session; start: Date; end: Date }

export function useMyNextUp(now: Date): UpNextItem | null {
  const user = useAuth((s) => s.currentUser)
  const sessions = useData((s) => s.sessions)
  const liveSessions = useData((s) => s.liveSessions)
  const subjects = useData((s) => s.subjects)
  const myGroupIds = useMyGroupIds()
  const myYearIds = user?.yearIds ?? NO_IDS
  // Only the minute matters here — re-deriving every second would be waste.
  const minute = Math.floor(now.getTime() / 60_000)

  return useMemo(() => {
    const t = minute * 60_000
    const years = new Set(myYearIds)
    const items: UpNextItem[] = []

    for (const session of sessions) {
      const mine =
        session.groupIds.some((id) => myGroupIds.has(id)) ||
        session.yearIds.some((id) => years.has(id))
      if (!mine) continue
      items.push({
        kind: "seance",
        session,
        start: at(session.date, session.startTime),
        end: at(session.date, session.endTime),
      })
    }

    // A live with no groupe AND no année is open to the whole academy — it is
    // the élève's as soon as the matière is one they study.
    const myYearSubjects = new Set(
      subjects.filter((s) => years.has(s.yearId)).map((s) => s.id),
    )
    for (const live of liveSessions) {
      const targeted = live.groupIds.length > 0 || live.yearIds.length > 0
      const mine = targeted
        ? live.groupIds.some((id) => myGroupIds.has(id)) || live.yearIds.some((id) => years.has(id))
        : live.subjectIds.some((id) => myYearSubjects.has(id))
      if (!mine) continue
      const start = at(live.date, live.startTime)
      items.push({
        kind: "live",
        live,
        start,
        end: new Date(start.getTime() + LIVE_DURATION_MIN * 60_000),
      })
    }

    return (
      items
        .filter((i) => i.end.getTime() > t)
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null
    )
  }, [sessions, liveSessions, subjects, myGroupIds, myYearIds, minute])
}

/**
 * Every séance the élève is expected at — those of a groupe they're in, or
 * scheduled for their année. The week strip and today's count both read it.
 */
export function useMySessions(): Session[] {
  const user = useAuth((s) => s.currentUser)
  const sessions = useData((s) => s.sessions)
  const myGroupIds = useMyGroupIds()
  const myYearIds = user?.yearIds ?? NO_IDS

  return useMemo(() => {
    const years = new Set(myYearIds)
    return sessions.filter(
      (s) => s.groupIds.some((id) => myGroupIds.has(id)) || s.yearIds.some((id) => years.has(id)),
    )
  }, [sessions, myGroupIds, myYearIds])
}

/* ------------------------------------------------------------------ *
 * 2. Travail à faire — what the profs sent.
 * ------------------------------------------------------------------ */

/**
 * The homework addressed to this élève, most urgent first: what is late, then
 * what is due soonest, then — for a خدمة with no deadline — the freshest.
 * A homework with no groupe went out to the whole année.
 */
export function useMyHomeworks(): Homework[] {
  const user = useAuth((s) => s.currentUser)
  const homeworks = useData((s) => s.homeworks)
  const myGroupIds = useMyGroupIds()
  const myYearIds = user?.yearIds ?? NO_IDS

  return useMemo(() => {
    const years = new Set(myYearIds)
    return homeworks
      .filter(
        (h) =>
          h.yearIds.some((id) => years.has(id)) &&
          (h.groupIds.length === 0 || h.groupIds.some((id) => myGroupIds.has(id))),
      )
      .sort((a, b) => {
        // Undated work sinks below everything with a deadline, then sorts by
        // how recently it landed.
        const da = a.dueDate ?? "9999-12-31"
        const db = b.dueDate ?? "9999-12-31"
        return da === db ? b.sentAt.localeCompare(a.sentAt) : da.localeCompare(db)
      })
  }, [homeworks, myGroupIds, myYearIds])
}

/* ------------------------------------------------------------------ *
 * 3. Recently added — replays put online in the last few days.
 * ------------------------------------------------------------------ */

/**
 * Replays PUT ONLINE in the last `RECENT_DAYS` days, newest upload first.
 *
 * It keys off `publishedAt`, not the séance's own date: what makes a replay
 * news is that it appeared, and an archive séance uploaded this morning is
 * exactly as new to the élève as yesterday's. A recording with no
 * `publishedAt` never counts — we don't know when it landed.
 */
export function useRecentlyAdded(now: Date): Session[] {
  const pool = useMyPastSessions()
  // Whole-day granularity is enough; this must not re-run every minute.
  const day = new Date(now).setHours(0, 0, 0, 0)

  return useMemo(() => {
    const floor = day - (RECENT_DAYS - 1) * 86_400_000
    return pool
      .filter((s) => {
        if (!s.recordingUrl || !s.publishedAt) return false
        const t = new Date(s.publishedAt).getTime()
        return Number.isFinite(t) && t >= floor
      })
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  }, [pool, day])
}

/** "تزادت اليوم" · "تزادت البارح" · "تزادت من نهارين" — how new an upload is. */
export function addedLabel(publishedAt: string, now: Date): string {
  const then = new Date(publishedAt)
  const days = Math.round(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) / 86_400_000,
  )
  if (days <= 0) return "تزادت اليوم"
  if (days === 1) return "تزادت البارح"
  if (days === 2) return "تزادت من نهارين"
  return `تزادت من ${days} يام`
}
