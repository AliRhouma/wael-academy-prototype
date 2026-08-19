import { reportArt } from "@/features/student/dashboard/reportArt"
import { cn } from "@/lib/utils"

export interface HomeworkMarkProps {
  /** How many خدمة hang on the séance — 0 renders nothing at all. */
  count: number
  /** Where it sits + how big: the caller owns the position, the mark the look. */
  className?: string
}

/**
 * The « fما خدمة » mark — the خدمة مازالت drawing on anything carrying travail
 * à faire: a séance card, a month cell, the next-up banner.
 *
 * It replaces the red dot this file used to hold. The dot only said « alert », and
 * on a séance card that reads as a problem with the SÉANCE; the drawing says the
 * actual thing — there is homework — and it is the very same art the dashboard
 * tile wears, so both screens name it with one picture.
 *
 * Cut in RED (`reportArt.homeworkAlert`), not brand: it has to be spotted across
 * a grid of cards whose rails are already brand-tinted, and red is what the dot
 * it replaces was saying. Inlined rather than hung in an `<img>` because the
 * repaint is `var(--danger-*)`, which only resolves inside this document.
 *
 * Always aria-hidden: the cards it sits on carry it in their own `aria-label`,
 * and a stray mark in the reading order would just be noise.
 */
export function HomeworkMark({ count, className }: HomeworkMarkProps) {
  if (count === 0) return null
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: reportArt.homeworkAlert }}
    />
  )
}

/** What a séance's card says out loud about its خدمة. */
export function homeworkAria(count: number): string {
  if (count === 0) return ""
  return count === 1 ? "فيها خدمة تتعمل" : `فيها ${count} خدمات يتعملوا`
}
