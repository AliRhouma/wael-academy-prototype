import { useMemo } from "react"
import { BookOpen, FileText, Layers, ListChecks, PencilLine, type LucideIcon } from "lucide-react"
import type { Chapter, Exam, Lesson, Path, Quiz, Subject, Year } from "@/data/types"
import { lessonVideoPath, examVideoPath } from "@/features/student/player/links"
import { useData } from "@/stores/useData"
import { useAuth } from "@/stores/useAuth"
import { inV2 } from "../lib"

/**
 * « موادي » — what a matière is made of, derived from the store in render.
 *
 * The frame (« Main Pgae - Calendar months (7) ») was drawn straight off this
 * seed: sciences de la vie et de la terre, its seven chapitres, « La
 * reproduction humaine » open with « 1 محتوى، 0 كويز », and the chapitres with
 * nothing in them wearing « قريباً ». So the empty state is not decoration
 * here — it is most of the curriculum, and it stays data-driven.
 */

/** What a chapitre can hold. The frame's five filter chips, in its order. */
export type ItemKind = "cours" | "exercice" | "serie" | "resume" | "quiz"

export const KINDS: { key: ItemKind; label: string; ribbon: string; icon: LucideIcon }[] = [
  { key: "cours", label: "دروس", ribbon: "COURS", icon: BookOpen },
  { key: "exercice", label: "تمرين", ribbon: "EXERCICE", icon: PencilLine },
  { key: "serie", label: "سلسلة تمارين", ribbon: "SÉRIE", icon: Layers },
  { key: "resume", label: "ملخص", ribbon: "RÉSUMÉ", icon: FileText },
  { key: "quiz", label: "كويز", ribbon: "QUIZ", icon: ListChecks },
]

export const kindOf = (k: ItemKind) => KINDS.find((x) => x.key === k)!

/**
 * THE TWO BUTTONS an open chapitre offers: « دروس » and « تمارين ».
 *
 * Five chips (cours · exercice · série · résumé · quiz) asked the élève to sort
 * out the académie's own filing before finding anything, and three of them were
 * empty on most chapitres. There are only two questions an élève actually
 * arrives with — "montre-moi le cours" and "donne-moi de quoi m'entraîner" — so
 * there are two buttons, and each kind falls on the side it belongs to:
 *
 *  - un résumé IS the cours without the video, so it sits under « دروس »;
 *  - une série and un quiz are both practice, so they sit under « تمارين ».
 *
 * Nothing is hidden by the reduction — every contenu still reaches a button —
 * and each card keeps its OWN ribbon (SÉRIE, RÉSUMÉ, QUIZ), so the élève still
 * sees exactly what a row is once the family has brought it to them.
 */
export interface KindFamily {
  key: "cours" | "exercice"
  label: string
  icon: LucideIcon
  /** The item kinds this button gathers, ribbons unchanged. */
  kinds: ItemKind[]
}

export const FAMILIES: KindFamily[] = [
  { key: "cours", label: "دروس", icon: BookOpen, kinds: ["cours", "resume"] },
  { key: "exercice", label: "تمارين", icon: PencilLine, kinds: ["exercice", "serie", "quiz"] },
]

export const familyOf = (k: KindFamily["key"]) => FAMILIES.find((f) => f.key === k)!

/** How many contenus a family holds in a chapitre. */
export const familyCount = (f: KindFamily, byKind: Record<ItemKind, number>) =>
  f.kinds.reduce((n, k) => n + byKind[k], 0)

/** One row inside an open chapitre — a contenu or a quiz, same card either way. */
export interface ChapterItem {
  id: string
  kind: ItemKind
  title: string
  /** The replay, in the new player — absent when the contenu has no video. */
  videoPath?: string
  files: { name: string }[]
  /** Minutes, quizzes only. */
  durationMin?: number
  questionCount?: number
}

export interface ChapterBundle {
  chapter: Chapter
  items: ChapterItem[]
  /** Per-kind counts, for the filter chips. */
  byKind: Record<ItemKind, number>
  lessonCount: number
  quizCount: number
  /** Contenus carrying a replay — what the chapitre promises to play. */
  videoCount: number
  /** Everything the « تمارين » button gathers: exercices, séries, quiz. */
  exerciceCount: number
  /** Nothing published yet — the frame's « قريباً » card. */
  empty: boolean
}

export interface SubjectBundle {
  subject?: Subject
  chapters: ChapterBundle[]
  paths: Path[]
  exams: Exam[]
  /** The three head tabs' badges. */
  counts: { parcours: number; chapitres: number; examens: number }
}

const byOrder = <T extends { order?: number }>(a: T, b: T) => (a.order ?? 0) - (b.order ?? 0)

function lessonItem(lesson: Lesson, subjectId: string): ChapterItem {
  return {
    id: lesson.id,
    kind: lesson.kind as ItemKind,
    title: lesson.title,
    videoPath: lesson.videoUrl ? inV2(lessonVideoPath(lesson.id, subjectId)) : undefined,
    files: lesson.pdfs ?? [],
  }
}

function quizItem(quiz: Quiz): ChapterItem {
  return {
    id: quiz.id,
    kind: "quiz",
    title: quiz.title,
    files: [],
    durationMin: quiz.durationMin,
    questionCount: quiz.questions?.length ?? 0,
  }
}

/** Everything one matière's page shows, in one pass over the store. */
export function useSubjectBundle(subjectId: string | undefined): SubjectBundle {
  const subjects = useData((s) => s.subjects)
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const quizzes = useData((s) => s.quizzes)
  const paths = useData((s) => s.paths)
  const exams = useData((s) => s.exams)

  return useMemo(() => {
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) {
      return { subject: undefined, chapters: [], paths: [], exams: [], counts: { parcours: 0, chapitres: 0, examens: 0 } }
    }

    const mine = chapters.filter((c) => c.subjectIds.includes(subject.id)).sort(byOrder)

    const bundles: ChapterBundle[] = mine.map((chapter) => {
      const its = [
        ...lessons.filter((l) => l.chapterId === chapter.id).sort(byOrder).map((l) => lessonItem(l, subject.id)),
        ...quizzes.filter((q) => q.chapterId === chapter.id).sort(byOrder).map(quizItem),
      ]
      const byKind = KINDS.reduce(
        (acc, k) => ({ ...acc, [k.key]: its.filter((i) => i.kind === k.key).length }),
        {} as Record<ItemKind, number>,
      )
      const quizCount = byKind.quiz
      return {
        chapter,
        items: its,
        byKind,
        lessonCount: its.length - quizCount,
        quizCount,
        videoCount: its.filter((i) => i.videoPath).length,
        exerciceCount: familyCount(FAMILIES[1], byKind),
        empty: its.length === 0,
      }
    })

    const myPaths = paths.filter((p) => p.subjectId === subject.id).sort(byOrder)
    const myExams = exams.filter((e) => e.subjectIds.includes(subject.id)).sort(byOrder)

    return {
      subject,
      chapters: bundles,
      paths: myPaths,
      exams: myExams,
      counts: { parcours: myPaths.length, chapitres: bundles.length, examens: myExams.length },
    }
  }, [subjects, chapters, lessons, quizzes, paths, exams, subjectId])
}

/** An examen's filmed correction, in the new player. */
export function examPath(exam: Exam, subjectId: string): string | undefined {
  return exam.videoUrl ? inV2(examVideoPath(exam.id, subjectId)) : undefined
}

/** One filière on « موادي » — its classe, its matières, and whether it's mine. */
export interface SubjectSection {
  year: Year
  subjects: Subject[]
  /** The élève's own filière: it leads the page and opens itself. */
  mine: boolean
}

/**
 * « موادي », widened: the élève's own filière first, then every bac of the
 * programme. The académie teaches the six bacs off ONE library — the philo
 * chapitre is the same chapitre in all of them — so an élève who wants to see
 * what else is published should not have to change account to find it. Their
 * own filière still leads and is the only one open, so the page still answers
 * "what am I studying" before it answers "what else is there".
 */
export function useSubjectSections(): SubjectSection[] {
  const user = useAuth((s) => s.currentUser)
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const myYearId = user?.yearIds?.[0]

  return useMemo(() => {
    const mine = years.find((y) => y.id === myYearId)
    const bacs = years.filter((y) => y.cycle === "bac" && y.id !== myYearId).sort(byOrder)
    // A collège / secondaire élève keeps their own classe at the top; for a bac
    // élève `mine` IS one of the bacs, which is why it was excluded above.
    const ordered = mine ? [mine, ...bacs] : bacs
    return ordered.map((year) => ({
      year,
      subjects: subjects.filter((s) => s.yearId === year.id).sort(byOrder),
      mine: year.id === myYearId,
    }))
  }, [years, subjects, myYearId])
}

/**
 * « 4 فيديو · 1 تمرين » — a chapitre's line under its title.
 *
 * Not a count of rows. The élève opens a chapitre to watch and to practise, so
 * the line answers those two: how many contenus actually carry a replay, and
 * how much there is to work on — the same set the « تمارين » button gathers,
 * quiz and séries included. A contenu without a video isn't counted as one:
 * the line promises replays, so it has to promise the right number.
 */
export function chapterMeta(b: ChapterBundle): string {
  // A locked door, in game vocabulary — not a blame, not an absence.
  if (b.empty) return "مسكّر توّا — يحلّ قريب"
  const exercices = b.exerciceCount === 1 ? "تمرين" : "تمارين"
  return `${b.videoCount} فيديو · ${b.exerciceCount} ${exercices}`
}
