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
 * A reusable resource of the library — essentially a PDF document with an
 * optional friendly name. Admin manages these (create / edit / delete) and
 * attaches them to live sessions. Prototype: `pdf.name` is the chosen file's
 * name (no real upload); `pdf.url` stays blank on a mock file.
 */
export interface Resource {
  id: Id
  /** Friendly label (optional) — falls back to the PDF file name for display. */
  name?: string
  /** The attached PDF document. */
  pdf: ResourceLink
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
  /** Année scolaire the group belongs to — e.g. "2026/2027". */
  academicYear: string
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
  /** Année scolaire the séance belongs to — e.g. "2026/2027". */
  academicYear: string
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
 * A live online session (session en direct) the admin sets up — a named video
 * link students join at its scheduled time. It carries a display `name`, the join
 * `url`, a `date` + `startTime`, and the `academicYear` (année scolaire, e.g.
 * "2026/2027"). It targets one OR MORE subjects (matières), and is OPTIONALLY tied
 * to any number of student groups, years/niveaux (années), a commercial offer, and
 * library resources (documents). Name, url, date, time, academic year and at least
 * one subject are required; the rest may be empty.
 */
export interface LiveSession {
  id: Id
  name: string
  /** The join link (visioconférence — Meet, Zoom, …). */
  url: string
  /** Calendar day — "YYYY-MM-DD". */
  date: string
  /** Start time — "HH:MM" (24h). */
  startTime: string
  /** Année scolaire — e.g. "2026/2027". */
  academicYear: string
  /** Matières (at least one). */
  subjectIds: Id[]
  /** Groupes d'élèves invités — zero or more. */
  groupIds: Id[]
  /** Années (niveaux) rattachées — zero or more. */
  yearIds: Id[]
  /** Offre commerciale rattachée — optionnelle. */
  offerId?: Id
  /** Ressources (documents) attachées — zero or more. */
  resourceIds: Id[]
}

/**
 * The kinds of resources an access can expose to a student — the four content
 * kinds (Lesson), quizzes & their groupings, parcours, and recorded séances.
 */
export type AccessResourceType =
  | "cours"
  | "exercice"
  | "serie"
  | "resume"
  | "quiz"
  | "quizExam"
  | "path"
  | "recordedSession"

/**
 * An access rule (accès) — WHAT an offer shows to its students. It filters the
 * shared catalogue: which resource `types`, restricted to years (niveaux),
 * subjects and chapters for the syllabus content, and to années scolaires +
 * student groups for recorded séances. An EMPTY filter list means "all" —
 * only `types` requires at least one entry. After the broad filters, single
 * resources can still be hidden one by one via `excludedIds` (the content tree
 * page). Reusable: several offers may share one access.
 */
export interface Access {
  id: Id
  name: string
  description?: string
  /** Resource types exposed — at least one. */
  types: AccessResourceType[]
  /** Years (niveaux) whose content is exposed — empty = all. */
  yearIds: Id[]
  /** Subjects (matières) within those years — empty = all. */
  subjectIds: Id[]
  /** Chapters within those subjects — empty = all. */
  chapterIds: Id[]
  /** Années scolaires whose recorded séances are exposed — empty = all. */
  academicYears: string[]
  /** Student groups whose recorded séances are exposed — empty = all. */
  groupIds: Id[]
  /** Individually hidden resources (lesson / quiz / quiz-exam / path / séance ids). */
  excludedIds: Id[]
}

/**
 * A commercial offer (offre / abonnement) the academy sells — e.g. "Abonnement
 * annuel — Bac Maths". Carries a name, an optional logo image link, the years
 * (niveaux) it targets, its pricing (base price, optional promo price and
 * displayed discount), an optional validity window + period label, and the
 * access rules (`accessIds`) that define what its students can see.
 */
export interface Offer {
  id: Id
  name: string
  description?: string
  /** Logo — an image URL (optional; screens fall back to a brand tile). */
  logoUrl?: string
  /** Years (années / niveaux) this offer targets — zero or more. */
  yearIds: Id[]
  /** Base price in dinars (TND). */
  price: number
  /** Discounted price in dinars — set only when there's a promo; below `price`. */
  promoPrice?: number
  /** Displayed discount in % (e.g. 25 for "-25%") — optional. */
  discountPct?: number
  /** Validity window — "YYYY-MM-DD", both optional. */
  startDate?: string
  endDate?: string
  /** Subscription period label — e.g. "3 mois", "12 mois" (optional). */
  period?: string
  /** Access rules attached to this offer — zero or more. */
  accessIds: Id[]
}

/**
 * What a promo code does to ONE offer — each targeted offer is configured
 * alone, with EITHER a percentage OR a fixed amount off (exactly one is set).
 */
export interface PromoOfferRule {
  offerId: Id
  /** Discount in % (1–99) — exclusive with `discountAmount`. */
  discountPct?: number
  /** Discount in dinars (TND) — exclusive with `discountPct`. */
  discountAmount?: number
}

/**
 * A promo code (code promo) the admin generates. Targets one OR MORE offers,
 * each with its own discount rule. `maxUses` caps redemptions (absent =
 * unlimited); `usedByUserIds` lists the users who applied it.
 */
export interface PromoCode {
  id: Id
  /** The code itself — e.g. "WAEL-K7F2M", generated or typed. */
  code: string
  /** Per-offer discount rules — at least one. */
  offers: PromoOfferRule[]
  /** Maximum number of users — absent = unlimited. */
  maxUses?: number
  /** Users who used this code — zero or more. */
  usedByUserIds: Id[]
}

/** One planned payment line of a subscription — "300 DT avant le 15 juin". */
export interface Installment {
  id: Id
  /** Amount due, in dinars (TND). */
  amount: number
  /** Due date — "YYYY-MM-DD". */
  dueDate: string
}

/** Admin-set state of a subscription. Everything else (soldé, en retard) is derived. */
export type SubscriptionState = "active" | "blocked"

/**
 * A student's subscription (abonnement) to ONE offer — created by the admin.
 * Carries the negotiated `price` (manual — not the offer's price), a free-text
 * `tag` for the payment mode ("Par tranches", "Cash"…), the contract
 * `description`, the planned `installments` (répartition), a `deadline`
 * (prefilled from the offer's end date, editable) and the admin-set `state` —
 * a blocked subscription cuts the student's access to the offer. One user may
 * hold several subscriptions (one per offer).
 */
export interface Subscription {
  id: Id
  /** The subscribing student (student-role `User` id). */
  userId: Id
  /** The offer subscribed to. */
  offerId: Id
  /** Total to pay in dinars — manual admin input. */
  price: number
  /** Payment-mode word — e.g. "Par tranches", "Cash". */
  tag?: string
  /** The payment contract, in words. */
  description?: string
  /** Planned payment lines (répartition) — may be empty (e.g. cash). */
  installments: Installment[]
  /** Access end date — "YYYY-MM-DD"; prefilled from the offer, editable. */
  deadline?: string
  state: SubscriptionState
  /** ISO timestamp. */
  createdAt: string
}

/** A document attached to a transaction — receipt, virement proof… */
export interface TransactionResource {
  name: string
  /** Link to the document (optional on a mock file). */
  url?: string
  notes?: string
}

/**
 * One recorded payment (transaction) against a subscription. Optionally linked
 * to the planned installment line it settles (`installmentId`), with free-text
 * remarks and attached proof documents.
 */
export interface Transaction {
  id: Id
  subscriptionId: Id
  /** Payment day — "YYYY-MM-DD". */
  date: string
  /** Amount paid in dinars (TND). */
  amount: number
  /** Free notes — "payé à l'accueil", "virement reçu"… */
  remarks?: string
  /** The planned line (répartition) this payment settles — optional. */
  installmentId?: Id
  /** Attached documents — zero or more. */
  resources: TransactionResource[]
}

/** The four roles — filtered VIEWS over the same shared data, not four apps. */
export type Role = "admin" | "teacher" | "parent" | "student"

/** One field-level diff inside a `UserUpdate` — display values, pre-formatted. */
export interface UserFieldChange {
  /** French field label — e.g. "Téléphone", "Moyenne générale". */
  field: string
  /** Display value before the change — absent when the field was empty. */
  before?: string
  /** Display value after the change — absent when the field was cleared. */
  after?: string
}

/** One recorded change of a user's profile (newest first in `history`). */
export interface UserUpdate {
  /** ISO timestamp of the change. */
  at: string
  /** The fields touched by this save, each with its before → after values. */
  changes: UserFieldChange[]
}

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
  /** Phone number — the primary contact / identifier, UNIQUE per user. */
  phone: string
  /** Email — optional. */
  email?: string
  /**
   * Years (années) linked to the user — cardinality depends on the role:
   * student ≤ 1 (their level), teacher 0..* (levels taught), parent 0..*
   * (children's levels), admin none.
   */
  yearIds?: Id[]
  /** Ville — optional. */
  city?: string
  /** Localité / quartier — optional. */
  town?: string
  /** École / lycée — optional (mostly students). */
  school?: string
  /** Moyenne générale sur 20 — optional (students). */
  moyenneGenerale?: number
  /** ISO timestamp — when the account was created. */
  createdAt: string
  /** ISO timestamp — last profile update (equals `createdAt` if untouched). */
  updatedAt: string
  /** Profile change log, newest first. Creation is not an entry. */
  history: UserUpdate[]
  avatarUrl?: string
  studentId?: Id
  teacherId?: Id
  childrenIds?: Id[]
}
