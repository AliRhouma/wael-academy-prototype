import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, MessagesSquare, Send } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Avatar } from "@/components/kit/Avatar"
import { Badge } from "@/components/kit/Badge"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { formatChatTime } from "@/features/shared/chatTime"

const INPUT =
  "h-11 w-full rounded-full border border-input bg-input-bg px-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/**
 * Admin — the messagerie: every student thread on the start side (unread
 * counts, last message preview), the open conversation on the end side.
 * Replies are sent AS the signed-in admin, and every admin reply is signed
 * with that admin's name + avatar — so you can see who answered what.
 * Mobile: list first, thread fills the screen with a back button.
 */
export default function AdminMessagesScreen() {
  const currentUser = useAuth((s) => s.currentUser)
  const chatMessages = useData((s) => s.chatMessages)
  const users = useData((s) => s.users)
  const addChatMessage = useData((s) => s.addChatMessage)
  const markThreadRead = useData((s) => s.markThreadRead)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  /** One row per student thread, newest activity first. */
  const threads = useMemo(() => {
    const byStudent = new Map<string, typeof chatMessages>()
    for (const m of [...chatMessages].sort((a, b) => a.at.localeCompare(b.at))) {
      if (!byStudent.has(m.studentUserId)) byStudent.set(m.studentUserId, [])
      byStudent.get(m.studentUserId)!.push(m)
    }
    return [...byStudent.entries()]
      .map(([studentUserId, messages]) => ({
        studentUserId,
        messages,
        last: messages[messages.length - 1],
        unread: messages.filter((m) => m.senderUserId === studentUserId && !m.readByAdmin).length,
      }))
      .sort((a, b) => b.last.at.localeCompare(a.last.at))
  }, [chatMessages])

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0)
  const selected = threads.find((t) => t.studentUserId === selectedId) ?? null

  // Opening a thread marks the student's messages as read.
  useEffect(() => {
    if (selected && selected.unread > 0) markThreadRead(selected.studentUserId, "admin")
  }, [selected, markThreadRead])

  // Keep the conversation pinned to the latest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [selectedId, selected?.messages.length])

  function send() {
    const trimmed = text.trim()
    if (trimmed === "" || !selected || !currentUser) return
    addChatMessage({
      studentUserId: selected.studentUserId,
      senderUserId: currentUser.id,
      text: trimmed,
      readByAdmin: true,
      readByStudent: false,
    })
    setText("")
  }

  const isEmpty = threads.length === 0

  const threadList = (
    <ul className="divide-y divide-border">
      {threads.map((t) => {
        const student = userById.get(t.studentUserId)
        const active = t.studentUserId === selectedId
        const lastMine = t.last.senderUserId !== t.studentUserId
        return (
          <li key={t.studentUserId}>
            <button
              type="button"
              onClick={() => setSelectedId(t.studentUserId)}
              className={
                "flex w-full items-center gap-3 px-4 py-3 text-start transition " +
                (active ? "bg-brand-50/60" : "hover:bg-surface-muted")
              }
            >
              <Avatar name={student?.name ?? "?"} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span dir="auto" className="truncate font-display text-[14px] font-bold text-ink">
                    {student?.name ?? "Élève supprimé"}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                    {formatChatTime(t.last.at)}
                  </span>
                </span>
                <span
                  dir="auto"
                  className={
                    "mt-0.5 block truncate text-[12px] " +
                    (t.unread > 0 ? "font-medium text-ink" : "text-ink-muted")
                  }
                >
                  {lastMine ? "Vous : " : ""}
                  {t.last.text}
                </span>
              </span>
              {t.unread > 0 && (
                <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-ink-inverted">
                  {t.unread}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )

  const conversation = selected && (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Thread header — the student + a back button on mobile. */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-muted/60 p-3.5">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          aria-label="Retour aux conversations"
          className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink md:hidden"
        >
          <ArrowLeft className="size-4.5 rtl:rotate-180" />
        </button>
        <Avatar name={userById.get(selected.studentUserId)?.name ?? "?"} />
        <div className="min-w-0">
          <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
            {userById.get(selected.studentUserId)?.name ?? "Élève supprimé"}
          </p>
          <p className="text-[12px] text-ink-muted">Élève</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scroll-touch p-4">
        {selected.messages.map((m) => {
          const fromStudent = m.senderUserId === m.studentUserId
          const sender = userById.get(m.senderUserId)
          return (
            <div
              key={m.id}
              className={"flex flex-col " + (fromStudent ? "items-start" : "items-end")}
            >
              {/* Admin replies are SIGNED — who answered what. */}
              {!fromStudent && (
                <span className="mb-0.5 me-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                  {sender?.name ?? "Administration"}
                  <Avatar name={sender?.name ?? "?"} size="sm" className="!size-4 text-[8px]" />
                </span>
              )}
              <div
                dir="auto"
                className={
                  "max-w-[75%] rounded-xl px-3.5 py-2 text-sm leading-relaxed " +
                  (fromStudent
                    ? "rounded-ss-sm bg-surface-muted text-ink"
                    : "rounded-ee-sm bg-brand-600 text-ink-inverted")
                }
              >
                {m.text}
              </div>
              <span className="mt-0.5 px-1 text-[10px] tabular-nums text-ink-muted">
                {formatChatTime(m.at)}
              </span>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Répondre en tant que ${currentUser?.name ?? "admin"}…`}
          dir="auto"
          className={INPUT}
        />
        <button
          type="submit"
          aria-label="Envoyer"
          disabled={text.trim() === ""}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-grad text-ink-inverted shadow-brand transition hover:brightness-105 disabled:opacity-40"
        >
          <Send className="size-[18px] rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messagerie"
        subtitle={
          isEmpty
            ? "Les questions des élèves arrivent ici."
            : `${threads.length} conversation${threads.length > 1 ? "s" : ""}${
                totalUnread > 0 ? ` · ${totalUnread} message${totalUnread > 1 ? "s" : ""} non lu${totalUnread > 1 ? "s" : ""}` : ""
              } — chaque réponse est signée par l’admin qui l’envoie.`
        }
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={MessagesSquare}
            title="Aucune conversation"
            description="Quand un élève écrit depuis sa bulle de messagerie, sa conversation apparaît ici."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm md:grid md:h-[600px] md:grid-cols-[320px_1fr]">
          {/* Threads — always on desktop; on mobile only when no thread is open. */}
          <div
            className={
              "min-h-0 overflow-y-auto scroll-touch md:border-e md:border-border " +
              (selected ? "hidden md:block" : "block")
            }
          >
            {threadList}
          </div>

          {/* Conversation — placeholder when nothing is selected (desktop). */}
          <div className={"min-h-0 flex-col md:flex " + (selected ? "flex h-[75dvh] md:h-auto" : "hidden")}>
            {conversation ?? (
              <div className="hidden h-full flex-col items-center justify-center gap-2 text-center md:flex">
                <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <MessagesSquare className="size-5" />
                </span>
                <p className="font-display text-[15px] font-bold text-ink">
                  Sélectionnez une conversation
                </p>
                <p className="text-sm text-ink-muted">
                  Les réponses partent au nom de {currentUser?.name ?? "l’admin connecté"}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {totalUnread > 0 && !selected && (
        <div className="md:hidden">
          <Badge tone="brand" dot>
            {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
          </Badge>
        </div>
      )}
    </div>
  )
}
