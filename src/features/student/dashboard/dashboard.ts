import { useMemo } from "react"
import type { Homework, LiveSession, ResourceLink, Session } from "@/data/types"
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
 * 1b. The live séance — is one running RIGHT NOW?
 * ------------------------------------------------------------------ */

/** Local "YYYY-MM-DD" for a Date. Kept local: importing `schedule` from here
 *  would close a cycle, since `schedule` already imports `useMyHomeworks`. */
function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "HH:MM" → minutes since midnight. */
function mins(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

export interface LiveToday {
  live: LiveSession
  start: Date
  end: Date
  /** Started and not yet over — the state the dashboard shouts about. */
  running: boolean
}

/**
 * TODAY's séances en direct for this élève, earliest first, each carrying
 * whether it is running at this minute.
 *
 * Deliberately scoped to today. A live three days out is an agenda entry, and
 * the agenda is the panel beside this one; the live panel answers exactly one
 * question — "is there somewhere I have to BE right now" — and a card that
 * answers it with "Thursday" is answering a different question.
 *
 * The whole day is returned rather than one pick, because the dashboard wants
 * two different picks out of it: the truthful one (running, else still to come)
 * and, for the demo switch, any record at all to dress the running state with.
 */
export function useMyLivesToday(now: Date): LiveToday[] {
  const user = useAuth((s) => s.currentUser)
  const liveSessions = useData((s) => s.liveSessions)
  const subjects = useData((s) => s.subjects)
  const myGroupIds = useMyGroupIds()
  const myYearIds = user?.yearIds ?? NO_IDS
  const minute = Math.floor(now.getTime() / 60_000)

  return useMemo(() => {
    const t = minute * 60_000
    const today = dayKey(new Date(t))
    const years = new Set(myYearIds)
    // A live with no groupe AND no année is open to the whole academy — it is
    // the élève's as soon as the matière is one they study.
    const myYearSubjects = new Set(subjects.filter((s) => years.has(s.yearId)).map((s) => s.id))

    return liveSessions
      .filter((live) => {
        if (live.date !== today) return false
        const targeted = live.groupIds.length > 0 || live.yearIds.length > 0
        return targeted
          ? live.groupIds.some((id) => myGroupIds.has(id)) ||
              live.yearIds.some((id) => years.has(id))
          : live.subjectIds.some((id) => myYearSubjects.has(id))
      })
      .map((live) => {
        const start = at(live.date, live.startTime)
        const end = new Date(start.getTime() + LIVE_DURATION_MIN * 60_000)
        return { live, start, end, running: start.getTime() <= t && t < end.getTime() }
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [liveSessions, subjects, myGroupIds, myYearIds, minute])
}

/** Running beats merely scheduled, whatever the clock order says. Null once the
 *  day's lives are all behind the élève. */
export function pickLive(lives: LiveToday[], now: Date): LiveToday | null {
  const t = now.getTime()
  return lives.find((l) => l.running) ?? lives.find((l) => l.start.getTime() > t) ?? null
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

/**
 * One row per DOCUMENT (not per خدمة) that is due for a séance still ahead of
 * the élève today.
 *
 * The panel used to list every open خدمة the profs had ever sent, which made it
 * a backlog — and a backlog is something you scroll past, not something you act
 * on. Scoped to today's remaining séances it becomes a packing list: these are
 * the files to have open when you walk in. A خدمة carrying three PDFs is three
 * rows, because the élève downloads files, not homework records.
 *
 * Sessions already finished drop out — their documents are no longer "to do".
 */
export interface TodayDoc {
  /** `${homework.id}#${index}` — stable, and unique across a multi-PDF خدمة. */
  id: string
  pdf: ResourceLink
  homework: Homework
  session: Session
}

export function useTodayDocs(now: Date): TodayDoc[] {
  const mySessions = useMySessions()
  const homeworks = useMyHomeworks()
  const minute = Math.floor(now.getTime() / 60_000)

  return useMemo(() => {
    const t = minute * 60_000
    const clock = new Date(t)
    const today = dayKey(clock)
    const nowMins = clock.getHours() * 60 + clock.getMinutes()

    const ahead = mySessions
      .filter((s) => s.date === today && mins(s.endTime) > nowMins)
      .sort((a, b) => mins(a.startTime) - mins(b.startTime))
    const rows: TodayDoc[] = []
    for (const session of ahead) {
      for (const homework of homeworks) {
        if (homework.sessionId !== session.id) continue
        homework.pdfs.forEach((pdf, i) =>
          rows.push({ id: `${homework.id}#${i}`, pdf, homework, session }),
        )
      }
    }
    return rows
  }, [mySessions, homeworks, minute])
}

/**
 * How many rows the homework panel's demo state shows. The box holds about four
 * before it clips, so six is the smallest number that makes the scroll visible.
 */
export const DEMO_DOCS = 6

/**
 * The homework panel's demo pool — what the K key shows.
 *
 * Today's REAL remaining documents come first and keep their order, so when the
 * day is busy this is simply the true panel. It is only topped up when today is
 * thin, from the élève's other documents, so the list is long enough to scroll
 * at any hour of any day. That means a padded row's · HH:MM belongs to its own
 * séance rather than to today — fine for a demo, and the reason this is a
 * separate hook instead of a flag on `useTodayDocs`, which must stay honest.
 *
 * Documents whose خدمة is attached to no séance are skipped: a row is built
 * around its séance's hour, and there is nothing to show without one.
 */
export function useDemoDocs(now: Date): TodayDoc[] {
  const real = useTodayDocs(now)
  const mySessions = useMySessions()
  const homeworks = useMyHomeworks()

  return useMemo(() => {
    if (real.length >= DEMO_DOCS) return real.slice(0, DEMO_DOCS)

    const byId = new Map(mySessions.map((s) => [s.id, s]))
    const taken = new Set(real.map((r) => r.id))
    const rows = [...real]

    for (const homework of homeworks) {
      const session = homework.sessionId ? byId.get(homework.sessionId) : undefined
      if (!session) continue
      for (let i = 0; i < homework.pdfs.length && rows.length < DEMO_DOCS; i++) {
        const id = `${homework.id}#${i}`
        if (taken.has(id)) continue
        rows.push({ id, pdf: homework.pdfs[i], homework, session })
      }
      if (rows.length >= DEMO_DOCS) break
    }
    return rows
  }, [real, mySessions, homeworks])
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

/**
 * How many notes the board's demo state shows. The rail cuts the third card at
 * ~390px and the fifth on a laptop, so nine is comfortably past "there is more
 * to push" at every width — and past the eight the demo asks to see.
 */
export const DEMO_RECENT = 9

/**
 * The board's demo pool — what the S key shows.
 *
 * The REAL last-few-days uploads come first and keep their order, so on a week
 * where the profs published a lot this is simply the true board, untouched. It
 * is only topped up when those days were quiet, from the élève's next-newest
 * replays, so the rail is long enough to flick at any hour of any day.
 *
 * When it DOES pad, it also re-dates the notes across the window — three per
 * day over `RECENT_DAYS`, each keeping its own hour. Padding without that gives
 * a board of "تزادت من 9 يام" under a heading that says آخر 3 أيام, and the
 * gold جديدة seal — the thing the section is built around — never appears. The
 * re-dating is on the COPIES this hook returns; the store is never touched, and
 * `useRecentlyAdded` beside it stays honest.
 *
 * A replay with no `recordingUrl` or no `publishedAt` is never padding: the
 * note is a link to a video, dated by the day it went up.
 */
export function useDemoRecent(now: Date): Session[] {
  const real = useRecentlyAdded(now)
  const pool = useMyPastSessions()
  const day = new Date(now).setHours(0, 0, 0, 0)

  return useMemo(() => {
    if (real.length >= DEMO_RECENT) return real.slice(0, DEMO_RECENT)

    const taken = new Set(real.map((s) => s.id))
    const rest = pool
      .filter((s) => !taken.has(s.id) && s.recordingUrl && s.publishedAt)
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))

    const rows = [...real, ...rest].slice(0, DEMO_RECENT)
    const perDay = Math.ceil(DEMO_RECENT / RECENT_DAYS)

    return rows.map((session, i) => {
      const d = new Date(day)
      d.setDate(d.getDate() - Math.floor(i / perDay))
      const clock = (session.publishedAt ?? "").slice(11, 16) || "09:00"
      const stamp = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${clock}:00`
      return { ...session, publishedAt: stamp }
    })
  }, [real, pool, day])
}

/** No timezone suffix on purpose: these stamps are read back as local time. */
function pad2(n: number): string {
  return String(n).padStart(2, "0")
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
