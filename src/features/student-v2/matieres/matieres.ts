import { useMemo } from "react"
import { BookOpen, FileText, Layers, ListChecks, PencilLine, type LucideIcon } from "lucide-react"
import type { Chapter, Exam, Lesson, Path, Quiz, Subject } from "@/data/types"
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

/** The matières of the élève's own année, in curriculum order. */
export function useMySubjects(): Subject[] {
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const yearId = user?.yearIds?.[0]
  return useMemo(
    () => (yearId ? subjects.filter((s) => s.yearId === yearId).sort(byOrder) : []),
    [subjects, yearId],
  )
}

/** « 3 دروس · 2 كويز » — a chapitre's line under its title. */
export function chapterMeta(b: ChapterBundle): string {
  if (b.empty) return "محتوى سيتوفر قريباً"
  return `${b.lessonCount} محتوى، ${b.quizCount} كويز`
}
