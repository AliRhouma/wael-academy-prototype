import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info"

// Each tone = a soft tinted bg + matching text (design system §2). Colors mean one
// thing: success = positive, warning = gold kicker, danger = alert, info = navy.
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-accent2-50 text-accent2-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-info-50 text-info-700",
}

const DOTS: Record<BadgeTone, string> = {
  neutral: "bg-neutral-400",
  brand: "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-accent2-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Show a leading status dot in the tone color. */
  dot?: boolean
}

/** Compact status pill — soft tinted bg + matching text (design system §2). */
export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  )
}
