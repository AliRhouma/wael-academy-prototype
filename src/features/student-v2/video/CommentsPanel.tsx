import { useMemo, useState } from "react"
import { MessagesSquare, SendHorizontal, Trash2 } from "lucide-react"
import type { VideoRefKind } from "@/data/types"
import { demoComments } from "@/features/student/player/comments"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import avatar from "@/assets/v2/avatar.jpg"
import { Panel } from "../ui"
import { sfx } from "../sound"

/** "من 3 يام" — a comment is about recency, not about a calendar date. */
function ago(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return "توّا"
  if (minutes < 60) return `من ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `من ${hours} سا`
  const days = Math.floor(hours / 24)
  if (days === 1) return "البارح"
  if (days < 30) return `من ${days} يام`
  return `من ${Math.round(days / 30)} شهر`
}

/** Initials on a soft ramp tint — the other élèves have no avatar art. */
function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-v2-brand/15 text-[calc(8px*var(--ts))] font-bold text-v2-ink">
      {letters}
    </span>
  )
}

/**
 * « التعليقات » — the frame's composer (the élève's avatar, a pill that reads
 * « زيد تعليق… ») over the wall. Posting writes to the shared store, so a
 * comment stays when the élève steps to another video and comes back.
 *
 * Empty is the frame's own line — « مفماش تعليق بعد - كون إنت الأول ». With
 * `demoEmpty` off, the old player's filler conversation sits under the real
 * comments so a demo never lands on a dead wall.
 */
export function V2CommentsPanel({ kind, videoId, demoEmpty }: { kind: VideoRefKind; videoId: string; demoEmpty: boolean }) {
  const user = useAuth((s) => s.currentUser)
  const stored = useData((s) => s.videoComments)
  const users = useData((s) => s.users)
  const addComment = useData((s) => s.addVideoComment)
  const removeComment = useData((s) => s.removeVideoComment)
  const [body, setBody] = useState("")

  const comments = useMemo(() => {
    const own = stored
      .filter((c) => c.kind === kind && c.videoId === videoId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return demoEmpty ? own : [...own, ...demoComments(kind, videoId)]
  }, [stored, kind, videoId, demoEmpty])

  const submit = () => {
    const text = body.trim()
    if (!text || !user) return
    addComment({ kind, videoId, userId: user.id, body: text })
    sfx("send")
    setBody("")
  }
  const name = (id: string) => users.find((u) => u.id === id)?.name ?? "تلميذ"

  return (
    <Panel icon={MessagesSquare} chip="bg-v2-brand" title="التعليقات" meta={comments.length ? `${comments.length} تعليق` : undefined}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex items-center gap-3"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="زيد تعليق......."
          aria-label="زيد تعليق"
          className="h-14 min-w-0 flex-1 rounded-full border border-v2-ink/15 bg-v2-surface px-5 text-[calc(9px*var(--ts))] text-v2-ink outline-none transition placeholder:text-v2-ink/45 focus:border-v2-brand/60"
        />
        <img src={avatar} alt="" className="order-first size-11 shrink-0 rounded-full object-cover" />
        {body.trim() && (
          <button
            type="submit"
            aria-label="انشر"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-v2-cta text-v2-on-cta transition hover:brightness-95 active:scale-95"
          >
            <SendHorizontal className="size-5 -scale-x-100" />
          </button>
        )}
      </form>

      {comments.length === 0 ? (
        <p className="mt-4 text-[calc(8.5px*var(--ts))] text-v2-ink/55">مفماش تعليق بعد - كون إنت الأول</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {comments.map((c) => {
            const mine = c.userId === user?.id
            return (
              <li key={c.id} className="flex items-start gap-3">
                {mine ? <img src={avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" /> : <Initials name={name(c.userId)} />}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className={cn("text-[calc(8.5px*var(--ts))] font-bold", mine ? "text-v2-brand" : "text-v2-ink")}>
                      {mine ? "إنت" : name(c.userId)}
                    </span>
                    <span className="text-[calc(7.5px*var(--ts))] text-v2-ink/45">{ago(c.createdAt)}</span>
                  </p>
                  <p dir="auto" className="mt-0.5 whitespace-pre-wrap text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink/80">
                    {c.body}
                  </p>
                </div>
                {mine && (
                  <button
                    type="button"
                    data-uisfx="delete" onClick={() => removeComment(c.id)}
                    aria-label="امسح تعليقي"
                    className="grid size-10 shrink-0 place-items-center rounded-full text-v2-ink/45 transition hover:bg-v2-live/10 hover:text-v2-live-strong"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
