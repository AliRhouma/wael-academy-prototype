import type { VideoComment, VideoRefKind } from "@/data/types"

/**
 * Prototype filler for the commentaires section.
 *
 * Only a few videos carry seeded comments, and an empty comment wall makes a
 * demo look dead — so this pool is appended under EVERY video, dated relative
 * to now so it never goes stale. Store comments (seeded or posted during the
 * demo) always come first; these sit underneath, like older threads.
 *
 * Real content would come from the backend, keyed per video. This exists only
 * so the section always shows a believable conversation.
 */
const POOL: { userId: string; body: string; daysAgo: number }[] = [
  {
    userId: "u-student-ines",
    body: "Merci prof 🙏 j'ai enfin compris la méthode, j'ai refait l'exercice tout seul du premier coup.",
    daysAgo: 2,
  },
  {
    userId: "u-st-khalil",
    body: "Est-ce que ce point tombe souvent au bac ? J'hésite à passer plus de temps dessus.",
    daysAgo: 4,
  },
  {
    userId: "u-st-yasmine",
    body: "Je regarde en 1.25x et c'est parfait. Pensez à télécharger le document, il reprend tout.",
    daysAgo: 6,
  },
  {
    userId: "u-student-youssef",
    body: "La qualité du son est top cette fois 👌",
    daysAgo: 9,
  },
  {
    userId: "u-st-lina",
    body: "Petite question : à la fin, pourquoi on garde le signe moins ? Si quelqu'un a compris…",
    daysAgo: 14,
  },
  {
    userId: "u-st-adam",
    body: "Vidéo revue 3 fois avant le devoir, résultat 16/20 💪",
    daysAgo: 21,
  },
]

/** The filler pool as comments for one video, newest first. */
export function demoComments(kind: VideoRefKind, videoId: string): VideoComment[] {
  return POOL.map((entry, i) => ({
    id: `demo-${videoId}-${i}`,
    kind,
    videoId,
    userId: entry.userId,
    body: entry.body,
    createdAt: new Date(Date.now() - entry.daysAgo * 86_400_000).toISOString(),
  }))
}
