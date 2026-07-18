import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useIsMobile } from "@/lib/hooks"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  /** Disables both buttons and shows a pending label while the action runs. */
  loading?: boolean
  tone?: "danger" | "brand"
}

/**
 * Confirm destructive (or important) actions. Mobile: a **bottom sheet**.
 * Desktop: a **centered dialog**. Same props either way (`useIsMobile()`).
 * Icon-in-circle, ≥44px full-width buttons on mobile.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  onConfirm,
  loading = false,
  tone = "danger",
}: ConfirmDialogProps) {
  const isMobile = useIsMobile()

  const icon = (
    <span
      className={cn(
        "grid size-14 place-items-center rounded-full",
        tone === "danger" ? "bg-danger-50 text-danger-600" : "bg-brand-50 text-brand-600",
      )}
    >
      <AlertTriangle className="size-6" />
    </span>
  )

  const buttons = (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-60 sm:w-auto"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center rounded-md px-4 font-medium shadow-sm transition disabled:opacity-60 sm:w-auto",
          tone === "danger"
            ? "bg-danger-500 text-danger-foreground hover:bg-danger-600"
            : "bg-grad text-ink-inverted shadow-brand hover:brightness-105",
        )}
      >
        {loading ? "Un instant…" : confirmLabel}
      </button>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="gap-0 rounded-t-xl border-border bg-surface-raised p-0"
        >
          <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
            {icon}
            <SheetTitle className="mt-2 font-display text-xl font-bold text-ink">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-ink-muted">{description}</SheetDescription>
            )}
            <div className="mt-4 w-full">{buttons}</div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl bg-surface-raised p-6 text-center shadow-xl sm:max-w-md">
        <div className="flex flex-col items-center gap-2">
          {icon}
          <DialogTitle className="mt-2 font-display text-xl font-bold text-ink">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-ink-muted">{description}</DialogDescription>
          )}
          <div className="mt-4 w-full">{buttons}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
