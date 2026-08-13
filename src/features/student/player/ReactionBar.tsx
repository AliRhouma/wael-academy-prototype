import { ThumbsDown, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VideoRefKind } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/**
 * A stable "already there" like count per video.
 *
 * Prototype device: a real product counts rows: here nobody has voted yet, and
 * a wall of "0 j'aime" reads as a broken feature rather than as a new video. The
 * hash keeps a video's number the same across renders and refreshes, so it
 * behaves like data instead of like noise.
 */
function baseLikes(videoId: string): number {
  let hash = 0
  for (let i = 0; i < videoId.length; i++) hash = (hash * 31 + videoId.charCodeAt(i)) >>> 0
  return 24 + (hash % 380)
}

/** "1,2 k" past a thousand — a count is a glance, not a figure to read. */
function short(n: number): string {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")} k`
}

/**
 * J'aime / je n'aime pas, in one pill.
 *
 * Only the likes carry a number — the dislikes are counted but not shown, the
 * convention every élève already knows from YouTube, and the one that doesn't
 * turn a teacher's video into a scoreboard. Clicking the active side clears the
 * vote.
 */
export function ReactionBar({ kind, videoId }: { kind: VideoRefKind; videoId: string }) {
  const user = useAuth((s) => s.currentUser)
  const reactions = useData((s) => s.videoReactions)
  const setReaction = useData((s) => s.setVideoReaction)

  const mine = reactions.find(
    (r) => r.kind === kind && r.videoId === videoId && r.userId === user?.id,
  )?.value

  const likes =
    baseLikes(videoId) +
    reactions.filter((r) => r.kind === kind && r.videoId === videoId && r.value === "like").length

  function vote(value: "like" | "dislike") {
    if (!user) return
    setReaction({ kind, videoId, userId: user.id }, mine === value ? null : value)
  }

  return (
    <div className="inline-flex h-11 items-center rounded-full border border-border-strong bg-surface">
      <button
        type="button"
        onClick={() => vote("like")}
        aria-pressed={mine === "like"}
        aria-label="نعجبني"
        className={cn(
          "inline-flex h-full items-center gap-2 rounded-s-full px-3.5 text-[calc(13px*var(--ts))] font-medium transition",
          mine === "like" ? "text-brand-700" : "text-ink-subtle hover:text-brand-600",
        )}
      >
        <ThumbsUp className={cn("size-[18px]", mine === "like" && "fill-brand-100")} />
        <span className="tabular-nums">{short(likes)}</span>
      </button>

      <span aria-hidden="true" className="h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => vote("dislike")}
        aria-pressed={mine === "dislike"}
        aria-label="ما يعجبنيش"
        className={cn(
          "inline-flex h-full items-center rounded-e-full px-3.5 transition",
          mine === "dislike" ? "text-danger-600" : "text-ink-subtle hover:text-ink",
        )}
      >
        <ThumbsDown className={cn("size-[18px]", mine === "dislike" && "fill-danger-50")} />
      </button>
    </div>
  )
}
