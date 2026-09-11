import { Check, Download, FileText, FolderOpen } from "lucide-react"
import type { Session } from "@/data/types"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useDownloads } from "./downloads"
import { dayLabel, useLookups, useSessionDocs } from "./lib"
import { PanelEmpty, ctaClass } from "./ui"
import { sfx } from "./sound"

/**
 * « وثائق الحصّة » / « الكور متع الحصّة » — the séance's files in one list.
 * Bottom sheet on a phone, centred dialog on desktop; same content either way.
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

  const body = (
    <div className="flex flex-col gap-2.5">
      {docs.length === 0 ? (
        <PanelEmpty
          icon={FolderOpen}
          title="ما فمّا حتّى وثيقة مازال"
          body="الأستاذ ينزّل الكور نهار الحصّة. كي يوصل، يظهرلك هوني."
        />
      ) : (
        docs.map((doc) => {
          const taken = has(doc.id)
          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-2xl border border-v2-ink/15 p-3 transition hover:border-v2-brand/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-v2-brand/10">
                <FileText className="size-5 stroke-v2-grad" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                {/* A file name is Arabic OR French: `auto` lets each clip at its own end. */}
                <p dir="auto" className="truncate text-right text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">
                  {doc.pdf.name}
                </p>
                <p className="truncate text-[calc(7.5px*var(--ts))] text-v2-ink/55">
                  {doc.kind === "cours"
                    ? "كور الحصّة"
                    : `تمرين · ${teacherName(doc.homework?.teacherId) ?? ""}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => download(doc.id, doc.pdf.name)}
                aria-label={taken ? `تحمّل ${doc.pdf.name}` : `حمّل ${doc.pdf.name}`}
                className={cn(
                  ctaClass,
                  "min-h-10 shrink-0 px-3.5",
                  taken && "border border-v2-ink/15 bg-transparent hover:shadow-none",
                )}
              >
                {taken ? <Check className="size-4" /> : <Download className="size-4" />}
                <span className="hidden sm:inline">{taken ? "تحمّل" : "حمّل"}</span>
              </button>
            </div>
          )
        })
      )}
    </div>
  )

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={change}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-3 overflow-y-auto rounded-t-3xl border-v2-ink/10 bg-v2-surface px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-v2-ink"
        >
          <span aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-v2-ink/15" />
          <SheetTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</SheetTitle>
          <SheetDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink/55">{description}</SheetDescription>
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="gap-3 rounded-3xl border-v2-ink/15 bg-v2-surface p-6 text-v2-ink sm:max-w-lg">
        <DialogTitle className="text-[calc(12px*var(--ts))] font-bold text-v2-ink">{title}</DialogTitle>
        <DialogDescription className="-mt-2 text-[calc(8px*var(--ts))] text-v2-ink/55">{description}</DialogDescription>
        {body}
      </DialogContent>
    </Dialog>
  )
}
