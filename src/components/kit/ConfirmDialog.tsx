import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
 * Confirmation dialog for destructive (or important) actions — shadcn Dialog,
 * styled per the modal recipe (design system §11): centered, icon-in-circle,
 * soft raised surface, warm blurred backdrop.
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl bg-surface-raised text-center shadow-xl sm:max-w-md">
        <DialogHeader className="items-center sm:text-center">
          <span
            className={cn(
              "mx-auto grid size-14 place-items-center rounded-full",
              tone === "danger"
                ? "bg-danger-50 text-danger-600"
                : "bg-brand-50 text-brand-600",
            )}
          >
            <AlertTriangle className="size-6" />
          </span>
          <DialogTitle className="mt-2 font-display text-xl font-bold text-ink">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-ink-muted">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-2 sm:justify-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 font-medium shadow-sm transition disabled:opacity-60",
              tone === "danger"
                ? "bg-danger-500 text-danger-foreground hover:bg-danger-600"
                : "bg-grad text-ink-inverted shadow-brand hover:brightness-105",
            )}
          >
            {loading ? "Un instant…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
