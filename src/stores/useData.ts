import { create } from "zustand"
import type {
  Chapter,
  Course,
  Exam,
  Group,
  Lesson,
  Offer,
  Path,
  Quiz,
  QuizExam,
  Session,
  Student,
  Subject,
  Teacher,
  User,
  Year,
} from "@/data/types"
import studentsSeed from "@/data/seed/students.json"
import teachersSeed from "@/data/seed/teachers.json"
import coursesSeed from "@/data/seed/courses.json"
import groupsSeed from "@/data/seed/groups.json"
import sessionsSeed from "@/data/seed/sessions.json"
import yearsSeed from "@/data/seed/years.json"
import subjectsSeed from "@/data/seed/subjects.json"
import chaptersSeed from "@/data/seed/chapters.json"
import examsSeed from "@/data/seed/exams.json"
import lessonsSeed from "@/data/seed/lessons.json"
import quizzesSeed from "@/data/seed/quizzes.json"
import quizExamsSeed from "@/data/seed/quiz-exams.json"
import pathsSeed from "@/data/seed/paths.json"
import offersSeed from "@/data/seed/offers.json"
import usersSeed from "@/data/seed/users.json"

/**
 * The ONE shared dataset. Every role reads from here — dashboards filter it by
 * the current user; admin sees all of it. Seeded once from the JSON files;
 * in-memory only (resets on refresh). New rows get `crypto.randomUUID()` ids.
 */
interface DataState {
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  groups: Group[]
  sessions: Session[]
  years: Year[]
  subjects: Subject[]
  chapters: Chapter[]
  exams: Exam[]
  lessons: Lesson[]
  quizzes: Quiz[]
  quizExams: QuizExam[]
  paths: Path[]
  offers: Offer[]
  users: User[]

  // Years CRUD
  addYear: (input: Omit<Year, "id">) => Year
  updateYear: (id: string, patch: Partial<Omit<Year, "id">>) => void
  /** Removes the year AND cascades to delete its subjects. */
  removeYear: (id: string) => void

  // Subjects CRUD
  addSubject: (input: Omit<Subject, "id">) => Subject
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id">>) => void
  removeSubject: (id: string) => void

  // Chapters CRUD
  addChapter: (input: Omit<Chapter, "id">) => Chapter
  updateChapter: (id: string, patch: Partial<Omit<Chapter, "id">>) => void
  removeChapter: (id: string) => void

  // Exams CRUD
  addExam: (input: Omit<Exam, "id">) => Exam
  updateExam: (id: string, patch: Partial<Omit<Exam, "id">>) => void
  removeExam: (id: string) => void

  // Lessons (contenus) CRUD
  addLesson: (input: Omit<Lesson, "id">) => Lesson
  updateLesson: (id: string, patch: Partial<Omit<Lesson, "id">>) => void
  /** Removes the lesson AND drops it from any path that referenced it. */
  removeLesson: (id: string) => void

  // Quizzes CRUD
  addQuiz: (input: Omit<Quiz, "id">) => Quiz
  updateQuiz: (id: string, patch: Partial<Omit<Quiz, "id">>) => void
  /** Removes the quiz AND drops it from any path that referenced it. */
  removeQuiz: (id: string) => void

  // Quiz exams (regroupements de quiz) CRUD
  addQuizExam: (input: Omit<QuizExam, "id">) => QuizExam
  updateQuizExam: (id: string, patch: Partial<Omit<QuizExam, "id">>) => void
  /** Removes the group AND ungroups its quizzes (clears their quizExamId). */
  removeQuizExam: (id: string) => void

  // Paths (parcours) CRUD
  addPath: (input: Omit<Path, "id">) => Path
  updatePath: (id: string, patch: Partial<Omit<Path, "id">>) => void
  removePath: (id: string) => void

  // Offers (offres commerciales) CRUD
  addOffer: (input: Omit<Offer, "id">) => Offer
  updateOffer: (id: string, patch: Partial<Omit<Offer, "id">>) => void
  removeOffer: (id: string) => void

  // Groups (groupes d'élèves) CRUD
  addGroup: (input: Omit<Group, "id">) => Group
  updateGroup: (id: string, patch: Partial<Omit<Group, "id">>) => void
  /** Removes the group AND drops it from any session that targeted it. */
  removeGroup: (id: string) => void

  // Sessions (séances) CRUD
  addSession: (input: Omit<Session, "id">) => Session
  updateSession: (id: string, patch: Partial<Omit<Session, "id">>) => void
  removeSession: (id: string) => void

  // Users CRUD
  addUser: (input: Omit<User, "id">) => User
  updateUser: (id: string, patch: Partial<Omit<User, "id">>) => void
  removeUser: (id: string) => void
}

/**
 * Drops deleted subject/year ids out of every scoped item's links, then removes
 * any item left with no subject or no year (an orphan). Keeps the many-to-many
 * links of chapters AND exams consistent when a subject or year is deleted.
 */
function pruneScoped<T extends { subjectIds: string[]; yearIds: string[] }>(
  items: T[],
  removedSubjectIds: Set<string>,
  removedYearIds: Set<string>,
): T[] {
  return items
    .map((item) => ({
      ...item,
      subjectIds: item.subjectIds.filter((id) => !removedSubjectIds.has(id)),
      yearIds: item.yearIds.filter((id) => !removedYearIds.has(id)),
    }))
    .filter((item) => item.subjectIds.length > 0 && item.yearIds.length > 0)
}

/**
 * Restores referential integrity across the content graph after any structural
 * change: a quiz whose group no longer exists is ungrouped, and path steps that
 * point to a removed lesson or quiz are dropped. Pass the already-computed
 * survivors; returns the reconciled quizzes + paths.
 */
function reconcile(next: {
  lessons: Lesson[]
  quizzes: Quiz[]
  quizExams: QuizExam[]
  paths: Path[]
}): { quizzes: Quiz[]; paths: Path[] } {
  const examIds = new Set(next.quizExams.map((e) => e.id))
  const quizzes = next.quizzes.map((q) =>
    q.quizExamId && !examIds.has(q.quizExamId) ? { ...q, quizExamId: undefined } : q,
  )
  const lessonIds = new Set(next.lessons.map((l) => l.id))
  const quizIds = new Set(quizzes.map((q) => q.id))
  const paths = next.paths.map((p) => ({
    ...p,
    items: p.items.filter((it) =>
      it.refType === "lesson" ? lessonIds.has(it.refId) : quizIds.has(it.refId),
    ),
  }))
  return { quizzes, paths }
}

/**
 * After the set of chapters changes (a chapter deleted, or chapters orphaned by
 * a subject/year deletion), drop every lesson / quiz / quiz-exam that lived in a
 * removed chapter, then reconcile quiz→group links and path steps. Pass the
 * surviving chapters and paths; returns the whole reconciled content slice.
 */
function afterChapterChange(
  s: DataState,
  chapters: Chapter[],
  paths: Path[],
): Pick<DataState, "chapters" | "lessons" | "quizExams" | "quizzes" | "paths"> {
  const alive = new Set(chapters.map((c) => c.id))
  const lessons = s.lessons.filter((l) => alive.has(l.chapterId))
  const quizExams = s.quizExams.filter((e) => alive.has(e.chapterId))
  const survivingQuizzes = s.quizzes.filter((q) => alive.has(q.chapterId))
  const reconciled = reconcile({ lessons, quizzes: survivingQuizzes, quizExams, paths })
  return { chapters, lessons, quizExams, quizzes: reconciled.quizzes, paths: reconciled.paths }
}

export const useData = create<DataState>()((set) => ({
  students: studentsSeed as Student[],
  teachers: teachersSeed as Teacher[],
  courses: coursesSeed as Course[],
  groups: groupsSeed as Group[],
  sessions: sessionsSeed as Session[],
  years: yearsSeed as Year[],
  subjects: subjectsSeed as Subject[],
  chapters: chaptersSeed as Chapter[],
  exams: examsSeed as Exam[],
  lessons: lessonsSeed as Lesson[],
  quizzes: quizzesSeed as Quiz[],
  quizExams: quizExamsSeed as QuizExam[],
  paths: pathsSeed as Path[],
  offers: offersSeed as Offer[],
  users: usersSeed as User[],

  addYear: (input) => {
    const year: Year = { id: crypto.randomUUID(), ...input }
    set((s) => ({ years: [...s.years, year] }))
    return year
  },
  updateYear: (id, patch) =>
    set((s) => ({ years: s.years.map((y) => (y.id === id ? { ...y, ...patch } : y)) })),
  removeYear: (id) =>
    set((s) => {
      const droppedSubjects = new Set(
        s.subjects.filter((sub) => sub.yearId === id).map((sub) => sub.id),
      )
      const droppedYear = new Set([id])
      const chapters = pruneScoped(s.chapters, droppedSubjects, droppedYear)
      const survivingPaths = s.paths.filter(
        (p) => !droppedSubjects.has(p.subjectId) && p.yearId !== id,
      )
      return {
        years: s.years.filter((y) => y.id !== id),
        subjects: s.subjects.filter((sub) => sub.yearId !== id),
        exams: pruneScoped(s.exams, droppedSubjects, droppedYear),
        // Chapters prune by scope; their lessons/quizzes/quiz-exams cascade off.
        ...afterChapterChange(s, chapters, survivingPaths),
        // Sessions drop the dead year/subject links; empty ones are pruned.
        sessions: pruneScoped(s.sessions, droppedSubjects, droppedYear),
        // A group whose home year is gone loses that link.
        groups: s.groups.map((g) => (g.yearId === id ? { ...g, yearId: undefined } : g)),
      }
    }),

  addSubject: (input) => {
    const subject: Subject = { id: crypto.randomUUID(), ...input }
    set((s) => ({ subjects: [...s.subjects, subject] }))
    return subject
  },
  updateSubject: (id, patch) =>
    set((s) => ({ subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)) })),
  removeSubject: (id) =>
    set((s) => {
      const dropped = new Set([id])
      const empty = new Set<string>()
      const chapters = pruneScoped(s.chapters, dropped, empty)
      const survivingPaths = s.paths.filter((p) => p.subjectId !== id)
      return {
        subjects: s.subjects.filter((sub) => sub.id !== id),
        exams: pruneScoped(s.exams, dropped, empty),
        // Chapters lose the subject; ones left with none cascade their content off.
        ...afterChapterChange(s, chapters, survivingPaths),
        // Sessions drop the dead subject link; ones with no subject left are pruned.
        sessions: pruneScoped(s.sessions, dropped, empty),
      }
    }),

  addChapter: (input) => {
    const chapter: Chapter = { id: crypto.randomUUID(), ...input }
    set((s) => ({ chapters: [...s.chapters, chapter] }))
    return chapter
  },
  updateChapter: (id, patch) =>
    set((s) => ({ chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  /** Removes the chapter AND cascades: its lessons, quizzes and quiz-exams go
   * too, and any path step that pointed to them is dropped. */
  removeChapter: (id) =>
    set((s) => afterChapterChange(s, s.chapters.filter((c) => c.id !== id), s.paths)),

  addExam: (input) => {
    const exam: Exam = { id: crypto.randomUUID(), ...input }
    set((s) => ({ exams: [...s.exams, exam] }))
    return exam
  },
  updateExam: (id, patch) =>
    set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),

  addLesson: (input) => {
    const lesson: Lesson = { id: crypto.randomUUID(), ...input }
    set((s) => ({ lessons: [...s.lessons, lesson] }))
    return lesson
  },
  updateLesson: (id, patch) =>
    set((s) => ({ lessons: s.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
  removeLesson: (id) =>
    set((s) => {
      const lessons = s.lessons.filter((l) => l.id !== id)
      const { paths } = reconcile({ lessons, quizzes: s.quizzes, quizExams: s.quizExams, paths: s.paths })
      return { lessons, paths }
    }),

  addQuiz: (input) => {
    const quiz: Quiz = { id: crypto.randomUUID(), ...input }
    set((s) => ({ quizzes: [...s.quizzes, quiz] }))
    return quiz
  },
  updateQuiz: (id, patch) =>
    set((s) => ({ quizzes: s.quizzes.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
  removeQuiz: (id) =>
    set((s) => {
      const quizzes = s.quizzes.filter((q) => q.id !== id)
      const { paths } = reconcile({ lessons: s.lessons, quizzes, quizExams: s.quizExams, paths: s.paths })
      return { quizzes, paths }
    }),

  addQuizExam: (input) => {
    const quizExam: QuizExam = { id: crypto.randomUUID(), ...input }
    set((s) => ({ quizExams: [...s.quizExams, quizExam] }))
    return quizExam
  },
  updateQuizExam: (id, patch) =>
    set((s) => ({ quizExams: s.quizExams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeQuizExam: (id) =>
    set((s) => {
      const quizExams = s.quizExams.filter((e) => e.id !== id)
      const { quizzes } = reconcile({ lessons: s.lessons, quizzes: s.quizzes, quizExams, paths: s.paths })
      return { quizExams, quizzes }
    }),

  addPath: (input) => {
    const path: Path = { id: crypto.randomUUID(), ...input }
    set((s) => ({ paths: [...s.paths, path] }))
    return path
  },
  updatePath: (id, patch) =>
    set((s) => ({ paths: s.paths.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removePath: (id) => set((s) => ({ paths: s.paths.filter((p) => p.id !== id) })),

  addOffer: (input) => {
    const offer: Offer = { id: crypto.randomUUID(), ...input }
    set((s) => ({ offers: [...s.offers, offer] }))
    return offer
  },
  updateOffer: (id, patch) =>
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
  removeOffer: (id) => set((s) => ({ offers: s.offers.filter((o) => o.id !== id) })),

  addGroup: (input) => {
    const group: Group = { id: crypto.randomUUID(), ...input }
    set((s) => ({ groups: [...s.groups, group] }))
    return group
  },
  updateGroup: (id, patch) =>
    set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
  removeGroup: (id) =>
    set((s) => ({
      groups: s.groups.filter((g) => g.id !== id),
      // Drop the deleted group from every session that targeted it.
      sessions: s.sessions.map((ses) =>
        ses.groupIds.includes(id)
          ? { ...ses, groupIds: ses.groupIds.filter((gid) => gid !== id) }
          : ses,
      ),
    })),

  addSession: (input) => {
    const session: Session = { id: crypto.randomUUID(), ...input }
    set((s) => ({ sessions: [...s.sessions, session] }))
    return session
  },
  updateSession: (id, patch) =>
    set((s) => ({ sessions: s.sessions.map((ses) => (ses.id === id ? { ...ses, ...patch } : ses)) })),
  removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((ses) => ses.id !== id) })),

  addUser: (input) => {
    const user: User = { id: crypto.randomUUID(), ...input }
    set((s) => ({ users: [...s.users, user] }))
    return user
  },
  updateUser: (id, patch) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
  // Removing a student also drops them from every group roster.
  removeUser: (id) =>
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      groups: s.groups.map((g) =>
        g.studentIds.includes(id)
          ? { ...g, studentIds: g.studentIds.filter((sid) => sid !== id) }
          : g,
      ),
    })),
}))
