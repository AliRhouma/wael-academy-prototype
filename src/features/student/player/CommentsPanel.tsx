import { useMemo, useState } from "react"
import { MessagesSquare, Trash2 } from "lucide-react"
import { Avatar } from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import type { VideoRefKind } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { demoComments } from "./comments"

/** "il y a 3 jours" — a comment is about recency, not about a calendar date. */
function ago(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return "توّا"
  if (minutes < 60) return `من ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `من ${hours} سا`
  const days = Math.floor(hours / 24)
  if (days === 1) return "hier"
  if (days < 30) return `من ${days} يام`
  const months = Math.round(days / 30)
  if (months < 12) return `من ${months} شهر`
  return `من ${Math.round(months / 12)} عام`
}

/**
 * « Commentaires » — the conversation under the video, YouTube-style: no note,
 * no étoiles, just what the élèves say.
 *
 * The composer sits on top behind the élève's own avatar and only grows its
 * buttons once they start typing — an empty box with two buttons under every
 * video is noise. Their own comments carry a delete; the others don't.
 */
export function CommentsPanel({ kind, videoId }: { kind: VideoRefKind; videoId: string }) {
  const user = useAuth((s) => s.currentUser)
  const stored = useData((s) => s.videoComments)
  const users = useData((s) => s.users)
  const addComment = useData((s) => s.addVideoComment)
  const removeComment = useData((s) => s.removeVideoComment)

  const [body, setBody] = useState("")
  const [focused, setFocused] = useState(false)

  const comments = useMemo(() => {
    const own = stored
      .filter((c) => c.kind === kind && c.videoId === videoId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return [...own, ...demoComments(kind, videoId)]
  }, [stored, kind, videoId])

  function submit() {
    const text = body.trim()
    if (!text || !user) return
    addComment({ kind, videoId, userId: user.id, body: text })
    setBody("")
    setFocused(false)
  }

  const name = (userId: string) => users.find((u) => u.id === userId)?.name ?? "تلميذ"
  const open = focused || body.length > 0

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
      <div className="flex items-center gap-2">
        <MessagesSquare className="size-[18px] text-brand-600" />
        <h2 className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">التعليقات</h2>
        <span className="rounded-full bg-neutral-100 px-2 text-[calc(12px*var(--ts))] font-medium tabular-nums text-ink-muted">
          {comments.length}
        </span>
      </div>

      {/* ---- Composer ---- */}
      <div className="mt-4 flex items-start gap-3">
        <Avatar name={user?.name ?? "تلميذ"} size="sm" />
        <div className="min-w-0 flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            rows={open ? 3 : 1}
            aria-label="زيد تعليق"
            placeholder="زيد تعليق…"
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-200 focus:ring-2 focus:ring-ring"
          />
          {open && (
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBody("")
                  setFocused(false)
                }}
                className="inline-flex h-10 items-center rounded-md px-3 text-[calc(13px*var(--ts))] font-medium text-ink-muted transition hover:text-ink-subtle"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!body.trim()}
                className="inline-flex h-10 items-center rounded-md bg-grad px-4 text-sm font-medium text-ink-inverted shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
              >
                Commenter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- The wall ---- */}
      <ul className="mt-5 flex flex-col gap-4">
        {comments.map((comment) => {
          const isMine = comment.userId === user?.id
          return (
            <li key={comment.id} className="flex items-start gap-3">
              <Avatar name={name(comment.userId)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    dir="auto"
                    className={cn("text-[calc(13px*var(--ts))] font-semibold", isMine ? "text-brand-700" : "text-ink")}
                  >
                    {isMine ? "إنت" : name(comment.userId)}
                  </span>
                  <span className="text-[calc(12px*var(--ts))] text-ink-muted">{ago(comment.createdAt)}</span>
                </div>
                <p dir="auto" className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-subtle">
                  {comment.body}
                </p>
              </div>
              {isMine && (
                <button
                  type="button"
                  onClick={() => removeComment(comment.id)}
                  aria-label="امسح تعليقي"
                  className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-danger-600"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
