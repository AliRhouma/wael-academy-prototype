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
  quizExam: "Examens de quiz",
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
    parts.push(a.yearIds.length > 0 ? `${a.yearIds.length} niveau${a.yearIds.length > 1 ? "x" : ""}` : "tous les niveaux")
    if (a.subjectIds.length > 0) parts.push(`${a.subjectIds.length} matière${a.subjectIds.length > 1 ? "s" : ""}`)
    if (a.chapterIds.length > 0) parts.push(`${a.chapterIds.length} chapitre${a.chapterIds.length > 1 ? "s" : ""}`)
  }
  if (a.types.includes("recordedSession")) {
    parts.push(a.academicYears.length > 0 ? a.academicYears.join(", ") : "toutes années scolaires")
    if (a.groupIds.length > 0) parts.push(`${a.groupIds.length} groupe${a.groupIds.length > 1 ? "s" : ""}`)
  }
  return parts.join(" · ")
}
