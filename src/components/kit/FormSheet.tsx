import type { FormEvent, ReactNode } from "react"
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
import { useIsMobile } from "@/lib/hooks"

export interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** The form fields. */
  children: ReactNode
  onSubmit: () => void
  submitLabel?: string
  cancelLabel?: string
  submitting?: boolean
}

/**
 * Create/edit form container. Mobile: a full-width **bottom sheet**. Desktop: a
 * centered **dialog**. Chosen via `useIsMobile()` — same API either way. Submits
 * on Enter or the footer button; Escape / backdrop / Cancel closes. The parent
 * owns open state and the data mutation.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  submitting = false,
}: FormSheetProps) {
  const isMobile = useIsMobile()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!submitting) onSubmit()
  }

  const fields = (
    <div className="flex-1 space-y-4 overflow-y-auto scroll-touch p-5">{children}</div>
  )

  const footer = (
    <div className="flex flex-col gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-60 sm:w-auto"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Enregistrement…" : submitLabel}
      </button>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-0 rounded-t-xl border-border bg-surface-raised p-0"
        >
          <form onSubmit={handleSubmit} className="flex max-h-[92dvh] flex-col pb-safe">
            <SheetHeader className="gap-1 border-b border-border p-5 text-start">
              <SheetTitle className="font-display text-lg font-bold text-ink">{title}</SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-ink-muted">{description}</SheetDescription>
              )}
            </SheetHeader>
            {fields}
            {footer}
          </form>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl bg-surface-raised p-0 sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex max-h-[85dvh] flex-col">
          <DialogHeader className="gap-1 border-b border-border p-5 text-start sm:text-start">
            <DialogTitle className="font-display text-lg font-bold text-ink">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-ink-muted">{description}</DialogDescription>
            )}
          </DialogHeader>
          {fields}
          {footer}
        </form>
      </DialogContent>
    </Dialog>
  )
}
