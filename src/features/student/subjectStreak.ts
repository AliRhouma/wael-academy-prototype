/**
 * MOCK — the élève's activity on a matière: the running streak, or how long the
 * matière has been left alone.
 *
 * Nothing in the store tracks activity: there is no session log, no "last
 * opened", no completion. So this value is INVENTED — but invented
 * DETERMINISTICALLY from the matière id, which is what keeps it honest as a
 * prototype: the same matière shows the same activity on every render, on every
 * screen and after every navigation, with no state to seed and nothing to keep
 * in sync. Swap this file for a real read when activity actually exists.
 *
 * The split is tuned so ALL THREE states show up on one real page: about half
 * the matières have a live streak, a third have gone cold for a few days (the
 * nudge — "4 أيّام بلا قراية"), and the rest were never opened at all.
 */
export interface SubjectActivity {
  /** Consecutive days studied, running today. 0 when the streak is broken. */
  streak: number
  /** Days since the last study session. 0 when studied today, -1 when never. */
  idleDays: number
}

export function subjectActivity(subjectId: string): SubjectActivity {
  let h = 0
  for (let i = 0; i < subjectId.length; i++) h = (h * 31 + subjectId.charCodeAt(i)) >>> 0
  const n = h % 20

  // 0-8 → studied today, streak running (a couple of them long enough to brag).
  if (n <= 8) return { streak: n === 8 ? 12 : n + 1, idleDays: 0 }
  // 9-15 → the streak broke. A written-out table rather than `n - 7`: the
  // arithmetic spread put every cold matière on a near-identical number, and
  // identical rows are what makes mock data look mock.
  if (n <= 15) return { streak: 0, idleDays: [4, 3, 6, 9, 8, 5, 7][n - 9] }
  // 16-19 → never opened.
  return { streak: 0, idleDays: -1 }
}
