import type { Access, AccessResourceType } from "@/data/types"

/** Display order + French label of every resource type an access can expose. */
export const TYPE_ORDER: AccessResourceType[] = [
  "cours",
  "exercice",
  "serie",
  "resume",
  "quiz",
  "quizExam",
  "path",
  "recordedSession",
]

export const TYPE_LABEL: Record<AccessResourceType, string> = {
  cours: "Cours",
  exercice: "Exercices",
  serie: "Séries",
  resume: "Résumés",
  quiz: "Quiz",
  quizExam: "Tests quiz",
  path: "Parcours",
  recordedSession: "Séances enregistrées",
}

/** The four Lesson kinds among the access types. */
export const LESSON_TYPES: AccessResourceType[] = ["cours", "exercice", "serie", "resume"]

/** Does this access expose any syllabus content (vs only recorded séances)? */
export function hasContentTypes(a: Pick<Access, "types">): boolean {
  return a.types.some((t) => t !== "recordedSession")
}

/** One-line scope summary for an access card — "vide = tous" spelled out. */
export function scopeSummary(a: Access): string {
  const parts: string[] = []
  if (hasContentTypes(a)) {
    parts.push(a.yearIds.length > 0 ? `${a.yearIds.length} مستوى` : "Tous les niveaux")
    if (a.subjectIds.length > 0) parts.push(`${a.subjectIds.length} مادّة`)
    if (a.chapterIds.length > 0) parts.push(`${a.chapterIds.length} فصل`)
  }
  if (a.types.includes("recordedSession")) {
    parts.push(a.academicYears.length > 0 ? a.academicYears.join(", ") : "Toutes les années")
    if (a.groupIds.length > 0) parts.push(`${a.groupIds.length} فوج`)
  }
  return parts.join(" · ")
}
