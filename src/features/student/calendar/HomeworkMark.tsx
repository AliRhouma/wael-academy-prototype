import { cn } from "@/lib/utils"

export interface HomeworkDotProps {
  /** How many خدمة hang on the séance — 0 renders nothing at all. */
  count: number
  /** Where it sits + how big: the caller owns the position, the dot the look. */
  className?: string
}

/**
 * The « fما خدمة » mark — one red dot on a séance that carries travail à faire.
 *
 * Red is this system's alert colour, and here it says exactly one thing: there
 * is something to DO before (or for) this séance. It is deliberately mute — no
 * count, no ping. The calendar already animates the séance en cours, and a
 * month of pinging dots would turn the alert colour into decoration. The dot
 * only has to be noticed; the sheet behind the card explains it.
 *
 * Always aria-hidden: the cards it sits on carry the information in their own
 * `aria-label`, and a stray dot in the reading order would just be noise.
 */
export function HomeworkDot({ count, className }: HomeworkDotProps) {
  if (count === 0) return null
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block size-2.5 rounded-full bg-danger-500", className)}
    />
  )
}

/** What a séance's card says out loud about its خدمة. */
export function homeworkAria(count: number): string {
  if (count === 0) return ""
  return count === 1 ? "فيها خدمة تتعمل" : `فيها ${count} خدمات يتعملوا`
}
