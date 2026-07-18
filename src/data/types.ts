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
