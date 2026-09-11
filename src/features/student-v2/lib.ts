import { useMemo } from "react"
import type { Homework, ResourceLink, Session, Subject } from "@/data/types"
import { useDemoRecent, useMyHomeworks, useMySessions } from "@/features/student/dashboard/dashboard"
import {
  addDays,
  dateKey,
  sessionEnd,
  sessionStart,
  sessionState,
  type SessionState,
} from "@/features/student/calendar/schedule"
import { seanceVideoPath } from "@/features/student/player/links"
import { useData } from "@/stores/useData"
import { useDemoStates, type DocsMode, type LiveMode } from "./demoStates"

/**
 * The new élève space reads the SAME store through the SAME hooks as the old
 * one (`useMySessions`, `useMyHomeworks`, `sessionState`…) — only the screens
 * are new. Everything here is derived in render; nothing is stored.
 */

export const BASE = "/student-v2"

/**
 * The player's data source (`usePlayerSource`) is shared with the old space
 * and builds its links there. Re-rooting them is all it takes to keep the
 * élève inside the new space while stepping through a playlist.
 */
export function inV2(to: string): string {
  return to.replace(/^\/student\/video/, `${BASE}/video`)
}

/** A séance's replay, in the new player. */
export function v2VideoPath(sessionId: string, opts: { subjectId?: string; groupId?: string } = {}): string {
  return inV2(seanceVideoPath(sessionId, opts))
}

/* ------------------------------------------------------------------ *
 * Dates, in Tunisian Arabic.
 * ------------------------------------------------------------------ */

export const MONTHS = [
  "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
  "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

/** Indexed by `Date.getDay()` — Sunday first, as JS counts. */
export const WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الإربعاء", "الخميس", "الجمعة", "السبت"]

/** The week as the strip lays it out: Monday → Sunday (Tunisian school week). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const pad2 = (n: number) => String(n).padStart(2, "0")

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Monday of the week holding `d`. */
export function weekStart(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7))
}

/** "الثلاثاء 01 سبتمبر" — the frame's own format. */
export function dayLabel(key: string): string {
  const d = parseDay(key)
  return `${WEEKDAYS[d.getDay()]} ${pad2(d.getDate())} ${MONTHS[d.getMonth()]}`
}

/** "اليوم" · "غدوة" · "البارح" · "الخميس 11". */
export function relativeDay(key: string, now: Date): string {
  const diff = Math.round((parseDay(key).getTime() - parseDay(dateKey(now)).getTime()) / 86_400_000)
  if (diff === 0) return "اليوم"
  if (diff === 1) return "غدوة"
  if (diff === -1) return "البارح"
  const d = parseDay(key)
  return `${WEEKDAYS[d.getDay()]} ${pad2(d.getDate())}`
}

/* ------------------------------------------------------------------ *
 * Matière identity on the new cards.
 * ------------------------------------------------------------------ */

/**
 * The frame names matières in FRENCH on the replay cards (« Mathématique »,
 * « Informatique »…) while the rest of the page speaks Derja — the bac
 * sciences are taught in French, and that's the name the élève knows them by.
 * The store names them in Arabic, so this is a display map, not data.
 */
const FRENCH_NAME: Record<string, string> = {
  "رياضيات": "Mathématiques",
  "علوم فيزيائية": "Sciences physiques",
  "علوم الحياة والأرض": "Sciences de la vie et de la terre",
  "إعلامية": "Informatique",
  "خوارزميات": "Algorithmique",
  "اقتصاد": "Économie",
  "تصرّف": "Gestion",
  "فرنسية": "Français",
  "أنڤليزية": "Anglais",
  "ألمانية": "Allemand",
  "إسبانية": "Espagnol",
  "عربية": "Arabe",
  "الأدب العربي": "Littérature arabe",
  "فلسفة": "Philosophie",
  "تاريخ وجغرافيا": "Histoire-géographie",
  "تربية إسلامية": "Éducation islamique",
  "تفكير إسلامي": "Pensée islamique",
  "الحضارة العربية والإسلامية": "Civilisation arabo-islamique",
  "ميكانيك": "Mécanique",
  "كهرباء": "Électricité",
  "تكنولوجيا": "Technologie",
}

export function frenchName(name: string | undefined): string {
  if (!name) return ""
  return FRENCH_NAME[name] ?? name
}

/** session → its first matière, and teacherId → name. */
export function useLookups() {
  const subjects = useData((s) => s.subjects)
  const teachers = useData((s) => s.teachers)
  return useMemo(() => {
    const subjectById = new Map(subjects.map((s) => [s.id, s]))
    const teacherById = new Map(teachers.map((t) => [t.id, t]))
    return {
      subjectOf: (s: Session): Subject | undefined =>
        s.subjectIds.map((id) => subjectById.get(id)).find(Boolean),
      subjectById: (id: string) => subjectById.get(id),
      teacherName: (id?: string) => (id ? teacherById.get(id)?.name : undefined),
      teacherOf: (id?: string) => (id ? teacherById.get(id) : undefined),
    }
  }, [subjects, teachers])
}

/* ------------------------------------------------------------------ *
 * The live séance — which one is on air, and what the panel says.
 * ------------------------------------------------------------------ */

export type LivePick =
  | { kind: "live"; session: Session }
  /** Still to come today. Under `SOON_MS` away the panel opens the door early. */
  | { kind: "countdown"; session: Session | null; target: number }
  /** Just over — the replay isn't online yet, the documents are. */
  | { kind: "ended"; session: Session }
  /** The séance the élève was waiting for won't run at its slot. */
  | { kind: "postponed"; session: Session; next: Session | null }
  | { kind: "none"; next: Session | null }

/** Inside this, a countdown turns into « تبدا بعد شويّة » with the way in open. */
export const SOON_MS = 15 * 60_000
/** How long after its end a séance still owns the panel as « just ended ». */
const ENDED_WINDOW_MS = 60 * 60_000
/** The frame's own countdown — used when the demo asks for one and none is due. */
const DEMO_COUNTDOWN_MS = (3 * 3600 + 16 * 60 + 59) * 1000
const DEMO_SOON_MS = 12 * 60_000

/**
 * What the live panel shows. `auto` is the truth read off the clock, in order
 * of urgency: on air → about to start (≤ 15 min) → just ended (≤ 1 h ago) →
 * later today → today's séance put off → nothing. The forced modes (the states
 * dock) dress REAL records where they can and only invent a target when the
 * data genuinely has nothing to offer.
 */
export function pickLive(sessions: Session[], now: Date, mode: LiveMode, anchor: number): LivePick {
  const t = now.getTime()
  const today = dateKey(now)
  const sorted = [...sessions].sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
  const usable = sorted.filter((s) => !s.postponed)
  const todays = usable.filter((s) => s.date === today)
  const running = todays.find((s) => sessionState(s, now) === "en-cours")
  const laterToday = todays.find((s) => sessionStart(s).getTime() > t)
  const nextAny = usable.find((s) => sessionStart(s).getTime() > t) ?? null
  const past = usable.filter((s) => sessionEnd(s).getTime() <= t)
  const lastPast = past[past.length - 1] ?? null
  const justEnded = lastPast && t - sessionEnd(lastPast).getTime() < ENDED_WINDOW_MS ? lastPast : null
  const offToday = sorted.find((s) => s.postponed && s.date === today) ?? null
  const after = (s: Session) => usable.find((x) => sessionStart(x).getTime() > sessionStart(s).getTime()) ?? null

  if (mode === "auto") {
    if (running) return { kind: "live", session: running }
    if (laterToday && sessionStart(laterToday).getTime() - t <= SOON_MS)
      return { kind: "countdown", session: laterToday, target: sessionStart(laterToday).getTime() }
    if (justEnded) return { kind: "ended", session: justEnded }
    if (laterToday) return { kind: "countdown", session: laterToday, target: sessionStart(laterToday).getTime() }
    if (offToday) return { kind: "postponed", session: offToday, next: nextAny }
    return { kind: "none", next: nextAny }
  }
  if (mode === "live") {
    const dressed = running ?? laterToday ?? todays[todays.length - 1] ?? nextAny
    return dressed ? { kind: "live", session: dressed } : { kind: "none", next: null }
  }
  if (mode === "soon") {
    return { kind: "countdown", session: laterToday ?? nextAny, target: anchor + DEMO_SOON_MS }
  }
  if (mode === "countdown") {
    const soon = laterToday ?? (nextAny && sessionStart(nextAny).getTime() - t < 86_400_000 ? nextAny : null)
    if (soon) return { kind: "countdown", session: soon, target: sessionStart(soon).getTime() }
    return { kind: "countdown", session: nextAny, target: anchor + DEMO_COUNTDOWN_MS }
  }
  if (mode === "ended") {
    const dressed = justEnded ?? lastPast
    return dressed ? { kind: "ended", session: dressed } : { kind: "none", next: nextAny }
  }
  if (mode === "postponed") {
    const dressed = offToday ?? laterToday ?? nextAny
    return dressed ? { kind: "postponed", session: dressed, next: after(dressed) } : { kind: "none", next: null }
  }
  return { kind: "none", next: nextAny }
}

/**
 * A séance's state as the whole page sees it. The séance the live panel is
 * dressing as « on air » reads as running everywhere — the calendar must not
 * contradict the panel beside it.
 */
export function stateOf(s: Session, now: Date, liveId: string | null): SessionState {
  if (liveId && s.id === liveId) return "en-cours"
  const state = sessionState(s, now)
  // Only one séance is on air at a time: while another is being shown live,
  // a real running one reads as merely scheduled rather than as a second live.
  if (liveId && state === "en-cours") return "prevue"
  return state
}

/**
 * The live pick and the state every séance on the page reads — ONE place, so
 * the dashboard, the calendar and the séance page can never disagree about
 * which séance is on air or which one was put off (the states dock can dress
 * either, and a dressed séance must read that way everywhere).
 */
export function useLiveState(now: Date) {
  const mine = useMySessions()
  const { live, anchor } = useDemoStates()
  return useMemo(() => {
    const pick = pickLive(mine, now, live, anchor)
    const liveId = pick.kind === "live" ? pick.session.id : null
    const offId = pick.kind === "postponed" ? pick.session.id : null
    const stateFor = (s: Session): SessionState => (s.id === offId ? "reportee" : stateOf(s, now, liveId))
    return { pick, stateFor }
  }, [mine, now, live, anchor])
}

/* ------------------------------------------------------------------ *
 * Documents — what to download before the next séances.
 * ------------------------------------------------------------------ */

export interface SessionDoc {
  id: string
  pdf: ResourceLink
  /** Absent on the séance's own course support (see `useSessionDocs`). */
  homework?: Homework
  session: Session
  kind: "exercice" | "cours"
}

/**
 * One row per PDF attached (through a خدمة) to a séance still ahead of the
 * élève in the next `days` days — the frame's « تمارين والكور متع الحصص
 * الجاية ». Earliest séance first: that's the one to prepare for.
 */
export function useUpcomingDocs(now: Date, days = 7): SessionDoc[] {
  const mine = useMySessions()
  const homeworks = useMyHomeworks()
  const minute = Math.floor(now.getTime() / 60_000)

  return useMemo(() => {
    const t = minute * 60_000
    const horizon = dateKey(addDays(new Date(t), days))
    const ahead = mine
      .filter((s) => !s.postponed && sessionEnd(s).getTime() > t && s.date <= horizon)
      .sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
    const rows: SessionDoc[] = []
    for (const session of ahead) {
      for (const homework of homeworks) {
        if (homework.sessionId !== session.id) continue
        homework.pdfs.forEach((pdf, i) =>
          rows.push({ id: `${homework.id}#${i}`, pdf, homework, session, kind: "exercice" }),
        )
      }
    }
    return rows
  }, [mine, homeworks, minute, days])
}

/** How many cards the « برشا » demo state shows — enough that the rail must scroll. */
const DEMO_DOCS = 6

/**
 * The documents panel's pool for a demo state. `auto` is the truth; `many`
 * tops the real rows up to `DEMO_DOCS` with the élève's other خدمة PDFs,
 * DRESSED onto the séances coming up (copies only — the store is untouched),
 * so the crowded week can be shown on a quiet one.
 */
export function useDocsPool(now: Date, mode: DocsMode): SessionDoc[] {
  const real = useUpcomingDocs(now)
  const mine = useMySessions()
  const homeworks = useMyHomeworks()
  const minute = Math.floor(now.getTime() / 60_000)

  return useMemo(() => {
    if (mode === "empty") return []
    if (mode !== "many" || real.length >= DEMO_DOCS) return real
    const t = minute * 60_000
    const ahead = mine
      .filter((s) => !s.postponed && sessionEnd(s).getTime() > t)
      .sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
    if (ahead.length === 0) return real
    const taken = new Set(real.map((r) => r.id))
    const rows = [...real]
    for (const homework of homeworks) {
      // Dressed onto a coming séance of its OWN matière — a French text pinned
      // to a physics séance would give the padding away.
      const session = ahead.find((s) => s.subjectIds.includes(homework.subjectId))
      if (!session) continue
      for (let i = 0; i < homework.pdfs.length && rows.length < DEMO_DOCS; i++) {
        const id = `${homework.id}#${i}`
        if (taken.has(id)) continue
        rows.push({ id, pdf: homework.pdfs[i], homework, session, kind: "exercice" })
      }
    }
    return rows.sort((a, b) => sessionStart(a.session).getTime() - sessionStart(b.session).getTime())
  }, [mode, real, mine, homeworks, minute])
}

/**
 * Everything a séance's « وثائق الحصّة » sheet lists: the خدمة PDFs sent for
 * it, and — once the séance has started — its course support. The store has no
 * course file per séance, so that row is a display-only placeholder named
 * after the séance (a prototype stand-in, never written to the store).
 */
export function useSessionDocs(session: Session | null, started: boolean): SessionDoc[] {
  const homeworks = useMyHomeworks()
  return useMemo(() => {
    if (!session) return []
    const rows: SessionDoc[] = []
    if (started) {
      rows.push({
        id: `${session.id}#cours`,
        pdf: { name: `${session.title}.pdf` },
        session,
        kind: "cours",
      })
    }
    for (const homework of homeworks) {
      if (homework.sessionId !== session.id) continue
      homework.pdfs.forEach((pdf, i) =>
        rows.push({ id: `${homework.id}#${i}`, pdf, homework, session, kind: "exercice" }),
      )
    }
    return rows
  }, [session, started, homeworks])
}

/**
 * The replays board's pool (`useDemoRecent`, the same one the old dashboard
 * shows), with one correction: that pool re-dates its padding onto today at
 * each replay's own hour, so at noon a card can claim « تزادت اليوم . 18:30h »
 * — an upload from the future. Anything stamped after now is walked back to
 * a plausible earlier hour today. Copies only; the store is never touched.
 */
export function useV2Recent(now: Date): Session[] {
  const pool = useDemoRecent(now)
  const minute = Math.floor(now.getTime() / 60_000)
  return useMemo(() => {
    const t = minute * 60_000
    let back = 0
    return pool
      .map((s) => {
        if (!s.publishedAt || new Date(s.publishedAt).getTime() <= t) return s
        back += 1
        const d = new Date(t - back * 47 * 60_000)
        return { ...s, publishedAt: `${dateKey(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00` }
      })
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  }, [pool, minute])
}

/** "16:00h" — the frame writes an upload's hour this way. */
export function hourOf(iso: string | undefined): string {
  const clock = (iso ?? "").slice(11, 16)
  return clock ? `${clock}h` : ""
}
