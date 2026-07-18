import type { FormEvent, ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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
  /** Disables the form and shows a pending label while saving. */
  submitting?: boolean
  side?: "left" | "right"
}

/**
 * Side sheet for create/edit forms — shadcn Sheet, styled on the soft raised
 * surface. Submitting via Enter or the footer button; Escape / backdrop / Cancel
 * closes. The parent owns the open state and the data mutation.
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
  side = "right",
}: FormSheetProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!submitting) onSubmit()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="w-full gap-0 border-border bg-surface-raised p-0 shadow-xl sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="gap-1 border-b border-border p-5">
            <SheetTitle className="font-display text-lg font-bold text-ink">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-ink-muted">{description}</SheetDescription>
            )}
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>

          <SheetFooter className="flex-row justify-end gap-2 border-t border-border p-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 disabled:opacity-60"
            >
              {submitting ? "Enregistrement…" : submitLabel}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
