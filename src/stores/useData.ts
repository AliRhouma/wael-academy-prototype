import { create } from "zustand"
import type { Course, Session, Student, Teacher } from "@/data/types"
import studentsSeed from "@/data/seed/students.json"
import teachersSeed from "@/data/seed/teachers.json"
import coursesSeed from "@/data/seed/courses.json"
import sessionsSeed from "@/data/seed/sessions.json"

/**
 * The ONE shared dataset. Every role reads from here — dashboards filter it by
 * the current user; admin sees all of it. Seeded once from the JSON files;
 * in-memory only (resets on refresh).
 */
interface DataState {
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  sessions: Session[]
}

export const useData = create<DataState>()(() => ({
  students: studentsSeed as Student[],
  teachers: teachersSeed as Teacher[],
  courses: coursesSeed as Course[],
  sessions: sessionsSeed as Session[],
}))
