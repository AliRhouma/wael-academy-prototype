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

/** A course / class (cours), taught by one teacher. */
export interface Course {
  id: Id
  name: string
  teacherId: Id
  level?: string
}

/** A scheduled session (séance) belonging to a course. */
export interface Session {
  id: Id
  courseId: Id
  title: string
  startsAt: string // ISO date-time
  durationMin: number
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
  avatarUrl?: string
  studentId?: Id
  teacherId?: Id
  childrenIds?: Id[]
}
