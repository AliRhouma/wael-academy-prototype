/**
 * "Dupliquer" for every piece of the programme. A copy is a real, independent
 * row (new ids) that can land ANYWHERE: the screens ask for a name and a
 * destination (another classe / matière / chapitre) and pass them in here.
 *
 * Containers copy their content too, so a duplicate is immediately usable:
 *  - un chapitre brings its contenus, quiz and examens de quiz,
 *  - une matière brings its chapitres (with all of the above), parcours & examens,
 *  - une classe brings all of its matières.
 * Parcours keep working because their steps are re-pointed at the copies.
 *
 * These are plain data copies (no domain logic) called straight from the
 * screens; they read/write the shared store via `useData.getState()`.
 */
import { useData } from "@/stores/useData"
import type { Chapter, Cycle, Exam, Lesson, Path, Quiz, QuizExam, Subject, Year } from "@/data/types"
import { yearName } from "@/data/curriculum"

/** "Chapitre 1" → "Chapitre 1 (copie)". */
export function copyName(name: string): string {
  return `${name} (copie)`
}

/** Sort key that drops the copy immediately after its original. */
const after = (order?: number) => (order ?? 0) + 0.5

/**
 * Where a copy sits: right after its original when it stays in the same parent,
 * appended at the end when it moves somewhere else.
 */
const slot = (samePlace: boolean, srcOrder: number | undefined, siblings: number) =>
  samePlace ? after(srcOrder) : siblings

/** Old id → new id, for the lessons & quizzes a parcours may point at. */
type RefMap = Map<string, string>

/** Copies one contenu into a chapter — its own by default. */
export function duplicateLesson(
  lesson: Lesson,
  opts: { chapterId?: string; title?: string; order?: number } = {},
): Lesson {
  const s = useData.getState()
  const chapterId = opts.chapterId ?? lesson.chapterId
  return s.addLesson({
    title: opts.title ?? lesson.title,
    kind: lesson.kind,
    videoUrl: lesson.videoUrl,
    pdfs: lesson.pdfs.map((p) => ({ ...p })),
    chapterId,
    order:
      opts.order ??
      slot(
        chapterId === lesson.chapterId,
        lesson.order,
        s.lessons.filter((l) => l.chapterId === chapterId).length,
      ),
  })
}

/**
 * Copies one quiz — questions included — into a chapter. Groups (examens de
 * quiz) are chapter-scoped, so moving the copy elsewhere leaves it individual
 * unless the caller names a group of the destination.
 */
export function duplicateQuiz(
  quiz: Quiz,
  opts: { chapterId?: string; quizExamId?: string; title?: string; order?: number } = {},
): Quiz {
  const s = useData.getState()
  const chapterId = opts.chapterId ?? quiz.chapterId
  const same = chapterId === quiz.chapterId
  return s.addQuiz({
    title: opts.title ?? quiz.title,
    tags: [...quiz.tags],
    durationMin: quiz.durationMin,
    questions: quiz.questions.map((q) => ({
      ...q,
      id: crypto.randomUUID(),
      choices: [...q.choices],
    })),
    quizExamId: opts.quizExamId ?? (same ? quiz.quizExamId : undefined),
    chapterId,
    order:
      opts.order ?? slot(same, quiz.order, s.quizzes.filter((q) => q.chapterId === chapterId).length),
  })
}

/** Copies an examen de quiz — with the quizzes it regroups — into a chapter. */
export function duplicateQuizExam(
  group: QuizExam,
  opts: { chapterId?: string; title?: string } = {},
): QuizExam {
  const s = useData.getState()
  const chapterId = opts.chapterId ?? group.chapterId
  const copy = s.addQuizExam({
    title: opts.title ?? group.title,
    chapterId,
    order: slot(
      chapterId === group.chapterId,
      group.order,
      s.quizExams.filter((e) => e.chapterId === chapterId).length,
    ),
  })
  for (const quiz of s.quizzes.filter((q) => q.quizExamId === group.id)) {
    duplicateQuiz(quiz, { chapterId, quizExamId: copy.id, order: quiz.order })
  }
  return copy
}

/** Copies one examen (documents + vidéo) into a matière / classe. */
export function duplicateExam(
  exam: Exam,
  opts: { subjectIds?: string[]; yearIds?: string[]; title?: string; order?: number } = {},
): Exam {
  const s = useData.getState()
  const subjectIds = opts.subjectIds ?? exam.subjectIds
  return s.addExam({
    title: opts.title ?? exam.title,
    pdfs: exam.pdfs.map((p) => ({ ...p })),
    videoUrl: exam.videoUrl,
    subjectIds: [...subjectIds],
    yearIds: [...(opts.yearIds ?? exam.yearIds)],
    order:
      opts.order ??
      slot(
        subjectIds.every((id) => exam.subjectIds.includes(id)),
        exam.order,
        s.exams.filter((e) => e.subjectIds.some((id) => subjectIds.includes(id))).length,
      ),
  })
}

/**
 * Copies a chapitre with everything inside it. `lessons` / `quizzes` collect
 * old id → new id so a parcours cloned in the same pass can be re-pointed.
 */
export function duplicateChapter(
  chapter: Chapter,
  opts: {
    subjectIds?: string[]
    yearIds?: string[]
    name?: string
    order?: number
    lessons?: RefMap
    quizzes?: RefMap
  } = {},
): Chapter {
  const s = useData.getState()
  const subjectIds = opts.subjectIds ?? chapter.subjectIds
  const copy = s.addChapter({
    name: opts.name ?? chapter.name,
    subjectIds: [...subjectIds],
    yearIds: [...(opts.yearIds ?? chapter.yearIds)],
    order:
      opts.order ??
      slot(
        subjectIds.every((id) => chapter.subjectIds.includes(id)),
        chapter.order,
        s.chapters.filter((c) => c.subjectIds.some((id) => subjectIds.includes(id))).length,
      ),
  })

  // Groups first, so the copied quizzes can join their copied group.
  const groupMap: RefMap = new Map()
  for (const group of s.quizExams.filter((e) => e.chapterId === chapter.id)) {
    const g = s.addQuizExam({ title: group.title, chapterId: copy.id, order: group.order })
    groupMap.set(group.id, g.id)
  }
  for (const lesson of s.lessons.filter((l) => l.chapterId === chapter.id)) {
    const l = duplicateLesson(lesson, { chapterId: copy.id, order: lesson.order })
    opts.lessons?.set(lesson.id, l.id)
  }
  for (const quiz of s.quizzes.filter((q) => q.chapterId === chapter.id)) {
    const q = duplicateQuiz(quiz, {
      chapterId: copy.id,
      quizExamId: quiz.quizExamId ? groupMap.get(quiz.quizExamId) : undefined,
      order: quiz.order,
    })
    opts.quizzes?.set(quiz.id, q.id)
  }
  return copy
}

/** The lessons + quizzes a matière owns, through the chapters linked to it. */
function contentIdsOfSubject(subjectId: string): { lessons: Set<string>; quizzes: Set<string> } {
  const s = useData.getState()
  const chapterIds = new Set(
    s.chapters.filter((c) => c.subjectIds.includes(subjectId)).map((c) => c.id),
  )
  return {
    lessons: new Set(s.lessons.filter((l) => chapterIds.has(l.chapterId)).map((l) => l.id)),
    quizzes: new Set(s.quizzes.filter((q) => chapterIds.has(q.chapterId)).map((q) => q.id)),
  }
}

/**
 * Copies a parcours into a matière. Steps are re-pointed through the id maps of
 * a deep clone when there is one; otherwise a step is kept only if the contenu
 * / quiz it points at actually lives in the destination matière — the returned
 * `dropped` count says how many were left out.
 */
export function duplicatePath(
  path: Path,
  opts: {
    subjectId?: string
    yearId?: string
    title?: string
    order?: number
    lessons?: RefMap
    quizzes?: RefMap
  } = {},
): { path: Path; dropped: number } {
  const s = useData.getState()
  const subjectId = opts.subjectId ?? path.subjectId
  const same = subjectId === path.subjectId
  const owned = same || opts.lessons ? null : contentIdsOfSubject(subjectId)

  const items = path.items
    .map((it) => {
      const map = it.refType === "lesson" ? opts.lessons : opts.quizzes
      const refId = map?.get(it.refId) ?? it.refId
      const reachable =
        !owned || (it.refType === "lesson" ? owned.lessons.has(refId) : owned.quizzes.has(refId))
      return reachable ? { id: crypto.randomUUID(), refType: it.refType, refId } : null
    })
    .filter(Boolean) as Path["items"]

  const copy = s.addPath({
    title: opts.title ?? path.title,
    description: path.description,
    subjectId,
    yearId: opts.yearId ?? path.yearId,
    items,
    order:
      opts.order ?? slot(same, path.order, s.paths.filter((p) => p.subjectId === subjectId).length),
  })
  return { path: copy, dropped: path.items.length - items.length }
}

/**
 * Copies a matière into a classe with its chapitres, their contenus & quiz, its
 * parcours and its examens. The copies are scoped to the new matière alone — a
 * shared chapter doesn't drag the other matières along.
 */
export function duplicateSubject(
  subject: Subject,
  opts: { yearId?: string; name?: string; order?: number } = {},
): Subject {
  const s = useData.getState()
  const yearId = opts.yearId ?? subject.yearId
  const copy = s.addSubject({
    yearId,
    name: opts.name ?? subject.name,
    order:
      opts.order ??
      slot(yearId === subject.yearId, subject.order, s.subjects.filter((x) => x.yearId === yearId).length),
  })

  const lessons: RefMap = new Map()
  const quizzes: RefMap = new Map()
  for (const chapter of s.chapters.filter((c) => c.subjectIds.includes(subject.id))) {
    duplicateChapter(chapter, {
      subjectIds: [copy.id],
      yearIds: [yearId],
      order: chapter.order,
      lessons,
      quizzes,
    })
  }
  for (const exam of s.exams.filter((e) => e.subjectIds.includes(subject.id))) {
    duplicateExam(exam, { subjectIds: [copy.id], yearIds: [yearId], order: exam.order })
  }
  for (const path of s.paths.filter((p) => p.subjectId === subject.id)) {
    duplicatePath(path, { subjectId: copy.id, yearId, order: path.order, lessons, quizzes })
  }
  return copy
}

/** Copies a classe — with all of its matières — into a cycle / niveau / section. */
export function duplicateYear(
  year: Year,
  opts: { cycle?: Cycle; level?: string; section?: string; name?: string; order?: number } = {},
): Year {
  const s = useData.getState()
  const level = opts.level ?? year.level
  const section = opts.section ?? year.section
  const copy = s.addYear({
    name: opts.name ?? yearName(level, section),
    cycle: opts.cycle ?? year.cycle,
    level,
    section,
    order: opts.order ?? after(year.order),
  })
  for (const subject of s.subjects.filter((sub) => sub.yearId === year.id)) {
    duplicateSubject(subject, { yearId: copy.id, order: subject.order })
  }
  return copy
}
