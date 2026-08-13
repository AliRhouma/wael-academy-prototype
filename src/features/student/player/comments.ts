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
    body: "يعيشك أستاذ 🙏 فهمت المنهجية أخيرا، عاودت التمرين وحدي من أوّل مرّة.",
    daysAgo: 2,
  },
  {
    userId: "u-st-khalil",
    body: "النقطة هذي تجي برشا في الباك؟ محتار نقعد وقت أكثر عليها ولا لا.",
    daysAgo: 4,
  },
  {
    userId: "u-st-yasmine",
    body: "نتفرّج بـ 1.25x وباهي برشا. ما تنساوش تحمّلو الوثيقة، فيها الكل.",
    daysAgo: 6,
  },
  {
    userId: "u-student-youssef",
    body: "جودة الصوت باهية برشا المرّة هذي 👌",
    daysAgo: 9,
  },
  {
    userId: "u-st-lina",
    body: "سؤال صغير: في الآخر، علاش نخلّيو إشارة الناقص؟ كان فما شكون فهم…",
    daysAgo: 14,
  },
  {
    userId: "u-st-adam",
    body: "عاودت الفيديو 3 مرّات قبل الفرض، النتيجة 16/20 💪",
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
