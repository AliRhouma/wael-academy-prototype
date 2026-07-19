/**
 * Minimal entity shapes for the Wael Academy prototype.
 *
 * Every entity has a string `id`. Fields stay lean on purpose — the frame only
 * needs shapes; real fields get added when a screen actually shows them
 * (see CLAUDE.md → Data layer). No backend, no runtime validation.
 */

export type Id = string

/** A registered student (élève). */
export interface Student {
  id: Id
  name: string
  group?: string
  /** Courses this student is enrolled in. */
  courseIds?: Id[]
}

/** A teacher / instructor (enseignant). */
export interface Teacher {
  id: Id
  name: string
  subject?: string
}

/**
 * A study year / level (année) — e.g. "7ème année" or "Bac — Mathématiques".
 * The name carries everything (level + stream/filière); there is no separate
 * category. It's a flat list of years, each holding its subjects.
 */
export interface Year {
  id: Id
  name: string
  /** Sort order in the flat list. */
  order?: number
}

/** A subject / matière taught within a year (contains courses, added later). */
export interface Subject {
  id: Id
  yearId: Id
  name: string
  /** Sort order within its year. */
  order?: number
}

/**
 * A chapter (chapitre) of the syllabus — e.g. "Nombres complexes", "Limites et
 * continuité". A chapter is shared: it can belong to one OR MORE subjects and be
 * taught in one OR MORE years (many-to-many both ways). The name carries the
 * topic; the links say where it's taught.
 */
export interface Chapter {
  id: Id
  name: string
  /** Subjects (matières) this chapter belongs to — at least one. */
  subjectIds: Id[]
  /** Years (années) this chapter is taught in — at least one. */
  yearIds: Id[]
  /** Sort order within a subject's list. */
  order?: number
}

/** An attached document (a named resource, usually a PDF). Prototype: no real
 * upload — `url` is an optional link, often left blank on a mock file. */
export interface ResourceLink {
  name: string
  url?: string
}

/**
 * An exam / assessment (examen) attached to the syllabus — e.g. "Devoir de
 * synthèse N°1". Like a chapter it is shared: one OR MORE subjects and one OR
 * MORE years. Carries several PDF documents and a single video.
 */
export interface Exam {
  id: Id
  title: string
  /** PDF documents (énoncé, corrigé…) — zero or more. */
  pdfs: ResourceLink[]
  /** A single video link (correction filmée, séance…). */
  videoUrl?: string
  /** Subjects (matières) this exam belongs to — at least one. */
  subjectIds: Id[]
  /** Years (années) this exam targets — at least one. */
  yearIds: Id[]
  /** Sort order within a subject's list. */
  order?: number
}

/**
 * The kind of a content item (Lesson). Cours & exercice carry a video; série
 * (série d'exercices) & résumé are the SAME idea WITHOUT a video — text/PDF only.
 */
export type LessonKind = "cours" | "exercice" | "serie" | "resume"

/**
 * A content item of the syllabus — a cours, an exercice, a série or a résumé.
 * Carries a title, PDF documents, and (cours / exercice only) a single video —
 * série & résumé have none. It belongs to exactly ONE chapter (`chapterId`) and
 * is created on that chapter's page; its subjects/years are those of the chapter.
 */
export interface Lesson {
  id: Id
  title: string
  kind: LessonKind
  /** A single video link — cours / exercice only; absent for série & résumé. */
  videoUrl?: string
  /** PDF documents (cours, énoncé, corrigé…) — zero or more. */
  pdfs: ResourceLink[]
  /** The chapter (chapitre) this content belongs to. */
  chapterId: Id
  /** Sort order within its chapter's list. */
  order?: number
}

/** One multiple-choice question of a Quiz. */
export interface QuizQuestion {
  id: Id
  prompt: string
  /** Answer choices (2–4). */
  choices: string[]
  /** Index into `choices` of the correct answer. */
  correctIndex: number
}

/**
 * A quiz — a set of MCQ questions plus free-text `tags` used to categorize it
 * (e.g. "révision", "facile", "chapitre 3"). It belongs to exactly ONE chapter
 * (`chapterId`) and is created on that chapter's page. A quiz may be regrouped
 * into an "examen de quiz" (`quizExamId`) of the same chapter so several
 * quizzes display together.
 */
export interface Quiz {
  id: Id
  title: string
  /** Free-text categorization tags. */
  tags: string[]
  /** Suggested duration in minutes (optional). */
  durationMin?: number
  questions: QuizQuestion[]
  /** The group (QuizExam) this quiz belongs to, if any — same chapter. */
  quizExamId?: Id
  /** The chapter (chapitre) this quiz belongs to. */
  chapterId: Id
  /** Sort order within its chapter's list. */
  order?: number
}

/**
 * A named group that regroups several quizzes of ONE chapter ("examen de quiz")
 * — quizzes with a matching `quizExamId` display together under it.
 */
export interface QuizExam {
  id: Id
  title: string
  /** The chapter (chapitre) this group belongs to. */
  chapterId: Id
  order?: number
}

/** One ordered step of a Path — a reference to a Lesson or a Quiz. */
export interface PathItem {
  id: Id
  refType: "lesson" | "quiz"
  refId: Id
}

/**
 * A parcours — an ORDERED learning path a student follows step by step instead
 * of browsing everything. Belongs to a single subject + year and holds an
 * ordered list of items (lessons & quizzes of that subject).
 */
export interface Path {
  id: Id
  title: string
  description?: string
  subjectId: Id
  yearId: Id
  items: PathItem[]
  order?: number
}

/** A course / class (cours), taught by one teacher. */
export interface Course {
  id: Id
  name: string
  teacherId: Id
  level?: string
}

/**
 * A named group of students (groupe) — e.g. "Excellents — 2ème Sciences". Admin
 * creates and rosters these; sessions are scheduled for one or more of them. In
 * this prototype a member is a student-role `User` (they carry the year), so
 * `studentIds` holds those user ids.
 */
export interface Group {
  id: Id
  title: string
  /** The home year/level of the group (optional — most sit in one year). */
  yearId?: Id
  /** Member student ids (student-role `User` ids) — may be empty. */
  studentIds: Id[]
}

/**
 * A scheduled séance planned by the admin (and shown to its teacher). It carries
 * a title + optional description, a date and a time range, and is scoped to one
 * OR MORE years, one OR MORE subjects, and one OR MORE student groups, run by a
 * single teacher.
 */
export interface Session {
  id: Id
  title: string
  description?: string
  /** Calendar day — "YYYY-MM-DD". */
  date: string
  /** Start / end of day — "HH:MM" (24h). */
  startTime: string
  endTime: string
  /** Années (at least one). */
  yearIds: Id[]
  /** Matières (at least one). */
  subjectIds: Id[]
  /** Groupes d'élèves (at least one). */
  groupIds: Id[]
  /** The teacher who runs it. */
  teacherId?: Id
}

/**
 * A commercial offer (offre / abonnement) the academy sells — e.g. "Abonnement
 * annuel — Bac Maths". Carries a name, an optional description, a base price in
 * dinars (TND) and, when discounted, a lower `promoPrice`. Targets a single year
 * (année) so it can be shown to the right students.
 */
export interface Offer {
  id: Id
  name: string
  description?: string
  /** Base price in dinars (TND). */
  price: number
  /** Discounted price in dinars — set only when there's a promo; below `price`. */
  promoPrice?: number
  /** Year (année) this offer targets. */
  yearId: Id
}

/** The four roles — filtered VIEWS over the same shared data, not four apps. */
export type Role = "admin" | "teacher" | "parent" | "student"

/**
 * A signed-in user of a given role. Linkage ids tie a user to the shared
 * entities so "My X" pages can filter by them:
 *  - student user → `studentId`
 *  - teacher user → `teacherId`
 *  - parent user  → `childrenIds` (student ids)
 *  - admin        → no linkage (sees everything)
 */
export interface User {
  id: Id
  name: string
  role: Role
  /** Phone number — the primary contact / identifier (every user has one). */
  phone: string
  /** Email — optional. */
  email?: string
  /** Study year (année) — students only; links to a `Year`. */
  yearId?: Id
  avatarUrl?: string
  studentId?: Id
  teacherId?: Id
  childrenIds?: Id[]
}
