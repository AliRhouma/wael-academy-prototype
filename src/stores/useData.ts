import { create } from "zustand"
import type {
  Access,
  Chapter,
  Course,
  Exam,
  Group,
  Lesson,
  LiveSession,
  Offer,
  Path,
  PromoCode,
  Quiz,
  QuizExam,
  Resource,
  Session,
  Student,
  Subject,
  Subscription,
  Teacher,
  Transaction,
  User,
  UserFieldChange,
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
import accessesSeed from "@/data/seed/accesses.json"
import subscriptionsSeed from "@/data/seed/subscriptions.json"
import promoCodesSeed from "@/data/seed/promo-codes.json"
import transactionsSeed from "@/data/seed/transactions.json"
import resourcesSeed from "@/data/seed/resources.json"
import liveSessionsSeed from "@/data/seed/live-sessions.json"

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
  accesses: Access[]
  subscriptions: Subscription[]
  transactions: Transaction[]
  promoCodes: PromoCode[]
  users: User[]
  resources: Resource[]
  liveSessions: LiveSession[]

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

  // Accesses (règles d'accès des offres) CRUD
  addAccess: (input: Omit<Access, "id">) => Access
  updateAccess: (id: string, patch: Partial<Omit<Access, "id">>) => void
  /** Removes the access AND detaches it from every offer that used it. */
  removeAccess: (id: string) => void

  // Subscriptions (abonnements élèves) CRUD — createdAt stamped by the store.
  addSubscription: (input: Omit<Subscription, "id" | "createdAt">) => Subscription
  updateSubscription: (id: string, patch: Partial<Omit<Subscription, "id" | "createdAt">>) => void
  /** Removes the subscription AND its transactions. */
  removeSubscription: (id: string) => void

  // Transactions (paiements) CRUD
  addTransaction: (input: Omit<Transaction, "id">) => Transaction
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => void
  removeTransaction: (id: string) => void

  // Promo codes CRUD
  addPromoCode: (input: Omit<PromoCode, "id">) => PromoCode
  updatePromoCode: (id: string, patch: Partial<Omit<PromoCode, "id">>) => void
  removePromoCode: (id: string) => void

  // Groups (groupes d'élèves) CRUD
  addGroup: (input: Omit<Group, "id">) => Group
  updateGroup: (id: string, patch: Partial<Omit<Group, "id">>) => void
  /** Removes the group AND drops it from any session that targeted it. */
  removeGroup: (id: string) => void

  // Sessions (séances) CRUD
  addSession: (input: Omit<Session, "id">) => Session
  updateSession: (id: string, patch: Partial<Omit<Session, "id">>) => void
  removeSession: (id: string) => void

  // Resources (bibliothèque de documents) CRUD
  addResource: (input: Omit<Resource, "id">) => Resource
  updateResource: (id: string, patch: Partial<Omit<Resource, "id">>) => void
  /** Removes the resource AND detaches it from every live session. */
  removeResource: (id: string) => void

  // Live sessions (sessions en direct) CRUD
  addLiveSession: (input: Omit<LiveSession, "id">) => LiveSession
  updateLiveSession: (id: string, patch: Partial<Omit<LiveSession, "id">>) => void
  removeLiveSession: (id: string) => void

  // Users CRUD — the store owns the audit fields: `addUser` stamps
  // createdAt/updatedAt, `updateUser` bumps updatedAt and prepends a history
  // entry (pass the per-field before → after `changes` of the save).
  addUser: (input: Omit<User, "id" | "createdAt" | "updatedAt" | "history">) => User
  updateUser: (
    id: string,
    patch: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "history">>,
    changes?: UserFieldChange[],
  ) => void
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
 * Drops deleted subject ids out of every live session, then removes any left
 * with no subject (a live session must target at least one). Keeps live-session
 * links consistent when a subject or a whole year is deleted.
 */
function pruneLiveSubjects(
  liveSessions: LiveSession[],
  removedSubjectIds: Set<string>,
): LiveSession[] {
  return liveSessions
    .map((ls) => ({
      ...ls,
      subjectIds: ls.subjectIds.filter((id) => !removedSubjectIds.has(id)),
    }))
    .filter((ls) => ls.subjectIds.length > 0)
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
  accesses: accessesSeed as Access[],
  subscriptions: subscriptionsSeed as Subscription[],
  transactions: transactionsSeed as Transaction[],
  promoCodes: promoCodesSeed as PromoCode[],
  users: usersSeed as User[],
  resources: resourcesSeed as Resource[],
  liveSessions: liveSessionsSeed as LiveSession[],

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
        // Live sessions drop the dead subjects (empties pruned) AND the dead year.
        liveSessions: pruneLiveSubjects(s.liveSessions, droppedSubjects).map((ls) =>
          ls.yearIds.includes(id) ? { ...ls, yearIds: ls.yearIds.filter((yid) => yid !== id) } : ls,
        ),
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
        // Live sessions drop the dead subject; ones left with none are pruned.
        liveSessions: pruneLiveSubjects(s.liveSessions, dropped),
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
  removeOffer: (id) =>
    set((s) => {
      // Subscriptions of the deleted offer go too, with their transactions.
      const deadSubs = new Set(
        s.subscriptions.filter((sub) => sub.offerId === id).map((sub) => sub.id),
      )
      return {
        offers: s.offers.filter((o) => o.id !== id),
        // Detach the deleted offer from every live session that referenced it.
        liveSessions: s.liveSessions.map((ls) =>
          ls.offerId === id ? { ...ls, offerId: undefined } : ls,
        ),
        subscriptions: s.subscriptions.filter((sub) => sub.offerId !== id),
        transactions: s.transactions.filter((t) => !deadSubs.has(t.subscriptionId)),
        // Promo codes lose the offer's rule; ones left with no offer are dropped.
        promoCodes: s.promoCodes
          .map((p) => ({ ...p, offers: p.offers.filter((r) => r.offerId !== id) }))
          .filter((p) => p.offers.length > 0),
      }
    }),

  addAccess: (input) => {
    const access: Access = { id: crypto.randomUUID(), ...input }
    set((s) => ({ accesses: [...s.accesses, access] }))
    return access
  },
  updateAccess: (id, patch) =>
    set((s) => ({ accesses: s.accesses.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  removeAccess: (id) =>
    set((s) => ({
      accesses: s.accesses.filter((a) => a.id !== id),
      // Detach the deleted access from every offer that referenced it.
      offers: s.offers.map((o) =>
        o.accessIds.includes(id)
          ? { ...o, accessIds: o.accessIds.filter((aid) => aid !== id) }
          : o,
      ),
    })),

  addPromoCode: (input) => {
    const promoCode: PromoCode = { id: crypto.randomUUID(), ...input }
    set((s) => ({ promoCodes: [...s.promoCodes, promoCode] }))
    return promoCode
  },
  updatePromoCode: (id, patch) =>
    set((s) => ({ promoCodes: s.promoCodes.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removePromoCode: (id) =>
    set((s) => ({ promoCodes: s.promoCodes.filter((p) => p.id !== id) })),

  addSubscription: (input) => {
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ subscriptions: [...s.subscriptions, subscription] }))
    return subscription
  },
  updateSubscription: (id, patch) =>
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
    })),
  removeSubscription: (id) =>
    set((s) => ({
      subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
      transactions: s.transactions.filter((t) => t.subscriptionId !== id),
    })),

  addTransaction: (input) => {
    const transaction: Transaction = { id: crypto.randomUUID(), ...input }
    set((s) => ({ transactions: [...s.transactions, transaction] }))
    return transaction
  },
  updateTransaction: (id, patch) =>
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

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
      // …and from every live session that invited it.
      liveSessions: s.liveSessions.map((ls) =>
        ls.groupIds.includes(id)
          ? { ...ls, groupIds: ls.groupIds.filter((gid) => gid !== id) }
          : ls,
      ),
      // …and from every access rule that filtered on it.
      accesses: s.accesses.map((a) =>
        a.groupIds.includes(id)
          ? { ...a, groupIds: a.groupIds.filter((gid) => gid !== id) }
          : a,
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

  addResource: (input) => {
    const resource: Resource = { id: crypto.randomUUID(), ...input }
    set((s) => ({ resources: [...s.resources, resource] }))
    return resource
  },
  updateResource: (id, patch) =>
    set((s) => ({ resources: s.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
  removeResource: (id) =>
    set((s) => ({
      resources: s.resources.filter((r) => r.id !== id),
      // Detach the deleted resource from every live session that held it.
      liveSessions: s.liveSessions.map((ls) =>
        ls.resourceIds.includes(id)
          ? { ...ls, resourceIds: ls.resourceIds.filter((rid) => rid !== id) }
          : ls,
      ),
    })),

  addLiveSession: (input) => {
    const liveSession: LiveSession = { id: crypto.randomUUID(), ...input }
    set((s) => ({ liveSessions: [...s.liveSessions, liveSession] }))
    return liveSession
  },
  updateLiveSession: (id, patch) =>
    set((s) => ({
      liveSessions: s.liveSessions.map((ls) => (ls.id === id ? { ...ls, ...patch } : ls)),
    })),
  removeLiveSession: (id) =>
    set((s) => ({ liveSessions: s.liveSessions.filter((ls) => ls.id !== id) })),

  addUser: (input) => {
    const now = new Date().toISOString()
    const user: User = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
      history: [],
    }
    set((s) => ({ users: [...s.users, user] }))
    return user
  },
  updateUser: (id, patch, changes) =>
    set((s) => {
      const now = new Date().toISOString()
      return {
        users: s.users.map((u) =>
          u.id === id
            ? {
                ...u,
                ...patch,
                updatedAt: now,
                // Newest first; a change-less call still bumps updatedAt.
                history:
                  changes && changes.length > 0
                    ? [{ at: now, changes }, ...u.history]
                    : u.history,
              }
            : u,
        ),
      }
    }),
  // Removing a student also drops them from every group roster, along with
  // their subscriptions and the transactions recorded against them.
  removeUser: (id) =>
    set((s) => {
      const deadSubs = new Set(
        s.subscriptions.filter((sub) => sub.userId === id).map((sub) => sub.id),
      )
      return {
        users: s.users.filter((u) => u.id !== id),
        groups: s.groups.map((g) =>
          g.studentIds.includes(id)
            ? { ...g, studentIds: g.studentIds.filter((sid) => sid !== id) }
            : g,
        ),
        subscriptions: s.subscriptions.filter((sub) => sub.userId !== id),
        transactions: s.transactions.filter((t) => !deadSubs.has(t.subscriptionId)),
        // …and out of every promo code's used-by list.
        promoCodes: s.promoCodes.map((p) =>
          p.usedByUserIds.includes(id)
            ? { ...p, usedByUserIds: p.usedByUserIds.filter((uid) => uid !== id) }
            : p,
        ),
      }
    }),
}))
