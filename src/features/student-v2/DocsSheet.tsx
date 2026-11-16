import { Check, Download, FileText, FolderOpen } from "lucide-react"
import type { Session } from "@/data/types"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetGrabber, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useAllTaken, useDownloads } from "./downloads"
import { dayLabel, useLookups, useSessionDocs } from "./lib"
import { Burst, PanelEmpty, ctaClass, ctaGhostClass, tileClass } from "./ui"
import { sfx } from "./sound"

/**
 * « وثائق الحصّة » / « الكور متع الحصّة » — the séance's files in one list.
 * Bottom sheet on a phone, centred dialog on desktop; same content either way.
 *
 * Under the play skin each row is a collectible (lip until taken, tick after),
 * the sheet shows its own 12 px bar, and the last file of the séance earns the
 * sheet's one celebration — a burst with the `achievement` cue. The sheet
 * portals to <body>, outside the shell, so it stamps `data-space="v2"` on
 * itself: that is what the skins scope to.
 */
export function DocsSheet({
  session,
  started,
  onOpenChange,
}: {
  session: Session | null
  started: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mobile = useIsMobile()
  const open = !!session
  const change = (o: boolean) => {
    if (!o) sfx("close")
    onOpenChange(o)
  }
  const docs = useSessionDocs(session, started)
  const { subjectOf, teacherName } = useLookups()
  const { has, download } = useDownloads()

  const subject = session ? subjectOf(session) : undefined
  const title = `وثائق حصّة ${subject?.name ?? ""}`.trim()
  const description = session ? `${dayLabel(session.date)} · ${session.title}` : ""

  const taken = docs.filter((d) => has(d.id)).length
  const done = docs.length > 0 && taken === docs.length
  const burstAt = useAllTaken(done, open)

  const body = (
    <div className="relative flex flex-col gap-2.5">
      {docs.length > 0 && (
        <div className="v2-play v2-bar mb-1" aria-hidden>
          <div className="v2-bar-fill" style={{ width: `${(taken / docs.length) * 100}%` }} />
        </div>
      )}
      {docs.length === 0 ? (
        <PanelEmpty
          icon={FolderOpen}
          character={subject?.name}
          title="ما فمّا حتّى وثيقة مازال"
          body="الأستاذ ينزّل الكور نهار الحصّة. كي يوصل، يظهرلك هوني."
        />
      ) : (
        docs.map((doc) => {
          const isTaken = has(doc.id)
          return (
            <div
              key={doc.id}
              data-taken={isTaken}
              className={cn(tileClass, "v2-sheet-row flex items-center gap-3 rounded-2xl border border-v2-ink/15 p-3 transition hover:border-v2-brand/40")}
            >
              <span className="v2-doc-plate relative grid size-11 shrink-0 place-items-center rounded-xl bg-v2-brand/10" data-kind={doc.kind}>
                <FileText aria-hidden className="size-5 text-v2-brand-text" strokeWidth={1.75} />
                {isTaken && (
                  <span className="v2-tick absolute -bottom-0.5 -end-0.5 grid size-4 place-items-center rounded-full bg-v2-brand text-white ring-2 ring-v2-surface">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                {/* A file name is Arabic OR French: `auto` lets each clip at its own end. */}
                <p dir="auto" className="truncate text-right text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">
                  {doc.pdf.name}
                </p>
                <p className="truncate text-[calc(7.5px*var(--ts))] text-v2-ink-2">
                  {doc.kind === "cours"
                    ? "كور الحصّة"
                    : `تمرين · ${teacherName(doc.homework?.teacherId) ?? ""}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => download(doc.id, doc.pdf.name)}
                aria-label={isTaken ? `تحمّل ${doc.pdf.name}` : `حمّل ${doc.pdf.name}`}
                className={cn(ctaClass, "min-h-11 shrink-0 px-3.5", isTaken && ctaGhostClass)}
              >
                {isTaken ? <Check className="size-4" /> : <Download className="size-4" />}
                <span className="hidden sm:inline">{isTaken ? "تحمّل" : "حمّل"}</span>
              </button>
            </div>
          )
        })
      )}
      <Burst at={burstAt} />
    </div>
  )

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={change}>
        <SheetContent
          side="bottom"
          data-space="v2"
          className="max-h-[85dvh] gap-3 overflow-y-auto rounded-t-3xl border-v2-ink/10 bg-v2-surface px-4 pb-[max(1.25rem,var(--sai-bottom))] pt-5 text-v2-ink"
        >
          <SheetGrabber />
          <SheetTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</SheetTitle>
          <SheetDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink-2">{description}</SheetDescription>
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent data-space="v2" className="gap-3 rounded-3xl border-v2-ink/15 bg-v2-surface p-6 text-v2-ink sm:max-w-lg">
        <DialogTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</DialogTitle>
        <DialogDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink-2">{description}</DialogDescription>
        {body}
      </DialogContent>
    </Dialog>
  )
}
