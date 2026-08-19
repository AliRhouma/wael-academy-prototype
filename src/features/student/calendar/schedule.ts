import { useEffect, useMemo, useState } from "react"
import type { Homework, Session } from "@/data/types"
import { useMyHomeworks } from "@/features/student/dashboard/dashboard"
import { subjectTheme, type SubjectTheme } from "@/features/student/subjectTheme"
import { subjectTint, type SubjectTint } from "@/features/student/subjectTint"
import { useData } from "@/stores/useData"

/* ------------------------------------------------------------------ *
 * Day / week arithmetic — all local, no timezone drift.
 * ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0")

/** Local "YYYY-MM-DD" key for a Date. */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

/** "HH:MM" → minutes since midnight. */
export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + (m || 0)
}

/** Minutes since midnight for a Date. */
export function minutesNow(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** "1 سا 30" · "2 سا" · "45 دقيقة" — how long a séance runs. */
export function formatDuration(start: string, end: string): string {
  const total = Math.max(minutesOf(end) - minutesOf(start), 0)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} دقيقة`
  return m === 0 ? `${h} سا` : `${h} سا ${pad(m)}`
}

/**
 * Re-render every minute so the "maintenant" line creeps down the grid and a
 * séance flips to « En cours » / « Terminée » while the élève watches. Ticks on
 * the minute boundary, not every 60 s from mount.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: number
    const schedule = () => {
      const next = 60_000 - (Date.now() % 60_000)
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, next)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])
  return now
}

/** Below this, a wait is worth watching tick by tick instead of in words. */
export const TICKING_WINDOW_MS = 12 * 60 * 60 * 1000

/**
 * One-second heartbeat for a live countdown. Only mounted while a countdown is
 * actually on screen — `useNow()` alone ticks once a minute, which is right for
 * the grid and far too slow for "03:12:44".
 */
export function useSecond(enabled: boolean): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [enabled])
  return tick
}

/* ------------------------------------------------------------------ *
 * State of a séance — the whole screen keys off these three.
 * ------------------------------------------------------------------ */

export type SessionState = "reportee" | "terminee" | "en-cours" | "prevue"

/**
 * WHAT A SÉANCE IS RIGHT NOW. Three of the four states are read off the clock;
 * « reportée » is the exception and it WINS, whatever the hour says — a séance
 * put off doesn't quietly become « terminée » once its old slot has passed, and
 * it certainly never shows as « en cours ».
 */
export function sessionState(s: Session, now: Date): SessionState {
  if (s.postponed) return "reportee"
  const today = dateKey(now)
  if (s.date < today) return "terminee"
  if (s.date > today) return "prevue"
  const mins = minutesNow(now)
  if (mins >= minutesOf(s.endTime)) return "terminee"
  return mins >= minutesOf(s.startTime) ? "en-cours" : "prevue"
}

export const STATE_LABEL: Record<SessionState, string> = {
  reportee: "تأجلت",
  terminee: "انتهت",
  "en-cours": "قاعدة",
  prevue: "مبرمجة",
}

/* ------------------------------------------------------------------ *
 * Countdown — "combien de temps avant / depuis".
 * ------------------------------------------------------------------ */

/** Real Date of a séance's start / end (local, from its "YYYY-MM-DD" + "HH:MM"). */
function at(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number)
  const [h, mi] = time.split(":").map(Number)
  return new Date(y, mo - 1, d, h, mi)
}

export const sessionStart = (s: Session) => at(s.date, s.startTime)
export const sessionEnd = (s: Session) => at(s.date, s.endTime)

export interface UpNext {
  session: Session
  /** ms until it starts — negative once it has started. */
  startsIn: number
  /** ms until it ends. */
  endsIn: number
  live: boolean
}

/** The séance the élève is heading towards: running now, else the next to start. */
export function nextUp(sessions: Session[], now: Date): UpNext | null {
  const t = now.getTime()
  const ahead = sessions
    .filter((s) => sessionEnd(s).getTime() > t)
    .sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
  const session = ahead[0]
  if (!session) return null
  const startsIn = sessionStart(session).getTime() - t
  const endsIn = sessionEnd(session).getTime() - t
  return { session, startsIn, endsIn, live: startsIn <= 0 }
}

/** "03:12:44" — a real countdown, for anything happening within the day. */
export function formatCountdown(ms: number): string {
  const total = Math.max(Math.floor(ms / 1000), 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/**
 * A distance in words — "dans 3 h 12", "il y a 2 jours". Used where a ticking
 * countdown would be noise (a séance three days out, one long past).
 */
export function formatAway(ms: number): string {
  const past = ms < 0
  const min = Math.round(Math.abs(ms) / 60_000)
  const say = (v: string) => (past ? `من ${v}` : `بعد ${v}`)
  if (min < 1) return "توّا"
  if (min < 60) return say(`${min} دقيقة`)
  const h = Math.floor(min / 60)
  if (h < 24) {
    const m = min % 60
    return say(m === 0 ? `${h} سا` : `${h} سا ${pad(m)}`)
  }
  const d = Math.round(h / 24)
  return say(d === 1 ? "نهار" : `${d} يام`)
}

/** The relative label a card wears, given what state it's in. */
export function cardTiming(s: Session, now: Date): string {
  const state = sessionState(s, now)
  if (state === "en-cours") return `تسالي ${formatAway(sessionEnd(s).getTime() - now.getTime())}`
  if (state === "prevue") return `تبدا ${formatAway(sessionStart(s).getTime() - now.getTime())}`
  return formatAway(sessionEnd(s).getTime() - now.getTime())
}

/* ------------------------------------------------------------------ *
 * Grid geometry.
 * ------------------------------------------------------------------ */

/** Vertical scale of the day grid. 1.8 px/min → an hour is a roomy 108 px. */
export const PX_PER_MIN = 1.8

/**
 * Shortest slot a card may occupy, in minutes. A 30-minute séance still gets a
 * card tall enough to read; the layout below reserves that room so cards never
 * collide because of it.
 */
const MIN_SLOT = 52

/** Hours the grid always shows, before it stretches to fit the day. */
const DEFAULT_FROM = 8
const DEFAULT_TO = 19

export interface PlacedSession {
  session: Session
  /** Offset from the top of the grid, in px. */
  top: number
  height: number
  /** Column index and column count of its overlap cluster (side-by-side cards). */
  lane: number
  lanes: number
}

export interface DayLayout {
  /** First / last hour drawn (integers, 0–24). */
  fromHour: number
  toHour: number
  hours: number[]
  heightPx: number
  placed: PlacedSession[]
  /** Where a given minute-of-day sits on the grid, in px. */
  yOf: (minutes: number) => number
}

/**
 * Lay one day out on the time axis: pick the hour window, then place each séance
 * at its real time with its real duration. Séances that overlap are split into
 * side-by-side lanes (rare for one élève, but it keeps the grid honest).
 */
export function layoutDay(sessions: Session[], nowMinutes: number | null): DayLayout {
  const sorted = [...sessions].sort((a, b) => minutesOf(a.startTime) - minutesOf(b.startTime))

  const starts = sorted.map((s) => minutesOf(s.startTime))
  const ends = sorted.map((s) => Math.max(minutesOf(s.endTime), minutesOf(s.startTime) + MIN_SLOT))

  let fromHour = DEFAULT_FROM
  let toHour = DEFAULT_TO
  if (sorted.length > 0) {
    fromHour = Math.min(fromHour, Math.floor(Math.min(...starts) / 60))
    toHour = Math.max(toHour, Math.ceil(Math.max(...ends) / 60))
  }
  // On today, the "maintenant" line has to be somewhere on the grid.
  if (nowMinutes !== null) {
    fromHour = Math.min(fromHour, Math.floor(nowMinutes / 60))
    toHour = Math.max(toHour, Math.ceil(nowMinutes / 60) + 1)
  }
  fromHour = Math.max(0, fromHour)
  toHour = Math.min(24, Math.max(toHour, fromHour + 1))

  const fromMin = fromHour * 60
  const yOf = (minutes: number) => (minutes - fromMin) * PX_PER_MIN

  // Greedy lane assignment inside each cluster of overlapping séances.
  const placed: PlacedSession[] = []
  let cluster: number[] = []
  let clusterEnd = -1

  const flush = () => {
    if (cluster.length === 0) return
    const laneEnds: number[] = []
    const assigned = cluster.map((i) => {
      let lane = laneEnds.findIndex((end) => end <= starts[i])
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = ends[i]
      return lane
    })
    const lanes = laneEnds.length
    cluster.forEach((i, k) => {
      placed.push({
        session: sorted[i],
        top: yOf(starts[i]),
        height: (ends[i] - starts[i]) * PX_PER_MIN,
        lane: assigned[k],
        lanes,
      })
    })
    cluster = []
    clusterEnd = -1
  }

  sorted.forEach((_, i) => {
    if (cluster.length > 0 && starts[i] >= clusterEnd) flush()
    cluster.push(i)
    clusterEnd = Math.max(clusterEnd, ends[i])
  })
  flush()

  return {
    fromHour,
    toHour,
    hours: Array.from({ length: toHour - fromHour + 1 }, (_, i) => fromHour + i),
    heightPx: (toHour - fromHour) * 60 * PX_PER_MIN,
    placed,
    yOf,
  }
}

/* ------------------------------------------------------------------ *
 * Matière identity — a séance wears its matière's colour and glyph, the
 * same ones the Matières grid and the matière page use.
 * ------------------------------------------------------------------ */

export interface SessionVisual {
  subjectName?: string
  /** Category tokens — the title, the rail, the ring. */
  theme: SubjectTheme
  /** The matière artwork's own colour, for the surfaces under the glyph. */
  tint: SubjectTint
}

/* ------------------------------------------------------------------ *
 * خدمة (travail à faire) attached to a séance.
 * ------------------------------------------------------------------ */

/** No خدمة on a séance — one shared array, so callers keep a stable identity. */
const NO_HOMEWORK: Homework[] = []

/**
 * MY خدمة, indexed by the séance it hangs on — the calendar's notification
 * source. Scoped by `useMyHomeworks()`, so a séance only lights up for the
 * élèves the prof actually sent the work to; the rest of the groupe sees a
 * plain card. Derived in render, never stored.
 */
export function useHomeworkBySession(): (session: Session) => Homework[] {
  const mine = useMyHomeworks()
  return useMemo(() => {
    const byId = new Map<string, Homework[]>()
    for (const h of mine) {
      if (!h.sessionId) continue
      const list = byId.get(h.sessionId)
      if (list) list.push(h)
      else byId.set(h.sessionId, [h])
    }
    return (session: Session) => byId.get(session.id) ?? NO_HOMEWORK
  }, [mine])
}

export function useSessionVisual(): (session: Session) => SessionVisual {
  const subjects = useData((s) => s.subjects)
  return useMemo(() => {
    const byId = new Map(subjects.map((s) => [s.id, s]))
    return (session: Session) => {
      const subject = session.subjectIds.map((id) => byId.get(id)).find(Boolean)
      return {
        subjectName: subject?.name,
        theme: subjectTheme(subject?.category),
        tint: subjectTint(subject?.name ?? "", subject?.category),
      }
    }
  }, [subjects])
}
