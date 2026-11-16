import { create } from "zustand"
import yearsSeed from "@/data/seed/years.json"
import subjectsSeed from "@/data/seed/subjects.json"
import quizSeed from "@/data/seed/onboarding-quiz.json"
import { matiereKey } from "@/data/matiere"
import type { Subject, Year } from "@/data/types"

/**
 * The game app's first launch — « تعرّف على وائل » — before any account:
 * welcome → level (+ section) → favourite matière → 3 questions → result →
 * the account that keeps it. Research: docs/onboarding/*.md.
 *
 * The guest's answers live here, in memory (a refresh starts the flow over,
 * like every store in the prototype). The sign-up screen reads them so it
 * never asks twice, and the town greets the new account with the score.
 */

const YEARS = (yearsSeed as unknown as Year[]).filter((y) => y.cycle === "secondaire" || y.cycle === "bac")
const SUBJECTS = subjectsSeed as unknown as Subject[]

/* ------------------------------------------------------------------ *
 * Levels and sections — straight from years.json, grouped by `level`.
 * ------------------------------------------------------------------ */

export interface LevelGroup {
  /** « أولى ثانوي », « باك »… as seeded. */
  level: string
  /** What the big tile says. */
  short: string
  /** The digit on the tile, or « Bac ». */
  mark: string
  /** The years of the group; one with no section → no section step. */
  years: Year[]
}

const SHORT: Record<string, [string, string]> = {
  "أولى ثانوي": ["أولى", "1"],
  "ثانية ثانوي": ["ثانية", "2"],
  "ثالثة ثانوي": ["ثالثة", "3"],
  "باك": ["باك", "Bac"],
}

export const LEVEL_GROUPS: LevelGroup[] = Object.entries(SHORT).map(([level, [short, mark]]) => ({
  level,
  short,
  mark,
  years: YEARS.filter((y) => y.level === level).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
}))

export const yearById = (id: string | null) => YEARS.find((y) => y.id === id) ?? null
export const groupOf = (year: Year | null) => LEVEL_GROUPS.find((g) => g.level === year?.level) ?? null

/** « باك علوم تجريبية », « أولى ثانوي » — for summaries. */
export function yearLabel(year: Year | null): string {
  if (!year) return ""
  const g = groupOf(year)
  return year.section ? `${g?.short ?? year.level} ${year.section}` : year.level
}

/* ------------------------------------------------------------------ *
 * Matières of a year — one card per matière (the catalogue splits
 * تاريخ / جغرافيا on the bac rows; they're one matière here).
 * ------------------------------------------------------------------ */

export interface Matiere {
  /** The seeded subject name — what the quiz and the badges key from. */
  name: string
  /** The matière as the student reads it (« رياضيات », not « Bac Math - Maths »). */
  label: string
  principal: boolean
}

export function matieresOf(yearId: string | null): Matiere[] {
  const seen = new Set<string>()
  return SUBJECTS.filter((s) => s.yearId === yearId && s.category !== "optionnelle" && !s.name.includes("مع وائل"))
    .sort((a, b) => Number(b.category === "principale") - Number(a.category === "principale"))
    .flatMap((s) => {
      const label = matiereKey(s.name)
      if (seen.has(label)) return []
      seen.add(label)
      return [{ name: s.name, label, principal: s.category === "principale" }]
    })
}

/* ------------------------------------------------------------------ *
 * The quiz — 3 questions from the programme, per (year, matière).
 * ------------------------------------------------------------------ */

export interface Question {
  lang: "fr" | "ar" | "en"
  q: string
  choices: string[]
  answer: number
  explain: string
  chapter: string
}

interface Entry {
  id: string
  matiere: string
  years: string[]
  questions: Question[]
}

const ENTRIES = (quizSeed as unknown as { entries: Entry[] }).entries

/**
 * Round 1: the year's own set (else the matière's generic one). Later rounds
 * take the matière's next set — the generic one first, then the other years'
 * — so « الجولة الثانية » is honestly new questions.
 */
export function quizFor(yearId: string | null, subjectName: string | null, round = 1): Question[] {
  if (!yearId || !subjectName) return []
  const key = matiereKey(subjectName)
  const own = ENTRIES.find((e) => e.matiere === key && e.years.includes(yearId))
  const generic = ENTRIES.find((e) => e.matiere === key && e.years.length === 0)
  const others = ENTRIES.filter((e) => e.matiere === key && e !== own && e !== generic)
  const sets = [own, generic, ...others].filter((e): e is Entry => !!e)
  return sets[(round - 1) % Math.max(1, sets.length)]?.questions.slice(0, 3) ?? []
}

/** Points the game app gives per right answer — the town's currency. */
export const POINTS_PER_RIGHT = 10

/* ------------------------------------------------------------------ *
 * The guest's run.
 * ------------------------------------------------------------------ */

interface OnboardingState {
  yearId: string | null
  subject: string | null
  /** The choice picked for each question, null while unanswered. */
  answers: (number | null)[]
  finished: boolean
  /** 1 for the guest's game; « عاود العب » (with an account) moves on. */
  round: number
  setYear: (id: string) => void
  setSubject: (name: string) => void
  answer: (index: number, choice: number) => void
  finish: () => void
  /** Play again (after the account) — same level and matière, fresh answers. */
  replay: () => void
}

export const useOnboarding = create<OnboardingState>()((set) => ({
  yearId: null,
  subject: null,
  answers: [null, null, null],
  finished: false,
  round: 1,
  setYear: (id) => set((s) => (s.yearId === id ? s : { yearId: id, subject: null, answers: [null, null, null], finished: false, round: 1 })),
  setSubject: (name) => set((s) => (s.subject === name ? s : { subject: name, answers: [null, null, null], finished: false, round: 1 })),
  answer: (index, choice) =>
    set((s) => {
      if (s.answers[index] != null) return s
      const answers = [...s.answers]
      answers[index] = choice
      return { answers }
    }),
  finish: () => set({ finished: true }),
  replay: () => set((s) => ({ answers: [null, null, null], finished: false, round: s.round + 1 })),
}))

/** Right answers so far — derived, never stored. */
export function useScore() {
  const { yearId, subject, answers, round } = useOnboarding()
  const questions = quizFor(yearId, subject, round)
  const right = answers.filter((a, i) => a != null && questions[i] && a === questions[i].answer).length
  return { right, total: questions.length || 3, points: right * POINTS_PER_RIGHT, questions }
}
