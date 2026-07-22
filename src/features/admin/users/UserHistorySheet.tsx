import { ArrowRight, History } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar } from "@/components/kit/Avatar"
import { useIsMobile } from "@/lib/hooks"
import type { User } from "@/data/types"

/** "12 févr. 2026 à 14:22" — every history stamp uses the same long form. */
const WHEN = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function when(iso: string) {
  return WHEN.format(new Date(iso)).replace(",", " à")
}

/**
 * Read-only timeline of a user's profile changes — newest first, ending on the
 * "Compte créé" node. Mobile: bottom sheet; desktop: centered dialog (same
 * split as FormSheet). Opened from the row's "…" menu on the users table.
 */
export function UserHistorySheet({
  user,
  onOpenChange,
}: {
  /** The user whose history to show — `null` keeps the sheet closed. */
  user: User | null
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const open = user !== null

  const body = user && (
    <div className="min-w-0 flex-1 overflow-y-auto scroll-touch p-5">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <p dir="auto" className="truncate font-display text-[15px] font-bold text-ink">
            {user.name}
          </p>
          <p className="text-sm text-ink-muted">
            {user.history.length === 0
              ? "Aucune modification depuis la création."
              : `${user.history.length} modification${user.history.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Timeline — updates newest first, creation as the closing node. */}
      <ol className="mt-5 border-s-2 border-border ms-2.5 ps-5">
        {user.history.map((h, i) => (
          <li key={`${h.at}-${i}`} className="relative pb-5">
            <span className="absolute -start-[27px] top-1 size-3 rounded-full border-2 border-surface-raised bg-brand-400" />
            <p className="text-sm font-medium text-ink">{when(h.at)}</p>
            {/* Each touched field: its value before → after the save. */}
            <div className="mt-1.5 space-y-1.5">
              {h.changes.map((c, j) => (
                <div key={j} className="rounded-md bg-surface-muted px-3 py-2">
                  <p className="text-[12px] font-medium text-ink-muted">{c.field}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm">
                    {c.before ? (
                      <span dir="auto" className="break-all text-ink-muted line-through">
                        {c.before}
                      </span>
                    ) : (
                      <span className="italic text-ink-muted">vide</span>
                    )}
                    <ArrowRight className="size-3.5 shrink-0 text-ink-muted rtl:rotate-180" />
                    {c.after ? (
                      <span dir="auto" className="break-all font-medium text-ink">
                        {c.after}
                      </span>
                    ) : (
                      <span className="italic text-ink-muted">vide</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </li>
        ))}
        <li className="relative">
          <span className="absolute -start-[27px] top-1 size-3 rounded-full border-2 border-surface-raised bg-grad" />
          <p className="text-sm font-medium text-ink">Compte créé</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">{when(user.createdAt)}</p>
        </li>
      </ol>
    </div>
  )

  const footer = (
    <div className="border-t border-border p-5">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 sm:w-auto"
      >
        Fermer
      </button>
    </div>
  )

  const title = (
    <span className="inline-flex items-center gap-2">
      <History className="size-[18px] text-brand-600" /> Historique des modifications
    </span>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-0 rounded-t-xl border-border bg-surface-raised p-0"
        >
          <div className="flex min-w-0 max-h-[92dvh] flex-col pb-safe">
            <SheetHeader className="gap-1 border-b border-border p-5 text-start">
              <SheetTitle className="font-display text-lg font-bold text-ink">{title}</SheetTitle>
              <SheetDescription className="text-sm text-ink-muted">
                Chaque enregistrement du profil laisse une trace datée.
              </SheetDescription>
            </SheetHeader>
            {body}
            {footer}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl bg-surface-raised p-0 sm:max-w-md">
        <div className="flex min-w-0 max-h-[85dvh] flex-col">
          <DialogHeader className="gap-1 border-b border-border p-5 text-start sm:text-start">
            <DialogTitle className="font-display text-lg font-bold text-ink">{title}</DialogTitle>
            <DialogDescription className="text-sm text-ink-muted">
              Chaque enregistrement du profil laisse une trace datée.
            </DialogDescription>
          </DialogHeader>
          {body}
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  )
}
