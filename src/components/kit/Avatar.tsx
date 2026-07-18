import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// Soft brand-family tints — warmth from the neutrals/greens, never loud (foundations §2).
const TINTS = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-50 text-emerald-700",
  "bg-navy-50 text-navy-700",
  "bg-accent2-50 text-accent2-700",
] as const

const SIZES = {
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
} as const

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic: the same name always maps to the same tint.
function tintFor(name: string): (typeof TINTS)[number] {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: keyof typeof SIZES
}

/** Deterministic tinted-initials avatar; Comic Relief initials (design system §10). */
export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  return (
    <span
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-bold",
        SIZES[size],
        tintFor(name),
        className,
      )}
      {...props}
    >
      {initials(name)}
    </span>
  )
}
