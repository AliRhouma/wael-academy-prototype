import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { formatChatTime } from "@/features/shared/chatTime"

const INPUT =
  "h-11 w-full rounded-full border border-input bg-input-bg px-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

/**
 * The student's messagerie — a floating bubble bottom-right (above the mobile
 * tab bar) opening a familiar chat: my messages on the end side in brand, the
 * administration's replies on the start side with the admin's name. Sending
 * writes to the shared store, so the admin Messagerie page sees it live.
 */
export function ChatWidget() {
  const currentUser = useAuth((s) => s.currentUser)
  const chatMessages = useData((s) => s.chatMessages)
  const users = useData((s) => s.users)
  const addChatMessage = useData((s) => s.addChatMessage)
  const markThreadRead = useData((s) => s.markThreadRead)

  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  const myId = currentUser?.id
  const userName = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])

  const thread = useMemo(
    () =>
      chatMessages
        .filter((m) => m.studentUserId === myId)
        .sort((a, b) => a.at.localeCompare(b.at)),
    [chatMessages, myId],
  )

  const unread = thread.filter((m) => m.senderUserId !== myId && !m.readByStudent).length

  // Opening the chat marks the administration's replies as read.
  useEffect(() => {
    if (open && myId && unread > 0) markThreadRead(myId, "student")
  }, [open, myId, unread, markThreadRead])

  // Keep the view pinned to the latest message.
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" })
  }, [open, thread.length])

  if (!myId) return null

  function send() {
    const trimmed = text.trim()
    if (trimmed === "" || !myId) return
    addChatMessage({
      studentUserId: myId,
      senderUserId: myId,
      text: trimmed,
      readByAdmin: false,
      readByStudent: true,
    })
    setText("")
  }

  const conversation = (
    <>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scroll-touch p-4">
        {thread.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted/60 px-4 py-5 text-center text-sm text-ink-muted">
            Une question sur un cours, un paiement, un accès ?<br />
            Écrivez-nous — l’équipe vous répond ici.
          </div>
        )}
        {thread.map((m) => {
          const mine = m.senderUserId === myId
          return (
            <div key={m.id} className={"flex flex-col " + (mine ? "items-end" : "items-start")}>
              {!mine && (
                <span className="mb-0.5 ms-1 text-[11px] font-medium text-ink-muted">
                  {userName.get(m.senderUserId) ?? "Administration"} · Wael Academy
                </span>
              )}
              <div
                dir="auto"
                className={
                  "max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed " +
                  (mine
                    ? "rounded-ee-sm bg-brand-600 text-ink-inverted"
                    : "rounded-ss-sm bg-surface-muted text-ink")
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
          placeholder="Écrire un message…"
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
    </>
  )

  return (
    <>
      {/* Floating bubble — above the mobile tab bar, corner on desktop. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir la messagerie"
        className="fixed bottom-24 end-4 z-40 grid size-14 place-items-center rounded-full bg-grad text-ink-inverted shadow-brand transition hover:brightness-105 motion-safe:hover:-translate-y-0.5 md:bottom-6 md:end-6"
      >
        <MessageCircle className="size-6" />
        {unread > 0 && !open && (
          <span className="absolute -top-0.5 -end-0.5 grid min-w-5 place-items-center rounded-full bg-danger-500 px-1 text-[11px] font-bold tabular-nums text-white ring-2 ring-surface">
            {unread}
          </span>
        )}
      </button>

      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="flex h-[85dvh] flex-col gap-0 rounded-t-xl border-border bg-surface-raised p-0"
          >
            <SheetHeader className="gap-0.5 border-b border-border p-4 text-start">
              <SheetTitle className="font-display text-[16px] font-bold text-ink">
                Messagerie
              </SheetTitle>
              <SheetDescription className="text-[12px] text-ink-muted">
                Vous échangez avec l’administration de Wael Academy.
              </SheetDescription>
            </SheetHeader>
            {conversation}
          </SheetContent>
        </Sheet>
      ) : (
        open && (
          <div className="fixed bottom-24 end-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg">
            <div className="flex items-center gap-3 border-b border-border bg-surface-muted/60 p-4">
              <span className="grid size-9 place-items-center rounded-full bg-grad text-ink-inverted">
                <MessageCircle className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-ink">Messagerie</p>
                <p className="text-[12px] text-ink-muted">L’équipe Wael Academy vous répond ici.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              >
                <X className="size-4.5" />
              </button>
            </div>
            {conversation}
          </div>
        )
      )}
    </>
  )
}
