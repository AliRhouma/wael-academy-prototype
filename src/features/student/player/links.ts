/**
 * Routes of the player page. A video is a PAGE, not a modal, so every card that
 * plays something links here — middle-click, share and back all behave.
 *
 * The id alone identifies the video; the query only says which list the élève
 * came from, so the playlist and the "retour" button can be rebuilt (a chapitre
 * is shared by several matières, a séance by several groupes).
 */

const BASE = "/student/video"

function withQuery(path: string, query: Record<string, string | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value)
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

/** A contenu (cours / exercice) of a chapitre. */
export function lessonVideoPath(lessonId: string, subjectId?: string): string {
  return withQuery(`${BASE}/lesson/${lessonId}`, { matiere: subjectId })
}

/** The correction filmée of an examen. */
export function examVideoPath(examId: string, subjectId?: string): string {
  return withQuery(`${BASE}/exam/${examId}`, { matiere: subjectId })
}

/** The enregistrement of a séance. */
export function seanceVideoPath(
  sessionId: string,
  opts: { subjectId?: string; groupId?: string } = {},
): string {
  return withQuery(`${BASE}/seance/${sessionId}`, {
    matiere: opts.subjectId,
    groupe: opts.groupId,
  })
}
