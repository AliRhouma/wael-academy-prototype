import type { ReactNode } from "react"
import { Check, Download, FileText, FolderOpen } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useDownloads } from "../downloads"
import { sfx } from "../sound"
import { PanelEmpty } from "../ui"

/**
 * The frame's two repeated ornaments.
 *
 * `Ribbon` is the flag in a card's top-left corner — « قريباً » on a chapitre
 * with nothing in it, « COURS » / « QUIZ » on a contenu. It is drawn INSIDE the
 * corner, taking the card's own radius on that one corner and squaring off the
 * other three, so it reads as a torn tab rather than a floating pill. Physical
 * left on purpose: the frame puts it there in an RTL page.
 *
 * `Disc` is the numbered circle at the reading start — filled with the brand
 * ramp at a quarter strength while the chapitre is shut, white and outlined
 * once it is open, so the open one reads as lifted off the tinted panel.
 */
export function Ribbon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "absolute left-0 top-0 z-10 grid place-items-center rounded-tl-2xl bg-v2-grad px-2 font-bold uppercase tracking-wide text-white",
        "h-8 min-w-[4.5rem] text-[calc(7.5px*var(--ts))] md:h-10 md:min-w-[5.5rem] md:text-[calc(9.5px*var(--ts))] 2xl:h-[46px] 2xl:min-w-[114px] 2xl:text-[calc(12px*var(--ts))]",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Disc({ n, open }: { n: number; open?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-v2-ink tabular-nums",
        "size-11 text-[calc(11px*var(--ts))] md:size-14 md:text-[calc(14px*var(--ts))] 2xl:size-[70px] 2xl:text-[calc(17px*var(--ts))]",
        open ? "border border-v2-ink/15 bg-v2-surface" : "bg-v2-grad-25",
      )}
    >
      <bdi dir="ltr">{String(n).padStart(2, "0")}.</bdi>
    </span>
  )
}

/** The frame's pill — outlined, and filled when it is the one in force. */
export function Chip({
  active,
  count,
  icon: Icon,
  label,
  onClick,
  tone = "ink",
  className,
}: {
  active: boolean
  count?: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  onClick: () => void
  /** `ink` — the head tabs, navy on the page. `brand` — the chips on the tint. */
  tone?: "ink" | "brand"
  className?: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-uisfx="toggle-on"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-3 font-bold transition active:scale-[.98]",
        "h-11 text-[calc(10px*var(--ts))] md:h-14 md:gap-2.5 md:px-4 md:text-[calc(12px*var(--ts))] 2xl:h-[73px] 2xl:gap-3 2xl:px-5 2xl:text-[calc(14px*var(--ts))]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand",
        tone === "ink"
          ? active
            ? "bg-v2-cta text-v2-ink"
            : "border border-v2-ink text-v2-ink hover:bg-v2-ink/[0.06]"
          : active
            ? "bg-v2-surface text-v2-brand shadow-sm"
            : "border border-white/90 text-v2-brand hover:bg-white/40",
        className,
      )}
    >
      <Icon className="size-4 shrink-0 md:size-5 2xl:size-6" strokeWidth={2} />
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full text-[calc(8px*var(--ts))] font-bold tabular-nums 2xl:text-[calc(10px*var(--ts))]",
            "size-5 md:size-6 2xl:size-8",
            tone === "ink"
              ? active
                ? "bg-v2-surface text-v2-ink"
                : "bg-v2-cta text-v2-ink"
              : active
                ? "bg-v2-brand/15 text-v2-brand"
                : "bg-white/80 text-v2-brand",
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/**
 * A contenu's files, in the same sheet the séances use — bottom sheet on a
 * phone, centred dialog on desktop, and the same « taken » memory, so a PDF
 * downloaded from a chapitre shows as downloaded everywhere else too.
 */
export function FilesSheet({
  title,
  subtitle,
  files,
  onOpenChange,
}: {
  title: string
  subtitle?: string
  files: { name: string }[] | null
  onOpenChange: (open: boolean) => void
}) {
  const mobile = useIsMobile()
  const open = !!files
  const { has, download } = useDownloads()
  const change = (o: boolean) => {
    if (!o) sfx("close")
    onOpenChange(o)
  }

  const body = (
    <div className="flex flex-col gap-2.5">
      {files?.length === 0 ? (
        <PanelEmpty
          icon={FolderOpen}
          title="ما فمّا حتّى وثيقة"
          body="المحتوى هذا فيه فيديو برك. كي تتزاد وثيقة، تلقاها هوني."
        />
      ) : (
        files?.map((f) => {
          const id = `${title}::${f.name}`
          const taken = has(id)
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => download(id, f.name)}
              className={cn(
                "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 text-start transition",
                taken
                  ? "border-v2-brand/40 bg-v2-brand/[0.06]"
                  : "border-v2-ink/15 bg-v2-surface hover:border-v2-ink/30 hover:bg-v2-ink/[0.03]",
              )}
            >
              <FileText className="size-5 shrink-0 text-v2-ink/50" strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate text-[calc(10px*var(--ts))] font-medium text-v2-ink">{f.name}</span>
              {taken ? (
                <Check className="size-5 shrink-0 text-v2-brand" strokeWidth={2.25} />
              ) : (
                <Download className="size-5 shrink-0 text-v2-ink/45" strokeWidth={1.75} />
              )}
            </button>
          )
        })
      )}
    </div>
  )

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={change}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetTitle>{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
          <div className="mt-4">{body}</div>
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{title}</DialogTitle>
        {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        <div className="mt-4">{body}</div>
      </DialogContent>
    </Dialog>
  )
}
